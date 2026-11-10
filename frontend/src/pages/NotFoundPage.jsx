import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-black select-none overflow-hidden font-sans">
      <Link
        to="/"
        className="cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
        aria-label="Return to Home"
      >
        <h1 className="text-[28vw] sm:text-[24vw] md:text-[20vw] font-black tracking-tighter text-white leading-none text-center">
          404
        </h1>
      </Link>
    </div>
  );
};

export default NotFoundPage;
