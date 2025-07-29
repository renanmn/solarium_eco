// ===== SOLARIUM ECO - SCRIPT COMPLETO E REFACTORIZADO PARA SPA (ABAS/SEÇÕES) =====

const CONFIG = {
    animationDuration: 300, // Duração das transições em ms
    breakpoints: {
        mobile: 768, // Ponto de quebra para dispositivos móveis
        tablet: 1024 // Ponto de quebra para tablets
    },
    // Lista de IDs das suas seções de conteúdo principais e sub-soluções
    contentSections: [
        'inicio', 'galeria', 'solucoes', 'comerciais', 'residenciais', 'industriais', 
        'saiba-mais', 'quem-somos', 'contato'
    ]
};

const AppState = {
    currentActiveSection: 'inicio', // ID da seção atualmente visível
    isMobile: false, // Estado para detectar se é mobile
    isTablet: false, // Estado para detectar se é tablet
    galleryCurrentIndex: 0,
    galleryTotalItems: 0,
};

// --- Funções Auxiliares de Estado ---

// Detecta se o dispositivo é mobile ou tablet
function detectDevice() {
    const width = window.innerWidth;
    AppState.isMobile = width < CONFIG.breakpoints.mobile;
    AppState.isTablet = width >= CONFIG.breakpoints.mobile && width < CONFIG.breakpoints.tablet;
    // Opcional: Adicionar classes ao body para estilos responsivos baseados em JS
    document.body.classList.toggle('is-mobile', AppState.isMobile);
    document.body.classList.toggle('is-tablet', AppState.isTablet);
}

// --- Funções do Menu Mobile ---

// Abre o painel e overlay do menu mobile
function openMobileMenu() {
    const mobileMenuPanel = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuPanel && mobileMenuOverlay) {
        mobileMenuOverlay.classList.remove('hidden', 'opacity-0');
        mobileMenuPanel.classList.remove('hidden', 'translate-x-full');
        
        // Força reflow para garantir que as transições CSS funcionem corretamente
        void mobileMenuPanel.offsetWidth; 

        // Bloqueia a rolagem do corpo e do HTML
        document.body.classList.add('no-scroll');
        document.documentElement.classList.add('no-scroll');
    }
}

// Fecha o painel e overlay do menu mobile
function closeMobileMenu() {
    const mobileMenuPanel = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuPanel && mobileMenuOverlay) {
        mobileMenuOverlay.classList.add('opacity-0');
        mobileMenuPanel.classList.add('translate-x-full');
        
        // Remove as classes hidden e reabilita a rolagem após a transição
        setTimeout(() => {
            mobileMenuOverlay.classList.add('hidden');
            mobileMenuPanel.classList.add('hidden');
            document.body.classList.remove('no-scroll');
            document.documentElement.classList.remove('no-scroll');
        }, CONFIG.animationDuration); // Espera a transição CSS terminar

        // Fecha o submenu de soluções no mobile, se estiver aberto (para a tag <details>)
        const solutionsDetails = document.getElementById('solutions-mobile-details'); 
        if (solutionsDetails && solutionsDetails.open) {
            solutionsDetails.open = false;
        }
    }
}

// Inicializa os event listeners para os botões e overlay do menu mobile
function initMobileMenuEvents() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuCloseBtn = document.getElementById('mobile-menu-close');
    const menuOverlay = document.getElementById('mobile-menu-overlay');

    if (menuBtn) menuBtn.addEventListener('click', openMobileMenu);
    if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMobileMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMobileMenu); 

    // Fechar o menu mobile ao clicar em qualquer link DENTRO do menu
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Fechar o menu mobile se redimensionar para desktop enquanto ele estiver aberto
    window.addEventListener('resize', () => {
        const mobileMenuPanel = document.getElementById('mobile-menu'); // Re-obter para garantir que não seja null
        if (!AppState.isMobile && mobileMenuPanel && !mobileMenuPanel.classList.contains('translate-x-full')) {
            closeMobileMenu();
        }
    });
}

// --- Funções de Navegação SPA ---

// Esconde todas as seções de conteúdo e mostra a alvo
function showSection(targetSectionId) {
    // Itera por todas as seções definidas no CONFIG
    CONFIG.contentSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            if (sectionId === targetSectionId) {
                section.classList.remove('hidden'); // Exibe a seção alvo
                section.classList.add('active'); // Adiciona classe 'active' para estilos (se houver)
            } else {
                section.classList.add('hidden'); // Esconde as outras seções
                section.classList.remove('active'); // Remove classe 'active'
            }
        }
    });
    AppState.currentActiveSection = targetSectionId; // Atualiza o estado da aplicação
    
    // Atualiza a URL no navegador sem recarregar a página (para permitir o uso do botão Voltar/Avançar)
    history.pushState({}, '', `#${targetSectionId}`);

    // Rola para o topo da janela ao mudar de seção (boa prática em SPAs para focar no novo conteúdo)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Atualiza o link ativo no menu (desktop e mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${targetSectionId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Chamadas de funções específicas para cada seção (se necessário)
    if (targetSectionId === 'galeria') updateGalleryLayout();
    if (targetSectionId === 'contato') focusFirstFormField();
}

// Inicializa a navegação para todos os links com a classe 'nav-link'
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link'); 

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Lógica para o menu "Soluções" no desktop: previne o comportamento padrão
            if (href === '#solucoes' && !AppState.isMobile) {
                e.preventDefault(); 
                return; 
            }

            // Só processa links que começam com '#' (links de seção)
            if (href && href.startsWith('#')) {
                e.preventDefault(); 
                
                const targetId = href.substring(1); 

                if (CONFIG.contentSections.includes(targetId)) {
                    showSection(targetId); 
                } else {
                    console.warn(`Navegação SPA: ID "${targetId}" não encontrado ou não está na lista de seções de conteúdo.`);
                }
            }
        });
    });

    const initialSection = window.location.hash ? window.location.hash.substring(1) : 'inicio';
    showSection(initialSection); 

    window.addEventListener('popstate', () => {
        const sectionFromUrl = window.location.hash ? window.location.hash.substring(1) : 'inicio';
        if (CONFIG.contentSections.includes(sectionFromUrl) && sectionFromUrl !== AppState.currentActiveSection) {
            showSection(sectionFromUrl);
        }
    });
}

function initDesktopSolutionsSubmenu() {
    const solutionsParentLi = document.querySelector('nav ul li.group'); 
    const solutionsSubmenu = document.getElementById('solutions-submenu'); 

    if (!solutionsParentLi || !solutionsSubmenu) return;

    solutionsParentLi.addEventListener('mouseenter', () => {
        if (!AppState.isMobile) { 
            solutionsSubmenu.classList.remove('hidden');
        }
    });

    solutionsParentLi.addEventListener('mouseleave', () => {
        if (!AppState.isMobile) { 
            solutionsSubmenu.classList.add('hidden');
        }
    });

    window.addEventListener('resize', () => {
        if (AppState.isMobile) {
            solutionsSubmenu.classList.add('hidden');
        }
    });
}


// --- Funções de Módulos (Re-integradas e Ajustadas) ---

function initGallery() {
    const galleryContainer = document.getElementById('gallery-track');
    const prevButton = document.getElementById('gallery-prev');
    const nextButton = document.getElementById('gallery-next');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (!galleryContainer || galleryItems.length === 0) return;

    AppState.galleryTotalItems = galleryItems.length;

    const getItemsPerView = () => {
        if (AppState.isMobile) return 1;
        if (AppState.isTablet) return 2; 
        return 3;
    };

    const updateGalleryPosition = () => {
        const itemsPerView = getItemsPerView();
        
        // Garante que o índice não exceda os limites, permitindo parar nas extremidades
        AppState.galleryCurrentIndex = Math.max(0, Math.min(AppState.galleryCurrentIndex, AppState.galleryTotalItems - itemsPerView));
        
        // --- NOVO: Calcula a translação em porcentagem para maior precisão ---
        let slidePercentage = 0;
        if (AppState.isMobile) {
            slidePercentage = 100; // 1 item por vez
        } else if (AppState.isTablet) {
            slidePercentage = 100 / 2; // 2 itens por vez
        } else { // Desktop
            slidePercentage = 100 / 3; // 3 itens por vez
        }
        const transformValue = `translateX(${-AppState.galleryCurrentIndex * slidePercentage}%)`;
        
        galleryContainer.style.transform = transformValue;
        
        // --- Usa o atributo 'disabled' para controlar a visibilidade dos botões ---
        if (prevButton) {
            prevButton.disabled = AppState.galleryCurrentIndex === 0;
        }
        if (nextButton) {
            nextButton.disabled = AppState.galleryCurrentIndex >= AppState.galleryTotalItems - itemsPerView;
        }
    };

    const navigateGallery = (direction) => {
        let newIndex = AppState.galleryCurrentIndex + direction;

        // Limita o newIndex para não ir além das extremidades
        const itemsPerView = getItemsPerView();
        newIndex = Math.max(0, Math.min(newIndex, AppState.galleryTotalItems - itemsPerView));
        
        // Se já estiver na extremidade e tentar ir além, não faz nada
        if (newIndex === AppState.galleryCurrentIndex) {
            return; 
        }

        AppState.galleryCurrentIndex = newIndex;
        updateGalleryPosition();
    };

    // Remove event listeners antigos se existirem para evitar duplicação (boa prática)
    if (prevButton) prevButton.removeEventListener('click', () => navigateGallery(-1));
    if (nextButton) nextButton.removeEventListener('click', () => navigateGallery(1));

    if (prevButton) prevButton.addEventListener('click', () => navigateGallery(-1));
    if (nextButton) nextButton.addEventListener('click', () => navigateGallery(1));

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openModal(index));
    });

    updateGalleryPosition(); // Chamar inicialmente para definir a posição e estado dos botões
}

function updateGalleryLayout() {
    initGallery(); // Recalcula e atualiza o layout da galeria (para redimensionamento, etc.)
}

function initModal() {
    const modal = document.getElementById('gallery-modal');
    const closeButton = document.getElementById('modal-close');

    if (!modal) return;

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function openModal(index) {
    const modal = document.getElementById('gallery-modal');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    const projetos = [
        {
            titulo: 'Residencial Monte Verde',
            descricao: 'Sistema de energia solar instalado em telhado de telha cerâmica. Capacidade de 5kWp.',
            imagem: 'imagens/projeto1.jpg'
        },
        {
            titulo: 'Comercial Tech Center',
            descricao: 'Instalação solar para edifício comercial com economia de até 80% na conta.',
            imagem: 'imagens/projeto2.jpg'
        },
        {
            titulo: 'Sítio Santa Luzia',
            descricao: 'Energia solar em zona rural, com baterias para autonomia total.',
            imagem: 'imagens/projeto3.jpg'
        },
        {
            titulo: 'Projeto 4',
            descricao: 'Descrição do projeto 4.',
            imagem: 'imagens/projeto4.jpg'
        },
        {
            titulo: 'Projeto 5',
            descricao: 'Descrição do projeto 5.',
            imagem: 'imagens/projeto5.jpg'
        },
        {
            titulo: 'Projeto 6',
            descricao: 'Descrição do projeto 6.',
            imagem: 'imagens/projeto6.jpg'
        },
    ];

    const projeto = projetos[index % projetos.length]; 

    modalContent.innerHTML = `
        <div class='p-6 text-gray-800'>
            <img src='${projeto.imagem}' alt='${projeto.titulo}' class='w-full h-auto mb-4 rounded'>
            <h2 class='text-2xl font-bold mb-2'>${projeto.titulo}</h2>
            <p class='mb-4'>${projeto.descricao}</p>
            <a href='https://wa.me/5548999999999?text=Olá! Gostaria de mais informações sobre o projeto ${encodeURIComponent(projeto.titulo)}.'
               target='_blank'
               class='inline-block mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded'>
                Falar no WhatsApp
            </a>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll'); 
}

function closeModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
    }
}

function initForm() {
    const form = document.getElementById('contact-form'); 
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
        form.reset();
    });
}

function focusFirstFormField() {
    const input = document.querySelector('#contato input'); 
    if (input) setTimeout(() => input.focus(), 300);
}

function initScrollAnimations() {
    // Seu código de animações de scroll aqui, se houver.
}

// === Evento Principal de Carregamento do DOM ===
document.addEventListener('DOMContentLoaded', () => {
    detectDevice(); 
    initNavigation(); 
    initMobileMenuEvents(); 
    initDesktopSolutionsSubmenu(); 
    initGallery(); 
    initModal(); 
    initForm(); 
    initScrollAnimations(); 

    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    window.addEventListener('resize', () => {
        detectDevice();
        updateGalleryLayout();
    });
});

// === GALERIA DE PROJETOS ===

// Estado da galeria
const GalleryState = {
    currentFilter: 'all',
    visibleProjects: 4,
    projectsData: []
};

// Inicializa a galeria
function initGallery() {
    fetchProjects();
    setupGalleryEvents();
}

// Busca os projetos do JSON
function fetchProjects() {
    fetch('data/projetos.json')
        .then(response => response.json())
        .then(data => {
            GalleryState.projectsData = data.projetos;
            renderProjects();
        })
        .catch(error => {
            console.error('Erro ao carregar projetos:', error);
            document.getElementById('projects-grid').innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-red-500">Não foi possível carregar os projetos. Por favor, tente novamente mais tarde.</p>
                </div>
            `;
        });
}

// Configura os eventos da galeria
function setupGalleryEvents() {
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            GalleryState.currentFilter = button.dataset.filter;
            GalleryState.visibleProjects = 4;
            renderProjects();
        });
    });
    
    // Carregar mais projetos
    document.getElementById('load-more')?.addEventListener('click', () => {
        GalleryState.visibleProjects += 4;
        renderProjects();
    });
    
    // Modal
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
}

// Renderiza os projetos na tela
function renderProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    
    // Filtra os projetos
    const filteredProjects = GalleryState.currentFilter === 'all' 
        ? GalleryState.projectsData 
        : GalleryState.projectsData.filter(project => 
            project.tipo.toLowerCase() === GalleryState.currentFilter);
    
    const projectsToShow = filteredProjects.slice(0, GalleryState.visibleProjects);
    
    // Limpa o grid
    projectsGrid.innerHTML = '';
    
    // Renderiza os projetos
    if (projectsToShow.length === 0) {
        projectsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p>Nenhum projeto encontrado com este filtro.</p>
            </div>
        `;
        document.getElementById('load-more').classList.add('hidden');
    } else {
        projectsToShow.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
        
        // Mostra/oculta botão "Carregar mais"
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            if (filteredProjects.length > GalleryState.visibleProjects) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        }
    }
}

// Cria um card de projeto
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl';
    card.innerHTML = `
        <img src="${project.imagem_principal}" alt="${project.titulo}" 
             class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" 
             loading="lazy">
        <div class="project-overlay absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-end p-6">
            <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 class="text-white text-xl font-bold">${project.titulo}</h3>
                <p class="text-solarium-light">${project.descricao_curta}</p>
                <button class="mt-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-full font-medium hover:bg-yellow-300 transition-colors" 
                        data-project-id="${project.id}">
                    Ver Detalhes
                </button>
            </div>
        </div>
    `;
    
    // Evento para abrir modal
    card.querySelector('button').addEventListener('click', () => openModal(project));
    
    return card;
}

// Abre o modal com detalhes do projeto
function openModal(project) {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="carousel relative">
                <div class="carousel-inner relative overflow-hidden rounded-lg">
                    <div class="carousel-item active">
                        <img src="${project.imagem_principal}" alt="${project.titulo}" 
                             class="w-full h-auto rounded-lg" loading="lazy">
                    </div>
                    ${project.imagens_adicionais.map(img => `
                        <div class="carousel-item">
                            <img src="${img}" alt="${project.titulo}" 
                                 class="w-full h-auto rounded-lg" loading="lazy">
                        </div>
                    `).join('')}
                </div>
                <button class="carousel-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all">
                    <i class="fas fa-chevron-left text-solarium-green"></i>
                </button>
                <button class="carousel-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all">
                    <i class="fas fa-chevron-right text-solarium-green"></i>
                </button>
            </div>
            
            <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-4">${project.titulo}</h2>
                <div class="prose text-gray-700 mb-6">${project.descricao_longa}</div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-solarium-light bg-opacity-20 p-3 rounded-lg">
                        <p class="text-sm text-solarium-green">Potência</p>
                        <p class="font-bold">${project.potencia}</p>
                    </div>
                    <div class="bg-solarium-light bg-opacity-20 p-3 rounded-lg">
                        <p class="text-sm text-solarium-green">Tipo</p>
                        <p class="font-bold">${project.tipo}</p>
                    </div>
                    <div class="bg-solarium-light bg-opacity-20 p-3 rounded-lg">
                        <p class="text-sm text-solarium-green">Data</p>
                        <p class="font-bold">${new Date(project.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                
                <h3 class="font-bold text-lg mb-2">Destaques</h3>
                <ul class="space-y-2 mb-6">
                    ${project.destaques.map(item => `
                        <li class="flex items-center">
                            <span class="text-yellow-400 mr-2">✓</span> ${item}
                        </li>
                    `).join('')}
                </ul>
                
                <a href="${project.whatsapp_link}" 
                   class="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors">
                    <i class="fab fa-whatsapp text-xl mr-2"></i>
                    Solicitar Orçamento
                </a>
            </div>
        </div>
    `;
    
    // Inicializa carrossel
    initCarousel();
    
    // Mostra modal
    document.getElementById('project-modal').classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

// Fecha o modal
function closeModal() {
    document.getElementById('project-modal').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

// Controlador do carrossel no modal
function initCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentIndex = 0;
    
    function showItem(index) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }
    
    prevBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showItem(currentIndex);
    });
    
    nextBtn?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        showItem(currentIndex);
    });
}

// Adicione esta linha no final do evento DOMContentLoaded:
document.addEventListener('DOMContentLoaded', () => {
    // ... código existente ...
    
    // Inicializa a galeria
    if (document.getElementById('galeria')) {
        initGallery();
    }
});