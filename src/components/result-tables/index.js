import React, { useState, useEffect, Fragment } from "react";
import { Button, Modal, Spin, Tabs, Table, Collapse, Typography } from "antd";
import * as papa from "papaparse";
import "./style.css";
import { downloadCSVFile } from "../../service";

const parseTable = tableData => papa.parse(tableData);
const width = document.body.clientWidth || window.screen.width;

const BiogridColumns = [
  {
    title: "",
    dataIndex: "serial-number",
    render: (value, row, index) => {
      const obj = {
        children: value,
        props: {}
      };

      return obj;
    },
    width: 200
  },
  {
    title: "Location",
    name: "Location",
    dataIndex: "location",
    key: "location"
  },
  {
    title: "Protiens",
    name: "Protiens",
    dataIndex: "protiens",
    key: "protiens",
    width: 200
  },
  {
    title: "Interacting genes",
    name: "Interacting genes",
    dataIndex: "interacting-genes",
    key: "interacting-genes",
    width: 200
  },
  {
    title: "PubMed ID",
    name: "PMID",
    dataIndex: "pmid",
    key: "pmid",
    render: text => (
      <Fragment>
        {text
          .trim()
          .split(",")
          .map(t =>
            t.includes("http") ? (
              <a style={{ marginRight: 15 }} href={t} target="_blank">
                {t.slice(t.indexOf("=") + 1, t.length)}
              </a>
            ) : (
              t
            )
          )}
      </Fragment>
    )
  }
];

const PathwayColumns = [
  {
    title: "",
    dataIndex: "serial-number",
    render: (value, row, index) => {
      const obj = {
        children: value,
        props: {}
      };

      return obj;
    },
    width: 200
  },
  { title: "Gene", name: "Gene", dataIndex: "gene", key: "gene", width: 200 },
  {
    title: "Protien",
    name: "Protien",
    dataIndex: "protien",
    key: "protien",
    width: 200
  },
  {
    title: "Small molecule",
    name: "Small molecule",
    dataIndex: "small-molecule",
    key: "small-molecule"
  }
];

const GOcolumns = [
  {
    title: "",
    dataIndex: "serial-number",
    render: (value, row, index) => {
      const obj = {
        children: value,
        props: {}
      };

      return obj;
    },
    width: 200
  },
  {
    title: "GO molecular function",
    children: [
      { title: "ID", name: "ID", dataIndex: "mf-id", key: "mf-id", width: 200 },
      {
        title: "Name",
        name: "Name",
        dataIndex: "mf-name",
        key: "mf-name"
      }
    ]
  },
  {
    title: "GO biological process",
    children: [
      { title: "ID", name: "ID", dataIndex: "bp-id", key: "bp-id", width: 200 },
      {
        title: "Name",
        name: "Name",
        dataIndex: "bp-name",
        key: "bp-name"
      }
    ]
  },
  {
    title: "GO cellular component",
    children: [
      { title: "ID", name: "ID", dataIndex: "cc-id", key: "cc-id", width: 200 },
      {
        title: "Name",
        name: "Name",
        dataIndex: "cc-name",
        key: "cc-name"
      }
    ]
  }
];

function ResultTables(props) {
  const [tab, setTab] = useState(0);
  const { handleClose, tables, fetchTableData } = props;

  useEffect(() => {
    fetchTableData(tables[tab].fileName);
  }, []);

  const renderGeneGOTable = () => {
    const data = tables.find(t => t.displayName === "GO").data;
    const table = parseTable(data).data;
    const genes = table[0].slice(1).filter((g, i) => table[0].indexOf(g) === i);
    const tableData = table.slice(4);
    return (
      <Collapse>
        {genes.map((g, i) => (
          <Collapse.Panel header={g} key={g}>
            <Typography.Paragraph>{table[1][i * 6 + 1]}</Typography.Paragraph>

            <a href={`https://www.ncbi.nlm.nih.gov/gene/?term=${g}`}>
              Learn more about {g}
            </a>
            <Table
              columns={GOcolumns}
              dataSource={tableData
                .filter(row => {
                  const values = row.slice(i * 6 + 1, i * 6 + 7);
                  return (
                    values[0] ||
                    values[1] ||
                    values[2] ||
                    values[3] ||
                    values[4] ||
                    values[5]
                  );
                })
                .map((row, j) => {
                  const values = row.slice(i * 6 + 1, i * 6 + 7);
                  return {
                    key: `${g}-row-${j}`,
                    "serial-number": j + 1,
                    "mf-name": values[0] || "-",
                    "mf-id":
                      (
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/${
                            values[1]
                          }`}
                        >
                          {values[1]}
                        </a>
                      ) || "-",
                    "bp-name": values[2] || "-",
                    "bp-id":
                      (
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/${
                            values[3]
                          }`}
                        >
                          {values[3]}
                        </a>
                      ) || "-",
                    "cc-name": values[4] || "-",
                    "cc-id":
                      (
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/${
                            values[5]
                          }`}
                        >
                          {values[5]}
                        </a>
                      ) || "-"
                  };
                })}
              bordered
              size="small"
            />
          </Collapse.Panel>
        ))}
      </Collapse>
    );
  };

  const renderPathwayTable = () => {
    const data = tables.find(t => t.displayName === "PATHWAY").data;
    const table = parseTable(data).data;
    const pathways = table[0]
      .slice(1)
      .filter((g, i) => table[0].indexOf(g) === i);
    const tableData = table.slice(3);
    return (
      <Collapse>
        {pathways.map((p, i) => (
          <Collapse.Panel header={p} key={p}>
            <Typography.Paragraph>{table[1][i * 3 + 1]}</Typography.Paragraph>
            <a href={` http://www.reactome.org/content/detail/${p}`}>
              Learn more about {p}
            </a>
            <Table
              columns={PathwayColumns}
              dataSource={tableData
                .filter(row => {
                  const values = row.slice(i * 3 + 1, i * 3 + 4);
                  return values[0] || values[1] || values[2];
                })
                .map((row, j) => {
                  const values = row.slice(i * 3 + 1, i * 3 + 4);
                  const protien = values[1]
                    .trim()
                    .split(" ")
                    .filter(s => s);
                  return {
                    key: `${p}-row-${j}`,
                    "serial-number": j + 1,
                    gene: (
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/gene/?term=${
                          values[0]
                        }`}
                      >
                        {values[0]}
                      </a>
                    ),
                    protien: (
                      <Fragment>
                        {protien.length > 0 && (
                          <a
                            href={`https://www.uniprot.org/uniprot/${protien[0].slice(
                              protien.indexOf(":") + 1
                            )}`}
                            style={{ marginRight: 15 }}
                          >
                            {protien[0]}
                          </a>
                        )}
                        {protien.length > 1 && (
                          <a
                            href={`https://www.ncbi.nlm.nih.gov/gene/?term=${
                              protien[1]
                            }`}
                          >
                            {protien[1]}
                          </a>
                        )}
                      </Fragment>
                    ),
                    "small-molecule": (
                      <a
                        href={`https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${values[2].slice(
                          values[2].indexOf(":") + 1
                        )}`}
                      >
                        {values[2]}
                      </a>
                    )
                  };
                })}
              bordered
              size="small"
            />
          </Collapse.Panel>
        ))}
      </Collapse>
    );
  };

  const renderBiogridTable = () => {
    const data = tables.find(t => t.displayName === "BIOGRID").data;
    const table = parseTable(data).data;
    const pathways = table[0]
      .slice(1)
      .filter((g, i) => table[0].indexOf(g) === i);
    const tableData = table.slice(3);
    return (
      <Collapse>
        {pathways.map((p, i) => (
          <Collapse.Panel header={p} key={p}>
            <Typography.Paragraph>{table[1][i * 4 + 1]}</Typography.Paragraph>
            <a href={`https://www.ncbi.nlm.nih.gov/gene/?term=${p}`}>
              Learn more about {p}
            </a>
            <Table
              columns={BiogridColumns}
              dataSource={tableData
                .filter(row => {
                  const values = row.slice(i * 4 + 1, i * 4 + 5);
                  return values[0] || values[1] || values[2] || values[3];
                })
                .map((row, j) => {
                  const values = row.slice(i * 4 + 1, i * 4 + 5);
                  const protien = values[1]
                    .trim()
                    .split(" ")
                    .filter(s => s);
                  return {
                    key: `${p}-row-${j}`,
                    "serial-number": j + 1,
                    location: values[0] || "-",
                    protiens: (
                      <Fragment>
                        {protien.length > 0 && (
                          <a
                            href={`https://www.uniprot.org/uniprot/${protien[0].slice(
                              protien.indexOf(":") + 1
                            )}`}
                            style={{ marginRight: 15 }}
                          >
                            {protien[0]}
                          </a>
                        )}
                        {protien.length > 1 && (
                          <a
                            href={`https://www.ncbi.nlm.nih.gov/gene/?term=${
                              protien[1]
                            }`}
                          >
                            {protien[1]}
                          </a>
                        )}
                      </Fragment>
                    ),
                    "interacting-genes": (
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/gene/?term=${
                          values[2]
                        }`}
                      >
                        {values[2]}
                      </a>
                    ),
                    pmid: values[3] || "-"
                  };
                })}
              bordered
              size="small"
            />
          </Collapse.Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <Modal
      className="tables-modal"
      visible
      onCancel={handleClose}
      footer={null}
      width={width - 90}
    >
      <div className="table-tabs-wrapper">
        <Tabs
          value={tab}
          onChange={value => {
            tables[value].data || fetchTableData(tables[value].fileName);
            setTab(+value);
          }}
          tabBarExtraContent={
            tables[tab].data && (
              <Fragment>
                <Button
                  ghost
                  type="primary"
                  icon="download"
                  style={{ marginRight: 60 }}
                  size="small"
                  onClick={() =>
                    downloadCSVFile(props.match.params.id, tables[tab].fileName)
                  }
                >
                  {`Download ${tables[tab].displayName} csv`}
                </Button>
              </Fragment>
            )
          }
        >
          {tables.map((t, i) => (
            <Tabs.TabPane key={i} tab={t.displayName}>
              {t.data && t.displayName === "GO" && renderGeneGOTable()}
              {t.data && t.displayName === "PATHWAY" && renderPathwayTable()}
              {t.data && t.displayName === "BIOGRID" && renderBiogridTable()}
              {i === tab && !t.data ? (
                <div className="tabbed-table-spinner-wrapper">
                  <Spin /> Fetching table content ...
                </div>
              ) : null}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    </Modal>
  );
}

export default ResultTables;
