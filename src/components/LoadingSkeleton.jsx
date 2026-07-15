import React from 'react';
import './Skeleton.css';

export default function LoadingSkeleton() {
  return (
    <div className="skeleton-page">
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-line long" />
      <div className="skeleton skeleton-line medium" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}
