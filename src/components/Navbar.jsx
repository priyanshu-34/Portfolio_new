import React, { useState } from "react";
import "./Navbar.css"; // Create a separate CSS file for styles

export const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  const handleToggle = () => {
    setIsMobile(!isMobile);
  };

  return (
    <div className={`navbar ${isMobile ? "mobile" : ""}`}>
      <div className="profile">
        <img src="./profile.png" alt="Profile Icon" />
        <span>Priyanshu</span>
      </div>

      <div className={`links ${isMobile ? "mobile" : ""}`}>
        <ul className="list">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#Projects">Projects</a>
          </li>
          <li>
            <a href="#Skills">Skills</a>
          </li>
          <li>
            <a href="#Experiences">Work</a>
          </li>
          <li>
            <a href="#Contact">Contact</a>
          </li>
        </ul>
      </div>

      <div className="burger-menu" onClick={handleToggle}>
        <div className={`bar ${isMobile ? "open" : ""}`}></div>
        <div className={`bar ${isMobile ? "open" : ""}`}></div>
        <div className={`bar ${isMobile ? "open" : ""}`}></div>
      </div>
    </div>
  );
};
