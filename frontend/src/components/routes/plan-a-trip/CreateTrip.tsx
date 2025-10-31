import { Input } from '@/components/ui/input';
import React, { useContext, useEffect, useState } from 'react';
import Autocomplete from 'react-google-autocomplete';
import {
  PROMPT,
  SelectBudgetOptions,
  SelectNoOfPersons,
} from '../../constants/Options';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { model, startChat } from '@/Service/AiModel';

import { LogInContext } from '@/Context/LogInContext/Login';

import { db } from '@/Service/Firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface CreateTripProps {
  createTripPageRef?: React.RefObject<HTMLDivElement>;
}

interface FormData {
  location?: string;
  noOfDays?: number;
  People?: string;
  Budget?: string;
}

function CreateTrip({ createTripPageRef }: CreateTripProps) {
  const [place, setPlace] = useState('');
  const [formData, setFormData] = useState<FormData>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loginWithPopup, isAuthenticated } = useContext(LogInContext);

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const SignIn = async () => {
    loginWithPopup();
  };

  const SaveUser = async () => {
    const User = JSON.parse(localStorage.getItem('User') || '{}');
    const id = User?.email;
    await setDoc(doc(db, 'Users', id), {
      userName: User?.name,
      userEmail: User?.email,
      userPicture: User?.picture,
      userNickname: User?.nickname,
    });
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem('User', JSON.stringify(user));
      SaveUser();
    }
  }, [user]);

  const SaveTrip = async (TripData: any) => {
    const User = JSON.parse(localStorage.getItem('User') || '{}');
    const id = Date.now().toString();
    setIsLoading(true);
    await setDoc(doc(db, 'Trips', id), {
      tripId: id,
      userSelection: formData,
      tripData: TripData,
      userName: User?.name,
      userEmail: User?.email,
    });
    setIsLoading(false);
    localStorage.setItem('Trip', JSON.stringify(TripData));
    localStorage.setItem('UserSelection', JSON.stringify(formData));
    navigate('/my-trips/' + id);
  };

  const generateTrip = async () => {
    if (!isAuthenticated) {
      toast('Sign In to continue', {
        icon: '⚠️',
      });
      return setIsDialogOpen(true);
    }
    if (
      !formData?.noOfDays ||
      !formData?.location ||
      !formData?.People ||
      !formData?.Budget
    ) {
      return toast.error('Please fill out every field or select every option.');
    }
    if (formData?.noOfDays > 5) {
      return toast.error('Please enter Trip Days less then 5');
    }
    if (formData?.noOfDays < 1) {
      return toast.error('Invalid number of Days');
    }
    const FINAL_PROMPT = PROMPT.replace(/{location}/g, formData?.location)
      .replace(/{noOfDays}/g, formData?.noOfDays.toString())
      .replace(/{People}/g, formData?.People)
      .replace(/{Budget}/g, formData?.Budget);

    try {
      const toastId = toast.loading('Generating Trip', {
        icon: '✈️',
      });

      setIsLoading(true);
      const chat = await startChat();
      const result = await chat.sendMessage(FINAL_PROMPT);
      const response = await result.response;
      const trip = JSON.parse(response.text());
      setIsLoading(false);
      SaveTrip(trip);

      toast.dismiss(toastId);
      toast.success('Trip Generated Successfully');
    } catch (error) {
      setIsLoading(false);
      toast.dismiss();
      toast.error('Failed to generate trip. Please try again.');
      console.error(error);
    }
  };

  return (
    <div ref={createTripPageRef} className="mt-10 text-center">
      <div className="text">
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
            JourneyJolt
          </span>{' '}
          <br /> will curate a personalized itinerary, crafted to match your
          unique preferences!
        </p>
      </div>

      <div className="form mt-14 flex flex-col gap-16 md:gap-20">
        <div className="place">
          <h2 className="font-semibold text-lg md:text-xl mb-3">
            <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
              Where do you want to Explore?
            </span>{' '}
            🏖️
          </h2>

          <Autocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center"
            onPlaceSelected={(place) => {
              setPlace(place);
              console.log(place);
              console.log('selected:', place.name);
              handleInputChange('location', place.formatted_address);
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
              onClick={SignIn}
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
  );
}

export default CreateTrip;