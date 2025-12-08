// Simple password hashing (NOT for production - use bcrypt or similar in production)
export const hashPassword = (password) => {
    // This is just a simple example - in production use proper hashing
    return btoa(password);
};

// Validate password
export const validatePassword = (input, hashed) => {
    return hashPassword(input) === hashed;
};

// Generate unique user ID
export const generateUserId = () => {
    return crypto.randomUUID();
};

// Validate username format
export const validateUsername = (username) => {
    // Username must be 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
    // Password must be at least 6 characters
    return password.length >= 6;
};
