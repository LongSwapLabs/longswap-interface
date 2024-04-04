import store from '../../store';
import { setCandles, setGranularity } from '../../store/reducers/trade';
import { getPriceScale } from '../../utils/amount';
import { setLocalInterval } from './helper';
import { getCandles } from "../../services/token";

const configJSON = {
  supports_search: false,
  supports_time: true,
  supports_timescale_marks: true,
  supports_group_request: false,
  supports_marks: false,
  supported_resolutions: ['1', '5', '10', '15', '30', '60', '240', '1D', '1W', '1M'],
};

const symbolResolveJSON = {
  name: 'BTC/USDT',
  ticker: 'BTC/USDT',
  type: 'dex',
  session: '24x7',
  timezone: 'Asia/Shanghai',
  format: 10,
  minmov: 1,
  minmove2: 0,
  pointvalue: 1,
  pricescale: Math.pow(10, 3),
  has_intraday: true,
  volume_precision: 10,
  has_daily: true,
  has_empty_bars: false,
  has_no_volume: false,
  has_weekly_and_monthly: true,
  data_status: 'streaming',
  supported_resolutions: ['1', '5', '10', '15', '30', '60', '240', '1D', '1W', '1M'],
};

// 解析周期到秒钟
function periodLengthSeconds(resolution, requiredPeriodsCount = 1) {
  if (resolution.indexOf('D') >= 0) {
    return requiredPeriodsCount * 24 * 60 * 60;
  } else if (resolution.indexOf('M') >= 0) {
    return 30 * requiredPeriodsCount * 24 * 60 * 60;
  } else if (resolution.indexOf('W') >= 0) {
    return 7 * requiredPeriodsCount * 24 * 60 * 60;
  }

  return resolution * requiredPeriodsCount * 60;
}

export class UDFCompatibleDatafeed {
  // 构造函数
  constructor(token) {
    this.token = token;
    this.subs = {};

    this.config = configJSON;
  }

  onReady(callback) {
    setTimeout(() => {
      callback(this.config);
    }, 0);
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    onResultReadyCallback([]);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    let symbol = JSON.parse(JSON.stringify(symbolResolveJSON));

    symbol.name = `${this.token.symbol}/BNB`;
    symbol.ticker = symbol.name;
    symbol.pro_name = symbol.name;

    if (this.token) {
      symbol.pricescale = getPriceScale(this.token.price);
    } else {
      symbol.pricescale = Math.pow(10, 3);
    }

    setTimeout(() => {
      onSymbolResolvedCallback(symbol);
    }, 0);
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    let second = periodLengthSeconds(resolution);
    if (second <= 0) {
      onHistoryCallback([], {noData: true});
      return;
    }

    setLocalInterval(resolution);

    store.dispatch(setGranularity(second));

    const returnBars = () => {
      let bars = [];

      const candles = store.getState().trade.candles;
      candles && candles.forEach(item => {
        bars.push({
          time: item[0] * 1000,
          close: item[4],
          open: item[3],
          high: item[2],
          low: item[1],
          volume: item[5],
        });
      });

      bars.reverse();
      return bars;
    };

    let history = returnBars();

    if (this.resolution !== resolution) {
      this.resolution = resolution;
      history = [];
    }

    if (history.length > 0) {
      if (history[0].time > to * 1000) {
        onHistoryCallback([], {noData: true});
      } else {
        onHistoryCallback(history, {noData: false});
      }
      return;
    }

    this.resolution = resolution;

    getCandles(this.token.address, {granularity: second, limit: 1000}).then(rsp => {
      if (rsp.data.code === 0) {
        store.dispatch(setCandles(rsp.data.data));

        history = returnBars();
        if (history.length > 0) {
          onHistoryCallback(returnBars(), {noData: false});
        } else {
          onHistoryCallback([], {noData: true});
        }
      }
    });
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) {
    this.subs[subscribeUID] = setInterval(() => {
      const candles = store.getState().trade.candles;

      if (candles && candles.length) {
        let item = candles[0];

        onRealtimeCallback({
          time: item[0] * 1000,
          close: item[4],
          open: item[3],
          high: item[2],
          low: item[1],
          volume: item[5],
        });
      }
    }, 50);
  }

  unsubscribeBars(subscriberUID) {
    if (this.subs[subscriberUID]) {
      clearInterval(this.subs[subscriberUID]);
    }
  }
}
