import React, {Component} from 'react';

const CarList = (props) => {
  const carList = props.cars.map(car => {
    return(
      <li className="car-list__item" key={car.Key}>
        <ul>
          <li className="sub-list"><span className="list-item__title">Make:</span> {car.Record.make}</li>
          <li className="sub-list"><span className="list-item__title">Model:</span> {car.Record.model}</li>
          <li className="sub-list"><span className="list-item__title">Color:</span> {car.Record.colour}</li>
          <li className="sub-list"><span className="list-item__title">Owner:</span> {car.Record.owner}</li>
          <li className="sub-list sub-list--minor"><span className="list-item__title">ID:</span> {car.Key}</li>
        </ul>
      </li>
    );
  });

  return(
    <ul className="car-list">
      <h2 className="car-list__header">All Cars</h2>
      <pre><code className="json">{JSON.stringify(props, null, 2)}</code></pre>

      {carList}
    </ul>
  )
}

export default CarList;
