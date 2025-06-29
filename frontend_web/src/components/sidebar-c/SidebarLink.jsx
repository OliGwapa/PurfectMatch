import React from 'react';
import { Link } from 'react-router-dom';

const SidebarLink = ({ to, icon: Icon, children, isActive, onClick, isCollapsed }) => {
  const className = isActive ? 'active' : '';
  
  if (onClick) {
    return (
      <a onClick={onClick} style={{ cursor: 'pointer' }} className={className}>
        <Icon size={20} />
        <span className="link-text">{children}</span>
      </a>
    );
  }
  
  return (
    <Link to={to} className={className}>
      <Icon size={20} />
      <span className="link-text">{children}</span>
    </Link>
  );
};

export default SidebarLink;