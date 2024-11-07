import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEcom } from '../../context/EcomContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import useAuth from '../../hooks/useAuth';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { setCurrentBooking } = useEcom();
  const { getAuthToken } = useAuth();
  const { getItem } = useLocalStorage('tempBookingDetails');

  useEffect(() => {
    const initiatePayment = async (bookingData) => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Authorization token is missing');
          console.error('Token missing');
          navigate('/login');
          return;
        }

        
        console.log('Using auth token:', token);

        
        const paymentPayload = {
          userId: bookingData.userId,
          bookingId: bookingData.bookingId,
          amount: bookingData.totalAmount,
          currency: 'NGN',
          email: bookingData.email,
          phone: bookingData.phone,
          Name: bookingData.Name,
          address: bookingData.address,
          guests: bookingData.guests,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          rooms: bookingData.rooms || []
        };

        console.log("Sending payment payload:", paymentPayload);

        
        const response = await axios.post(
          'https://hotel-booking-api-p8if.onrender.com/api/payment/initiate',
          paymentPayload,
          {
            headers: {
              'auth-token': token,  
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Payment API response:', response.data);

        if (response.data.status === "success" && response.data.data?.link) {
          console.log('Redirecting to payment page:', response.data.data.link);
          
          localStorage.setItem('currentBooking', JSON.stringify(bookingData));
          
          
          window.location.href = response.data.data.link;
        } else {
          throw new Error(response.data.msg || 'Failed to initiate payment');
        }

      } catch (error) {
        console.error('Payment initiation error:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(error.response?.data?.message || error.message || 'An error occurred while initiating the payment');
        }
      } finally {
        setLoading(false);
      }
    };

    const handleBookingData = () => {
      const bookingData = location.state?.bookingData;

      if (!bookingData) {
        setError('No booking data found');
        setLoading(false);
        return;
      }

      console.log('Processing booking:', bookingData);
      initiatePayment(bookingData);
    };

    handleBookingData();
  }, [location, navigate, getAuthToken, setCurrentBooking]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Payment Processing</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading && !error && (
          <div className="flex flex-col items-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-blue-600 font-semibold text-center">
              Please wait while we redirect you to the payment gateway...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;