import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const stats = [
    { title: "Total Reports", value: 124 },
    { title: "Pending", value: 32 },
    { title: "In Progress", value: 18 },
    { title: "Resolved", value: 74 },
  ];

  const recentReports = [
    {
      id: 1,
      title: "Open Manhole",
      location: "Trivandrum",
      status: "Pending",
    },
    {
      id: 2,
      title: "Fallen Electric Pole",
      location: "Kochi",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Road Damage",
      location: "Kollam",
      status: "Resolved",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>CivicTrack Admin Dashboard</h1>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="actions">
        <button>View Reports</button>
        <button>Manage Departments</button>
      </div>

      <div className="recent-section">
        <h2>Recent Reports</h2>

        <table>
          <thead>
            <tr>
              <th>Hazard</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {recentReports.map((report) => (
              <tr key={report.id}>
                <td>{report.title}</td>
                <td>{report.location}</td>
                <td>{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;