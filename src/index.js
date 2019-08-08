import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route, Switch } from "react-router-dom";

import AnnotationForm from "./pages/form";
import AnnotationResult from "./pages/result";
import PageNotFound from "./pages/page-not-found";

import bg from "./assets/bg.svg";
import "antd/dist/antd.min.css";
import "./style.css";

function App(props) {
  return (
    <div style={{ height: "100vh", backgroundImage: `url(${bg})` }}>
      <Router>
        <Switch>
          <Route path="/" exact component={AnnotationForm} />
          <Route path="/result/:id" component={AnnotationResult} />
          <Route component={PageNotFound} />
        </Switch>
      </Router>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
