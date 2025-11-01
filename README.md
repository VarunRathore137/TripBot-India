# TripBot-AI India

AI-powered smart tourism companion for India

## Project Setup

### Prerequisites

1. Node.js ≥ 18
2. MongoDB Atlas account
3. Google Maps API key
4. OpenAI API key

### Installation

Before running the installation commands, ensure PowerShell execution policy is properly configured:

```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then install dependencies:

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_uri
OPENAI_API_KEY=your_api_key
GOOGLE_MAPS_API_KEY=your_maps_key
PORT=5000
```

### Development

```bash
# Start frontend development server
cd frontend
npm run dev

# Start backend server
cd backend
npm run dev
```

### Testing

```bash
npm test
```

## Project Structure

```
smartyatra/
├── frontend/           # React + Vite frontend
├── backend/           # Express.js backend
├── shared/            # Shared types and utilities
└── docs/             # Project documentation
```

## Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Submit a pull request

