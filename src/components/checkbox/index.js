import React from "react";
import "./style.css";

function Checkbox({ label, id, onClick, defaultValue }) {
  return (
    <div className="si si-checkbox">
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

export default Checkbox;
