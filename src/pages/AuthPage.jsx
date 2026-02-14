import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Coins, Mail, Lock, User, Eye, EyeOff, ArrowRight,
    CheckCircle2, Shield, Zap, TrendingUp, ChevronRight
} from 'lucide-react';

const FEATURES = [
    { icon: Coins, title: 'Créditos de Servicio', desc: 'Intercambia habilidades sin dinero real. 1 crédito = $10 USD.' },
    { icon: Shield, title: 'Sistema Escrow', desc: 'Tus créditos están protegidos hasta confirmar la entrega.' },
    { icon: Zap, title: 'Línea de Crédito', desc: 'Comienza contratando servicios incluso con saldo en 0.' },
    { icon: TrendingUp, title: 'Gana Reputación', desc: 'Construye tu perfil profesional con cada transacción exitosa.' },
];

function PasswordStrength({ password }) {
    const checks = [
        { test: password.length >= 8, label: '8+ caracteres' },
        { test: /[A-Z]/.test(password), label: 'Una mayúscula' },
        { test: /[0-9]/.test(password), label: 'Un número' },
    ];
    const score = checks.filter(c => c.test).length;
    const colors = ['bg-red-500', 'bg-amber-500', 'bg-brand-500'];
    const labels = ['Débil', 'Media', 'Fuerte'];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-surface-800'}`} />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <span className={`text-xs ${score > 0 ? (score === 3 ? 'text-brand-400' : 'text-amber-400') : 'text-red-400'}`}>
                    {score > 0 ? labels[score - 1] : 'Muy débil'}
                </span>
                <div className="flex gap-3">
                    {checks.map((c, i) => (
                        <span key={i} className={`text-[10px] flex items-center gap-1 ${c.test ? 'text-brand-400' : 'text-surface-600'}`}>
                            <CheckCircle2 className="w-3 h-3" /> {c.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [success, setSuccess] = useState('');
    const isRegister = mode === 'register';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (isRegister && !acceptTerms) {
            setError('Debes aceptar los términos y condiciones.');
            return;
        }
        if (isRegister && password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password, displayName, specialty);
                setSuccess('¡Cuenta creada! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.');
                // Optionally clear form or switch to login
                setMode('login');
                setPassword('');
            } else {
                await login(email, password);
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(isRegister ? 'login' : 'register');
        setError('');
    };

    return (
        <div className="min-h-screen bg-surface-950 flex">
            {/* Left Panel — Brand & Features (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-surface-950 to-brand-950" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-lg">
                                <Coins className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">EISC</h1>
                                <p className="text-xs text-brand-400/70">Ecosistema de Intercambio</p>
                            </div>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                                Intercambia talento,<br />
                                <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                                    no dinero.
                                </span>
                            </h2>
                            <p className="text-surface-400 mt-4 text-base leading-relaxed max-w-md">
                                Una plataforma donde profesionales intercambian servicios usando créditos digitales.
                                Tu conocimiento es tu moneda.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            {FEATURES.map((f, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 group-hover:bg-brand-500/20 transition-colors">
                                        <f.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{f.title}</p>
                                        <p className="text-xs text-surface-500 mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-surface-700">
                        © 2026 EISC Platform. Todos los derechos reservados.
                    </p>
                </div>
            </div>

            {/* Right Panel — Auth Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
                            <Coins className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">EISC</h1>
                            <p className="text-[10px] text-surface-500">Ecosistema de Intercambio</p>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">
                            {isRegister ? 'Crear cuenta' : 'Bienvenido de vuelta'}
                        </h2>
                        <p className="text-surface-500 mt-1.5">
                            {isRegister
                                ? 'Únete al ecosistema y comienza a intercambiar servicios'
                                : 'Inicia sesión para acceder a tu cuenta EISC'
                            }
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-slide-up">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-4 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-sm text-brand-400 animate-slide-up flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{success}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name (register only) */}
                        {isRegister && (
                            <div className="animate-slide-up">
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Nombre completo</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        placeholder="Carlos Méndez"
                                        className="input-field pl-11"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    className="input-field pl-11"
                                    required
                                />
                            </div>
                        </div>

                        {/* Specialty (register only) */}
                        {isRegister && (
                            <div className="animate-slide-up">
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Especialidad</label>
                                <select
                                    value={specialty}
                                    onChange={e => setSpecialty(e.target.value)}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Selecciona tu área...</option>
                                    <option value="software">Software & Tecnología</option>
                                    <option value="design">Diseño</option>
                                    <option value="legal">Legal</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="finance">Finanzas</option>
                                    <option value="consulting">Consultoría</option>
                                    <option value="writing">Redacción</option>
                                    <option value="education">Educación</option>
                                </select>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-11 pr-11"
                                    required
                                    minLength={isRegister ? 8 : 1}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {isRegister && <PasswordStrength password={password} />}
                        </div>

                        {/* Terms (register only) */}
                        {isRegister && (
                            <label className="flex items-start gap-3 cursor-pointer group animate-slide-up">
                                <div className="relative mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={e => setAcceptTerms(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 rounded-md border-2 border-surface-600 peer-checked:border-brand-500 peer-checked:bg-brand-500 transition-all flex items-center justify-center">
                                        {acceptTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                </div>
                                <span className="text-xs text-surface-400 leading-relaxed">
                                    Acepto los <a href="#" className="text-brand-400 hover:text-brand-300 underline">Términos de Servicio</a> y la <a href="#" className="text-brand-400 hover:text-brand-300 underline">Política de Privacidad</a> de EISC
                                </span>
                            </label>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isRegister ? 'Creando cuenta...' : 'Iniciando sesión...'}
                                </>
                            ) : (
                                <>
                                    {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Onboarding preview (register only) */}
                    {isRegister && (
                        <div className="mt-6 p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 animate-slide-up">
                            <p className="text-xs font-semibold text-brand-400 mb-2 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" /> Bono de bienvenida
                            </p>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-surface-400">Registro completado</span>
                                    <span className="text-brand-400 font-semibold">+1 crédito</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-surface-400">Subir portafolio</span>
                                    <span className="text-surface-500 font-semibold">+2 créditos</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-surface-400">Verificar identidad</span>
                                    <span className="text-surface-500 font-semibold">+2 créditos</span>
                                </div>
                                <div className="pt-1.5 mt-1.5 border-t border-brand-500/10 flex items-center justify-between text-xs">
                                    <span className="text-surface-300 font-medium">Total posible</span>
                                    <span className="text-brand-400 font-bold">5 créditos (~$50 USD)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Switch mode */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-surface-500">
                            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                            <button
                                type="button"
                                onClick={switchMode}
                                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                            >
                                {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
                            </button>
                        </p>
                    </div>

                    {/* Demo access */}
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => login('carlos@eisc.io', 'demo1234')}
                            className="text-xs text-surface-600 hover:text-surface-400 transition-colors underline decoration-dashed underline-offset-4"
                        >
                            Acceder con cuenta demo →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
