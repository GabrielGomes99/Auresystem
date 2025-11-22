// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll indicator counter
const scrollIndicator = document.querySelector('.scroll-indicator');
const scrollNumber = document.querySelector('.scroll-number');
const projectsSection = document.querySelector('#projects');

function updateScrollIndicator() {
    if (!scrollIndicator || !scrollNumber || !projectsSection) return;

    const scrollPosition = window.pageYOffset;
    const projectsPosition = projectsSection.offsetTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calculate scroll progress to projects section
    const progress = Math.min(
        Math.max((scrollPosition / (projectsPosition - windowHeight)) * 100, 0),
        100
    );
    
    scrollNumber.textContent = Math.round(progress);
}

window.addEventListener('scroll', updateScrollIndicator);
updateScrollIndicator();

// FAQ Toggle
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        header.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
    } else {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        header.style.borderBottomColor = 'transparent';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.project-card, .service-card, .testimonial-card, .process-step, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Initialize EmailJS when page loads
// IMPORTANTE: Substitua 'YOUR_PUBLIC_KEY' pela sua chave pública do EmailJS
// Você pode obter em: https://dashboard.emailjs.com/admin/integration
window.addEventListener('load', () => {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("sTdxCcqcJb2jttQge");
    }
    
    // Initialize stats counter animation
    initStatsCounter();
    
    // Initialize back to top button
    initBackToTop();
});

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format number with + for percentages and hours
        const text = element.parentElement.querySelector('.stat-label').textContent;
        if (text.includes('%')) {
            element.textContent = Math.floor(current) + '%';
        } else if (text.includes('24/7')) {
            element.textContent = Math.floor(current) + 'h';
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// Back to Top Button Functionality
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (!backToTopButton) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Form submission handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Get submit button to show loading state
        const submitButton = contactForm.querySelector('.btn-submit');
        const originalButtonText = submitButton.textContent;
        
        try {
            // Show loading state
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;
            
            // Send email to owner (you) with form data
            await emailjs.send(
                'service_2rdwqme',  // Service ID do EmailJS
                'template_8mq4gtk', // Template ID do EmailJS - Email para você
                {
                    from_name: data.name,
                    from_email: data.email,
                    project_type: data.project,
                    message: data.message,
                    to_email: '1dev.gabrielgomes@gmail.com' // Seu email de destino
                }
            );
            
            // Success message
            alert('Obrigado pelo seu interesse! Entrarei em contato em breve.');
            
            // Reset form
            contactForm.reset();
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            alert('Ops! Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou entre em contato diretamente pelo email: 1dev.gabrielgomes@gmail.com');
        } finally {
            // Restore button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// Parallax effect for hero shapes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        shape.style.transform = `translateY(${yPos}px)`;
    });
});

// Mobile menu toggle (if needed in future)
function initMobileMenu() {
    const nav = document.querySelector('.nav');
    if (window.innerWidth <= 768) {
        // Add mobile menu functionality if needed
    }
}

window.addEventListener('resize', initMobileMenu);
initMobileMenu();

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a');

function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// Add active class styles
const style = document.createElement('style');
style.textContent = `
    .nav a.active {
        color: var(--text-primary) !important;
    }
`;
document.head.appendChild(style);

// Smooth reveal animation on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Service card hover effect - handled by CSS

// Project Modal
const projectModal = document.getElementById('projectModal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');
const modalTitle = document.querySelector('.modal-title');
const modalText = document.querySelector('.modal-text');
const galleryGrid = document.querySelector('.gallery-grid');

// Project data
const projectsData = {
    transferegov: {
        title: 'Painel TransfereGov',
        description: 'O Painel Transferegov.br disponibiliza, de forma intuitiva, flexível e ágil, informações sobre os Módulos Discricionárias e Legais, Especiais, Fundo a Fundo e Termo de Execução Descentralizada (TED). A ferramenta foi desenvolvida para promover transparência e apoiar a gestão das transferências realizadas pela União.',
        link: 'https://dd-publico.serpro.gov.br/extensions/ted/ted.html',
        technologies: [
            { name: 'Qlik Sense', icon: '📊', category: 'Business Intelligence' },
            { name: 'Dev Hub', icon: '🛠️', category: 'Desenvolvimento' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'Database' },
            { name: 'Impala', icon: '🗄️', category: 'Big Data' },
            { name: 'Hive', icon: '🐝', category: 'Data Warehouse' },
            { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'Frontend' },
            { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'Frontend' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'Frontend' },
            { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'DevOps' },
            { name: 'QVF Files', icon: '📁', category: 'Arquivos de Dados' },
            { name: 'APIs Públicas', icon: '🔗', category: 'Integração Ministerial' }
        ],
        images: [
            { src: 'background/paineis/logo_ted.png', title: 'Logo TransfereGov', description: 'Painel de transparência para transferências da União com dados em tempo real' }
        ]
    },
    parcerias: {
        title: 'Painel Parcerias',
        description: 'O Painel Parcerias apresenta, de forma simples e transparente, as informações sobre as parcerias firmadas por órgãos públicos por meio da Plataforma Transferegov.br, utilizando o Módulo Gestão de Parcerias. O painel foi desenvolvido para facilitar o acompanhamento e a compreensão das propostas até a completa execução da Parceria, promovendo mais transparência.',
        link: 'https://dd-publico.serpro.gov.br/extensions/gestao-de-parcerias/gestao-de-parcerias.html',
        technologies: [
            { name: 'Qlik Sense', icon: '📊', category: 'Business Intelligence' },
            { name: 'Dev Hub', icon: '🛠️', category: 'Desenvolvimento' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'Database' },
            { name: 'Impala', icon: '🗄️', category: 'Big Data' },
            { name: 'Hive', icon: '🐝', category: 'Data Warehouse' },
            { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'Frontend' },
            { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'Frontend' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'Frontend' },
            { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'DevOps' },
            { name: 'QVF Files', icon: '📁', category: 'Arquivos de Dados' },
            { name: 'APIs Públicas', icon: '🔗', category: 'Integração Ministerial' }
        ],
        images: [
            { src: 'background/paineis/logo-gestao.png', title: 'Logo Gestão de Parcerias', description: 'Painel para acompanhamento de parcerias governamentais com transparência total' }
        ]
    },
    obrasgov: {
        title: 'Painel ObrasGov.br',
        description: 'Acesse informações gerenciais dos investimentos em infraestrutura (projetos, estudos e obras) executadas com recursos do orçamento fiscal e da seguridade social do poder executivo federal. É possível consultar as seguintes informações: localização, valores, prazos, dados de licitações e contratos, entre outras.',
        link: 'https://dd-publico.serpro.gov.br/extensions/cipi/cipi.html',
        technologies: [
            { name: 'Qlik Sense', icon: '📊', category: 'Business Intelligence' },
            { name: 'Dev Hub', icon: '🛠️', category: 'Desenvolvimento' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'Database' },
            { name: 'Impala', icon: '🗄️', category: 'Big Data' },
            { name: 'Hive', icon: '🐝', category: 'Data Warehouse' },
            { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'Frontend' },
            { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'Frontend' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'Frontend' },
            { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'DevOps' },
            { name: 'QVF Files', icon: '📁', category: 'Arquivos de Dados' },
            { name: 'APIs Públicas', icon: '🔗', category: 'Integração Ministerial' }
        ],
        images: [
            { src: 'background/paineis/logo_cipi.png', title: 'Logo ObrasGov', description: 'Painel de acompanhamento de obras e infraestrutura federal com dados georreferenciados' }
        ]
    },
    cidadao: {
        title: 'Painel Cidadão em Ação',
        description: 'Acesse informações gerenciais dos investimentos em infraestrutura (projetos, estudos e obras) executadas com recursos do orçamento fiscal e da seguridade social do poder executivo federal. É possível consultar as seguintes informações: localização, valores, prazos, dados de licitações e contratos, entre outras.',
        link: 'https://dd-publico.serpro.gov.br/extensions/cidadao-acao/cidadao-acao.html',
        technologies: [
            { name: 'Qlik Sense', icon: '📊', category: 'Business Intelligence' },
            { name: 'Dev Hub', icon: '🛠️', category: 'Desenvolvimento' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'Database' },
            { name: 'Impala', icon: '🗄️', category: 'Big Data' },
            { name: 'Hive', icon: '🐝', category: 'Data Warehouse' },
            { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'Frontend' },
            { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'Frontend' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'Frontend' },
            { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'DevOps' },
            { name: 'QVF Files', icon: '📁', category: 'Arquivos de Dados' },
            { name: 'APIs Públicas', icon: '🔗', category: 'Integração Ministerial' }
        ],
        images: [
            { src: 'background/paineis/Painel Cidadão em Ação.png', title: 'Logo Cidadão em Ação', description: 'Painel de transparência para acompanhamento cidadão de investimentos públicos' }
        ]
    },
    especiais: {
        title: 'Painel Especiais',
        description: 'Acesse informações gerenciais dos investimentos em infraestrutura (projetos, estudos e obras) executadas com recursos do orçamento fiscal e da seguridade social do poder executivo federal. É possível consultar as seguintes informações: localização, valores, prazos, dados de licitações e contratos, entre outras.',
        link: 'https://dd-publico.serpro.gov.br/extensions/especiais/especiais.html',
        technologies: [
            { name: 'Qlik Sense', icon: '📊', category: 'Business Intelligence' },
            { name: 'Dev Hub', icon: '🛠️', category: 'Desenvolvimento' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'Database' },
            { name: 'Impala', icon: '🗄️', category: 'Big Data' },
            { name: 'Hive', icon: '🐝', category: 'Data Warehouse' },
            { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'Frontend' },
            { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'Frontend' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'Frontend' },
            { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'DevOps' },
            { name: 'QVF Files', icon: '📁', category: 'Arquivos de Dados' },
            { name: 'APIs Públicas', icon: '🔗', category: 'Integração Ministerial' }
        ],
        images: [
            { src: 'background/paineis/logo_painel_especial.png', title: 'Logo Painel Especiais', description: 'Painel de transferências especiais com dashboards interativos e relatórios' }
        ]
    },
    discricionarias: {
        title: 'Painel Transferências Discricionárias e Legais',
        description: 'Acesse o Painel de Indicadores que permite o acompanhamento contínuo do desempenho na gestão dos recursos pelos recebedores e repassadores dos instrumentos de transferências Discricionárias e Legais, operacionalizados por meio do Transferegov.br.',
        link: 'https://dd-publico.serpro.gov.br/extensions/transferencias-discricionarias-e-legais/transferencias-discricionarias-e-legais.html',
        technologies: [
            { name: 'Qlik Sense', icon: '📊', category: 'Business Intelligence' },
            { name: 'Dev Hub', icon: '🛠️', category: 'Desenvolvimento' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'Database' },
            { name: 'Impala', icon: '🗄️', category: 'Big Data' },
            { name: 'Hive', icon: '🐝', category: 'Data Warehouse' },
            { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'Frontend' },
            { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'Frontend' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'Frontend' },
            { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'DevOps' },
            { name: 'QVF Files', icon: '📁', category: 'Arquivos de Dados' },
            { name: 'APIs Públicas', icon: '🔗', category: 'Integração Ministerial' }
        ],
        images: [
            { src: 'background/paineis/logo_discricionarias_legais.png', title: 'Logo Discricionárias e Legais', description: 'Painel de indicadores para gestão de transferências discricionárias e legais' }
        ]
    },
    imoveis: {
        title: 'Gerenciamento de Imóveis e Aluguéis',
        description: 'Sistema completo desenvolvido para gestão de imóveis, contratos de aluguel e controle de inquilinos. O sistema permite cadastrar propriedades, gerenciar contratos, controlar pagamentos, gerar relatórios financeiros e acompanhar a manutenção dos imóveis. Desenvolvido com tecnologias modernas para garantir segurança, performance e facilidade de uso.',
        technologies: [
            { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', category: 'Frontend' },
            { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', category: 'Backend' },
            { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'Database' },
            { name: 'Jest', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg', category: 'Testing' },
            { name: 'ClickSign API', icon: '📝', category: 'Assinatura Eletrônica' },
            { name: 'API CEP', icon: '📍', category: 'Consulta de Endereço' },
            { name: 'API Gov CPF', icon: '🆔', category: 'Validação de CPF' },
            { name: 'PIX QR Code', icon: '💳', category: 'Pagamentos' },
            { name: 'Google Agenda', icon: '📅', category: 'Agendamentos' }
        ],
        images: [
            { src: 'background/sistema_gestao_imoveis/tela_login.png', title: 'Tela de Login', description: 'Sistema de autenticação seguro para acesso ao sistema de gestão imobiliária' },
            { src: 'background/sistema_gestao_imoveis/tela_dashboard.png', title: 'Dashboard Principal', description: 'Visão geral completa com indicadores de imóveis, contratos ativos e receitas mensais' },
            { src: 'background/sistema_gestao_imoveis/tela_cadastro.png', title: 'Cadastro de Imóveis', description: 'Interface para cadastro detalhado de propriedades com fotos, características e documentação' },
            { src: 'background/sistema_gestao_imoveis/tela_imoveis.png', title: 'Gestão de Imóveis', description: 'Listagem e gerenciamento completo do portfólio de imóveis com filtros e busca avançada' },
            { src: 'background/sistema_gestao_imoveis/tela_locatarios.png', title: 'Gestão de Locatários', description: 'Controle completo de inquilinos com dados pessoais, histórico e status dos contratos' },
            { src: 'background/sistema_gestao_imoveis/tela_contrato.png', title: 'Contratos de Locação', description: 'Gerenciamento de contratos com prazos, valores, reajustes e renovações automáticas' },
            { src: 'background/sistema_gestao_imoveis/tela_renda.png', title: 'Controle de Rendas', description: 'Acompanhamento de pagamentos, inadimplência e relatórios financeiros detalhados' },
            { src: 'background/sistema_gestao_imoveis/tela_vistoria.png', title: 'Sistema de Vistoria', description: 'Registro digital de vistorias com fotos, observações e relatórios de entrada e saída' },
            { src: 'background/sistema_gestao_imoveis/tela_documentos.png', title: 'Gestão de Documentos', description: 'Armazenamento e organização digital de contratos, comprovantes e documentação legal' },
            { src: 'background/sistema_gestao_imoveis/tela_pix.png', title: 'Integração PIX', description: 'Sistema de pagamentos integrado com PIX para facilitar recebimentos e transferências' }
        ]
    },
    papelaria: {
        title: 'Sistema Financeiro para Papelaria',
        description: 'Sistema financeiro personalizado desenvolvido especificamente para papelarias. Inclui controle de estoque, gestão de vendas, controle de fornecedores, relatórios financeiros detalhados e integração com sistemas de pagamento. A solução foi desenvolvida para otimizar os processos financeiros e operacionais da papelaria, proporcionando maior controle e eficiência.',
        technologies: [
            { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', category: 'Backend' },
            { name: 'Tkinter', icon: '🖼️', category: 'Interface Gráfica' },
            { name: 'PyArmor', icon: '🔒', category: 'Segurança' },
            { name: 'Pillow', icon: '🖼️', category: 'Processamento de Imagens' },
            { name: 'Pandas', icon: '📊', category: 'Análise de Dados' },
            { name: 'PDF/Excel', icon: '📄', category: 'Relatórios' }
        ],
        images: [
            { src: 'background/sistema_papelaria/papelaria-login.png', title: 'Tela de Login', description: 'Sistema de autenticação com login tradicional e QR Code para acesso rápido e seguro' },
            { src: 'background/sistema_papelaria/papelaria-dashboard.png', title: 'Dashboard Principal', description: 'Visão geral dos indicadores financeiros com total de vendas, dívidas, saldo e próximas despesas' },
            { src: 'background/sistema_papelaria/papelaria-gestao.png', title: 'Análise Gerencial', description: 'Gráficos comparativos de vendas vs despesas e indicadores financeiros detalhados' },
            { src: 'background/sistema_papelaria/papelaria-vendas.png', title: 'Gestão de Vendas', description: 'Controle completo das vendas diárias com opções para adicionar e excluir transações' },
            { src: 'background/sistema_papelaria/papelaria-despesas.png', title: 'Controle de Despesas', description: 'Gerenciamento de despesas com status de pagamento, parcelas e datas de vencimento' },
            { src: 'background/sistema_papelaria/papelaria-config.png', title: 'Configurações', description: 'Configuração de notificações WhatsApp e outras funcionalidades do sistema' }
        ]
    },
    atletas: {
        title: 'Gerenciamento de Atletas',
        description: 'Sistema completo de gestão desenvolvido para institutos esportivos gerenciarem seus atletas. O sistema permite cadastrar atletas, acompanhar desempenho, gerenciar treinos, controlar pagamentos de mensalidades, gerar relatórios de evolução e comunicação com atletas e responsáveis. Desenvolvido para facilitar a administração e acompanhamento do desenvolvimento esportivo.',
        technologies: [
            { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', category: 'Backend' },
            { name: 'Tkinter', icon: '🖼️', category: 'Interface Gráfica' },
            { name: 'PyArmor', icon: '🔒', category: 'Segurança' },
            { name: 'Pillow', icon: '🖼️', category: 'Processamento de Imagens' },
            { name: 'Pandas', icon: '📊', category: 'Análise de Dados' },
            { name: 'PDF/Excel', icon: '📄', category: 'Relatórios' }
        ],
        images: [
            { src: 'background/sistema_atletas/carteirinha.png', title: 'Carteirinha do Atleta', description: 'Carteirinha digital personalizada com foto, dados do atleta e informações da modalidade esportiva' },
            { src: 'background/sistema_atletas/tela_carteirinha.png', title: 'Geração de Carteirinha', description: 'Interface para criação e personalização das carteirinhas dos atletas com layout profissional' },
            { src: 'background/sistema_atletas/tela_inicial.png', title: 'Dashboard Principal', description: 'Tela inicial com visão geral dos atletas cadastrados, estatísticas e acesso rápido às principais funcionalidades' },
            { src: 'background/sistema_atletas/tela_gerenciamento.png', title: 'Gerenciamento de Atletas', description: 'Interface completa para cadastro, edição e acompanhamento dos dados dos atletas e suas modalidades' },
            { src: 'background/sistema_atletas/tela_contribuicoes.png', title: 'Controle de Contribuições', description: 'Sistema de gestão financeira para controle de mensalidades, pagamentos e histórico de contribuições dos atletas' }
        ]
    },
    corretora: {
        title: 'Corretora de Seguros',
        description: 'Website institucional desenvolvido para corretora de seguros, apresentando os serviços oferecidos, tipos de seguros disponíveis, informações sobre a empresa e formas de contato. O site foi desenvolvido com foco em conversão, usabilidade e design moderno para atrair e converter visitantes em clientes.',
        technologies: [
            { name: 'HTML5', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'Frontend' },
            { name: 'CSS3', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'Frontend' },
            { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'Frontend' },
            { name: 'Responsive Design', icon: '📱', category: 'Design' },
            { name: 'SEO', icon: '🔍', category: 'Otimização' }
        ],
        images: [
            { src: 'background/corretora_seguros/corretora.png', title: 'Homepage', description: 'Página inicial do site da corretora com design moderno e informações principais' },
            { src: 'background/corretora_seguros/corretora_tela.png', title: 'Interface do Site', description: 'Interface completa do website com navegação e seções de serviços' }
        ]
    }
};

// Open modal function
function openProjectModal(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    modalTitle.textContent = project.title;
    modalText.textContent = project.description;

    // Add link button if available
    const modalHeader = document.querySelector('.modal-header');
    
    // Remove existing link button if any
    const existingLink = modalHeader.querySelector('.modal-link-btn');
    if (existingLink) {
        existingLink.remove();
    }
    
    if (project.link) {
        const linkButton = document.createElement('a');
        linkButton.href = project.link;
        linkButton.target = '_blank';
        linkButton.rel = 'noopener noreferrer';
        linkButton.className = 'modal-link-btn';
        linkButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Acessar Painel
        `;
        modalHeader.appendChild(linkButton);
    }

    // Add technologies section if available
    const modalDescription = document.querySelector('.modal-description');
    
    // Remove existing tech section if any
    const existingTech = document.querySelector('.modal-technologies');
    if (existingTech) {
        existingTech.remove();
    }
    
    if (project.technologies && project.technologies.length > 0) {
        const techSection = document.createElement('div');
        techSection.className = 'modal-technologies';
        
        const techTitle = document.createElement('h4');
        techTitle.textContent = 'Tecnologias Utilizadas';
        techTitle.className = 'tech-section-title';
        techSection.appendChild(techTitle);
        
        const techGrid = document.createElement('div');
        techGrid.className = 'tech-tags-grid';
        
        project.technologies.forEach(tech => {
            const techTag = document.createElement('div');
            techTag.className = 'tech-tag-item';
            
            const techIcon = document.createElement('div');
            techIcon.className = 'tech-tag-icon';
            
            if (tech.icon.startsWith('http')) {
                const img = document.createElement('img');
                img.src = tech.icon;
                img.alt = tech.name;
                img.loading = 'lazy';
                img.decoding = 'async';
                img.fetchPriority = 'low';
                techIcon.appendChild(img);
            } else {
                techIcon.textContent = tech.icon;
            }
            
            const techInfo = document.createElement('div');
            techInfo.className = 'tech-tag-info';
            
            const techName = document.createElement('span');
            techName.className = 'tech-tag-name';
            techName.textContent = tech.name;
            
            const techCategory = document.createElement('span');
            techCategory.className = 'tech-tag-category';
            techCategory.textContent = tech.category;
            
            techInfo.appendChild(techName);
            techInfo.appendChild(techCategory);
            
            techTag.appendChild(techIcon);
            techTag.appendChild(techInfo);
            techGrid.appendChild(techTag);
        });
        
        techSection.appendChild(techGrid);
        modalDescription.appendChild(techSection);
    }

    // Clear and populate gallery (only for private projects with multiple images)
    galleryGrid.innerHTML = '';
    const modalGallery = document.querySelector('.modal-gallery');
    
    if (project.images && project.images.length > 1) {
        // Show gallery for private projects with multiple images
        modalGallery.style.display = 'block';
        
        project.images.forEach((imageData, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            const imageSrc = typeof imageData === 'string' ? imageData : imageData.src;
            const imageTitle = typeof imageData === 'object' ? imageData.title : `Imagem ${index + 1}`;
            const imageDescription = typeof imageData === 'object' ? imageData.description : '';
            
            img.src = imageSrc;
            img.alt = imageTitle;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.style.cursor = 'pointer';
            
            // Add click event to open image modal
            galleryItem.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent modal from closing
                openImageModal(imageSrc, imageTitle, imageDescription);
            });
            
            galleryItem.appendChild(img);
            galleryGrid.appendChild(galleryItem);
        });
    } else {
        // Hide gallery for Gov.br panels (single logo image)
        modalGallery.style.display = 'none';
    }

    // Show modal
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal function
function closeProjectModal() {
    projectModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Image modal functions
function openImageModal(imageSrc, title, description) {
    // Create image modal if it doesn't exist
    let imageModal = document.getElementById('imageModal');
    if (!imageModal) {
        imageModal = document.createElement('div');
        imageModal.id = 'imageModal';
        imageModal.innerHTML = `
            <div class="image-modal-overlay"></div>
            <div class="image-modal-content">
                <button class="image-modal-close" aria-label="Fechar">&times;</button>
                <div class="image-modal-header">
                    <h3 class="image-modal-title"></h3>
                </div>
                <div class="image-modal-body">
                    <img class="image-modal-img" alt="">
                    <p class="image-modal-description"></p>
                </div>
            </div>
        `;
        document.body.appendChild(imageModal);
        
        // Add event listeners
        const closeBtn = imageModal.querySelector('.image-modal-close');
        const overlay = imageModal.querySelector('.image-modal-overlay');
        
        closeBtn.addEventListener('click', closeImageModal);
        overlay.addEventListener('click', closeImageModal);
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageModal.classList.contains('active')) {
                closeImageModal();
            }
        });
    }
    
    // Update modal content
    const modalTitle = imageModal.querySelector('.image-modal-title');
    const modalImg = imageModal.querySelector('.image-modal-img');
    const modalDescription = imageModal.querySelector('.image-modal-description');
    
    modalTitle.textContent = title;
    modalImg.src = imageSrc;
    modalImg.alt = title;
    modalDescription.textContent = description;
    
    // Show modal
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Event listeners for project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function() {
        const projectId = this.getAttribute('data-project');
        if (projectId) {
            openProjectModal(projectId);
        }
    });
});

// Close modal events
if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeProjectModal);
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeProjectModal();
    }
});

// Horizontal scroll indicators for mobile menu
function initNavScrollIndicators() {
    const nav = document.querySelector('.nav');
    const navWrapper = document.querySelector('.nav-wrapper');
    
    if (!nav || !navWrapper) return;
    
    function updateScrollIndicators() {
        const isScrollable = nav.scrollWidth > nav.clientWidth;
        const scrollLeft = nav.scrollLeft;
        const scrollRight = nav.scrollWidth - nav.clientWidth - scrollLeft;
        
        // Remove all classes first
        navWrapper.classList.remove('scrolled-left', 'scrolled-right', 'scrolled-both');
        
        if (!isScrollable) {
            return; // No scroll needed
        }
        
        // Update gradient indicators
        if (scrollLeft <= 5 && scrollRight > 5) {
            // At the start, show right indicator
            navWrapper.classList.add('scrolled-right');
        } else if (scrollLeft > 5 && scrollRight <= 5) {
            // At the end, show left indicator
            navWrapper.classList.add('scrolled-left');
        } else if (scrollLeft > 5 && scrollRight > 5) {
            // In the middle, show both
            navWrapper.classList.add('scrolled-both');
        }
    }
    
    // Check on load and resize
    updateScrollIndicators();
    window.addEventListener('resize', updateScrollIndicators);
    
    // Update on scroll
    nav.addEventListener('scroll', updateScrollIndicators);
    
    // Initial check after a short delay to ensure layout is ready
    setTimeout(updateScrollIndicators, 100);
}

// Initialize nav scroll indicators when page loads
window.addEventListener('load', initNavScrollIndicators);

