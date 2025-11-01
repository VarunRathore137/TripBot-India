import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogInContext } from '@/Context/LogInContext/Login';

const Hero = () => {
  const { isAuthenticated } = useContext(LogInContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] text-center">
      <div className="space-y-6 max-w-[750px] relative">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          Your{' '}
          <span className="bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-transparent">
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
            <Button className="w-full" size="lg">
              Start Planning Your Trip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;