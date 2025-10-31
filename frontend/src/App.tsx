import React, { useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from './components/custom/Layout';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import { LogInProvider } from './Context/LogInContext/Login';
import CreateTrip from './components/routes/plan-a-trip/CreateTrip';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function App() {
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const createTripPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
  }, []);

  return (
    <LogInProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route
              path="/"
              element={<Layout headerRef={headerRef} />}
            >
              <Route
                index
                element={<Home heroRef={heroRef} />}
              />
              <Route
                path="/plan-a-trip"
                element={<CreateTrip createTripPageRef={createTripPageRef} />}
              />
            </Route>
          </Routes>
        </motion.div>
        <Toaster position="bottom-center" />
      </ThemeProvider>
    </LogInProvider>
  );
}

export default App;