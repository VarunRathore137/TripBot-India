# SmartYatra Project Setup and Architecture Guide

## Table of Contents
1. [Project Preparation Checklist](#project-preparation-checklist)
2. [System Architecture Documentation](#system-architecture-documentation)
3. [Development Workflow](#development-workflow)

## Project Preparation Checklist

### 1. Development Environment Setup
- [ ] Install Node.js ≥ 18.x
  ```bash
  # Verify installation
  node --version
  npm --version
  ```
- [ ] Install Git for version control
- [ ] Install Docker for containerization
- [ ] Setup IDE (recommended: VS Code with extensions)
  - ESLint
  - Prettier
  - GitLens
  - Tailwind CSS IntelliSense

### 2. Project Dependencies Installation
```bash
# Clone repository
git clone https://github.com/username/smartyatra.git
cd smartyatra

# Install dependencies
npm install

# Frontend dependencies
npm install react react-dom @vitejs/plugin-react
npm install @reduxjs/toolkit react-redux
npm install tailwindcss framer-motion
npm install @lucide/react
npm install @react-google-maps/api

# Backend dependencies
npm install express mongoose
npm install jsonwebtoken bcryptjs
npm install openai
npm install winston helmet express-validator
```

### 3. Configuration Setup
- [ ] Create environment files
  ```bash
  # Development (.env.development)
  VITE_APP_ENV=development
  VITE_API_URL=http://localhost:5000
  MONGO_URI=your_mongodb_uri
  OPENAI_API_KEY=your_api_key
  GOOGLE_MAPS_API_KEY=your_maps_key
  PORT=5000

  # Production (.env.production)
  VITE_APP_ENV=production
  VITE_API_URL=https://api.smartyatra.com
  MONGO_URI=your_production_mongodb_uri
  ```

- [ ] Setup MongoDB Atlas
  1. Create MongoDB Atlas account
  2. Create new cluster
  3. Configure network access
  4. Create database user
  5. Get connection string

- [ ] Configure API Keys
  1. Google Maps API key
  2. OpenAI API key
  3. Store in secure environment variables

### 4. Team Collaboration Setup
- [ ] Setup GitHub repository
  - Initialize with README.md
  - Add .gitignore file
  - Configure branch protection rules
  - Setup issue templates
  - Configure GitHub Actions

- [ ] Configure Code Quality Tools
  ```bash
  # ESLint setup
  npm install -D eslint
  npx eslint --init

  # Prettier setup
  npm install -D prettier
  ```

## System Architecture Documentation

### High-Level Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │     Backend     │     │    Database     │
│   (React.js)    │────▶│   (Express.js)  │────▶│   (MongoDB)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                        │
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    UI Layer     │     │  Business Logic │     │   Data Layer    │
│  Components &   │     │     Services    │     │    Schemas &    │
│     State      │     │    & Models     │     │   Validation    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Component Responsibilities

#### Frontend Components
1. **UI Layer**
   - React components using Tailwind CSS
   - Framer Motion for animations
   - Responsive design implementation
   - Accessibility features (ARIA, keyboard navigation)

2. **State Management**
   - Redux Toolkit for global state
   - React Query for API data caching
   - Local state for component-specific data

3. **Map Integration**
   - Google Maps JavaScript API integration
   - Custom markers and overlays
   - Route visualization
   - Location-based services

#### Backend Services
1. **API Layer**
   - RESTful endpoints
   - Request validation
   - Authentication middleware
   - Error handling

2. **Business Logic**
   - Itinerary generation algorithms
   - AI/ML model integration
   - Data processing and transformation
   - Business rule enforcement

3. **Data Access Layer**
   - MongoDB interactions via Mongoose
   - Data validation
   - Schema enforcement
   - Query optimization

### Data Flow
1. **User Interaction Flow**
   ```
   User Input → Frontend Validation → API Request → Backend Processing → 
   Database Operation → Response Processing → UI Update
   ```

2. **Authentication Flow**
   ```
   Login Request → JWT Generation → Token Storage → 
   Protected Route Access → Token Validation
   ```

3. **Itinerary Generation Flow**
   ```
   User Preferences → AI Model Processing → Route Optimization → 
   Weather/Crowd Data Integration → Final Itinerary Generation
   ```

## Development Workflow

### 1. Feature Development Process
1. **Feature Planning**
   - Create feature branch from dev
   - Document requirements
   - Create technical design

2. **Implementation**
   - Follow coding standards
   - Write unit tests
   - Implement feature
   - Document changes

3. **Quality Assurance**
   - Run local tests
   - Perform code review
   - Update documentation
   - Verify accessibility

### 2. Git Workflow
```
main (production)
  └── dev (development)
       └── feature/feature-name
       └── bugfix/bug-name
```

- **Branch Naming**
  - Features: `feature/feature-name`
  - Bugs: `bugfix/bug-name`
  - Releases: `release/v1.x.x`

- **Commit Guidelines**
  ```
  feat: Add new feature
  fix: Bug fix
  docs: Documentation changes
  style: Code style changes
  refactor: Code refactoring
  test: Test cases
  chore: Build tasks, etc.
  ```

### 3. Testing Strategy
1. **Unit Testing**
   - Jest for component testing
   - Test coverage > 80%
   - Mock external dependencies

2. **Integration Testing**
   - Mocha + Chai for API testing
   - End-to-end scenarios
   - Database interactions

3. **E2E Testing**
   - Cypress for UI testing
   - Critical user journeys
   - Cross-browser testing

### 4. CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: CI/CD Pipeline

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment steps
```

### 5. Quality Gates
- All tests passing
- Code coverage > 80%
- No security vulnerabilities
- ESLint/Prettier compliance
- Performance benchmarks met
- Accessibility standards met

---

## Verification Checklist

### Environment Setup
- [ ] Node.js and npm installed correctly
- [ ] All dependencies installed successfully
- [ ] Environment variables configured
- [ ] Database connection established
- [ ] API keys verified and working

### Development Tools
- [ ] Git configured correctly
- [ ] ESLint/Prettier working
- [ ] IDE extensions installed
- [ ] Test runners operational
- [ ] Build process successful

### Application Verification
- [ ] Frontend dev server starts
- [ ] Backend API responds
- [ ] Database queries work
- [ ] Authentication flow complete
- [ ] Core features functional

---

Version: 1.0.0
Last Updated: 2024-03-30