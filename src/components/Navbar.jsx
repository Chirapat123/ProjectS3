import { Link } from "react-router-dom";
import React from "react";

function Navbar() {
  return (
    <nav>
        <Link to="/">Home</Link> | {" "}
        <Link to="/map">Map</Link> | {" "}
        <Link to="/dashboard">Dashboard</Link> | {" "}
        <Link to="/ai">Ai</Link>
    </nav>
  );
}
export default Navbar;
