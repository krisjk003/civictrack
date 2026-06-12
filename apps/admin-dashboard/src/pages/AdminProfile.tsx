import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";
import { API_URL } from "../config/api";

export default function AdminProfile() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const [department, setDepartment] = useState("");
    const [state, setState] = useState("");
    const [district, setDistrict] = useState("");
    const [locality, setLocality] = useState("");

    const [email, setEmail] = useState("");

    const departments = [
        "Public Works Department (PWD)",
        "Kerala Water Authority",
        "Kerala State Electricity Board (KSEB)",
        "Municipality",
        "Corporation",
        "Panchayat",
        "National Highways Authority",
        "Disaster Management Authority",
        "Health Department",
        "Police Department",
        "Fire & Rescue Services",
        "Forest Department",
        "Irrigation Department",
        "Harbour Engineering Department",
        "Motor Vehicles Department",
    ];

    const states = ["Kerala"];

    const districts = [
        "Thiruvananthapuram",
        "Kollam",
        "Pathanamthitta",
        "Alappuzha",
        "Kottayam",
        "Idukki",
        "Ernakulam",
        "Thrissur",
        "Palakkad",
        "Malappuram",
        "Kozhikode",
        "Wayanad",
        "Kannur",
        "Kasaragod",
    ];

    const districtTaluks: Record<string, string[]> = {
        Thiruvananthapuram: [
        "Chirayinkeezhu",
        "Nedumangad",
        "Neyyattinkara",
        "Thiruvananthapuram",
        "Varkala",
        "Kattakada",
        ],

        Kollam: [
        "Kollam",
        "Karunagappally",
        "Kunnathur",
        "Kottarakkara",
        "Pathanapuram",
        "Punalur",
        ],

        Pathanamthitta: [
        "Adoor",
        "Konni",
        "Kozhencherry",
        "Mallappally",
        "Ranni",
        "Thiruvalla",
        ],

        Alappuzha: [
        "Ambalappuzha",
        "Cherthala",
        "Karthikappally",
        "Chengannur",
        "Kuttanad",
        "Mavelikkara",
        ],

        Kottayam: [
        "Changanassery",
        "Kanjirappally",
        "Kottayam",
        "Meenachil",
        "Vaikom",
        ],

        Idukki: [
        "Devikulam",
        "Peermade",
        "Thodupuzha",
        "Udumbanchola",
        ],

        Ernakulam: [
        "Aluva",
        "Kanayannur",
        "Kochi",
        "Kothamangalam",
        "Kunnathunad",
        "Muvattupuzha",
        "North Paravur",
        ],

        Thrissur: [
        "Chalakkudy",
        "Chavakkad",
        "Kodungallur",
        "Mukundapuram",
        "Talappilly",
        "Thrissur",
        "Kunnamkulam",
        ],

        Palakkad: [
        "Alathur",
        "Chittur",
        "Mannarkkad",
        "Ottapalam",
        "Palakkad",
        "Pattambi",
        ],

        Malappuram: [
        "Eranad",
        "Kondotty",
        "Nilambur",
        "Perinthalmanna",
        "Ponnani",
        "Tirur",
        "Tirurangadi",
        ],

        Kozhikode: [
        "Kozhikode",
        "Koyilandy",
        "Thamarassery",
        "Vadakara",
        ],

        Wayanad: [
        "Mananthavady",
        "Sulthan Bathery",
        "Vythiri",
        ],

        Kannur: [
        "Kannur",
        "Iritty",
        "Payyanur",
        "Taliparamba",
        "Thalassery",
        ],

        Kasaragod: [
        "Hosdurg",
        "Kasaragod",
        "Manjeshwaram",
        "Vellarikundu",
        ],
    };

    useEffect(() => {
    loadProfile();
    }, []);

    const loadProfile = async () => {
    try {
        const user = auth.currentUser;

        if (!user) {
        navigate("/");
        return;
        }

        setEmail(user.email || "");

        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
        setIsAdmin(false);
        setLoading(false);
        return;
        }

        setIsAdmin(true);

        const data = adminSnap.data();

        setName(data.name || "");
        setPhone(data.phone || "");

        setDepartment(data.department || "");
        setState(data.state || "");
        setDistrict(data.district || "");
        setLocality(data.locality || "");

        

        setLoading(false);
        }catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
    try {
        const user = auth.currentUser;

        if (!user) return;

        const token =
        await user.getIdToken();

        await fetch(
        `${API_URL}/admin/profile`,
        {
            method: "PUT",
            headers: {
            Authorization:
                `Bearer ${token}`,
            "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
            name,
            phone,
            department,
            state,
            district,
            locality,
            }),
        }
        );

        navigate("/dashboard");
    } catch (error) {
  console.error(error);
  alert(String(error));
}
    };

    if (loading) {
    return <h2>Loading...</h2>;
    }
    if (!isAdmin) {
    return (
        <div className="admin-profile-page">
        <div className="profile-card">
            <h1>Access Denied</h1>

            <p>
            This page is only available to registered
            CivicTrack administrators.
            </p>

            <button
            className="save-btn"
            onClick={() => navigate("/")}
            >
            Return Home
            </button>
        </div>
        </div>
    );
    }

    return (
    <div className="admin-profile-page">
        <div className="profile-card">
        <h1>Complete Admin Profile</h1>
        <div className="form-grid">
            <div className="form-group">
                <label>Name</label>
                <input
                type="text"
                value={name}
                onChange={(e) =>
                    setName(e.target.value)
                }
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                type="text"
                value={email}
                disabled
                />
            </div>

            <div className="form-group">
                <label>Phone</label>
                <input
                type="text"
                value={phone}
                onChange={(e) =>
                    setPhone(e.target.value)
                }
                />
            </div>

            <div className="form-group">
            <label>Department</label>

            <select
                value={department}
                onChange={(e) =>
                setDepartment(e.target.value)
                }
            >
                <option value="">
                Select Department
                </option>

                {departments.map((dept) => (
                <option
                    key={dept}
                    value={dept}
                >
                    {dept}
                </option>
                ))}
            </select>
            </div>

            <div className="form-group">
            <label>State</label>

            <select
                value={state}
                onChange={(e) => {
                setState(e.target.value);
                setDistrict("");
                setLocality("");
                }}
            >
                <option value="">
                Select State
                </option>

                {states.map((s) => (
                <option
                    key={s}
                    value={s}
                >
                    {s}
                </option>
                ))}
            </select>
            </div>

            <div className="form-group">
            <label>District</label>

            <select
                value={district}
                onChange={(e) => {
                setDistrict(e.target.value);
                setLocality("");
                }}
            >
                <option value="">
                Select District
                </option>

                {districts.map((d) => (
                <option
                    key={d}
                    value={d}
                >
                    {d}
                </option>
                ))}
            </select>
            </div>

            <div className="form-group">
            <label>Locality (Taluk)</label>

            <select
                value={locality}
                onChange={(e) =>
                setLocality(e.target.value)
                }
                disabled={!district}
            >
                <option value="">
                Select Taluk
                </option>

                {(districtTaluks[district] || []).map(
                (taluk) => (
                    <option
                    key={taluk}
                    value={taluk}
                    >
                    {taluk}
                    </option>
                )
                )}
            </select>
            </div>
        </div>

        <button
            className="save-btn"
            onClick={handleSave}
        >
            Save Profile
        </button>
        </div>
    </div>
    );
}