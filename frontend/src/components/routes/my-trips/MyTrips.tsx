import React from 'react';
import { Link } from 'react-router-dom';

const MyTrips: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for trip cards */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">Trip to Goa</h2>
          <p className="text-gray-600 mb-4">A 5-day beach vacation</p>
          <Link to="/my-trips/1" className="text-blue-600 hover:text-blue-800">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyTrips;