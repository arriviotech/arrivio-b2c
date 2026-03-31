import React from 'react';
import { Link } from 'react-router-dom';
import greenLogo from '../../assets/greenlogo.webp';

const SimpleNavbar = () => {
  return (
    // CHANGED: 
    // 1. 'absolute' instead of 'fixed' (Scrolls with page, doesn't feel like a sticky bar)
    // 2. 'bg-transparent' (No background color)
    // 3. Removed border and height constraints
    <nav className="absolute top-0 left-0 w-full z-50 h-20 px-6 md:px-12 flex items-center justify-between">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-start">
        <Link to="/" className="relative z-10 hover:opacity-70 transition-opacity flex items-center">
          <img
            src={greenLogo}
            alt="Arrivio"
            className="h-8 md:h-10 w-auto object-contain transition-all duration-500"
          />
        </Link>
      </div>
    </nav>
  );
};

export default SimpleNavbar;