import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from './redux/store';
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist';

// Clean up legacy non-whitelisted persist storage keys if they exist
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('persist:root');
  }
} catch (e) {
  // Ignore localStorage errors
}

let persistor = persistStore(store);

export const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8080";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
