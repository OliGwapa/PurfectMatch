import React from 'react';
import { Home, Search, Bell, Mail, Settings, User, List, Plus, LogOut } from 'lucide-react';
import SidebarLink from './SidebarLink';
import SidebarSection from './SidebarSection';
import { useSidebar } from './SidebarContext';
import './Sidebar.css';

const Sidebar = ({ activeItem, onLogout, onSearchToggle }) => {
  const { isCollapsed } = useSidebar();

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
    { id: 'messages', to: '/messages', icon: Mail, label: 'Messages' }
  ];

  const petItems = [
    { id: 'profile', to: '/profile', icon: User, label: 'Profile' },
    { id: 'pet-list', to: '/pet-list', icon: List, label: 'My Pet List' },
    { id: 'add-pet', to: '/add-pet', icon: Plus, label: 'Add Pet' }
  ];

  const accountItems = [
    { id: 'settings', to: '/settings', icon: Settings, label: 'Settings' }
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
        {accountItems.map(item => (
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