import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  isAuthenticated: boolean
  user: {
    id?: string
    name?: string
    email?: string
    preferences?: {
      travelStyle?: string[]
      budget?: string
      interests?: string[]
    }
  }
}

const initialState: UserState = {
  isAuthenticated: false,
  user: {},
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState['user']>) => {
      state.isAuthenticated = true
      state.user = action.payload
    },
    clearUser: (state) => {
      state.isAuthenticated = false
      state.user = {}
    },
    updatePreferences: (state, action: PayloadAction<UserState['user']['preferences']>) => {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload,
        }
      }
    },
  },
})

export const { setUser, clearUser, updatePreferences } = userSlice.actions
export default userSlice.reducer