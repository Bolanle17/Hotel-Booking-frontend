import React, { useState, useEffect } from 'react';
import { useEcom } from '../../context/EcomContext';
import avatar from '../../assets/avater.png';

function Profile() {
  const { userProfile, getUserProfile, updateUserProfile, error, success } = useEcom();
  const [profileData, setProfileData] = useState({
    UserName: '',
    email: '',
    phone: '',
    address: '',
    image: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    getUserProfile(); 
  }, [getUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        UserName: userProfile.UserName || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        image: userProfile.image || ''
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setProfileData((prevData) => ({ ...prevData, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('UserName', profileData.UserName);
    formData.append('email', profileData.email);
    formData.append('phone', profileData.phone);
    formData.append('address', profileData.address);

    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      await updateUserProfile(formData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-red-500 mb-3">{error}</p>}
      {success && <p className="text-green-500 mb-3">Profile updated successfully!</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <img
            src={selectedImage ? URL.createObjectURL(selectedImage) : (profileData.image || avatar)}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="profileImage"
            className="hidden"
          />
          <label
            htmlFor="profileImage"
            className="cursor-pointer bg-gray-100 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-200 transition duration-300 text-center sm:text-left w-full sm:w-auto"
          >
            Change Profile Picture
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="UserName"
            value={profileData.UserName || ''}
            onChange={handleChange}
            type="text"
            placeholder="UserName"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
          />
          
        </div>
        <input
          name="email"
          value={profileData.email || ''}
          onChange={handleChange}
          type="email"
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
        />
        <input
          name="phone"
          value={profileData.phone || ''}
          onChange={handleChange}
          type="tel"
          placeholder="Phone"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
        />
        <input
          name="address"
          value={profileData.address || ''}
          onChange={handleChange}
          type="text"
          placeholder="Address"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
        />
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;