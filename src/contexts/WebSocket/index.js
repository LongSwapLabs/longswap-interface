import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import store from '../../store';
import { newTicker, newTrade } from '../../store/reducers/trade';
import { useSelector } from 'react-redux';
import { WS_URL } from '../../constants';

export const Context = createContext({});

const WebsocketContext = ({children}) => {
  const token = useSelector(state => state.trade.token);

  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const subscribes = useRef([]);

  const tickerSubs = useRef([]);

  const parseMessage = (msg) => {
    msg = JSON.parse(msg.data);

    switch (msg.topic) {
      case 'swap':
        store.dispatch(newTrade(msg.data));
        break;
      case 'token':
        store.dispatch(newTicker(msg.data));
        break;
      default:
        console.log('Unknown msg', msg);
    }
  };

  const subscribeTickers = useCallback(({sid, tokens}) => {
    let sub = tickerSubs.current.find(e => e.sid === sid);
    if (!sub) {
      sub = {sid, tokens};

      tickerSubs.current.push(sub);

      if (connected) {
        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          data: {topics: tokens.map(e => (`token_ticker_${e}`))},
        }));
      }
    }
  }, [connected]);

  const unsubscribeTickers = useCallback((sid) => {
    let index = tickerSubs.current.findIndex(e => e.sid === sid);

    if (index >= 0) {
      const sub = tickerSubs.current[index];
      const tokens = sub.tokens;

      tickerSubs.current.forEach((x, i) => {
        if (i !== index) {
          x.tokens.forEach(id => {
            for (let j = 0; j < tokens.length; j++) {
              if (tokens[j] === id) {
                tokens.splice(j, 1);
                break;
              }
            }
          });
        }
      });

      if (connected) {
        wsRef.current.send(JSON.stringify({
          type: 'unsubscribe',
          data: {topics: tokens.map(e => (`token_ticker_${e}`))},
        }));
      }

      tickerSubs.current.splice(index, 1);
    }
  }, [connected]);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (msg) => {
        setTimeout(() => parseMessage(msg), 0);
      };

      ws.onclose = (e) => {
        console.log(e);
        setConnected(false);
      };

      ws.onerror = (e) => {
        console.log(e);
        setConnected(false);
      };

      wsRef.current = ws;
    };

    if (!wsRef.current) {
      connect();
    }

    // Scheduled reconnection
    const inc = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState !== 1) {
        connect();
      }
    }, 5000);

    return () => {
      clearInterval(inc)
      if (wsRef.current.readyState) {
        wsRef.current.close()
      }
    };
  }, []);

  useEffect(() => {
    if (connected) {
      // Unsubscribe
      if (subscribes.current.length) {
        wsRef.current.send(JSON.stringify({
          type: 'unsubscribe',
          data: {topics: subscribes.current},
        }));
      }

      // Currently subscribed
      if (token) {
        subscribes.current = [`swap_${token.address}`, `token_${token.address}`];

        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          data: {topics: subscribes.current},
        }));
      }
    }
  }, [connected, token]);

  return (
    <Context.Provider value={{subscribeTickers, unsubscribeTickers}}>
      {children}
    </Context.Provider>
  );
};

export default WebsocketContext;
