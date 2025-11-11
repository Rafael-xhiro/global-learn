// Toggle Sidebar en dispositivos móviles
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Cerrar sidebar al hacer clic fuera (móviles)
        document.addEventListener('click', function(event) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickOnToggle && window.innerWidth <= 992) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Animaciones de entrada
function initAnimaciones() {
    // Animar tarjetas de estadísticas
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animar tarjetas de curso
    const cursoCards = document.querySelectorAll('.curso-card, .curso-card-dash');
    cursoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animar tarjetas de contenido
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, index * 150);
    });
}

// MATRÍCULA Y PAGO

// Datos de los cursos
const cursos = {
    1: {
        nombre: 'Scratch - Mis Primeros Juegos',
        precio: 237,
        precioOriginal: 279,
        descuento: 42
    },
    2: {
        nombre: 'Python Divertido',
        precio: 287,
        precioOriginal: 339,
        descuento: 52
    },
    3: {
        nombre: 'Crea tu Página Web',
        precio: 267,
        precioOriginal: 319,
        descuento: 52
    },
    4: {
        nombre: 'Desarrollo de Videojuegos 2D',
        precio: 337,
        precioOriginal: 399,
        descuento: 62
    }
};

// Variable global para el curso seleccionado
let cursoSeleccionado = null;

// Seleccionar curso
function seleccionarCurso(idCurso) {
    cursoSeleccionado = idCurso;
    
    // Remover selección previa
    document.querySelectorAll('.curso-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Marcar el curso seleccionado
    const cardSeleccionada = document.querySelector(`.curso-card[data-curso="${idCurso}"]`);
    if (cardSeleccionada) {
        cardSeleccionada.classList.add('selected');
    }
    
    // Actualizar resumen
    actualizarResumen(idCurso);
    
    // Ir al paso 2
    setTimeout(() => {
        siguientePaso(2);
    }, 500);
}

// Actualizar resumen de compra
function actualizarResumen(idCurso) {
    const curso = cursos[idCurso];
    
    const nombreCurso = document.getElementById('nombre-curso-resumen');
    const subtotal = document.getElementById('subtotal');
    const descuento = document.getElementById('descuento');
    const total = document.getElementById('total');
    const montoYape = document.getElementById('monto-yape');
    
    if (nombreCurso) nombreCurso.textContent = curso.nombre;
    if (subtotal) subtotal.textContent = `s/ ${curso.precioOriginal}`;
    if (descuento) descuento.textContent = `- s/ ${curso.descuento}`;
    if (total) total.textContent = `s/ ${curso.precio}`;
    if (montoYape) montoYape.textContent = `s/ ${curso.precio}`;
}

// Navegar entre pasos
function siguientePaso(paso) {
    // Validaciones
    if (paso === 2 && !cursoSeleccionado) {
        alert('Por favor, selecciona un curso primero.');
        return;
    }
    
    if (paso === 3) {
        const form = document.getElementById('formDatos');
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    
    // Ocultar todos los pasos
    document.querySelectorAll('.paso-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Mostrar paso actual
    const pasoActual = document.getElementById(`paso${paso}`);
    if (pasoActual) {
        pasoActual.style.display = 'block';
    }
    
    // Actualizar indicadores
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    const stepActual = document.getElementById(`step${paso}`);
    if (stepActual) {
        stepActual.classList.add('active');
    }
    
    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Volver al paso anterior
function volverPaso(paso) {
    siguientePaso(paso);
}

// Seleccionar método de pago
function seleccionarMetodo(metodo) {
    // Remover selección previa
    document.querySelectorAll('.metodo-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Ocultar todos los formularios
    const formTarjeta = document.getElementById('form-tarjeta');
    const formYape = document.getElementById('form-yape');
    
    if (formTarjeta) formTarjeta.style.display = 'none';
    if (formYape) formYape.style.display = 'none';
    
    // Mostrar formulario seleccionado
    if (metodo === 'tarjeta' && formTarjeta) {
        formTarjeta.style.display = 'block';
        const metodoCards = document.querySelectorAll('.metodo-card');
        if (metodoCards[0]) metodoCards[0].classList.add('selected');
    } else if (metodo === 'yape' && formYape) {
        formYape.style.display = 'block';
        const metodoCards = document.querySelectorAll('.metodo-card');
        if (metodoCards[1]) metodoCards[1].classList.add('selected');
    }
    
    // Scroll al formulario
    setTimeout(() => {
        const formVisible = metodo === 'tarjeta' ? formTarjeta : formYape;
        if (formVisible) {
            formVisible.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}

// Confirmar pago
function confirmarPago() {
    const modalElement = document.getElementById('modalConfirmacion');
    if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// ==========================================
// FORMATEO DE INPUTS
// ==========================================

// Formatear número de tarjeta
function formatearNumeroTarjeta(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
}

// Formatear fecha (MM/AA)
function formatearFechaVencimiento(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
}

// Solo números
function soloNumeros(input) {
    input.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// ==========================================
// INICIALIZACIÓN DE LA PÁGINA
// ==========================================

function initMatricula() {
    // Form de tarjeta
    const formTarjeta = document.querySelector('#form-tarjeta form');
    if (formTarjeta) {
        formTarjeta.addEventListener('submit', function(e) {
            e.preventDefault();
            confirmarPago();
        });
    }
    
    // Formateo de inputs
    const inputTarjeta = document.querySelector('#form-tarjeta input[maxlength="19"]');
    if (inputTarjeta) formatearNumeroTarjeta(inputTarjeta);
    
    const inputFecha = document.querySelector('#form-tarjeta input[placeholder="MM/AA"]');
    if (inputFecha) formatearFechaVencimiento(inputFecha);
    
    const inputCVV = document.querySelector('#form-tarjeta input[maxlength="3"]');
    if (inputCVV) soloNumeros(inputCVV);
}

// ==========================================
// NAVBAR SCROLL EFFECT (Para Landing Page)
// ==========================================

function initNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// ==========================================
// EJECUTAR AL CARGAR LA PÁGINA
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes comunes
    initSidebar();
    initAnimaciones();
    
    // Inicializar matrícula si existe
    if (document.getElementById('paso1')) {
        initMatricula();
    }
});