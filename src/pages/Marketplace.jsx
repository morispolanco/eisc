import { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useWallet } from '../context/WalletContext';
import {
    Store, Search, Star, Clock, Tag, ShoppingCart,
    Code2, Palette, Scale, Megaphone, TrendingUp, Users, PenTool,
    GraduationCap, X, CheckCircle2, AlertCircle, Coins
} from 'lucide-react';

const CATEGORY_ICONS = {
    software: Code2, design: Palette, legal: Scale, marketing: Megaphone,
    finance: TrendingUp, consulting: Users, writing: PenTool, education: GraduationCap,
};

function ServiceDetailModal({ service, onClose, onBuy, affordable }) {
    const [buying, setBuying] = useState(false);
    const [result, setResult] = useState(null);
    const { CREDIT_VALUE_USD } = useWallet();
    const Icon = CATEGORY_ICONS[service.category] || Tag;

    const handleBuy = async () => {
        setBuying(true);
        await new Promise(r => setTimeout(r, 1200));
        const res = onBuy(service.id);
        setResult(res);
        setBuying(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative glass-card max-w-lg w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-surface-500 hover:text-white rounded-lg hover:bg-surface-800 transition">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center"><Icon className="w-6 h-6" /></div>
                    <div>
                        <h2 className="text-lg font-bold text-white">{service.title}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-sm text-white">{service.provider.rating}</span>
                            <span className="text-xs text-surface-500">· {service.provider.name}</span>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-surface-400 mb-4 leading-relaxed">{service.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {service.tags.map(tag => (<span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-surface-800 text-surface-400 border border-surface-700/50">{tag}</span>))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-surface-800/50"><p className="text-xs text-surface-500">Precio</p><p className="text-lg font-bold text-brand-400">{service.price} cr.</p><p className="text-xs text-surface-600">~${service.price * CREDIT_VALUE_USD} USD</p></div>
                    <div className="p-3 rounded-xl bg-surface-800/50"><p className="text-xs text-surface-500">Entrega</p><p className="text-lg font-bold text-white">{service.deliveryDays} días</p><p className="text-xs text-surface-600">{service.provider.completedJobs} trabajos</p></div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-4">
                    <p className="text-xs text-amber-300 flex items-start gap-2"><Coins className="w-4 h-4 shrink-0 mt-0.5" />Los créditos se retendrán en escrow hasta que confirmes la recepción satisfactoria.</p>
                </div>
                {result ? (
                    <div className={`p-4 rounded-xl ${result.success ? 'bg-brand-500/10 border border-brand-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className="flex items-center gap-2">
                            {result.success ? (<><CheckCircle2 className="w-5 h-5 text-brand-400" /><div><p className="text-sm font-medium text-brand-400">¡Servicio contratado!</p><p className="text-xs text-surface-400 mt-0.5">Los créditos han sido movidos al escrow.</p></div></>) : (<><AlertCircle className="w-5 h-5 text-red-400" /><div><p className="text-sm font-medium text-red-400">Error</p><p className="text-xs text-surface-400 mt-0.5">{result.error}</p></div></>)}
                        </div>
                    </div>
                ) : (
                    <button onClick={handleBuy} disabled={buying || !affordable} className={`w-full ${affordable ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'} flex items-center justify-center gap-2`}>
                        {buying ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando...</>) : (<><ShoppingCart className="w-4 h-4" />{affordable ? `Contratar por ${service.price} créditos` : 'Fondos insuficientes'}</>)}
                    </button>
                )}
            </div>
        </div>
    );
}

function ServiceCard({ service, onBuy, canAfford }) {
    const [showDetail, setShowDetail] = useState(false);
    const Icon = CATEGORY_ICONS[service.category] || Tag;
    const affordable = canAfford(service.price);
    return (
        <>
            <div className="glass-card-hover p-5 cursor-pointer group" onClick={() => setShowDetail(true)}>
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/10 text-brand-400"><Icon className="w-5 h-5" /></div>
                    <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-sm font-medium text-white">{service.provider.rating}</span></div>
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-brand-400 transition-colors">{service.title}</h3>
                <p className="text-sm text-surface-500 line-clamp-2 mb-3">{service.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">{service.tags.map(tag => (<span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-800 text-surface-400 border border-surface-700/50">{tag}</span>))}</div>
                <div className="flex items-center justify-between pt-3 border-t border-surface-800/50">
                    <div><p className="text-lg font-bold text-brand-400">{service.price} <span className="text-xs font-normal text-surface-500">créditos</span></p><p className="text-xs text-surface-600">~${service.price * 10} USD</p></div>
                    <div className="flex items-center gap-2 text-xs text-surface-500"><Clock className="w-3.5 h-3.5" /><span>{service.deliveryDays}d</span></div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-800/50">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">{service.provider.name.charAt(0)}</div>
                    <span className="text-xs text-surface-400">{service.provider.name}</span>
                    <span className="text-xs text-surface-600">· {service.provider.completedJobs} trabajos</span>
                </div>
            </div>
            {showDetail && <ServiceDetailModal service={service} onClose={() => setShowDetail(false)} onBuy={onBuy} affordable={affordable} />}
        </>
    );
}

export default function Marketplace() {
    const { services, categories, buyService } = useMarketplace();
    const { canAfford, CREDIT_VALUE_USD } = useWallet();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('rating');

    const filteredServices = useMemo(() => {
        let result = services.filter(s => s.status === 'active');
        if (selectedCategory !== 'all') result = result.filter(s => s.category === selectedCategory);
        if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q))); }
        if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') result.sort((a, b) => b.provider.rating - a.provider.rating);
        return result;
    }, [services, selectedCategory, searchQuery, sortBy]);

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Store className="w-6 h-6 text-brand-400" />Marketplace</h1><p className="text-surface-500 mt-1">Encuentra servicios profesionales y págalos con créditos</p></div>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" /><input type="text" placeholder="Buscar servicios..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field pl-10" /></div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-full sm:w-48"><option value="rating">Mayor rating</option><option value="price-low">Menor precio</option><option value="price-high">Mayor precio</option></select>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button onClick={() => setSelectedCategory('all')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface-800/50 text-surface-400 border border-surface-700 hover:border-surface-600'}`}>Todos</button>
                {categories.map(cat => { const CatIcon = CATEGORY_ICONS[cat.id] || Tag; return (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface-800/50 text-surface-400 border border-surface-700 hover:border-surface-600'}`}><CatIcon className="w-3.5 h-3.5" />{cat.label}</button>); })}
            </div>
            <p className="text-sm text-surface-500">{filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} disponible{filteredServices.length !== 1 ? 's' : ''}</p>
            {filteredServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredServices.map((service, i) => (<div key={service.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}><ServiceCard service={service} onBuy={buyService} canAfford={canAfford} /></div>))}
                </div>
            ) : (
                <div className="glass-card p-12 text-center"><Store className="w-12 h-12 text-surface-700 mx-auto mb-3" /><p className="text-surface-500">No se encontraron servicios</p></div>
            )}
        </div>
    );
}
