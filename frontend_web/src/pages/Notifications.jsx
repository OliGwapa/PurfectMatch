import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useWebSocket } from './useWebSocket';
import NotificationPopup from './NotificationPopup';
import Banner from '../components/Banner';
import Sidebar from '../components/sidebar-c/Sidebar';
import { useAuth } from '../hooks/useAuth';
import '../styles/Notifications.css';
import { useNotifications } from '../hooks/useNotifications';
 
const Notifications = () => {
  const { handleLogout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const firstName = localStorage.getItem("firstName") || '';
 
  const token = localStorage.getItem('token');
  let userId = null;
 
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.sub; // Extract userId from JWT 'sub' claim
    } catch (error) {
      console.error('Failed to decode JWT:', error);
    }
  }
 
  // Fetch initial notifications
  useEffect(() => {
    if (!token) {
      console.warn('No token found, skipping notification fetch');
      return;
    }
 
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to load notifications:', error.response?.data || error.message);
      }
    };
    fetchNotifications();
  }, [token]);
 
  // Handle new notifications via WebSocket
  const handleNotification = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
  };
 
  useWebSocket(handleNotification);
 
  // Approve/reject booking requests
  const handleAction = async (bookingId, action) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) => prev.filter((n) => n.link !== bookingId));
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error.response?.data, error.message);
      alertSuccess(`Failed to ${action} booking: ${error.response?.data?.message || error.message}`);
    }
  };
 
  // Mark notifications as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error.response?.data || error.message);
    }
  };
 
  return (
    <div className="home-wrapper">
      <Banner firstName={firstName} />
 
      <div className="main-content">
        <Sidebar activeItem="notifications" onLogout={handleLogout} />
 
        <div className="center-content">
          <div className="notifications-container">
            <header className="notifications-header">
              <Bell size={55} className="icon" />
              <h2>Notifications</h2>
              <NotificationPopup />
            </header>
 
            {notifications.length === 0 ? (
              <p className="empty-state">No notifications found</p>
            ) : (
              <ul className="notifications-list">
                {notifications.map((notification) => (
                  <li
                    key={notification.notificationId}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => markAsRead(notification.notificationId)}
                  >
                    <p className="notification-message">{notification.message}</p>
                    {notification.type === 'BOOKING_REQUEST' && (
                      <div className="action-buttons">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(notification.link, 'approve');
                          }}
                          className="approve-btn"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(notification.link, 'reject');
                          }}
                          className="reject-btn"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Notifications;