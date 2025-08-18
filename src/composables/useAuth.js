// src/composables/useAuth.js

import { ref, onMounted, onUnmounted } from 'vue';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail
} from 'firebase/auth';
import multiProjectDAL from '@/dal/multiProjectDal';
import useNotify from '@/composables/useNotify';

const isAuthenticated = ref(false);
const isLoading = ref(true);
const currentUser = ref(null);
const authError = ref(null);

export default function useAuth() {
  const notify = useNotify();
  
  // Get auth instance for operational project
  const getAuthInstance = () => {
    const operationalProject = multiProjectDAL.getFirestore('operational');
    return getAuth(operationalProject.app);
  };

  // Store intended redirect page
  const storeRedirectPage = (path) => {
    localStorage.setItem('auth_redirect_page', path);
  };

  // Get and clear stored redirect page
  const getAndClearRedirectPage = () => {
    const storedPage = localStorage.getItem('auth_redirect_page');
    localStorage.removeItem('auth_redirect_page');
    return storedPage || '/test/login-ok';
  };

  // Check current authentication state
  const checkAuthState = () => {
    return new Promise((resolve) => {
      try {
        const auth = getAuthInstance();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          isAuthenticated.value = !!user;
          currentUser.value = user;
          isLoading.value = false;
          authError.value = null;
          
          unsubscribe();
          resolve(!!user);
        });
      } catch (error) {
        console.error('Auth state check error:', error);
        isLoading.value = false;
        authError.value = error.message;
        resolve(false);
      }
    });
  };

  // Setup passwordless auth for redirect tracking
  const setupPasswordlessAuth = async () => {
    try {
      const auth = getAuthInstance();
      
      // Check if user is signing in with email link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (email) {
          await signInWithEmailLink(auth, email, window.location.href);
          localStorage.removeItem('emailForSignIn');
          notify.success('Successfully signed in!');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Passwordless auth setup error:', error);
      notify.error('Authentication error occurred');
      return false;
    }
  };

  // Get user-friendly error message
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Invalid password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/email-already-in-use':
        return 'This email is already in use by another account.';
      case 'auth/requires-recent-login':
        return 'Please log out and log in again to perform this action.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  // Login user
  const loginUser = async (email, password) => {
    try {
      isLoading.value = true;
      authError.value = null;
      
      const auth = getAuthInstance();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user state
      isAuthenticated.value = true;
      currentUser.value = user;

      notify.success('Login successful!');
      return { success: true, redirectTo: getAndClearRedirectPage() };
      
    } catch (error) {
      console.error('Login error:', error);
      const friendlyMessage = getErrorMessage(error);
      authError.value = friendlyMessage;
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout user
  const logoutUser = async () => {
    try {
      const auth = getAuthInstance();
      await signOut(auth);
      
      isAuthenticated.value = false;
      currentUser.value = null;
      authError.value = null;
      
      // Clear any stored redirect
      localStorage.removeItem('auth_redirect_page');
      
      notify.success('Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      const auth = getAuthInstance();
      await sendPasswordResetEmail(auth, email);
      notify.success('Password reset email sent! Check your inbox.');
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Update user email
  const updateUserEmail = async (newEmail, currentPassword) => {
    try {
      const auth = getAuthInstance();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user before email change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);
      
      notify.success('Email updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Email update error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Update user password
  const updateUserPassword = async (currentPassword, newPassword) => {
    try {
      const auth = getAuthInstance();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      notify.success('Password updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Initialize auth state on mount
  onMounted(async () => {
    // Setup passwordless auth check
    const passwordlessSuccess = await setupPasswordlessAuth();
    
    if (!passwordlessSuccess) {
      // Normal auth state check
      await checkAuthState();
    }
  });

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    authError,
    storeRedirectPage,
    getAndClearRedirectPage,
    checkAuthState,
    loginUser,
    logoutUser,
    resetPassword,
    updateUserEmail,
    updateUserPassword
  };
}