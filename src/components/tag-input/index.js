import React from "react";
import "./style.css";

function TagInput({ onChange, placeholder, tags = [] }) {
  const handleChange = (e) => {
    //   listen for enter or space
    if ((e.which === 13 || e.which === 32) && e.target.value.trim() !== "") {
      onChange([...tags, e.target.value.toUpperCase()]);
      e.target.value = "";
    }
    // listen for backspace
    if (e.which === 8 && e.target.value.trim() === "" && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTags = (i) => {
    onChange(tags.filter((t) => tags.indexOf(t) !== i));
  };

  return (
    <div className="tags-input">
      {tags.map((t, i) => (
        <div className="tag" key={i}>
          <span className="tag-title">{t}</span>
          <span className="tag-close-icon" onClick={() => removeTags(i)}>
            X
          </span>
        </div>
      ))}

      <input
        type="text"
        onKeyUp={handleChange}
        placeholder={placeholder || "Press enter to add tags"}
      />
    </div>
  );
}

export default TagInput;
