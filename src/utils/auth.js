/**
 * Authentication utilities with secure password hashing
 * Uses bcryptjs for secure password hashing
 */
import bcrypt from 'bcryptjs';

// Salt rounds for bcrypt (higher = more secure but slower)
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

/**
 * Validate password - supports both bcrypt hashed and legacy plain text
 * @param {string} inputPassword - Plain text password from user input
 * @param {string} storedPassword - Password from database (may be hashed or plain)
 * @returns {Promise<boolean>} - True if passwords match
 */
export const validatePassword = async (inputPassword, storedPassword) => {
    try {
        // Check if stored password is bcrypt hashed
        if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
            // Bcrypt comparison
            return await bcrypt.compare(inputPassword, storedPassword);
        }

        // Check if stored password was base64 encoded (legacy)
        try {
            const decoded = atob(storedPassword);
            if (decoded === inputPassword) {
                return true;
            }
        } catch {
            // Not base64, continue
        }

        // Plain text comparison (legacy - for backwards compatibility)
        return inputPassword === storedPassword;
    } catch (error) {
        console.error('Error validating password:', error);
        return false;
    }
};

/**
 * Check if a password is already hashed with bcrypt
 * @param {string} password - Password to check
 * @returns {boolean} - True if already hashed
 */
export const isPasswordHashed = (password) => {
    return password && (password.startsWith('$2a$') || password.startsWith('$2b$'));
};

/**
 * Generate unique user ID
 * @returns {string} - UUID
 */
export const generateUserId = () => {
    return crypto.randomUUID();
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid
 */
export const validateUsername = (username) => {
    // Username must be 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if strong enough
 */
export const validatePasswordStrength = (password) => {
    // Password must be at least 6 characters
    return password.length >= 6;
};
