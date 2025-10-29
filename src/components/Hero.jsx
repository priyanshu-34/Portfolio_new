import React from "react";
import "./Hero.css";
import data from "../data.json";

export const Hero = () => {
  const heroData = data.Hero;

  return (
    <div className="container" id="About">
      <div className="profile-picture">
        <img src="./profile.png" />
      </div>

      <div className="info">
        <div className="info-div1">
          <p>{heroData.intro}</p>
        </div>
        <div className="info-div2">
          <p className="title">{heroData.title}</p>
          <p className="description">
            {heroData.description}
            <br /> <br />
            <hr
              style={{
                width: "50%",
                margin: "20px auto",
                border: "0",
                borderTop: "1px solid #ccc",
              }}
            />
            <span>{heroData.stack}</span>
          </p>
        </div>
        <a
          className="info-div3"
          href={heroData.resume}
          style={{ textDecoration: "none" }}
        >
          <div style={{ color: "white" }}>
            <h3>My Resume</h3>
          </div>
        </a>
      </div>
    </div>
  );
};
