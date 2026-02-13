import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import {
    Award, CheckCircle2, Coins, ChevronRight, Briefcase, ShieldCheck,
    Linkedin, Github, Globe, Upload, Users, Star, ArrowRight,
    ExternalLink, FileText, UserCheck, Link2, Sparkles, Lock
} from 'lucide-react';

function ProgressBar({ completed, total }) {
    const pct = (completed / total) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-surface-400">{completed} de {total} hitos completados</span>
                <span className="text-brand-400 font-semibold">{completed * 1 + (completed > 1 ? 2 : 0)} / 5 créditos ganados</span>
            </div>
            <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function TalentMilestone({ completed, onComplete }) {
    const [mode, setMode] = useState(null); // 'portfolio' | 'social'
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [portfolioFile, setPortfolioFile] = useState(null);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmitPortfolio = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        onComplete('portfolio');
        setSuccess(true);
        setLoading(false);
    };

    const handleSubmitSocial = async (e) => {
        e.preventDefault();
        if (!linkedinUrl && !githubUrl) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        onComplete('portfolio');
        setSuccess(true);
        setLoading(false);
    };

    if (completed || success) {
        return (
            <div className="glass-card p-6 border-brand-500/20 animate-slide-up">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white">Hito de Talento</h3>
                        <p className="text-sm text-brand-400 mt-0.5">¡Completado! +2 créditos acreditados</p>
                    </div>
                    <div className="badge-success">Completado</div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="p-6 border-b border-surface-800/50">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">Hito de Talento</h3>
                            <span className="badge-info">+2 créditos</span>
                        </div>
                        <p className="text-sm text-surface-400 mt-1">
                            Demuestra tu experiencia profesional subiendo un portafolio verificable o conectando tus redes profesionales.
                        </p>
                    </div>
                </div>
            </div>

            {/* Options */}
            {!mode ? (
                <div className="p-6 space-y-3">
                    <p className="text-xs text-surface-500 uppercase tracking-wider font-medium mb-3">Elige una opción</p>

                    <button
                        onClick={() => setMode('portfolio')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/60 border border-surface-700/50 hover:border-brand-500/30 transition-all group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                            <Upload className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">Subir Portafolio</p>
                            <p className="text-xs text-surface-500 mt-0.5">PDF, enlace a Behance, Dribbble o sitio web personal</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-brand-400 transition-colors" />
                    </button>

                    <button
                        onClick={() => setMode('social')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/60 border border-surface-700/50 hover:border-brand-500/30 transition-all group"
                    >
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                            <Link2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">Conectar Redes Profesionales</p>
                            <p className="text-xs text-surface-500 mt-0.5">LinkedIn, GitHub u otra red profesional</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-brand-400 transition-colors" />
                    </button>
                </div>
            ) : mode === 'portfolio' ? (
                <form onSubmit={handleSubmitPortfolio} className="p-6 space-y-4 animate-fade-in">
                    <button type="button" onClick={() => setMode(null)} className="text-xs text-surface-500 hover:text-white transition-colors mb-1">← Volver a opciones</button>

                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1.5">URL de tu portafolio</label>
                        <div className="relative">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                            <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://tu-portafolio.com" className="input-field pl-11" required />
                        </div>
                        <p className="text-xs text-surface-600 mt-1">Behance, Dribbble, sitio personal, Notion, etc.</p>
                    </div>

                    <div className="text-center text-xs text-surface-600 py-1">— o —</div>

                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1.5">Subir archivo PDF</label>
                        <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-surface-700 hover:border-brand-500/40 bg-surface-800/20 cursor-pointer transition-all">
                            <FileText className="w-5 h-5 text-surface-500" />
                            <span className="text-sm text-surface-400">{portfolioFile ? portfolioFile.name : 'Seleccionar PDF...'}</span>
                            <input type="file" accept=".pdf" className="sr-only" onChange={e => setPortfolioFile(e.target.files[0])} />
                        </label>
                    </div>

                    <button type="submit" disabled={loading || (!portfolioUrl && !portfolioFile)} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verificando...</>) : (<><Upload className="w-4 h-4" />Enviar portafolio</>)}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSubmitSocial} className="p-6 space-y-4 animate-fade-in">
                    <button type="button" onClick={() => setMode(null)} className="text-xs text-surface-500 hover:text-white transition-colors mb-1">← Volver a opciones</button>

                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1.5 flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn</label>
                        <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/tu-perfil" className="input-field" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-1.5 flex items-center gap-2"><Github className="w-4 h-4 text-white" /> GitHub</label>
                        <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/tu-usuario" className="input-field" />
                    </div>

                    <p className="text-xs text-surface-500 bg-surface-800/30 p-3 rounded-xl">
                        ✅ Conecta al menos una red profesional. Verificaremos que el perfil es auténtico y tiene actividad real.
                    </p>

                    <button type="submit" disabled={loading || (!linkedinUrl && !githubUrl)} className="btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Conectando...</>) : (<><Link2 className="w-4 h-4" />Conectar redes</>)}
                    </button>
                </form>
            )}
        </div>
    );
}

function VerificationMilestone({ completed, onComplete }) {
    const [referralEmail, setReferralEmail] = useState('');
    const [referralMessage, setReferralMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmitReferral = async (e) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        onComplete('identity');
        setSuccess(true);
        setLoading(false);
    };

    if (completed || success) {
        return (
            <div className="glass-card p-6 border-brand-500/20 animate-slide-up">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white">Hito de Verificación</h3>
                        <p className="text-sm text-brand-400 mt-0.5">¡Completado! +2 créditos acreditados</p>
                    </div>
                    <div className="badge-success">Verificado</div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
            {/* Header */}
            <div className="p-6 border-b border-surface-800/50">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">Hito de Verificación</h3>
                            <span className="badge-info">+2 créditos</span>
                        </div>
                        <p className="text-sm text-surface-400 mt-1">
                            Solicita la recomendación de un miembro activo de la plataforma para verificar tu identidad y desbloquear créditos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Referral form */}
            <form onSubmit={handleSubmitReferral} className="p-6 space-y-4 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Correo del miembro que te recomienda</label>
                    <input type="email" value={referralEmail} onChange={e => setReferralEmail(e.target.value)} placeholder="miembro@ejemplo.com" className="input-field" required />
                    <p className="text-xs text-surface-600 mt-1">El miembro debe tener al menos 3 transacciones completadas en EISC.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Mensaje para el miembro (opcional)</label>
                    <textarea value={referralMessage} onChange={e => setReferralMessage(e.target.value)} placeholder="Hola, ¿podrías validar mi identidad en EISC?" className="input-field min-h-[80px] resize-y" />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-xs text-amber-300 flex items-start gap-2">
                        <Users className="w-4 h-4 shrink-0 mt-0.5" />
                        Enviaremos una solicitud al miembro. Una vez que confirme, tus créditos se acreditarán automáticamente.
                    </p>
                </div>

                <button type="submit" disabled={loading || !referralEmail} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando solicitud...</>) : (<><UserCheck className="w-4 h-4" />Solicitar recomendación</>)}
                </button>
            </form>
        </div>
    );
}

export default function Onboarding() {
    const { user } = useAuth();
    const { milestones, completeMilestone, balances, CREDIT_VALUE_USD } = useWallet();

    const completedCount = Object.values(milestones).filter(m => m.completed).length;
    const totalMilestones = Object.keys(milestones).length;
    const allCompleted = completedCount === totalMilestones;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-brand-400" />
                    Hitos de Onboarding
                </h1>
                <p className="text-surface-500 mt-1">
                    Completa estos hitos para desbloquear créditos y comenzar a intercambiar servicios
                </p>
            </div>

            {/* Progress */}
            <div className="glass-card p-5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-semibold text-white">Tu progreso</h2>
                        <p className="text-xs text-surface-500">
                            Balance actual: <span className={`font-semibold ${balances.available >= 0 ? 'text-brand-400' : 'text-red-400'}`}>{balances.available} créditos</span> (~${balances.availableUSD} USD)
                        </p>
                    </div>
                    {allCompleted && (
                        <div className="badge-success text-xs px-3 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ¡Todo completado!
                        </div>
                    )}
                </div>

                {/* Progress steps */}
                <div className="flex items-center gap-2 mb-4">
                    {Object.entries(milestones).map(([key, m], i) => (
                        <div key={key} className="flex items-center gap-2 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 ${m.completed ? 'bg-brand-500 text-white shadow-glow' : 'bg-surface-800 text-surface-500 border border-surface-700'
                                }`}>
                                {m.completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < totalMilestones - 1 && (
                                <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${m.completed ? 'bg-brand-500' : 'bg-surface-800'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step labels */}
                <div className="flex gap-2">
                    <div className="flex-1 text-center">
                        <p className={`text-[10px] font-medium ${milestones.registration?.completed ? 'text-brand-400' : 'text-surface-600'}`}>Registro</p>
                        <p className="text-[10px] text-surface-700">+1 cr.</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className={`text-[10px] font-medium ${milestones.portfolio?.completed ? 'text-brand-400' : 'text-surface-600'}`}>Talento</p>
                        <p className="text-[10px] text-surface-700">+2 cr.</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className={`text-[10px] font-medium ${milestones.identity?.completed ? 'text-brand-400' : 'text-surface-600'}`}>Verificación</p>
                        <p className="text-[10px] text-surface-700">+2 cr.</p>
                    </div>
                </div>
            </div>

            {/* Registration milestone (always completed for logged-in users) */}
            <div className="glass-card p-6 border-brand-500/20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white">Registro Completado</h3>
                        <p className="text-sm text-brand-400 mt-0.5">¡Bienvenido a EISC! +1 crédito acreditado</p>
                    </div>
                    <div className="badge-success">Completado</div>
                </div>
            </div>

            {/* Talent Milestone */}
            <TalentMilestone completed={milestones.portfolio?.completed} onComplete={completeMilestone} />

            {/* Verification Milestone */}
            <VerificationMilestone completed={milestones.identity?.completed} onComplete={completeMilestone} />

            {/* CTA when all complete */}
            {allCompleted && (
                <div className="glass-card p-6 text-center animate-slide-up bg-gradient-to-br from-brand-500/5 to-brand-700/5 border-brand-500/20">
                    <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">🎉 ¡Onboarding Completo!</h3>
                    <p className="text-sm text-surface-400 mb-4">
                        Has ganado <span className="text-brand-400 font-bold">5 créditos (~$50 USD)</span>. Ahora puedes explorar el marketplace y contratar servicios.
                    </p>
                    <a href="/marketplace" className="btn-primary inline-flex items-center gap-2">
                        Explorar Marketplace <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            )}

            {/* Info card */}
            <div className="glass-card p-5">
                <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-surface-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-surface-300">¿Sin créditos aún?</p>
                        <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">
                            EISC te ofrece una <span className="text-white font-medium">línea de crédito de hasta -10 créditos (~$100 USD)</span> para que
                            puedas contratar tu primer servicio incluso sin haber completado todos los hitos. ¡Comienza ya!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
