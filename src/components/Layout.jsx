import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import {
    LayoutDashboard,
    Store,
    Wallet,
    PlusCircle,
    AlertTriangle,
    Award,
    LogOut,
    Menu,
    X,
    Coins,
    ChevronDown,
    User,
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/onboarding', label: 'Hitos', icon: Award },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/publish', label: 'Publicar Servicio', icon: PlusCircle },
    { path: '/disputes', label: 'Disputas', icon: AlertTriangle },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { balances, CREDIT_VALUE_USD } = useWallet();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-surface-950">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-surface-900/80 backdrop-blur-xl
        border-r border-surface-800/50 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-surface-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                            <Coins className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">EISC</h1>
                            <p className="text-xs text-surface-500">Ecosistema de Servicios</p>
                        </div>
                    </div>
                </div>

                {/* Balance card in sidebar */}
                <div className="px-4 py-4">
                    <div className="glass-card p-4">
                        <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Tu Balance</p>
                        <p className={`text-2xl font-bold ${balances.available >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                            {balances.available} <span className="text-sm font-normal text-surface-500">créditos</span>
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">
                            ~${balances.availableUSD.toLocaleString()} USD
                        </p>
                        {balances.inEscrow > 0 && (
                            <div className="mt-2 pt-2 border-t border-surface-800">
                                <p className="text-xs text-amber-400">
                                    🔒 {balances.inEscrow} en escrow (~${balances.inEscrow * CREDIT_VALUE_USD} USD)
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                isActive ? 'nav-link-active' : 'nav-link'
                            }
                            end={item.path === '/'}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                            {item.path === '/disputes' && (
                                <span className="ml-auto badge-danger text-[10px]">1</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-surface-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-surface-500 hover:text-red-400 transition-colors rounded-lg hover:bg-surface-800"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {NAV_ITEMS.find(item => {
                                        if (item.path === '/') return location.pathname === '/';
                                        return location.pathname.startsWith(item.path);
                                    })?.label || 'EISC'}
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Quick balance */}
                            <div className="hidden sm:flex items-center gap-2 glass-card px-4 py-2">
                                <Coins className="w-4 h-4 text-brand-400" />
                                <span className={`text-sm font-semibold ${balances.available >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                                    {balances.available}
                                </span>
                                <span className="text-xs text-surface-500">| ~${balances.availableUSD} USD</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
