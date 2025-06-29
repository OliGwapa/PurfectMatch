import React from 'react';

const SidebarSection = ({ title, children, isCollapsed }) => {
  return (
    <div className="sidebar-section">
      <h4>{title}</h4>
      {children}
    </div>
  );
};

export default SidebarSection;