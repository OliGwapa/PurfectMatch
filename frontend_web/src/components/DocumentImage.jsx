import React from 'react';

const DocumentImage = ({ src, alt, label }) => {
  const handleImageError = (e) => {
    console.error(`Error loading ${label.toLowerCase()} image:`, src);
    e.target.style.display = 'none';
    
    // Show fallback text instead
    const fallback = document.createElement('p');
    fallback.textContent = `${label} available but image could not be loaded.`;
    fallback.style.fontStyle = 'italic';
    fallback.style.color = '#666';
    e.target.parentNode.appendChild(fallback);
  };

  if (!src) return null;

  return (
    <div className="modal-section">
      <p><strong>{label}:</strong></p>
      <img
        src={src}
        alt={alt}
        className="modal-document-image"
        style={{
          maxWidth: '100%',
          height: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginTop: '8px'
        }}
        onError={handleImageError}
      />
    </div>
  );
};

export default DocumentImage;