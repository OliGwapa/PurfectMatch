import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/LandingCSS/Login.css";
import logo from "../../assets/Logo1.png";
import Button from '../../components/Button';
import { useNotifications } from '../../hooks/useNotifications';
 
// MUI
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
 
export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
 
  const { confirm, alertSuccess, alertError } = useNotifications();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (e) => e.preventDefault();
 
  const validateForm = () => {
    for (const key in formData) {
      if (!formData[key]) return "All fields are required.";
    }
 
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match.";
 
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(formData.password))
      return "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.";
 
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) return "Email must be valid.";
 
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone))
      return "Phone number must be valid (10-15 digits, optional + prefix).";
 
    return "";
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
 
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
 
    const requestData = {
      ...formData,
      role: "USER",
      signUpMethod: "EMAIL",
    };
 
    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        "user",
        new Blob([JSON.stringify(requestData)], { type: "application/json" })
      );
 
      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        body: formDataToSend,
      });
 
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
 
      alertSuccess("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      alertError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="login-container">
      <div className="left-section">
        <div className="background-overlay"></div>
        <div className="logo-container">
          <Link to ="/"><img src={logo} alt="Logo" className="loginsidelogo" /></Link>
        </div>
      </div>
 
      <div className="right-section">
        <div className="form-container">
          <h2>WELCOME!</h2>
          <p>Please enter your details.</p>
 
          {error && <p className="error-message">{error}</p>}
 
          <form onSubmit={handleSubmit} className="login-form">
            <TextField
              placeholder="Enter first name"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
              }}
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
 
            <TextField
              placeholder="Enter last name"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
              }}
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
 
            <TextField
              placeholder="Enter email address"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
              }}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
 
            <TextField
              placeholder="Enter phone number"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
              }}
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
 
            <TextField
              placeholder="Enter address"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
              }}
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
 
            <TextField
              placeholder="Enter password"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
                '& input[type="password"]': {
                  color: 'var(--text-primary)',
                },
                '& input[type="text"]': {
                  color: 'var(--text-primary)',
                },
              }}
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ pr: 0.55 }}>
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{
                        color: 'var(--text-secondary)',
                        '&:hover': {
                          color: 'var(--text-primary)',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
 
            <TextField
              placeholder="Verify password"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
                '& input[type="password"]': {
                  color: 'var(--text-primary)',
                },
                '& input[type="text"]': {
                  color: 'var(--text-primary)',
                },
              }}
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ pr: 0.55 }}>
                    <IconButton
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{
                        color: 'var(--text-secondary)',
                        '&:hover': {
                          color: 'var(--text-primary)',
                        },
                      }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
 
            <Button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
 
          <p>
            Already have an account? <Link to="/login">Sign in here!</Link>
          </p>
        </div>
      </div>
    </div>
  );
}