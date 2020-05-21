import React, { useState, useEffect } from "react";
import GeneAnnotationForm from "../components/gene-annotation-form";
import Notification from "../components/notification";
import toGRPCrequest from "../lib/toGRPCrequest";
import { Annotate } from "../proto/annotation_pb_service";
import { grpc } from "grpc-web-client";
import { useHistory } from "react-router-dom";
import "./style.css";

export default function Landing(props) {
  const history = useHistory();
  const [notification, setNotificaion] = useState();
  const [loading, setLoading] = useState(false);

  const handleSuccess = (message) => {
    const id = message.array[0].substr(message.array[0].indexOf(" id=") + 3);
    history.push(`/result/${id}`);
  };

  const handleError = (statusMessage) => {
    const formatError = ({ symbol, current, similar }) => {
      if (current) {
        return `${symbol} has been renamed to ${current}`;
      } else if (similar.length) {
        return `${symbol} couldn't be found. Did you mean ${similar.join(
          " , "
        )}`;
      } else {
        return `${symbol} does not exist.`;
      }
    };
    try {
      const errors = JSON.parse(statusMessage);
      const errorMessage = (
        <ul>
          {errors.map((e) => (
            <li>{formatError(e)}</li>
          ))}
        </ul>
      );
      setNotificaion({
        title: "Something went wrong",
        message: errorMessage,
        type: "error",
      });
    } catch (e) {
      setNotificaion({
        title: "Something went wrong",
        message: statusMessage,
        type: "error",
      });
    }
  };

  const handleSubmit = (formData) => {
    setLoading(true);
    const request = toGRPCrequest(formData);
    const host = process.env.GRPC_ADDR || "https://annotation.mozi.ai/grpc";
    grpc.unary(Annotate.Annotate, {
      request,
      host,
      onEnd: (res) => {
        setLoading(false);
        const { status, statusMessage, message } = res;
        console.log(message);
        status === grpc.Code.OK
          ? handleSuccess(message)
          : handleError(statusMessage);
      },
    });
  };

  return (
    <div className="landing-container">
      <div className="greetings-container">
        <h1>
          Gene
          <br />
          annotation
          <br />
          service.
        </h1>
        <p>
          Biomedical reference databases turned classification models for your
          insights
        </p>
        <p>
          Brought to you by <a href="https://mozi.ai">MOZI.AI</a>
        </p>
      </div>
      <div className="form-container">
        <GeneAnnotationForm onSubmit={handleSubmit} loading={loading} />
      </div>
      {notification && (
        <Notification {...notification} onClose={() => setNotificaion(null)} />
      )}
    </div>
  );
}
