import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/BookingCSS/BookingCalendar.css';
import Button from '../../components/Button';
import { X, History } from 'lucide-react';
import Banner from '../../components/Banner';
import Sidebar from '../../components/sidebar-c/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const [userDetails, setUserDetails] = useState({ fullName: '' });

  // State for pending bookings and history
  const [pendingBookings, setPendingBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [petNames, setPetNames] = useState({});
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchConfirmedBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/bookings`, {
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
        
        const pending = response.data.filter(b => b.status === 'PENDING');
        
        setEvents(confirmed);
        setPendingBookings(pending);

        // Load pet names for pending bookings
        const uniquePetIds = [...new Set(pending.map(b => b.petId))];
        const petNameMap = await loadPetNames(uniquePetIds, token);
        setPetNames(prev => ({ ...prev, ...petNameMap }));
      } catch (error) {
        console.error('Error fetching confirmed bookings:', error);
      }
    };

    const fetchBookingHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/bookings/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBookingHistory(res.data);

        const petIds = [...new Set(res.data.map(b => b.petId))];
        const missing = petIds.filter(id => !petNames[id]);
        if (missing.length > 0) {
          const petNameMap = await loadPetNames(missing, token);
          setPetNames(prev => ({ ...prev, ...petNameMap }));
        }
      } catch (err) {
        console.error("Error fetching booking history:", err);
      }
    };

    const loadPetNames = async (ids, token) => {
      const nameMap = {};
      await Promise.all(ids.map(async (id) => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/pets/public/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          nameMap[id] = res.data.name;
        } catch {
          nameMap[id] = 'Unknown Pet';
        }
      }));
      return nameMap;
    };

    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user;
        setUserDetails({ fullName: `${user.firstName} ${user.lastName}` });
      } catch (e) {
        console.error("Error fetching user details:", e);
      }
    };

    fetchConfirmedBookings();
    fetchBookingHistory();
    fetchUser();
  }, []);

  const handleSearchToggle = () => navigate("/dashboard");
  const toggleHistoryModal = () => setIsHistoryModalOpen(prev => !prev);

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
            
            {/* Pending Bookings Section */}
            <div className="calendar-pending-bookings-section">
              <h3 className="calendar-section-title">Pending Bookings</h3>
              {pendingBookings.length === 0 ? (
                <p className="calendar-no-data">No pending bookings.</p>
              ) : (
                <>
                  {/* Column Headers */}
                  <div className="calendar-pending-headers">
                    <div>Title</div>
                    <div>Date</div>
                    <div>Pet</div>
                    <div>Status</div>
                  </div>
                  
                  {/* Pending Items List */}
                  <ul className="calendar-pending-list">
                    {pendingBookings.map(b => (
                      <li key={b.bookingId} className="calendar-pending-item">
                        <span className="booking-title">{b.title}</span>
                        <span className="booking-date">{new Date(b.date).toLocaleString()}</span>
                        <span className="booking-pet">{petNames[b.petId] || 'Loading...'}</span>
                        <span className={`booking-status ${b.status.toLowerCase()}`}>{b.status}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* History Button */}
            <div class="button-wrapper">
              <Button onClick={toggleHistoryModal} icon={History} className='calendar-history-button'>
                View History
              </Button>
            </div>

            {/* History Modal */}
            {isHistoryModalOpen && (
              <div className="calendar-history-modal-backdrop">
                <div className="calendar-history-modal-container">
                  <div className="calendar-history-modal-header">
                    <h3>Booking History</h3>
                    <button onClick={toggleHistoryModal} className="calendar-close-button">
                      <X size={20} />
                    </button>
                  </div>
                  {bookingHistory.length === 0 ? (
                    <p className="calendar-no-data">No booking history.</p>
                  ) : (
                    <table className="calendar-history-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th>Pet</th>
                          <th>Status</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingHistory.map(b => (
                          <tr key={b.bookingId}>
                            <td>{b.title}</td>
                            <td>{new Date(b.date).toLocaleString()}</td>
                            <td>{petNames[b.petId] || 'Loading...'}</td>
                            <td className={`booking-status ${b.status.toLowerCase()}`}>{b.status}</td>
                            <td>{b.userId === localStorage.getItem('userId') ? 'Requester' : 'Owner'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;