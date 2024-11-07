import React, { useState, useContext } from "react";
import { IoMdHome } from "react-icons/io";
import { HiMenuAlt3 } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 
import { useEcom } from '../context/EcomContext';
import avater from '../assets/avater.png'
import ProfileModal from "./pages/ProfileModal";

const Header = () => {
  const { state, dispatch } = useContext(AuthContext); 
  const { user, isLoading, error } = state; 
  const { showNotification, userProfile, getUserProfile, updateUserProfile} = useEcom();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "logout" }); 
    localStorage.removeItem("user"); 
   showNotification("success", "You have been successfully logged out");
    navigate('/');
    setOpen(false);
  };
  
  const getImageUrl = (imgPath) => {
    if (!imgPath || imgPath === 'uploads/avater.png') {
      return {avater}; 
    }
    const baseUrl = 'https://hotel-booking-api-p8if.onrender.com';
    return `${baseUrl}${imgPath}`;
  };

  const userImage = userProfile?.image ? `https://hotel-booking-api-p8if.onrender.com/uploads/${userProfile.image}` : avater;


  const handleProfileUpdate = async(profileData) =>{
    await updateUserProfile(profileData);
    setIsProfileModalOpen(false);
  }



  return (
    <div className="sticky top-0 z-[20] bg-cyan-700">
      <div className="flex items-center justify-between py-[2%] px-5 lg:px-[30px]">
        <div className="flex items-center">
          <Link to="/" className="text-black cursor-pointer font-bold text-3xl">
            <IoMdHome />
          </Link>
          <div className="ml-4">
            <h4 className="text-orange-600 font-bold text-2xl">MOAHOTELS</h4>
            <p className="text-xl text-center">PRICES</p>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-5">
          <Link className="text-[15px] font-medium hover:text-white" to="/">Home</Link>
          <Link className="text-[15px] font-medium hover:text-white" to="/all-hotels">Hotel Details</Link>
          {isLoading ? (
            <p className="text-white">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : user ? (
            <>
              <button onClick={handleLogout} className="text-[15px] font-medium hover:text-white">Logout</button>
              <div className="text-[15px] font-medium flex items-center gap-2" onClick={()=> setIsProfileModalOpen(true)}>
                <img src={userImage} alt="User Avatar" className="h-7 w-7 rounded-full" />
                <p>Hi, {user.name || userProfile?.UserName}</p>
              </div>
            </>
          ) : (
            <>
              <Link className="text-[15px] font-medium hover:text-white" to="/login">Login</Link>
              <Link className="text-[15px] font-medium hover:text-white" to="/signup">Signup</Link>
            </>
          )}
        </nav>
        <button onClick={() => setOpen(!open)} className="flex items-center justify-center w-[35px] lg:hidden h-[25px]">
          <HiMenuAlt3 className="text-3xl text-white" />
        </button>
      </div>
      <div onClick={() => setOpen(false)} className={`fixed lg:hidden top-0 left-0 w-full h-full bg-black/50 z-[20] ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />
      <div className={`fixed lg:hidden left-0 top-0 w-[300px] h-screen overflow-auto z-[30] bg-cyan-800 transition-all duration-200 ${open ? "translate-x-[0px]" : "translate-x-[-300px]"}`}>
        <nav className="flex flex-col items-center gap-10 pt-20">
          <Link onClick={() => setOpen(false)} className="text-[25px] font-medium hover:text-white text-black" to="/">Home</Link>
          <Link onClick={() => setOpen(false)} className="text-[25px] font-medium hover:text-white text-black" to="/all-hotels">Hotel Details</Link>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : user ? (
            <>
              <button onClick={handleLogout} className="text-[25px] font-medium hover:text-white text-black">Logout</button>
              <div className="text-[25px] font-medium flex items-center gap-2" onClick={()=> setIsProfileModalOpen(true)}>
                <img src={userImage} alt="User Avatar" className="h-7 w-7 rounded-full" />
                <p>Hi, {user.name}</p>
              </div>
            </>
          ) : (
            <>
              <Link onClick={() => setOpen(false)} className="text-[25px] font-medium hover:text-white text-black" to="/login">Login</Link>
              <Link onClick={() => setOpen(false)} className="text-[25px] font-medium hover:text-white text-black" to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </div>
      {isProfileModalOpen && (
        <ProfileModal
            onClose={() => setIsProfileModalOpen(false)}
            onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Header;
