import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Create user document if it doesn't already exist
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
        });
      }

      console.log("Success", user);

      navigate("/Dashboard");
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign in cancelled.");
      } else {
        setError(
          err.message || "Failed to sign in with Google."
        );
      }
    } finally {
      console.log("Finally running");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f4f2",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          padding: "2rem",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.1)",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "0.5rem",
            fontSize: "28px",
            textAlign: "center",
            color: "#1a1a1a",
          }}
        >
          CivicTrack
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "2rem",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Sign in to report and track hazards in your community.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: "#534AB7",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "0.2s",
          }}
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "10px",
              borderRadius: "8px",
              background: "#FCEBEB",
              color: "#A32D2D",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}