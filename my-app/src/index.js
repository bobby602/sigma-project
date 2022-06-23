import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'tw-elements';
import { AuthContextProvider } from './Store/auth-context';
import {Provider} from 'react-redux';
import store from './Store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faCheck}from '@fortawesome/free-solid-svg-icons'

library.add(faCheck)

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <AuthContextProvider>
        <App />
    </AuthContextProvider>  
  </Provider>  
);
// serviceWorkerRegistration.register();
// swDev();

