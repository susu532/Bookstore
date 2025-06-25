import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Books from './pages/Books';
import Book from './pages/Book';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Emprunts from './pages/Emprunts';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import HomePrivateRoute from './components/HomePrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePrivateRoute><Home /></HomePrivateRoute>} />
        <Route path="/books" element={<Books />} />
        <Route path="/book/:id" element={<Book />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/emprunts" element={<Emprunts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/register" element={<Register />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
