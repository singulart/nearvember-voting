import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { initContract } from './utils'
import $ from 'jquery'; 

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <App />,
      document.querySelector('#root')
    )
  })
  .catch(console.error)


  // Increments the delay on each item.
$('.rolldown-list li').each(function () {
  var delay = ($(this).index() / 4) + 's';
  console.log("Here");
  $(this).css({
    webkitAnimationDelay: delay,
    mozAnimationDelay: delay,
    animationDelay: delay
  });
});
