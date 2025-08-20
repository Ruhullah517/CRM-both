import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const defaultClasses = 'bg-[#2EAB2C] hover:bg-[#248A22] focus:ring-[#2EAB2C]';
  
  const combinedClasses = className 
    ? `${baseClasses} ${className}`
    : `${baseClasses} ${defaultClasses}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
