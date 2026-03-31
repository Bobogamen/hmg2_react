import React from 'react';
import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoadingProvider } from './loader/LoadingContext';
import { UserProvider } from './user/UserContext';

import "./locales/i18n";
import Initializer from './app/Initializer';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <UserProvider>
        <LoadingProvider>
            <Initializer />
            <App />
        </LoadingProvider>
    </UserProvider>
);
