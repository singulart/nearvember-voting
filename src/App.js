import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout, register } from './utils'
import './global.css'
import Big from 'big.js';
import meme1 from './assets/voote.jpeg';

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store greeting in component state
  const [stats, setStats] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [balance, setBalance] = React.useState(0.0)
  const [myVote, setMyVote] = React.useState(true)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {
        window.contract.get_stats()
        .then(stats => {
          console.log(stats)
          setStats(stats)
        })
        .then(() => window.contract.my_vote({account_id: window.accountId})
          .then(myVote => {
            console.log(myVote)
            setMyVote(myVote)
          })
        )
      }
    },
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Tokenized Homeopathy got <code>TEETH</code>!</h1>
        <center>
          <img src = {meme1} width='50%' height='50%'/>
        </center>
        <center>
        <p>
          Introducing <code>TEETH</code> - "Tried Everything Else, Try Homeopathy" Fungible Token
        </p>
        <p>
          Did you know that Starbucks accepts <code>TEETH</code>?
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
        </center>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <img src={meme1} style={{maxWidth: "100%"}}/>
        {stats ?         
        <ul className="rolldown-list" id="myList">
          {Object.entries(JSON.parse(stats)).map(([candidate, votes]) => 
            <li key={candidate}>
              {myVote === candidate ? <b>{candidate}</b> : <p>{candidate}</p>}
              <p>{votes}</p>
              {myVote === candidate ? 
                <button
                  style={{ borderRadius: '5px' }}
                  onClick={ async () => {
                    await window.contract.unvote({ candidate: candidate }, '300000000000000')
                  }}
                >
                  Remove Vote
                </button>
             : <></> }
              {!myVote || myVote.length === 0 ? 
              <>
                <label
                  htmlFor="mint"
                >
                  Your confidence level, expressed in NEAR:
                </label>
                <div style={{ display: 'flex', marginBottom: '2rem'  }}>
                  <input
                    autoComplete="off"
                    defaultValue={32}
                    id="mint"
                  />
                    <button
                        style={{ borderRadius: '0 5px 5px 0' }}
                        onClick={ async () => {
                          await window.contract.vote({ candidate: candidate }, '300000000000000')
                        }}
                      >
                        Vote
                      </button>
                </div> 
              </>
             : <></> }
            </li>
          )}
          <li key="add">
            <label htmlFor="mint">
                Missing your favourite talking head? Add them, it's free:
            </label>
            <div style={{ display: 'flex', marginBottom: '2rem'  }}>
              <input
                autoComplete="off"
                id="add_cand"
              />
              <button
                  style={{ borderRadius: '0 5px 5px 0' }}
                  onClick={ async () => {
                    await window.contract.add_candidate({ candidate: document.getElementById('add_cand').value }, '300000000000000')
                  }}
                >
                  
                  Add Candidate
              </button>
            </div>           
          </li>    
        </ul> 
        : <></>
        }
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, greeting } = event.target.elements

          // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const addCandidate = greeting.value

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.vote({
              candidate: addCandidate
            })
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }

        }}>
        </form>
      </main>
    </>
  )
}