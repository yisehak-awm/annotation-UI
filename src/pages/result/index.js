import React, { useState, useEffect, Fragment } from "react";
import { HashRouter as Router, Route, Link, Redirect } from "react-router-dom";
import { Button, Alert, Spin, Typography, Icon } from "antd";
import { parse, distanceInWordsToNow } from "date-fns";
import { RESULT_ADDR, downloadSchemeFile } from "../../service";
import TabbedTables from "../../components/result-tables";
import Visualizer from "../../components/visualizer";
import Header from "../../components/header";
import sessionNotFound from "../../assets/session-not-found.svg";
import "./style.css";

export const AnnotationStatus = {
  ACTIVE: 1,
  COMPLETED: 2,
  ERROR: -1
};

export const fetchAnnotationStatus = id => {
  return fetch(`${RESULT_ADDR}/${id}`)
    .then(response => response.json())
    .then(response => {
      return response.result
        ? Object.assign({}, response, {
            result: JSON.parse(response.result)
          })
        : {
            status: AnnotationStatus.ERROR,
            statusMessage: response.response
          };
    });
};

function AnnotationResult(props) {
  const [response, setResponse] = useState(undefined);
  const [isTableShown, setTableShown] = useState(false);
  const [isFetchingResult, setFetchingResult] = useState(false);
  const { ACTIVE, COMPLETED, ERROR } = AnnotationStatus;

  useEffect(() => {
    const id = props.match.params.id;
    if (id) {
      setFetchingResult(true);
      fetchAnnotationStatus(id).then(response => {
        setFetchingResult(false);
        setResponse(response);
      });
    }
  }, []);

  const fetchTableData = fileName => {
    fetch(`${RESULT_ADDR}/csv_file/${fileName}`).then(data => {
      const res = Object.assign({}, response);
      data
        .clone()
        .text()
        .then(text => {
          res.csv_files.find(f => f.fileName === fileName).data = text;
          setResponse(res);
        });
    });
  };

  const renderActive = () => (
    <Alert
      type="info"
      message="The annotation task is still processing, refresh the page to check again."
      showIcon
    />
  );

  const renderError = () => (
    <Fragment>
      <img src={sessionNotFound} className="empty-state" />
      <Typography.Paragraph className="call-to-action">
        <Alert
          type="error"
          message={
            <span>
              {
                <span>
                  {response.statusMessage}. Try to
                  <Link to="/">run another annotation</Link>
                </span>
              }
            </span>
          }
          showIcon
        />
      </Typography.Paragraph>
    </Fragment>
  );

  const renderComplete = () => {
    const { nodes, edges } = response.result;
    return (
      <Fragment>
        <p>
          The result contains {nodes.length} entities and {edges.length}{" "}
          connections between them.
          <br />
          This page will expire in{" "}
          {distanceInWordsToNow(parse(response.expire_time * 1000))}.
        </p>
        <div className="inline-buttons">
          <Button onClick={e => setTableShown(true)}>View results table</Button>
          <Button onClick={() => downloadSchemeFile(props.match.params.id)}>
            Download Scheme File
          </Button>
          <Button type="primary">
            <Link to={`/result/${props.match.params.id}/visualizer`}>
              Visualize the result
            </Link>
          </Button>
        </div>
        <Typography.Paragraph className="call-to-action">
          <Link to="/">
            <Icon type="arrow-left" />
            Run another annotation
          </Link>
        </Typography.Paragraph>
      </Fragment>
    );
  };

  return (
    <div className="content-wrapper">
      {/* Logo and title */}
      <div className="landing-page container">
        <Header />
        {response && response.status === COMPLETED && renderComplete()}
        {response && response.status === ACTIVE && renderActive()}
        {response && response.status === ERROR && renderError()}
        {/* Show loader if there is a request being processed */}
        {isFetchingResult && (
          <div className="spin-wrapper">
            <Spin /> Fetching results ...
          </div>
        )}
      </div>
      {/* Show the visualizer */}
      <Router>
        <Route
          path="/result/:id/visualizer"
          exact
          render={() =>
            response && response.result ? (
              <Visualizer
                graph={response.result}
                annotations={response.result.nodes
                  .reduce(
                    (acc, n) => [...acc, ...n.data.group, n.data.subgroup],
                    []
                  )
                  .filter((a, i, self) => a && self.indexOf(a) === i)}
              />
            ) : (
              <Redirect to={`/result/${props.match.params.id}`} />
            )
          }
        />
      </Router>
      {/* Show annotations tables */}
      {isTableShown && (
        <TabbedTables
          tables={response.csv_files}
          fetchTableData={fetchTableData}
          handleClose={() => setTableShown(false)}
        />
      )}
    </div>
  );
}

export default AnnotationResult;
