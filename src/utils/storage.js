// Storage keys
const USERS_KEY = 'streaming_rental_users';
const RENTALS_KEY = 'streaming_rental_rentals';
const SESSION_KEY = 'streaming_rental_session';
const RENTAL_COUNTER_KEY = 'streaming_rental_counter';

// User storage functions
export const getUsers = () => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

export const saveUsers = (users) => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
};

// Rental storage functions
export const getRentals = () => {
    try {
        const rentals = localStorage.getItem(RENTALS_KEY);
        return rentals ? JSON.parse(rentals) : [];
    } catch (error) {
        console.error('Error getting rentals:', error);
        return [];
    }
};

export const saveRentals = (rentals) => {
    try {
        localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals));
        return true;
    } catch (error) {
        console.error('Error saving rentals:', error);
        return false;
    }
};

// Session storage functions
export const getSession = () => {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
};

export const saveSession = (session) => {
    try {
        if (session) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
        return true;
    } catch (error) {
        console.error('Error saving session:', error);
        return false;
    }
};

// Rental ID counter functions
export const getRentalCounter = () => {
    try {
        const counter = localStorage.getItem(RENTAL_COUNTER_KEY);
        return counter ? parseInt(counter) : 0;
    } catch (error) {
        console.error('Error getting rental counter:', error);
        return 0;
    }
};

export const incrementRentalCounter = () => {
    try {
        const counter = getRentalCounter() + 1;
        localStorage.setItem(RENTAL_COUNTER_KEY, counter.toString());
        return counter;
    } catch (error) {
        console.error('Error incrementing rental counter:', error);
        return null;
    }
};

// Generate readable rental ID
export const generateRentalId = () => {
    const counter = incrementRentalCounter();
    if (counter === null) return null;

    // Format: R-0001, R-0002, etc.
    return `R-${counter.toString().padStart(4, '0')}`;
};

// Initialize default admin user
export const initializeDefaultAdmin = () => {
    const users = getUsers();

    // Check if any admin exists
    const adminExists = users.some(user => user.role === 'admin');

    if (!adminExists) {
        const defaultAdmin = {
            id: crypto.randomUUID(),
            username: 'admin',
            password: 'admin123', // In production, this should be hashed
            role: 'admin',
            currency: 'MXN$',
            createdAt: new Date().toISOString(),
            createdBy: 'system'
        };

        users.push(defaultAdmin);
        saveUsers(users);

        console.log('Default admin user created');
        return defaultAdmin;
    }

    return null;
};

// Custom platforms storage
const CUSTOM_PLATFORMS_KEY = 'streaming_rental_custom_platforms';

export const getCustomPlatforms = () => {
    try {
        const platforms = localStorage.getItem(CUSTOM_PLATFORMS_KEY);
        return platforms ? JSON.parse(platforms) : [];
    } catch (error) {
        console.error('Error getting custom platforms:', error);
        return [];
    }
};

export const saveCustomPlatforms = (platforms) => {
    try {
        localStorage.setItem(CUSTOM_PLATFORMS_KEY, JSON.stringify(platforms));
        return true;
    } catch (error) {
        console.error('Error saving custom platforms:', error);
        return false;
    }
};

export const addCustomPlatform = (platformName) => {
    try {
        const platforms = getCustomPlatforms();
        const trimmedName = platformName.trim();
        if (!platforms.includes(trimmedName) && trimmedName) {
            platforms.push(trimmedName);
            platforms.sort(); // Keep alphabetically sorted
            saveCustomPlatforms(platforms);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error adding custom platform:', error);
        return false;
    }
};

