import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/admin`;

const EMPTY_STATS = {
  totalUsers: 0,
  totalCustomers: 0,
  totalSellers: 0,
  totalRequirements: 0,
  totalOffers: 0,
};

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

function StatusBadge({ status }) {
  const normalizedStatus = (status || "PENDING").toUpperCase();
  const statusClass = ["OPEN", "PENDING", "ACCEPTED", "REJECTED"].includes(
    normalizedStatus,
  )
    ? normalizedStatus.toLowerCase()
    : "pending";

  return (
    <span className={`status-badge status-${statusClass}`}>
      {normalizedStatus}
    </span>
  );
}

function getAuthConfig() {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [users, setUsers] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [offers, setOffers] = useState([]);
  const currentAdminId = localStorage.getItem("userId");

  const loadDashboard = useCallback(async () => {
    try {
      return await Promise.all([
        axios.get(`${API_URL}/stats`, getAuthConfig()),
        axios.get(`${API_URL}/users`, getAuthConfig()),
        axios.get(`${API_URL}/requirements`, getAuthConfig()),
        axios.get(`${API_URL}/offers`, getAuthConfig()),
      ]);
    } catch (error) {
      console.error("Error loading admin dashboard:", error);
      alert(getErrorMessage(error, "Failed to load admin dashboard"));
      return null;
    }
  }, []);

  const applyDashboardData = useCallback(
    ([statsResponse, usersResponse, requirementsResponse, offersResponse]) => {
      setStats({ ...EMPTY_STATS, ...statsResponse.data });
      setUsers(usersResponse.data);
      setRequirements(requirementsResponse.data);
      setOffers(offersResponse.data);
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    loadDashboard().then((responses) => {
      if (isActive && responses) {
        applyDashboardData(responses);
      }
    });

    return () => {
      isActive = false;
    };
  }, [applyDashboardData, loadDashboard]);

  const deleteItem = async (resource, id, label) => {
    if (!window.confirm(`Are you sure you want to delete this ${label}?`)) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/${resource}/${id}`,
        getAuthConfig(),
      );
      alert(`${label[0].toUpperCase()}${label.slice(1)} deleted successfully`);
      const responses = await loadDashboard();
      if (responses) {
        applyDashboardData(responses);
      }
    } catch (error) {
      console.error(`Error deleting ${label}:`, error);
      alert(getErrorMessage(error, `Failed to delete ${label}`));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: "♙", tone: "blue" },
    { label: "Customers", value: stats.totalCustomers, icon: "◎", tone: "violet" },
    { label: "Sellers", value: stats.totalSellers, icon: "◇", tone: "teal" },
    {
      label: "Requirements",
      value: stats.totalRequirements,
      icon: "▤",
      tone: "amber",
    },
    { label: "Offers", value: stats.totalOffers, icon: "▣", tone: "rose" },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-icon" aria-hidden="true">
            R
          </div>
          <div className="admin-brand-copy">
            <h1>Reverse Marketplace</h1>
            <p>Administration Panel</p>
          </div>
        </div>

        <div className="admin-header-right">
          <span className="admin-role">Administrator</span>
          <button className="admin-logout" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-welcome">
          <div>
            <span className="admin-eyebrow">PLATFORM MANAGEMENT</span>
            <h2>Admin Dashboard</h2>
            <p>Monitor and manage the Reverse Marketplace platform.</p>
          </div>
        </div>

        <section className="admin-section" aria-labelledby="overview-title">
          <div className="admin-section-heading">
            <div className="section-icon section-icon-blue" aria-hidden="true">
              ◫
            </div>
            <div>
              <h3 id="overview-title">Platform Overview</h3>
              <p>Current marketplace statistics</p>
            </div>
          </div>

          <div className="admin-stats">
            {statCards.map((card) => (
              <article className="admin-stat-card" key={card.label}>
                <div
                  className={`stat-icon stat-icon-${card.tone}`}
                  aria-hidden="true"
                >
                  {card.icon}
                </div>
                <div className="stat-copy">
                  <span>{card.label}</span>
                  <strong>{card.value ?? 0}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-section" aria-labelledby="users-title">
          <div className="admin-section-heading">
            <div className="section-icon section-icon-violet" aria-hidden="true">
              ♙
            </div>
            <div>
              <h3 id="users-title">Manage Users</h3>
              <p>View and manage registered marketplace users.</p>
            </div>
            <span className="admin-section-count">{users.length} users</span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td className="empty-table" colSpan={5}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const role = (user.role || "").toUpperCase();
                    return (
                      <tr key={user.id}>
                        <td className="admin-id">#{user.id}</td>
                        <td className="admin-primary-cell">{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`role-badge role-${role.toLowerCase()}`}
                          >
                            {role}
                          </span>
                        </td>
                        <td>
                          {String(user.id) !== currentAdminId && (
                            <button
                              className="admin-delete-button"
                              onClick={() =>
                                deleteItem("users", user.id, "user")
                              }
                              type="button"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section" aria-labelledby="requirements-title">
          <div className="admin-section-heading">
            <div className="section-icon section-icon-amber" aria-hidden="true">
              ▤
            </div>
            <div>
              <h3 id="requirements-title">Manage Requirements</h3>
              <p>Monitor customer requirements posted on the platform.</p>
            </div>
            <span className="admin-section-count">
              {requirements.length} requirements
            </span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Category</th>
                  <th scope="col">Budget</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {requirements.length === 0 ? (
                  <tr>
                    <td className="empty-table" colSpan={6}>
                      No requirements found
                    </td>
                  </tr>
                ) : (
                  requirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td className="admin-id">#{requirement.id}</td>
                      <td className="admin-primary-cell">{requirement.title}</td>
                      <td>
                        <span className="category-badge">
                          {requirement.category}
                        </span>
                      </td>
                      <td>
                        {requirement.budget == null
                          ? "—"
                          : `₹${requirement.budget}`}
                      </td>
                      <td>
                        <StatusBadge status={requirement.status} />
                      </td>
                      <td>
                        <button
                          className="admin-delete-button"
                          onClick={() =>
                            deleteItem(
                              "requirements",
                              requirement.id,
                              "requirement",
                            )
                          }
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section" aria-labelledby="offers-title">
          <div className="admin-section-heading">
            <div className="section-icon section-icon-teal" aria-hidden="true">
              ▣
            </div>
            <div>
              <h3 id="offers-title">Manage Offers</h3>
              <p>Monitor seller offers submitted to customers.</p>
            </div>
            <span className="admin-section-count">{offers.length} offers</span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Price</th>
                  <th scope="col">Delivery Time</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 ? (
                  <tr>
                    <td className="empty-table" colSpan={5}>
                      No offers found
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr key={offer.id}>
                      <td className="admin-id">#{offer.id}</td>
                      <td className="admin-primary-cell">
                        {offer.price == null ? "—" : `₹${offer.price}`}
                      </td>
                      <td>{offer.deliveryTime || "—"}</td>
                      <td>
                        <StatusBadge status={offer.status} />
                      </td>
                      <td>
                        <button
                          className="admin-delete-button"
                          onClick={() => deleteItem("offers", offer.id, "offer")}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
