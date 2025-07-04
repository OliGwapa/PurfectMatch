import React from "react";
import { Link } from "react-router-dom";
import "../../styles/LandingCSS/about.css";
import logo from "../../assets/Logo1.png";

export default function About() {
  return (
    <div className="about-container">
      {/* Updated navbar similar to landing page */}
      <header className="navbar">
        <div className="navbar-left">
          <Link to="/"><img src={logo} alt="Logo" className="logo" /></Link>
          <span className="site-name">Pawfect Match</span>
        </div>
        <nav className="navbar-right">
          <Link to="/login" className="login-btn">Log In</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </nav>
      </header>

      <div className="about-content-wrapper">
        {/* Left section with background and centered logo */}
        <div className="about-left">
          <div className="background-overlay"></div>
          <div className="logo-container">
            <Link to="/"><img src={logo} alt="Pawfect Match Logo" className="center-logo" /></Link>
          </div>
        </div>

        {/* Right section with content */}
        <div className="about-right">
          <div className="about-box">
            <h2>About Pawfect Match</h2>
            <p>
              Pawfect Match is a premier platform designed to connect responsible pet owners seeking the ideal breeding partner for their dogs or cats. Whether you are searching for a stud for your dog or a mate for your cat, Pawfect Match offers a seamless and secure way to find compatible partners based on specific needs and preferences. Our goal is to facilitate quality connections between pets and ensure a smooth, efficient process for owners.
            </p>
            <p>
              The app is built with both pet owners and their furry companions in mind, providing a user-friendly experience to help you navigate every step of the breeding journey. With its comprehensive set of features, Pawfect Match ensures that finding the right match for your pet is straightforward, secure, and tailored to your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}