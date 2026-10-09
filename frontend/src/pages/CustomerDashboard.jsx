import "./CustomerDashboard.css";

import { useEffect, useState } from "react";
import axios from "axios";
import Chat from "./Chat";
import { API_BASE_URL } from "../config/api";

function CustomerDashboard() {

  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [offers, setOffers] = useState([]);
  const [chatSeller, setChatSeller] = useState(null);

  // ================================
  // NOTIFICATIONS
  // ================================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // =====================================================
  // LOAD CUSTOMER REQUIREMENTS
  // =====================================================

  const loadRequirements = async () => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/api/requirements/customer/${userId}`,
        { headers }
      );

      console.log("Customer requirements:", response.data);

      setRequirements(response.data);

    } catch (error) {

      console.error("Error loading requirements:", error);

    }
  };

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async () => {
    try {

      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/user/${userId}`,
        { headers }
      );

      console.log("Notifications:", response.data);

      setNotifications(response.data);

    } catch (error) {

      console.error("Error loading notifications:", error);

    }
  };

  // =====================================================
  // MARK NOTIFICATION AS READ
  // =====================================================

  const markNotificationAsRead = async (notificationId) => {

    try {

      await axios.put(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers }
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
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

  // =====================================================
  // LOAD OFFERS
  // =====================================================

  const loadOffers = async (requirementId) => {

    try {

      const response = await axios.get(
        `${API_BASE_URL}/api/offers/requirement/${requirementId}`,
        { headers }
      );

      console.log("Offers:", response.data);

      setOffers(response.data);

    } catch (error) {

      console.error("Error loading offers:", error);

      alert(
        error.response?.data?.message ||
        "Failed to load offers"
      );

    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadRequirements();
    loadNotifications();

  }, []);

  // =====================================================
  // VIEW OFFERS
  // =====================================================

  const viewOffers = async (requirement) => {

    setSelectedRequirement(requirement);
    setChatSeller(null);
    setOffers([]);

    await loadOffers(requirement.id);
  };

  // =====================================================
  // SELECT OFFER
  // =====================================================

  const selectOffer = async (offerId) => {

    const confirmSelection = window.confirm(
      "Are you sure you want to select this offer?"
    );

    if (!confirmSelection) {
      return;
    }

    try {

      await axios.put(
        `${API_BASE_URL}/api/offers/${offerId}/select`,
        {},
        { headers }
      );

      alert("Offer selected successfully!");

      if (selectedRequirement) {

        await loadOffers(selectedRequirement.id);

      }

      await loadRequirements();

      // Refresh notifications because seller
      // should receive an acceptance notification
      await loadNotifications();

    } catch (error) {

      console.error(
        "Error selecting offer:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to select offer"
      );

    }
  };

  // =====================================================
  // DELETE REQUIREMENT
  // =====================================================

  const deleteRequirement = async (requirementId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this requirement?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await axios.delete(
        `${API_BASE_URL}/api/requirements/${requirementId}`,
        { headers }
      );

      alert(
        "Requirement deleted successfully!"
      );

      setSelectedRequirement(null);
      setOffers([]);
      setChatSeller(null);

      await loadRequirements();

    } catch (error) {

      console.error(
        "Error deleting requirement:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to delete requirement"
      );

    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    window.location.reload();

  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalRequirements =
    requirements.length;

  const openRequirements =
    requirements.filter(
      (item) => item.status === "OPEN"
    ).length;

  const selectedCount =
    requirements.filter(
      (item) => item.status === "SELECTED"
    ).length;

  // =====================================================
  // UNREAD NOTIFICATIONS
  // =====================================================

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        notification.read === false
    ).length;

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="customer-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="customer-header">

        <div className="customer-brand">

          <div className="customer-brand-icon">
            R
          </div>

          <div>

            <h1>
              Reverse Marketplace
            </h1>

            <p>
              Customer Portal
            </p>

          </div>

        </div>

        <div className="customer-header-right">

          {/* =================================================
              NOTIFICATION BUTTON
          ================================================= */}

          <div className="notification-wrapper">

            <button
              type="button"
              className="notification-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
            >

              <span className="notification-icon">
                🔔
              </span>

              {unreadNotifications > 0 && (

                <span className="notification-count">
                  {unreadNotifications}
                </span>

              )}

            </button>

            {/* =================================================
                NOTIFICATION DROPDOWN
            ================================================= */}

            {showNotifications && (

              <div className="notification-dropdown">

                <div className="notification-dropdown-header">

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
                    className="notification-close"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="notification-list">

                  {notifications.length === 0 ? (

                    <div className="no-notifications">

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
                          className={`notification-item ${
                            notification.read
                              ? "notification-read"
                              : "notification-unread"
                          }`}
                          onClick={() =>
                            !notification.read &&
                            markNotificationAsRead(
                              notification.id
                            )
                          }
                        >

                          <div className="notification-item-icon">
                            🔔
                          </div>

                          <div className="notification-item-content">

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

                            <span className="unread-dot">
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

          {/* =================================================
              USER
          ================================================= */}

          <div className="customer-user">

            <div className="customer-avatar">
              C
            </div>

            <div>

              <span>
                Customer
              </span>

              <small>
                Welcome back
              </small>

            </div>

          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="customer-main">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="customer-welcome">

          <div>

            <p className="welcome-tag">
              CUSTOMER DASHBOARD
            </p>

            <h2>
              Find the best offers for what you need.
            </h2>

            <p>
              Post your requirement and let sellers
              compete to give you the best deal.
            </p>

          </div>

          <div className="welcome-icon">
            🛒
          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="customer-stats">

          <div className="customer-stat-card">

            <div className="customer-stat-icon blue">
              📋
            </div>

            <div>

              <span>
                Total Requirements
              </span>

              <strong>
                {totalRequirements}
              </strong>

            </div>

          </div>

          <div className="customer-stat-card">

            <div className="customer-stat-icon green">
              🔓
            </div>

            <div>

              <span>
                Open Requirements
              </span>

              <strong>
                {openRequirements}
              </strong>

            </div>

          </div>

          <div className="customer-stat-card">

            <div className="customer-stat-icon purple">
              ✓
            </div>

            <div>

              <span>
                Selected Offers
              </span>

              <strong>
                {selectedCount}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            MY REQUIREMENTS
        ================================================= */}

        <section className="customer-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                YOUR REQUESTS
              </p>

              <h3>
                My Requirements
              </h3>

            </div>

            <span className="section-count">
              {requirements.length} total
            </span>

          </div>

          {requirements.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h4>
                No requirements yet
              </h4>

              <p>
                Post your first requirement below
                and start receiving offers from
                sellers.
              </p>

            </div>

          ) : (

            <div className="requirements-grid">

              {requirements.map(
                (requirement) => (

                  <div
                    key={requirement.id}
                    className="customer-requirement-card"
                  >

                    <div className="requirement-top">

                      <div>

                        <span className="requirement-category">
                          {requirement.category}
                        </span>

                        <h4>
                          {requirement.title}
                        </h4>

                      </div>

                      <span
                        className={`status-badge ${
                          requirement.status?.toLowerCase()
                        }`}
                      >
                        {requirement.status}
                      </span>

                    </div>

                    <p className="requirement-description">
                      {requirement.description}
                    </p>

                    <div className="requirement-details">

                      <div>

                        <span>
                          Budget
                        </span>

                        <strong>
                          ₹{requirement.budget}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Delivery
                        </span>

                        <strong>
                          {requirement.deliveryTime}
                        </strong>

                      </div>

                    </div>

                    <div className="requirement-actions">

                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          viewOffers(requirement)
                        }
                      >
                        View Offers →
                      </button>

                      <button
                        type="button"
                        className="danger-outline-button"
                        onClick={() =>
                          deleteRequirement(
                            requirement.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            SELLER RESPONSES
        ================================================= */}

        {selectedRequirement && (

          <section className="customer-section offers-section">

            <div className="section-heading">

              <div>

                <p className="section-label">
                  SELLER RESPONSES
                </p>

                <h3>
                  Offers for "
                  {selectedRequirement.title}
                  "
                </h3>

                <p className="section-description">
                  Compare seller prices,
                  specifications, and delivery
                  times before selecting an offer.
                </p>

              </div>

              <button
                type="button"
                className="close-section-button"
                onClick={() => {

                  setSelectedRequirement(null);
                  setOffers([]);
                  setChatSeller(null);

                }}
              >
                Close
              </button>

            </div>

            {offers.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  💼
                </div>

                <h4>
                  No offers received yet
                </h4>

                <p>
                  Sellers haven't responded to
                  this requirement yet.
                </p>

              </div>

            ) : (

              <div className="offers-grid">

                {offers.map((offer) => (

                  <div
                    key={offer.id}
                    className={`offer-card ${
                      offer.status?.toLowerCase()
                    }`}
                  >

                    {/* OFFER HEADER */}

                    <div className="offer-header">

                      <div>

                        <span className="offer-number">
                          OFFER #{offer.id}
                        </span>

                        <h4>
                          {offer.seller?.name ||
                            "Seller"}
                        </h4>

                      </div>

                      <span
                        className={`status-badge ${
                          offer.status?.toLowerCase()
                        }`}
                      >
                        {offer.status}
                      </span>

                    </div>

                    {/* PRICE */}

                    <div className="offer-price">
                      ₹{offer.price}
                    </div>

                    {/* OFFER DETAILS */}

                    <div className="offer-info">

                      <div className="offer-detail">

                        <span>
                          Specifications
                        </span>

                        <p>
                          {offer.specifications ||
                            "No specifications provided"}
                        </p>

                      </div>

                      <div className="offer-detail">

                        <span>
                          Delivery Time
                        </span>

                        <p>
                          {offer.deliveryTime ||
                            "Not specified"}
                        </p>

                      </div>

                    </div>

                    {/* PENDING OFFER */}

                    {offer.status ===
                      "PENDING" && (

                      <div className="offer-action-area">

                        <p className="offer-action-text">
                          Review this offer and
                          select it if it meets
                          your requirements.
                        </p>

                        <button
                          type="button"
                          className="select-offer-button"
                          onClick={() =>
                            selectOffer(
                              offer.id
                            )
                          }
                        >

                          <span>
                            Select This Offer
                          </span>

                          <span>
                            →
                          </span>

                        </button>

                      </div>

                    )}

                    {/* ACCEPTED OFFER */}

                    {offer.status ===
                      "ACCEPTED" && (

                      <div className="accepted-area">

                        <div className="accepted-message">
                          ✓ This offer has been
                          selected
                        </div>

                        {offer.seller && (

                          <button
                            type="button"
                            className="chat-button"
                            onClick={() =>
                              setChatSeller(
                                offer.seller
                              )
                            }
                          >
                            💬 Chat with Seller
                          </button>

                        )}

                      </div>

                    )}

                    {/* REJECTED OFFER */}

                    {offer.status ===
                      "REJECTED" && (

                      <div className="rejected-message">
                        This offer was not selected.
                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </section>

        )}

        {/* =================================================
            CHAT
        ================================================= */}

        {chatSeller &&
          selectedRequirement && (

          <section className="customer-section">

            <Chat
              requirement={
                selectedRequirement
              }

              seller={chatSeller}

              onClose={() =>
                setChatSeller(null)
              }

            />

          </section>

        )}

        {/* =================================================
            POST REQUIREMENT
        ================================================= */}

        <section className="customer-section post-requirement-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                NEW REQUEST
              </p>

              <h3>
                Post a New Requirement
              </h3>

              <p className="section-description">
                Tell sellers what you are
                looking for.
              </p>

            </div>

          </div>

          <RequirementForm
            userId={userId}
            token={token}
            onSuccess={async () => {

              await loadRequirements();
              await loadNotifications();

            }}
          />

        </section>

      </main>

    </div>

  );
}

// =====================================================
// REQUIREMENT FORM
// =====================================================

function RequirementForm({
  userId,
  token,
  onSuccess,
}) {

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      budget: "",
      deliveryTime: "",
    });

  const [submitting, setSubmitting] =
    useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });

  };

  // ===================================================
  // SUBMIT REQUIREMENT
  // ===================================================

  const submitRequirement = async (e) => {

    e.preventDefault();

    setSubmitting(true);

    try {

      const response =
        await axios.post(
          `${API_BASE_URL}/api/requirements`,
          {
            title: formData.title,

            description:
              formData.description,

            category:
              formData.category,

            budget:
              Number(formData.budget),

            deliveryTime:
              formData.deliveryTime,

            status: "OPEN",

            customer: {
              id: Number(userId),
            },
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      console.log(
        "Requirement response:",
        response.data
      );

      alert(
        "Requirement posted successfully!"
      );

      setFormData({
        title: "",
        description: "",
        category: "",
        budget: "",
        deliveryTime: "",
      });

      await onSuccess();

    } catch (error) {

      const responseData = error.response?.data;
      const backendMessage =
        typeof responseData === "string"
          ? responseData
          : responseData?.message ||
            responseData?.detail ||
            responseData?.error ||
            "No backend response message";

      alert(
        `HTTP status: ${error.response?.status ?? "No response"}\n` +
        `Backend response: ${backendMessage}\n` +
        `Axios error: ${error.message || "Unknown Axios error"}`
      );

    } finally {

      setSubmitting(false);

    }
  };

  return (

    <form
      className="requirement-form"
      onSubmit={submitRequirement}
    >

      {/* TITLE + CATEGORY */}

      <div className="form-row">

        <div className="dashboard-form-group">

          <label>
            Requirement Title
          </label>

          <input
            type="text"
            name="title"
            placeholder="Example: Laptop for college"
            value={formData.title}
            onChange={handleChange}
            required
          />

        </div>

        <div className="dashboard-form-group">

          <label>
            Category
          </label>

          <input
            type="text"
            name="category"
            placeholder="Example: Electronics"
            value={formData.category}
            onChange={handleChange}
            required
          />

        </div>

      </div>

      {/* DESCRIPTION */}

      <div className="dashboard-form-group">

        <label>
          Description
        </label>

        <textarea
          name="description"
          placeholder="Describe exactly what you need..."
          value={formData.description}
          onChange={handleChange}
          required
        />

      </div>

      {/* BUDGET + DELIVERY */}

      <div className="form-row">

        <div className="dashboard-form-group">

          <label>
            Maximum Budget
          </label>

          <div className="budget-input">

            <span>
              ₹
            </span>

            <input
              type="number"
              name="budget"
              placeholder="60000"
              min="1"
              value={formData.budget}
              onChange={handleChange}
              required
            />

          </div>

        </div>

        <div className="dashboard-form-group">

          <label>
            Required Delivery Time
          </label>

          <input
            type="text"
            name="deliveryTime"
            placeholder="Example: 5 days"
            value={formData.deliveryTime}
            onChange={handleChange}
            required
          />

        </div>

      </div>

      {/* SUBMIT */}

      <button
        type="submit"
        className="post-requirement-button"
        disabled={submitting}
      >
        {submitting
          ? "Posting..."
          : "Post Requirement →"}
      </button>

    </form>

  );
}

export default CustomerDashboard;