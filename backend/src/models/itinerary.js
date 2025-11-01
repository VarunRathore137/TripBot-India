import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  startTime: Date,
  endTime: Date,
  category: {
    type: String,
    enum: ['sightseeing', 'food', 'activity', 'transport', 'accommodation']
  },
  cost: {
    amount: Number,
    currency: String
  },
  bookingInfo: {
    url: String,
    phone: String,
    email: String
  }
});

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  activities: [activitySchema],
  notes: String
});

const itinerarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    name: {
      type: String,
      required: true
    },
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: [daySchema],
  budget: {
    amount: Number,
    currency: String
  },
  preferences: {
    travelStyle: String,
    accommodation: String,
    transportation: String
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'in-progress', 'completed'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String
  }]
}, {
  timestamps: true
});

// Calculate duration in days
itinerarySchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Calculate total cost
itinerarySchema.virtual('totalCost').get(function() {
  return this.days.reduce((total, day) => {
    return total + day.activities.reduce((dayTotal, activity) => {
      return dayTotal + (activity.cost?.amount || 0);
    }, 0);
  }, 0);
});

export const Itinerary = mongoose.model('Itinerary', itinerarySchema);