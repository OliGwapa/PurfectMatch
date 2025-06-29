import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, X } from 'lucide-react';
import DocumentImage from './DocumentImage';
import defaultProfile from '../assets/defaultprofileimage.png';

const PetModal = ({ pet, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!pet) return null;

  const handleBooking = () => {
    navigate('/booking', { 
      state: { 
        petId: pet.petId, 
        petName: pet.name 
      } 
    });
  };

  const handleChat = () => {
    navigate(`/messages/${pet.userId}`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h3>{pet.name}</h3>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <img
            src={pet.photoUrl || defaultProfile}
            alt={pet.name}
            className="modal-pet-image"
          />
          
          <p><strong>Breed:</strong> {pet.breed}</p>
          <p><strong>Description:</strong> {pet.description}</p>
          <p><strong>Price:</strong> ${pet.price || 'Not specified'}</p>
          <p><strong>Availability:</strong> {pet.availabilityStatus || 'Not specified'}</p>
          
          <DocumentImage src={pet.pedigreeInfo} alt="Pedigree Information" label="Pedigree Information" />
          <DocumentImage src={pet.healthStatus} alt="Health Status Certificate" label="Health Status" />
        </div>
        
        <div className="modal-footer">
          <button onClick={handleBooking} className="modal-button">
            <Calendar size={16} /> Book
          </button>
          <button onClick={handleChat} className="modal-button">
            <MessageSquare size={16} /> Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetModal;