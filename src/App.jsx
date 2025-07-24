import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './Components/Navbar';
import Footer from './Components/Footer';

import Landing from './pages/Landing';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import FriendProfile from './pages/FriendProfile';
import ChatFriend from './pages/chat';
import Login from './pages/Login';
import Register from './pages/Register';
import Payment from './pages/Payment';
import Notifications from './pages/Notifications';
import ErrorPage from './pages/Error404';
import Wishlist from './pages/Wishlist';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Single layout wrapper for all routes
const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Landing /></Layout>} />
      <Route path="/event/:id" element={<Layout><EventDetails /><Wishlist /></Layout>} />
      <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
      <Route path="/payment/:method/:id" element={<Layout><Payment /></Layout>} />
      <Route path="/chat" element={<Layout><ChatFriend /></Layout>} />
      <Route path="/friendprofile" element={<Layout><FriendProfile /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/reset-password/:uidb64/:token/" element={<ResetPassword />} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="*" element={<Layout><ErrorPage /></Layout>} />
    </Routes>
  );
};

export default App;
