import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogInContext } from '@/Context/LogInContext/Login';
import { db } from '@/Service/Firebase';
import { doc, setDoc } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { API_ENDPOINTS } from '@/config/api';
import { budgetRanges as SelectBudgetOptions, PROMPT } from '@/components/constants/Options';
import Autocomplete from 'react-google-autocomplete';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ItineraryView from './ItineraryView';
import TripSummary from './TripSummary';
import { TripItinerary } from './types';

const SelectNoOfPersons = [
  { value: 'Solo', label: 'Solo Traveler' },
  { value: 'Couple', label: 'Couple' },
  { value: 'Family', label: 'Family' },
  { value: 'Friends', label: 'Group of Friends' },
  { value: 'Business', label: 'Business Group' }
];

interface PlaceResult {
  formatted_address?: string;
  name?: string;
}

interface FormData {
  location?: string;
  noOfDays?: number;
  People?: string;
  Budget?: string;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  groupSize?: number;
  budget?: number;
  preferences?: {
    activityTypes: string[];
    maxActivitiesPerDay: number;
    preferredStartTime: string;
    preferredEndTime: string;
    mealTimes: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
    accessibility: string[];
    avoidTypes: string[];
  };
}

const CreateTrip = () => {
  const [formData, setFormData] = useState<FormData>({});
  const [generatedItinerary, setGeneratedItinerary] = useState<TripItinerary | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, loginWithPopup, isAuthenticated } = useContext(LogInContext);

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prevState) => {
      const newState = { ...prevState, [name]: value };
      console.log('New form data:', newState);
      return newState;
    });
  };   

  // Version management is now handled in TripSummary component

  // This function is now handled by generateTrip

  const saveItinerary = async () => {
    try {
      const tripData = {
        itinerary,
        formData,
        versions,
        selectedVersion,
      };

      await setDoc(doc(db, 'Trips', Date.now().toString()), {
        ...tripData,
        userId: user?.uid,
        createdAt: new Date().toISOString(),
      });

      toast.success('Trip saved successfully!');
      navigate('/my-trips');
    } catch (error) {
      toast.error('Failed to save trip. Please try again.');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem('User', JSON.stringify(user));
      setDoc(doc(db, 'Users', user.email), {
        userName: user.name,
        userEmail: user.email,
        userPicture: user.picture,
        userNickname: user.nickname,
      });
    }
  }, [user, isAuthenticated]);

  const validateForm = () => {
    const missingFields = [];
    
    if (!formData?.location) missingFields.push('Location');
    if (!formData?.noOfDays) missingFields.push('Number of Days');
    if (!formData?.People) missingFields.push('Travel Group');
    if (!formData?.Budget) missingFields.push('Budget');

    if (missingFields.length > 0) {
      toast.dismiss(); // Dismiss any existing toasts
      toast.error(`Please fill out: ${missingFields.join(', ')}`, {
        id: 'form-validation', // Use a unique ID to prevent duplicates
        duration: 3000,
      });
      return false;
    }

    if (formData.noOfDays > 5) {
      toast.dismiss();
      toast.error('Please enter Trip Days less than 5', {
        id: 'days-validation',
        duration: 3000,
      });
      return false;
    }
    if (formData.noOfDays < 1) {
      toast.dismiss();
      toast.error('Invalid number of Days', {
        id: 'days-validation',
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const [generatedItinerary, setGeneratedItinerary] = useState<TripItinerary | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());

  const generateTrip = async () => {
    if (!isAuthenticated) {
      toast.dismiss();
      toast('Sign In to continue', {
        icon: '⚠️',
        id: 'auth-validation',
      });
      return setIsDialogOpen(true);
    }

    if (!validateForm()) {
      return;
    }

    const FINAL_PROMPT = PROMPT.replace(/{location}/g, formData.location!)
      .replace(/{noOfDays}/g, formData.noOfDays!.toString())
      .replace(/{People}/g, formData.People!)
      .replace(/{Budget}/g, formData.Budget!);

    try {
      const toastId = toast.loading('Generating Trip', {
        icon: '✈️',
      });
      setIsLoading(true);

      const response = await axios.post(API_ENDPOINTS.GENERATE_ITINERARY, {
        location: formData.location,
        noOfDays: formData.noOfDays,
        groupType: formData.People,
        budget: formData.Budget,
        prompt: FINAL_PROMPT
      });

      const trip: TripItinerary = {
        destination: formData.location!,
        duration: formData.noOfDays!,
        travelers: formData.People!,
        budget: formData.Budget!,
        overview: response.data.overview || "Your personalized trip itinerary",
        dailyItinerary: response.data.dailyItinerary || [],
        travelTips: response.data.travelTips || [],
        culturalNotes: response.data.culturalNotes || [],
        totalEstimatedCost: response.data.totalEstimatedCost || 0
      };

      setGeneratedItinerary(trip);
      toast.dismiss(toastId);
      toast.success('Trip Generated Successfully');

      // Call API and process response
      const response = await axios.post(API_ENDPOINTS.GENERATE_ITINERARY, {
        location: formData.location,
        noOfDays: formData.noOfDays,
        groupType: formData.People,
        budget: formData.Budget,
        prompt: FINAL_PROMPT
      });

      // Process response data and update trip object
      if (response.data) {
        const processedData = response.data;
        trip.dailyItinerary = processedData.dailyItinerary;
        trip.overview = processedData.overview;
        trip.travelTips = processedData.travelTips;
        trip.culturalNotes = processedData.culturalNotes;
        trip.totalEstimatedCost = processedData.totalEstimatedCost;
      }

      setGeneratedItinerary(trip);
      await SaveTrip(trip);

      toast.dismiss(toastId);
      toast.success('Trip Generated Successfully');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.dismiss();
      let errorMessage = 'Failed to generate trip. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const [generatedItinerary, setGeneratedItinerary] = useState<TripItinerary | null>(null);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto px-4 py-8">
        {generatedItinerary ? (
          <div className="space-y-6">
            <TripSummary
              itinerary={generatedItinerary}
              onStartDateChange={setStartDate}
              onSave={SaveTrip}
            />
            <ItineraryView
              itinerary={generatedItinerary}
              startDate={startDate}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-5 flex items-center justify-center">
                <span className="hidden md:block">🚀</span>{' '}
                <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                  Share Your Travel Preferences{' '}
                </span>{' '}
                <span className="hidden md:block">🚀</span>
              </h2>
              <p className="opacity-90 mx-auto text-center text-md md:text-xl font-medium tracking-tight text-primary/80">
                Embark on your dream adventure with just a few simple details. <br />
                <span className="bg-gradient-to-b text-2xl from-blue-400 to-blue-700 bg-clip-text text-center text-transparent">
                  SmartYatra
                </span>{' '}
                <br /> will curate a personalized itinerary, crafted to match your
                unique preferences!
              </p>
            </div>

            <div className="space-y-12">
              <div className="place">
                <h2 className="font-semibold text-lg md:text-xl mb-3">
                  <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                    Where do you want to Explore?
                  </span>{' '}
                  🏖️
                </h2>

                <Autocomplete
                  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center"
                  onPlaceSelected={(selectedPlace: PlaceResult) => {
                    if (selectedPlace.formatted_address) {
                      handleInputChange('location', selectedPlace.formatted_address);
                    }
                  }}
                />
              </div>

              <div className="day">
                <h2 className="font-semibold text-lg md:text-xl mb-3">
                  <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                    How long is your Trip?
                  </span>{' '}
                  🕜
                </h2>
                <Input
                  type="number"
                  placeholder="Enter number of days"
                  className="text-center"
                  onChange={(e) => handleInputChange('noOfDays', parseInt(e.target.value))}
                />
              </div>

              <div className="people">
                <h2 className="font-semibold text-lg md:text-xl mb-3">
                  <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                    Who are you traveling with?
                  </span>{' '}
                  👨‍👩‍👧‍👦
                </h2>
                <div className="flex flex-wrap gap-5 justify-center">
                  {SelectNoOfPersons.map((option) => (
                    <Button
                      key={option.value}
                      variant={formData.People === option.value ? 'default' : 'outline'}
                      onClick={() => handleInputChange('People', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="budget">
                <h2 className="font-semibold text-lg md:text-xl mb-3">
                  <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                    What's your Budget Preference?
                  </span>{' '}
                  💰
                </h2>
                <div className="flex flex-wrap gap-5 justify-center">
                  {SelectBudgetOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={formData.Budget === option.value ? 'default' : 'outline'}
                      onClick={() => handleInputChange('Budget', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="submit">
                <Button
                  className="text-lg md:text-xl px-10 py-6"
                  onClick={generateTrip}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <AiOutlineLoading3Quarters className="animate-spin" /> Generating
                      Trip...
                    </span>
                  ) : (
                    'Generate Trip'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign In Required</DialogTitle>
              <DialogDescription>
                Please sign in to generate your personalized trip itinerary.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => loginWithPopup()}
              >
                <FcGoogle className="w-5 h-5" />
                Sign in with Google
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};

export default CreateTrip;