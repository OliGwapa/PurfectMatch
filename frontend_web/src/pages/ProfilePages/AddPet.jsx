import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import "../../styles/ProfileCSS/AddPet.css";
import Banner from '../../components/Banner-c/Banner';
import Sidebar from '../../components/sidebar-c/Sidebar';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

export default function AddPet() {
  const { handleLogout, checkAuth, getUserDetails } = useAuth();
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName");
  const token = localStorage.getItem("token");

  const [petData, setPetData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    weight: '',
    weightUnit: 'kg',
    color: '',
    description: '',
    availabilityStatus: 'available',
    price: '',
    pedigreeInfo: '',
    healthStatus: ''
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pedigreeFile, setPedigreeFile] = useState(null);
  const [healthFile, setHealthFile] = useState(null);

  const breedOptions = {
  Dog: ["Labrador", "Poodle", "German Shepherd", "Bulldog", "Beagle"],
  Cat: ["Siamese", "Persian", "Maine Coon", "Bengal", "Ragdoll"],
  Bird: ["Parakeet", "Canary", "Cockatiel", "Parrot", "Finch"],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setPetData(prev => ({
        ...prev,
        dateOfBirth: value,
        age: age >= 0 ? age.toString() : ''
      }));
    } else {
      setPetData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoChange = (e) => {
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
      setPhotoFile(file);
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
    const formData = new FormData();
    formData.append("file", file);
    
    // Use existing photo upload endpoint
    const response = await fetch(
      `http://localhost:8080/pets/${petId}/photos`,
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
    return result.url; // Return the URL of the uploaded document
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!petData.name || !petData.breed || !petData.gender) {
      setError("Please fill in at least Name, Breed, and Gender!");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const weightValue = petData.weight ? parseFloat(petData.weight) : null;
      const priceValue = petData.price ? parseFloat(petData.price) : null;
      const formattedDate = petData.dateOfBirth ? new Date(petData.dateOfBirth).toISOString() : null;

      // First, create the pet
      const createResponse = await fetch("http://localhost:8080/pets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          gender: petData.gender,
          dateOfBirth: formattedDate,
          weight: weightValue,
          color: petData.color,
          description: petData.description,
          availabilityStatus: petData.availabilityStatus,
          price: priceValue,
          pedigreeInfo: petData.pedigreeInfo, // Will be updated with URL later
          healthStatus: petData.healthStatus   // Will be updated with URL later
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || "Failed to create pet");
      }

      const createdPet = await createResponse.json();
      console.log("Created pet:", createdPet);

      // Upload main pet photo if provided
      if (photoFile && createdPet.petId) {
        const formData = new FormData();
        formData.append("file", photoFile);

        const photoResponse = await fetch(
          `http://localhost:8080/pets/${createdPet.petId}/photos`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: formData
          }
        );

        if (!photoResponse.ok) {
          throw new Error("Failed to upload pet photo");
        }
      }

      // Upload pedigree and health documents and update pet record
      let pedigreeUrl = petData.pedigreeInfo;
      let healthUrl = petData.healthStatus;

      if (pedigreeFile) {
        pedigreeUrl = await uploadDocument(pedigreeFile, createdPet.petId, 'pedigree');
      }

      if (healthFile) {
        healthUrl = await uploadDocument(healthFile, createdPet.petId, 'health');
      }

      // Update pet record with document URLs if any documents were uploaded
      if (pedigreeFile || healthFile) {
        const updateResponse = await fetch(
          `http://localhost:8080/pets/update/${createdPet.petId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              name: petData.name,
              species: petData.species,
              breed: petData.breed,
              gender: petData.gender,
              dateOfBirth: formattedDate,
              weight: weightValue,
              color: petData.color,
              description: petData.description,
              availabilityStatus: petData.availabilityStatus,
              price: priceValue,
              pedigreeInfo: pedigreeUrl,
              healthStatus: healthUrl
            })
          }
        );

        if (!updateResponse.ok) {
          console.warn("Failed to update pet with document URLs, but pet was created successfully");
        }
      }

      alert("Pet created successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Error in handleSave:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchToggle = () => {
    navigate('/dashboard');
  };

  return (
    <div className="home-wrapper">
      <Banner firstName={firstName} onLogout={handleLogout} />

      <div className="main-content">
        <Sidebar activeItem="add-pet" onLogout={handleLogout} onSearchToggle={handleSearchToggle}/>

        {/* Expanded Center Content */}
        <div className="center-content expanded">
          <div className="add-pet-container">
            <h2 className="form-title">Add New Pet</h2>
            {error && <div className="error-message">{error}</div>}

            <div className="form-grid-container">
              {/* Photo Upload Section */}
              <div className="photo-upload-section">
                <input
                  type="file"
                  id="pet-photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
                <label htmlFor="pet-photo-upload" className="upload-label">
                  {photoFile ? (
                    <div className="photo-preview-container">
                      <img 
                        src={URL.createObjectURL(photoFile)} 
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
                  {photoFile ? (
                    <button 
                      className="remove-photo-button"
                      onClick={() => setPhotoFile(null)}
                      disabled={isLoading}
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
                <form onSubmit={handleSave}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name*</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={petData.name} 
                        onChange={handleInputChange} 
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Species</label>
                      <select 
                        name="species" 
                        value={petData.species} 
                        onChange={handleInputChange}
                        disabled={isLoading}
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Breed*</label>
                      {petData.species in breedOptions && breedOptions[petData.species].length > 0 ? (
                        <select
                          name="breed"
                          value={petData.breed}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                        >
                          <option value="">Select breed</option>
                          {breedOptions[petData.species].map((breed) => (
                            <option key={breed} value={breed}>{breed}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name="breed"
                          value={petData.breed}
                          onChange={handleInputChange}
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
                            checked={petData.gender === "Male"} 
                            onChange={handleInputChange} 
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
                            checked={petData.gender === "Female"} 
                            onChange={handleInputChange} 
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
                        value={petData.dateOfBirth} 
                        onChange={handleInputChange} 
                        disabled={isLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        name="age" 
                        value={petData.age} 
                        onChange={handleInputChange} 
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight" 
                        value={petData.weight} 
                        onChange={handleInputChange} 
                        disabled={isLoading}
                        step="0.1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Color</label>
                      <input 
                        type="text" 
                        name="color" 
                        value={petData.color} 
                        onChange={handleInputChange} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      name="description" 
                      value={petData.description} 
                      onChange={handleInputChange} 
                      disabled={isLoading}
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Availability Status</label>
                      <select 
                        name="availabilityStatus" 
                        value={petData.availabilityStatus} 
                        onChange={handleInputChange}
                        disabled={isLoading}
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Price (₱)</label>
                      <input 
                        type="number" 
                        name="price" 
                        value={petData.price} 
                        onChange={handleInputChange} 
                        disabled={isLoading}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Pedigree Information</label>
                      <input
                        type="file"
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
                          </div>
                        )}
                      </label>
                      <small className="file-help">JPEG, PNG, or PDF files, max 5MB</small>
                    </div>

                    <div className="form-group">
                      <label>Health Status</label>
                      <input
                        type="file"
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
                          </div>
                        )}
                      </label>
                      <small className="file-help">JPEG, PNG, or PDF files, max 5MB</small>
                    </div>
                  </div>

                  <div className="form-buttons">
                    <button 
                      type="button"
                      className="cancel-btn" 
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="save-btn" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Pet'}
                    </button>
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