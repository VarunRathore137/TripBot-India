export const SelectNoOfPersons = [
  { value: "Solo", label: "Solo" },
  { value: "Couple", label: "Couple" },
  { value: "Family", label: "Family" },
  { value: "Group", label: "Group" },
];

export const SelectBudgetOptions = [
  { value: "Budget", label: "Budget" },
  { value: "Mid-Range", label: "Mid-Range" },
  { value: "Luxury", label: "Luxury" },
];

export const PROMPT = `I want you to act as a travel planner. I will provide you with the following information:
1. Location: {location}
2. Number of days: {noOfDays}
3. Number of people: {People}
4. Budget preference: {Budget}

Based on this information, I want you to create a detailed day-by-day itinerary in JSON format. The itinerary should include:

1. A brief overview of the destination
2. Day-by-day activities with:
   - Morning activities
   - Afternoon activities
   - Evening activities
   - Recommended restaurants for each meal
   - Estimated costs for activities and meals
   - Travel tips and notes
3. Total estimated budget
4. Best time to visit
5. Travel tips specific to the destination

Please ensure the activities are suitable for the specified number of people and align with the budget preference. Include local attractions, cultural experiences, and hidden gems.

Format the response as a JSON object with the following structure:
{
  "destination_overview": "string",
  "best_time_to_visit": "string",
  "daily_itinerary": [
    {
      "day": "number",
      "morning": {
        "activity": "string",
        "description": "string",
        "estimated_cost": "number",
        "restaurant_recommendation": {
          "name": "string",
          "cuisine": "string",
          "estimated_cost": "number"
        }
      },
      "afternoon": {
        "activity": "string",
        "description": "string",
        "estimated_cost": "number",
        "restaurant_recommendation": {
          "name": "string",
          "cuisine": "string",
          "estimated_cost": "number"
        }
      },
      "evening": {
        "activity": "string",
        "description": "string",
        "estimated_cost": "number",
        "restaurant_recommendation": {
          "name": "string",
          "cuisine": "string",
          "estimated_cost": "number"
        }
      },
      "travel_tips": "string"
    }
  ],
  "total_estimated_budget": "number",
  "general_travel_tips": [
    "string"
  ]
}`;