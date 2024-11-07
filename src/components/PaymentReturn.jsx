import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEcom } from '../context/EcomContext';

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentBooking, currentBooking } = useEcom();
  const [verificationStatus, setVerificationStatus] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const transaction_id = searchParams.get('transaction_id');
      const tx_ref = searchParams.get('tx_ref');
      try {
        if (!currentBooking) {
          console.error('Current booking information is missing');
          setVerificationStatus('Error: Booking information is missing. Please try again or contact support.');
          return;
        }
        const { guests, checkInDate, checkOutDate, rooms } = currentBooking;
        if (!guests || !checkInDate || !checkOutDate || !rooms) {
          console.error('Some required booking details are missing', { guests, checkInDate, checkOutDate, rooms });
          setVerificationStatus('Error: Some booking details are missing. Please try again or contact support.');
          return;
        }
        const res = await fetch('https://hotel-booking-api-p8if.onrender.com/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify({
            transaction_id,
            bookingId: tx_ref,
            guests,
            checkInDate,
            checkOutDate,
            rooms
          }),
        });
        const data = await res.json();
        console.log('API response:', data);
        if (data.msg === "Payment Successful" || data.msg === "Payment already verified") {
          setCurrentBooking(data.booking);
          setVerificationStatus('Payment verified successfully. Redirecting...');
          setTimeout(() => navigate('/thankyou'), 2000);
        } else if (data.msg === "Payment already processed") {
          setVerificationStatus('This payment has already been processed. Redirecting...');
          setTimeout(() => navigate('/thankyou'), 2000);
        } else {
          setVerificationStatus('Payment verification failed. Redirecting...');
          setTimeout(() => navigate('/payment-failed'), 2000);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationStatus('Error verifying payment. Please contact support.');
      }
    };
    verifyPayment();
  }, [navigate, searchParams, setCurrentBooking, currentBooking]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Payment Verification</h2>
        <p className="text-center text-gray-600">{verificationStatus}</p>
      </div>
    </div>
  );
};

export default PaymentReturn;