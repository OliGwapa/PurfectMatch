import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export const useAuth = () => {
  const navigate = useNavigate();

  const handleLogout = async (showConfirmation = true) => {
    if (showConfirmation) {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (!confirmLogout) return;
    }

    try {
      await signOut(auth);
      localStorage.clear();
      alert("You have logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed: ", error);
      alert("Unable to log out at the moment. Please refresh and try again.");
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return false;
    }
    return true;
  };

  const getUserDetails = () => {
    return {
      fullName: localStorage.getItem("firstName") || '',
      email: localStorage.getItem("email") || '',
      phone: localStorage.getItem("phone") || '',
      address: localStorage.getItem("address") || '',
      profileImage: localStorage.getItem("profileImage") || ''
    };
  };

  return {
    handleLogout,
    checkAuth,
    getUserDetails
  };
};