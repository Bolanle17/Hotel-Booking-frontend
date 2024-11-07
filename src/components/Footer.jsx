import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MOAHOTELS PRICES</h3>
            <p className="text-sm">
              MoaHotelsPrices.com is an online platform that facilitates access to the best travel deals by directing consumers to travel providers and agents.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/listing" className="hover:text-gray-400">Hotel Listings</Link></li>
              <li><Link to="/all-hotels" className="hover:text-gray-400">Hotel Details</Link></li>
              <li><Link to="/userbooking" className="hover:text-gray-400">Your Booking History</Link></li>
              <li><Link to="/Policy" className="hover:text-gray-400">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-sm">
              We are not a licensed travel supplier, nor do we provide our own travel services or quotes.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-400"><FaFacebook size={24} /></a>
              <a href="#" className="hover:text-gray-400"><FaInstagram size={24} /></a>
              <a href="#" className="hover:text-gray-400"><FaTwitter size={24} /></a>
              <a href="#" className="hover:text-gray-400"><FaYoutube size={24} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          <p>
            MoaHotelsPrices.com connects the general public with reliable travel sources, but we cannot guarantee that the advertised rates are available, nor the cheapest available. All prices are subject to availability, and MoaHotelsPrices.com only provides travel information via travel search engines available at any given time.
          </p>
          <p className="mt-4">
            Copyright © 2024 MoaHotelsPrices.com. All rights reserved.
          </p>
          <p className="mt-2">
            <Link to="/terms" className="hover:text-gray-400">Terms of Use</Link> |{" "}
            <Link to="/contact" className="hover:text-gray-400">Contact Us</Link> |{" "}
            <Link to="/Policy" className="hover:text-gray-400">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
