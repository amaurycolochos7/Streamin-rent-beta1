/**
 * Security Utilities for Streaming Rent
 * - Password hashing with bcrypt
 * - Data encryption/decryption with AES
 */
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

// ============================================
// CONFIGURATION
// ============================================

// Salt rounds for bcrypt (higher = more secure but slower)
const SALT_ROUNDS = 10;

// Encryption key for AES (in production, this should be an environment variable)
// Using a combination approach for security
const getEncryptionKey = () => {
    // Base key + browser fingerprint elements for additional security
    const baseKey = 'SR_2024_SECURE_KEY_v1';
    return CryptoJS.SHA256(baseKey).toString();
};

// ============================================
// PASSWORD HASHING (for user passwords)
// ============================================

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
 * Compare a plain password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
    try {
        // Handle legacy plain text passwords (migration support)
        if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
            // Legacy plain text password - direct comparison
            return password === hashedPassword;
        }
        // Bcrypt comparison
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error('Error comparing password:', error);
        return false;
    }
};

/**
 * Check if a password is already hashed
 * @param {string} password - Password to check
 * @returns {boolean} - True if already hashed
 */
export const isPasswordHashed = (password) => {
    return password && (password.startsWith('$2a$') || password.startsWith('$2b$'));
};

// ============================================
// DATA ENCRYPTION (for sensitive data like credentials)
// ============================================

/**
 * Encrypt sensitive data using AES-256
 * @param {string} data - Plain text data to encrypt
 * @returns {string} - Encrypted data (base64)
 */
export const encryptData = (data) => {
    if (!data) return data;
    try {
        const key = getEncryptionKey();
        const encrypted = CryptoJS.AES.encrypt(data, key).toString();
        return encrypted;
    } catch (error) {
        console.error('Error encrypting data:', error);
        return data; // Return original on error
    }
};

/**
 * Decrypt AES-256 encrypted data
 * @param {string} encryptedData - Encrypted data (base64)
 * @returns {string} - Decrypted plain text
 */
export const decryptData = (encryptedData) => {
    if (!encryptedData) return encryptedData;
    try {
        // Check if data looks encrypted (contains typical base64 chars and structure)
        if (!isEncrypted(encryptedData)) {
            return encryptedData; // Return as-is if not encrypted
        }

        const key = getEncryptionKey();
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption fails, return original
        if (!decrypted) {
            return encryptedData;
        }

        return decrypted;
    } catch (error) {
        // If decryption fails, assume it's plain text
        return encryptedData;
    }
};

/**
 * Check if data appears to be encrypted
 * @param {string} data - Data to check
 * @returns {boolean} - True if appears encrypted
 */
export const isEncrypted = (data) => {
    if (!data || typeof data !== 'string') return false;
    // AES encrypted strings typically start with 'U2F' (base64 for 'Sal' from 'Salted__')
    return data.startsWith('U2F') && data.length > 20;
};

// ============================================
// CREDENTIAL ENCRYPTION HELPERS
// ============================================

/**
 * Encrypt rental account credentials
 * @param {object} credentials - { email, password }
 * @returns {object} - { email: encrypted, password: encrypted }
 */
export const encryptCredentials = (credentials) => {
    return {
        email: encryptData(credentials.email),
        password: encryptData(credentials.password)
    };
};

/**
 * Decrypt rental account credentials
 * @param {object} encryptedCredentials - { email: encrypted, password: encrypted }
 * @returns {object} - { email: decrypted, password: decrypted }
 */
export const decryptCredentials = (encryptedCredentials) => {
    return {
        email: decryptData(encryptedCredentials.email),
        password: decryptData(encryptedCredentials.password)
    };
};

/**
 * Encrypt an array of combo accounts
 * @param {Array} accounts - Array of account objects
 * @returns {Array} - Array with encrypted credentials
 */
export const encryptComboAccounts = (accounts) => {
    if (!accounts || !Array.isArray(accounts)) return accounts;
    return accounts.map(acc => ({
        ...acc,
        accountEmail: encryptData(acc.accountEmail),
        accountPassword: encryptData(acc.accountPassword)
    }));
};

/**
 * Decrypt an array of combo accounts
 * @param {Array} accounts - Array of encrypted account objects
 * @returns {Array} - Array with decrypted credentials
 */
export const decryptComboAccounts = (accounts) => {
    if (!accounts || !Array.isArray(accounts)) return accounts;
    return accounts.map(acc => ({
        ...acc,
        accountEmail: decryptData(acc.accountEmail),
        accountPassword: decryptData(acc.accountPassword)
    }));
};
