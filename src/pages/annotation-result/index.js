import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useResult from "../../hooks/useResult";
import Modal from "../../components/modal";
import Graph from "../../components/graph";
import back from "../../assets/back.svg";
import "./style.css";

dayjs.extend(relativeTime);

export const AnnotationStatus = {
  ACTIVE: 1,
  COMPLETED: 2,
  ERROR: -1,
};

export default function GeneAnnotationResult(props) {
  let { id } = useParams();
  const [loading, status, graph, error] = useResult(id);

  if (loading) {
    return "Fetching results ...";
  }

  // If something went wrong while communicating with the server, show what's wrong
  if (error) {
    return error.toString();
  }

  if (status && status === AnnotationStatus.ACTIVE) {
    return "Annotation is going on ...";
  }

  if (status && status === AnnotationStatus.ERROR) {
    return status.statusMessage;
  }

  console.log("STatus", status);

  return <Graph graph={graph} />;

  return (
    <div className="annotation-result-container">
      <div className="header">
        <img src={back} />
        <h1>Gene annotation service.</h1>
        <div></div>
      </div>
      <div className="content">
        <h2>Gene annotation results are ready 🎉</h2>
        <p>
          Found {result.result.elements.nodes.length} entities and{" "}
          {result.result.elements.edges.length} connections in under{" "}
          {(result.end_time - result.start_time).toFixed(2)} seconds
          <br />
          This page will expire {dayjs.unix(result.expire_time).fromNow()}.
        </p>
        <button className="y-button y-ghost-button">Show summary</button>
        <button className="y-button y-ghost-button">Show data table</button>
        <button className="y-button y-ghost-button">
          Download scheme files
        </button>
        <button className="y-button y-primary-button">
          Visualize annotation result
        </button>
      </div>
      {/* <Modal>This is a modal</Modal> */}
    </div>
  );
}
