import { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import Hero from '@/components/custom/Hero';
import CreateTrip from '@/components/routes/plan-a-trip/CreateTrip';
import MyTrips from '@/components/routes/my-trips/MyTrips';
import TripDetails from '@/components/routes/my-trips/TripDetails';
import Login from '@/components/routes/auth/Login';

const App = () => {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <Layout>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/plan-a-trip" element={<CreateTrip />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/my-trips/:id" element={<TripDetails />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Layout>
  );
};

export default App;