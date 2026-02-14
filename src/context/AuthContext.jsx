import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';

const AuthContext = createContext(null);

// ─── DEMO FALLBACK (when Supabase is not configured) ─────────────
const STORED_USERS = new Map();
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

// ─── PROVIDER ────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Supabase mode ──
    useEffect(() => {
        if (!isSupabaseConfigured()) {
            // Demo mode — check sessionStorage
            const saved = sessionStorage.getItem('eisc_user');
            if (saved) {
                try { setUser(JSON.parse(saved)); } catch { }
            }
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await loadProfile(session.user);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Load profile from Supabase
    async function loadProfile(authUser) {
        try {
            console.log('[EISC Auth] Cargando perfil para:', authUser.id);
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('[EISC Auth] Error al cargar perfil:', error.message);
            }

            const userData = {
                uid: authUser.id,
                email: authUser.email,
                displayName: profile?.display_name || authUser.user_metadata?.display_name || authUser.email.split('@')[0],
                specialty: profile?.specialty || 'software',
                photoURL: profile?.photo_url || null,
                emailVerified: authUser.email_confirmed_at != null,
                isNewUser: false,
                createdAt: new Date(authUser.created_at),
            };

            setUser(userData);
        } catch (err) {
            console.error('[EISC Auth] Error crítico en loadProfile:', err);
        } finally {
            setLoading(false);
        }
    }

    // ── LOGIN ──
    const login = async (email, password) => {
        const supabaseActive = isSupabaseConfigured();
        console.log(`[EISC Auth] Intentando login. Supabase activo: ${supabaseActive}`);

        // Only use demo fallback if Supabase is NOT configured
        if (!supabaseActive) {
            console.log('[EISC Auth] Usando modo demo (Supabase no detectado)');
            const stored = STORED_USERS.get(email);
            if (stored && stored.password === password) {
                setLoading(true);
                await new Promise(r => setTimeout(r, 800));
                const { password: _, ...userData } = stored;
                setUser({ ...userData, isNewUser: false });
                sessionStorage.setItem('eisc_user', JSON.stringify({ ...userData, isNewUser: false }));
                setLoading(false);
                return;
            }
            throw new Error('Correo o contraseña incorrectos.');
        }

        // Supabase auth (Mandatory if configured)
        setLoading(true);
        console.log('[EISC Auth] Conectando con Supabase Auth...');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setLoading(false);
            let errorMessage = error.message;
            if (error.message === 'Invalid login credentials') {
                errorMessage = 'Correo o contraseña incorrectos.';
            } else if (error.message === 'Email not confirmed') {
                errorMessage = 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
            }
            throw new Error(errorMessage);
        }
    };

    // ── REGISTER ──
    const register = async (email, password, displayName, specialty) => {
        if (!isSupabaseConfigured()) {
            // Demo fallback
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
            setUser(userData);
            sessionStorage.setItem('eisc_user', JSON.stringify(userData));
            setLoading(false);
            return;
        }

        setLoading(true);
        console.log(`[EISC Auth] Intentando registro para: ${email}`);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                    specialty: specialty || 'software',
                },
            },
        });

        if (error) {
            console.error('[EISC Auth] Error en signUp:', error.message);
            setLoading(false);
            throw new Error(
                error.message.includes('already registered')
                    ? 'Este correo ya está registrado. Intenta iniciar sesión.'
                    : error.message
            );
        }

        console.log('[EISC Auth] Registro exitoso en Supabase Auth:', data.user?.id);

        // Update profile with specialty (even though trigger does it, this ensures data is correct)
        if (data.user) {
            try {
                console.log('[EISC Auth] Actualizando perfil adicional...');
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ specialty: specialty || 'software', display_name: displayName })
                    .eq('id', data.user.id);

                if (profileError) {
                    console.warn('[EISC Auth] Advertencia al actualizar perfil:', profileError.message);
                } else {
                    console.log('[EISC Auth] Perfil actualizado correctamente.');
                }
            } catch (pErr) {
                console.warn('[EISC Auth] Excepción al actualizar perfil:', pErr);
            }
        }

        // onAuthStateChange will handle setting the user
    };

    // ── LOGOUT ──
    const logout = async () => {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
        }
        setUser(null);
        sessionStorage.removeItem('eisc_user');
    };

    // ── UPDATE PROFILE ──
    const updateProfile = async (updates) => {
        if (!isSupabaseConfigured() || !user) return;

        await supabase
            .from('profiles')
            .update({
                display_name: updates.displayName || user.displayName,
                specialty: updates.specialty || user.specialty,
                photo_url: updates.photoURL || user.photoURL,
            })
            .eq('id', user.uid);

        setUser(prev => ({ ...prev, ...updates }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
