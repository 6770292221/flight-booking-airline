import React from "react";
import "./ConfirmationPopup.css";

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <h3>{message}</h3>
        <div className="confirmation-buttons">
          <button className="btn-confirm" onClick={onConfirm}>
            Confirm
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
