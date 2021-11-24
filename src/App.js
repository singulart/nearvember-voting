import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout, register } from './utils'
import './global.css'
import Big from 'big.js';
import meme1 from './assets/meme1.png';

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store greeting in component state
  const [greeting, set_greeting] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)
  const [balance, setBalance] = React.useState(0.0)
  const [registered, setRegistered] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {
        window.contract.ft_balance_of({ account_id: window.accountId })
        .then(balance => {
          console.log(balance)
          setBalance(balance)
        })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
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
        <h1>
          <label
            htmlFor="greeting"
          >
            TEETH balance: {balance}
          </label>
        </h1>
        <center>
          You absolutely have to love Homeopathy
        </center>
        <p style={{ textAlign: 'center' }}>
          <button onClick={ async () => {
            await window.contract.storage_deposit({ account_id: window.accountId }, '300000000000000', '1250000000000000000000')
          }}>I Love Homeopathy</button>
        </p>
        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, greeting } = event.target.elements

          // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const newGreeting = greeting.value

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.set_greeting({
              // pass the value that the user entered in the greeting field
              message: newGreeting
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

          // update local `greeting` variable to match persisted value
          set_greeting(newGreeting)

          // show Notification
          setShowNotification(true)

          // remove Notification again after css animation completes
          // this allows it to be shown again next time the form is submitted
          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="mint"
            >
              Grow some TEETH
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
                  await window.contract.ft_mint({ receiver_id: window.accountId, amount: Math.round(document.getElementById('mint').value).toString() }, '300000000000000', '1250000000000000000000')
                }}
              >
                Mint
              </button>
            </div>

            <label
              htmlFor="transfer"
            >
              Send TEETH to your buddy
            </label>
            <div style={{ display: 'flex', marginBottom: '1rem' }}>
            <input
                autoComplete="off"
                defaultValue='grimes.testnet'
                id="transfer_address"
                style={{borderRadius: '5px 5px 5px 5px'}}
              />
            </div>
            <div style={{ display: 'flex'}}>
              <input
                autoComplete="off"
                defaultValue={0}
                id="transfer_amount"
              />
              <button
                style={{ borderRadius: '0 5px 5px 0' }}
                onClick={ async () => {
                  await window.contract.ft_transfer({ receiver_id: document.getElementById('transfer_address').value, amount: Math.round(document.getElementById('transfer_amount').value).toString() }, '300000000000000', Big('0.000000000000000000000001').times(10 ** 24).toFixed())
                }}
              >
                Send
              </button>
            </div>

          </fieldset>
        </form>
      </main>
      {showNotification && <Notification />}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'set_greeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
