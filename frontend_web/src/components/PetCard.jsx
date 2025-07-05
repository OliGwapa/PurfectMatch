import React from 'react';
import defaultProfile from '../assets/defaultprofileimage.png';
import './PetCard.css';

const PetCard = ({ 
  pet, 
  onClick, 
  variant = 'feed', // 'feed' or 'profile'
  showActions = false,
  onEdit,
  onDelete
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(pet);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(pet.petId);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(pet.petId);
    }
  };

  return (
    <div 
      className={`pet-card ${variant === 'profile' ? 'pet-card--profile' : 'pet-card--feed'}`} 
      onClick={handleClick} 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="pet-image-container">
        <img 
          src={pet.photoUrl || pet.photo || defaultProfile} 
          alt={pet.name} 
          className="pet-image" 
          loading="lazy"
          onError={(e) => {
            e.target.src = defaultProfile;
          }}
        />
      </div>
      <div className="pet-info">
        <h3 className="pet-name">{pet.name}</h3>
        {variant === 'feed' ? (
          <>
            <p className="pet-breed-species">{pet.species} - {pet.breed}</p>
            {pet.description && <p className="pet-description">{pet.description}</p>}
          </>
        ) : (
          <>
            <div className="pet-details">
              <span className="pet-breed">{pet.breed}</span>
              {pet.species && <span className="pet-species"> • {pet.species}</span>}
            </div>
            {pet.age && <div className="pet-age">{pet.age} years old</div>}
          </>
        )}
      </div>
      {showActions && (
        <div className="pet-actions">
          <button
            className="edit-pet-btn"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="delete-pet-btn"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PetCard;