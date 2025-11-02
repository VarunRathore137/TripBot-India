# TripBot-India an Incredible India Trip Planner

An AI-powered travel itinerary generator focused exclusively on Indian destinations. Create personalized, detailed travel plans with the ability to fully customize every aspect of your journey.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Generation**: Leverages OpenAI GPT models to create intelligent, context-aware itineraries
- **India-Focused**: Curated list of 20+ major Indian destinations with local insights
- **Fully Customizable**: Edit, add, or remove any activity, tip, or recommendation
- **Real-time Updates**: All changes reflect immediately without page refresh
- **Budget Planning**: Automatic budget breakdown in Indian Rupees (₹)
- **Smart Validation**: Form validation with helpful error messages

### 🛠️ Customization Options
- ✏️ **Edit Activities**: Modify time, title, description, and duration of any activity
- ➕ **Add Activities**: Insert new activities into any day with automatic time sorting
- 🗑️ **Delete Activities**: Remove unwanted activities with a single click
- 📝 **Manage Tips**: Add or remove daily travel tips
- 💡 **Edit Recommendations**: Customize general travel recommendations
- 🎨 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 📊 Travel Preferences
- Destination selection from major Indian cities
- Customizable trip duration (1-30+ days)
- Number of travelers
- Budget specification in INR
- Travel pace (Relaxed, Moderate, Packed)
- Multiple interest categories:
  - Heritage & Temples
  - Adventure & Trekking
  - Indian Cuisine
  - Wildlife Safari
  - Shopping & Markets
  - Bollywood
  - Photography
  - Yoga & Wellness
  - Museums & Art
  - Beaches
  - Hill Stations
  - Festivals

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/india-trip-planner.git
cd india-trip-planner
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:3001
```

4. **Run the application**
```bash
npm start
# or
yarn start
```

The app will open at `http://localhost:3000`

## 🔌 API Integration

### Option 1: Backend API (Recommended - Secure)

#### Step 1: Create Backend Server

Create a new folder `backend` and set up:

```bash
mkdir backend
cd backend
npm init -y
npm install express openai cors dotenv
```

Create `backend/server.js`:

```javascript
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { destination, duration, budget, travelers, interests, pace, startDate } = req.body;

    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}, India.

Details:
- Number of travelers: ${travelers}
- Budget: ₹${budget}
- Travel pace: ${pace}
- Interests: ${interests.join(', ')}
- Start date: ${startDate}

Provide a JSON response with:
1. title (string)
2. overview (string)
3. days (array) - each with day number, title, activities (id, time, title, description, duration), and tips array
4. budgetBreakdown (object) - accommodation, food, activities, transportation
5. recommendations (array of strings)

Ensure all activities have unique IDs in format "d{day}-a{number}".`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Indian travel planner. Create detailed, practical itineraries with authentic local experiences. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const itinerary = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, itinerary });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Create `backend/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

#### Step 2: Update Frontend API Call

In the React component, locate the `generateItinerary` function and replace the mock data section with:

```javascript
const generateItinerary = async () => {
  if (!validateForm()) {
    return;
  }

  setIsLoading(true);
  setApiError(null);

  try {
    const response = await fetch('http://localhost:3001/api/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: formData.destination,
        duration: formData.duration,
        budget: formData.budget,
        travelers: formData.travelers,
        interests: formData.interests,
        pace: formData.pace,
        startDate: formData.startDate
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate itinerary');
    }

    const data = await response.json();
    
    if (data.success) {
      setItinerary(data.itinerary);
    } else {
      throw new Error(data.error);
    }

  } catch (error) {
    setApiError('Failed to generate itinerary. Please try again or check your API connection.');
    console.error('API Error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

#### Step 3: Run Both Servers

Terminal 1 (Backend):
```bash
cd backend
node server.js
```

Terminal 2 (Frontend):
```bash
npm start
```

### Option 2: Direct Frontend Call (Not Recommended - Insecure)

⚠️ **Warning**: This exposes your API key in the frontend. Only use for testing!

Replace the API call section in `generateItinerary` with direct OpenAI API call (see implementation details in code comments).

## 📁 Project Structure

```
india-trip-planner/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── ItineraryGenerator.jsx    # Main component
│   ├── App.js
│   └── index.js
├── backend/                           # Backend server (optional)
│   ├── server.js
│   ├── .env
│   └── package.json
├── .env
├── package.json
└── README.md
```

## 🎨 UI Components

### Home Page
- Hero section with app overview
- Feature highlights
- Call-to-action button

### Planner Page
- **Left Panel**: Input form with all travel preferences
- **Right Panel**: Generated itinerary with full customization controls

## 🔧 Customization

### Adding More Destinations

Edit the `indianDestinations` array in the component:

```javascript
const indianDestinations = [
  'Your City, State',
  // ... existing cities
];
```

### Modifying Interest Categories

Update the `interestOptions` array:

```javascript
const interestOptions = [
  'Your Interest',
  // ... existing interests
];
```

### Styling

The project uses Tailwind CSS utility classes. Modify colors and styles directly in the JSX:

```javascript
className="bg-orange-600 hover:bg-orange-700"  // Change colors here
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure your OpenAI API key is correctly set in `.env`
   - Check if the key has sufficient credits

2. **CORS Error**
   - Make sure the backend server is running
   - Verify CORS is enabled in your backend

3. **JSON Parse Error**
   - The AI response might not be valid JSON
   - Add error handling to parse and validate the response

4. **Activities Not Updating**
   - Check React state updates
   - Ensure unique IDs for all activities

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Your Name - [Varun Rathore](https://www.linkedin.com/in/varun-rathore137/)

Project Link: [https://github.com/VarunRathore137/TripBot-India.git](https://github.com/VarunRathore137/TripBot-India.git)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT API
- [Lucide React](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- Indian tourism board for destination insights

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Documentation](https://react.dev/)
- [Incredible India Tourism](https://www.incredibleindia.org/)

---

Made with ❤️ for travelers exploring Incredible India