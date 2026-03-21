// App.pure.js
import React, { useState } from 'react';
import './App.css';
import logo from './assets/hero.png';
import TextField from '@mui/material/TextField';

function App() {
  const [count, setCount] = useState(0);

  return React.createElement(
    'div',
    null,
    React.createElement(
      'nav',
      null,
      React.createElement(
        'div',
        { className: 'navigation' },
        React.createElement('a', { href: '#Tracker' }, 'Tracker'),
        React.createElement('a', { href: '#Insights' }, 'Insights'),
        React.createElement('a', { href: '#Profile' }, 'Profile'),
        React.createElement('a', { href: '#Login/Sign-Up' }, 'Login/Sign-Up')
      )
    ),

    React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'Welcome' },
        React.createElement('img', {
          src: logo,
          alt: 'GeauxWellness logo',
          className: 'hero-logo',
        }),
        React.createElement('h2', null, 'Welcome to GeauxWellness'),
        React.createElement(
          'p',
          null,
          'Your journey to better health starts here.'
        ),
        React.createElement(TextField, {
          id: 'outlined-basic',
          variant: 'outlined',
          fullWidth: true,
          label: 'Search',
        }),
        React.createElement('button', null, 'Search')
      )
    ),

    React.createElement(
      'div',
      { className: 'MoodBlockBody' },
      React.createElement(
        'div',
        { className: 'MoodBlock' },
        React.createElement(
          'div',
          { className: 'Happy' },
          React.createElement('h3', null, 'Happy'),
          React.createElement(
            'p',
            null,
            'Feeling great! Keep up the good work.'
          )
        ),
        React.createElement(
          'div',
          { className: 'Hungry' },
          React.createElement('h3', null, 'Hungry'),
          React.createElement(
            'p',
            null,
            'Feeling hungry. Remember to eat regularly and stay hydrated.'
          )
        ),
        React.createElement(
          'div',
          { className: 'Flirty' },
          React.createElement('h3', null, 'Flirty'),
          React.createElement(
            'p',
            null,
            'Feeling flirty. Embrace the moment and have fun!'
          )
        ),
        React.createElement(
          'div',
          { className: 'Angry' },
          React.createElement('h3', null, 'Angry'),
          React.createElement(
            'p',
            null,
            'Feeling frustrated. Take a deep breath and try again.'
          )
        ),
        React.createElement(
          'div',
          { className: 'Anxious' },
          React.createElement('h3', null, 'Anxious'),
          React.createElement(
            'p',
            null,
            'Feeling anxious. Take a deep breath and try again.'
          )
        ),
        React.createElement(
          'div',
          { className: 'Sad' },
          React.createElement('h3', null, 'Sad'),
          React.createElement(
            'p',
            null,
            "Remember tough times don't last, tough people do."
          )
        )
      )
    )
  );
}

export default App;