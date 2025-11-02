import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogInContext } from '@/Context/LogInContext/Login';

const Hero = () => {
  const { isAuthenticated, checkLocalAuth } = useContext(LogInContext);

  useEffect(() => {
    checkLocalAuth();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-center">
      <div className="space-y-6 max-w-[750px] relative">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          Your{' '}
          <span className="bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            AI-Powered
          </span>{' '}
          Travel Companion
        </h1>
        <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Experience personalized travel planning like never before. Let our AI
          create the perfect itinerary based on your preferences.
        </p>
        <div className="mx-auto max-w-[22rem] space-y-4">
          <Link to={isAuthenticated ? '/plan-a-trip' : '/login'}>
            <Button 
              className="w-full bg-gradient-to-r from-orange-600 to-green-600 text-white hover:from-orange-700 hover:to-green-700 transition-all shadow-lg" 
              size="lg"
            >
              Start Planning Your Journey
            </Button>
          </Link>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              Please sign in to start planning your trip
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;