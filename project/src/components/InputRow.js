import React from 'react';

const InputRow = ({ label, unit, children, fullWidth = false }) => {
  return (
    <div className={`input-row ${fullWidth ? 'full-width' : ''}`}>
      <label className="input-label">
        {label}
        {unit && <span className="input-label-unit">({unit})</span>}
      </label>
      {children}
    </div>
  );
};

export default InputRow;