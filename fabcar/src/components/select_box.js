import React, { Component } from 'react';

const SelectBox = (props) => {
  const carOptions = props.cars.map(car => {
    return <option key={car.Key}>{car.Key}</option>
  });
  
  return (
    <select name="select">
      {carOptions}
    </select>
  )
}

export default SelectBox;
