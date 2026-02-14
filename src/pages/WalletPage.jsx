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
    const statusColors = {
        completed: 'text-surface-500',
        escrow: 'text-amber-500 font-medium',
        pending: 'text-blue-500',
    };
    const statusLabels = {
        completed: '',
        escrow: '· Escrow',
        pending: '· Pendiente',
    };

    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.03] transition-all duration-200 group border border-transparent hover:border-surface-800">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : tx.status === 'escrow' ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-800 text-surface-400'
                }`}>
                {tx.status === 'escrow' ? <Lock className="w-5 h-5" /> : isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white tracking-tight truncate">{tx.description}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[11px] text-surface-500 font-medium">{tx.counterparty}</p>
                    <span className="text-[11px] text-surface-700">•</span>
                    <p className="text-[11px] text-surface-600 italic">{tx.date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                    <span className={`text-[10px] uppercase tracking-tighter ${statusColors[tx.status]}`}>
                        {statusLabels[tx.status]}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
                    {isCredit ? '+' : '-'}{tx.amount} <span className="text-[10px] font-normal text-surface-500 uppercase">CE</span>
                </p>
                <p className="text-[11px] text-surface-600">${tx.amount * CREDIT_VALUE_USD} USD</p>
            </div>
        </div>
    );
}

export default function WalletPage() {
    const { transactions, balances, CREDIT_VALUE_USD, MIN_CREDIT_LINE, buyCredits } = useWallet();
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isBuying, setIsBuying] = useState(false);

    const handleBuyCredits = async (amount) => {
        setIsBuying(true);
        // Simulate API call/Stripe checkout
        await new Promise(r => setTimeout(r, 1500));
        await buyCredits(amount);
        setIsBuying(false);
    };

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
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                        <WalletIcon className="w-8 h-8 text-brand-400" />
                        Finanzas <span className="text-surface-600 font-normal">Libro de Cuenta</span>
                    </h1>
                    <p className="text-sm text-surface-500 mt-1">Control total de tu liquidez y obligaciones en el ecosistema.</p>
                </div>

                {/* El Acelerador — Redesigned */}
                <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
                    <div>
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                            <TrendingUp className="w-3.5 h-3.5" /> El Acelerador
                        </p>
                        <p className="text-[10px] text-surface-500 mt-1">Liquidez Inmediata (FIAT)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {[5, 10, 25].map(amount => (
                            <button
                                key={amount}
                                onClick={() => handleBuyCredits(amount)}
                                disabled={isBuying}
                                className="px-4 py-2 rounded-xl bg-surface-800 border border-surface-700 text-xs font-bold text-white hover:border-brand-500/50 transition-all disabled:opacity-50 shadow-sm"
                            >
                                +{amount} <span className="text-[10px] text-surface-600 font-normal">(${(amount * CREDIT_VALUE_USD)})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Disponible', val: balances.available, usd: balances.availableUSD, color: balances.available >= 0 ? 'text-emerald-400' : 'text-red-400', icon: Coins },
                    { label: 'En Escrow', val: balances.inEscrow, usd: balances.inEscrow * CREDIT_VALUE_USD, color: 'text-amber-400', icon: Lock },
                    { label: 'Total Ganado', val: balances.totalEarned, usd: balances.totalEarned * CREDIT_VALUE_USD, color: 'text-blue-400', icon: TrendingUp },
                    { label: 'Total Gastado', val: balances.totalSpent, usd: balances.totalSpent * CREDIT_VALUE_USD, color: 'text-surface-400', icon: TrendingDown },
                ].map((st, i) => (
                    <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <st.icon className={`w-3.5 h-3.5 ${st.color}`} />
                            <span className="text-[10px] text-surface-500 uppercase font-bold tracking-widest">{st.label}</span>
                        </div>
                        <p className={`text-2xl font-black tracking-tight ${st.color}`}>
                            {st.val} <span className="text-xs font-normal text-surface-600">CE</span>
                        </p>
                        <p className="text-[11px] text-surface-600 mt-1 font-medium">≈ ${st.usd.toLocaleString()} USD</p>
                    </div>
                ))}
            </div>

            {/* Trust Line Section */}
            <div className="relative group animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-3xl -z-10" />
                <div className="glass-card p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Préstamo de Confianza</h3>
                                <p className="text-xs text-surface-500 mt-0.5">La moneda es el trabajo. Tu garantía es tu talento.</p>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${balances.isUsingCreditLine ? 'bg-amber-500/10 text-amber-500' : 'bg-brand-500/10 text-brand-400'}`}>
                            {balances.isUsingCreditLine ? `Deuda: ${balances.debtAmount} CE` : 'Sin Deuda'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Technical View */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest mb-3">
                                    <span className="text-surface-500">Uso de Línea</span>
                                    <span className={balances.creditLineUtilization > 80 ? 'text-red-400' : 'text-amber-400'}>
                                        {Math.round(balances.creditLineUtilization)}% Utilizado
                                    </span>
                                </div>
                                <div className="h-2.5 bg-surface-800 rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full transition-all duration-1000 ${balances.creditLineUtilization > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
                                        style={{ width: `${balances.creditLineUtilization}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] text-surface-600 font-medium italic">
                                    <span>Límite Ecosistema: {MIN_CREDIT_LINE} CE</span>
                                    <span>Disponible: {balances.creditLineRemaining} CE</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-surface-800/20 p-3 rounded-2xl border border-white/[0.03]">
                                    <p className="text-[9px] text-surface-600 uppercase font-black">Línea Total</p>
                                    <p className="text-base font-bold text-white mt-1">{balances.maxCreditLine}</p>
                                </div>
                                <div className="bg-surface-800/20 p-3 rounded-2xl border border-white/[0.03]">
                                    <p className="text-[9px] text-surface-600 uppercase font-black">Gastado</p>
                                    <p className="text-base font-bold text-amber-500 mt-1">{balances.creditLineUsed}</p>
                                </div>
                                <div className="bg-surface-800/20 p-3 rounded-2xl border border-white/[0.03]">
                                    <p className="text-[9px] text-surface-600 uppercase font-black">Capacidad</p>
                                    <p className="text-base font-bold text-emerald-400 mt-1">{balances.canSpend}</p>
                                </div>
                            </div>
                        </div>

                        {/* Concept View */}
                        <div className={`p-5 rounded-2xl border ${balances.isUsingCreditLine ? 'bg-red-500/5 border-red-500/20' : 'bg-brand-500/5 border-brand-500/20'}`}>
                            <div className="flex items-start gap-3">
                                <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${balances.isUsingCreditLine ? 'text-red-400' : 'text-brand-400'}`} />
                                <div className="text-xs leading-relaxed">
                                    <p className={`font-bold uppercase tracking-tight mb-2 ${balances.isUsingCreditLine ? 'text-red-300' : 'text-brand-300'}`}>
                                        {balances.isUsingCreditLine ? 'Estado de Obligación Pro-Trabajo' : 'Sistema de Crédito Mutuo'}
                                    </p>
                                    <p className="text-surface-500">
                                        {balances.isUsingCreditLine
                                            ? `Has consumido ${balances.debtAmount} CE en red. Tu balance negativo es un compromiso de devolver valor a la comunidad mediante servicios. Al completar contratos, tu deuda se amortiza automáticamente.`
                                            : `Tu línea de crédito está intacta. Puedes contratar servicios de otros miembros incluso si no tienes saldo. El ecosistema confía en tu capacidad futura para generar valor.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-white">Historial de Actividad</h3>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-500" />
                            <input
                                type="text"
                                placeholder="Filtrar..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-surface-900 border border-surface-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:border-brand-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="flex bg-surface-900 border border-surface-800 rounded-xl p-1">
                            {TX_TYPE_FILTERS.map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setTypeFilter(f.value)}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${typeFilter === f.value ? 'bg-surface-800 text-white shadow-sm' : 'text-surface-500 hover:text-surface-300'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="divide-y divide-white/[0.04]">
                        {filteredTx.length > 0 ? (
                            filteredTx.map(tx => (
                                <TransactionRow key={tx.id} tx={tx} CREDIT_VALUE_USD={CREDIT_VALUE_USD} />
                            ))
                        ) : (
                            <div className="py-24 text-center opacity-40">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-surface-600" />
                                <p className="text-sm font-medium">Sin registros que coincidan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
