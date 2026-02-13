import { createContext, useContext, useState } from 'react';
import { useWallet } from './WalletContext';
import { useAuth } from './AuthContext';

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

const INITIAL_SERVICES = [
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

export function MarketplaceProvider({ children }) {
    const { user } = useAuth();
    const { purchaseService } = useWallet();
    const [services, setServices] = useState(INITIAL_SERVICES);
    const [activeContracts, setActiveContracts] = useState([
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
    ]);

    const [disputes, setDisputes] = useState([]);

    const buyService = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return { success: false, error: 'Servicio no encontrado' };

        const result = purchaseService(
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
        }

        return result;
    };

    const publishService = (serviceData) => {
        const newService = {
            id: `svc-${Date.now()}`,
            ...serviceData,
            provider: { id: user?.uid, name: user?.displayName, rating: 0, completedJobs: 0 },
            status: 'active',
        };
        setServices(prev => [newService, ...prev]);
        return newService;
    };

    const confirmDelivery = (contractId) => {
        setActiveContracts(prev =>
            prev.map(c => c.id === contractId ? { ...c, status: 'completed' } : c)
        );
    };

    const openDispute = (contractId, reason, description) => {
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
