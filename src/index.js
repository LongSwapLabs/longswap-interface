import React from 'react';
import ReactDOM from 'react-dom/client';
import "@fontsource/roboto";
import './index.css';
import './i18n';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Providers from "./Providers";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Providers>
      <App />
    </Providers>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
