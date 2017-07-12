import React from 'react';
import ReactDOM from 'react-dom';

class Main extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello World</h1>
      </div>
    )
  };
};

const app = document.gethElementById('app');
ReactDOM.render(<Main/>, app);
