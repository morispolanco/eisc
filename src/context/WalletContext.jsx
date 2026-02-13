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
    identity: { completed: true, credits: 2, label: 'Hito de Verificación — Videollamada o recomendación' },
};

const NEW_USER_MILESTONES = {
    registration: { completed: false, credits: 1, label: 'Registro completado' },
    portfolio: { completed: false, credits: 2, label: 'Hito de Talento — Portafolio o redes profesionales' },
    identity: { completed: false, credits: 2, label: 'Hito de Verificación — Videollamada o recomendación' },
};

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

    // ── Load data from Supabase or fallback to demo ──
    useEffect(() => {
        if (!user || initializedRef.current === user.uid) return;
        initializedRef.current = user.uid;

        if (isSupabaseConfigured()) {
            loadFromSupabase(user.uid);
        } else {
            // Demo mode
            if (user.uid === 'demo-user-001') {
                setTransactions(DEMO_TRANSACTIONS);
                setMilestones(DEMO_MILESTONES);
            } else {
                const regTx = {
                    id: `tx-reg-${user.uid}`,
                    type: 'credit', amount: 1,
                    description: 'Bono de registro', category: 'milestone',
                    status: 'completed', date: new Date(), counterparty: 'Sistema EISC',
                };
                setTransactions([regTx]);
                setMilestones({
                    registration: { completed: true, credits: 1, label: 'Registro completado' },
                    portfolio: { completed: false, credits: 2, label: 'Hito de Talento — Portafolio o redes profesionales' },
                    identity: { completed: false, credits: 2, label: 'Hito de Verificación — Videollamada o recomendación' },
                });
            }
            setDbLoading(false);
        }
    }, [user]);

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
                setMilestones(mapDbMilestones(milestoneRows));
            }
        } catch (err) {
            console.error('Error loading wallet data:', err);
        }
        setDbLoading(false);
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
            // Insert transaction
            await supabase.from('transactions').insert({
                id: newTx.id,
                user_id: user.uid,
                type: newTx.type,
                amount: newTx.amount,
                description: newTx.description,
                category: newTx.category,
                status: newTx.status,
                counterparty: newTx.counterparty,
            });

            // Update milestone
            await supabase
                .from('milestones')
                .update({ completed: true, completed_at: new Date().toISOString() })
                .eq('user_id', user.uid)
                .eq('milestone_key', milestoneKey);
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
