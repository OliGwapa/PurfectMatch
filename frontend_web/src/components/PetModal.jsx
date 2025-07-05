import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, X, ChevronDown, ChevronUp } from 'lucide-react';
import "./PetModal.css";
import DocumentImage from './DocumentImage';
import Button from './Button';
import defaultProfile from '../assets/defaultprofileimage.png';

// Image Viewer Modal Component
const ImageViewer = ({ src, alt, onClose }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewerRef.current && !viewerRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  if (!src) return null;

  const handleOverlayClick = (event) => {
    // Only close if clicking the overlay itself, not its children
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-viewer-overlay" onClick={handleOverlayClick}>
      <div className="image-viewer-content" ref={viewerRef}>
        <button onClick={onClose} className="image-viewer-close">
          <X size={24} />
        </button>
        <img src={src} alt={alt} className="image-viewer-image" />
      </div>
    </div>
  );
};

const PetModal = ({ pet, onClose, onBook }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageViewer, setImageViewer] = useState({ show: false, src: null, alt: null });

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if image viewer is open
      if (imageViewer.show) return;
      
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, imageViewer.show]);

  // Reset image viewer state when modal closes
  useEffect(() => {
    return () => {
      setImageViewer({ show: false, src: null, alt: null });
    };
  }, []);

  // Reset image viewer when pet changes
  useEffect(() => {
    setImageViewer({ show: false, src: null, alt: null });
  }, [pet]);

  if (!pet) return null;

  const handleBooking = () => {
    if (onBook) {
      onBook(pet);   
      onClose();      
    }
  };

  const handleChat = () => {
    navigate(`/messages/${pet.userId}`);
  };

  // Function to open image viewer
  const openImageViewer = (e, src, alt) => {
    e.stopPropagation(); // Prevent event bubbling
    if (src) {
      setImageViewer({ show: true, src, alt });
    }
  };

  // Function to close image viewer
  const closeImageViewer = () => {
    setImageViewer({ show: false, src: null, alt: null });
  };

  // Function to check if description needs truncation
  const shouldTruncateDescription = (description) => {
    if (!description) return false;
    const lines = description.split('\n');
    return lines.length > 3 || description.length > 150;
  };

  // Function to get truncated description (first 3 lines or 150 characters)
  const getTruncatedDescription = (description) => {
    if (!description) return '';
    const lines = description.split('\n');
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n');
    }
    if (description.length > 150) {
      return description.substring(0, 150) + '...';
    }
    return description;
  };

  const needsReadMore = shouldTruncateDescription(pet.description);
  const displayDescription = showFullDescription || !needsReadMore 
    ? pet.description 
    : getTruncatedDescription(pet.description);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content" ref={modalRef}>
          <div className="modal-header">
            <button onClick={onClose} className="close-button">
              <X size={20} />
            </button>
          </div>
          
          <div className="modal-body">
            {/* Pet Profile Image */}
            <div className="pet-image-container">
              <img
                src={pet.photoUrl || defaultProfile}
                alt={pet.name}
                className="modal-pet-image"
              />
            </div>

            <div className="modal-pet-name"><h3>{pet.name}</h3></div>
            
            {/* Description Section with Read More */}
            <div className="description-section">
              <div className="description-content">
                <p>{displayDescription}</p>
                {needsReadMore && (
                  <button 
                    className="read-more-button"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? (
                      <>
                        <span>Read Less</span>
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        <span>Read More</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Pet Details Grid */}
            <div className="pet-details-grid">
              <div className="detail-item">
                <strong>Breed</strong>
                <span>{pet.breed}</span>
              </div>
              <div className="detail-item">
                <strong>Match Price</strong>
                <span>${pet.price || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <strong>Availability</strong>
                <span>
                  {pet.availabilityStatus
                    ? pet.availabilityStatus.charAt(0).toUpperCase() + pet.availabilityStatus.slice(1)
                    : 'Not specified'}
                </span>
              </div>
            </div>

            {/* Document Images */}
            <div className="documents-section">
              <div className="document-item">
                <div onClick={(e) => openImageViewer(e, pet.pedigreeInfo, "Pedigree Information")}>
                  <DocumentImage 
                    src={pet.pedigreeInfo} 
                    alt="Pedigree Information" 
                    label="Pedigree Information" 
                  />
                </div>
              </div>
              <div className="document-item">
                <div onClick={(e) => openImageViewer(e, pet.healthStatus, "Health Status Certificate")}>
                  <DocumentImage 
                    src={pet.healthStatus} 
                    alt="Health Status Certificate" 
                    label="Health Status" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <Button onClick={handleBooking} icon={Calendar} className="book-button">
              Book
            </Button>
            <Button onClick={handleChat} icon={MessageSquare} className="chat-button">
              Chat with owner
            </Button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewer.show && (
        <ImageViewer 
          src={imageViewer.src} 
          alt={imageViewer.alt} 
          onClose={closeImageViewer} 
        />
      )}
    </>
  );
};

export default PetModal;