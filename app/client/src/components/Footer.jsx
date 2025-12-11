import React from "react";
import { useSelector } from "react-redux";

function Footer() {
  const { version } = useSelector((state) => state.config.data);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535"
              target="_blank"
              rel="noopener noreferrer"
            >
              Disclaimer
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=E08E79740F9C41B9B0C484685CC5E412"
              target="_blank"
              rel="noopener noreferrer"
            >
              Accessibility
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=1AAACC9C65754E4D89A118B875E0FBDA"
              target="_blank"
              rel="noopener noreferrer"
            >
              Copyright
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="https://www2.gov.bc.ca/gov/content?id=6A77C17D0CCB48F897F8598CCC019111"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Us
            </a>
          </li>
        </ul>
        <span className="pull-right">
          <span className="text-white">Version: {version}</span>
        </span>
      </div>
    </nav>
  );
}

export default Footer;
