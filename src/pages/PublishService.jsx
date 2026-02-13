import { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useWallet } from '../context/WalletContext';
import {
    PlusCircle, Tag, Clock, DollarSign, FileText, CheckCircle2,
    Code2, Palette, Scale, Megaphone, TrendingUp, Users, PenTool, GraduationCap
} from 'lucide-react';

const CATEGORY_ICONS = {
    software: Code2, design: Palette, legal: Scale, marketing: Megaphone,
    finance: TrendingUp, consulting: Users, writing: PenTool, education: GraduationCap,
};

export default function PublishService() {
    const { publishService, categories } = useMarketplace();
    const { CREDIT_VALUE_USD } = useWallet();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', price: '', category: 'software', deliveryDays: '', tags: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        publishService({
            title: form.title,
            description: form.description,
            price: parseInt(form.price),
            category: form.category,
            deliveryDays: parseInt(form.deliveryDays),
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        });
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setForm({ title: '', description: '', price: '', category: 'software', deliveryDays: '', tags: '' }); }, 3000);
    };

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-brand-400" />Publicar Servicio
                </h1>
                <p className="text-surface-500 mt-1">Ofrece tus habilidades profesionales y gana créditos</p>
            </div>

            {submitted ? (
                <div className="glass-card p-8 text-center animate-slide-up">
                    <CheckCircle2 className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">¡Servicio publicado!</h2>
                    <p className="text-surface-400">Tu servicio ya está disponible en el Marketplace.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Título del servicio</label>
                        <input type="text" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ej: Diseño de Logo Profesional" className="input-field" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Descripción</label>
                        <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe tu servicio en detalle..." className="input-field min-h-[120px] resize-y" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Categoría</label>
                            <select value={form.category} onChange={e => update('category', e.target.value)} className="input-field">
                                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.label}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Precio (créditos)</label>
                            <input type="number" min="1" max="100" value={form.price} onChange={e => update('price', e.target.value)} placeholder="10" className="input-field" required />
                            {form.price && <p className="text-xs text-surface-500 mt-1">~${parseInt(form.price) * CREDIT_VALUE_USD} USD</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Días de entrega</label>
                            <input type="number" min="1" max="90" value={form.deliveryDays} onChange={e => update('deliveryDays', e.target.value)} placeholder="5" className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Tags (separados por coma)</label>
                            <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="React, Node.js, API" className="input-field" />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                        <PlusCircle className="w-4 h-4" />Publicar Servicio
                    </button>
                </form>
            )}
        </div>
    );
}
