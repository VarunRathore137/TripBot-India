import { useContext, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogInContext } from '@/Context/LogInContext/Login';

interface FormData {
  location?: string;
  noOfDays?: number;
  People?: string;
  Budget?: string;
}

interface User {
  uid: string;
  nickname: string;
}

interface TripItinerary {
  destination: string;
  duration: number;
  groupType: string;
  budget: string;
  overview: string;
  dailyItinerary: Array<{
    day: number;
    activities: string[];
    meals: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    accommodation?: string;
  }>;
  travelTips: string[];
  culturalNotes: string[];
  totalEstimatedCost: number;
}
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
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(LogInContext);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateTrip = async () => {
    if (!formData.location || !formData.noOfDays || !formData.People || !formData.Budget) {
      alert('Please fill all fields');
      return;
    }

    if (formData.noOfDays > 14) {
      alert('Maximum trip duration is 14 days');
      return;
    }

    if (formData.noOfDays < 1) {
      alert('Minimum trip duration is 1 day');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/itinerary/generate', {
        destination: formData.location,
        duration: formData.noOfDays,
        groupType: formData.People,
        budget: formData.Budget
      });

      const itinerary: TripItinerary = {
        destination: formData.location,
        duration: formData.noOfDays,
        groupType: formData.People,
        budget: formData.Budget,
        overview: response.data.overview || "Your personalized trip itinerary",
        dailyItinerary: response.data.dailyItinerary || [],
        travelTips: response.data.travelTips || [],
        culturalNotes: response.data.culturalNotes || [],
        totalEstimatedCost: response.data.totalEstimatedCost || 0
      };

      setGeneratedItinerary(itinerary);
      
    } catch (error: any) {
      console.error('Error generating itinerary:', error);
      alert(error.response?.data?.message || 'Error generating itinerary');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Form section to collect user input
  const renderForm = () => (
    <div className="max-w-xl mx-auto p-4">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Destination (e.g., Jaipur)"
          className="w-full p-2 border rounded"
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
        <input
          type="number"
          placeholder="Number of Days"
          className="w-full p-2 border rounded"
          onChange={(e) => handleInputChange('noOfDays', parseInt(e.target.value))}
        />
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => handleInputChange('People', e.target.value)}
        >
          <option value="">Select Group Type</option>
          {SelectNoOfPersons.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => handleInputChange('Budget', e.target.value)}
        >
          <option value="">Select Budget Range</option>
          <option value="Budget">Budget-Friendly</option>
          <option value="Moderate">Moderate</option>
          <option value="Luxury">Luxury</option>
        </select>
        <button
          onClick={generateTrip}
          disabled={isLoading}
          className="w-full bg-primary text-white p-3 rounded disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Itinerary'}
        </button>
      </div>
    </div>
  );
  
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

    try {
      const toastId = toast.loading('Generating Trip', {
        icon: '✈️',
      });
      setIsLoading(true);

      // Direct OpenAI API call
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a knowledgeable travel planner who creates detailed, engaging itineraries."
            },
            {
              role: "user",
              content: `Create a detailed ${formData.noOfDays}-day travel itinerary for ${formData.location}.
                Travel Group: ${formData.People}
                Budget: ${formData.Budget}
                
                Please provide a detailed day-by-day itinerary including:
                - Specific times for each activity
                - Local attractions and landmarks
                - Recommended restaurants and food experiences
                - Cultural activities and experiences
                - Transportation suggestions
                - Estimated costs for activities
                - Local tips and recommendations
                
                Format each day with proper emojis and clear sections.`
            }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedContent = response.data.choices[0].message.content;
      
      // Set the generated itinerary
      setGeneratedItinerary({
        destination: formData.location!,
        duration: formData.noOfDays!,
        details: generatedContent
      });
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