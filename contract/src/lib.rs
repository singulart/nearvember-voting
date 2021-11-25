use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen};
use std::collections::HashMap;
use std::collections::HashSet;


#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct Voting {

    vote_state: HashMap<String, HashSet<String>>,
}

#[near_bindgen]
impl Voting {

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

        let existing = self.vote_state.get_mut(&candidate).unwrap(); 
        existing.insert(voter_contract);
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

    pub fn add_candidate(&mut self, candidate: String) -> String {
        env::log(
            format!(
                "add_candidate {}",
                candidate,
            )
            .as_bytes(),
        );

        if self.vote_state.contains_key(&candidate) {
            println!("Candidate already exists!")
        } else {
            self.vote_state.insert(candidate, HashSet::new());
        }
        return "1".to_string()
    }

//     pub fn show_poll(&self, poll_id: String) -> Option<VotingOptions> {
//         match self.polls.get(&poll_id) {
//             Some(options) => Some(options.clone()),
//             None => {
//                 env::log(format!("Unknown voting {}", poll_id).as_bytes());
//                 None
//             }
//         }
//     }

//     pub fn show_results(&self, poll_id: String) -> Option<VotingStats> {
//         match self.polls.get(&poll_id) {
//             Some(poll) => match self.results.get(&poll_id) {
//                 Some(results) => Some(VotingStats {
//                     results: results.clone(),
//                     poll: poll.clone(),
//                 }),
//                 None => None,
//             },
//             None => None,
//         }
//     }

//     pub fn ping(&self) -> String {
//         "PONG".to_string()
//     }
}