import React, { Fragment } from "react";
import { Divider } from "antd";
import logo from "../../assets/mozi_globe.png";

import "./style.css";

function Header(props) {
  return (
    <Fragment>
      <div className="header">
        <img src={logo} className="logo" />
        <span className="title">Gene annotation service</span>
      </div>
      <Divider />
    </Fragment>
  );
}

export default Header;
