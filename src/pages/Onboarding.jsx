import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import {
    Award, CheckCircle2, Coins, ChevronRight, Briefcase, ShieldCheck,
    Linkedin, Github, Globe, Upload, Users, Star, ArrowRight,
    ExternalLink, FileText, UserCheck, Link2, Sparkles, Lock, ShoppingBag, Clock
} from 'lucide-react';

function ProgressBar({ completed, total }) {
    const pct = (completed / total) * 100;
    // Calculation: Registration(+1), Talent(+2), Identity(+2), FirstSale(+3) = 8 total
    const earnedCredits = completed === 4 ? 8 : (completed === 1 ? 1 : (completed === 2 ? 3 : (completed === 3 ? 5 : 0)));
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-surface-400">{completed} de {total} hitos completados</span>
                <span className="text-brand-400 font-semibold">{earnedCredits} / 8 créditos posibles</span>
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
                            Demuestra tu experiencia profesional subiendo un portafolio o conectando redes sociales profesionales.
                        </p>
                    </div>
                </div>
            </div>

            {!mode ? (
                <div className="p-6 space-y-3">
                    <p className="text-xs text-surface-500 uppercase tracking-wider font-medium mb-3">Elige una opción</p>
                    <button onClick={() => setMode('portfolio')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/60 border border-surface-700/50 hover:border-brand-500/30 transition-all group">
                        <Upload className="w-5 h-5 text-blue-400" />
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-white group-hover:text-brand-400">Subir Portafolio</p>
                            <p className="text-xs text-surface-500">PDF o enlace a Behance/Dribbble/Web</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-600" />
                    </button>
                    <button onClick={() => setMode('social')} className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-800/30 hover:bg-surface-800/60 border border-surface-700/50 hover:border-brand-500/30 transition-all group">
                        <Link2 className="w-5 h-5 text-indigo-400" />
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-white group-hover:text-brand-400">Redes Profesionales</p>
                            <p className="text-xs text-surface-500">LinkedIn o GitHub</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-600" />
                    </button>
                </div>
            ) : mode === 'portfolio' ? (
                <form onSubmit={handleSubmitPortfolio} className="p-6 space-y-4 animate-fade-in">
                    <button type="button" onClick={() => setMode(null)} className="text-xs text-surface-500 hover:text-white mb-1">← Volver</button>
                    <input type="url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://tu-portafolio.com" className="input-field" required />
                    <button type="submit" disabled={loading} className="btn-primary w-full py-2">Enviar</button>
                </form>
            ) : (
                <form onSubmit={handleSubmitSocial} className="p-6 space-y-4 animate-fade-in">
                    <button type="button" onClick={() => setMode(null)} className="text-xs text-surface-500 hover:text-white mb-1">← Volver</button>
                    <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" className="input-field mb-2" />
                    <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="GitHub URL" className="input-field" />
                    <button type="submit" disabled={loading} className="btn-primary w-full py-2 text-sm">Conectar</button>
                </form>
            )}
        </div>
    );
}

function VerificationMilestone({ completed, onComplete }) {
    const [referralEmail, setReferralEmail] = useState('');
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
                        <p className="text-sm text-surface-400 mt-1">Solicita una recomendación de un miembro activo de EISC.</p>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmitReferral} className="p-6 space-y-4 animate-fade-in">
                <input type="email" value={referralEmail} onChange={e => setReferralEmail(e.target.value)} placeholder="miembro@ejemplo.com" className="input-field" required />
                <button type="submit" disabled={loading || !referralEmail} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? 'Enviando...' : <><UserCheck className="w-4 h-4" /> Solicitar recomendación</>}
                </button>
            </form>
        </div>
    );
}

function FirstSaleMilestone({ completed }) {
    return (
        <div className={`glass-card p-6 animate-slide-up ${completed ? 'border-brand-500/20' : 'opacity-80'}`} style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${completed ? 'bg-brand-500/10 text-brand-400' : 'bg-surface-800 text-surface-500'}`}>
                    {completed ? <CheckCircle2 className="w-7 h-7" /> : <ShoppingBag className="w-7 h-7" />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">Primera Venta</h3>
                        {!completed && <span className="badge-info">+3 créditos</span>}
                    </div>
                    <p className="text-sm text-surface-400 mt-0.5">
                        {completed ? '¡Felicidades! Completaste tu primer servicio.' : 'Completa tu primer servicio como prestador para reclamar este bono.'}
                    </p>
                </div>
                {completed ? <div className="badge-success">Completado</div> : <div className="badge-secondary">En progreso</div>}
            </div>
        </div>
    );
}

export default function Onboarding() {
    const { milestones, completeMilestone, balances } = useWallet();

    const completedCount = Object.values(milestones).filter(m => m.completed).length;
    const totalMilestones = Object.keys(milestones).length;
    const allCompleted = completedCount === totalMilestones;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-brand-400" />
                    Hitos y Recompensas
                </h1>
                <p className="text-surface-500 mt-1">Gana créditos y fortalece tu reputación en el ecosistema.</p>
            </div>

            <div className="glass-card p-5">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-semibold text-white">Tu progreso de recompensas</h2>
                        <ProgressBar completed={completedCount} total={totalMilestones} />
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4 px-4">
                    {Object.entries(milestones).map(([key, m], i) => (
                        <div key={key} className="flex items-center gap-2 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 ${m.completed ? 'bg-brand-500 text-white shadow-glow' : 'bg-surface-800 text-surface-500 border border-surface-700'}`}>
                                {m.completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < totalMilestones - 1 && (
                                <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${m.completed ? 'bg-brand-500' : 'bg-surface-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 text-center">
                    {['Registro', 'Talento', 'Verif.', '1ª Venta'].map((label, i) => (
                        <div key={label} className="flex-1">
                            <p className="text-[10px] text-surface-400 font-medium">{label}</p>
                            <p className="text-[10px] text-surface-600">+{i === 0 ? 1 : (i === 1 || i === 2 ? 2 : 3)} cr.</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-brand-500/5 rounded-2xl border border-brand-500/10">
                <div className="flex items-start gap-4 p-4 glass-card bg-surface-900/50">
                    <Clock className="w-10 h-10 text-brand-400 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-white">Bono Mensual Automático</h4>
                        <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                            Recibe <span className="text-brand-400 font-bold">+1 crédito</span> cada 30 días solo por mantenerte activo en la comunidad.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 glass-card bg-surface-900/50">
                    <ShoppingBag className="w-10 h-10 text-purple-400 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-white">Bono de Primera Venta</h4>
                        <p className="text-xs text-surface-400 mt-1 leading-relaxed">
                            Al completar tu primer trabajo ganas <span className="text-brand-400 font-bold">+3 créditos</span> extras de gratificación.
                        </p>
                    </div>
                </div>
            </div>

            <TalentMilestone completed={milestones.portfolio?.completed} onComplete={completeMilestone} />
            <VerificationMilestone completed={milestones.identity?.completed} onComplete={completeMilestone} />
            <FirstSaleMilestone completed={milestones.first_sale?.completed} />

            {allCompleted && (
                <div className="glass-card p-6 text-center bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/20">
                    <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white">🎉 ¡Máximo nivel de confianza!</h3>
                    <p className="text-sm text-surface-400 mt-2">Has desbloqueado todas las recompensas iniciales.</p>
                </div>
            )}
        </div>
    );
}
