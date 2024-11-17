import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoadingProvider } from './LoadingContext';
import { UserProvider } from './UserContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <UserProvider>
        <LoadingProvider>
            <App />
        </LoadingProvider>
    </UserProvider>
);
