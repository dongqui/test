import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
// import rootReducer from './rootReducer';

import rootReducer from 'reducers';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    // serializableCheck: {
    //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    // },
    serializableCheck: false,
    immutableCheck: false,
  }),
});

export default store;
