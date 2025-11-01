import React from 'react';
import { useParams } from 'react-router-dom';

const TripDetails: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trip Details</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Trip to Goa</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Dates</h3>
            <p className="text-gray-600">March 15, 2024 - March 20, 2024</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Itinerary</h3>
            <ul className="list-disc list-inside text-gray-600">
              <li>Day 1: Arrival and Beach Visit</li>
              <li>Day 2: Water Sports</li>
              <li>Day 3: Local Sightseeing</li>
              <li>Day 4: Shopping and Cuisine</li>
              <li>Day 5: Departure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;