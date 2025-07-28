// ===== SOLARIUM ECO - SCRIPT COMPLETO E CORRIGIDO COM MODAL DETALHADO =====

const CONFIG = {
    animationDuration: 500,
    galleryItemsPerView: 3,
    galleryItemsPerViewMobile: 1,
    galleryItemsPerViewTablet: 2,
    breakpoints: {
        mobile: 768,
        tablet: 1024
    }
};

const AppState = {
    currentSection: 'inicio',
    galleryCurrentIndex: 0,
    galleryTotalItems: 0,
    modalCurrentSlide: 0,
    isMobile: false,
    isTablet: false
};

document.addEventListener('DOMContentLoaded', () => {
    detectDevice();
    initNavigation();
    initGallery();
    initModal();
    initForm();
    initScrollAnimations();
    initMobileMenu(); 

    window.addEventListener('resize', () => {
        detectDevice();
        updateGalleryLayout();
    });
});

function detectDevice() {
    const width = window.innerWidth;
    AppState.isMobile = width < CONFIG.breakpoints.mobile;
    AppState.isTablet = width >= CONFIG.breakpoints.mobile && width < CONFIG.breakpoints.tablet;
    document.body.classList.toggle('is-mobile', AppState.isMobile);
    document.body.classList.toggle('is-tablet', AppState.isTablet);
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const sectionId = href.substring(1);
                navigateToSection(sectionId);
            }
        });
    });

    const initialSection = window.location.hash ? window.location.hash.substring(1) : 'inicio';
    navigateToSection(initialSection);
}

function navigateToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    target.classList.remove('hidden');
    target.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    history.pushState({}, '', `#${sectionId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (sectionId === 'galeria') updateGalleryLayout();
    if (sectionId === 'contato') focusFirstFormField();
}

function initGallery() {
    const track = document.getElementById('gallery-track');
    const items = document.querySelectorAll('.gallery-item');
    const prev = document.querySelector('.gallery-prev');
    const next = document.querySelector('.gallery-next');

    if (!track || items.length === 0) return;
    AppState.galleryTotalItems = items.length;

    prev?.addEventListener('click', () => moveGallery('prev'));
    next?.addEventListener('click', () => moveGallery('next'));

    items.forEach((item, i) => {
        item.addEventListener('click', () => openModal(i));
    });

    updateGalleryLayout();
}

function getItemsPerView() {
    if (AppState.isMobile) return CONFIG.galleryItemsPerViewMobile;
    if (AppState.isTablet) return CONFIG.galleryItemsPerViewTablet;
    return CONFIG.galleryItemsPerView;
}

function moveGallery(dir) {
    const itemsPerView = getItemsPerView();
    const max = Math.max(0, AppState.galleryTotalItems - itemsPerView);
    AppState.galleryCurrentIndex = Math.max(0, Math.min(AppState.galleryCurrentIndex + (dir === 'next' ? 1 : -1), max));
    updateGalleryLayout();
}

function updateGalleryLayout() {
    const track = document.getElementById('gallery-track');
    if (!track) return;
    const itemsPerView = getItemsPerView();
    const translateX = -(AppState.galleryCurrentIndex * (100 / itemsPerView));
    track.style.transform = `translateX(${translateX}%)`;
}

function initModal() {
    const modal = document.getElementById('gallery-modal');
    const close = document.getElementById('modal-close');
    close?.addEventListener('click', closeModal);
    modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
}

function openModal(index) {
    const modal = document.getElementById('gallery-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

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
        }
    ];

    const projeto = projetos[index % projetos.length];

    content.innerHTML = `
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
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        alert('Mensagem enviada com sucesso!');
        form.reset();
    });
}

function focusFirstFormField() {
    const input = document.querySelector('#contato input');
    if (input) setTimeout(() => input.focus(), 300);
}

function initScrollAnimations() {
    // Scroll animation opcional
}

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menuCloseBtn = document.getElementById('mobile-menu-close');
  const menuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuBtn || !mobileMenu) return;

  // Abrir menu
  menuBtn.addEventListener('click', () => {
    menuOverlay.classList.remove('hidden');
    mobileMenu.classList.remove('hidden');
    
    // Forçar reflow para garantir que as animações funcionem
    void mobileMenu.offsetWidth;
    
    menuOverlay.classList.remove('opacity-0');
    mobileMenu.classList.remove('translate-x-full');
    document.body.classList.add('no-scroll'); // ALTERADO: Adiciona a classe
  });

 // Fechar menu
  const closeMenu = () => {
    menuOverlay.classList.add('opacity-0');
    mobileMenu.classList.add('translate-x-full');
    
    setTimeout(() => {
      menuOverlay.classList.add('hidden');
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('no-scroll'); // NOVA LINHA: Remove a classe
    }, 300);
  };

  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

  // Fechar menu ao clicar em links
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}