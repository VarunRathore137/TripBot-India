import React from 'react';

export const tripTypes = [
  { value: 'leisure', label: 'Leisure' },
  { value: 'business', label: 'Business' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'educational', label: 'Educational' }
];

export const budgetRanges = [
  { value: 'budget', label: 'Budget (₹0 - ₹20,000)' },
  { value: 'moderate', label: 'Moderate (₹20,000 - ₹50,000)' },
  { value: 'luxury', label: 'Luxury (₹50,000+)' }
];

export const tripDurations = [
  { value: '1-3', label: '1-3 days' },
  { value: '4-7', label: '4-7 days' },
  { value: '8-14', label: '8-14 days' },
  { value: '15+', label: '15+ days' }
];

export const popularDestinations = [
  { value: 'goa', label: 'Goa' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'himachal', label: 'Himachal Pradesh' },
  { value: 'andaman', label: 'Andaman & Nicobar' }
];

export const PROMPT = `Create a detailed travel itinerary for {location} for {noOfDays} days. The trip is for {People} with a budget of {Budget}. Include the following details:
1. Day-wise breakdown of activities
2. Recommended places to visit
3. Estimated costs for activities and accommodations
4. Local cuisine recommendations
5. Travel tips and cultural considerations

Please format the response as a JSON object with the following structure:
{
  "destination": "Location name",
  "duration": "Number of days",
  "budget": "Budget range",
  "travelers": "Type of travelers",
  "overview": "Brief trip overview",
  "dailyItinerary": [
    {
      "day": "Day number",
      "activities": ["List of activities"],
      "meals": {
        "breakfast": "Recommendation",
        "lunch": "Recommendation",
        "dinner": "Recommendation"
      },
      "accommodation": "Hotel/stay recommendation",
      "estimatedCosts": "Cost breakdown"
    }
  ],
  "travelTips": ["List of tips"],
  "culturalNotes": ["Cultural considerations"],
  "totalEstimatedCost": "Total trip cost"
}`;