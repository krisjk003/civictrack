import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Login.css";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createUserDocument = async (
    uid: string,
    userName: string,
    userEmail: string,
    provider: string
  ) => {
    const userRef = doc(db, "users", uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: userName,
        email: userEmail,
      });
    }
  };

  const handleRegister = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await createUserDocument(
        result.user.uid,
        name,
        email,
        "password"
      );

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account already exists with this email.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError(
            "Password must be at least 6 characters long."
          );
          break;

        default:
          setError("Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
        auth,
        provider
      );

      const user = result.user;

      await createUserDocument(
        user.uid,
        user.displayName || "User",
        user.email || "",
        "google"
      );

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);

      if (
        err.code === "auth/popup-closed-by-user"
      ) {
        setError("Registration cancelled.");
      } else {
        setError(
          "Failed to register with Google."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="accent-bar" />

        <div className="brand-row">
          <div className="brand-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EEEDFE"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <span className="brand-name">
            CivicTrack
          </span>
        </div>

        <h1 className="login-heading">
          Create Account
        </h1>

        <p className="login-subheading">
          Join CivicTrack and start reporting
          hazards in your community.
        </p>

        <div className="field-group">
          <label className="field-label">
            Full Name
          </label>

          <input
            className="login-input"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            Email
          </label>

          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            Password
          </label>

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            Confirm Password
          </label>

          <input
            className="login-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className="login-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#FFF5F5",
              border:
                "1px solid #F5C2C7",
              color: "#B42318",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="divider">
          <span className="divider-text">
            OR
          </span>
        </div>

        <button
          className="google-btn"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.3 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2c-2.1 1.5-4.7 2.4-7.3 2.4-5.3 0-9.7-3.3-11.3-8H6.2C9.5 39.5 16.1 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.2 7l6.2 5.2C39.1 36.7 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>

          {loading
            ? "Creating Account..."
            : "Continue with Google"}
        </button>

        <div className="register-section">
          <span>Already Have an Account?</span>

          <button
            className="register-link"
            onClick={() => navigate("/")}
          >
            Go to back to Login Page
          </button>
        </div>

      </div>
    </div>
  );
}

