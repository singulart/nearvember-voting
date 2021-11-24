use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen};
use near_sdk::serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::collections::HashSet;
use std::hash::{Hash, Hasher};
use std::cmp::{PartialOrd, PartialEq, Ordering, Ord};


#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize, Clone, BorshDeserialize, BorshSerialize)]
pub struct Candidate {
    name: String,
    votes: i32,
}

impl Hash for Candidate {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.name.hash(state);
        self.votes.hash(state);
    }
}

impl PartialEq for Candidate {
    fn eq(&self, other: &Self) -> bool {
        self.name.eq(&other.name)
    }
}

impl PartialOrd for Candidate {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Eq for Candidate {}

impl Ord for Candidate {
    fn cmp(&self, other: &Self) -> Ordering {
        self.name.cmp(&other.name)
    }
}

#[derive(Serialize, Deserialize, Clone, BorshDeserialize, BorshSerialize)]
pub struct VotingOption {
    option_id: String,
    message: String,
}

#[derive(Serialize, Deserialize, Clone, BorshDeserialize, BorshSerialize)]
pub struct VotingOptions {
    // Author of the vote (account id).
    creator: String,
    // Unique voting id.
    poll_id: String,
    // Question voted on.
    question: String,
    variants: Vec<VotingOption>,
}

#[derive(Serialize, Deserialize, Clone, BorshDeserialize, BorshSerialize)]
pub struct VotingResults {
    // Unique poll id.
    poll_id: String,
    // Map of option id to the number of votes.
    variants: HashMap<String, i32>,
    // Map of voters who already voted.
    voted: HashMap<String, i32>,
}

#[derive(Serialize, Deserialize)]
pub struct VotingStats {
    poll: VotingOptions,
    results: VotingResults,
}

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct Voting {
    // Map of poll id to voting options.
    polls: HashMap<String, VotingOptions>,
    // Map of poll id to voting results.
    results: HashMap<String, VotingResults>,

    candidates: HashSet<Candidate>,
    voted: HashSet<String>,

}

#[near_bindgen]
impl Voting {
    pub fn vote(&mut self, candidate: String) -> String {

        let voter_contract = env::signer_account_id();
        let cand = &Candidate {name: candidate, votes: 0i32};

        if self.voted.contains(&voter_contract) {
            env::log("Already voted".as_bytes());
            return "Already voted".to_string()
        } 
        else if !self.candidates.contains(cand) {
            env::log("Candidate not found".as_bytes());
            return "Candidate not found".to_string()
        } else {
            let existing = self.candidates.get(cand).unwrap();
            env::log(
                format!(
                    "candidate = {}, votes = {}",
                    existing.name,
                    existing.votes
                )
                .as_bytes(),
            );
    
            let updated = Candidate {name: existing.name.clone(), votes: existing.votes + 1};
            match self.candidates.replace(updated) {
                Some(vvv) => {
                    env::log(vvv.votes.to_string().as_bytes());
                    self.voted.insert(voter_contract);
                },
                None => {
                    env::log("No replacement!!!".as_bytes())
                }                
            }
            return "Voted".to_string()
        }
    }

    pub fn add_candidate(&mut self, candidate: String) -> String {
        env::log(
            format!(
                "add_candidate {}",
                candidate,
            )
            .as_bytes(),
        );

        let name_c: String = candidate.clone();
        if self.candidates.contains(&Candidate {name: candidate, votes: 0i32}) {
            println!("Candidate already exists!")
        } else {
            self.candidates.insert(Candidate {name: name_c, votes: 0i32});
        }
        return "1".to_string()
    }

    pub fn show_poll(&self, poll_id: String) -> Option<VotingOptions> {
        match self.polls.get(&poll_id) {
            Some(options) => Some(options.clone()),
            None => {
                env::log(format!("Unknown voting {}", poll_id).as_bytes());
                None
            }
        }
    }

    pub fn show_results(&self, poll_id: String) -> Option<VotingStats> {
        match self.polls.get(&poll_id) {
            Some(poll) => match self.results.get(&poll_id) {
                Some(results) => Some(VotingStats {
                    results: results.clone(),
                    poll: poll.clone(),
                }),
                None => None,
            },
            None => None,
        }
    }

    pub fn ping(&self) -> String {
        "PONG".to_string()
    }
}