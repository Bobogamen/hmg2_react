import React from 'react';
import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoadingProvider } from './loader/LoadingContext';
import { UserProvider } from './user/UserContext';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <UserProvider>
        <LoadingProvider>
            <App />
        </LoadingProvider>
    </UserProvider>
);
