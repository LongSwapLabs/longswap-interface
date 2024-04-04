import { createSlice } from '@reduxjs/toolkit';
import Decimal from 'decimal.js';

export const tradeSlice = createSlice({
  name: 'candle',
  initialState: {
    token: null,
    ticker: null,
    granularity: 60,
    candles: [],
    swaps: [],
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.ticker = action.payload;
      state.candles = [];
      state.swaps = [];
    },
    setCandles: (state, action) => {
      state.candles = action.payload;
    },
    setGranularity: (state, action) => {
      state.granularity = action.payload;
    },
    setSwaps: (state, action) => {
      state.swaps = action.payload;
    },
    newTrade: (state, action) => {
      const swap = action.payload;

      if (state.token && swap.token !== state.token.address) {
        return;
      }

      if (state.swaps.length) {
        state.swaps.unshift(swap);
      } else {
        state.swaps = [swap];
      }

      if (state.swaps.length > 50) {
        state.swaps = state.swaps.slice(0, 50);
      }

      const price = new Decimal(swap.price);
      const size = new Decimal(swap.volume);
      const time = swap.timestamp - (swap.timestamp % state.granularity);

      if (state.candles.length) {
        const last = state.candles[0];

        if (time !== last[0]) {
          state.candles.unshift(
            [time, price.toString(), price.toString(), last[4], price.toString(), size.toString()]);
        } else {
          state.candles[0] = [
            last[0],
            Decimal.min(last[1], price).toString(),
            Decimal.max(last[2], price).toString(),
            last[3],
            price.toString(),
            size.add(last[5]).toString(),
          ];
        }
      } else {
        state.candles = [
          [time, price.toString(), price.toString(), price.toString(), price.toString(), size.toString()],
        ];
      }
    },
    newTicker: (state, action) => {
      state.ticker = action.payload;
    },
  },
});

export const {
  setToken,
  setCandles,
  setSwaps,
  setGranularity,
  newTrade,
  newTicker,
} = tradeSlice.actions;

export default tradeSlice.reducer;