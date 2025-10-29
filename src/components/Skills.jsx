import React from "react";
import "./Skills.css";
import { SkillCard } from "./SkillCard";
import data from "../data.json";

export const Skills = () => {
  const skillData = data.Skills;
  return (
    <div className="skills" id="Skills">
      <h3
        style={{
          textAlign: "center",
          color: "White",
          marginBottom: "4vh",
          fontSize: "2.5 rem",
        }}
      >
        Skills
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexWrap: "wrap",
          // gap: "0.625 rem",
        }}
      >
        {skillData.map((skill) => {
          return <SkillCard title={skill.title} skills={skill.skills} />;
        })}
      </div>
    </div>
  );
};
