import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import {
    Coins, TrendingUp, TrendingDown, Lock, ArrowUpRight, ArrowDownRight,
    CheckCircle2, Clock, Star, Briefcase, Award, ChevronRight, Zap,
    AlertCircle, ShieldCheck
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, subtext, color, delay }) {
    return (
        <div className="glass-card-hover p-5 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="stat-value">{value}</p>
            <p className="text-sm text-surface-500 mt-1">{label}</p>
            {subtext && <p className="text-xs text-surface-600 mt-0.5">{subtext}</p>}
        </div>
    );
}

function MilestoneItem({ label, credits, completed }) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${completed ? 'bg-brand-500/5' : 'bg-surface-800/30 hover:bg-surface-800/50'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-700 text-surface-500'
                }`}>
                {completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div className="flex-1">
                <p className={`text-sm font-medium ${completed ? 'text-white' : 'text-surface-400'}`}>{label}</p>
            </div>
            <span className={`text-sm font-semibold ${completed ? 'text-brand-400' : 'text-surface-500'}`}>
                +{credits} cr.
            </span>
        </div>
    );
}

function RecentTransaction({ tx, CREDIT_VALUE_USD }) {
    const isCredit = tx.type === 'credit';
    const statusColors = {
        completed: 'badge-success',
        escrow: 'badge-warning',
        pending: 'badge-info',
    };
    const statusLabels = {
        completed: 'Completado',
        escrow: 'En Escrow',
        pending: 'Pendiente',
    };

    return (
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-800/30 transition-all duration-200 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? 'bg-brand-500/10 text-brand-400' : 'bg-red-500/10 text-red-400'
                }`}>
                {isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                <p className="text-xs text-surface-500">{tx.counterparty} · {tx.date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="text-right">
                <p className={`text-sm font-semibold ${isCredit ? 'credit-positive' : 'credit-negative'}`}>
                    {isCredit ? '+' : '-'}{tx.amount} cr.
                </p>
                <p className="text-xs text-surface-600">${tx.amount * CREDIT_VALUE_USD} USD</p>
            </div>
            <span className={`${statusColors[tx.status]} text-[10px] hidden sm:inline-flex`}>
                {statusLabels[tx.status]}
            </span>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const { balances, transactions, milestones, CREDIT_VALUE_USD, MIN_CREDIT_LINE } = useWallet();
    const { activeContracts } = useMarketplace();

    const recentTx = [...transactions].sort((a, b) => b.date - a.date).slice(0, 5);
    const activeContractsCount = activeContracts.filter(c => c.status === 'in_progress').length;

    const creditUsagePercent = Math.min(
        100,
        Math.max(0, ((balances.available - MIN_CREDIT_LINE) / (balances.totalEarned - MIN_CREDIT_LINE)) * 100)
    );

    return (
        <div className="space-y-6">
            {/* Welcome section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Bienvenido, {user?.displayName?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-surface-500 mt-1">
                        Aquí tienes el resumen de tu cuenta EISC
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="badge-success">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                    </div>
                    <div className="badge-info">
                        <Star className="w-3 h-3 mr-1" /> 4.8 ★
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Coins}
                    label="Créditos Disponibles"
                    value={balances.available}
                    subtext={`~$${balances.availableUSD.toLocaleString()} USD`}
                    color={balances.available >= 0
                        ? 'bg-brand-500/10 text-brand-400'
                        : 'bg-red-500/10 text-red-400'
                    }
                    delay={0}
                />
                <StatCard
                    icon={Lock}
                    label="En Escrow"
                    value={balances.inEscrow}
                    subtext={`~$${(balances.inEscrow * CREDIT_VALUE_USD).toLocaleString()} USD retenidos`}
                    color="bg-amber-500/10 text-amber-400"
                    delay={100}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total Ganado"
                    value={balances.totalEarned}
                    subtext={`~$${(balances.totalEarned * CREDIT_VALUE_USD).toLocaleString()} USD`}
                    color="bg-blue-500/10 text-blue-400"
                    delay={200}
                />
                <StatCard
                    icon={Briefcase}
                    label="Contratos Activos"
                    value={activeContractsCount}
                    subtext="En progreso ahora"
                    color="bg-purple-500/10 text-purple-400"
                    delay={300}
                />
            </div>

            {/* Credit Line + Milestones Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Credit Line Card */}
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <Zap className="w-4 h-4 text-brand-400" />
                            Línea de Crédito
                        </h3>
                        <span className="text-xs text-surface-500">Límite: {MIN_CREDIT_LINE} créditos</span>
                    </div>

                    {/* Visual credit gauge */}
                    <div className="relative mb-4">
                        <div className="flex justify-between text-xs text-surface-600 mb-2">
                            <span>{MIN_CREDIT_LINE} cr.</span>
                            <span>0 cr.</span>
                            <span>{balances.totalEarned} cr.</span>
                        </div>
                        <div className="h-3 bg-surface-800 rounded-full overflow-hidden relative">
                            {/* Negative zone */}
                            <div
                                className="absolute left-0 top-0 h-full bg-red-500/20 border-r border-red-500/40"
                                style={{ width: `${(Math.abs(MIN_CREDIT_LINE) / (balances.totalEarned - MIN_CREDIT_LINE)) * 100}%` }}
                            />
                            {/* Current position */}
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${balances.available >= 0
                                        ? 'bg-gradient-to-r from-brand-600 to-brand-400'
                                        : 'bg-gradient-to-r from-red-600 to-red-400'
                                    }`}
                                style={{ width: `${creditUsagePercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <p className="text-xs text-surface-500">
                                Puedes gastar hasta <span className="text-white font-medium">{balances.available - MIN_CREDIT_LINE} créditos</span>
                            </p>
                            <p className="text-xs text-surface-500">
                                ~${(balances.available - MIN_CREDIT_LINE) * CREDIT_VALUE_USD} USD
                            </p>
                        </div>
                    </div>

                    {balances.available < 0 && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-red-300">
                                Tu saldo es negativo. Completa trabajos para restablecer tu balance.
                            </p>
                        </div>
                    )}
                </div>

                {/* Milestones Card */}
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-brand-400" />
                            Hitos de Onboarding
                        </h3>
                        <span className="text-xs text-brand-400 font-medium">
                            {Object.values(milestones).filter(m => m.completed).length}/{Object.values(milestones).length} completados
                        </span>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(milestones).map(([key, m]) => (
                            <MilestoneItem key={key} label={m.label} credits={m.credits} completed={m.completed} />
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-surface-800">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-surface-500">Créditos ganados por hitos</span>
                            <span className="text-sm font-semibold text-brand-400">
                                +{Object.values(milestones).filter(m => m.completed).reduce((sum, m) => sum + m.credits, 0)} créditos
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Contracts */}
            {activeContracts.filter(c => c.status === 'in_progress').length > 0 && (
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-brand-400" />
                        Contratos Activos
                    </h3>
                    <div className="space-y-3">
                        {activeContracts.filter(c => c.status === 'in_progress').map(contract => (
                            <div key={contract.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/50 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{contract.serviceTitle}</p>
                                    <p className="text-xs text-surface-500">
                                        Proveedor: {contract.provider.name} · Entrega: {contract.expectedDelivery.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-amber-400">{contract.amount} cr.</p>
                                    <p className="text-xs text-surface-600">En escrow</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-surface-600" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '350ms' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-400" />
                        Transacciones Recientes
                    </h3>
                    <a href="/wallet" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                        Ver todo <ChevronRight className="w-3 h-3" />
                    </a>
                </div>
                <div className="space-y-1">
                    {recentTx.map(tx => (
                        <RecentTransaction key={tx.id} tx={tx} CREDIT_VALUE_USD={CREDIT_VALUE_USD} />
                    ))}
                </div>
            </div>
        </div>
    );
}
