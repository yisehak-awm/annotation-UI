import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";

import AnnotationForm from "./pages/form";

import "antd/dist/antd.min.css";
import "./style.css";

function App(props) {
  return (
    <Router>
      <Route path="/" exact component={AnnotationForm} />
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
