import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { X, History } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../styles/BookingCalendar.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Banner from '../components/Banner';
import Sidebar from '../components/sidebar-c/Sidebar';
import { useAuth } from '../hooks/useAuth'; // if you want logout support

const localizer = momentLocalizer(moment);

const BookingCalendar = () => {
  const { handleLogout } = useAuth(); // Optional, based on your hook
  const { state } = useLocation();
  const navigate = useNavigate();
  const petId = state?.petId || '';
  const petName = state?.petName || 'Unknown Pet';
  const [events, setEvents] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [petNames, setPetNames] = useState({});
  const [newBooking, setNewBooking] = useState({
    petId: petId,
    date: '',
    title: '',
    status: 'PENDING',
  });
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ fullName: '' });

  useEffect(() => {
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
    fetchUser();
  }, []);

  useEffect(() => {
      if (!petId) {
        navigate('/bookings');
      }
    }, [petId, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
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
            petId: booking.petId,
          }));
        const pending = response.data.filter(booking => booking.status === 'PENDING');
        setEvents(confirmed);
        setPendingBookings(pending);

        const uniquePetIds = [...new Set(pending.map(booking => booking.petId))];
        const petNamePromises = uniquePetIds.map(async (id) => {
          try {
            const petResponse = await axios.get(`http://localhost:8080/pets/public/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { petId: id, name: petResponse.data.name };
          } catch (error) {
            console.error(`Error fetching pet ${id}:`, error);
            return { petId: id, name: 'Unknown Pet' };
          }
        });
        const petNameResults = await Promise.all(petNamePromises);
        const newPetNames = petNameResults.reduce((acc, { petId, name }) => {
          acc[petId] = name;
          return acc;
        }, {});
        setPetNames((prev) => ({ ...prev, ...newPetNames }));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    const fetchBookingHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/bookings/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookingHistory(response.data);

        const uniquePetIds = [...new Set(response.data.map(booking => booking.petId))];
        const newPetIds = uniquePetIds.filter(id => !petNames[id]);
        if (newPetIds.length > 0) {
          const petNamePromises = newPetIds.map(async (id) => {
            try {
              const petResponse = await axios.get(`http://localhost:8080/pets/public/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return { petId: id, name: petResponse.data.name };
            } catch (error) {
              console.error(`Error fetching pet ${id}:`, error);
              return { petId: id, name: 'Unknown Pet' };
            }
          });
          const petNameResults = await Promise.all(petNamePromises);
          const newPetNames = petNameResults.reduce((acc, { petId, name }) => {
            acc[petId] = name;
            return acc;
          }, {});
          setPetNames((prev) => ({ ...prev, ...newPetNames }));
        }
      } catch (error) {
        console.error('Error fetching booking history:', error);
      }
    };

    fetchBookings();
    fetchBookingHistory();
  }, []);

  useEffect(() => {
    setNewBooking((prev) => ({ ...prev, petId }));
  }, [petId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking({ ...newBooking, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        ...newBooking,
        date: new Date(newBooking.date).toISOString(),
      };
      const response = await axios.post(`http://localhost:8080/api/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingBookings([...pendingBookings, response.data]);
      setBookingHistory([...bookingHistory, response.data]);
      setPetNames((prev) => ({ ...prev, [response.data.petId]: petName }));
      setNewBooking({ petId, date: '', title: '', status: 'PENDING' });
      alert('Booking request submitted successfully!');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(`Error creating booking: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
  };

  const handleSearchToggle = () => navigate("/dashboard");

  return (
    <div className="home-wrapper">
      <Banner firstName={userDetails.fullName.split(' ')[0] || 'User'} />
      <div className="main-content">
        <Sidebar activeItem="bookings" onLogout={handleLogout} onSearchToggle={handleSearchToggle} />
        <div className="center-content expanded">
          <div className="booking-calendar-container">
            <div className="booking-header">
              <h2 className="section-title">Book an Appointment for {petName}</h2>
            </div>
            <div className="booking-grid">
              <div className="booking-column">
                <div className="booking-card">
                  <h3 className="card-title">New Booking</h3>
                  <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                      <label htmlFor="date">Date and Time</label>
                      <input
                        type="datetime-local"
                        id="date"
                        name="date"
                        value={newBooking.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="title">Title</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newBooking.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Breeding Appointment"
                      />
                    </div>
                    <button type="submit" className="submit-button">Request Booking</button>
                  </form>
                </div>

                <div className="booking-card">
                  <h3 className="card-title">Pending Bookings</h3>
                  {pendingBookings.length === 0 ? (
                    <p className="no-data">No pending bookings.</p>
                  ) : (
                    <ul className="booking-list">
                      {pendingBookings.map(b => (
                        <li key={b.bookingId} className="booking-item">
                          <span>{b.title}</span>
                          <span>{new Date(b.date).toLocaleString()}</span>
                          <span>Pet: {petNames[b.petId] || 'Loading...'}</span>
                          <span className={`status ${b.status.toLowerCase()}`}>{b.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <button onClick={toggleHistoryModal} className="history-button">
              <History size={10} /> View History
            </button>

            {isHistoryModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Booking History</h3>
                    <button onClick={toggleHistoryModal} className="close-button">
                      <X size={20} />
                    </button>
                  </div>
                  {bookingHistory.length === 0 ? (
                    <p className="no-data">No booking history.</p>
                  ) : (
                    <table className="history-table">
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
                            <td className={`status ${b.status.toLowerCase()}`}>{b.status}</td>
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
