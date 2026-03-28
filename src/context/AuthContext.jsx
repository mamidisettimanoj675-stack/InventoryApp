import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    // Initialize demo users if they don't exist
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.length === 0) {
      const demoUsers = [
        {
          id: 'user-manager',
          email: 'manager@example.com',
          name: 'Manager User',
          role: 'manager',
          password: 'password123',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-staff',
          email: 'staff@example.com',
          name: 'Staff User',
          role: 'staff',
          password: 'password123',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-regular',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          password: 'password123',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.name,
        role: userData.role || 'staff', // Default role
        createdAt: new Date().toISOString(),
      };

      // Validate email format
      if (!userData.email.includes('@')) {
        throw new Error('Invalid email format');
      }

      // Validate password
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Check if user already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.some((u) => u.email === userData.email)) {
        throw new Error('User already exists with this email');
      }

      // Save user to localStorage users list
      existingUsers.push({
        ...newUser,
        password: userData.password, // In production, this should be hashed
      });
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Log user in
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));

      return newUser;
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u) => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      const loggedInUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
      };

      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      return loggedInUser;
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    setError(null);
  }, []);

  const updateUserRole = useCallback(async (userId, newRole) => {
    setError(null);
    try {
      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      users[userIndex].role = newRole;
      localStorage.setItem('users', JSON.stringify(users));

      // Update current user if it's the logged-in user
      if (user && user.id === userId) {
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return users[userIndex];
    } catch (err) {
      const message = err.message || 'Failed to update user role';
      setError(message);
      throw new Error(message);
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
