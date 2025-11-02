import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Loader2, AlertCircle, CheckCircle, Home, Sparkles, Edit2, Trash2, Plus, Save, X } from 'lucide-react';

const ItineraryGenerator = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    travelers: '',
    interests: [],
    startDate: '',
    pace: 'moderate'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isAddingActivity, setIsAddingActivity] = useState(null);

  const indianDestinations = [
    'Mumbai, Maharashtra',
    'Delhi',
    'Bangalore, Karnataka',
    'Kolkata, West Bengal',
    'Chennai, Tamil Nadu',
    'Hyderabad, Telangana',
    'Jaipur, Rajasthan',
    'Goa',
    'Varanasi, Uttar Pradesh',
    'Agra, Uttar Pradesh',
    'Udaipur, Rajasthan',
    'Kochi, Kerala',
    'Mysore, Karnataka',
    'Amritsar, Punjab',
    'Rishikesh, Uttarakhand',
    'Shimla, Himachal Pradesh',
    'Manali, Himachal Pradesh',
    'Darjeeling, West Bengal'
  ];

  const interestOptions = [
    'Heritage & Temples',
    'Adventure & Trekking',
    'Indian Cuisine',
    'Wildlife Safari',
    'Shopping & Markets',
    'Bollywood',
    'Photography',
    'Yoga & Wellness',
    'Museums & Art',
    'Beaches',
    'Hill Stations',
    'Festivals'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 day';
    }
    
    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
    }
    
    if (!formData.travelers || formData.travelers < 1) {
      newErrors.travelers = 'Number of travelers must be at least 1';
    }
    
    if (formData.interests.length === 0) {
      newErrors.interests = 'Select at least one interest';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: '' }));
    }
  };

  const generateItinerary = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const budgetNum = parseInt(formData.budget.replace(/\D/g, ''));
      
      const mockItinerary = {
        title: `${formData.duration}-Day Indian Adventure in ${formData.destination}`,
        overview: `A specially curated ${formData.duration}-day itinerary exploring ${formData.destination}, India.`,
        days: Array.from({ length: parseInt(formData.duration) }, (_, i) => ({
          day: i + 1,
          title: `Day ${i + 1}: Discovering ${formData.destination}`,
          activities: [
            {
              id: `d${i + 1}-a1`,
              time: '09:00',
              title: 'Morning Temple Visit',
              description: 'Start your day with a visit to a historic site.',
              duration: '2-3 hours'
            },
            {
              id: `d${i + 1}-a2`,
              time: '12:30',
              title: 'Traditional Indian Lunch',
              description: 'Savor authentic regional cuisine.',
              duration: '1-1.5 hours'
            },
            {
              id: `d${i + 1}-a3`,
              time: '14:00',
              title: 'Cultural Experience',
              description: 'Explore local markets and activities.',
              duration: '3-4 hours'
            },
            {
              id: `d${i + 1}-a4`,
              time: '19:00',
              title: 'Evening Dining',
              description: 'Enjoy dinner at a local restaurant.',
              duration: '2 hours'
            }
          ],
          tips: [
            'Dress modestly when visiting religious sites',
            'Stay hydrated in Indian climate',
            'Book attractions online to avoid queues'
          ]
        })),
        budgetBreakdown: {
          accommodation: Math.round(budgetNum * 0.35),
          food: Math.round(budgetNum * 0.25),
          activities: Math.round(budgetNum * 0.25),
          transportation: Math.round(budgetNum * 0.15)
        },
        recommendations: [
          'Download offline maps',
          'Keep emergency numbers handy',
          'Use Ola/Uber for transport',
          'Respect local customs'
        ]
      };

      setItinerary(mockItinerary);
    } catch (error) {
      setApiError('Failed to generate itinerary. Please try again.');
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActivity = (dayIndex, activityId) => {
    setItinerary(prev => {
      const newItinerary = { ...prev };
      newItinerary.days[dayIndex].activities = newItinerary.days[dayIndex].activities.filter(
        act => act.id !== activityId
      );
      return newItinerary;
    });
  };

  const startEditActivity = (dayIndex, activity) => {
    setEditingActivity({
      dayIndex,
      activityId: activity.id,
      time: activity.time,
      title: activity.title,
      description: activity.description,
      duration: activity.duration
    });
  };

  const saveEditActivity = () => {
    if (!editingActivity.title.trim() || !editingActivity.time.trim()) {
      return;
    }

    setItinerary(prev => {
      const newItinerary = { ...prev };
      const activityIndex = newItinerary.days[editingActivity.dayIndex].activities.findIndex(
        act => act.id === editingActivity.activityId
      );
      
      if (activityIndex !== -1) {
        newItinerary.days[editingActivity.dayIndex].activities[activityIndex] = {
          id: editingActivity.activityId,
          time: editingActivity.time,
          title: editingActivity.title,
          description: editingActivity.description,
          duration: editingActivity.duration
        };
      }
      
      return newItinerary;
    });
    
    setEditingActivity(null);
  };

  const startAddActivity = (dayIndex) => {
    setIsAddingActivity({
      dayIndex,
      time: '',
      title: '',
      description: '',
      duration: ''
    });
  };

  const saveNewActivity = () => {
    if (!isAddingActivity.title.trim() || !isAddingActivity.time.trim()) {
      return;
    }

    setItinerary(prev => {
      const newItinerary = { ...prev };
      const newActivity = {
        id: `d${isAddingActivity.dayIndex + 1}-a${Date.now()}`,
        time: isAddingActivity.time,
        title: isAddingActivity.title,
        description: isAddingActivity.description,
        duration: isAddingActivity.duration
      };
      
      newItinerary.days[isAddingActivity.dayIndex].activities.push(newActivity);
      newItinerary.days[isAddingActivity.dayIndex].activities.sort((a, b) => a.time.localeCompare(b.time));
      
      return newItinerary;
    });
    
    setIsAddingActivity(null);
  };

  const deleteTip = (dayIndex, tipIndex) => {
    setItinerary(prev => {
      const newItinerary = { ...prev };
      newItinerary.days[dayIndex].tips.splice(tipIndex, 1);
      return newItinerary;
    });
  };

  const addTip = (dayIndex) => {
    const newTip = prompt('Enter new tip:');
    if (newTip && newTip.trim()) {
      setItinerary(prev => {
        const newItinerary = { ...prev };
        newItinerary.days[dayIndex].tips.push(newTip.trim());
        return newItinerary;
      });
    }
  };

  const deleteRecommendation = (index) => {
    setItinerary(prev => {
      const newItinerary = { ...prev };
      newItinerary.recommendations.splice(index, 1);
      return newItinerary;
    });
  };

  const addRecommendation = () => {
    const newRec = prompt('Enter new recommendation:');
    if (newRec && newRec.trim()) {
      setItinerary(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, newRec.trim()]
      }));
    }
  };

  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
              <MapPin className="w-16 h-16 text-orange-600" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Incredible India Trip Planner
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Generate personalized travel itineraries across India powered by AI. Explore heritage sites, taste authentic cuisine, and experience diverse cultures.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Calendar className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Smart Planning</h3>
              <p className="text-gray-600 text-sm">AI-powered itineraries for Indian destinations</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Edit2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fully Customizable</h3>
              <p className="text-gray-600 text-sm">Edit, add, or remove activities easily</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">India-Focused</h3>
              <p className="text-gray-600 text-sm">Tailored for Indian destinations</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('planner')}
            className="mt-8 px-8 py-4 bg-orange-600 text-white rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors shadow-lg"
          >
            Plan Your Indian Adventure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-green-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">India Itinerary Planner</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                Travel Details
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination in India *
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a city</option>
                  {indianDestinations.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.destination && (
                  <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="5"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travelers *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.travelers}
                    onChange={(e) => handleInputChange('travelers', e.target.value)}
                    placeholder="2"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      errors.travelers ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.travelers && (
                    <p className="mt-1 text-sm text-red-600">{errors.travelers}</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (₹) *
                </label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="50000"
                  className={`w-full px-4 py-2 border rounded-lg ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Pace
                </label>
                <select
                  value={formData.pace}
                  onChange={(e) => handleInputChange('pace', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="packed">Packed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {errors.interests && (
                  <p className="mt-2 text-sm text-red-600">{errors.interests}</p>
                )}
              </div>
            </div>

            <button
              onClick={generateItinerary}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-green-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Itinerary
                </>
              )}
            </button>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-700">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            {!itinerary && !isLoading && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your Itinerary Will Appear Here
                </h3>
                <p className="text-gray-600">
                  Fill the form and click Generate to create your plan.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Loader2 className="w-16 h-16 text-orange-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Creating Your Journey
                </h3>
                <p className="text-gray-600">
                  Please wait while we generate your itinerary...
                </p>
              </div>
            )}

            {itinerary && !isLoading && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-green-50 border-b border-green-200 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      Generated! Customize below.
                    </span>
                  </div>
                </div>

                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {itinerary.title}
                  </h2>
                  <p className="text-gray-600 mb-6">{itinerary.overview}</p>

                  <div className="bg-orange-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Budget Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Accommodation:</span>
                        <span className="font-semibold ml-2">₹{itinerary.budgetBreakdown.accommodation}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Food:</span>
                        <span className="font-semibold ml-2">₹{itinerary.budgetBreakdown.food}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Activities:</span>
                        <span className="font-semibold ml-2">₹{itinerary.budgetBreakdown.activities}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Transport:</span>
                        <span className="font-semibold ml-2">₹{itinerary.budgetBreakdown.transportation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {itinerary.days.map((day, dayIndex) => (
                      <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                          {day.title}
                        </h3>
                        <div className="space-y-4">
                          {day.activities.map((activity) => (
                            <div key={activity.id}>
                              {editingActivity && editingActivity.activityId === activity.id ? (
                                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                                  <input
                                    type="time"
                                    value={editingActivity.time}
                                    onChange={(e) => setEditingActivity({...editingActivity, time: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                  />
                                  <input
                                    type="text"
                                    value={editingActivity.title}
                                    onChange={(e) => setEditingActivity({...editingActivity, title: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Title"
                                  />
                                  <textarea
                                    value={editingActivity.description}
                                    onChange={(e) => setEditingActivity({...editingActivity, description: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                    rows="2"
                                    placeholder="Description"
                                  />
                                  <input
                                    type="text"
                                    value={editingActivity.duration}
                                    onChange={(e) => setEditingActivity({...editingActivity, duration: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Duration"
                                  />
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={saveEditActivity}
                                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm"
                                    >
                                      <Save className="w-4 h-4 mr-1" />
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingActivity(null)}
                                      className="flex items-center px-3 py-1 bg-gray-500 text-white rounded text-sm"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex group hover:bg-gray-50 p-2 rounded">
                                  <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-600">
                                    {activity.time}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {activity.duration}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEditActivity(dayIndex, activity)}
                                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteActivity(dayIndex, activity.id)}
                                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {isAddingActivity && isAddingActivity.dayIndex === dayIndex ? (
                            <div className="bg-green-50 p-4 rounded-lg space-y-3">
                              <input
                                type="time"
                                value={isAddingActivity.time}
                                onChange={(e) => setIsAddingActivity({...isAddingActivity, time: e.target.value})}
                                className="w-full px-3 py-2 border rounded"
                              />
                              <input
                                type="text"
                                value={isAddingActivity.title}
                                onChange={(e) => setIsAddingActivity({...isAddingActivity, title: e.target.value})}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Activity title"
                              />
                              <textarea
                                value={isAddingActivity.description}
                                onChange={(e) => setIsAddingActivity({...isAddingActivity, description: e.target.value})}
                                className="w-full px-3 py-2 border rounded"
                                rows="2"
                                placeholder="Description"
                              />
                              <input
                                type="text"
                                value={isAddingActivity.duration}
                                onChange={(e) => setIsAddingActivity({...isAddingActivity, duration: e.target.value})}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Duration"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={saveNewActivity}
                                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm"
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Add
                                </button>
                                <button
                                  onClick={() => setIsAddingActivity(null)}
                                  className="flex items-center px-3 py-1 bg-gray-500 text-white rounded text-sm"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startAddActivity(dayIndex)}
                              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Activity
                            </button>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Daily Tips:</p>
                            <button
                              onClick={() => addTip(dayIndex)}
                              className="text-xs text-orange-600 hover:text-orange-700 flex items-center"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Tip
                            </button>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {day.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start group">
                                <span className="text-orange-600 mr-2">•</span>
                                <span className="flex-1">{tip}</span>
                                <button
                                  onClick={() => deleteTip(dayIndex, tipIndex)}
                                  className="opacity-0 group-hover:opacity-100 ml-2 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        General Recommendations
                      </h3>
                      <button
                        onClick={addRecommendation}
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </button>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {itinerary.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start group">
                          <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{rec}</span>
                          <button
                            onClick={() => deleteRecommendation(idx)}
                            className="opacity-0 group-hover:opacity-100 ml-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryGenerator;