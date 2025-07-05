import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from "../../hooks/useNotifications";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import "../../styles/ProfileCSS/EditPet.css";
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import Sidebar from '../../components/sidebar-c/Sidebar';
import { Camera } from 'lucide-react';

export default function EditPet() {
  const { confirm, alertSuccess, alertError } = useNotifications();
  const { handleLogout } = useAuth();
  const { petId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pedigreeFileInputRef = useRef(null);
  const healthFileInputRef = useRef(null);
  const firstName = localStorage.getItem("firstName");

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [mainPhotoId, setMainPhotoId] = useState(null);
  const [pedigreeFile, setPedigreeFile] = useState(null);
  const [healthFile, setHealthFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    dateOfBirth: '',
    weight: '',
    color: '',
    description: '',
    availabilityStatus: 'available',
    price: '',
    pedigreeInfo: '',
    healthStatus: ''
  });

  const breedOptions = {
    Dog: ["Labrador", "Poodle", "German Shepherd", "Bulldog", "Beagle"],
    Cat: ["Siamese", "Persian", "Maine Coon", "Bengal", "Ragdoll"],
    Bird: ["Parakeet", "Canary", "Cockatiel", "Parrot", "Finch"],
  };

  const speciesOptions = ['Dog', 'Cat', 'Bird'];
  const genderOptions = ['Male', 'Female'];
  const statusOptions = ['available', 'pending', 'adopted'];

  useEffect(() => {
    const fetchPetDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const petResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets/${petId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!petResponse.ok) {
          const errorData = await petResponse.json();
          throw new Error(errorData.message || "Failed to fetch pet details");
        }

        const petData = await petResponse.json();
        setPet(petData);

        const formattedDate = petData.dateOfBirth
          ? new Date(petData.dateOfBirth).toISOString().split('T')[0]
          : '';

        setFormData({
          name: petData.name || '',
          species: petData.species || '',
          breed: petData.breed || '',
          gender: petData.gender || '',
          dateOfBirth: formattedDate,
          weight: petData.weight || '',
          color: petData.color || '',
          description: petData.description || '',
          availabilityStatus: petData.availabilityStatus || 'available',
          price: petData.price || '',
          pedigreeInfo: petData.pedigreeInfo || '',
          healthStatus: petData.healthStatus || ''
        });

        const photosResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets/${petId}/photos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          if (photosData.length > 0) {
            setPreviewImage(photosData[0].url);
            setMainPhotoId(photosData[0].photoId);
          }
        }
      } catch (err) {
        console.error("Error fetching pet:", err);
        setError(err.message || "Failed to load pet details");
      } finally {
        setLoading(false);
      }
    };

    fetchPetDetails();
  }, [petId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setFormData(prev => ({
        ...prev,
        dateOfBirth: value,
        age: age >= 0 ? age.toString() : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPEG or PNG image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handlePedigreeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPEG, PNG image or PDF file for pedigree information.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setPedigreeFile(file);
      setError(null);
    }
  };

  const handleHealthFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPEG, PNG image or PDF file for health status.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setHealthFile(file);
      setError(null);
    }
  };

  const uploadDocument = async (file, petId, documentType) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/pets/${petId}/photos`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to upload ${documentType} document`);
    }
    
    const result = await response.json();
    return result.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Pet name is required");
      setIsLoading(false);
      return;
    }
    if (!formData.species) {
      setError("Species is required");
      setIsLoading(false);
      return;
    }
    if (!formData.gender) {
      setError("Gender is required");
      setIsLoading(false);
      return;
    }

    try {
      // Format dateOfBirth as ISO string
      const formattedDate = formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : null;

      // Upload pedigree and health documents if new files were selected
      let pedigreeUrl = formData.pedigreeInfo;
      let healthUrl = formData.healthStatus;

      if (pedigreeFile) {
        pedigreeUrl = await uploadDocument(pedigreeFile, petId, 'pedigree');
      }

      if (healthFile) {
        healthUrl = await uploadDocument(healthFile, petId, 'health');
      }

      const petUpdateBody = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        dateOfBirth: formattedDate,
        weight: formData.weight === '' ? null : parseFloat(formData.weight),
        color: formData.color,
        description: formData.description,
        availabilityStatus: formData.availabilityStatus,
        price: formData.price === '' ? null : parseFloat(formData.price),
        pedigreeInfo: pedigreeUrl,
        healthStatus: healthUrl
      };

      // Update pet info
      const petResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets/update/${petId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(petUpdateBody)
      });

      const petResponseBody = await petResponse.json();

      if (!petResponse.ok) {
        throw new Error(petResponseBody.message || `Failed to update pet (Status: ${petResponse.status})`);
      }

      // Update photo if a new one was selected
      if (fileInputRef.current.files[0]) {
        const photoFormData = new FormData();
        photoFormData.append('file', fileInputRef.current.files[0]);

        let photoResponse;
        if (mainPhotoId) {
          photoResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets/photos/${mainPhotoId}`, {
            method: "PUT",
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: photoFormData
          });
        } else {
          photoResponse = await fetch(`${import.meta.env.VITE_API_URL}/pets/${petId}/photos`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: photoFormData
          });
        }

        const photoResponseBody = await photoResponse.json();

        if (!photoResponse.ok) {
          throw new Error(photoResponseBody.message || `Failed to ${mainPhotoId ? 'update' : 'upload'} photo (Status: ${photoResponse.status})`);
        }

        if (!mainPhotoId) {
          setMainPhotoId(photoResponseBody.photoId);
          setPreviewImage(photoResponseBody.url);
        }
      }

      alertSuccess("Pet updated successfully");
      navigate("/profile");
    } catch (err) {
      console.error("Error updating pet:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!mainPhotoId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/photos/${mainPhotoId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPreviewImage(null);
        setMainPhotoId(null);
        fileInputRef.current.value = null;
        alertSuccess("Photo deleted successfully");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete photo");
      }
    } catch (err) {
      alertError(err.message || "Failed to delete photo");
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleSearchToggle = () => {
    navigate('/dashboard');
  };

  if (loading) return <div className="loading">Loading pet details...</div>;
  if (error && !pet) return <div className="error">{error}</div>;

  return (
    <div className="home-wrapper">
      <Banner firstName={firstName} onLogout={handleLogout} />

      <div className="main-content">
        <Sidebar activeItem="profile" onLogout={handleLogout} onSearchToggle={handleSearchToggle}/>

        <div className="center-content expanded">
          <div className="add-pet-container">
            <h2 className="form-title">Edit Pet: {pet?.name}</h2>
            {error && <div className="error-message">{error}</div>}

            <div className="form-grid-container">
              {/* Photo Upload Section */}
              <div className="photo-upload-section">
                <input
                  type="file"
                  ref={fileInputRef}
                  id="pet-photo-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
                <label htmlFor="pet-photo-upload" className="upload-label">
                  {previewImage ? (
                    <div className="photo-preview-container">
                      <img 
                        src={previewImage} 
                        alt="Pet preview" 
                        className="pet-photo-preview"
                      />
                      <div className="upload-overlay">
                        <span>Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Camera size={48} className="camera-icon" />
                      <p>Click to upload pet photo</p>
                    </div>
                  )}
                </label>
                <div className="upload-instructions">
                  {previewImage ? (
                    <button 
                      className="remove-photo-button"
                      onClick={handleDeletePhoto}
                      disabled={isLoading}
                      type="button"
                    >
                      Remove Photo
                    </button>
                  ) : (
                    <p className="file-requirements">JPEG or PNG, max 5MB</p>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <div className="form-section">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name*</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Species*</label>
                      <select
                        name="species"
                        value={formData.species}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      >
                        <option value="">Select species</option>
                        {speciesOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Breed*</label>
                      {formData.species in breedOptions && breedOptions[formData.species].length > 0 ? (
                        <select
                          name="breed"
                          value={formData.breed}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                        >
                          <option value="">Select breed</option>
                          {breedOptions[formData.species].map((breed) => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="breed"
                          value={formData.breed}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          placeholder="Enter breed"
                        />
                      )}
                    </div>

                    <div className="form-group">
                      <label>Gender*</label>
                      <div className="radio-options">
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="Male" 
                            checked={formData.gender === "Male"} 
                            onChange={handleChange} 
                            disabled={isLoading}
                            required
                          />
                          <span>Male</span>
                        </label>
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name="gender" 
                            value="Female" 
                            checked={formData.gender === "Female"} 
                            onChange={handleChange} 
                            disabled={isLoading}
                          />
                          <span>Female</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleNumberChange}
                        disabled={isLoading}
                        placeholder="e.g., 5.5"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Price (₱)</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleNumberChange}
                        disabled={isLoading}
                        placeholder="e.g., 500.00"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={isLoading}
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Availability Status</label>
                      <select
                        name="availabilityStatus"
                        value={formData.availabilityStatus}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {statusOptions.map(option => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Pedigree Information</label>
                      <input
                        type="file"
                        ref={pedigreeFileInputRef}
                        id="pedigree-upload"
                        accept="image/*,.pdf"
                        onChange={handlePedigreeFileChange}
                        style={{ display: 'none' }}
                        disabled={isLoading}
                      />
                      <label htmlFor="pedigree-upload" className="file-upload-label">
                        {pedigreeFile ? (
                          <div className="file-preview">
                            <span>{pedigreeFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setPedigreeFile(null)}
                              className="remove-file-btn"
                              disabled={isLoading}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="upload-placeholder-small">
                            <span>📄 Upload Pedigree Document</span>
                            {formData.pedigreeInfo && (
                              <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                                Current: Document uploaded
                              </small>
                            )}
                          </div>
                        )}
                      </label>
                      <small className="file-help">JPEG, PNG, or PDF files, max 5MB</small>
                    </div>

                    <div className="form-group">
                      <label>Health Status</label>
                      <input
                        type="file"
                        ref={healthFileInputRef}
                        id="health-upload"
                        accept="image/*,.pdf"
                        onChange={handleHealthFileChange}
                        style={{ display: 'none' }}
                        disabled={isLoading}
                      />
                      <label htmlFor="health-upload" className="file-upload-label">
                        {healthFile ? (
                          <div className="file-preview">
                            <span>{healthFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setHealthFile(null)}
                              className="remove-file-btn"
                              disabled={isLoading}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="upload-placeholder-small">
                            <span>🏥 Upload Health Certificate</span>
                            {formData.healthStatus && (
                              <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                                Current: Document uploaded
                              </small>
                            )}
                          </div>
                        )}
                      </label>
                      <small className="file-help">JPEG, PNG, or PDF files, max 5MB</small>
                    </div>
                  </div>

                  <div className="add-pet-form-buttons">
                    <Button type="button" className="cancel-btn" onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" className="save-btn" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Pet'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}