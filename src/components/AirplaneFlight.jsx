import React from 'react';
import { Plane } from 'lucide-react';

const AirplaneFlight = () => {
  return (
    <div className="airplane-wrapper">
      <div className="flying-plane">
        <div className="plane-trail"></div>
        <Plane className="text-sky-400 transform rotate-45" size={28} style={{ filter: 'drop-shadow(0 0 10px rgba(34, 168, 98, 0.8))' }} />
      </div>
    </div>
  );
};

export default AirplaneFlight;
