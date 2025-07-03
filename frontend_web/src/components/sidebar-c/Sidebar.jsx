import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Bell, Mail, Settings, User, List, Plus, LogOut, Calendar, Sun, Moon, Trash2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Bell, Mail, Settings, User, List, Plus, LogOut, Calendar, Sun, Moon, Trash2 } from 'lucide-react';
import SidebarLink from './SidebarLink';
import SidebarSection from './SidebarSection';
import { useSidebar } from '../../contexts/SidebarContext';
import ConfirmDialog from '../ConfirmDialog';
import CustomAlert from '../CustomAlert';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';


const Sidebar = ({ activeItem, onLogout, onSearchToggle }) => {
  const { handleLogout, handleDeleteAccount, checkAuth, getUserDetails } = useAuth();
  const { isCollapsed } = useSidebar();
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [alert, setAlert] = useState(null);
  const settingsRef = useRef(null);
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Function to show alerts
  const showAlert = (type, title, message, duration = 4000) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), duration);
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

  // Handle delete account confirmation
  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true);
    setShowSettings(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await handleDeleteAccount();
      setShowDeleteConfirm(false);
      showAlert('success', 'Account Deleted', result.message || 'Account deleted successfully!');
    } catch (error) {
      console.error('Error deleting account:', error);
      showAlert('error', 'Delete Failed', error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Handle logout with confirmation
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call handleLogout without confirmation since we're using custom dialog
      await handleLogout(false);
      setShowLogoutConfirm(false);
      showAlert('success', 'Logged Out', 'You have logged out successfully!');
      // Call the parent logout handler after a brief delay to show the alert
      setTimeout(() => {
        onLogout?.();
      }, 1000);
    } catch (error) {
      console.error('Error logging out:', error);
      showAlert('error', 'Logout Failed', error.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Menu items configuration
  const menuItems = [
    { id: 'dashboard', to: '/dashboard', icon: Home, label: 'Home' },
    {
      id: 'search',
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
    <>
      {/* Alert positioned at the top */}
      {alert && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          <CustomAlert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

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
                <button className="settings-item delete-account" onClick={handleDeleteAccountClick}>
                  <Trash2 size={16} />
                  {!isCollapsed && 'Delete Account'}
                  {isCollapsed && <span>Delete</span>}
                </button>
              </div>
            )}
          </div>
          <SidebarLink
            icon={LogOut}
            onClick={handleLogoutClick}
            isActive={false}
            isCollapsed={isCollapsed}
          >
            Logout
          </SidebarLink>
        </SidebarSection>
      </div>

      {/* ConfirmDialog for delete account */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
        loading={isDeleting}
        autoFocus="cancel"
      />

      {/* ConfirmDialog for logout */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Stay Logged In"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        variant="warning"
        loading={isLoggingOut}
        autoFocus="cancel"
      />
    </>
  );
};

export default Sidebar;