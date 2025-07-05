import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../components/PetModal.css";
import Button from '../../components/Button';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNotifications } from '../../hooks/useNotifications';

const BookingPage = ({ petId: propPetId, petName: propPetName, onClose }) => {
  const location = useLocation();
  const { alertSuccess, alertError } = useNotifications();

  const petId = propPetId || location.state?.petId || '';
  const petName = propPetName || location.state?.petName || 'Unknown Pet';

  const [newBooking, setNewBooking] = useState({
    petId: petId,
    date: '',
    title: '',
    status: 'PENDING',
  });

  if (!petId) {
    return <p>No pet selected. Please go back and select a pet.</p>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBooking.petId) {
      alertSuccess("Missing pet ID. Please go back and select a pet.");
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

      setNewBooking({ petId, date: '', title: '', status: 'PENDING' });

      alertSuccess("Booking request submitted successfully!");
    } catch (err) {
      console.error("Error creating booking:", err);
      alertError(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="appointment-management-wrapper">
      {onClose && (
        <button onClick={onClose} className="close-button">
            <X size={20} />
        </button>
      )}

      <div className="pet-appointment-header">
        <h2 className="section-title">Book an Appointment for {petName}</h2>
      </div>

      <div className="appointment-dashboard-layout">
        <div className="appointment-forms-section">
          <div className="new-booking-panel">
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

              <Button type="submit" className="submit-button">
                Request Booking
              </Button>
            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default BookingPage;