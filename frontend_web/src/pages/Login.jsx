import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import "../styles/Login.css";
import Button from '../components/Button';
import logo from "../assets/Logo1.png";
 
// MUI imports
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
 
export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
 
    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
 
    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
 
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
 
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("firstName", data.firstName);
 
      if (data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (data.role === "USER") {
        navigate("/dashboard");
      } else {
        setError("Invalid role");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
 
      const response = await fetch("http://localhost:8080/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
 
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Google login failed");
 
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e) => e.preventDefault();
 
  return (
    <div className="login-container">
      <div className="left-section">
        <div className="background-overlay"></div>
        <div className="logo-container">
          <img src={logo} alt="Logo" className="loginsidelogo" />
        </div>
      </div>
 
      <div className="right-section">
        <div className="form-container">
          <h2>WELCOME BACK!</h2>
          <p>Please enter your details.</p>
 
          {error && <p className="error-message">{error}</p>}
 
          <form onSubmit={handleSubmit} className="login-form">
            <TextField
              name="email"
              type="email"
              placeholder="Enter your email"
              sx={{
                '& input::placeholder': {
                  color: 'var(--text-secondary)',
                },
              }}
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              margin="normal"
            />
 
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
 
            <div className="options">
              <label>
                <input type="checkbox" name="remember" /> Remember
              </label>
              <a href="/forgot-password" className="forgot-password">
                Forgot password?
              </a>
            </div>
 
            <Button type="submit" className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
 
          <div className="google-signin">
            <Button
              onClick={handleGoogleSignIn}
              className="btn google-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </div>
 
          <p>
            Don't have an account? <a href="/signup">Sign up for free!</a>
          </p>
        </div>
      </div>
    </div>
  );
}