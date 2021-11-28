import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout, generateBio } from './utils'
import './global.css'
import meme1 from './assets/voote.jpeg';
import {ThisPersonDoesNotExist} from './avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';


export default function App() {
  // use React Hooks to store greeting in component state
  const [stats, setStats] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [avatars, setAvatars] = React.useState(new Map())
  const [myVote, setMyVote] = React.useState(true)


  const dnte = new ThisPersonDoesNotExist();

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      window.contract.get_stats()
      .then(async (stats) => {
        setStats(stats)
        return stats
      })
      .then((stats) => window.contract.my_vote({account_id: window.accountId})
        .then(myVote => {
          console.log(myVote)
          setMyVote(myVote)
          return stats
        })
      ).then(async (stats) => {
        console.log(stats)
        let statsMap = JSON.parse(stats);  
        let avatars = new Map()
        for (const key in statsMap){
          await dnte.getImage({callback: (resizedBase64) => {
            avatars.set(key, resizedBase64);
          }})
        }
        setAvatars(avatars);
      })
    }
  },[])

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
        {stats ? 
        <>        
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {Object.entries(JSON.parse(stats)).map(([candidate, votes]) => 
            <ListItem key={candidate} secondaryAction={ myVote === candidate ? 
              <IconButton edge="end" aria-label="delete" onClick={ async () => {
                await window.contract.unvote({ candidate: candidate }, '300000000000000')
              }}>
                <DeleteIcon/>
              </IconButton> : 

              !myVote || myVote.length === 0 ? 
              <IconButton edge="end" aria-label="vote" onClick={ async () => {
                await window.contract.vote({ candidate: candidate }, '300000000000000')
              }}>
              <ThumbUpIcon/>
            </IconButton> : <></>
            }>
              <ListItemAvatar>
                <Avatar src={avatars.get(candidate)} />
              </ListItemAvatar>
              <ListItemText
                primary={candidate}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Votes: {votes}  - 
                    </Typography>
                    {generateBio()}
                  </React.Fragment>
                }
              />
            </ListItem>
        )}
        </List> 
        <Typography
            sx={{ display: 'inline' }}
            component="span"
            variant="body2"
            color="text.primary"
          >
            Missing your favourite talking head? Add them, it's free: 
        </Typography>
        <TextField id="add_cand" label="Candidate name" variant="outlined" />
        <IconButton edge="end" aria-label="vote" onClick={ async () => {
                await window.contract.add_candidate({ candidate: document.getElementById('add_cand').value }, '300000000000000')
              }}>
              <ThumbUpIcon/>
        </IconButton>        
        </>
        : <></> }
      </main>
    </>
  )
}