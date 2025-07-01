import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Bell, Mail, Settings, User, Plus, LogOut, Calendar, Sun, Moon, Trash2 } from 'lucide-react';
import SidebarLink from './SidebarLink';
import SidebarSection from './SidebarSection';
import { useSidebar } from './SidebarContext';
import './Sidebar.css';

const Sidebar = ({ activeItem, onLogout, onSearchToggle }) => {
  const { isCollapsed } = useSidebar();
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const settingsRef = useRef(null);
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      console.log("Deleting account...");
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Menu items configuration
  const menuItems = [
    { id: 'dashboard', to: '/dashboard', icon: Home, label: 'Home' },
    {
      id: 'search',
      // Use onClick for search instead of navigation
      onClick: onSearchToggle,
      icon: Search,
      label: 'Search'
    },
    { id: 'notifications', to: '/notifications', icon: Bell, label: 'Notifications' },
    { id: 'messages', to: '/messages', icon: Mail, label: 'Messages' },
    { id: 'bookings', to: '/bookings', icon: Calendar, label: 'Bookings' },
  ];

  const petItems = [
    { id: 'profile', to: '/profile', icon: User, label: 'Profile' },
    { id: 'add-pet', to: '/add-pet', icon: Plus, label: 'Add Pet' },
  ];

  const accountItems = [
    { 
      id: 'settings', 
      onClick: () => setShowSettings(prev => !prev), 
      icon: Settings, 
      label: 'Settings' 
    }
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <SidebarSection title="Menu" isCollapsed={isCollapsed}>
        {menuItems.map(item => (
          <SidebarLink
            key={item.id}
            to={item.to}
            icon={item.icon}
            isActive={activeItem === item.id}
            onClick={item.onClick}
            isCollapsed={isCollapsed}
          >
            {item.label}
          </SidebarLink>
        ))}
      </SidebarSection>
     
      <SidebarSection title="Pets" isCollapsed={isCollapsed}>
        {petItems.map(item => (
          <SidebarLink
            key={item.id}
            to={item.to}
            icon={item.icon}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
          >
            {item.label}
          </SidebarLink>
        ))}
      </SidebarSection>
     
      <SidebarSection title="Account" isCollapsed={isCollapsed}>
        <div className="settings-container" ref={settingsRef}>
          {accountItems.map(item => (
            <SidebarLink
              key={item.id}
              to={item.to}
              icon={item.icon}
              isActive={activeItem === item.id}
              onClick={item.onClick}
              isCollapsed={isCollapsed}
            >
              {item.label}
            </SidebarLink>
          ))}
          {showSettings && (
            <div className="settings-dropdown">
              <button className="settings-item" onClick={toggleDarkMode}>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {!isCollapsed && (darkMode ? 'Light Mode' : 'Dark Mode')}
                {isCollapsed && <span>{darkMode ? 'Light' : 'Dark'}</span>}
              </button>
              <button className="settings-item delete-account" onClick={handleDeleteAccount}>
                <Trash2 size={16} />
                {!isCollapsed && 'Delete Account'}
                {isCollapsed && <span>Delete</span>}
              </button>
            </div>
          )}
        </div>
        <SidebarLink
          icon={LogOut}
          onClick={onLogout}
          isActive={false}
          isCollapsed={isCollapsed}
        >
          Logout
        </SidebarLink>
      </SidebarSection>
    </div>
  );
};

export default Sidebar;