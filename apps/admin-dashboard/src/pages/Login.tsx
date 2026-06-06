import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const adminDoc = await getDoc(doc(db, "admins", uid));

      if (adminDoc.exists()) {
        navigate("/dashboard");
      } else {
        await signOut(auth);
        setError("You are not an authorized admin.");
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Top accent bar */}
        <div style={styles.accentBar} />

        {/* Brand */}
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EEEDFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span style={styles.brandName}>Admin Portal</span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to your admin account</p>

        {/* Email */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrap}>
            <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              style={styles.input}
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Password */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrap}>
            <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {error && (
          <div style={styles.errorBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div style={styles.divider} />
        <p style={styles.footer}>Access restricted to authorized administrators only.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f4f2",
    padding: "1rem",
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "#ffffff",
    border: "0.5px solid rgba(0,0,0,0.12)",
    borderRadius: 16,
    padding: "2.5rem 2rem",
    position: "relative",
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    background: "linear-gradient(90deg, #534AB7, #1D9E75, #D85A30)",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "2rem",
  },
  brandIcon: {
    width: 36, height: 36,
    background: "#534AB7",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
    letterSpacing: "-0.01em",
  },
  heading: {
    fontSize: 22,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  subheading: {
    fontSize: 13,
    color: "#888",
    margin: "0 0 1.75rem",
  },
  fieldGroup: { marginBottom: "1rem" },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "#888",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    color: "#aaa",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "9px 12px 9px 38px",
    fontSize: 14,
    border: "0.5px solid rgba(0,0,0,0.18)",
    borderRadius: 8,
    outline: "none",
    background: "#fafafa",
    color: "#1a1a1a",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  button: {
    width: "100%",
    marginTop: "1.5rem",
    padding: "11px",
    background: "#534AB7",
    color: "#EEEDFE",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    letterSpacing: "0.01em",
    fontFamily: "inherit",
  },
  errorBox: {
    marginTop: "1rem",
    padding: "10px 12px",
    background: "#FCEBEB",
    border: "0.5px solid #F09595",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#A32D2D",
  },
  divider: {
    height: "0.5px",
    background: "rgba(0,0,0,0.08)",
    margin: "1.75rem 0 1.25rem",
  },
  footer: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    margin: 0,
  },
};