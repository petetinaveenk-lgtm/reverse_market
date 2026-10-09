import { useEffect, useState } from "react";
import axios from "axios";
import Chat from "./Chat";
import "./SellerDashboard.css";
import { API_BASE_URL } from "../config/api";

function SellerDashboard() {

  const [requirements, setRequirements] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [chatCustomer, setChatCustomer] = useState(null);

  // ================================
  // NOTIFICATIONS
  // ================================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [offerForm, setOfferForm] = useState({
    price: "",
    specifications: "",
    deliveryTime: ""
  });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // ================================
  // LOAD REQUIREMENTS
  // ================================

  const loadRequirements = async () => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/api/requirements/open`,
        { headers }
      );

      setRequirements(response.data);

    } catch (error) {

      console.error(
        "Error loading requirements:",
        error
      );

    }
  };

  // ================================
  // LOAD SELLER OFFERS
  // ================================

  const loadOffers = async () => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/api/offers/seller/${userId}`,
        { headers }
      );

      setOffers(response.data);

    } catch (error) {

      console.error(
        "Error loading offers:",
        error
      );

    }
  };

  // ================================
  // LOAD NOTIFICATIONS
  // ================================

  const loadNotifications = async () => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/user/${userId}`,
        { headers }
      );

      console.log(
        "Seller notifications:",
        response.data
      );

      setNotifications(response.data);

    } catch (error) {

      console.error(
        "Error loading seller notifications:",
        error
      );

    }
  };

  // ================================
  // MARK NOTIFICATION AS READ
  // ================================

  const markNotificationAsRead = async (
    notificationId
  ) => {

    try {

      await axios.put(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers }
      );

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    read: true
                  }
                : notification
          )
      );

    } catch (error) {

      console.error(
        "Error marking notification as read:",
        error
      );

    }
  };

  // ================================
  // INITIAL LOAD
  // ================================

  useEffect(() => {

    loadRequirements();
    loadOffers();
    loadNotifications();

  }, []);

  // ================================
  // FORM CHANGE
  // ================================

  const handleOfferChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setOfferForm(
      (currentOfferForm) => ({
        ...currentOfferForm,
        [name]: value
      })
    );

  };

  // ================================
  // SUBMIT OFFER
  // ================================

  const submitOffer = async (e) => {

    e.preventDefault();

    if (!selectedRequirement) {

      alert(
        "Please select a requirement"
      );

      return;
    }

    try {

      await axios.post(
        `${API_BASE_URL}/api/offers`,
        {
          price: Number(
            offerForm.price
          ),

          specifications:
            offerForm.specifications,

          deliveryTime:
            offerForm.deliveryTime,

          status: "PENDING",

          seller: {
            id: Number(userId)
          },

          requirement: {
            id: selectedRequirement.id
          }
        },
        { headers }
      );

      alert(
        "Offer submitted successfully!"
      );

      setOfferForm({
        price: "",
        specifications: "",
        deliveryTime: ""
      });

      setSelectedRequirement(null);

      await loadOffers();

      // Refresh notifications
      await loadNotifications();

    } catch (error) {

      console.error(
        "Error submitting offer:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to submit offer"
      );

    }
  };

  // ================================
  // LOGOUT
  // ================================

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    window.location.reload();

  };

  // ================================
  // STATISTICS
  // ================================

  const pendingOffers =
    offers.filter(
      (offer) =>
        offer.status === "PENDING"
    ).length;

  const acceptedOffers =
    offers.filter(
      (offer) =>
        offer.status === "ACCEPTED"
    ).length;

  // ================================
  // UNREAD NOTIFICATIONS
  // ================================

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        notification.read === false
    ).length;

  return (

    <div className="seller-dashboard">

      {/* ================================
          HEADER
      ================================= */}

      <header className="seller-header">

        <div className="seller-brand">

          <div className="seller-brand-icon">
            R
          </div>

          <div>

            <h1>
              Reverse Marketplace
            </h1>

            <p>
              Smart buying. Better offers.
            </p>

          </div>

        </div>

        <div className="seller-header-right">

          {/* ================================
              NOTIFICATIONS
          ================================= */}

          <div className="seller-notification-wrapper">

            <button
              type="button"
              className="seller-notification-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >

              <span className="seller-notification-icon">
                🔔
              </span>

              {unreadNotifications > 0 && (

                <span className="seller-notification-count">
                  {unreadNotifications}
                </span>

              )}

            </button>

            {/* ================================
                NOTIFICATION DROPDOWN
            ================================= */}

            {showNotifications && (

              <div className="seller-notification-dropdown">

                <div className="seller-notification-header">

                  <div>

                    <h3>
                      Notifications
                    </h3>

                    <span>
                      {unreadNotifications} unread
                    </span>

                  </div>

                  <button
                    type="button"
                    className="seller-notification-close"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="seller-notification-list">

                  {notifications.length === 0 ? (

                    <div className="seller-no-notifications">

                      <div>
                        🔔
                      </div>

                      <p>
                        No notifications yet.
                      </p>

                    </div>

                  ) : (

                    notifications.map(
                      (notification) => (

                        <button
                          type="button"
                          key={notification.id}
                          className={`seller-notification-item ${
                            notification.read
                              ? "seller-notification-read"
                              : "seller-notification-unread"
                          }`}
                          onClick={() =>
                            !notification.read &&
                            markNotificationAsRead(
                              notification.id
                            )
                          }
                        >

                          <div className="seller-notification-item-icon">
                            🔔
                          </div>

                          <div className="seller-notification-item-content">

                            <p>
                              {notification.message}
                            </p>

                            <small>
                              {notification.createdAt
                                ? new Date(
                                    notification.createdAt
                                  ).toLocaleString()
                                : ""}
                            </small>

                          </div>

                          {!notification.read && (

                            <span className="seller-unread-dot">
                            </span>

                          )}

                        </button>

                      )
                    )

                  )}

                </div>

              </div>

            )}

          </div>

          <span className="seller-role">
            Seller Account
          </span>

          <button
            className="seller-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* ================================
          MAIN
      ================================= */}

      <main className="seller-main">

        {/* Welcome */}

        <div className="seller-welcome">

          <h2>
            Seller Dashboard
          </h2>

          <p>
            Find customer requirements, submit competitive
            offers and connect with customers.
          </p>

        </div>

        {/* ================================
            STATISTICS
        ================================= */}

        <div className="seller-stats">

          <div className="seller-stat-card">

            <h4>
              Open Requirements
            </h4>

            <p>
              {requirements.length}
            </p>

          </div>

          <div className="seller-stat-card">

            <h4>
              Pending Offers
            </h4>

            <p>
              {pendingOffers}
            </p>

          </div>

          <div className="seller-stat-card">

            <h4>
              Accepted Offers
            </h4>

            <p>
              {acceptedOffers}
            </p>

          </div>

        </div>

        {/* ================================
            CUSTOMER REQUIREMENTS
        ================================= */}

        <section className="seller-section">

          <div className="seller-section-header">

            <div>

              <h3>
                Available Customer Requirements
              </h3>

              <p className="seller-section-subtitle">
                Browse requirements posted by customers
                and submit your best offer.
              </p>

            </div>

          </div>

          {requirements.length === 0 ? (

            <div className="seller-empty">

              <div className="seller-empty-icon">
                📋
              </div>

              <h4>
                No open requirements
              </h4>

              <p>
                There are currently no customer
                requirements available.
              </p>

            </div>

          ) : (

            <div className="seller-requirements-grid">

              {requirements.map(
                (requirement) => (

                  <div
                    key={requirement.id}
                    className="seller-requirement-card"
                  >

                    <h4>
                      {requirement.title}
                    </h4>

                    <p className="requirement-description">
                      {requirement.description}
                    </p>

                    <div className="requirement-info">

                      <p>

                        <strong>
                          Category:
                        </strong>{" "}

                        <span className="category-badge">
                          {requirement.category}
                        </span>

                      </p>

                      <p>

                        <strong>
                          Customer Budget:
                        </strong>{" "}

                        ₹{requirement.budget}

                      </p>

                      <p>

                        <strong>
                          Delivery:
                        </strong>{" "}

                        {requirement.deliveryTime}

                      </p>

                    </div>

                    <button
                      className="seller-primary-button"
                      onClick={() => {

                        setSelectedRequirement(
                          requirement
                        );

                        setChatCustomer(null);

                      }}
                    >
                      Make an Offer →
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ================================
            OFFER FORM
        ================================= */}

        {selectedRequirement && (

          <section className="seller-section">

            <div className="offer-form-container">

              <h3 className="offer-form-title">
                Submit Your Offer
              </h3>

              <p className="offer-form-description">

                Submit an offer for:

                <strong>
                  {" "}
                  {selectedRequirement.title}
                </strong>

              </p>

              <form
                className="offer-form"
                onSubmit={submitOffer}
              >

                <div className="offer-form-group">

                  <label htmlFor="offer-price">
                    Your Price (₹)
                  </label>

                  <input
                    type="number"
                    name="price"
                    id="offer-price"
                    placeholder="Enter your best price"
                    value={offerForm.price}
                    onChange={handleOfferChange}
                    required
                  />

                </div>

                <div className="offer-form-group">

                  <label htmlFor="offer-specifications">
                    Specifications
                  </label>

                  <textarea
                    name="specifications"
                    id="offer-specifications"
                    placeholder="Describe your product/service specifications..."
                    value={offerForm.specifications}
                    onChange={handleOfferChange}
                    required
                  />

                </div>

                <div className="offer-form-group">

                  <label htmlFor="offer-delivery-time">
                    Delivery Time
                  </label>

                  <input
                    type="text"
                    name="deliveryTime"
                    id="offer-delivery-time"
                    placeholder="Example: 5 days"
                    value={offerForm.deliveryTime}
                    onChange={handleOfferChange}
                    required
                  />

                </div>

                <div className="offer-form-actions">

                  <button
                    type="submit"
                    className="seller-primary-button"
                  >
                    Submit Offer
                  </button>

                  <button
                    type="button"
                    className="seller-secondary-button"
                    onClick={() => {

                      setSelectedRequirement(null);

                      setOfferForm({
                        price: "",
                        specifications: "",
                        deliveryTime: ""
                      });

                    }}
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          </section>

        )}

        {/* ================================
            MY OFFERS
        ================================= */}

        <section className="seller-section">

          <div className="seller-section-header">

            <div>

              <h3>
                My Offers
              </h3>

              <p className="seller-section-subtitle">
                Track the offers you have submitted.
              </p>

            </div>

          </div>

          {offers.length === 0 ? (

            <div className="seller-empty">

              <div className="seller-empty-icon">
                💼
              </div>

              <h4>
                No offers yet
              </h4>

              <p>
                Submit an offer on a customer
                requirement to see it here.
              </p>

            </div>

          ) : (

            <div className="seller-offers-grid">

              {offers.map((offer) => (

                <div
                  key={offer.id}
                  className="seller-offer-card"
                >

                  <h4>
                    Offer #{offer.id}
                  </h4>

                  <div className="offer-row">

                    <span className="offer-label">
                      Requirement
                    </span>

                    <span className="offer-value">

                      {offer.requirement?.title ||
                        `#${offer.requirement?.id}`}

                    </span>

                  </div>

                  <div className="offer-row">

                    <span className="offer-label">
                      Price
                    </span>

                    <span className="offer-value">
                      ₹{offer.price}
                    </span>

                  </div>

                  <div className="offer-row">

                    <span className="offer-label">
                      Specifications
                    </span>

                    <span className="offer-value">
                      {offer.specifications}
                    </span>

                  </div>

                  <div className="offer-row">

                    <span className="offer-label">
                      Delivery
                    </span>

                    <span className="offer-value">
                      {offer.deliveryTime}
                    </span>

                  </div>

                  <div className="offer-row">

                    <span className="offer-label">
                      Status
                    </span>

                    <span className="offer-value">

                      <span
                        className={`status-badge ${
                          offer.status === "ACCEPTED"
                            ? "status-accepted"
                            : offer.status === "REJECTED"
                            ? "status-rejected"
                            : "status-pending"
                        }`}
                      >
                        {offer.status}
                      </span>

                    </span>

                  </div>

                  {/* Accepted Offer */}

                  {offer.status === "ACCEPTED" &&
                    offer.requirement?.customer && (

                    <div className="accepted-box">

                      <p>
                        ✓ Customer selected your offer
                      </p>

                      <button
                        className="chat-button"
                        onClick={() =>
                          setChatCustomer(
                            offer.requirement.customer
                          )
                        }
                      >
                        💬 Chat with Customer
                      </button>

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ================================
            CHAT
        ================================= */}

        {chatCustomer && (

          <section className="seller-section seller-chat-section">

            <Chat
              requirement={
                offers.find(
                  (offer) =>
                    offer.requirement?.customer?.id ===
                      chatCustomer.id &&
                    offer.status === "ACCEPTED"
                )?.requirement
              }

              seller={chatCustomer}

              onClose={() =>
                setChatCustomer(null)
              }

            />

          </section>

        )}

      </main>

    </div>

  );
}

export default SellerDashboard;