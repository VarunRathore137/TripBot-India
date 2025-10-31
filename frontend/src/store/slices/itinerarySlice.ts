import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Location {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  type: string
  description: string
}

interface Activity {
  id: string
  name: string
  location: Location
  startTime: string
  endTime: string
  type: string
  description: string
}

interface ItineraryDay {
  date: string
  activities: Activity[]
}

interface ItineraryState {
  currentItinerary: {
    id?: string
    name: string
    startDate: string
    endDate: string
    days: ItineraryDay[]
    budget: number
    status: 'draft' | 'confirmed' | 'in-progress' | 'completed'
  } | null
  savedItineraries: Array<{
    id: string
    name: string
    startDate: string
    endDate: string
    status: 'draft' | 'confirmed' | 'in-progress' | 'completed'
  }>
}

const initialState: ItineraryState = {
  currentItinerary: null,
  savedItineraries: [],
}

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState,
  reducers: {
    setCurrentItinerary: (state, action: PayloadAction<ItineraryState['currentItinerary']>) => {
      state.currentItinerary = action.payload
    },
    updateItineraryDetails: (
      state,
      action: PayloadAction<Partial<NonNullable<ItineraryState['currentItinerary']>>>
    ) => {
      if (state.currentItinerary) {
        state.currentItinerary = {
          ...state.currentItinerary,
          ...action.payload,
        }
      }
    },
    addActivity: (
      state,
      action: PayloadAction<{ dayIndex: number; activity: Activity }>
    ) => {
      const { dayIndex, activity } = action.payload
      if (state.currentItinerary?.days[dayIndex]) {
        state.currentItinerary.days[dayIndex].activities.push(activity)
      }
    },
    removeActivity: (
      state,
      action: PayloadAction<{ dayIndex: number; activityId: string }>
    ) => {
      const { dayIndex, activityId } = action.payload
      if (state.currentItinerary?.days[dayIndex]) {
        state.currentItinerary.days[dayIndex].activities = state.currentItinerary.days[
          dayIndex
        ].activities.filter((activity) => activity.id !== activityId)
      }
    },
    setSavedItineraries: (state, action: PayloadAction<ItineraryState['savedItineraries']>) => {
      state.savedItineraries = action.payload
    },
  },
})

export const {
  setCurrentItinerary,
  updateItineraryDetails,
  addActivity,
  removeActivity,
  setSavedItineraries,
} = itinerarySlice.actions

export default itinerarySlice.reducer