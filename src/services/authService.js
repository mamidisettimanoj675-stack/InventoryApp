// Authentication service functions

// User roles
export const ROLES = {
  MANAGER: 'manager',
  STAFF: 'staff',
  USER: 'user',
};

// Role permissions
export const ROLE_PERMISSIONS = {
  manager: ['view_inventory', 'add_inventory', 'edit_inventory', 'delete_inventory', 'view_metrics', 'purchase_inventory'],
  staff: ['view_inventory', 'add_inventory', 'edit_inventory', 'delete_inventory'],
  user: ['view_inventory', 'purchase_inventory'],
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

// Check if user has any of the required roles
export const hasRole = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    return userRole === requiredRoles;
  }
  return requiredRoles.includes(userRole);
};

// Get all users from localStorage
export const getAllUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }));
  } catch (err) {
    console.error('Failed to get users:', err);
    return [];
  }
};

// Get user by ID
export const getUserById = (userId) => {
  const users = getAllUsers();
  return users.find((user) => user.id === userId);
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isValidPassword = (password) => {
  return password.length >= 6;
};

// Validate user data on signup
export const validateSignupData = (data) => {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!data.role) {
    errors.role = 'Role is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate login data
export const validateLoginData = (email, password) => {
  const errors = {};

  if (!email || !isValidEmail(email)) {
    errors.email = 'Valid email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  hasRole,
  getAllUsers,
  getUserById,
  isValidEmail,
  isValidPassword,
  validateSignupData,
  validateLoginData,
};
