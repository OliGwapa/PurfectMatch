import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import "../../styles/ProfileCSS/UserProfile.css";
import Banner from '../../components/Banner-c/Banner';
import Sidebar from '../../components/sidebar-c/Sidebar';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import defaultProfile from '../../assets/defaultprofileimage.png';
 
export default function UserProfile() {
  const { handleLogout, checkAuth, getUserDetails } = useAuth();
  const { confirmDanger, alertSuccess, alertError } = useNotifications();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    profileImage: ''
  });
  const [userPets, setUserPets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [petsLoading, setPetsLoading] = useState(false);
 
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
 
      setLoading(true);
      setError(null);
 
      try {
        const profileResponse = await fetch("http://localhost:8080/users/me", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
 
        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            throw new Error("Session expired. Please log in again.");
          }
          const errorData = await profileResponse.json();
          throw new Error(errorData.message || "Failed to fetch user profile");
        }
 
        const userProfile = await profileResponse.json();
        setUserDetails({
          userId: userProfile.user?.userID || '',
          fullName: `${userProfile.user?.firstName || ''} ${userProfile.user?.lastName || ''}`.trim(),
          email: userProfile.user?.email || '',
          phone: userProfile.user?.phone || '',
          address: userProfile.user?.address || '',
          profileImage: userProfile.user?.profilePicture || defaultProfile
        });
 
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
 
    fetchUserProfile();
  }, [navigate]);
 
  useEffect(() => {
    const fetchUserPets = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
 
      setPetsLoading(true);
      try {
        const petsResponse = await fetch('http://localhost:8080/pets/my-pets', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
 
        if (!petsResponse.ok) {
          if (petsResponse.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            throw new Error("Session expired. Please log in again.");
          }
          const errorData = await petsResponse.json();
          throw new Error(errorData.message || "Failed to fetch user pets");
        }
 
        const petsData = await petsResponse.json();
       
        const petsWithPhotos = await Promise.all(
          petsData.map(async (pet) => {
            try {
              const photosResponse = await fetch(
                `http://localhost:8080/pets/${pet.petId}/photos`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
 
              if (!photosResponse.ok) {
                return { ...pet, photo: defaultProfile };
              }
 
              const photosData = await photosResponse.json();
              return {
                ...pet,
                photo: photosData.length > 0 ? photosData[0].url : defaultProfile
              };
            } catch (err) {
              return { ...pet, photo: defaultProfile };
            }
          })
        );
 
        setUserPets(petsWithPhotos);
      } catch (err) {
        console.error("Error fetching pets:", err);
        setError(err.message);
      } finally {
        setPetsLoading(false);
      }
    };
 
    fetchUserPets();
  }, [navigate]);
 
  const handleDeletePet = async (petId) => {    
    const confirmed = await confirmDanger(
      "Are you sure you want to delete this pet? This action cannot be undone.",
      "Delete Pet",
      {
        confirmText: "Delete Pet",
        cancelText: "Keep Pet"
      }
    );
    
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/pets/delete/${petId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete pet");
      }

      // Remove the deleted pet from state
      setUserPets(userPets.filter(pet => pet.petId !== petId));
      alertSuccess(data.message || "Pet deleted successfully");
    } catch (err) {
      console.error("Error deleting pet:", err);
      alertError(err.message, "Failed to Delete Pet");
    }
  };

  const handleSearchToggle = () => {
    navigate('/dashboard');
  };
 
  return (
    <div className="home-wrapper">
      <Banner firstName={userDetails.fullName.split(' ')[0]} />
 
      <div className="main-content">
        <Sidebar activeItem="profile" onLogout={handleLogout} onSearchToggle={handleSearchToggle}/>
 
        <div className="center-content expanded">
          {loading ? (
            <div className="loading-spinner">Loading profile...</div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="profile-container">
              <div className="profile-header">
                <div className="profile-image-container">
                  <img
                    src={userDetails.profileImage}
                    alt="Profile"
                    className="profile-image"
                    onError={(e) => {
                      e.target.src = defaultProfile;
                    }}
                  />
                  <Link to="/edit-profile" className="edit-profile-button">
                    Edit Profile
                  </Link>
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">{userDetails.fullName}</h2>
                  <p className="profile-email">{userDetails.email}</p>
                  <div className="profile-details-grid">
                    <div className="detail-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{userDetails.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{userDetails.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
 
              <div className="pets-section">
                <div className="section-header">
                  <h3>My Pets</h3>
                  <Link to="/add-pet" className="add-pet-button">
                    <Plus size={18} /> Add Pet
                  </Link>
                </div>
 
                {petsLoading ? (
                  <div className="loading-spinner">Loading pets...</div>
                ) : userPets.length > 0 ? (
                  <div className="pets-grid">
                    {userPets.map((pet) => (
                      <div key={pet.petId} className="pet-card">
                        <div className="pet-image-container">
                          <img
                            src={pet.photo}
                            alt={pet.name}
                            className="pet-image"
                            onError={(e) => {
                              e.target.src = defaultProfile;
                            }}
                          />
                        </div>
                        <div className="pet-info">
                          <h4 className="pet-name">{pet.name}</h4>
                          <div className="pet-details">
                            <span className="pet-breed">{pet.breed}</span>
                            {pet.species && <span className="pet-species"> • {pet.species}</span>}
                          </div>
                          {pet.age && <div className="pet-age">{pet.age} years old</div>}
                        </div>
                        <div className="pet-actions">
                          <button
                            className="edit-pet-btn"
                            onClick={() => navigate(`/edit-pet/${pet.petId}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-pet-btn"
                            onClick={() => handleDeletePet(pet.petId)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-pets-message">
                    <p>You haven't added any pets yet.</p>
                    <Link to="/add-pet" className="add-pet-link">
                      Add your first pet
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}