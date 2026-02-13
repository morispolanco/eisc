import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../supabase';

const WalletContext = createContext(null);

const CREDIT_VALUE_USD = 10;
const MIN_CREDIT_LINE = -10;

// ─── DEMO DATA (when Supabase is not configured) ─────────────────
const DEMO_TRANSACTIONS = [
    { id: 'tx-001', type: 'credit', amount: 1, description: 'Bono de registro', category: 'milestone', status: 'completed', date: new Date('2026-02-01T10:00:00'), counterparty: 'Sistema EISC' },
    { id: 'tx-002', type: 'credit', amount: 2, description: 'Portafolio verificado', category: 'milestone', status: 'completed', date: new Date('2026-02-03T14:30:00'), counterparty: 'Sistema EISC' },
    { id: 'tx-003', type: 'credit', amount: 2, description: 'Identidad verificada', category: 'milestone', status: 'completed', date: new Date('2026-02-05T09:15:00'), counterparty: 'Sistema EISC' },
    { id: 'tx-004', type: 'debit', amount: 8, description: 'Diseño de Logo Profesional', category: 'service_purchase', status: 'escrow', date: new Date('2026-02-10T16:00:00'), counterparty: 'Ana García', serviceId: 'svc-001' },
    { id: 'tx-005', type: 'credit', amount: 5, description: 'Consultoría Legal', category: 'service_completed', status: 'completed', date: new Date('2026-02-11T11:00:00'), counterparty: 'Roberto Silva', serviceId: 'svc-002' },
    { id: 'tx-006', type: 'debit', amount: 3, description: 'Revisión de Código React', category: 'service_purchase', status: 'completed', date: new Date('2026-02-12T08:00:00'), counterparty: 'María López', serviceId: 'svc-003' },
];

const DEMO_MILESTONES = {
    registration: { completed: true, credits: 1, label: 'Registro completado' },
    portfolio: { completed: true, credits: 2, label: 'Hito de Talento — Portafolio o redes profesionales' },
    identity: { completed: true, credits: 2, label: 'Hito de Verificación — Recomendación de miembro' },
    first_sale: { completed: true, credits: 3, label: 'Primera venta — Completaste tu primer servicio' },
};

const NEW_USER_MILESTONES = {
    registration: { completed: false, credits: 1, label: 'Registro completado' },
    portfolio: { completed: false, credits: 2, label: 'Hito de Talento — Portafolio o redes profesionales' },
    identity: { completed: false, credits: 2, label: 'Hito de Verificación — Recomendación de miembro' },
    first_sale: { completed: false, credits: 3, label: 'Primera venta — Completaste tu primer servicio' },
};

const MONTHLY_BONUS_AMOUNT = 1;
const MONTHLY_BONUS_DAYS = 30;

// ─── HELPERS ─────────────────────────────────────────────────────
function mapDbTransaction(row) {
    return {
        id: row.id,
        type: row.type,
        amount: Number(row.amount),
        description: row.description,
        category: row.category,
        status: row.status,
        date: new Date(row.created_at),
        counterparty: row.counterparty,
        serviceId: row.service_id || null,
    };
}

function mapDbMilestones(rows) {
    const result = {};
    rows.forEach(row => {
        result[row.milestone_key] = {
            completed: row.completed,
            credits: Number(row.credits),
            label: row.label,
        };
    });
    return result;
}

// ─── PROVIDER ────────────────────────────────────────────────────
export function WalletProvider({ children }) {
    const { user } = useAuth();
    const initializedRef = useRef(null);

    const [transactions, setTransactions] = useState([]);
    const [milestones, setMilestones] = useState({ ...NEW_USER_MILESTONES });
    const [dbLoading, setDbLoading] = useState(true);

    // ── Load data (Supabase + LocalStorage Cache) ──
    useEffect(() => {
        if (!user || initializedRef.current === user.uid) return;
        initializedRef.current = user.uid;

        // 1. Initial Load from LocalStorage (fast UI)
        const storageKey = `eisc_milestones_${user.uid}`;
        const txStorageKey = `eisc_transactions_${user.uid}`;
        const savedMilestones = localStorage.getItem(storageKey);
        const savedTransactions = localStorage.getItem(txStorageKey);

        if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

        // 2. Refresh from Supabase if configured
        if (isSupabaseConfigured() && !user.uid.startsWith('demo-user')) {
            loadFromSupabase(user.uid);
        } else if (user.uid === 'demo-user-001' && !savedMilestones) {
            // Default demo data only if nothing in storage
            setTransactions(DEMO_TRANSACTIONS);
            setMilestones(DEMO_MILESTONES);
            setDbLoading(false);
        } else {
            // New user defaults (ensure registration is true)
            if (!savedMilestones) {
                setMilestones(prev => ({ ...prev, registration: { ...prev.registration, completed: true } }));
            }
            setDbLoading(false);
        }
    }, [user]);

    // Secondary Effect: Ensure registration is ALWAYS true if user is logged in
    useEffect(() => {
        if (user && !milestones.registration?.completed) {
            setMilestones(prev => ({
                ...prev,
                registration: { ...prev.registration, completed: true }
            }));
        }
    }, [user, milestones.registration]);

    // Save to localStorage for ALL users (acts as a persistent cache)
    useEffect(() => {
        if (user) {
            localStorage.setItem(`eisc_milestones_${user.uid}`, JSON.stringify(milestones));
            localStorage.setItem(`eisc_transactions_${user.uid}`, JSON.stringify(transactions));
        }
    }, [milestones, transactions, user]);

    async function loadFromSupabase(userId) {
        setDbLoading(true);
        try {
            // Load transactions
            const { data: txRows } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (txRows) setTransactions(txRows.map(mapDbTransaction));

            // Load milestones
            const { data: milestoneRows } = await supabase
                .from('milestones')
                .select('*')
                .eq('user_id', userId);

            if (milestoneRows && milestoneRows.length > 0) {
                const mapped = mapDbMilestones(milestoneRows);
                // Merge DB milestones with the default ones so we don't lose keys
                setMilestones(prev => ({
                    ...prev,
                    ...mapped
                }));
            }

            // Check monthly activity bonus
            await checkMonthlyBonus(userId, txRows || []);
        } catch (err) {
            console.error('Error loading wallet data:', err);
        }
        setDbLoading(false);
    }

    // ── Monthly activity bonus ──
    async function checkMonthlyBonus(userId, existingTx) {
        const monthlyTxs = existingTx
            .filter(tx => tx.category === 'monthly_bonus')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const lastBonus = monthlyTxs.length > 0 ? new Date(monthlyTxs[0].created_at) : null;
        const now = new Date();

        // Check if user has been registered for at least 30 days
        // and hasn't received a bonus in the last 30 days
        const daysSinceLastBonus = lastBonus
            ? (now - lastBonus) / (1000 * 60 * 60 * 24)
            : MONTHLY_BONUS_DAYS; // first time = eligible

        if (daysSinceLastBonus >= MONTHLY_BONUS_DAYS) {
            const bonusTx = {
                id: `tx-monthly-${Date.now()}`,
                type: 'credit',
                amount: MONTHLY_BONUS_AMOUNT,
                description: 'Bono mensual de actividad',
                category: 'monthly_bonus',
                status: 'completed',
                date: now,
                counterparty: 'Sistema EISC',
            };

            setTransactions(prev => [bonusTx, ...prev]);

            if (isSupabaseConfigured()) {
                await supabase.from('transactions').insert({
                    id: bonusTx.id,
                    user_id: userId,
                    type: bonusTx.type,
                    amount: bonusTx.amount,
                    description: bonusTx.description,
                    category: bonusTx.category,
                    status: bonusTx.status,
                    counterparty: bonusTx.counterparty,
                });
            }
        }
    }

    // ── Calculate balances ──
    const calculateBalances = useCallback(() => {
        let available = 0, inEscrow = 0, totalEarned = 0, totalSpent = 0;

        transactions.forEach(tx => {
            if (tx.type === 'credit' && tx.status === 'completed') {
                available += tx.amount;
                totalEarned += tx.amount;
            } else if (tx.type === 'debit' && tx.status === 'completed') {
                available -= tx.amount;
                totalSpent += tx.amount;
            } else if (tx.type === 'debit' && tx.status === 'escrow') {
                available -= tx.amount;
                inEscrow += tx.amount;
            }
        });

        return {
            available, inEscrow, totalEarned, totalSpent,
            availableUSD: available * CREDIT_VALUE_USD,
            inEscrowUSD: inEscrow * CREDIT_VALUE_USD,
            creditLine: MIN_CREDIT_LINE,
            canSpend: available - MIN_CREDIT_LINE,
            isUsingCreditLine: available < 0,
            debtAmount: available < 0 ? Math.abs(available) : 0,
            debtAmountUSD: available < 0 ? Math.abs(available) * CREDIT_VALUE_USD : 0,
            creditLineUsed: available < 0 ? Math.abs(available) : 0,
            creditLineRemaining: available < 0 ? Math.abs(MIN_CREDIT_LINE) - Math.abs(available) : Math.abs(MIN_CREDIT_LINE),
            creditLineUtilization: available < 0 ? (Math.abs(available) / Math.abs(MIN_CREDIT_LINE)) * 100 : 0,
            maxCreditLine: Math.abs(MIN_CREDIT_LINE),
            maxCreditLineUSD: Math.abs(MIN_CREDIT_LINE) * CREDIT_VALUE_USD,
        };
    }, [transactions]);

    const balances = calculateBalances();

    const canAfford = (amount) => (balances.available - amount) >= MIN_CREDIT_LINE;

    // ── Purchase service ──
    const purchaseService = async (serviceId, amount, description, provider) => {
        if (!canAfford(amount)) {
            return { success: false, error: 'Fondos insuficientes. Límite de crédito alcanzado.' };
        }

        const newTx = {
            id: `tx-${Date.now()}`,
            type: 'debit',
            amount,
            description,
            category: 'service_purchase',
            status: 'escrow',
            date: new Date(),
            counterparty: provider,
            serviceId,
        };

        setTransactions(prev => [newTx, ...prev]);

        // Persist to Supabase
        if (isSupabaseConfigured() && user) {
            await supabase.from('transactions').insert({
                id: newTx.id,
                user_id: user.uid,
                type: newTx.type,
                amount: newTx.amount,
                description: newTx.description,
                category: newTx.category,
                status: newTx.status,
                counterparty: newTx.counterparty,
                service_id: newTx.serviceId,
            });
        }

        return { success: true, transactionId: newTx.id };
    };

    // ── Release escrow ──
    const releaseEscrow = async (transactionId) => {
        setTransactions(prev =>
            prev.map(tx => tx.id === transactionId ? { ...tx, status: 'completed' } : tx)
        );

        if (isSupabaseConfigured()) {
            await supabase
                .from('transactions')
                .update({ status: 'completed' })
                .eq('id', transactionId);
        }
    };

    // ── Receive payment ──
    const receivePayment = async (amount, description, buyer, serviceId) => {
        const newTx = {
            id: `tx-${Date.now()}`,
            type: 'credit',
            amount,
            description,
            category: 'service_completed',
            status: 'completed',
            date: new Date(),
            counterparty: buyer,
            serviceId,
        };

        setTransactions(prev => [newTx, ...prev]);

        if (isSupabaseConfigured() && user) {
            await supabase.from('transactions').insert({
                id: newTx.id,
                user_id: user.uid,
                type: newTx.type,
                amount: newTx.amount,
                description: newTx.description,
                category: newTx.category,
                status: newTx.status,
                counterparty: newTx.counterparty,
                service_id: newTx.serviceId,
            });
        }

        // Check if this is the first sale → award first_sale milestone
        if (!milestones.first_sale?.completed) {
            const hasCompletedServices = transactions.some(tx => tx.category === 'service_completed');
            if (!hasCompletedServices) {
                await completeMilestone('first_sale');
            }
        }
    };

    // ── Complete milestone ──
    const completeMilestone = async (milestoneKey) => {
        if (milestones[milestoneKey]?.completed) return;

        const milestone = milestones[milestoneKey];
        const newTx = {
            id: `tx-${Date.now()}`,
            type: 'credit',
            amount: milestone.credits,
            description: milestone.label,
            category: 'milestone',
            status: 'completed',
            date: new Date(),
            counterparty: 'Sistema EISC',
        };

        setTransactions(prev => [newTx, ...prev]);
        setMilestones(prev => ({
            ...prev,
            [milestoneKey]: { ...prev[milestoneKey], completed: true },
        }));

        if (isSupabaseConfigured() && user) {
            try {
                // Insert transaction
                const { error: txErr } = await supabase.from('transactions').insert({
                    id: newTx.id,
                    user_id: user.uid,
                    type: newTx.type,
                    amount: newTx.amount,
                    description: newTx.description,
                    category: newTx.category,
                    status: newTx.status,
                    counterparty: newTx.counterparty,
                });
                if (txErr) throw txErr;

                // Upsert milestone (ensures it creates if not exists)
                const { error: msErr } = await supabase
                    .from('milestones')
                    .upsert({
                        user_id: user.uid,
                        milestone_key: milestoneKey,
                        completed: true,
                        completed_at: new Date().toISOString(),
                        credits: milestone.credits,
                        label: milestone.label
                    }, { onConflict: 'user_id,milestone_key' });

                if (msErr) {
                    console.error('Supabase msErr:', msErr);
                    // If upsert fails, try update as fallback
                    await supabase
                        .from('milestones')
                        .update({ completed: true, completed_at: new Date().toISOString() })
                        .match({ user_id: user.uid, milestone_key: milestoneKey });
                }
                console.log(`Milestone ${milestoneKey} persistence attempted`);
            } catch (err) {
                console.error('Error persisting milestone:', err);
            }
        }
    };

    return (
        <WalletContext.Provider value={{
            transactions,
            balances,
            milestones,
            canAfford,
            purchaseService,
            releaseEscrow,
            receivePayment,
            completeMilestone,
            CREDIT_VALUE_USD,
            MIN_CREDIT_LINE,
            MONTHLY_BONUS_AMOUNT,
            MONTHLY_BONUS_DAYS,
            dbLoading,
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWallet must be used within WalletProvider');
    return context;
}
