import React, { Component } from 'react';
import Board from './Board.js';
import './App.css';

const DEFAULT_SETTINGS = {
  height: 8,
  width: 8,
  mines: 8
}

class App extends Component {
  render() {
    return (
      <Board settings={DEFAULT_SETTINGS}></Board>
    );
  }
}

export default App;
