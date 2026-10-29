import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Circle, Marker, Popup } from "react-leaflet";


const Dots = () => {

  const dot = [
    { name: "กรุงเทพมหานคร", lat: 13.7278956, lon: 100.52412349999997 },
    { name: "กระบี่", lat: 8.0862997, lon: 98.90628349999997 },
  ];


  return ( 
    Array.from({length:100 }, (_,index) => (
      <Marker key={index} position={{ lat:dot.lat[index] + (Math.random() - 0.5) * 0.02 ,lon: dot.lont[index] + (Math.random() - 0.5) * 0.02}}>

      </Marker>
    ))
);
};
export default Dots;
