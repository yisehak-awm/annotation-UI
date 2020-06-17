// Colors
const SELECTION_COLOR = "#87bef5";
const ANNOTATION_COLORS = {
  main: "#1f01ff",
  "gene-go-annotation": "#565656",
  cellular_component: "#F57C00",
  molecular_function: "#F1C40F",
  biological_process: "#8BC34A",
  "gene-pathway-annotation": "#9B59B6",
  "biogrid-interaction-annotation": "#3498DB",
  "rna-annotation": "#eb2f96",
};

const DEFAULT_NODE_STYLE = {
  selector: "node",
  style: {
    label: "data(id)",
    shape: "rectangle",
    width: 75,
    height: 75,
    color: "#fff",
    "text-valign": "center",
    "text-halign": "center",
    "text-outline-width": 2,
    "min-zoomed-font-size": 8,
    "background-fill": "linear-gradient",
    "background-gradient-direction": "to-bottom-right",
    "background-gradient-stop-colors": (n) =>
      n
        .data()
        .group.reduce(
          (a, g) => `${a} ${ANNOTATION_COLORS[g]} ${ANNOTATION_COLORS[g]}`,
          ""
        ),
    "background-gradient-stop-positions": (n) => {
      const positions = "";
      const groups = n.data().group.length;
      const width = 100 / groups;
      for (let i = 1; i < groups; i++) positions += `${width * i} ${width * i}`;
      return positions;
    },
    "text-outline-color": (n) => {
      n.data().group.length === 1
        ? ANNOTATION_COLORS[n.data().group[0]]
        : "#565656";
    },
  },
};

const GENE_NODE_STYLE = {
  selector: "node[subgroup='Genes']",
  style: {
    shape: "ellipse",
  },
};

const INPUT_NODE_STYLE = {
  selector: (e) => e.group() === "nodes" && e.data().group.includes("main"),
  style: {
    "background-color": "#1f01ff",
    "text-outline-color": "#1f01ff",
  },
};

const UNIPROT_NODE_STYLE = {
  selector: 'node[subgroup="Uniprot"]',
  style: { shape: "hexagon", width: 100 },
};

const CHEBI_NODE_STYLE = {
  selector: "node[subgroup='ChEBI']",
  style: {
    shape: "diamond",
    width: 100,
  },
};

const RNA_NODE_STYLE = {
  selector: (e) =>
    e.group() == "nodes" && e.data().group.includes("rna-annotation"),
  style: {
    shape: "round-pentagon",
    width: 200,
  },
};

const CELLULAR_COMPONENT_NODE_STYLE = {
  selector: "node[subgroup='cellular_component']",
  "background-color": {
    color: ANNOTATION_COLORS["cellular_component"],
  },
};

const MOLECULAR_FUNCTION_NODE_STYLE = {
  selector: "node[subgroup='molecular_function']",
  "background-color": {
    color: ANNOTATION_COLORS["molecular_function"],
  },
};

const BIOLOGICAL_PROCESS_NODE_STYLE = {
  selector: "node[subgroup='biological_process']",
  "background-color": {
    color: ANNOTATION_COLORS["biological_process"],
  },
};

const SELECTED_NODE_STYLE = {
  selector: "node:selected",
  style: {
    "border-width": 5,
    "border-color": SELECTION_COLOR,
  },
};

const DEFAULT_EDGE_STYLE = {
  selector: "edge",
  style: {},
};

const GO_EDGE_STYLE = {
  selector: (e) => e.data().group.includes("gene-go-annotation"),
  style: {
    "target-arrow-shape": "triangle",
    "target-arrow-fill": "filled",
  },
};

export const CONFIG = {
  hideEdgesOnViewport: true,
  wheelSensitivity: 0.3,
  style: [
    DEFAULT_NODE_STYLE,
    GENE_NODE_STYLE,
    INPUT_NODE_STYLE,
    UNIPROT_NODE_STYLE,
    CHEBI_NODE_STYLE,
    RNA_NODE_STYLE,
    MULTI_GROUP_NODE_STYLE,
    CELLULAR_COMPONENT_NODE_STYLE,
    MOLECULAR_FUNCTION_NODE_STYLE,
    BIOLOGICAL_PROCESS_NODE_STYLE,
    DEFAULT_EDGE_STYLE,
    GO_EDGE_STYLE,
    SELECTED_NODE_STYLE,
  ],
};
