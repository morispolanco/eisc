import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWallet } from './WalletContext';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../supabase';

const MarketplaceContext = createContext(null);

const CATEGORIES = [
    { id: 'software', label: 'Software & Tech', icon: 'Code2' },
    { id: 'design', label: 'Diseño', icon: 'Palette' },
    { id: 'legal', label: 'Legal', icon: 'Scale' },
    { id: 'marketing', label: 'Marketing', icon: 'Megaphone' },
    { id: 'finance', label: 'Finanzas', icon: 'TrendingUp' },
    { id: 'consulting', label: 'Consultoría', icon: 'Users' },
    { id: 'writing', label: 'Redacción', icon: 'PenTool' },
    { id: 'education', label: 'Educación', icon: 'GraduationCap' },
];

const DEMO_SERVICES = [
    {
        id: 'svc-001',
        title: 'Diseño de Logo Profesional',
        description: 'Creo logos únicos y memorables para tu marca. Incluye 3 propuestas, revisiones ilimitadas y archivos finales en todos los formatos.',
        price: 8,
        category: 'design',
        provider: { id: 'user-002', name: 'Ana García', rating: 4.9, completedJobs: 47 },
        tags: ['Branding', 'Illustrator', 'Identidad Visual'],
        deliveryDays: 5,
        status: 'active',
    },
    {
        id: 'svc-002',
        title: 'Consultoría Legal para Startups',
        description: 'Asesoramiento legal especializado en constitución de empresas, contratos y propiedad intelectual para emprendedores.',
        price: 12,
        category: 'legal',
        provider: { id: 'user-003', name: 'Roberto Silva', rating: 4.8, completedJobs: 32 },
        tags: ['Contratos', 'P.I.', 'Startups'],
        deliveryDays: 3,
        status: 'active',
    },
    {
        id: 'svc-003',
        title: 'Revisión de Código React/Node',
        description: 'Code review profesional de tu aplicación. Identifico bugs, mejoras de rendimiento, y aplico mejores prácticas de la industria.',
        price: 3,
        category: 'software',
        provider: { id: 'user-004', name: 'María López', rating: 5.0, completedJobs: 89 },
        tags: ['React', 'Node.js', 'Code Review'],
        deliveryDays: 2,
        status: 'active',
    },
    {
        id: 'svc-004',
        title: 'Estrategia de Marketing Digital',
        description: 'Plan de marketing digital completo: análisis de competencia, estrategia en redes sociales, y calendario de contenido para 30 días.',
        price: 10,
        category: 'marketing',
        provider: { id: 'user-005', name: 'Diego Morales', rating: 4.7, completedJobs: 23 },
        tags: ['Redes Sociales', 'SEO', 'Content'],
        deliveryDays: 7,
        status: 'active',
    },
    {
        id: 'svc-005',
        title: 'Desarrollo de Landing Page',
        description: 'Landing page moderna y optimizada para conversión. Incluye diseño responsive, animaciones y optimización SEO.',
        price: 15,
        category: 'software',
        provider: { id: 'user-006', name: 'Laura Fernández', rating: 4.9, completedJobs: 61 },
        tags: ['HTML/CSS', 'React', 'Landing Page'],
        deliveryDays: 4,
        status: 'active',
    },
    {
        id: 'svc-006',
        title: 'Redacción de Blog Posts SEO',
        description: 'Artículos optimizados para SEO de 1500+ palabras. Investigación de keywords incluida. Ideal para posicionamiento orgánico.',
        price: 4,
        category: 'writing',
        provider: { id: 'user-007', name: 'Patricia Ruiz', rating: 4.6, completedJobs: 154 },
        tags: ['SEO', 'Copywriting', 'Blog'],
        deliveryDays: 3,
        status: 'active',
    },
    {
        id: 'svc-007',
        title: 'Análisis Financiero para PYMES',
        description: 'Diagnóstico financiero completo: flujo de caja, punto de equilibrio, proyecciones y recomendaciones de optimización.',
        price: 9,
        category: 'finance',
        provider: { id: 'user-008', name: 'Andrés Castillo', rating: 4.8, completedJobs: 18 },
        tags: ['Excel', 'Finanzas', 'PYMES'],
        deliveryDays: 5,
        status: 'active',
    },
    {
        id: 'svc-008',
        title: 'Clases de Programación Python',
        description: '4 sesiones de 1 hora de clases personalizadas de Python. Desde fundamentos hasta automatización y análisis de datos.',
        price: 6,
        category: 'education',
        provider: { id: 'user-009', name: 'Sofía Herrera', rating: 5.0, completedJobs: 42 },
        tags: ['Python', 'Tutoring', 'Data Science'],
        deliveryDays: 14,
        status: 'active',
    },
];

const DEMO_CONTRACTS = [
    {
        id: 'contract-001',
        serviceId: 'svc-001',
        serviceTitle: 'Diseño de Logo Profesional',
        buyer: 'demo-user-001',
        provider: { id: 'user-002', name: 'Ana García' },
        amount: 8,
        status: 'in_progress',
        startDate: new Date('2026-02-10T16:00:00'),
        expectedDelivery: new Date('2026-02-15T16:00:00'),
    },
];

// ─── HELPERS ─────────────────────────────────────────────────────
function mapDbService(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: Number(row.price),
        category: row.category,
        provider: {
            id: row.user_id,
            name: row.provider_name,
            rating: Number(row.provider_rating),
            completedJobs: row.provider_completed_jobs,
        },
        tags: row.tags || [],
        deliveryDays: row.delivery_days,
        status: row.status,
    };
}

function mapDbContract(row) {
    return {
        id: row.id,
        serviceId: row.service_id,
        serviceTitle: row.service_title,
        buyer: row.buyer_id,
        provider: { id: row.seller_id, name: row.provider_name },
        amount: Number(row.amount),
        status: row.status,
        startDate: new Date(row.created_at),
        expectedDelivery: new Date(row.expected_delivery),
        transactionId: row.transaction_id,
    };
}

function mapDbDispute(row) {
    return {
        id: row.id,
        contractId: row.contract_id,
        reason: row.reason,
        description: row.description,
        status: row.status,
        date: new Date(row.created_at),
    };
}

// ─── PROVIDER ────────────────────────────────────────────────────
export function MarketplaceProvider({ children }) {
    const { user } = useAuth();
    const { purchaseService } = useWallet();
    const initializedRef = useRef(false);

    const [services, setServices] = useState(DEMO_SERVICES);
    const [activeContracts, setActiveContracts] = useState(DEMO_CONTRACTS);
    const [disputes, setDisputes] = useState([]);

    // ── Load data from Supabase ──
    useEffect(() => {
        if (!user || !isSupabaseConfigured() || initializedRef.current) return;
        initializedRef.current = true;

        loadFromSupabase(user.uid);
    }, [user]);

    async function loadFromSupabase(userId) {
        try {
            // Load services (all active services from all users)
            const { data: svcRows } = await supabase
                .from('services')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (svcRows && svcRows.length > 0) {
                setServices(svcRows.map(mapDbService));
            }
            // if no services in DB, keep demo services

            // Load user's contracts
            const { data: ctrRows } = await supabase
                .from('contracts')
                .select('*')
                .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (ctrRows) {
                setActiveContracts(ctrRows.map(mapDbContract));
            }

            // Load user's disputes
            const { data: dspRows } = await supabase
                .from('disputes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (dspRows) {
                setDisputes(dspRows.map(mapDbDispute));
            }
        } catch (err) {
            console.error('Error loading marketplace data:', err);
        }
    }

    // ── Buy service ──
    const buyService = async (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return { success: false, error: 'Servicio no encontrado' };

        const result = await purchaseService(
            serviceId,
            service.price,
            service.title,
            service.provider.name
        );

        if (result.success) {
            const contract = {
                id: `contract-${Date.now()}`,
                serviceId,
                serviceTitle: service.title,
                buyer: user?.uid,
                provider: service.provider,
                amount: service.price,
                status: 'in_progress',
                startDate: new Date(),
                expectedDelivery: new Date(Date.now() + service.deliveryDays * 86400000),
                transactionId: result.transactionId,
            };
            setActiveContracts(prev => [contract, ...prev]);

            // Persist to Supabase
            if (isSupabaseConfigured() && user) {
                await supabase.from('contracts').insert({
                    id: contract.id,
                    buyer_id: user.uid,
                    seller_id: service.provider.id,
                    service_id: serviceId,
                    service_title: service.title,
                    amount: service.price,
                    status: 'in_progress',
                    provider_name: service.provider.name,
                    expected_delivery: contract.expectedDelivery.toISOString(),
                    transaction_id: result.transactionId,
                });
            }
        }

        return result;
    };

    // ── Publish service ──
    const publishService = async (serviceData) => {
        const newService = {
            id: `svc-${Date.now()}`,
            ...serviceData,
            provider: { id: user?.uid, name: user?.displayName, rating: 0, completedJobs: 0 },
            status: 'active',
        };
        setServices(prev => [newService, ...prev]);

        // Persist to Supabase
        if (isSupabaseConfigured() && user) {
            await supabase.from('services').insert({
                id: newService.id,
                user_id: user.uid,
                title: newService.title,
                description: newService.description,
                price: newService.price,
                category: newService.category,
                delivery_days: newService.deliveryDays,
                tags: newService.tags || [],
                status: 'active',
                provider_name: user.displayName,
                provider_rating: 0,
                provider_completed_jobs: 0,
            });
        }

        return newService;
    };

    // ── Confirm delivery ──
    const confirmDelivery = async (contractId) => {
        setActiveContracts(prev =>
            prev.map(c => c.id === contractId ? { ...c, status: 'completed' } : c)
        );

        if (isSupabaseConfigured()) {
            await supabase
                .from('contracts')
                .update({ status: 'completed' })
                .eq('id', contractId);
        }
    };

    // ── Open dispute ──
    const openDispute = async (contractId, reason, description) => {
        const contract = activeContracts.find(c => c.id === contractId);
        if (!contract) return;

        const dispute = {
            id: `disp-${Date.now()}`,
            contractId,
            serviceTitle: contract.serviceTitle,
            provider: contract.provider,
            amount: contract.amount,
            reason,
            description,
            status: 'open',
            date: new Date(),
        };

        setDisputes(prev => [dispute, ...prev]);
        setActiveContracts(prev =>
            prev.map(c => c.id === contractId ? { ...c, status: 'disputed' } : c)
        );

        if (isSupabaseConfigured() && user) {
            await supabase.from('disputes').insert({
                id: dispute.id,
                user_id: user.uid,
                contract_id: contractId,
                reason,
                description,
                status: 'open',
            });

            await supabase
                .from('contracts')
                .update({ status: 'disputed' })
                .eq('id', contractId);
        }
    };

    return (
        <MarketplaceContext.Provider value={{
            services,
            activeContracts,
            disputes,
            categories: CATEGORIES,
            buyService,
            publishService,
            confirmDelivery,
            openDispute,
        }}>
            {children}
        </MarketplaceContext.Provider>
    );
}

export function useMarketplace() {
    const context = useContext(MarketplaceContext);
    if (!context) throw new Error('useMarketplace must be used within MarketplaceProvider');
    return context;
}
