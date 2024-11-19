import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEcom } from '../../context/EcomContext';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import useLocalStorage from '../../hooks/useLocalStorage';

const ThankYou = () => {
  const { currentBooking, setCurrentBooking } = useEcom();
  const navigate = useNavigate();
  const location = useLocation();
  const { getAuthToken } = useAuth();
  const { getItem, removeItem } = useLocalStorage();
  const [timeLeft, setTimeLeft] = useState(60);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const verificationAttempted = useRef(false);
  

  useEffect(() => {
    const verifyPayment = async () => {

      if (verificationAttempted.current) {
        return;
      }

      try {
        const params = new URLSearchParams(location.search);
        const transaction_id = params.get('transaction_id');
        const tx_ref = params.get('tx_ref');
        const status = params.get('status');
    
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token is missing');
        }

        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenData._id;
    
        console.log('Payment verification params:', {
          transaction_id,
          tx_ref,
          status,
          userId
        });
    
        if (!transaction_id || !tx_ref) {
          throw new Error('Missing transaction details');
        }
    
        if (status !== 'successful') {
          throw new Error(`Payment status: ${status}`);
        }

        verificationAttempted.current = true;
    
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
          
          
          const storedBooking = localStorage.getItem('currentBooking');
          if (storedBooking) {
            localStorage.removeItem('currentBooking');
          }
          removeItem('tempBookingDetails');
        } else {
          throw new Error(response.data.msg || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        
        if (error.response?.data?.msg === 'Payment already verified' || 
            error.message === 'Payment already verified') {
          setVerificationStatus('success');
          setBooking(error.response?.data?.booking || null);
        } else {
          setVerificationStatus('failed');
          setError(error.message || 'Payment verification failed. Please contact support.');
        }
      }
    };

    verifyPayment();
  }, [location, getAuthToken, removeItem]);

  useEffect(() => {
    if (verificationStatus !== 'success') return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          navigate('/');
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, verificationStatus]);

  if (verificationStatus === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-4">Verifying your payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your transaction.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-4 text-red-600">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-6">
              If you believe this is an error, please take a screenshot of this page 
              and contact our support team with your transaction details.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/booking')} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Booking Again
              </button>
              <Link
                to="/contact"
                className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <svg className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold mb-4 text-cyan-600">Thank You!</h1>
          <p className="mb-4">
            Your payment has been successfully processed and your booking is confirmed.
          </p>
          <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Booking Details:</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Booking ID:</span> {booking.bookingId}</p>
              <p><span className="font-medium">Amount Paid:</span> ₦{booking.amount?.toLocaleString()}</p>
              <p><span className="font-medium">Check-in:</span> {new Date(booking.checkInDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Check-out:</span> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Guest Name:</span> {booking.Name}</p>
              <p><span className="font-medium">Number of Guests:</span> {booking.guests}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            A confirmation email has been sent to your registered email address.
          </p>
          <p className="mb-4 text-gray-600">
            Redirecting to homepage in {timeLeft} seconds...
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;