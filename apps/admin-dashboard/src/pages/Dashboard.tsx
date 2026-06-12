import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {collection, onSnapshot, getDoc, doc, updateDoc, Timestamp} from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../firebase";


type HazardStatus =
  | "Pending"
  | "In Progress"
  | "Resolved";

type Hazard = {
  id: string;
  title: string;
  description: string;
  photos: string[];
  latitude: number;
  longitude: number;
  reportCount: number;
  basePriority: number;
  displayPriority: number;
  status: HazardStatus;
  reportedOn: Timestamp;
};

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleStatusChange = async (
    id: string,
    newStatus: HazardStatus
  ) => {
    try {
      await updateDoc(
        doc(db, "hazardReports", id),
        {
          status: newStatus
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const adminDoc = await getDoc(
        doc(db, "admins", user.uid)
      );

      if (adminDoc.exists()) {
        setIsAdmin(true);

        const adminData = adminDoc.data();

        const complete =
          adminData.profileCompleted === true

        setProfileComplete(complete);
      }
      setCheckingAdmin(false);
    });
    

    return unsubscribe;
  }, []);
  
  
  const [hazards , setHazards]= useState<Hazard[]>([]);


  const stats = [
    {
      title: "Total Reports",
      value: hazards.length,
    },
    {
      title: "Pending",
      value: hazards.filter(h => h.status === "Pending" ).length,
    },
    {
      title: "In Progress",
      value: hazards.filter(h => h.status === "In Progress" ).length,
    },
    {
      title: "Resolved",
      value: hazards.filter(h => h.status === "Resolved" ).length,
    },
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "hazardReports"),
      (snapshot) => {
        const data: Hazard[] = snapshot.docs.map((doc) => {
          const hazard = doc.data();

          return {
            id: doc.id,
            title: hazard.title,
            description: hazard.description,
            photos: hazard.photos || [],
            latitude: hazard.latitude,
            longitude: hazard.longitude,
            reportCount: hazard.reportCount || 1,
            basePriority: hazard.basePriority,
            displayPriority:
              hazard.basePriority +
              Math.min(hazard.reportCount || 0, 20),
            status: hazard.status as HazardStatus,
            reportedOn: hazard.reportedOn,
          };
        });

        setHazards(data);
      },
      (error) => {
        console.error("Firestore listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  if (checkingAdmin) {
    return <h2>Loading...</h2>;
  }

  if (isAdmin && !profileComplete) {
    return (
      <div className="complete-profile">
        <h1>Complete Your Profile</h1>

        <p>
          Please complete your administrative profile
          before accessing CivicTrack.
        </p>

        <button
          onClick={() => navigate("/admin-profile")}
        >
          Complete Profile
        </button>
      </div>
    );
  }
  
  return (
    <>
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

      <div className="hazards-section">
        <h2>Priority Hazards</h2>

        <table className="hazards-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Hazard</th>
              <th>Description</th>
              <th>Reports</th>
              <th>Reported On</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>
            {[...hazards]
            .sort((a,b) => b.displayPriority - a.displayPriority)
            .map((item , index) => (
              <tr key={item.id}>
              <td>
                <div className="priority-rank">
                  {index + 1}
                </div>
              </td>

                <td>
                  <div className="hazard-title-wrapper">
                    <span
                      className="hazard-title"
                      onClick={() => {
                        setSelectedHazard(item);
                        setCurrentImage(0);
                      }}
                    >
                      {item.title}
                    </span>

                    {item.photos.length > 0 && (
                      <div className="hover-preview">
                        <img
                          src={item.photos[0]}
                          alt={item.title}
                        />
                      </div>
                    )}
                  </div>
                </td>

                <td>{item.description}</td>

                <td>{item.reportCount}</td>

                <td>
                  {item.reportedOn
                    ?.toDate()
                    .toLocaleString()}
                </td>
                <td>
                  {isAdmin ? (
                    <select
                      className={`status-select ${
                        item.status === "Pending"
                          ? "pending"
                          : item.status === "In Progress"
                          ? "progress"
                          : "resolved"
                      }`}
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as HazardStatus
                        )
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  ) : (
                    <span
                      className={`status-badge ${
                        item.status === "Pending"
                          ? "pending"
                          : item.status === "In Progress"
                          ? "progress"
                          : "resolved"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </td>



                <td>
                  <a
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
    </div>

    {selectedHazard && (
  <div
    className="gallery-modal"
    onClick={() => setSelectedHazard(null)}
  >
    <div
      className="gallery-content"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="close-btn"
        onClick={() => setSelectedHazard(null)}
      >
        ×
      </button>

      <img
        className="gallery-main-image"
        src={selectedHazard.photos[currentImage]}
        alt="Hazard"
      />

      <div className="gallery-thumbnails">
        {selectedHazard.photos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Thumbnail ${index}`}
            className={
              currentImage === index
                ? "thumbnail active"
                : "thumbnail"
            }
            onClick={() => setCurrentImage(index)}
          />
        ))}
      </div>
    </div>
  </div>
)}
</>
  );
}

export default Dashboard;