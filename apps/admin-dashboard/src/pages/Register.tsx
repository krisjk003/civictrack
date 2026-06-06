import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          role: "user",
          createdAt: new Date(),
        },
        { merge: true }
      );

      navigate("/user-dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>CivicTrack Registration</h1>

      <button onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </div>
  );
}