import React from "react";
import "./style.css";

function Switch({ label, id, onClick, defaultValue }) {
  return (
    <div className="si si-switcher">
      <input
        defaultChecked={defaultValue}
        type="checkbox"
        id={id}
        onClick={onClick}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default Switch;
