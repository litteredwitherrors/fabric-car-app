import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import SelectBox from './components/select_box';
var html = require('file-loader?name=[name].[ext]!./index.html');

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cars: []
    };
  }

  componentDidMount() {
    axios.get(`/cars/`)
        .then(res => {
          const cars = res.data.data;
          this.setState({ cars })
        });
  }

  render() {
    return (
      <div>
        <h1>Query</h1>
        <SelectBox cars={this.state.cars} />
        <ul>
          {this.state.cars.map(car =>
            <li key={car.Key}>{car.Key}</li>
          )}
        </ul>
      </div>
    )
  }
}

const app = document.getElementById('app');
ReactDOM.render(<Main />, app);
