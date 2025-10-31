
# SmartYatra: AI-Powered Smart Tourism Companion for India

## 1. Project Overview

### Purpose
SmartYatra is an **AI-powered travel companion** designed to help tourists plan personalized itineraries, discover hidden gems, and make informed travel decisions across India. The system intelligently recommends destinations, stays, and activities based on user preferences, budget, and travel dates.

### Core Functionality
- Personalized itinerary generation using ML/LLM models
- AI-powered chat assistant for real-time itinerary updates
- Context-aware suggestions based on weather, crowd data, and transport APIs
- Smart budget and route planner with auto fare estimation
- Multilingual conversational UI

### Key Features
- Dynamic itinerary updates based on travel conditions  
- Interactive map visualization (Google Maps API)  
- Local insights with sustainable tourism suggestions  
- Community sharing of itineraries and reviews  
- Image recognition for landmark identification  

### Success Metrics
- <500ms response time for API calls  
- 90%+ recommendation accuracy (based on user feedback)  
- Seamless integration across devices  
- >85% user satisfaction rate  

---

## 2. Technical Stack Specification

### Frontend
- **Framework:** React.js (Vite)  
- **UI Library:** Tailwind CSS + Framer Motion  
- **State Management:** Redux Toolkit  
- **Map Integration:** Google Maps JavaScript API  
- **Icons:** Lucide React  

### Backend
- **Language:** Node.js (Express.js framework)  
- **AI Integration:** OpenAI GPT / Llama API for itinerary and recommendation generation  
- **APIs:** RESTful APIs for client-server communication  
- **Authentication:** JWT (JSON Web Tokens)  

### Database
- **Type:** NoSQL (MongoDB Atlas)  
- **ODM:** Mongoose  
- **Schema Design:**  
  - `User`: preferences, itinerary history, budget  
  - `Destination`: metadata, tags, coordinates, cultural insights  
  - `Itinerary`: generated plan, timestamps, visited flags  

### DevOps
- **Version Control:** GitHub  
- **CI/CD:** GitHub Actions for automated build and deployment  
- **Containerization:** Docker  
- **Cloud:** AWS (EC2 + S3) or Render for deployment  

### Testing
- **Unit Testing:** Jest  
- **Integration Testing:** Mocha + Chai  
- **E2E Testing:** Cypress  

---

## 3. Development Workflow

### Git Strategy
- **Main Branch:** Production-ready code  
- **Dev Branch:** Active development  
- **Feature Branches:** `feature/<feature-name>` for modular development  

### Code Review
- Pull Request (PR) reviews with CI checks  
- Linting and testing required before merge  

### Environment Setup
- **Local:** `.env.local` for API keys  
- **Dev:** Connected to staging DB and mock APIs  
- **Prod:** Uses optimized build with secure keys  

### Dependency Management
```bash
npm install
npm run dev
```

---

## 4. Implementation Guide

### Architecture Overview
```
Frontend (React + Tailwind)
     |
     |--> REST API (Express.js)
     |
     |--> AI Model (LLM / ML Engine)
     |
     |--> MongoDB (Data Layer)
```

### Key Modules
- `RecommendationEngine.js` – ML-based place and itinerary suggestions  
- `ChatAgent.js` – AI conversational assistant  
- `MapComponent.jsx` – Google Maps visualization  
- `ItineraryManager.js` – Dynamic schedule updates  

### API Endpoints
| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/register` | POST | Register a user |
| `/api/itinerary` | POST | Generate personalized itinerary |
| `/api/update` | PUT | Update based on user feedback |
| `/api/fare` | GET | Calculate auto/taxi fare |
| `/api/upload-photo` | POST | Landmark recognition |

### Data Flow
1. User submits preferences → Backend receives JSON payload  
2. ML model generates itinerary → Stored in MongoDB  
3. AI agent monitors schedule → Updates in real time  

### Error Handling
- Centralized Express middleware for validation and error response  
- Fallback UIs for API failures  
- Logging via Winston  

---

## 5. Quality Standards

### Code Style
- ESLint + Prettier enforced  
- Consistent naming conventions (camelCase for JS, PascalCase for components)

### Performance
- Lazy loading for components  
- Debouncing API calls  
- CDN for static assets

### Security
- HTTPS only  
- Input sanitization (helmet, express-validator)  
- Secure API key management via `.env`  

### Accessibility
- WCAG 2.1 AA compliant  
- ARIA labels for screen readers  
- Keyboard navigation supported  

---

## 6. Getting Started

### System Requirements
- Node.js ≥ 18  
- MongoDB Atlas account  
- Google Maps API key  
- OpenAI API key  

### Installation Steps
```bash
git clone https://github.com/username/smartyatra.git
cd smartyatra
npm install
npm run dev
```

### Configuration
Create a `.env` file:
```
MONGO_URI=your_mongodb_uri
OPENAI_API_KEY=your_api_key
GOOGLE_MAPS_API_KEY=your_maps_key
PORT=5000
```

### First Run Verification
1. Launch the app with `npm run dev`  
2. Open `http://localhost:5173`  
3. Test itinerary generation and chat assistant  
4. Verify API responses in browser dev tools  

---

**Author:** SmartYatra Dev Team  
**License:** MIT License  
**Version:** 1.0.0  
