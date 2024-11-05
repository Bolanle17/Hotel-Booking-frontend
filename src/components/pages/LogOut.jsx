import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useEcom } from '../../context/EcomContext';

const LogOut = () => {
  const { logout } = useAuth();
  const { showAndHide } = useEcom();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    showNotification("success", "You have been successfully logged out");
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [logout, showAndHide, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-800">You have been logged out</h2>
        <p className="text-center text-sm sm:text-base text-gray-700">Thank you for visiting MOAHOTELS. You will be redirected to the home page shortly.</p>
      </div>
    </div>
  );
};

export default LogOut;