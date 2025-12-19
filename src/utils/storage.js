import { supabase } from '../lib/supabase';

// ===== USER MANAGEMENT =====

export const getUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

export const getUserByUsername = async (username) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

export const saveUser = async (user) => {
    try {
        // Check if user exists
        const existing = await getUserByUsername(user.username);

        if (existing && existing.id !== user.id) {
            // Update existing user
            const updateData = {
                password: user.password,
                full_name: user.fullName,
                role: user.role,
                currency: user.currency
            };

            // Include subscription fields if provided
            if (user.subscriptionStartDate !== undefined) {
                updateData.subscription_start_date = user.subscriptionStartDate;
            }
            if (user.subscriptionDurationMonths !== undefined) {
                updateData.subscription_duration_months = user.subscriptionDurationMonths;
            }

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert new user
            const insertData = {
                username: user.username,
                password: user.password,
                full_name: user.fullName,
                role: user.role,
                currency: user.currency || '$',
                subscription_start_date: user.subscriptionStartDate || new Date().toISOString(),
                subscription_duration_months: user.subscriptionDurationMonths || 1
            };
            // subscription_end_date will be auto-calculated by the database trigger

            const { data, error } = await supabase
                .from('users')
                .insert(insertData)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
};

// ===== RENTAL MANAGEMENT =====

let rentalIdCounter = null;

const getRentalIdCounter = async () => {
    if (rentalIdCounter === null) {
        try {
            const { data, error } = await supabase
                .from('rentals')
                .select('rental_id')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const lastId = data[0].rental_id;
                const match = lastId.match(/R-(\d+)/);
                rentalIdCounter = match ? parseInt(match[1]) : 0;
            } else {
                rentalIdCounter = 0;
            }
        } catch (error) {
            console.error('Error getting rental ID counter:', error);
            rentalIdCounter = 0;
        }
    }
    return rentalIdCounter;
};

export const generateRentalId = async () => {
    const counter = await getRentalIdCounter();
    rentalIdCounter = counter + 1;
    return `R-${String(rentalIdCounter).padStart(4, '0')}`;
};

export const getRentals = async (userId = null) => {
    try {
        let query = supabase
            .from('rentals')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Convert snake_case to camelCase for compatibility
        return (data || []).map(rental => ({
            id: rental.id,
            rentalId: rental.rental_id,
            userId: rental.user_id,
            platform: rental.platform,
            customerName: rental.customer_name,
            phoneNumber: rental.phone_number,
            accountType: rental.account_type,
            profileName: rental.profile_name,
            accountEmail: rental.account_email,
            accountPassword: rental.account_password,
            price: parseFloat(rental.price),
            duration: rental.duration,
            startDate: rental.start_date,
            expirationDate: rental.expiration_date,
            notes: rental.notes,
            // Combo fields
            isCombo: rental.is_combo || false,
            pricingType: rental.pricing_type || 'total',
            comboPrice: rental.combo_price ? parseFloat(rental.combo_price) : null,
            accounts: rental.accounts || [],
            replacements: [] // We'll load these separately if needed
        }));
    } catch (error) {
        console.error('Error fetching rentals:', error);
        return [];
    }
};

export const saveRental = async (rental) => {
    try {
        const rentalData = {
            user_id: rental.userId,
            platform: rental.platform,
            customer_name: rental.customerName,
            phone_number: rental.phoneNumber || null,
            account_type: rental.accountType || 'full',
            profile_name: rental.profileName || null,
            account_email: rental.accountEmail,
            account_password: rental.accountPassword,
            price: rental.price,
            duration: rental.duration,
            start_date: rental.startDate,
            expiration_date: rental.expirationDate,
            notes: rental.notes || null,
            // Combo fields
            is_combo: rental.isCombo || false,
            pricing_type: rental.pricingType || 'total',
            combo_price: rental.comboPrice || null,
            accounts: rental.accounts || []
        };

        if (rental.id) {
            // Update existing rental
            const { data, error } = await supabase
                .from('rentals')
                .update(rentalData)
                .eq('id', rental.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert new rental
            rentalData.rental_id = rental.rentalId || await generateRentalId();

            const { data, error } = await supabase
                .from('rentals')
                .insert(rentalData)
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    } catch (error) {
        console.error('Error saving rental:', error);
        throw error;
    }
};

export const deleteRental = async (rentalId) => {
    try {
        const { error } = await supabase
            .from('rentals')
            .delete()
            .eq('id', rentalId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting rental:', error);
        return false;
    }
};

// ===== REPLACEMENT MANAGEMENT =====

export const getReplacements = async (rentalId) => {
    try {
        const { data, error } = await supabase
            .from('replacements')
            .select('*')
            .eq('rental_id', rentalId)
            .order('replaced_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(r => ({
            id: r.id,
            rentalId: r.rental_id,
            oldEmail: r.old_email,
            oldPassword: r.old_password,
            newEmail: r.new_email,
            newPassword: r.new_password,
            reason: r.reason,
            replacedAt: r.replaced_at
        }));
    } catch (error) {
        console.error('Error fetching replacements:', error);
        return [];
    }
};

export const saveReplacement = async (replacement) => {
    try {
        const { data, error } = await supabase
            .from('replacements')
            .insert({
                rental_id: replacement.rentalId,
                old_email: replacement.oldEmail,
                old_password: replacement.oldPassword,
                new_email: replacement.newEmail,
                new_password: replacement.newPassword,
                reason: replacement.reason || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving replacement:', error);
        throw error;
    }
};

// ===== CUSTOM PLATFORMS =====

export const getCustomPlatforms = async () => {
    try {
        const { data, error } = await supabase
            .from('custom_platforms')
            .select('name')
            .order('name', { ascending: true });

        if (error) throw error;
        return (data || []).map(p => p.name);
    } catch (error) {
        console.error('Error fetching custom platforms:', error);
        return [];
    }
};

export const addCustomPlatform = async (platformName) => {
    try {
        const trimmed = platformName.trim();

        // Check if already exists
        const { data: existing } = await supabase
            .from('custom_platforms')
            .select('name')
            .eq('name', trimmed)
            .single();

        if (existing) {
            return false; // Already exists
        }

        const { error } = await supabase
            .from('custom_platforms')
            .insert({ name: trimmed });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding custom platform:', error);
        return false;
    }
};

// ===== INITIALIZATION =====

export const initializeDatabase = async () => {
    try {
        // Check if admin user exists
        const admin = await getUserByUsername('Jomoponse1');

        if (!admin) {
            // Import hashPassword for security
            const { hashPassword } = await import('./auth.js');

            // Create default admin user with custom credentials
            await saveUser({
                username: 'Jomoponse1',
                password: hashPassword('Jomoponse'),
                fullName: 'Administrador Principal',
                role: 'admin',
                currency: 'MXN$'
            });
            console.log('✅ Default admin user created: Jomoponse1');
        }

        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
};

// Initialize on module load
initializeDatabase();
