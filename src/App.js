import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import Register from './components/Register';  // Import the Register component
import './App.css';
import logo from '../src/assets/images/app/logo.png';
import bills from '../src/assets/images/app/home_page/bills.png';
import expenses from '../src/assets/images/app/home_page/expenses.png';
import multiPlaces from '../src/assets/images/app/home_page/multi-places.png';
import resident from '../src/assets/images/app/home_page/resident.png';
import secure from '../src/assets/images/app/home_page/secure.png';
import surveillance from '../src/assets/images/app/home_page/surveillance.png';
import Footer from './components/Footer';
import Header from './components/Header';
import Admin from './components/Admin';
import Manager from './components/Manager';
import Finance from './components/Finance';
import Repair from './components/Repair';
import Statistic from './components/Statistic';
import Cashier from './components/Cashier';
import ForgotPassword from './components/ForgotPassword';
import Notification from './components/Notification';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Notification />
        <Routes>
          <Route path="" element={<Homepage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/repair" element={<Repair />} />
          <Route path="/statistic" element={<Statistic />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
