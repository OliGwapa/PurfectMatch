import React from 'react';
import defaultProfile from '../assets/defaultprofileimage.png';

const FeedPetCard = ({ pet, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(pet);
    }
  };

  return (
    <div className="feed-pet-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="pet-image-container">
        <img src={pet.photoUrl || defaultProfile} alt={pet.name} className="pet-image" loading="lazy" />
      </div>
      <div className="pet-info">
        <h3>{pet.name}</h3>
        <p>{pet.species} - {pet.breed}</p>
        <p className="pet-description">{pet.description}</p>
      </div>
    </div>
  );
};

export default FeedPetCard;