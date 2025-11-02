import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../Context/Itinerary/ItineraryContext';
import { generateItinerary } from '../Service/AiModel';
import { Button } from './ui/button';

interface FormData {
  destination: string;
  duration: string;
  preferences: string[];
}

export default function ItineraryGenerator() {
  const navigate = useNavigate();
  const { setItineraryData, setIsGenerating, setError } = useItinerary();
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    duration: '',
    preferences: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateItinerary(formData);
      setItineraryData(response);
      navigate('/plan'); // Navigate to plan page after successful generation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const preferences = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      preferences,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create Your Perfect Trip</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium mb-2">
            Destination
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
            placeholder="Enter your destination"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-2">
            Duration (days)
          </label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select duration</option>
            <option value="1">1 day</option>
            <option value="2">2 days</option>
            <option value="3">3 days</option>
            <option value="4">4 days</option>
            <option value="5">5 days</option>
            <option value="7">1 week</option>
            <option value="14">2 weeks</option>
          </select>
        </div>

        <div>
          <label htmlFor="preferences" className="block text-sm font-medium mb-2">
            Preferences (comma-separated)
          </label>
          <input
            type="text"
            id="preferences"
            name="preferences"
            onChange={handlePreferencesChange}
            className="w-full p-2 border rounded-md"
            placeholder="e.g., history, food, culture"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary text-white"
          disabled={!formData.destination || !formData.duration}
        >
          Generate Itinerary
        </Button>
      </form>
    </div>
  );
}