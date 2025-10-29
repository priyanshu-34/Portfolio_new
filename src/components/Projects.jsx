import React from "react";
import "./Projects.css";
import { ProjectCard } from "./ProjectCard";
import data from "../data.json";

export const Projects = () => {
  const projectsDetails = data.Projects;
  return (
    <div id="Projects" className="projects">
      <h1
        style={{
          textAlign: "center",
          color: "White",
          marginBottom: "3vh",
          fontSize: "3vh",
        }}
      >
        Projects
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          flexWrap: "wrap",
        }}
      >
        {projectsDetails.map((proj, index) => (
          <ProjectCard
            image={proj.image}
            name={proj.name}
            description={proj.description}
            tags={proj.tags}
            github={proj.github}
            demo={proj.demo}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};
