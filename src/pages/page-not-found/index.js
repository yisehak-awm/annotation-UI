import React from "react";
import Header from "../../components/header";
import pageNotFound from "../../assets/page-not-found.svg";
import { Link } from "react-router-dom";
import "./style.css";

function PageNotFound(props) {
  return (
    <div className="container page-not-found-wrapper">
      <Header />
      <img src={pageNotFound} className="empty-state" />
      <p className="help">
        Page not found. <Link to="/">Click here</Link> to run an annotation.
      </p>
    </div>
  );
}

export default PageNotFound;
