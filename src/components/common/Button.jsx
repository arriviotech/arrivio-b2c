import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick,
  type = 'button',
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#0f4c3a] text-white hover:bg-[#0f4c3a]/90 focus:ring-[#0f4c3a]',
    secondary: 'bg-[#f2f2f2] text-[#111827] hover:bg-[#f2f2f2]/80 focus:ring-[#ddd]',
    outline: 'border-2 border-forestGreen text-[#111827] hover:bg-[#0f4c3a] hover:text-white focus:ring-[#0f4c3a]',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
