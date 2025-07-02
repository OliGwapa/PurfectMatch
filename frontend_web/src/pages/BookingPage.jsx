import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { X, History } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../styles/BookingPage.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const BookingPage = ({ petId: propPetId, petName: propPetName, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const petId = propPetId || location.state?.petId || '';
  const petName = propPetName || location.state?.petName || 'Unknown Pet';

  const [events, setEvents] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [petNames, setPetNames] = useState({});
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    petId: petId,
    date: '',
    title: '',
    status: 'PENDING',
  });

  if (!petId) {
    return <p>No pet selected. Please go back and select a pet.</p>;
  }

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const confirmed = res.data
          .filter(booking => booking.status === 'CONFIRMED')
          .map(booking => ({
            id: booking.bookingId,
            title: booking.title,
            start: new Date(booking.date),
            end: new Date(booking.date),
            petId: booking.petId,
          }));

        const pending = res.data.filter(b => b.status === 'PENDING');

        setEvents(confirmed);
        setPendingBookings(pending);

        const uniquePetIds = [...new Set(pending.map(b => b.petId))];
        const petNameMap = await loadPetNames(uniquePetIds, token);
        setPetNames(prev => ({ ...prev, ...petNameMap }));
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    const fetchBookingHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/history`, {
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
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/pets/public/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          nameMap[id] = res.data.name;
        } catch {
          nameMap[id] = 'Unknown Pet';
        }
      }));
      return nameMap;
    };

    fetchBookings();
    fetchBookingHistory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBooking.petId) {
      alert("Missing pet ID. Please go back and select a pet.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newBooking,
        date: new Date(newBooking.date).toISOString(),
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const created = res.data;

      setPendingBookings(prev => [...prev, created]);
      setBookingHistory(prev => [...prev, created]);
      setPetNames(prev => ({ ...prev, [created.petId]: petName }));
      setNewBooking({ petId, date: '', title: '', status: 'PENDING' });

      alert("Booking request submitted successfully!");
    } catch (err) {
      console.error("Error creating booking:", err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const toggleHistoryModal = () => setIsHistoryModalOpen(prev => !prev);

  return (
    <div className="booking-calendar-container">
      {onClose && (
        <button onClick={onClose} className="close-button">
            <X size={20} />
        </button>
        )}
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
        <History size={20} /> View History
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
  );
};

export default BookingPage;
