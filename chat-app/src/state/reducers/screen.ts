// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SreenState {
  smallScreen: boolean;
  profile: boolean | null;
  newGroup: boolean;
  info: boolean;
}

const initialState: SreenState = {
  smallScreen: true,
  profile: null,
  newGroup: false,
  info: false,
};

const authSlice = createSlice({
  name: 'screen',
  initialState,
  reducers: {
    setSmallScreen: (state, action: PayloadAction<boolean>) => {
      state.smallScreen = action.payload;
    },
    setProfile: (state, action: PayloadAction<boolean | null>) => {
      state.profile = action.payload;
    },
    setNewGroup: (state, action: PayloadAction<boolean>) => {
      state.newGroup = action.payload;
    },
    setInfo: (state, action: PayloadAction<boolean>) => {
      state.info = action.payload;
    },
  },
});

export const { setSmallScreen, setProfile, setNewGroup, setInfo } =
  authSlice.actions;

export default authSlice.reducer;
