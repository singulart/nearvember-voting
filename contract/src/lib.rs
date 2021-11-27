use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen};
use std::collections::HashMap;
use std::collections::HashSet;
use near_sdk::serde::{Serialize, Deserialize};


#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct VotingStats {
    stats: HashMap<String, i32>
}

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct Voting {

    // candidates are keys, voters are values
    vote_state: HashMap<String, HashSet<String>>,
}

#[near_bindgen]
impl Voting {

    pub fn get_stats(&mut self) -> VotingStats {

        let mut statz: HashMap<String, i32> = HashMap::new();

        for (candidate, voters) in &self.vote_state {
            statz.insert(candidate.clone(), voters.len() as i32);
        }
        return VotingStats{stats: statz};
    }

    pub fn vote(&mut self, candidate: String) -> String {

        let voter_contract = env::signer_account_id();

        let mut already_voted: bool = false;

        self.vote_state.values().for_each(|voter| {
            if voter.contains(&voter_contract) {
                env::log("Already voted".as_bytes());
                already_voted = true;
            }
        });

        if already_voted {
            return "Already voted".to_string()
        } 

        if !self.vote_state.contains_key(&candidate) {
            env::log("Candidate not found".as_bytes());
            return "Candidate not found".to_string()
        }

        self.vote_state.entry(candidate)
            .and_modify(|votes| { 
                votes.insert(voter_contract);
            }); 

        return "Voted".to_string();
    }

    pub fn my_vote(&mut self) -> String {

        let voter_contract = env::signer_account_id();

        for (candidate, voters) in &self.vote_state {
            if voters.contains(&voter_contract) {
                return candidate.to_string()
            }
        }
        return "".to_string();
    }

    pub fn unvote(&mut self) -> String {

        let voter_contract = env::signer_account_id();
        let my_vote = self.my_vote();

        match self.vote_state.get_mut(&my_vote) {
            Some(votes) => {
                votes.remove(&voter_contract);
            },
            None => {
                println!("Not found!")
            },
        }
        return "OK".to_string();
    }

    pub fn add_candidate(&mut self, candidate: String) {

        self.vote_state.entry(candidate).or_insert(HashSet::new());

    }
}