import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export const useAuth = () => {
  const navigate = useNavigate();

  const handleLogout = async (showConfirmation = false) => {
    // Only show browser confirmation if explicitly requested and no custom dialog is used
    if (showConfirmation) {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (!confirmLogout) return;
    }

    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed: ", error);
      throw new Error('Unable to log out at the moment. Please refresh and try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/delete/me`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account.");
      }

      const result = await response.json();
      
      await signOut(auth);
      localStorage.clear();
      navigate("/login");
      
      return result; // Return success result to calling component
    } catch (err) {
      console.error("Account deletion failed:", err);
      throw err; // Re-throw so calling component can handle the error
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
    handleDeleteAccount,
    checkAuth,
    getUserDetails
  };
};