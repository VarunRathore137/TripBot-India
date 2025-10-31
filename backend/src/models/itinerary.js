import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required']
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180
    }
  },
  stayDuration: {
    type: Number,
    required: [true, 'Stay duration is required'],
    min: 1
  },
  activities: [{
    type: String,
    trim: true
  }]
});

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: [true, 'Rating score is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Rating comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters long'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  destinations: {
    type: [destinationSchema],
    required: [true, 'At least one destination is required'],
    validate: {
      validator: function(destinations) {
        return destinations.length > 0;
      },
      message: 'At least one destination is required'
    }
  },
  budget: {
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget amount cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Budget currency is required'],
      uppercase: true,
      length: 3
    }
  },
  travelMode: {
    type: String,
    required: [true, 'Travel mode is required'],
    enum: {
      values: ['DRIVING', 'TRANSIT', 'WALKING', 'BICYCLING', 'MIXED'],
      message: '{VALUE} is not a valid travel mode'
    }
  },
  preferences: {
    accommodation: {
      type: String,
      required: [true, 'Accommodation preference is required'],
      enum: {
        values: ['BUDGET', 'MODERATE', 'LUXURY'],
        message: '{VALUE} is not a valid accommodation preference'
      }
    },
    foodPreference: {
      type: String,
      required: [true, 'Food preference is required'],
      enum: {
        values: ['VEG', 'NON_VEG', 'VEGAN'],
        message: '{VALUE} is not a valid food preference'
      }
    },
    activityLevel: {
      type: String,
      required: [true, 'Activity level is required'],
      enum: {
        values: ['LOW', 'MODERATE', 'HIGH'],
        message: '{VALUE} is not a valid activity level'
      }
    }
  },
  tags: {
    type: [String],
    required: [true, 'At least one tag is required'],
    validate: {
      validator: function(tags) {
        return tags.length > 0 && tags.length <= 10;
      },
      message: 'Must have between 1 and 10 tags'
    }
  },
  ratings: [ratingSchema],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
itinerarySchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return null;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.score, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual for total duration in days
itinerarySchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates
itinerarySchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Index for efficient queries
itinerarySchema.index({ user: 1, startDate: -1 });
itinerarySchema.index({ tags: 1 });
itinerarySchema.index({ status: 1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;