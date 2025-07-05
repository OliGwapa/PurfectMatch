import React from 'react';
import Skeleton from '@mui/material/Skeleton';

const SkeletonCard = () => (
  <div className="pet-card" style={{ padding: '16px' }}>
    <div className="pet-image-container">
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={200} 
        sx={{ borderRadius: '8px' }}
      />
    </div>
    <div className="pet-info" style={{ marginTop: '12px' }}>
      <Skeleton variant="text" sx={{ fontSize: '1.25rem', width: '70%' }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', width: '85%' }} />
      <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '100%' }} />
      <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '60%' }} />
    </div>
  </div>
);

export default SkeletonCard;