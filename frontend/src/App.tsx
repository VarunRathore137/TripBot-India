
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import Hero from '@/components/custom/Hero';
import ItineraryGenerator from '@/components/ItineraryGenerator';
import ItineraryPlan from '@/components/ItineraryPlan';
import MyTrips from '@/components/routes/my-trips/MyTrips';
import TripDetails from '@/components/routes/my-trips/TripDetails';
import Login from '@/components/routes/auth/Login';
import TripPlannerPage from './pages/TripPlannerPage';
import { ItineraryProvider } from '@/Context/Itinerary/ItineraryContext';

const App = () => {

  return (
    <ItineraryProvider>
      <Layout>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/plan" element={<ItineraryGenerator />} />
          <Route path="/itinerary" element={<ItineraryPlan />} />
          <Route path="/plan-a-trip" element={<TripPlannerPage />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/my-trips/:id" element={<TripDetails />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </ItineraryProvider>
  );
};
};

export default App;