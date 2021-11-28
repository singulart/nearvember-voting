import { connect, Contract, keyStores, WalletConnection } from 'near-api-js'
import getConfig from './config'
import {database} from './sources';

const nearConfig = getConfig(process.env.NODE_ENV || 'development')

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['my_vote', 'get_stats'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['vote', 'unvote', 'add_candidate'],
  })
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

const cfgtool = require('cfgrammar-tool');

const types = cfgtool.types;
const generatorFactory = cfgtool.generator;

const Grammar = types.Grammar;
const Rule = types.Rule;
const T = types.T;
const NT = types.NT;


const rules = [];

export function generateBio() {
  let source = JSON.parse(database());
  for (const pos in source) {
    if (source.hasOwnProperty(pos)) {
      const words = source[pos];
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        rules.push(Rule(pos, [T(word)]));
      }
    }
  }

  const exprGrammarShort = Grammar([
    Rule('S', [NT('NP')]),
    Rule('NP', [NT('NON_WORK_BASE')]),
    Rule('NP', [NT('NJJ')]),
    Rule('NJJ', [NT('AREAJ'), NT('N')]),
    Rule('NJJ', [NT('N')]),
    Rule('N', [NT('BASE')]),
    Rule('P', [T('in')]),
    ...rules,
  ]);

  const exprGrammarLong = Grammar([
    Rule('S', [NT('NP')]),
    Rule('NP', [NT('NON_WORK_BASE')]),
    Rule('NP', [NT('NJJ')]),
    Rule('NP', [NT('NJJ'), NT('PP')]),
    Rule('PP', [NT('P'), NT('AREAN')]),
    Rule('NJJ', [NT('JJ'), NT('AREAJ'), NT('N')]),
    Rule('NJJ', [NT('JJ'), NT('N')]),
    Rule('NJJ', [NT('N')]),
    Rule('N', [NT('BASE')]),
    Rule('JJ', [NT('ADJ')]),
    Rule('P', [T('in')]),
    Rule('P', [T('of')]),
    ...rules,
  ]);

  function generateTitle(style) {
    let maxLength;
    let minLength;
    let exprGrammar;
    if (style === 'short') {
      maxLength = 4;
      minLength = 1;
      exprGrammar = exprGrammarShort;
    } else {
      maxLength = 5;
      minLength = 4;
      exprGrammar = exprGrammarLong;
    }
  
    const generator = generatorFactory(exprGrammar);
    let length = null;
    let tokens = null;
    while (!tokens) {
      length =
        Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      tokens = generator(length, {
        list: true,
      });
    }
    return tokens.join(' ');
  }
  
  function regenerate() {
    let style = null;
    if (Math.random() < 0.5) {
      style = 'short';
    } else {
      style = 'long';
    }
    let title = generateTitle(style);
    let more = Math.random();
    let words = title.split(' ');
    while (
      style === 'short' &&
      (words.length < 5 || (more < 0.8 && words.length < 9))
    ) {
      const newTitle = generateTitle(style);
      const wordSet = new Set(newTitle.split(' '));
      const oldWords = title.split(' ');
      let duplicate = false;
      for (let i = 0; i < oldWords.length; i++) {
        if (wordSet.has(oldWords[i])) {
          duplicate = true;
          continue;
        }
      }
      if (duplicate) {
        more = Math.random();
        continue;
      } else {
        title = title + ' | ' + newTitle;
        words = title.split(' ');
        more = Math.random();
      }
    }
    return title;
  }

  return regenerate();
}

