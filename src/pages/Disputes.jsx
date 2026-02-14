import { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { AlertTriangle, Clock, CheckCircle2, MessageSquare, ChevronRight, Send } from 'lucide-react';

export default function Disputes() {
    const { disputes, activeContracts, openDispute } = useMarketplace();
    const [showForm, setShowForm] = useState(false);
    const [selectedContract, setSelectedContract] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const disputeReasons = [
        'Servicio no entregado', 'Calidad insatisfactoria', 'Servicio incompleto',
        'No coincide con la descripción', 'Comunicación deficiente', 'Otro',
    ];

    const activeOnes = activeContracts.filter(c => c.status === 'in_progress');

    const handleSubmit = (e) => {
        e.preventDefault();
        openDispute(selectedContract, reason, description);
        setSubmitted(true);
        setTimeout(() => {
            setShowForm(false); setSubmitted(false); setSelectedContract(''); setReason(''); setDescription('');
        }, 3000);
    };

    const statusConfig = {
        open: { class: 'badge-warning', label: 'Abierta', icon: Clock },
        resolved: { class: 'badge-success', label: 'Resuelta', icon: CheckCircle2 },
        closed: { class: 'badge-danger', label: 'Cerrada', icon: AlertTriangle },
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-brand-400" />Sistema de Disputas
                    </h1>
                    <p className="text-surface-500 mt-1">Reporta incumplimientos en los servicios contratados</p>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />Nueva Disputa
                    </button>
                )}
            </div>

            {/* Misión de Comunidad: Mediador */}
            {!showForm && (
                <div className="glass-card p-4 border-l-4 border-l-blue-500 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Misión de Comunidad: Sé Mediador</h3>
                            <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                                Gana <span className="text-blue-400 font-semibold">+1 CE</span> por cada disputa que ayudes a resolver de forma justa. Inyecta imparcialidad y ayuda a mantener sano el ecosistema.
                            </p>
                        </div>
                    </div>
                    <button className="px-5 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-400 transition-all shrink-0">
                        Postularme como Mediador
                    </button>
                </div>
            )}

            {/* Dispute Form */}
            {showForm && (
                <div className="glass-card p-6 animate-slide-up">
                    {submitted ? (
                        <div className="text-center py-4">
                            <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto mb-3" />
                            <p className="text-lg font-semibold text-white">Disputa registrada</p>
                            <p className="text-sm text-surface-400 mt-1">Nuestro equipo revisará tu caso en las próximas 24 horas.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h3 className="text-base font-semibold text-white">Abrir nueva disputa</h3>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">Contrato</label>
                                <select value={selectedContract} onChange={e => setSelectedContract(e.target.value)} className="input-field" required>
                                    <option value="">Selecciona un contrato...</option>
                                    {activeOnes.map(c => (<option key={c.id} value={c.id}>{c.serviceTitle} — {c.provider.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">Motivo</label>
                                <select value={reason} onChange={e => setReason(e.target.value)} className="input-field" required>
                                    <option value="">Selecciona un motivo...</option>
                                    {disputeReasons.map(r => (<option key={r} value={r}>{r}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-2">Descripción del problema</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe el problema en detalle..." className="input-field min-h-[100px] resize-y" required />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-danger flex items-center gap-2"><Send className="w-4 h-4" />Enviar disputa</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Disputes list */}
            {disputes.length > 0 ? (
                <div className="space-y-3">
                    {disputes.map(dispute => {
                        const sc = statusConfig[dispute.status];
                        return (
                            <div key={dispute.id} className="glass-card-hover p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">{dispute.serviceTitle}</h3>
                                        <p className="text-xs text-surface-500 mt-0.5">Proveedor: {dispute.provider.name} · {dispute.amount} créditos</p>
                                    </div>
                                    <span className={sc.class}>{sc.label}</span>
                                </div>
                                <p className="text-xs text-surface-400 mb-2"><span className="text-surface-500 font-medium">Motivo:</span> {dispute.reason}</p>
                                <p className="text-xs text-surface-500">{dispute.description}</p>
                                <p className="text-xs text-surface-600 mt-2">{dispute.date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                !showForm && (
                    <div className="glass-card p-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-surface-700 mx-auto mb-3" />
                        <p className="text-surface-500">No hay disputas registradas</p>
                        <p className="text-xs text-surface-600 mt-1">¡Excelente! Todo en orden.</p>
                    </div>
                )
            )}
        </div>
    );
}
