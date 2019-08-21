import React, { useState } from "react";
import {
  Typography,
  Tabs,
  Input,
  Upload,
  Icon,
  Checkbox,
  Switch,
  InputNumber,
  Tag,
  Button,
  Row,
  Col,
  message,
  notification
} from "antd";
import Header from "../../components/header";
import { Annotate } from "../../proto/annotation_pb_service";
import { grpc } from "grpc-web-client";
import {
  AnnotationRequest,
  Annotation,
  Gene,
  Filter
} from "../../proto/annotation_pb";
import { GRPC_ADDR, capitalizeFirstLetter } from "../../service";
import "./style.css";

const GeneGoOptions = [
  { label: "Biological Process", value: "biological_process" },
  { label: "Cellular Component", value: "cellular_component" },
  { label: "Molecular Function", value: "molecular_function" }
];

const Pathways = [
  { label: "SMPDB", value: "smpdb" },
  { label: "Reactome", value: "reactome" }
];

const GeneInputMethods = { Manual: "manual", Import: "import" };

function AnnotationForm(props) {
  const geneInputRef = React.createRef();
  const [genes, setGenes] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [parents, setParents] = useState(0);
  const [pathways, setPathways] = useState(["reactome"]);
  const [includeSmallMolecules, setIncludeSmallMolecules] = useState(false);
  const [includeProtiens, setIncludeProtiens] = useState(true);
  const [response, setResponse] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [GOSubgroups, setGOSubgroups] = useState([
    "biological_process",
    "cellular_component",
    "molecular_function"
  ]);
  const [geneInputMethod, setGeneInputMethod] = useState(
    GeneInputMethods.Manual
  );

  const addGene = e => {
    const gene = e.target.value
      .trim()
      .toUpperCase()
      .split(" ");
    gene.some(g => genes.includes(g))
      ? message.warn("Gene already exists!")
      : setGenes([...genes, ...gene]);
    geneInputRef.current.setValue("");
  };

  const toggleAnnotation = (annotation, e) => {
    const updated = e.target.checked
      ? [...annotations, annotation]
      : annotations.filter(a => a !== annotation);
    setAnnotations(updated);
  };

  const handleFileUpload = file => {
    const reader = new FileReader();
    reader.onload = () => {
      setGenes(reader.result.split("\n"));
      message.success("Genes imported!");
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    setLoading(true);
    const annotationRequest = new AnnotationRequest();
    annotationRequest.setGenesList(
      genes.map(g => {
        const gene = new Gene();
        gene.setGenename(g);
        return gene;
      })
    );
    annotationRequest.setAnnotationsList(
      annotations.map(sa => {
        const annotation = new Annotation();
        annotation.setFunctionname(sa);
        if (sa === "gene-go-annotation") {
          const namespace = new Filter();
          namespace.setFilter("namespace");
          namespace.setValue(GOSubgroups.join(" "));
          const nop = new Filter();
          nop.setFilter("parents");
          nop.setValue(parents);
          annotation.setFiltersList([namespace, nop]);
        } else if (sa === "gene-pathway-annotation") {
          const ps = new Filter();
          ps.setFilter("namespace");
          ps.setValue(pathways.join(" "));
          const ism = new Filter();
          ism.setFilter("include_small_molecule");
          ism.setValue(capitalizeFirstLetter(includeSmallMolecules.toString()));
          const ip = new Filter();
          ip.setFilter("include_prot");
          ip.setValue(capitalizeFirstLetter(includeProtiens.toString()));
          annotation.setFiltersList([ps, ip, ism]);
        } else if (sa === "biogrid-interaction-annotation") {
          const int = new Filter();
          int.setFilter("interaction");
          int.setValue(
            annotations.includes("gene-pathway-annotation") && includeProtiens
              ? "Proteins"
              : "Genes"
          );
          annotation.setFiltersList([int]);
        }
        return annotation;
      })
    );
    grpc.unary(Annotate.Annotate, {
      request: annotationRequest,
      host: GRPC_ADDR,
      onEnd: ({ status, statusMessage, message: msg }) => {
        setLoading(false);
        if (status === grpc.Code.OK) {
          setResponse(msg.array[0]);
          console.log(msg.array[0]);
          props.history.push({
            pathname: `/result/${msg.array[0].substr(
              msg.array[0].indexOf("id=") + 3
            )}`
          });
        } else {
          if (statusMessage.includes("Gene Doesn't exist")) {
            const invalidGenes = statusMessage
              .split("`")[1]
              .split(",")
              .map(g => g.trim())
              .filter(g => g);
            setGenes(genes.filter(g => !invalidGenes.includes(g)));
            notification.warning({
              message: "An error occurred",
              description: statusMessage,
              duration: 10,
              placement: "bottomRight"
            });
          } else {
            notification.error({
              message: "An error occurred",
              description: statusMessage,
              duration: 10,
              placement: "bottomRight"
            });
          }
        }
      }
    });
  };

  return (
    <div className="container form-wrapper">
      <Header />
      <Row>
        <Col
          xs={{ span: 24 }}
          sm={{ span: 20, offset: 2 }}
          md={{ span: 10, offset: 7 }}
        >
          {/* Gene List */}
          <span className="title">Input Genes</span>
          <Tabs activeKey={geneInputMethod} onChange={setGeneInputMethod}>
            <Tabs.TabPane tab="Input directly" key={GeneInputMethods.Manual}>
              <Input
                ref={geneInputRef}
                size="large"
                placeholder="Enter gene name and hit enter"
                onPressEnter={addGene}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Import from file" key={GeneInputMethods.Import}>
              <Upload.Dragger
                multiple={false}
                beforeUpload={file => {
                  handleFileUpload(file);
                  return false;
                }}
                previewFile={file => null}
              >
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to import gene list
                </p>
                <p className="ant-upload-hint">
                  The file must be a plain text file with one gene name per line
                </p>
              </Upload.Dragger>
            </Tabs.TabPane>
          </Tabs>
          <div className="gene-list">
            {genes.map(g => (
              <Tag
                closable
                color="purple"
                key={g}
                onClose={() => {
                  setGenes(genes.filter(f => f !== g));
                }}
              >
                {g}
              </Tag>
            ))}
            {genes.length > 1 && (
              <Button
                icon="delete"
                type="danger"
                size="small"
                ghost
                onClick={e => setGenes([])}
              />
            )}
          </div>
          {/* Annotations */}
          <span className="title">Annotations</span>
          <ul className="annotation-list">
            <li>
              <Checkbox
                onChange={e => toggleAnnotation("gene-go-annotation", e)}
              >
                Gene-GO
              </Checkbox>
              {annotations.includes("gene-go-annotation") && (
                <div className="annotation-parameters">
                  <div className="parameter">
                    <Checkbox.Group
                      defaultValue={GOSubgroups}
                      options={GeneGoOptions}
                      onChange={setGOSubgroups}
                    />
                  </div>
                  <div className="parameter">
                    <Typography.Text>
                      <div className="label">Number of parents: </div>
                    </Typography.Text>
                    <InputNumber
                      defaultValue={parents}
                      min={0}
                      onChange={setParents}
                    />
                  </div>
                </div>
              )}
            </li>
            <li>
              <Checkbox
                onChange={e => toggleAnnotation("gene-pathway-annotation", e)}
              >
                Gene Pathway
              </Checkbox>
              {annotations.includes("gene-pathway-annotation") && (
                <div className="annotation-parameters">
                  <div className="parameter">
                    <Checkbox.Group
                      options={Pathways}
                      defaultValue={pathways}
                      onChange={setPathways}
                    />
                  </div>
                  <div className="parameter">
                    <Switch
                      defaultChecked={includeSmallMolecules}
                      onChange={setIncludeSmallMolecules}
                    />
                    {"  "}
                    <div className="label">Small Molecules</div>
                    <Switch
                      defaultChecked={includeProtiens}
                      onChange={setIncludeProtiens}
                    />
                    {"  "}
                    <div className="label">Protiens</div>
                  </div>
                </div>
              )}
            </li>
            <li>
              <Checkbox
                onChange={e =>
                  toggleAnnotation("biogrid-interaction-annotation", e)
                }
              >
                Biogrid Protien Interaction
              </Checkbox>
            </li>
          </ul>
          <div className="actions">
            <Button
              type="primary"
              icon="check"
              disabled={!annotations.length || !genes.length}
              onClick={handleSubmit}
              loading={loading}
            >
              {loading ? "Processing annotation request ..." : "Submit"}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

import { withRouter } from "react-router-dom";
export default withRouter(AnnotationForm);
