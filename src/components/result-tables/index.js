import React, { useState, useEffect } from "react";
import { Button, Modal, Spin, Tabs, Table, Collapse } from "antd";

import * as papa from "papaparse";
import "./style.css";

function ResultTables(props) {
  const [tab, setTab] = useState(0);
  const { handleClose, tables, fetchTableData } = props;

  useEffect(() => {
    fetchTableData(tables[tab].fileName);
  }, []);

  const parseTable = tableData => papa.parse(tableData);

  const renderGeneGOTable = () => {
    const table = parseTable(tables.find(t => t.displayName === "GO").data)
      .data;
    const keys = table[0].slice(1);
    const values = table.slice(1);
    const columns = keys.slice(3).map(c => ({
      title: c,
      dataIndex: c,
      key: c,
      width: 300
    }));
    return (
      <Collapse defaultActiveKey={["1"]}>
        {values.map(row => {
          if (row.length < keys.length) return;
          const rowData = {};
          for (let j = 0; j < columns.length; j++) {
            rowData[columns[j].key] = row.slice(2)[j + 1];
            rowData["key"] = `row${j}`;
          }
          return (
            <Collapse.Panel header={row[1]} key={row[1]}>
              <div className="table-definition-wrapper">
                <p>
                  <span className="title">Name:</span> {row[1]}
                </p>
                <p>
                  <span className="title">Definition:</span> {row[2]}
                </p>
              </div>
              <Table columns={columns} dataSource={[rowData]} size="small" />
            </Collapse.Panel>
          );
        })}
      </Collapse>
    );
  };

  const renderPathwayTable = () => {
    const table = parseTable(tables.find(t => t.displayName === "PATHWAY").data)
      .data;
    const keys = table[0].slice(1);
    const values = table.slice(1);
    const columns = keys.slice(2).map(c => ({
      title: c,
      dataIndex: c,
      key: c,
      width: 100
    }));

    return (
      <Collapse defaultActiveKey={["1"]}>
        {values.map(row => {
          if (row.length < keys.length) return;
          const rowData = {};
          for (let j = 0; j < columns.length; j++) {
            rowData[columns[j].key] = row.slice(2)[j + 1];
            rowData["key"] = `row${j}`;
          }
          return (
            <Collapse.Panel header={row[1]} key={row[1]}>
              <div className="table-definition-wrapper">
                <p>
                  <span className="title">Name:</span> {row[1]}
                </p>
                <p>
                  <span className="title">Definition:</span> {row[2]}
                </p>
              </div>
              <Table columns={columns} dataSource={[rowData]} size="small" />
            </Collapse.Panel>
          );
        })}
      </Collapse>
    );
  };

  const renderBiogridTable = () => {
    const table = parseTable(tables.find(t => t.displayName === "BIOGRID").data)
      .data;
    const columns = table[0].slice(1).map(c => ({
      title: c,
      dataIndex: c,
      key: c,
      width: 1000 / table[0].slice(1).length
    }));
    const dataSource = table.slice(1).map((r, i, self) => {
      const row = {};
      for (let j = 0; j < columns.length; j++) {
        row[columns[j].key] = r[j + 1];
        row["key"] = `${i}row${j}`;
      }
      return row;
    });
    return <Table columns={columns} dataSource={dataSource} size="small" />;
  };

  return (
    <Modal
      className="tables-modal"
      visible
      onCancel={handleClose}
      footer={null}
      width={1200}
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
