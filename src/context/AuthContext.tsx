import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Language, FarmerDesignation } from '../types';
import { dbService } from '../db/dbService';
import { hashPassword, verifyPassword, validatePasswordRequirements, validateEmail, validateMobile } from '../utils/crypto';
import { useLanguage } from '../i18n/LanguageContext';
import { apiClient, ApiError } from '../services/apiClient';

export interface SignUpFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  preferredLanguage: Language;
  state: string;
  district: string;
  designation?: FarmerDesignation | string;
  avatarUrl?: string;
  termsAccepted: boolean;
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authScreen: 'login' | 'signup' | 'forgot_password';
  setAuthScreen: (screen: 'login' | 'signup' | 'forgot_password') => void;
  login: (identifier: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignUpFormData) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  resetPasswordDemo: (identifier: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'farmveda_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setLanguage } = useLanguage();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup' | 'forgot_password'>('login');

  useEffect(() => {
    const handleUnauthorized = () => {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      apiClient.clearAccessToken();
      setCurrentUser(null);
      setAuthScreen('login');
    };
    window.addEventListener('farmveda:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('farmveda:unauthorized', handleUnauthorized);
  }, []);

  // Load existing session on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        await dbService.initializeDatabase();

        // Check sessionStorage first, then localStorage
        let sessionRaw = sessionStorage.getItem(STORAGE_KEY);
        if (!sessionRaw) {
          sessionRaw = localStorage.getItem(STORAGE_KEY);
        }

        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session?.userId) {
            let remoteUser: {id:string;full_name:string;email:string;preferred_language?:Language} | undefined;
            let sessionVerificationUnavailable = false;
            if (apiClient.configured) {
              try { remoteUser = await apiClient.restoreSession(); }
              catch { sessionVerificationUnavailable = true; }
            }
            let user = await dbService.getUserById(session.userId);
            if (apiClient.configured && remoteUser && remoteUser.id === session.userId) {
              user = user
                ? { ...user, fullName: remoteUser.full_name, email: remoteUser.email, preferredLanguage: remoteUser.preferred_language || user.preferredLanguage }
                : {
                    id: remoteUser.id, fullName: remoteUser.full_name, email: remoteUser.email, mobileNumber: '',
                    passwordHash: '', preferredLanguage: remoteUser.preferred_language || 'en', state: '', district: '',
                    termsAccepted: true, createdAt: new Date().toISOString(),
                  };
              await dbService.createUser(user).catch(() => undefined);
            } else if (apiClient.configured && sessionVerificationUnavailable && user) {
              // Keep the cached identity during a temporary backend outage; protected requests still require a valid API token.
            } else if (apiClient.configured) {
              sessionStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(STORAGE_KEY);
              user = undefined;
            }
            if (user) {
              setCurrentUser(user);
              if (user.preferredLanguage) {
                setLanguage(user.preferredLanguage);
              }
            } else {
              // Stale session
              sessionStorage.removeItem(STORAGE_KEY);
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize demo auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setLanguage]);

  // Login handler
  const login = async (
    identifier: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    if (!identifier.trim()) {
      return { success: false, error: 'Please enter your email address or mobile number.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      await dbService.initializeDatabase();
      if (apiClient.configured) {
        if (identifier.includes('@')) {
          const response = await apiClient.login(identifier.trim(), password, rememberMe);
          const remote = response.user as { id: string; full_name: string; email: string; preferred_language?: Language };
          let profile = await dbService.getUserById(remote.id);
          if (!profile) {
            profile = {
              id: remote.id, fullName: remote.full_name, email: remote.email, mobileNumber: '',
              passwordHash: await hashPassword(password), preferredLanguage: remote.preferred_language || 'en',
              state: '', district: '', termsAccepted: true, createdAt: new Date().toISOString(),
            };
            await dbService.createUser(profile);
          }
          const updated = { ...profile, lastLoginAt: new Date().toISOString() };
          await dbService.updateUser(remote.id, { lastLoginAt: updated.lastLoginAt });
          const sessionData = JSON.stringify({ userId: remote.id, rememberMe, loggedInAt: new Date().toISOString() });
          if (rememberMe) { localStorage.setItem(STORAGE_KEY, sessionData); sessionStorage.removeItem(STORAGE_KEY); }
          else { sessionStorage.setItem(STORAGE_KEY, sessionData); localStorage.removeItem(STORAGE_KEY); }
          setCurrentUser(updated);
          setLanguage(updated.preferredLanguage);
          return { success: true };
        }
        return { success: false, error: 'Enter the email address used for your backend account.' };
      }
      const user = await dbService.getUserByEmailOrMobile(identifier.trim());
      if (!user) {
        return { success: false, error: 'No account found with this email or mobile number.' };
      }

      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      // Update last login
      const updatedUser: UserProfile = {
        ...user,
        lastLoginAt: new Date().toISOString(),
      };
      await dbService.updateUser(user.id, { lastLoginAt: updatedUser.lastLoginAt });

      // Save session
      const sessionData = JSON.stringify({ userId: user.id, rememberMe, loggedInAt: new Date().toISOString() });
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, sessionData);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, sessionData);
        localStorage.removeItem(STORAGE_KEY);
      }

      setCurrentUser(updatedUser);
      if (updatedUser.preferredLanguage) {
        setLanguage(updatedUser.preferredLanguage);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof ApiError ? err.message : 'Authentication failed. Please try again.' };
    }
  };

  // Sign up handler
  const signup = async (data: SignUpFormData): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    if (!data.fullName.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!data.email.trim() || !validateEmail(data.email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!data.mobileNumber.trim() || !validateMobile(data.mobileNumber)) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!data.state.trim()) {
      return { success: false, error: 'Please select or enter your state.' };
    }
    if (!data.district.trim()) {
      return { success: false, error: 'Please enter your district.' };
    }

    // Password requirements check
    const pwdValidation = validatePasswordRequirements(data.password);
    if (!pwdValidation.isValid) {
      return {
        success: false,
        error: 'Password must have at least 8 characters, 1 uppercase letter, and 1 number.',
      };
    }
    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }
    if (!data.termsAccepted) {
      return { success: false, error: 'You must agree to the Terms and Conditions.' };
    }

    try {
      await dbService.initializeDatabase();

      if (apiClient.configured) {
        const response = await apiClient.register({
          full_name: data.fullName.trim(), email: data.email.trim().toLowerCase(),
          mobile_number: data.mobileNumber.trim(), password: data.password,
          preferred_language: data.preferredLanguage,
        });
        const remote = response.user as { id: string; full_name: string; email: string; preferred_language?: Language };
        const passwordHash = await hashPassword(data.password);
        const newUser: UserProfile = {
          id: remote.id, fullName: remote.full_name, email: remote.email, mobileNumber: data.mobileNumber.trim(),
          passwordHash, preferredLanguage: remote.preferred_language || data.preferredLanguage,
          state: data.state.trim(), district: data.district.trim(), designation: data.designation || 'Farm Owner & Manager',
          avatarUrl: data.avatarUrl, termsAccepted: true, createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(),
        };
        await dbService.createUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: remote.id, rememberMe: true, loggedInAt: new Date().toISOString() }));
        setCurrentUser(newUser);
        setLanguage(newUser.preferredLanguage);
        return { success: true, user: newUser };
      }

      // Check if user already exists
      const existingEmail = await dbService.getUserByEmailOrMobile(data.email);
      if (existingEmail) {
        return { success: false, error: 'An account with this email address already exists.' };
      }
      const existingMobile = await dbService.getUserByEmailOrMobile(data.mobileNumber);
      if (existingMobile) {
        return { success: false, error: 'An account with this mobile number already exists.' };
      }

      const passwordHash = await hashPassword(data.password);
      const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      const newUser: UserProfile = {
        id: newUserId,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        mobileNumber: data.mobileNumber.trim(),
        passwordHash,
        preferredLanguage: data.preferredLanguage,
        state: data.state.trim(),
        district: data.district.trim(),
        designation: data.designation || 'Farm Owner & Manager',
        avatarUrl: data.avatarUrl,
        termsAccepted: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      await dbService.createUser(newUser);

      // Auto login new user session
      const sessionData = JSON.stringify({ userId: newUserId, rememberMe: true, loggedInAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, sessionData);

      setCurrentUser(newUser);
      setLanguage(data.preferredLanguage);

      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: err instanceof ApiError ? err.message : 'Registration failed. Please try again.' };
    }
  };

  // Local demo password reset
  const resetPasswordDemo = async (
    identifier: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!identifier.trim()) {
      return { success: false, error: 'Please enter your registered email or mobile number.' };
    }

    const pwdValidation = validatePasswordRequirements(newPassword);
    if (!pwdValidation.isValid) {
      return {
        success: false,
        error: 'New password must have at least 8 characters, 1 uppercase letter, and 1 number.',
      };
    }

    try {
      const user = await dbService.getUserByEmailOrMobile(identifier.trim());
      if (!user) {
        return { success: false, error: 'No account registered with this email or mobile number.' };
      }

      const newHash = await hashPassword(newPassword);
      await dbService.updateUserPassword(user.id, newHash);

      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, error: 'Failed to reset password. Please try again.' };
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setAuthScreen('login');
    void apiClient.logout().catch(() => undefined);
  }, []);

  // Profile update handler
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) return;
    try {
      await dbService.updateUser(currentUser.id, updates);
      const updated = await dbService.getUserById(currentUser.id);
      if (updated) {
        setCurrentUser(updated);
        if (updated.preferredLanguage) {
          setLanguage(updated.preferredLanguage);
        }
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  // Change password inside profile
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Not authenticated.' };
    }

    const isMatch = await verifyPassword(currentPassword, currentUser.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    const pwdValidation = validatePasswordRequirements(newPassword);
    if (!pwdValidation.isValid) {
      return {
        success: false,
        error: 'New password must have at least 8 characters, 1 uppercase letter, and 1 number.',
      };
    }

    try {
      const newHash = await hashPassword(newPassword);
      await dbService.updateUserPassword(currentUser.id, newHash);
      setCurrentUser({ ...currentUser, passwordHash: newHash });
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update password.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        authScreen,
        setAuthScreen,
        login,
        signup,
        resetPasswordDemo,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

