import React, { useReducer } from "react";
import Checkbox from "../checkbox";
import Switch from "../switch";
import Uploader from "../uploader";
import TagInput from "../tag-input";
import "./style.css";

const initialState = {
  genes: [],
  ontology: false,
  pathway: false,
  biogrid: false,
  biologicalProcess: true,
  cellularComponent: true,
  molecularFunction: true,
  ontologyParents: 0,
  smpdb: false,
  reactome: true,
  smallMolecules: false,
  crossAnnotateWithBiogrid: false,
  includeCodingRNA: false,
  includeNonCodingRNA: false,
  includeProtiens: true,
};

const formReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FIELD":
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
};

export default function GeneAnnotationForm({ onSubmit, loading }) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const set = (f, v) => dispatch({ type: "FIELD", field: f, value: v });

  const isFormValid = () =>
    state.genes.length &&
    (state.ontology || state.pathway || state.biogrid) &&
    state.ontologyParents >= 0;

  return (
    <form className="gene-annotation-form">
      <h3>Input HGNC gene symbols</h3>
      <TagInput
        tags={state.genes}
        onChange={(genes) => set("genes", genes)}
        placeholder="Enter space separated gene symbols"
      />
      <br />
      <Uploader
        id="import-genes"
        label="Click here to import HGCN gene symbols from file"
        multiple={false}
        accept=".txt"
        onFileUpload={(e) => set("genes", e.trim().split("\n"))}
      />
      <h3>Annotations</h3>
      <Checkbox
        id="ontology"
        label="Gene Ontology"
        defaultValue={state.ontology}
        onClick={(e) => set("ontology", e.target.checked)}
      />
      <div data-show={state.ontology} className="annotation-configuration">
        <div className="inline-inputs">
          <div className="input">
            <Checkbox
              id="biological_process"
              label="Biological process"
              defaultValue={state.biologicalProcess}
              onClick={(e) => set("biologicalProcess", e.target.checked)}
            />
          </div>
          <div className="input">
            <Checkbox
              id="cellular_component"
              label="Cellular component"
              defaultValue={state.cellularComponent}
              onClick={(e) => set("cellularComponent", e.target.checked)}
            />
          </div>
          <div className="input">
            <Checkbox
              id="molecular_function"
              label="Molecular function"
              defaultValue={state.molecularFunction}
              onClick={(e) => set("molecularFunction", e.target.checked)}
            />
          </div>
        </div>
        <div
          className={`input ${state.ontologyParents < 0 ? "has-error" : ""} `}
        >
          <label>Number of parents: </label>
          <input
            defaultValue={0}
            type="number"
            placeholder="number of parents"
            defaultValue={state.ontologyParents}
            onChange={(n) => set("ontologyParents", n.target.value)}
          />
          <span className="error-message">
            Number of parents must be a non-negaive number.
          </span>
        </div>
      </div>
      <Checkbox
        id="pathway"
        label="Curated pathways"
        defaultValue={state.pathway}
        onClick={(e) => set("pathway", e.target.checked)}
      />
      <div data-show={state.pathway} className="annotation-configuration">
        <div className="inline-inputs">
          <div className="input">
            <Checkbox
              id="smpdb"
              label="SMPDB"
              defaultValue={state.smpdb}
              onClick={(e) => set("smpdb", e.target.checked)}
            />
          </div>
          <div className="input">
            <Checkbox
              id="reactome"
              label="Reactome"
              defaultValue={state.reactome}
              onClick={(e) => set("reactome", e.target.checked)}
            />
          </div>
        </div>
        <div className="input">
          <Switch
            id="small_molecules"
            label="Small molecules"
            defaultValue={state.smallMolecules}
            onClick={(e) => set("smallMolecules", e.target.checked)}
          />
        </div>
        <div className="input">
          <Switch
            id="cross_annotate_biogrid"
            label="Cross annotate with biogrid"
            defaultValue={state.crossAnnotateWithBiogrid}
            onClick={(e) => set("crossAnnotateWithBiogrid", e.target.checked)}
          />
        </div>
      </div>
      <Checkbox
        id="biogrid"
        label="Biogrid protien interaction"
        defaultValue={state.biogrid}
        onClick={(e) => set("biogrid", e.target.checked)}
      />
      <h3>RNA</h3>
      <div className="inline-inputs">
        <div className="input">
          <Switch
            id="coding-rna"
            label="Include coding RNA"
            defaultValue={state.includeCodingRNA}
            onClick={(e) => set("includeCodingRNA", e.target.checked)}
          />
        </div>
        <div className="input">
          <Switch
            id="non-coding-rna"
            label="Include non-coding RNA"
            defaultValue={state.includeNonCodingRNA}
            onClick={(e) => set("includeNonCodingRNA", e.target.checked)}
          />
        </div>
      </div>
      <h3>Protien</h3>
      <Switch
        id="include_protiens"
        label="Include protiens"
        defaultValue={state.includeProtiens}
        onClick={(e) => set("includeProtiens", e.target.checked)}
      />
      <br />
      <br />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="y-button y-primary-button"
          disabled={!isFormValid() || loading}
          onClick={() => onSubmit(state)}
        >
          {loading ? "Starting gene annotation ..." : "Start gene annotation"}
        </button>
      </div>
    </form>
  );
}
