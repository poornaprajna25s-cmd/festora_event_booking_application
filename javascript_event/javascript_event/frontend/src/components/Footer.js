import React from 'react';

const Footer = () => {
  return (
    <footer className="text-white py-4" style={{ backgroundColor: '#303030' }}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Campus Event Hub. All rights reserved.</p>
        <p className="mt-1 text-xs">Designed for efficient event management in educational institutions.</p>
      </div>
    </footer>
  );
};

export default Footer;