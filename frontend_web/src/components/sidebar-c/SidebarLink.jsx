import React from 'react';
import { Link } from 'react-router-dom';

const SidebarLink = ({ to, icon: Icon, children, isActive, onClick }) => {
  const className = isActive ? 'active' : '';
  
  if (onClick) {
    return (
      <a onClick={onClick} style={{ cursor: 'pointer' }} className={className}>
        <Icon size={20} /> {children}
      </a>
    );
  }
  
  return (
    <Link to={to} className={className}>
      <Icon size={20} /> {children}
    </Link>
  );
};

export default SidebarLink;