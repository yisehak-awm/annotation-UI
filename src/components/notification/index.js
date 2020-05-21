import React, { useState, useEffect } from "react";
import "./style.css";

const Classes = {
  default: "",
  error: "error",
};

function Notification({
  duration,
  title,
  message,
  okText,
  onClose,
  type = "default",
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    if (duration) {
      const closeTimer = setTimeout(close, duration - 200);
      return () => clearTimeout(closeTimer);
    }
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 200);
  };

  return (
    <div className={`y-notification ${Classes[type]} ${visible && "visible"}`}>
      <span className="title">{title}</span>
      <span className="message">{message}</span>
      <button onClick={close}>{okText || "Ok"}</button>
    </div>
  );
}

export default Notification;
