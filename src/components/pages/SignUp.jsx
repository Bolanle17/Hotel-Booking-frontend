import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcom } from '../../context/EcomContext';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState(null);
  const { showNotification } = useEcom();
  const { setItem, dispatch } = useContext(AuthContext); 

  const navigate = useNavigate();

  const registerHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    if (image) {
      formData.append('image', image);
    }
  
    try {
      const res = await fetch("https://hotel-booking-api-p8if.onrender.com/api/user/register", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      console.log("Registration response:", data);
  
      if (!data.success) {
        showNotification("error", data.message || "Registration failed");
      } else {
        if (data.token) {
          console.log("Received token:", data.token);
          setItem(data.token);
          dispatch({ type: "setUser", payload: data.user }); 
          showNotification("success", "Registration successful!");
          navigate("/"); 
        } else {
          console.warn("No token received in registration response");
          showNotification("error", "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error('Failed to create an account:', error);
      showNotification("error", "An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>
        <form onSubmit={registerHandler} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm sm:text-base font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm sm:text-base font-medium text-gray-700">Profile Image (Optional)</label>
            <input
              type="file"
              id="image"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;