import React from 'react';

const ResultRow = ({ label, value, unit, highlight = false, important = false }) => {
  let className = 'result-row';
  if (important) className += ' important';
  else if (highlight) className += ' highlight';

  return (
    <div className={className}>
      <span className="result-label">{label}</span>
      <span className="result-value">
        {value}
        {unit && <span className="result-unit">{unit}</span>}
      </span>
    </div>
  );
};

export default ResultRow;