import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './LandingPages/LandingPage';
import Login from './LandingPages/Login';
import Signup from './LandingPages/SignUp';
import ForgotPassword from './LandingPages/ForgotPassword';
import AdminDashboard from './admin/AdminDashboard';
import Dashboard from './HomePages/Dashboard'; // Import your Dashboard component
import ProtectedRoute from './ProtectedRoute'; // Import your ProtectedRoute component
import UserProfile from './ProfilePages/UserProfile'; // Import User Profile
import EditUserProfile from './ProfilePages/EditUserProfile'; // Import EditUserProfile
import AddPet from './ProfilePages/AddPet'; // Import AddPet
import Messages from './HomePages/Messages'; // Import Messages
import BookingCalendar from './BookingPages/BookingCalendar'; // Import BookingCalendar
import Notifications from './NotificationPage/Notifications'; // Import Notifications
import EditPet from './ProfilePages/EditPet'; // Import EditPet
import BookingPage from './BookingPages/BookingPage'; // Import BookingPage
import About from './LandingPages/About'; // Adjust path if needed

 
export default function TheRoutes() {    
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditUserProfile /></ProtectedRoute>} />
            <Route path="/add-pet" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/messages/:threadId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><BookingCalendar /></ProtectedRoute>} />
            <Route path="/booking" element={<ProtectedRoute><BookingCalendar /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/edit-pet/:petId" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
            <Route path="/bookingpage" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />

        </Routes>
 
    );
}