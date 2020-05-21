import React from "react";
import "./style.css";

function Uploader({ label, id, onFileUpload, multiple, accept }) {
  const onChange = (e) => {
    const fileList = e.target.files;
    if (!fileList.length) return;
    const reader = new FileReader();
    reader.onload = (e) => onFileUpload(e.target.result);
    reader.onerror = (error) => alert(error);
    reader.readAsText(fileList[0]);
  };

  return (
    <div className="si si-uploader">
      <input
        type="file"
        id={id}
        multiple={multiple}
        accept={accept}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default Uploader;
