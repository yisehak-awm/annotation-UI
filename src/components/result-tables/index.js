import React, { useState, useEffect } from "react";
import { Button, Modal, Spin, Tabs, Table, Collapse, Typography } from "antd";
import * as papa from "papaparse";
import "./style.css";

const parseTable = tableData => papa.parse(tableData);
const width = document.body.clientWidth || window.screen.width;

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
    }
  },
  {
    title: "GO molecular function",
    children: [
      { title: "ID", name: "ID", dataIndex: "mf-id", key: "mf-id", width: 100 },
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
      { title: "ID", name: "ID", dataIndex: "bp-id", key: "bp-id", width: 100 },
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
      { title: "ID", name: "ID", dataIndex: "cc-id", key: "cc-id", width: 100 },
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
            <Table
              columns={GOcolumns}
              dataSource={tableData.map((row, j) => {
                const values = row.slice(i * 6 + 1, i * 6 + 7);
                return {
                  key: `${g}-row-${j}`,
                  "serial-number": j + 1,
                  "mf-name": values[0] || "-",
                  "mf-id": values[1] || "-",
                  "bp-name": values[2] || "-",
                  "bp-id": values[3] || "-",
                  "cc-name": values[4] || "-",
                  "cc-id": values[5] || "-"
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
    return "Pathway table is under construction.";
  };

  const renderBiogridTable = () => {
    return "Biogrid table is under construction.";
  };

  // const renderPathwayTable = () => {
  //   const table = parseTable(tables.find(t => t.displayName === "PATHWAY").data)
  //     .data;
  //   const keys = table[0].slice(1);
  //   const values = table.slice(1);
  //   const columns = keys.slice(2).map(c => ({
  //     title: c,
  //     dataIndex: c,
  //     key: c,
  //     width: 100
  //   }));

  //   return (
  //     <Collapse defaultActiveKey={["1"]}>
  //       {values.map(row => {
  //         if (row.length < keys.length) return;
  //         const rowData = {};
  //         for (let j = 0; j < columns.length; j++) {
  //           rowData[columns[j].key] = row.slice(2)[j + 1];
  //           rowData["key"] = `row${j}`;
  //         }
  //         return (
  //           <Collapse.Panel header={row[1]} key={row[1]}>
  //             <div className="table-definition-wrapper">
  //               <p>
  //                 <span className="title">Name:</span> {row[1]}
  //               </p>
  //               <p>
  //                 <span className="title">Definition:</span> {row[2]}
  //               </p>
  //             </div>
  //             <Table columns={columns} dataSource={[rowData]} size="small" />
  //           </Collapse.Panel>
  //         );
  //       })}
  //     </Collapse>
  //   );
  // };

  // const renderBiogridTable = () => {
  //   const table = parseTable(tables.find(t => t.displayName === "BIOGRID").data)
  //     .data;
  //   const columns = table[0].slice(1).map(c => ({
  //     title: c,
  //     dataIndex: c,
  //     key: c,
  //     width: 1000 / table[0].slice(1).length
  //   }));
  //   const dataSource = table.slice(1).map((r, i, self) => {
  //     const row = {};
  //     for (let j = 0; j < columns.length; j++) {
  //       row[columns[j].key] = r[j + 1];
  //       row["key"] = `${i}row${j}`;
  //     }
  //     return row;
  //   });
  //   return <Table columns={columns} dataSource={dataSource} size="small" />;
  // };

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
              <Button
                ghost
                type="primary"
                icon="download"
                style={{ marginRight: 60 }}
                size="small"
                onClick={() => downloadCSVFile(tables[tab].fileName)}
              >
                {`Download ${tables[tab].displayName} data`}
              </Button>
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
