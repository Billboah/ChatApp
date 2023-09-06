import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './auth';
import chatReducer from './chat';
import screenReducer from './screen';

const rootReducer = combineReducers({
  chat: chatReducer,
  auth: authReducer,
  screen: screenReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
