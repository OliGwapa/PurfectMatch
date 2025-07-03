import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/BookingCalendar.css';
import Banner from '../components/Banner';
import Sidebar from '../components/sidebar-c/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Optional, if you want logout

const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
  const { handleLogout } = useAuth(); // Optional
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const [userDetails, setUserDetails] = useState({ fullName: '' });

  useEffect(() => {
    const fetchConfirmedBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const confirmed = response.data
          .filter(booking => booking.status === 'CONFIRMED')
          .map(booking => ({
            id: booking.bookingId,
            title: booking.title,
            start: new Date(booking.date),
            end: new Date(booking.date),
          }));
        setEvents(confirmed);
      } catch (error) {
        console.error('Error fetching confirmed bookings:', error);
      }
    };

    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get("http://localhost:8080/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user;
        setUserDetails({ fullName: `${user.firstName} ${user.lastName}` });
      } catch (e) {
        console.error("Error fetching user details:", e);
      }
    };

    fetchConfirmedBookings();
    fetchUser();
  }, []);

  const handleSearchToggle = () => navigate("/dashboard");

  return (
    <div className="home-wrapper">
      <Banner firstName={userDetails.fullName.split(' ')[0] || 'User'} />
      <div className="main-content">
        <Sidebar activeItem="bookings" onLogout={handleLogout} onSearchToggle={handleSearchToggle} />
        <div className="center-content expanded">
          <div className="booking-calendar-container">
            <h2 className="section-title">Booking Calendar</h2>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              className="booking-calendar"
              date={currentDate}
              view={currentView}
              onNavigate={date => setCurrentDate(date)}
              onView={view => setCurrentView(view)}
              eventPropGetter={() => ({
                className: 'custom-event'
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;