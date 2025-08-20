import { configureStore } from '@reduxjs/toolkit';
import productReducer from "../slice/data"

export const store = configureStore({
  reducer: {
products :productReducer,
  },
});
