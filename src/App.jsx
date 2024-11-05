import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header"
import Footer from "./components/Footer";
import Policy from "./components/Policy";
import HotelListing from "./components/HotelListing/HotelListing";
import HotelDetails from "./components/HotelDetails/HotelDetails";
import AllHotelsDetails from "./components/AllHotel/AllHotelsDetails";
import { EcomProvider } from "./context/EcomContext";
import Notification from "./components/Notification"
import HomePage from "./components/pages/HomePage";
import Login from "./components/pages/Login";
import SignUp from "./components/pages/SignUp";
import LogOut from "./components/pages/LogOut";
import CheckInPage from "./components/CheckInPage/CheckInPage";
import ThankYou from "./components/pages/ThankYou";
import BookNow from "./components/BookNow";
import { AuthProvider } from "./context/AuthContext";
import useLocalStorage from "./hooks/useLocalStorage"
import RoomFeatured from "./components/RoomFeatured";
import PaymentReturn from "./components/PaymentReturn";
import PaymentFailed from "./components/PaymentFailed";
import Payment from "./components/FlwPayment/Payment";
import Profile from "./components/pages/Profile";
import UserBooking from "./components/UserBooking/UserBooking";

function App() {
  const {getItem} = useLocalStorage("auth-token")
  const token = getItem()
  let authInitialState = {accessToken: token ?? null}

  return (
    <Router>
      <AuthProvider defaultState={authInitialState}>
        <EcomProvider>
          <Notification />
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/listing" element={<HotelListing />} />
            <Route path="/details/${_id}" element={<HotelDetails />} />
            <Route path="/all-hotels" element={<AllHotelsDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/logout" element={<LogOut />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/thankyou" element={<ThankYou />} />
            <Route path="/room/:roomId" element={<RoomFeatured/>} />
            <Route path="/book-now" element={<BookNow/>} />
            <Route path="/payment-return" element={<PaymentReturn/>} />
            <Route path="/payment-failed" element={<PaymentFailed/>} />
            <Route path="/payment" element={<Payment/>} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/userbooking" element={<UserBooking/>} />
          </Routes>
          <Footer />
        </EcomProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;