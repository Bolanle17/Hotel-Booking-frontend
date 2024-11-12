import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEcom } from '../../context/EcomContext';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const ThankYou = () => {
  const { currentBooking } = useEcom();
  const navigate = useNavigate();
  const location = useLocation();
  const { getAuthToken } = useAuth();
  const [timeLeft, setTimeLeft] = useState(60);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      
      try {
        const params = new URLSearchParams(location.search);
        const transaction_id = params.get('transaction_id');
        const tx_ref = params.get('tx_ref');
        const status = params.get('status');
    
        const token = getAuthToken();
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenData._id;
    
        console.log('Payment verification params:', {
          transaction_id,
          tx_ref,
          status,
          userId
        });
    
        if (!transaction_id) {
          console.error('No transaction_id found in URL');
          setError('Missing transaction ID');
          setVerificationStatus('failed');
          return;
        }
    
        if (status !== 'successful') {
          console.error('Payment status is not successful:', status);
          setError('Payment was not successful');
          setVerificationStatus('failed');
          return;
        }
    
        const response = await axios.post(
          'https://hotel-booking-api-p8if.onrender.com/api/payment/verify',
          { 
            transaction_id,
            tx_ref,
            userId  
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,  
              'auth-token': token
            }
          }
        );
        
        if (response.data.msg === "Payment Successful") {
          setVerificationStatus('success');
          setBooking(response.data.booking);
        } else {
          console.error('Verification failed:', response.data);
          setVerificationStatus('failed');
          setError(response.data.msg || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        console.error('Error response:', error.response?.data);
        setVerificationStatus('failed');
        setError(error.response?.data?.msg || 'Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
  }, [location, getAuthToken]);

  useEffect(() => {
    if (!currentBooking || verificationStatus !== 'success') return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 60000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [currentBooking, navigate, verificationStatus]);

  if (!currentBooking) {
    return <Navigate to="/" />;
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Verifying your payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your transaction.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            If you believe this is an error, please take a screenshot of this page 
            and contact our support team with your transaction details.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/booking')} 
              className="w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
            >
              Try Booking Again
            </button>
            <Link
              to="/contact"
              className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-cyan-600">Thank You!</h1>
          <p className="mb-4">
            We appreciate your business and hope you enjoy your stay with the choice of your selected hotel.
          </p>
          <p className="mb-4">
            Your booking has been confirmed and details have been sent to your email.
          </p>
          {booking && (
            <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Booking Details:</h3>
              <p>Booking ID: {booking.bookingId}</p>
              <p>Amount Paid: ₦{booking.amount.toLocaleString()}</p>
              <p>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
              <p>Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
              <p>Guest Name: {booking.Name}</p>
              <p>Number of Guests: {booking.guests}</p>
            </div>
          )}
          <p className="mb-4 text-gray-600">
            Redirecting to homepage in {timeLeft} seconds...
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-800"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;