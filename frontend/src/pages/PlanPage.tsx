import React, { useState } from 'react';
import ItineraryDisplay from '../components/ItineraryDisplay';

const PlanPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  // Example user preferences (in a real app, these would come from user input or state)
  const destination = "Jaipur";
  const duration = 3;
  const preferences = ["Historical Sites", "Local Culture", "Food"];

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Auto-dismiss error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto py-8">
        <ItineraryDisplay
          destination={destination}
          duration={duration}
          preferences={preferences}
          onError={handleError}
        />
      </main>
    </div>
  );
};

export default PlanPage;