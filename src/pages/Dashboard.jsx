import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import {
    Coins, TrendingUp, TrendingDown, Lock, ArrowUpRight, ArrowDownRight,
    CheckCircle2, Clock, Star, Briefcase, Award, ChevronRight, Zap,
    AlertCircle, ShieldCheck, ArrowRight
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, subtext, color, delay }) {
    return (
        <div className="glass-card-hover p-4 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-[11px] text-surface-500 uppercase tracking-wider font-semibold mt-1">{label}</p>
            {subtext && <p className="text-[10px] text-surface-600 mt-0.5">{subtext}</p>}
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
        <div className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/[0.03] transition-all duration-200 group border border-transparent hover:border-surface-800">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isCredit ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-surface-800 text-surface-400'
                }`}>
                {isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
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

export default function Dashboard() {
    const { user } = useAuth();
    const { balances, transactions, milestones, CREDIT_VALUE_USD, MIN_CREDIT_LINE } = useWallet();
    const { activeContracts, services } = useMarketplace();

    const recentTx = [...transactions].sort((a, b) => b.date - a.date).slice(0, 5);
    const activeContractsCount = activeContracts.filter(c => c.status === 'in_progress').length;

    const creditUsagePercent = Math.min(
        100,
        Math.max(0, ((balances.available - MIN_CREDIT_LINE) / (balances.totalEarned - MIN_CREDIT_LINE)) * 100)
    );

    // Mock trend points for the mini-chart
    const trendPoints = "0,40 20,35 40,45 60,30 80,35 100,20 120,25 140,15 160,20 180,10 200,15";

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* ─── FINTECH HEADER & BALANCE HUB ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                    {/* Welcome */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Hola, {user?.displayName?.split(' ')[0]} <span className="text-surface-600 font-normal">👋</span>
                            </h1>
                            <p className="text-sm text-surface-500 mt-1">Estatus del Ecosistema — <span className="text-brand-400">En vivo</span></p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-surface-900 border border-surface-800 rounded-xl p-2 px-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-white tracking-wide">Red Operativa</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Balance Hub */}
                    <div className="relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-brand-500/5 to-transparent rounded-3xl -z-10" />
                        <div className="glass-card p-8 border-brand-500/20 relative overflow-hidden">
                            {/* Decorative Graph BG */}
                            <svg className="absolute bottom-0 right-0 w-1/2 h-2/3 opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" viewBox="0 0 200 60">
                                <path
                                    d={`M ${trendPoints} L 200,60 L 0,60 Z`}
                                    fill="url(#gradient-trend)"
                                />
                                <path
                                    d={`M ${trendPoints}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-brand-400"
                                />
                                <defs>
                                    <linearGradient id="gradient-trend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-brand-400 uppercase tracking-[0.2em] mb-2">Liquidez Total Portafolio</p>
                                    <div className="flex items-baseline gap-3">
                                        <h2 className="text-5xl font-black text-white tracking-tighter">
                                            {balances.available + balances.inEscrow}
                                        </h2>
                                        <span className="text-xl font-medium text-surface-500">CE</span>
                                    </div>
                                    <p className="text-surface-400 mt-2 font-medium">
                                        ≈ ${(balances.availableUSD + balances.inEscrowUSD).toLocaleString()} <span className="text-[10px] text-surface-600 uppercase">USD</span>
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => window.location.href = '/wallet'} className="px-6 py-3 rounded-2xl bg-white text-surface-950 font-bold text-sm hover:bg-brand-50 transition-all flex items-center gap-2 shadow-xl shadow-brand-500/10">
                                        <TrendingUp className="w-4 h-4" /> Expandir Liquidez
                                    </button>
                                    <button onClick={() => window.location.href = '/marketplace'} className="p-3 px-4 rounded-2xl bg-surface-800 text-white font-bold text-sm hover:bg-surface-700 transition-all border border-surface-700">
                                        Explorar
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/[0.05]">
                                <div>
                                    <p className="text-[10px] text-surface-500 uppercase font-bold tracking-widest mb-1">Disponible</p>
                                    <p className={`text-xl font-bold ${balances.available >= 0 ? 'text-white' : 'text-red-400'}`}>
                                        {balances.available} <span className="text-xs font-normal text-surface-600 italic">cr.</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-surface-500 uppercase font-bold tracking-widest mb-1">En Escrow</p>
                                    <p className="text-xl font-bold text-amber-400">
                                        {balances.inEscrow} <span className="text-xs font-normal text-surface-600 italic">cr.</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-surface-500 uppercase font-bold tracking-widest mb-1">Total Ganado</p>
                                    <p className="text-xl font-bold text-blue-400">
                                        {balances.totalEarned} <span className="text-xs font-normal text-surface-600 italic">cr.</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-surface-500 uppercase font-bold tracking-widest mb-1">Confianza</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex -space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-3 rounded-full ${i < 4 ? 'bg-brand-500' : 'bg-surface-800'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-white">Excelente</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* User Card */}
                    <div className="glass-card p-6 bg-gradient-to-br from-surface-900 to-surface-950">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-600 p-[2px]">
                                <div className="w-full h-full rounded-[14px] bg-surface-950 flex items-center justify-center text-xl font-black text-white tracking-widest">
                                    {user?.displayName?.charAt(0)}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">{user?.displayName}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                                    <span className="text-[11px] font-bold text-surface-500 uppercase">Miembro Validado</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 border border-white/[0.03]">
                                <span className="text-xs text-surface-500">Reputación</span>
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.9 <span className="text-surface-600 font-normal">/ 5</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30 border border-white/[0.03]">
                                <span className="text-xs text-surface-500">Transacciones</span>
                                <span className="text-xs font-bold text-white">{transactions.length}</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2.5 rounded-xl border border-surface-800 text-xs font-bold text-surface-400 hover:text-white hover:border-surface-600 transition-all">
                            Editar Perfil Público
                        </button>
                    </div>

                    {/* Quick Milestones */}
                    <div className="glass-card p-5 border-l-4 border-brand-500">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-black text-white uppercase tracking-widest">Hitos Pendientes</p>
                            <Award className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className="space-y-3">
                            {Object.entries(milestones).filter(([_, m]) => !m.completed).slice(0, 2).map(([key, m]) => (
                                <div key={key} className="p-3 rounded-2xl bg-brand-500/5 border border-brand-500/10 group cursor-pointer hover:bg-brand-500/10 transition-all">
                                    <p className="text-[11px] font-bold text-white">{m.label.split('—')[0]}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] text-surface-500">Gana +{m.credits} CE</span>
                                        <ChevronRight className="w-3 h-3 text-brand-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── VALIDATED NETWORK (PROS) ─── */}
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-brand-400" /> Red de Profesionales Validados
                    </h3>
                    <button className="text-xs text-surface-500 hover:text-white transition-colors">Ver todos</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[
                        { name: 'Ana García', job: 'UI Designer', score: '4.9', img: 'A' },
                        { name: 'Roberto Silva', job: 'Abogado Tech', score: '4.8', img: 'R' },
                        { name: 'María López', job: 'Fullstack Dev', score: '5.0', img: 'M' },
                        { name: 'Diego Morales', job: 'Growth Marketer', score: '4.7', img: 'D' },
                        { name: 'Sofía Herrera', job: 'Python Tutor', score: '5.0', img: 'S' },
                    ].map((pro, i) => (
                        <div key={i} className="glass-card-hover p-4 text-center group transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-surface-800 mx-auto flex items-center justify-center text-lg font-black text-surface-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 mb-3 border border-surface-700 group-hover:border-brand-400">
                                {pro.img}
                            </div>
                            <p className="text-sm font-bold text-white truncate">{pro.name}</p>
                            <p className="text-[10px] text-surface-500 mt-0.5">{pro.job}</p>
                            <div className="mt-2 flex items-center justify-center gap-1">
                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-bold text-surface-400">{pro.score}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── LOWER SECTION: TRANSACTIONS & LIQUIDITY ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Transactions Grid */}
                <div className="lg:col-span-12 xl:col-span-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="glass-card p-6 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Actividad Financiera</h3>
                            <div className="flex gap-2">
                                <button className="p-2 px-3 rounded-lg bg-surface-900 border border-surface-800 text-[11px] font-bold text-surface-400 hover:text-white transition-colors">Exportar</button>
                                <button className="p-2 px-3 rounded-lg bg-surface-900 border border-surface-800 text-[11px] font-bold text-surface-400 hover:text-white transition-colors" onClick={() => window.location.href = '/wallet'}>Ver Historial</button>
                            </div>
                        </div>

                        {recentTx.length > 0 ? (
                            <div className="divide-y divide-white/[0.04]">
                                {recentTx.map(tx => (
                                    <RecentTransaction key={tx.id} tx={tx} CREDIT_VALUE_USD={CREDIT_VALUE_USD} />
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-center opacity-50">
                                <Coins className="w-12 h-12 text-surface-700 mb-4" />
                                <p className="text-sm text-surface-500">No hay transacciones registradas aún.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Liquidity side cards */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <div className="glass-card p-6 border-l-4 border-amber-500 bg-gradient-to-br from-amber-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Suministro de Confianza</h4>
                        </div>
                        <div className="relative">
                            <div className="flex justify-between text-[10px] text-surface-600 mb-2">
                                <span>Límite: {MIN_CREDIT_LINE} cr.</span>
                                <span>Uso: {balances.creditLineUsed} cr.</span>
                            </div>
                            <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${balances.creditLineUtilization > 80 ? 'bg-red-500' : 'bg-amber-500'}`}
                                    style={{ width: `${balances.creditLineUtilization}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-surface-500 mt-4 leading-relaxed">
                            {balances.isUsingCreditLine
                                ? `Tienes un saldo pendiente de ${balances.debtAmount} créditos. Realiza servicios para recuperar tu garantía.`
                                : 'Tu línea de crédito está intacta. Puedes contratar servicios ahora mismo.'}
                        </p>
                    </div>

                    <div className="glass-card p-6 border-l-4 border-brand-500 bg-gradient-to-br from-brand-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-brand-400" />
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Acelerador</h4>
                        </div>
                        <p className="text-[11px] text-surface-500 leading-relaxed mb-4">
                            Inyecta liquidez inmediata comprando créditos del ecosistema (1 CE = $10 USD).
                        </p>
                        <button onClick={() => window.location.href = '/wallet'} className="w-full py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20">
                            Comprar CE Online
                        </button>
                    </div>

                    {/* Community Missions Highlight */}
                    <div className="glass-card p-5 border-l-4 border-blue-500 bg-blue-500/5">
                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Award className="w-3.5 h-3.5 text-blue-400" /> Misión Activa
                        </h4>
                        <p className="text-[11px] text-surface-400 leading-relaxed">
                            <span className="text-blue-300 font-bold">Mediador de Confianza</span>: Resuelve una disputa y gana <span className="text-white font-bold">+1 CE</span> inmediatamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
