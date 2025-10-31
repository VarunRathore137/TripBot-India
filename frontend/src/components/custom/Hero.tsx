import React, { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { LogInContext } from '@/Context/LogInContext/Login';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { db } from '@/Service/Firebase';
import { collection, getDocs } from 'firebase/firestore';

interface HeroProps {
  heroRef?: React.RefObject<HTMLDivElement>;
}

function Hero({ heroRef }: HeroProps) {
  const { user, isAuthenticated, loginWithPopup } = useContext(LogInContext);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    trips: 0,
    users: 0,
  });

  const SignIn = async () => {
    loginWithPopup();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tripsSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, 'Trips')),
          getDocs(collection(db, 'Users')),
        ]);

        setStats({
          trips: tripsSnapshot.size,
          users: usersSnapshot.size,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div
      ref={heroRef}
      className="hero min-h-[90vh] flex flex-col items-center justify-center gap-10 md:gap-20 text-center"
    >
      <div className="text">
        <h1 className="text-4xl md:text-7xl font-bold mb-5">
          <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
            Your Next Adventure
          </span>{' '}
          <br />
          <span className="bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text text-transparent">
            Starts Here
          </span>
        </h1>
        <p className="opacity-90 mx-auto text-center text-md md:text-xl font-medium tracking-tight text-primary/80">
          Let AI craft your perfect travel itinerary. <br /> From hidden gems to
          must-see attractions, we've got you covered.
        </p>
      </div>

      <div className="stats flex items-center justify-center gap-10 md:gap-20">
        {isLoading ? (
          <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
        ) : (
          <>
            <div className="trips">
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                {stats.trips}+
              </h2>
              <p className="text-sm md:text-lg font-medium text-primary/80">
                Trips Created
              </p>
            </div>
            <div className="users">
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                {stats.users}+
              </h2>
              <p className="text-sm md:text-lg font-medium text-primary/80">
                Happy Travelers
              </p>
            </div>
          </>
        )}
      </div>

      <div className="buttons flex items-center justify-center gap-5">
        {isAuthenticated ? (
          <Link to="/plan-a-trip">
            <Button className="text-lg md:text-xl px-10 py-6">
              Plan Your Trip
            </Button>
          </Link>
        ) : (
          <Button
            onClick={SignIn}
            className="text-lg md:text-xl px-10 py-6 flex items-center gap-2"
          >
            <FcGoogle className="text-2xl" /> Sign In to Get Started
          </Button>
        )}
      </div>

      <div className="marquee w-full overflow-hidden">
        <div className="marquee-content flex gap-5 animate-marquee">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <img
              key={index}
              src={`/hero/${index}.jpg`}
              alt=""
              className="h-40 w-60 object-cover rounded-lg"
            />
          ))}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <img
              key={`duplicate-${index}`}
              src={`/hero/${index}.jpg`}
              alt=""
              className="h-40 w-60 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;