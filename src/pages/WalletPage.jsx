import { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import {
    Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Lock, Filter,
    Download, Search, Coins, TrendingUp, TrendingDown, ChevronDown,
    Calendar, ArrowRight
} from 'lucide-react';

const TX_TYPE_FILTERS = [
    { value: 'all', label: 'Todas' },
    { value: 'credit', label: 'Entradas' },
    { value: 'debit', label: 'Salidas' },
];

const TX_STATUS_FILTERS = [
    { value: 'all', label: 'Todos' },
    { value: 'completed', label: 'Completados' },
    { value: 'escrow', label: 'En Escrow' },
];

function TransactionRow({ tx, CREDIT_VALUE_USD }) {
    const isCredit = tx.type === 'credit';
    const statusConfig = {
        completed: { class: 'badge-success', label: 'Completado', icon: '✓' },
        escrow: { class: 'badge-warning', label: 'En Escrow', icon: '🔒' },
        pending: { class: 'badge-info', label: 'Pendiente', icon: '⏳' },
    };
    const status = statusConfig[tx.status];
    const categoryLabels = {
        milestone: 'Hito',
        service_purchase: 'Compra',
        service_completed: 'Servicio',
    };

    return (
        <div className="group flex items-center gap-3 sm:gap-4 p-4 rounded-xl hover:bg-surface-800/40 transition-all duration-200 border border-transparent hover:border-surface-700/50">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-brand-500/10 text-brand-400' : tx.status === 'escrow' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                }`}>
                {tx.status === 'escrow' ? <Lock className="w-5 h-5" /> : isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-surface-500">{tx.counterparty}</span>
                    <span className="text-surface-700">·</span>
                    <span className="text-xs text-surface-600">
                        {tx.date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-surface-700 hidden sm:inline">·</span>
                    <span className="text-xs text-surface-600 hidden sm:inline">
                        {categoryLabels[tx.category] || tx.category}
                    </span>
                </div>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${isCredit ? 'credit-positive' : tx.status === 'escrow' ? 'credit-pending' : 'credit-negative'
                    }`}>
                    {isCredit ? '+' : '-'}{tx.amount} cr.
                </p>
                <p className="text-xs text-surface-600">${tx.amount * CREDIT_VALUE_USD} USD</p>
            </div>

            {/* Status */}
            <span className={`${status.class} text-[10px] shrink-0 hidden md:inline-flex`}>
                {status.label}
            </span>
        </div>
    );
}

export default function WalletPage() {
    const { transactions, balances, CREDIT_VALUE_USD, MIN_CREDIT_LINE } = useWallet();
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTx = useMemo(() => {
        return [...transactions]
            .sort((a, b) => b.date - a.date)
            .filter(tx => {
                if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
                if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return tx.description.toLowerCase().includes(q) ||
                        tx.counterparty.toLowerCase().includes(q);
                }
                return true;
            });
    }, [transactions, typeFilter, statusFilter, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <WalletIcon className="w-6 h-6 text-brand-400" />
                    Wallet — Libro Contable
                </h1>
                <p className="text-surface-500 mt-1">Historial completo de créditos: entradas, salidas y retenciones</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-brand-400" />
                        <span className="text-xs text-surface-500 uppercase tracking-wider">Disponible</span>
                    </div>
                    <p className={`text-xl font-bold ${balances.available >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                        {balances.available} <span className="text-sm font-normal text-surface-500">cr.</span>
                    </p>
                    <p className="text-xs text-surface-600 mt-0.5">~${balances.availableUSD} USD</p>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-surface-500 uppercase tracking-wider">En Escrow</span>
                    </div>
                    <p className="text-xl font-bold text-amber-400">
                        {balances.inEscrow} <span className="text-sm font-normal text-surface-500">cr.</span>
                    </p>
                    <p className="text-xs text-surface-600 mt-0.5">~${balances.inEscrow * CREDIT_VALUE_USD} USD</p>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-surface-500 uppercase tracking-wider">Ganado</span>
                    </div>
                    <p className="text-xl font-bold text-blue-400">
                        +{balances.totalEarned} <span className="text-sm font-normal text-surface-500">cr.</span>
                    </p>
                    <p className="text-xs text-surface-600 mt-0.5">~${balances.totalEarned * CREDIT_VALUE_USD} USD</p>
                </div>

                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-surface-500 uppercase tracking-wider">Gastado</span>
                    </div>
                    <p className="text-xl font-bold text-red-400">
                        -{balances.totalSpent} <span className="text-sm font-normal text-surface-500">cr.</span>
                    </p>
                    <p className="text-xs text-surface-600 mt-0.5">~${balances.totalSpent * CREDIT_VALUE_USD} USD</p>
                </div>
            </div>

            {/* Credit Line Indicator */}
            <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-surface-400">Línea de Crédito Disponible</span>
                    <span className="text-sm text-surface-500">
                        Puedes gastar: <span className="text-white font-semibold">{balances.available - MIN_CREDIT_LINE} cr.</span> ({`~$${(balances.available - MIN_CREDIT_LINE) * CREDIT_VALUE_USD} USD`})
                    </span>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${balances.available >= 0
                                ? 'bg-gradient-to-r from-brand-600 to-brand-400'
                                : 'bg-gradient-to-r from-red-600 to-amber-500'
                            }`}
                        style={{
                            width: `${Math.min(100, Math.max(5, ((balances.available - MIN_CREDIT_LINE) / (balances.totalEarned - MIN_CREDIT_LINE)) * 100))}%`
                        }}
                    />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-surface-600">
                    <span>{MIN_CREDIT_LINE} cr. (límite)</span>
                    <span>{balances.available} cr. (actual)</span>
                    <span>{balances.totalEarned} cr. (máximo)</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                        type="text"
                        placeholder="Buscar transacción o contraparte..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex rounded-xl overflow-hidden border border-surface-700">
                        {TX_TYPE_FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setTypeFilter(f.value)}
                                className={`px-3 py-2.5 text-xs font-medium transition-all ${typeFilter === f.value
                                        ? 'bg-brand-500/20 text-brand-400'
                                        : 'bg-surface-800/50 text-surface-400 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex rounded-xl overflow-hidden border border-surface-700">
                        {TX_STATUS_FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={`px-3 py-2.5 text-xs font-medium transition-all ${statusFilter === f.value
                                        ? 'bg-brand-500/20 text-brand-400'
                                        : 'bg-surface-800/50 text-surface-400 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-surface-800/50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                            Movimientos ({filteredTx.length})
                        </h3>
                        <span className="text-xs text-surface-500">1 crédito = ${CREDIT_VALUE_USD} USD</span>
                    </div>
                </div>

                <div className="divide-y divide-surface-800/30">
                    {filteredTx.length > 0 ? (
                        filteredTx.map(tx => (
                            <TransactionRow key={tx.id} tx={tx} CREDIT_VALUE_USD={CREDIT_VALUE_USD} />
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <WalletIcon className="w-12 h-12 text-surface-700 mx-auto mb-3" />
                            <p className="text-surface-500">No se encontraron transacciones</p>
                            <p className="text-xs text-surface-600 mt-1">Intenta ajustar los filtros</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
