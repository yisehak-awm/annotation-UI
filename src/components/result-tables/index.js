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
    title: "Interacting features",
    name: "Interacting features",
    dataIndex: "interacting-features",
    key: "interacting-features",
    width: 200
  },
  {
    title: "PubMed ID",
    name: "PMID",
    dataIndex: "pmid",
    key: "pmid",
    render: text => (
      <Fragment>
        {console.log(text)}
        {text
          .trim()
          .split("\n")
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

function getPathwayColumns(numberOfColumns, cols) {
  const columns = [
    {
      title: "",
      dataIndex: "serial-number",
      width: 200
    }
  ];
  for (let i = 0; i < numberOfColumns; i++) {
    columns.push({
      title: cols[i],
      name: cols[i],
      dataIndex: `col${i}`,
      key: `col${i}`
    });
  }
  return columns;
}

function getGOColumns(numberOfColumns, cols) {
  const columns = [
    {
      title: "",
      dataIndex: "serial-number",
      width: 200
    }
  ];
  for (let i = 0; i < numberOfColumns; i = i + 2) {
    columns.push({
      title: cols[i],
      children: [
        {
          title: "ID",
          name: "ID",
          dataIndex: `col${i}-id`,
          key: `col${i}-id`,
          width: 200
        },
        {
          title: "Name",
          name: "Name",
          dataIndex: `col${i}-name`,
          key: `col${i}-name`
        }
      ]
    });
  }
  return columns;
}

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
    const numberOfColumns = table[0].slice(1).length / genes.length;
    const columns = getGOColumns(numberOfColumns, table[2].slice(1));
    return (
      <Collapse>
        {genes.map((g, i) => (
          <Collapse.Panel header={g} key={g}>
            <Typography.Paragraph>
              {table[1][i * numberOfColumns + 1]}
            </Typography.Paragraph>

            <a href={`https://www.ncbi.nlm.nih.gov/gene/?term=${g}`}>
              Learn more about {g}
            </a>
            <Table
              columns={columns}
              dataSource={tableData
                .filter(row => {
                  const values = row.slice(
                    i * numberOfColumns + 1,
                    i * numberOfColumns + (numberOfColumns + 1)
                  );
                  return values.some(v => v);
                })
                .map((row, j) => {
                  const values = row.slice(
                    i * numberOfColumns + 1,
                    i * numberOfColumns + (numberOfColumns + 1)
                  );
                  return {
                    key: `${g}-row-${j}`,
                    "serial-number": j + 1,
                    "col0-name": values[0] || "-",
                    "col0-id":
                      (
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/${
                            values[1]
                          }`}
                        >
                          {values[1]}
                        </a>
                      ) || "-",
                    "col2-name": values[2] || "-",
                    "col2-id":
                      (
                        <a
                          href={`http://amigo.geneontology.org/amigo/term/${
                            values[3]
                          }`}
                        >
                          {values[3]}
                        </a>
                      ) || "-",
                    "col4-name": values[4] || "-",
                    "col4-id":
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
    const numberOfColumns = table[0].slice(1).length / pathways.length;
    const columns = getPathwayColumns(numberOfColumns, table[2].slice(1));
    return (
      <Collapse>
        {pathways.map((p, i) => (
          <Collapse.Panel header={p} key={p}>
            <Typography.Paragraph>
              {table[1][i * numberOfColumns + 1]}
            </Typography.Paragraph>
            <a href={` http://www.reactome.org/content/detail/${p}`}>
              Learn more about {p}
            </a>
            <Table
              columns={columns}
              dataSource={tableData
                .filter(row => {
                  const values = row.slice(
                    i * numberOfColumns + 1,
                    i * numberOfColumns + (numberOfColumns + 1)
                  );
                  return values.some(v => v);
                })
                .map((row, j) => {
                  const values = row.slice(
                    i * numberOfColumns + 1,
                    i * numberOfColumns + (numberOfColumns + 1)
                  );
                  const protien = values[1]
                    .trim()
                    .split(" ")
                    .filter(s => s);
                  return {
                    key: `${p}-row-${j}`,
                    "serial-number": j + 1,
                    col0: (
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/gene/?term=${
                          values[0]
                        }`}
                      >
                        {values[0]}
                      </a>
                    ),
                    col1: (
                      <Fragment>
                        {protien.length > 0 && (
                          <a
                            href={`https://www.uniprot.org/uniprot/${protien[0].slice(
                              protien[0].indexOf(":") + 1
                            )}`}
                            style={{ marginRight: 15 }}
                          >
                            {protien[0].slice(protien[0].indexOf(":") + 1)}
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
                    col2: values[2] ? (
                      <a
                        href={`https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${values[2].slice(
                          values[2].indexOf(":") + 1
                        )}`}
                      >
                        {values[2]}
                      </a>
                    ) : (
                      values[2]
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
          <Collapse.Panel
            header={p.includes("Uniprot") ? p.slice(p.indexOf(":") + 1) : p}
            key={p}
          >
            <Typography.Paragraph>{table[1][i * 3 + 1]}</Typography.Paragraph>
            {p.includes("Uniprot") ? (
              <a
                href={`https://www.uniprot.org/uniprot/${p.slice(
                  p.indexOf(":") + 1
                )}`}
              >
                Learn more about {p.slice(p.indexOf(":") + 1)}
              </a>
            ) : (
              <a href={`https://www.ncbi.nlm.nih.gov/gene/?term=${p}`}>
                Learn more about {p}
              </a>
            )}
            <Table
              columns={BiogridColumns}
              dataSource={tableData
                .filter(row => {
                  const values = row.slice(i * 3 + 1, i * 3 + 4);
                  return values[0] || values[1] || values[2] || values[3];
                })
                .map((row, j) => {
                  const values = row.slice(i * 3 + 1, i * 3 + 4);
                  return {
                    key: `${p}-row-${j}`,
                    "serial-number": j + 1,
                    location: values[0] || "-",
                    "interacting-features": values[1].includes("Uniprot") ? (
                      <a
                        href={`https://www.uniprot.org/uniprot/${values[1].slice(
                          values[1].indexOf(":") + 1
                        )}`}
                      >
                        {values[1].slice(values[1].indexOf(":") + 1)}
                      </a>
                    ) : (
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/gene/?term=${
                          values[1]
                        }`}
                      >
                        {values[1]}
                      </a>
                    ),
                    pmid: values[2] || "-"
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
                    downloadCSVFile(props.id, tables[tab].fileName)
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
