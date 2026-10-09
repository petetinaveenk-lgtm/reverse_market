import { useState } from "react";
import axios from "axios";
import "./App.css";
import { API_BASE_URL } from "./config/api";

import CustomerDashboard from "./pages/CustomerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    adminRegistrationKey: ""
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ================================
  // DASHBOARD ROUTING
  // ================================

  if (token && role === "CUSTOMER") {
    return <CustomerDashboard />;
  }

  if (token && role === "SELLER") {
    return <SellerDashboard />;
  }

  if (token && role === "ADMIN") {
    return <AdminDashboard />;
  }

  // ================================
  // FORM CHANGE
  // ================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
      ...(name === "role" && value !== "ADMIN"
        ? { adminRegistrationKey: "" }
        : {})
    });
  };

  // ================================
  // LOGIN / REGISTER
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {

        const response = await axios.post(
          `${API_BASE_URL}/api/users/login`,
          {
            email: formData.email,
            password: formData.password
          }
        );

        console.log("LOGIN RESPONSE:", response.data);

        localStorage.setItem(
          "token",
          response.data.token
        );

        localStorage.setItem(
          "role",
          response.data.role
        );

        localStorage.setItem(
          "userId",
          response.data.id
        );

        alert("Login successful!");

        window.location.reload();

      } else {

        console.log("REGISTERING USER:", {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });

        const response = await axios.post(
          `${API_BASE_URL}/api/users/register`,
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            ...(formData.role === "ADMIN"
              ? { adminRegistrationKey: formData.adminRegistrationKey }
              : {})
          }
        );

        console.log(
          "REGISTER RESPONSE:",
          response.data
        );

        alert(
          "Registration successful! Please login."
        );

        setFormData({
          name: "",
          email: "",
          password: "",
          role: "CUSTOMER",
          adminRegistrationKey: ""
        });

        setShowPassword(false);
        setIsLogin(true);
      }

    } catch (error) {
      let message =
        "Something went wrong. Please try again.";

      if (error.response?.data?.message) {
        message =
          error.response.data.message;
      } else if (error.response?.data?.detail) {
        message =
          error.response.data.detail;
      } else if (
        typeof error.response?.data === "string"
      ) {
        message =
          error.response.data;
      } else if (error.request) {
        message =
          "Cannot connect to backend. Make sure Spring Boot is running on port 8081.";
      }

      alert(message);
    }
  };

  // ================================
  // SWITCH LOGIN / REGISTER
  // ================================

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "CUSTOMER",
      adminRegistrationKey: ""
    });
  };

  // ================================
  // LOGIN / REGISTER UI
  // ================================

  return (
    <div className="auth-page">

      {/* ============================
          LEFT INFORMATION PANEL
      ============================= */}

      <div className="auth-info">

        <div className="brand">

          <div className="brand-icon">
            R
          </div>

          <div className="brand-text">

            <h2>
              Reverse Marketplace
            </h2>

            <span>
              Smart buying. Better offers.
            </span>

          </div>

        </div>


        <div className="info-content">

          <p className="welcome-label">
            WELCOME TO THE MARKETPLACE
          </p>

          <h1>
            Post what you need.
            <br />
            Let sellers <span>compete.</span>
          </h1>

          <p className="info-description">
            Instead of searching through hundreds
            of products, tell sellers exactly what
            you need and receive competitive offers
            from them.
          </p>


          <div className="feature-list">

            <div className="feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <strong>
                  Post your requirements
                </strong>

                <p>
                  Describe exactly what you're looking for.
                </p>
              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">
                ₹
              </div>

              <div>
                <strong>
                  Compare seller offers
                </strong>

                <p>
                  Choose the best price and specifications.
                </p>
              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">
                💬
              </div>

              <div>
                <strong>
                  Connect directly
                </strong>

                <p>
                  Chat with sellers before making a decision.
                </p>
              </div>

            </div>

          </div>

        </div>


        <p className="copyright">
          © 2026 Reverse Marketplace
        </p>

      </div>


      {/* ============================
          RIGHT AUTH PANEL
      ============================= */}

      <div className="auth-panel">

        <div className="auth-card">

          <div className="mobile-brand">

            <div className="mobile-brand-icon">
              R
            </div>

            <div>

              <h2>
                Reverse Marketplace
              </h2>

              <p>
                Smart buying. Better offers.
              </p>

            </div>

          </div>


          <div className="auth-heading">

            <h1>
              {isLogin
                ? "Welcome back!"
                : "Create your account"}
            </h1>

            <p>
              {isLogin
                ? "Login to continue to your marketplace dashboard."
                : "Join the marketplace and start getting better offers."}
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* NAME */}

            {!isLogin && (

              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            )}


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* ROLE */}

            {!isLogin && (

              <div className="form-group">

                <label htmlFor="role">
                  Account Type
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ◉
                  </span>

                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >

                    <option value="CUSTOMER">
                      Customer
                    </option>

                    <option value="SELLER">
                      Seller
                    </option>

                    <option value="ADMIN">
                      Admin
                    </option>

                  </select>

                </div>

              </div>

            )}

            {!isLogin && formData.role === "ADMIN" && (
              <div className="form-group">
                <label htmlFor="adminRegistrationKey">
                  Admin Registration Key
                </label>
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    🔑
                  </span>
                  <input
                    id="adminRegistrationKey"
                    type="password"
                    name="adminRegistrationKey"
                    placeholder="Enter the admin registration key"
                    value={formData.adminRegistrationKey}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
            >

              <span>
                {isLogin
                  ? "Login to Dashboard"
                  : "Create Account"}
              </span>

              <span className="submit-arrow">
                →
              </span>

            </button>

          </form>


          {/* SWITCH */}

          <div className="auth-switch">

            <span>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              className="link-button"
              onClick={switchMode}
            >
              {isLogin
                ? "Create account"
                : "Login here"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;