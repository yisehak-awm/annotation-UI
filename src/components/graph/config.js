// Colors
const SELECTION_COLOR = "#87bef5";

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
    "text-outline-color": "#565656",
    "text-outline-width": 2,
    "min-zoomed-font-size": 8,
  },
};

const GENE_NODE_STYLE = {
  selector: "node[subgroup='Genes']",
  style: {
    shape: "ellipse",
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
  css: {
    shape: "round-pentagon",
    width: 200,
  },
};

const SELECTED_NODE_STYLE = {
  selector: "node:selected",
  css: {
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
  css: {
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
    UNIPROT_NODE_STYLE,
    CHEBI_NODE_STYLE,
    RNA_NODE_STYLE,
    DEFAULT_EDGE_STYLE,
    GO_EDGE_STYLE,
    SELECTED_NODE_STYLE,
  ],
};
