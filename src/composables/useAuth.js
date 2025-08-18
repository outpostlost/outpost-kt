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
  
  // Enhanced debugging for auth instance
  const getAuthInstance = () => {
    console.log('=== AUTH INSTANCE DEBUG START ===');
    
    try {
      // Check if multiProjectDAL is initialized
      console.log('MultiProjectDAL initialized:', !!multiProjectDAL);
      console.log('MultiProjectDAL active project:', multiProjectDAL.getActiveProjectId());
      console.log('MultiProjectDAL loaded projects:', multiProjectDAL.getLoadedProjects());
      
      // Try to get the operational project
      const operationalProject = multiProjectDAL.switchToProject('operational');
      console.log('Operational project switch result:', operationalProject);
      
      // Get the Firebase app for operational project
      const firebaseApp = multiProjectDAL.firebaseApps.get('operational');
      console.log('Firebase app for operational project:', firebaseApp);
      console.log('Firebase app name:', firebaseApp?.name);
      console.log('Firebase app options:', firebaseApp?.options);
      
      if (!firebaseApp) {
        console.error('CRITICAL: No Firebase app found for operational project');
        throw new Error('Firebase app not found for operational project');
      }
      
      // Get auth instance
      const auth = getAuth(firebaseApp);
      console.log('Auth instance created:', auth);
      console.log('Auth app:', auth.app);
      console.log('Auth app options:', auth.app.options);
      console.log('Auth current user:', auth.currentUser);
      
      console.log('=== AUTH INSTANCE DEBUG END ===');
      return auth;
      
    } catch (error) {
      console.error('=== AUTH INSTANCE ERROR ===');
      console.error('Error getting auth instance:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      console.error('=== AUTH INSTANCE ERROR END ===');
      throw error;
    }
  };

  // Store intended redirect page
  const storeRedirectPage = (path) => {
    console.log('Storing redirect page:', path);
    localStorage.setItem('auth_redirect_page', path);
  };

  // Get and clear stored redirect page
  const getAndClearRedirectPage = () => {
    const storedPage = localStorage.getItem('auth_redirect_page');
    localStorage.removeItem('auth_redirect_page');
    const result = storedPage || '/test/login-ok';
    console.log('Retrieved redirect page:', result);
    return result;
  };

  // Check current authentication state
  const checkAuthState = () => {
    console.log('=== AUTH STATE CHECK START ===');
    return new Promise((resolve) => {
      try {
        const auth = getAuthInstance();
        console.log('Auth instance for state check:', auth);
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('Auth state changed - user:', user);
          isAuthenticated.value = !!user;
          currentUser.value = user;
          isLoading.value = false;
          authError.value = null;
          
          console.log('Auth state updated:', {
            isAuthenticated: isAuthenticated.value,
            userEmail: user?.email,
            userId: user?.uid
          });
          
          unsubscribe();
          resolve(!!user);
        });
      } catch (error) {
        console.error('Auth state check error:', error);
        isLoading.value = false;
        authError.value = error.message;
        resolve(false);
      }
      console.log('=== AUTH STATE CHECK END ===');
    });
  };

  // Setup passwordless auth for redirect tracking
  const setupPasswordlessAuth = async () => {
    console.log('=== PASSWORDLESS AUTH SETUP START ===');
    try {
      const auth = getAuthInstance();
      console.log('Auth instance for passwordless setup:', auth);
      
      // Check if user is signing in with email link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        console.log('Email link sign-in detected');
        let email = localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (email) {
          console.log('Attempting email link sign-in for:', email);
          await signInWithEmailLink(auth, email, window.location.href);
          localStorage.removeItem('emailForSignIn');
          notify.success('Successfully signed in!');
          return true;
        }
      }
      console.log('No email link sign-in detected');
      return false;
    } catch (error) {
      console.error('Passwordless auth setup error:', error);
      notify.error('Authentication error occurred');
      return false;
    }
    console.log('=== PASSWORDLESS AUTH SETUP END ===');
  };

  // Get user-friendly error message
  const getErrorMessage = (error) => {
    console.log('Processing error for user display:', error);
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
      case 'auth/configuration-not-found':
        return 'Authentication service configuration error.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  // Login user
  const loginUser = async (email, password) => {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Login attempt for email:', email);
    console.log('Password length:', password ? password.length : 0);
    
    try {
      isLoading.value = true;
      authError.value = null;
      
      const auth = getAuthInstance();
      console.log('Auth instance for login:', auth);
      console.log('Auth config being used:', auth.config);
      
      console.log('Calling signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful - userCredential:', userCredential);
      
      const user = userCredential.user;
      console.log('User object:', user);
      console.log('User details:', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      });

      // Update user state
      isAuthenticated.value = true;
      currentUser.value = user;

      notify.success('Login successful!');
      const redirectTo = getAndClearRedirectPage();
      console.log('=== LOGIN ATTEMPT SUCCESS ===');
      return { success: true, redirectTo };
      
    } catch (error) {
      console.error('=== LOGIN ATTEMPT ERROR ===');
      console.error('Login error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        customData: error.customData
      });
      
      const friendlyMessage = getErrorMessage(error);
      authError.value = friendlyMessage;
      notify.error(friendlyMessage);
      console.error('=== LOGIN ATTEMPT ERROR END ===');
      return { success: false, error: friendlyMessage };
    } finally {
      isLoading.value = false;
    }
  };

  // Logout user
  const logoutUser = async () => {
    console.log('=== LOGOUT ATTEMPT START ===');
    try {
      const auth = getAuthInstance();
      await signOut(auth);
      
      isAuthenticated.value = false;
      currentUser.value = null;
      authError.value = null;
      
      // Clear any stored redirect
      localStorage.removeItem('auth_redirect_page');
      
      notify.success('Logged out successfully');
      console.log('=== LOGOUT SUCCESSFUL ===');
      return { success: true };
    } catch (error) {
      console.error('=== LOGOUT ERROR ===');
      console.error('Logout error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    console.log('=== PASSWORD RESET START ===');
    console.log('Password reset for email:', email);
    
    try {
      const auth = getAuthInstance();
      console.log('Auth instance for password reset:', auth);
      
      await sendPasswordResetEmail(auth, email);
      notify.success('Password reset email sent! Check your inbox.');
      console.log('=== PASSWORD RESET SUCCESS ===');
      return { success: true };
    } catch (error) {
      console.error('=== PASSWORD RESET ERROR ===');
      console.error('Password reset error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Update user email
  const updateUserEmail = async (newEmail, currentPassword) => {
    console.log('=== EMAIL UPDATE START ===');
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
      console.log('=== EMAIL UPDATE SUCCESS ===');
      return { success: true };
    } catch (error) {
      console.error('=== EMAIL UPDATE ERROR ===');
      console.error('Email update error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Update user password
  const updateUserPassword = async (currentPassword, newPassword) => {
    console.log('=== PASSWORD UPDATE START ===');
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
      console.log('=== PASSWORD UPDATE SUCCESS ===');
      return { success: true };
    } catch (error) {
      console.error('=== PASSWORD UPDATE ERROR ===');
      console.error('Password update error:', error);
      const friendlyMessage = getErrorMessage(error);
      notify.error(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  // Initialize auth state on mount
  onMounted(async () => {
    console.log('=== AUTH COMPOSABLE MOUNTED ===');
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