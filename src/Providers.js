import { useNavigate } from 'react-router-dom';
import WalletProvider from "./contexts/WalletProvider";
import { NextUIProvider } from "@nextui-org/react";
import AppProvider from "./contexts/AppProvider";
import { Toaster } from "react-hot-toast";
import { Provider } from 'react-redux';
import store from './store';

import 'dayjs/locale/zh-cn';
import dayjs from "dayjs";

var relativeTime = require('dayjs/plugin/relativeTime')

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

function Providers({children}) {
  const navigate = useNavigate();

  return (
    <Provider store={store}>
      <NextUIProvider navigate={navigate}>
        <WalletProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </WalletProvider>
        <Toaster/>
      </NextUIProvider>
    </Provider>
  );
}

export default Providers;