import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import PageNotFound from "./pages/page-not-found";

import "antd/dist/antd.min.css";
import "./style.css";

import Test from "./pages";
import Result from "./pages/annotation-result";

function App(props) {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Test} />
        <Route path="/result/:id" component={Result} />
        <Route component={PageNotFound} />
      </Switch>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
