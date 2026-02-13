import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

const CREDIT_VALUE_USD = 10;
const MIN_CREDIT_LINE = -10;

// Demo user transactions (for the pre-seeded account)
const DEMO_TRANSACTIONS = [
    {
        id: 'tx-001',
        type: 'credit',
        amount: 1,
        description: 'Bono de registro',
        category: 'milestone',
        status: 'completed',
        date: new Date('2026-02-01T10:00:00'),
        counterparty: 'Sistema EISC',
    },
    {
        id: 'tx-002',
        type: 'credit',
        amount: 2,
        description: 'Portafolio verificado',
        category: 'milestone',
        status: 'completed',
        date: new Date('2026-02-03T14:30:00'),
        counterparty: 'Sistema EISC',
    },
    {
        id: 'tx-003',
        type: 'credit',
        amount: 2,
        description: 'Identidad verificada',
        category: 'milestone',
        status: 'completed',
        date: new Date('2026-02-05T09:15:00'),
        counterparty: 'Sistema EISC',
    },
    {
        id: 'tx-004',
        type: 'debit',
        amount: 8,
        description: 'Diseño de Logo Profesional',
        category: 'service_purchase',
        status: 'escrow',
        date: new Date('2026-02-10T16:00:00'),
        counterparty: 'Ana García',
        serviceId: 'svc-001',
    },
    {
        id: 'tx-005',
        type: 'credit',
        amount: 5,
        description: 'Consultoría Legal',
        category: 'service_completed',
        status: 'completed',
        date: new Date('2026-02-11T11:00:00'),
        counterparty: 'Roberto Silva',
        serviceId: 'svc-002',
    },
    {
        id: 'tx-006',
        type: 'debit',
        amount: 3,
        description: 'Revisión de Código React',
        category: 'service_purchase',
        status: 'completed',
        date: new Date('2026-02-12T08:00:00'),
        counterparty: 'María López',
        serviceId: 'svc-003',
    },
];

const DEMO_MILESTONES = {
    registration: { completed: true, credits: 1, label: 'Registro completado' },
    portfolio: { completed: true, credits: 2, label: 'Portafolio subido' },
    identity: { completed: true, credits: 2, label: 'Identidad verificada' },
};

const NEW_USER_MILESTONES = {
    registration: { completed: false, credits: 1, label: 'Registro completado' },
    portfolio: { completed: false, credits: 2, label: 'Portafolio subido' },
    identity: { completed: false, credits: 2, label: 'Identidad verificada' },
};

export function WalletProvider({ children }) {
    const { user } = useAuth();
    const initializedRef = useRef(null);

    const isDemo = user?.uid === 'demo-user-001';
    const isNew = user?.isNewUser;

    // Initialize based on user type
    const [transactions, setTransactions] = useState(isDemo ? DEMO_TRANSACTIONS : []);
    const [milestones, setMilestones] = useState(isDemo ? DEMO_MILESTONES : { ...NEW_USER_MILESTONES });

    // When user changes, reset state and award registration milestone for new users
    useEffect(() => {
        if (!user || initializedRef.current === user.uid) return;
        initializedRef.current = user.uid;

        if (user.uid === 'demo-user-001') {
            setTransactions(DEMO_TRANSACTIONS);
            setMilestones(DEMO_MILESTONES);
        } else {
            // Fresh user — start clean and award registration
            const regTx = {
                id: `tx-reg-${user.uid}`,
                type: 'credit',
                amount: 1,
                description: 'Bono de registro',
                category: 'milestone',
                status: 'completed',
                date: new Date(),
                counterparty: 'Sistema EISC',
            };
            setTransactions([regTx]);
            setMilestones({
                registration: { completed: true, credits: 1, label: 'Registro completado' },
                portfolio: { completed: false, credits: 2, label: 'Portafolio subido' },
                identity: { completed: false, credits: 2, label: 'Identidad verificada' },
            });
        }
    }, [user]);

    // Calculate balances from ledger
    const calculateBalances = useCallback(() => {
        let available = 0;
        let inEscrow = 0;
        let totalEarned = 0;
        let totalSpent = 0;

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
            available,
            inEscrow,
            totalEarned,
            totalSpent,
            availableUSD: available * CREDIT_VALUE_USD,
            inEscrowUSD: inEscrow * CREDIT_VALUE_USD,
            creditLine: MIN_CREDIT_LINE,
            canSpend: available - MIN_CREDIT_LINE, // How much they can actually spend
        };
    }, [transactions]);

    const balances = calculateBalances();

    // Check if user can afford a purchase (considering negative credit line)
    const canAfford = (amount) => {
        return (balances.available - amount) >= MIN_CREDIT_LINE;
    };

    // Purchase service - move credits to escrow
    const purchaseService = (serviceId, amount, description, provider) => {
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
        return { success: true, transactionId: newTx.id };
    };

    // Release escrow - confirm service completion
    const releaseEscrow = (transactionId) => {
        setTransactions(prev =>
            prev.map(tx =>
                tx.id === transactionId ? { ...tx, status: 'completed' } : tx
            )
        );
    };

    // Receive payment for service
    const receivePayment = (amount, description, buyer, serviceId) => {
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
    };

    // Add milestone credits
    const completeMilestone = (milestoneKey) => {
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
