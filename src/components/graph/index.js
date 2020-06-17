import React, { useRef, useEffect, useState } from "react";
import cytoscape from "cytoscape";
import { CONFIG } from "./config";
import "./style.css";

export default function Graph({ graph }) {
  const cy_wrapper = useRef();
  const [cy, setCy] = useState();

  useEffect(() => {
    configViz();
  }, []);

  // Initialize the visualization
  const configViz = () => {
    setCy(cytoscape({ ...CONFIG, container: cy_wrapper.current }));
  };

  useEffect(() => {
    if (cy) draw();
  }, [cy]);

  // draw nodes and edges
  const draw = () => {
    cy.json({ elements: { nodes: graph.elements.nodes } });
    cy.layout({ name: "preset" }).run();
  };

  return <div className="viz-wrapper" ref={cy_wrapper} />;
}
