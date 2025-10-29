import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import data from "../data.json";
import "./timeline.css";

export function calculateDuration(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  // Calculate the difference in years and months
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  // Adjust years and months if the end month is earlier than the start month
  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate total months
  const totalMonths = years * 12 + months;
  years = Math.floor(totalMonths / 12);
  months = totalMonths % 12;
  let time = ``;

  if (years === 0 && months !== 0) {
    time = `${months} months`;
  } else if (months === 0 && years !== 0) {
    time = `${years} years`;
  } else if (months === 0 && years === 0) {
    time = `1 month`;
  } else if (months !== 0 && years !== 0) {
    time = `${years} years ${months} months`;
  }

  return time;
}

export function parseDate(dateString) {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getCurrentDateFormatted() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

export const WorkTimeline = () => {
  return (
    <div style={{ margin: "0.5rem" }} id="Experiences">
      <h2
        style={{
          color: "white",
          display: "flex",
          justifyContent: "center",
          marginBottom: "5rem",
          marginTop: "4rem",
        }}
      >
        Experiences
      </h2>
      <VerticalTimeline>
        {data.WorkExperience.map((exp) => {
          if (!exp.end) {
            exp.end = getCurrentDateFormatted(); // Set current date in "YYYY-MM-DD" format
          }
          // console.log("start", exp.start);
          // console.log("end", exp.end);
          const time = calculateDuration(exp.start, exp.end);
          return (
            <VerticalTimelineElement
              className="vertical-timeline-element--work"
              contentStyle={{ background: "#1C1B23", color: "#8B8A90" }}
              contentArrowStyle={{
                borderRight: "7px solid  rgb(33, 150, 243)",
              }}
              date={exp.startDate}
              iconStyle={{ background: "green", color: "#fff" }}
              // icon={<WorkIcon />}
            >
              <h3 className="vertical-timeline-element-title">
                {exp.designation}
              </h3>

              <h5
                className="vertical-timeline-element-title"
                style={{ color: "white" }}
              >
                <i>
                  {exp.company}
                  <span style={{ fontSize: "20px" }}>, {exp.jobLocation}</span>
                  <span style={{ fontSize: "15px", fontWeight: "lighter" }}>
                    {" "}
                    ~ {time}{" "}
                  </span>
                </i>
              </h5>
              <h5 className="vertical-timeline-element-subtitle"></h5>

              <div style={{ maxHeight: "15rem", overflow: "scroll" }}>
                {exp.description && (
                  <p>
                    <ul>
                      {exp.description.map((point) => {
                        return (
                          <li
                            style={{
                              marginBottom: "15px",
                              fontWeight: "normal",
                            }}
                          >
                            {point}
                          </li>
                        );
                      })}
                    </ul>
                  </p>
                )}
              </div>

              {exp.techStack && (
                <>
                  <br></br>
                  <h5>Worked On</h5>
                  <br />
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {exp.techStack &&
                      exp.techStack.map((stack) => {
                        return <span className="stack">{stack}</span>;
                      })}
                  </div>
                </>
              )}
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
};
