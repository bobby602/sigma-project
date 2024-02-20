"use client";
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'tw-elements';
import { AuthContextProvider } from './Store/auth-context';
import {Provider} from 'react-redux';
import store from './Store';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCheck}from '@fortawesome/free-solid-svg-icons';
// import ErrorBoundary from './ErrorBoundary/ErrorBoundary';
import { ErrorBoundary } from "react-error-boundary";
import ErrorPage from './ErorrHandle/ErrorPage';
import ErrorComponent from './ErrorBoundary/ErrorComponent'


library.add(faCheck)


const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <ErrorBoundary FallbackComponent={ErrorPage} onReset={() => (location.href = '/')}>
    <Provider store={store}>
      <AuthContextProvider>
          <App />
          
      </AuthContextProvider>  
    </Provider>
  </ErrorBoundary> 
 
);

