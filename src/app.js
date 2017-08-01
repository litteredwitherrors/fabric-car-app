import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import SelectBox from './components/select_box';
import CarList from './components/car_list';
const css = require('./styles/app.css');
var html = require('file-loader?name=[name].[ext]!./index.html');

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {cars: []};
  }

  componentDidMount() {
    axios.get(`/cars/`)
        .then(res => {
          const cars = res.data.data;
          this.setState({cars})
        });
  }

  render() {
    return (
      <div className="main">
        <main>
          <h1>Query</h1>
          <SelectBox cars={this.state.cars} />
        </main>
        <aside>
          <h1>Ledger</h1>
          <CarList cars={this.state.cars} />
        </aside>
      </div>
    )
  }
}

const app = document.getElementById('app');
ReactDOM.render(<Main />, app);
