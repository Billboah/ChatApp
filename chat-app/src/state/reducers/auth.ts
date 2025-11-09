// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
}

const storedUser =
  typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;

let parsedUser = null;

try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
  console.error('Error parsing stored user:', error);
}

const initialState: AuthState = {
  user: parsedUser,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;

      if (typeof localStorage !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('user', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('user');
        }
      }
    },
    logoutUser: (state) => {
      state.user = null;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;
