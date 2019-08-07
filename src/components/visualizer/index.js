import React, { Fragment, useState, useEffect } from "react";
import { Tooltip, Tree, message, Collapse, Button, Input } from "antd";
import removeSvg from "../../assets/remove.svg";
import addSvg from "../../assets/add.svg";
import filterSvg from "../../assets/filter.svg";
import "cytoscape-context-menus/cytoscape-context-menus.css";
import $ from "jquery";

const cytoscape = require("cytoscape");
const cola = require("cytoscape-cola");
const contextMenus = require("cytoscape-context-menus");
contextMenus(cytoscape, $);

const AnnotationGroups = [
  {
    group: "gene-go-annotation",
    subgroups: [
      { subgroup: "cellular_component", color: "#F57C00" },
      { subgroup: "molecular_function", color: "#F1C40F" },
      { subgroup: "biological_process", color: "#8BC34A" }
    ]
  },
  {
    group: "gene-pathway-annotation",
    color: "#9B59B6",
    subgroups: [{ subgroup: "Reactome" }, { subgroup: "ChEBI" }]
  },
  {
    group: "biogrid-interaction-annotation",
    color: "#3498DB",
    subgroups: []
  }
];

const CYTOSCAPE_COLA_CONFIG = {
  name: "cola",
  fit: true,
  animate: true,
  padding: 10,
  nodeSpacing: 20,
  maxSimulationTime: 3000,
  ungrabifyWhileSimulating: true,
  randomize: true,
  avoidOverlap: true,
  handleDisconnected: true,
  infinite: false
};

const CYTOSCAPE_STYLE = [
  {
    selector: "node",
    css: {
      content: "data(id)",
      shape: "round-rectangle",
      width: "mapData(id.length, 0, 20, 50, 300)",
      height: 40,
      color: "#fff",
      "text-wrap": "wrap",
      "text-max-width": "350px",
      "text-valign": "center",
      "text-halign": "center",
      "background-color": "#565656",
      "text-outline-color": "#565656",
      "text-outline-width": 1
    }
  },
  {
    selector: n => n.data().subgroup === "Genes",
    style: {
      shape: "ellipse",
      height: 75,
      width: 75
    }
  },
  {
    selector: 'node[subgroup="Uniprot"]',
    css: { shape: "hexagon" }
  },
  {
    selector: 'node[subgroup="ChEBI"]',
    css: {
      shape: "diamond",
      height: 75
    }
  },
  {
    selector: "node:selected",
    css: {
      "border-width": 5,
      "border-color": "#87bef5"
    }
  },
  {
    selector: "edge",
    css: {
      "curve-style": "straight",
      "line-color": "#ccc",
      width: 4
    }
  },
  {
    selector: e => e.data().group.includes("gene-go-annotation"),
    css: {
      "target-arrow-shape": "triangle",
      "target-arrow-fill": "filled"
    }
  }
];

export function Visualizer(props) {
  cytoscape.use(cola);
  const cy_wrapper = React.createRef();
  const [cy, setCy] = useState(undefined);
  const [layout, setLayout] = useState(undefined);
  const [filteredElements, setFilteredElements] = useState(undefined);
  const [contextMenu, setContextMenu] = useState(undefined);
  const [visibleNodeTypes, setVisibleNodeTypes] = useState([
    "Genes",
    "Uniprot"
  ]);
  const [visibleAnnotations, setVisibleAnnotations] = useState(["main%"]);
  const [selectedNode, setSelectedNode] = useState({
    node: null,
    position: null
  });
  const [selectedEdge, setSelectedEdge] = useState({
    pubmed: null
  });

  useEffect(function() {
    setCy(
      cytoscape({
        container: cy_wrapper.current,
        hideEdgesOnViewport: true,
        wheelSensitivity: 0.3
      })
    );
  }, []);

  useEffect(
    function() {
      cy && toggleAnnotationVisibility(visibleAnnotations);
    },
    [visibleAnnotations, visibleNodeTypes, cy]
  );

  useEffect(
    function() {
      if (!cy) return;
      if (filteredElements) {
        cy.batch(() => filteredElements.style({ opacity: 1 }));
        cy.batch(() =>
          cy
            .nodes()
            .difference(filteredElements)
            .style({ opacity: 0.1 })
        );
        cy.edges()
          .difference(filteredElements)
          .style({ opacity: 0 });
        contextMenu.showMenuItem("add");
        contextMenu.showMenuItem("remove");
        contextMenu.hideMenuItem("filter");
      } else {
        cy.batch(() => cy.elements().style({ opacity: 1 }));
        contextMenu.showMenuItem("filter");
        contextMenu.hideMenuItem("add");
        contextMenu.hideMenuItem("remove");
      }
    },
    [filteredElements]
  );

  useEffect(
    function() {
      if (cy) {
        cy.style([
          ...CYTOSCAPE_STYLE,
          ...assignColorToAnnotations(),
          {
            selector: n => n.data().group.includes("main"),
            style: {
              "background-fill": "solid",
              "background-color": "blue",
              "text-outline-color": "blue"
            }
          }
        ]);
        var options = {
          menuItems: [
            {
              id: "filter",
              content: "Filter",
              selector: "node",
              onClickFunction: e => {
                addToFilter(e.target.data().id);
              },
              hasTrailingDivider: true,
              image: { src: filterSvg, width: 18, height: 18, x: 8, y: 8 }
            },
            {
              id: "add",
              content: "Add",
              selector: "node",
              image: { src: addSvg, width: 18, height: 18, x: 8, y: 8 },
              onClickFunction: e => addToFilter(e.target.data().id),
              show: false
            },
            {
              id: "remove",
              content: "Remove",
              selector: "node",
              image: { src: removeSvg, width: 18, height: 18, x: 8, y: 8 },
              onClickFunction: e => removeFromFilter(e.target.data().id),
              show: false
            }
          ],
          menuItemClasses: ["context-menu-item"],
          contextMenuClasses: ["context-menu"]
        };
        setContextMenu(cy.contextMenus(options));
      }
    },
    [cy]
  );

  useEffect(
    function() {
      if (layout) layout.run();
    },
    [layout]
  );

  const randomLayout = () => {
    setLayout(cy.layout(CYTOSCAPE_COLA_CONFIG));
  };

  const breadthFirstLayout = () => {
    setLayout(cy.layout({ name: "breadthfirst" }));
  };

  const concentricLayout = () => {
    setLayout(
      cy.layout({
        name: "concentric",
        concentric: node => node.degree(),
        levelWidth: () => 3
      })
    );
  };

  const takeScreenshot = () => {
    const link = document.createElement("a");
    link.setAttribute("href", cy.jpg());
    link.setAttribute("download", "mozi-graph.jpg");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const registerEventListeners = () => {
    cy.nodes()
      .on("select", e =>
        setSelectedNode({
          node: e.target.data(),
          position: e.target.renderedPosition()
        })
      )
      .on("unselect", e => setSelectedNode({ node: null }));

    cy.edges()
      .on("select", e => {
        let pubMedIds = e.target.data().pubmedId.split(",");
        pubMedIds[0] !== ""
          ? setSelectedEdge({
              pubmed: pubMedIds
            })
          : setSelectedEdge({ pubmed: null });
      })
      .on("unselect", e => setSelectedEdge({ pubmed: null, position: null }));
  };

  const clearFilter = () => {
    setFilteredElements(undefined);
  };

  const removeFromFilter = id => {
    const hood = cy
      .getElementById(id)
      .union(cy.getElementById(id).connectedEdges());
    setFilteredElements(eles => eles.difference(hood));
  };

  const addToFilter = id => {
    const hood = cy.getElementById(id).closedNeighborhood();
    setFilteredElements(eles => (eles ? eles.union(hood) : hood));
  };

  const downloadGraphJSON = () => {
    let exportJson = {
      data: { name: "Annotation Service Export" },
      elements: cy.json().elements
    };
    let json = JSON.stringify(exportJson);
    const link = document.createElement("a");
    let file = new Blob([json], { type: "text/json" });
    link.href = URL.createObjectURL(file);
    link.download = `annotation-graph.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatDescription = description => {
    if (!description) return "";
    return description.includes("https://") ||
      description.includes("http://") ? (
      <a href={description} rel="noopener noreferrer" target="_blank">
        Learn more
      </a>
    ) : (
      description
    );
  };

  const toggleAnnotationVisibility = visibleAnnotations => {
    const { nodes, edges } = props.graph;
    const visibleNodes = nodes.filter(n => {
      const { group, subgroup } = n.data;
      return (
        visibleAnnotations.some(a => {
          const [g, sg] = a.split("%");
          return (
            group.includes(g) &&
            (["Genes", "Uniprot"].includes(subgroup)
              ? visibleNodeTypes.includes(subgroup)
              : sg
              ? sg === subgroup
              : true)
          );
        }) || group.includes("main")
      );
    });
    const visibleEdges = edges.filter(e => {
      const { source, target } = e.data;
      return (
        visibleNodes.some(n => n.data.id === source) &&
        visibleNodes.some(n => n.data.id === target)
      );
    });
    cy.json({ elements: { nodes: visibleNodes } });
    cy.add(visibleEdges);
    randomLayout();
    registerEventListeners();
  };

  const getAnnotationPercentage = (group, subgroup) => {
    const { nodes } = props.graph;
    let filteredNodes = group
      ? nodes.filter(n => n.data.group.includes(group))
      : nodes;
    filteredNodes = subgroup
      ? filteredNodes.filter(n => n.data.subgroup === subgroup)
      : filteredNodes;
    return (filteredNodes.length * 100) / nodes.length;
  };

  const assignColorToAnnotations = () => {
    const styles = AnnotationGroups.reduce((acc, annotation) => {
      const subGroupColors = annotation.subgroups.map(sg => {
        return {
          selector: n =>
            n.data().group.includes(annotation.group) &&
            n.data().subgroup === sg.subgroup,
          style: {
            "background-color": annotation.color || sg.color,
            "text-outline-color": annotation.color || sg.color
          }
        };
      });
      return annotation.color
        ? [
            ...acc,
            {
              selector: n => n.data().group.includes(annotation.group),
              style: {
                "background-color": annotation.color,
                "text-outline-color": annotation.color,
                "line-color": `${annotation.color}AA`
              }
            },
            ...subGroupColors
          ]
        : [...acc, ...subGroupColors];
    }, []);

    const multipleGroupsStyle = {
      selector: n => n.data().group.length > 1,
      style: {
        "background-fill": "linear-gradient",
        "background-gradient-direction": "to-bottom-right",
        "text-outline-color": "#565656",
        "background-gradient-stop-colors": n =>
          n.data().group.reduce((acc, group) => {
            if (group === "main") return acc;
            const color =
              AnnotationGroups.find(g => g.group === group).color || "#565656";
            return `${acc} ${color} ${color}`;
          }, ""),
        "background-gradient-stop-positions": n => {
          const group = n.data().group.filter(g => g !== "main");
          const width = 100 / group.length;
          let value = "0%";
          for (let i = 1; i < group.length; i++) {
            value += ` ${width * i}% ${width * i}%`;
          }
          return value + " 100%";
        }
      }
    };

    return [...styles, multipleGroupsStyle];
  };

  const search = id => {
    cy.batch(function() {
      const selected = cy.nodes(`[id = "${id}"]`);
      if (selected.size()) {
        selected.select();
        cy.zoom(2);
        cy.center(selected);
      } else {
        message.warn("No matching results.");
      }
    });
  };

  const renderProgressBar = (percentage, color) => {
    return (
      <div className="percentage-wrapper">
        <div
          className="percentage-bar"
          style={{
            backgroundColor: color,
            width: `${percentage}%`
          }}
        />
      </div>
    );
  };

  const renderDescriptionBox = (title, content) => {
    return (
      <div className="description-wrapper">
        <h4>{title}</h4>
        <p>{content}</p>
      </div>
    );
  };

  const renderFilterControls = () => {
    return (
      <div className="filter-controls">
        <Tooltip placement="bottom" title="Remove Filter">
          <Button
            icon="close"
            size="large"
            onClick={clearFilter}
            type="danger"
          />
        </Tooltip>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="visualizer-wrapper" ref={cy_wrapper} />
      <div className="visualizer-controls-wrapper">
        <Tooltip placement="right" title="Go back">
          <Button size="large" icon="arrow-left" onClick={props.back} />
        </Tooltip>
        <Tooltip placement="right" title="Randomize layout">
          <Button size="large" icon="swap" onClick={randomLayout} />
        </Tooltip>
        <Tooltip placement="right" title="Breadth-first layout">
          <Button size="large" icon="gold" onClick={breadthFirstLayout} />
        </Tooltip>
        <Tooltip placement="right" title="Concentric layout">
          <Button size="large" icon="play-circle" onClick={concentricLayout} />
        </Tooltip>
        <Tooltip placement="right" title="Save screenshot">
          <Button size="large" icon="camera" onClick={takeScreenshot} />
        </Tooltip>
        <Tooltip placement="right" title="Download scheme file">
          <Button
            size="large"
            icon="file-text"
            onClick={props.downloadSchemeFile}
          />
        </Tooltip>
        <Tooltip placement="right" title="Download graph as JSON">
          <Button size="large" icon="share-alt" onClick={downloadGraphJSON} />
        </Tooltip>
        <Tooltip
          placement="right"
          title={
            <div>
              <p>
                Use the checkboxes to the right to filter the graph by
                annotations.
              </p>
              <p>Click on a gene node to see annotations connected to it.</p>
              <p>Click on an annotation to see which genes it annotates.</p>
            </div>
          }
        >
          <Button size="large" icon="info-circle" />
        </Tooltip>
      </div>
      <div className="annotation-toggle-wrapper">
        <Input.Search
          placeholder="Node ID"
          onSearch={search}
          enterButton
          style={{ margin: 5, marginBottom: 15 }}
        />
        <Collapse bordered={false} defaultActiveKey={["types"]}>
          <Collapse.Panel header="Node types" key="types">
            <Tree
              defaultCheckedKeys={visibleNodeTypes}
              onCheck={setVisibleNodeTypes}
              checkable
            >
              <Tree.TreeNode key="Genes" title="Genes" />
              <Tree.TreeNode key="Uniprot" title="Protiens" />
            </Tree>
          </Collapse.Panel>
        </Collapse>
        <Collapse bordered={false}>
          <Collapse.Panel header="Annotations" key="annotation">
            <Tree
              defaultCheckedKeys={[]}
              onCheck={setVisibleAnnotations}
              checkable
            >
              {AnnotationGroups.filter(a =>
                props.annotations.includes(a.group)
              ).map((a, i) => {
                return (
                  <Tree.TreeNode
                    key={`${a.group}%`}
                    title={
                      <span>
                        {a.group}
                        {renderProgressBar(
                          getAnnotationPercentage(a.group),
                          a.color || "#565656"
                        )}
                      </span>
                    }
                  >
                    {a.subgroups
                      .filter(s => props.annotations.includes(s.subgroup))
                      .map(s => (
                        <Tree.TreeNode
                          key={`${a.group}%${s.subgroup}`}
                          title={
                            <span>
                              {s.subgroup}
                              {renderProgressBar(
                                getAnnotationPercentage(a.group, s.subgroup),
                                a.color || s.color
                              )}
                            </span>
                          }
                        />
                      ))}
                  </Tree.TreeNode>
                );
              })}
            </Tree>
          </Collapse.Panel>
        </Collapse>
      </div>
      {selectedNode.node &&
        renderDescriptionBox(
          `${selectedNode.node.name} ( ${selectedNode.node.id.slice(
            selectedNode.node.id.indexOf(":") + 1
          )} )`,
          formatDescription(selectedNode.node.definition)
        )}
      {selectedEdge.pubmed &&
        renderDescriptionBox(
          "PubMed Id",
          selectedEdge.pubmed.map((pubId, i) => (
            <p key={i}>
              {i + 1} -{" "}
              <a
                key={pubId[pubId.length - 5]}
                href={pubId}
                rel="noopener noreferrer"
                target="_blank"
              >
                Learn more
              </a>
            </p>
          ))
        )}
      {filteredElements && renderFilterControls()}
    </Fragment>
  );
}
