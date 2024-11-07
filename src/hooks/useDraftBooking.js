import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export const useDraftBooking = () => {
  const [draftBooking, setDraftBooking] = useState(null);
  const { getItem, setItem, removeItem } = useLocalStorage('draftBooking');
  const authTokenStorage = useLocalStorage('auth-token');

  useEffect(() => {
    const savedDraftBooking = getItem();
    if (savedDraftBooking) {
      setDraftBooking(savedDraftBooking);
    }
  }, []);

  const saveDraftBooking = (bookingDetails) => {
    setItem(bookingDetails);
    setDraftBooking(bookingDetails);
  };

  const clearDraftBooking = () => {
    setDraftBooking(null);
    removeItem();
  };

  const transferDraftBookingToServer = async (userId) => {
    if (draftBooking) {
      try {
        const response = await fetch("https://hotel-booking-api-p8if.onrender.com/api/booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": authTokenStorage.getItem(), 
          },
          body: JSON.stringify({
            userId,
            ...draftBooking,
          }),
        });

        if (response.ok) {
          clearDraftBooking();
          return await response.json();
        } else {
          throw new Error("Failed to transfer draft booking to server");
        }
      } catch (error) {
        console.error("Error transferring draft booking:", error);
        throw error;
      }
    }
    return null;
  };

  return {
    draftBooking,
    saveDraftBooking,
    clearDraftBooking,
    transferDraftBookingToServer,
  };
};