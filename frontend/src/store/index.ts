import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import itineraryReducer from './slices/itinerarySlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    itinerary: itineraryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch