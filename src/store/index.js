import { configureStore } from '@reduxjs/toolkit';

import trade from './reducers/trade';

export default configureStore({
  reducer: {
    trade,
  },
});
