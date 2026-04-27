import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Section = ({ title, icon, children, collapsible = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`section-card ${className}`}>
      <div
        className="section-header"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
      >
        <div className="section-title-group">
          <div className="section-icon">{icon}</div>
          <h2 className="section-title">{title}</h2>
        </div>
        {collapsible && (
          <ChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
        )}
      </div>
      {isOpen && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default Section;