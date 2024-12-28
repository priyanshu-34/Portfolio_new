import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { SiLeetcode, SiGeeksforgeeks } from "react-icons/si";
import { IoMailOpenOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import "./Contact.css";
import { MyToast } from "./MyToast";

export const Contact = () => {
  const form = useRef();

  const [showToast, setShowToast] = useState(false);

  const openEmail = () => {
    // Implement your email sending logic here
    window.location.href = "mailto:priyanshu.sjce@gmail.com";
  };

  const openWhatsApp = () => {
    // Implement your WhatsApp logic here
    // For example, you can use a WhatsApp API or open the WhatsApp Web URL
    window.open("https://web.whatsapp.com/send?phone=8987245791");
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_g6cp998", "template_20ojhe7", form.current, {
        publicKey: "ZW-67t-2qVRxAJeA8",
      })
      .then(() => {
        form.current.reset();
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      });
  };

  return (
    <div className="contact" id="Contact">
      <h3>Contact Me</h3>

      <div className="contact-box">
        <div className="inner-box">
          <div className="whatsapp">
            <button
              className="email btn btn-outline-primary"
              onClick={openEmail}
            >
              <IoMailOpenOutline /> Email
            </button>
            <button
              className="whats btn btn-outline-success"
              onClick={openWhatsApp}
            >
              <FaWhatsapp /> WhatsApp
            </button>
          </div>

          <div className="form-div">
            <form className="form" ref={form} onSubmit={sendEmail}>
              <input
                className="name-input"
                type="text"
                name="from_name"
                placeholder="  Name"
              />

              <input
                className="email-input"
                type="email"
                name="from_email"
                placeholder="  Email"
              />

              <input
                className="subject-input"
                type="text"
                name="email_subject"
                placeholder="  Subject"
              />

              <textarea
                className="message-input"
                name="message"
                placeholder="Write Your Message"
              />

              <input className="btn btn-primary" type="submit" value="Send" />
            </form>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              {showToast && <MyToast />}
            </div>
          </div>

          <div className="socials">
            <ul>
              <li>
                <a
                  href="https://www.linkedin.com/in/priyans34/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0C6DFD" }}
                >
                  <FaLinkedin style={{ fontSize: "3vh" }} />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/priyanshu-34"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub style={{ fontSize: "3vh" }} />
                </a>
              </li>
              <li>
                <a
                  href="https://leetcode.com/u/priyans34/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#cc7e3f" }}
                >
                  <SiLeetcode style={{ fontSize: "3vh" }} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.geeksforgeeks.org/user/itsaslowball"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2f9339" }}
                >
                  <SiGeeksforgeeks style={{ fontSize: "3vh" }} />
                </a>
              </li>
            </ul>
          </div>
          <div>
            <a href="https://visitcount.itsvg.in">
              <img src="https://visitcount.itsvg.in/api?id=priyans34&label=Profile%20Views&color=5&icon=0&pretty=true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
