import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const baseClasses = 'bg-white rounded-lg shadow-md border border-gray-200';
  const combinedClasses = className 
    ? `${baseClasses} ${className}`
    : baseClasses;

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
