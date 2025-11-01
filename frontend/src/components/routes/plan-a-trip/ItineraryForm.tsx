import { useState } from 'react';
import { useQuery } from 'react-query';
import DatePicker from 'react-datepicker';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { Spinner } from '@/components/ui/spinner';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const interestOptions = [
  'Adventure',
  'Culture',
  'Food',
  'Nature',
  'Shopping',
  'Relaxation',
  'History',
  'Art',
  'Photography',
  'Nightlife'
];

const budgetRanges = [
  { value: 'budget', label: 'Budget (Under ₹10,000)', amount: 10000 },
  { value: 'mid', label: 'Mid-Range (₹10,000 - ₹25,000)', amount: 25000 },
  { value: 'luxury', label: 'Luxury (Above ₹25,000)', amount: 50000 }
];

export default function ItineraryForm() {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: null,
    endDate: null,
    budget: '',
    interests: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateItinerary = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(API_ENDPOINTS.GENERATE_ITINERARY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: itinerary, refetch } = useQuery(
    ['itinerary', formData],
    generateItinerary,
    {
      enabled: false, // Don't run automatically
      retry: 1
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.destination) {
      return toast.error('Please select a destination');
    }
    if (!formData.startDate || !formData.endDate) {
      return toast.error('Please select travel dates');
    }
    if (!formData.budget) {
      return toast.error('Please select a budget range');
    }
    if (formData.interests.length === 0) {
      return toast.error('Please select at least one interest');
    }

    // Generate itinerary
    await refetch();
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Destination</h2>
          <GooglePlacesAutocomplete
            apiKey={process.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: formData.destination,
              onChange: (place) => setFormData(prev => ({
                ...prev,
                destination: place.value
              })),
              placeholder: 'Search for a destination...'
            }}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Travel Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData(prev => ({
                ...prev,
                startDate: date
              }))}
              selectsStart
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={new Date()}
              placeholderText="Start Date"
              className="w-full p-2 border rounded"
            />
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => setFormData(prev => ({
                ...prev,
                endDate: date
              }))}
              selectsEnd
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={formData.startDate}
              placeholderText="End Date"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Budget Range</h2>
          <div className="grid grid-cols-3 gap-4">
            {budgetRanges.map((range) => (
              <Button
                key={range.value}
                type="button"
                variant={formData.budget === range.value ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({
                  ...prev,
                  budget: range.value
                }))}
                className="w-full"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <Button
                key={interest}
                type="button"
                variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                onClick={() => handleInterestToggle(interest)}
                className="px-4 py-2"
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner /> Generating Itinerary...
            </span>
          ) : (
            'Generate Itinerary'
          )}
        </Button>
      </form>

      <AnimatePresence>
        {itinerary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8"
          >
            {/* Render itinerary results here */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}