import React, { useRef, useEffect, useState } from "react";
import cytoscape from "cytoscape";
import { CONFIG } from "./config";
import "./style.css";

export default function Graph({ graph }) {
  const cy_wrapper = useRef();
  const [cy, setCy] = useState();

  useEffect(() => {
    initViz();
  }, []);

  // Initialize the visualization
  const initViz = () => {
    setCy(cytoscape({ ...CONFIG, container: cy_wrapper.current }));
  };

  useEffect(() => {
    if (!cy) return;
    console.log(graph.elements.nodes);
    cy.json({ elements: { nodes: graph.elements.nodes } });
    cy.layout({ name: "preset" }).run();
  }, [cy]);

  return <div className="viz-wrapper" ref={cy_wrapper} />;
}
