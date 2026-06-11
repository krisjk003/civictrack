// lib/features/auth/data/auth_service.dart

import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final GoogleSignIn _googleSignIn = GoogleSignIn();
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static User? get currentUser => _auth.currentUser;

  static Stream<User?> get authStateChanges => _auth.authStateChanges();

  /// Email + password sign in
  static Future<UserCredential> signInWithEmail({
    required String email,
    required String password,
  }) async {
    return await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
  }

  /// Email + password registration
  static Future<UserCredential> signUpWithEmail({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );

    // Update display name
    await credential.user?.updateDisplayName(displayName);

    // Create Firestore user document
    await _createUserDocument(credential.user!, displayName: displayName);

    return credential;
  }

  /// Google sign in
  static Future<UserCredential?> signInWithGoogle() async {
    final GoogleSignInAccount? googleAccount = await _googleSignIn.signIn();

    if (googleAccount == null) return null; // user cancelled

    final GoogleSignInAuthentication googleAuth =
        await googleAccount.authentication;

    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final userCredential = await _auth.signInWithCredential(credential);

    // Create/update Firestore document if new user
    if (userCredential.additionalUserInfo?.isNewUser == true) {
      await _createUserDocument(
        userCredential.user!,
        displayName: googleAccount.displayName ?? '',
      );
    }

    return userCredential;
  }

  /// Password reset email
  static Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email.trim());
  }

  /// Sign out
  static Future<void> signOut() async {
    await Future.wait([_auth.signOut(), _googleSignIn.signOut()]);
  }

  /// Creates the user document in Firestore (mirrors backend UsersService)
  static Future<void> _createUserDocument(
    User user, {
    required String displayName,
  }) async {
    final docRef = _firestore.collection('users').doc(user.uid);
    final doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({
        'uid': user.uid,
        'email': user.email ?? '',
        'name': displayName,
        'role': 'citizen',
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    }
  }

  /// Human-readable error messages
  static String getErrorMessage(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No account found with this email.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'email-already-in-use':
        return 'An account with this email already exists.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'weak-password':
        return 'Password should be at least 6 characters.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'network-request-failed':
        return 'No internet connection. Please check your network.';
      default:
        return e.message ?? 'Something went wrong. Please try again.';
    }
  }
}
