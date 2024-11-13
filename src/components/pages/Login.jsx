import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useEcom } from '../../context/EcomContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useDraftBooking } from '../../hooks/useDraftBooking';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); 
  const { showNotification, bookNow } = useEcom();
  const { getItem, removeItem } = useLocalStorage('tempBookingDetails');
  const { draftBooking, transferDraftBookingToServer, clearDraftBooking } = useDraftBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://hotel-booking-api-p8if.onrender.com/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("Stored token:", localStorage.getItem('auth-token'));
      if (!res.ok) {
        console.error("Server response:", data); 
        throw new Error(data.message || "Login failed");
      }

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      const { token, user } = data;
      login({ name: user.name, email: user.email, userId: user._id, token }); 

      showNotification("success", "Login Successful!!!");

      const tempBookingDetails = getItem();
      if (tempBookingDetails) {
        try {
          const booking = await bookNow({
            userId: user._id,
            ...tempBookingDetails,
            rooms: tempBookingDetails.selectedRooms.map(room => ({
              roomType: room._id,
              numberOfRooms: 1 
            })),
            amount: tempBookingDetails.totalAmount,
            transactionId: "PENDING",
          });

          if (booking) {
            removeItem(); 
            showNotification("success", "Booking details transferred successfully!");
            navigate('/payment', { 
              replace: true, 
              state: { bookingId: booking._id, amount: tempBookingDetails.totalAmount } 
            });
          }
        } catch (error) {
          showNotification("error", "Failed to transfer booking details. Please try again.");
          navigate('/checkin', { replace: true, state: { tempBookingDetails } });
        }
      } else {
        const from = location.state?.from?.pathname || "/book-now";
        navigate(from, { replace: true });
      }

      if (draftBooking) {
        try {
          await transferDraftBookingToServer(user._id);
          showNotification("success", "Draft booking transferred successfully!");
          clearDraftBooking();
        } catch (error) {
          console.error("Error transferring draft booking:", error);
          showNotification("error", "Failed to transfer draft booking. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification("error", error.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700">Email</label>
            <input 
              id="email" 
              type="email" 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700">Password</label>
            <input 
              id="password" 
              type="password" 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;