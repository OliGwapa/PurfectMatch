import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import './Banner.css';
import logo from '../../assets/Logo1.png';
import { Link } from 'react-router-dom';

export default function Banner({ firstName = "User", onLogout }) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="banner">
      <div className="banner-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        <Link to="/dashboard"> 
          <img src={logo} alt="Logo" className="logo" />
        </Link>
        <span className="greeting">Hello, {firstName}!</span>
      </div>
    </div>
  );
}