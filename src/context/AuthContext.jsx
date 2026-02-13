import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Stored users (simulates DB)
const STORED_USERS = new Map();

// Pre-seed a demo user
STORED_USERS.set('carlos@eisc.io', {
    uid: 'demo-user-001',
    email: 'carlos@eisc.io',
    password: 'demo1234',
    displayName: 'Carlos Méndez',
    specialty: 'software',
    photoURL: null,
    emailVerified: true,
    isNewUser: false,
    createdAt: new Date('2026-02-01'),
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for persisted session
        const savedUser = sessionStorage.getItem('eisc_user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
            } catch { }
        }
        setLoading(false);
    }, []);

    const persistUser = (userData) => {
        setUser(userData);
        sessionStorage.setItem('eisc_user', JSON.stringify(userData));
    };

    const login = async (email, password) => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));

        const stored = STORED_USERS.get(email);
        if (!stored || stored.password !== password) {
            setLoading(false);
            throw new Error('Correo o contraseña incorrectos.');
        }

        const { password: _, ...userData } = stored;
        persistUser({ ...userData, isNewUser: false });
        setLoading(false);
    };

    const register = async (email, password, displayName, specialty) => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1200));

        if (STORED_USERS.has(email)) {
            setLoading(false);
            throw new Error('Este correo ya está registrado. Intenta iniciar sesión.');
        }

        const newUser = {
            uid: `user-${Date.now()}`,
            email,
            password,
            displayName,
            specialty: specialty || 'software',
            photoURL: null,
            emailVerified: false,
            isNewUser: true,
            createdAt: new Date(),
        };

        STORED_USERS.set(email, newUser);

        const { password: _, ...userData } = newUser;
        persistUser(userData);
        setLoading(false);
    };

    const logout = async () => {
        setUser(null);
        sessionStorage.removeItem('eisc_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
