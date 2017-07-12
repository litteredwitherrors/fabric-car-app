import React, { Component } from 'react';
import ReactDOM from 'react-dom';

var html = require('file-loader?name=[name].[ext]!./index.html');

class Main extends Component {
  render() {
    return (
      <div>
        <h1>Das App</h1>
      </div>
    )
  };
};

const app = document.getElementById('app');
ReactDOM.render(<Main/>, app);
