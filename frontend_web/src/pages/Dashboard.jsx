import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import "../styles/home.css";
import Banner from '../components/Banner';
import Sidebar from '../components/sidebar-c/Sidebar';
import PetModal from '../components/PetModal';
import FeedPetCard from '../components/FeedPetCard';
import SkeletonCard from '../components/SkeletonCard';
import BookingPage from './BookingPage';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import PetsIcon from '@mui/icons-material/Pets';
import { useNavigate } from 'react-router-dom';

import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Dashboard() {
  const { handleLogout, handleDeleteAccount, checkAuth, getUserDetails } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    fullName: localStorage.getItem("firstName") || '',
    email: localStorage.getItem("email") || '',
    phone: localStorage.getItem("phone") || '',
    address: localStorage.getItem("address") || '',
    profileImage: localStorage.getItem("profileImage") || ''
  });

  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [selectedPet, setSelectedPet] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingPet, setBookingPet] = useState(null);

  const observer = useRef(null);
  const loadMoreRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setUserDetails({
      fullName: localStorage.getItem("firstName") || '',
      email: localStorage.getItem("email") || '',
      phone: localStorage.getItem("phone") || '',
      address: localStorage.getItem("address") || '',
      profileImage: localStorage.getItem("profileImage") || ''
    });
  }, [navigate]);

const fetchPets = useCallback(async (pageToFetch) => {
  if (loading || !hasMore) return;

  setLoading(true);
  setError(null);

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`http://localhost:8080/pets/feed?page=${pageToFetch}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error(errorData.message || "Failed to fetch pet feed");
    }

    const data = await response.json();
    setPets((prevPets) => {
      const existingIds = new Set(prevPets.map((pet) => pet.petId));
      const newPets = data.filter((pet) => !existingIds.has(pet.petId));
      return [...prevPets, ...newPets];
    });

    setHasMore(data.length === size);
    setPage(pageToFetch + 1);
  } catch (err) {
    console.error("Error fetching pets:", err);
    setError(err.message);
  } finally {
    setLoading(false);
    if (pageToFetch === 0) {
      setInitialLoading(false);
    }
  }
}, [size, loading, hasMore, navigate]);

  useEffect(() => {
    fetchPets(0);
  }, [fetchPets]);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && !loading && hasMore) {
      fetchPets(page);
    }
  }, [fetchPets, page, loading, hasMore]);

  useEffect(() => {
    observer.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1
    });

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current && loadMoreRef.current) {
        observer.current.unobserve(loadMoreRef.current);
      }
    };
  }, [handleObserver]);

  const handleBookPet = (pet) => {
    setBookingPet(pet);
  };

  const handleCloseBooking = () => {
    setSelectedPet(bookingPet); 
    setBookingPet(null);        
  };
  
  const handlePetClick = (pet) => {
    console.log('Selected pet data:', pet);
    setSelectedPet(pet);
  };

  const handleCloseModal = () => {
    setSelectedPet(null);
  };

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.species.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`home-wrapper ${darkMode ? 'dark' : ''}`}>
      <Banner firstName={userDetails.fullName.split(' ')[0]} />

      <div className="main-content">
        <Sidebar activeItem="dashboard" onLogout={handleLogout} onSearchToggle={() => setShowSearch(!showSearch)}/>

        <div className="center-content">
          <div className="feed-header">
            <h2>
              <PetsIcon sx={{ position: 'relative', top: '2px', color: '#7C715E', marginRight: '8px' }} />
              Pet Feed
            </h2>
          </div>

          {showSearch && (
            <TextField
              fullWidth
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              label="Search pets by name, breed, or species..."
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#7C715E',
                  },
                  '&:hover fieldset': {
                    borderColor: '#7C715E',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#7C715E',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7C715E',
                  '&.Mui-focused': {
                    color: '#7C715E',
                  },
                },
              }}
            />
          )}

          {error && <p className="error">{error}</p>}
          {!initialLoading && !loading && pets.length === 0 && !error && <p>No pets available.</p>}

          <div className="pet-feed-grid">
            {initialLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} />
              ))
            ) : (
              (showSearch ? filteredPets : pets).map((pet) => (
                <FeedPetCard key={pet.petId} pet={pet} onClick={handlePetClick} />
              ))
            )}
          </div>

          {loading && !initialLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
              <CircularProgress sx={{ color: '#E5D0AC' }} />
            </Box>
          )}

          {!hasMore && pets.length > 0 && !initialLoading && (
            <p className="end-message">No more pets to show</p>
          )}

          <div ref={loadMoreRef} style={{ height: '20px' }} />
        </div>

        <PetModal pet={selectedPet} onClose={handleCloseModal} />
          {bookingPet && (
            <div className="modal-overlay">
              <div className="modal-content">
                <BookingPage
                  petId={bookingPet.petId}
                  petName={bookingPet.name}
                  onClose={handleCloseBooking}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}