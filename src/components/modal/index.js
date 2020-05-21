import React, { useState, useEffect } from "react";
import "./style.css";

function Modal({ title, message, onClose, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const close = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className={`y-modal ${visible && "visible"}`}>
      <span className="title">{title}</span>
      <div className="content">{children}</div>
    </div>
  );
}

export default Modal;
