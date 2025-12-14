document.addEventListener('DOMContentLoaded', function() {

function inicializarSistemaDeCalificacion(containerSelector, buttonsSelector, storageKey) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const buttons = container.querySelectorAll(`${buttonsSelector} .star`);
        const msg = container.querySelector('.rating-msg');
        if (!buttons.length || !msg) return;
        const savedRating = parseInt(localStorage.getItem(storageKey)) || 0;

        function highlightButtons(count) {
            buttons.forEach(button => {
                const buttonValue = parseInt(button.dataset.value);
                button.classList.toggle('active', buttonValue <= count);
            });
        }
        function getRatingMessage(value) {
            switch (value) {
                case 1: return '¡Oh! Sentimos no haber cumplido tus expectativas.';
                case 2: return 'Gracias, tomaremos en cuenta tus comentarios.';
                case 3: return '¡Gracias por tu calificación!';
                case 4: return '¡Genial! Nos alegra que te esté gustando.';
                case 5: return '¡Excelente! Gracias por tu increíble apoyo.';
                default: return '';
            }
        }
        if (savedRating > 0) {
            highlightButtons(savedRating);
            msg.textContent = getRatingMessage(savedRating);
        }
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = parseInt(button.dataset.value);
                localStorage.setItem(storageKey, value);
                highlightButtons(value);
                msg.textContent = getRatingMessage(value);
            });
        });
    }

    (function () {
        const body = document.body;
        const cursoIdUnico = body.dataset.courseId; 

        if (cursoIdUnico) {
            const cursoRatingKey = `curso-rating-${cursoIdUnico}`;
            const docenteRatingKey = `docente-rating-${cursoIdUnico}`;

            inicializarSistemaDeCalificacion('.rating', '.stars', cursoRatingKey);
            inicializarSistemaDeCalificacion('.teacher-widget', '.emojis', docenteRatingKey);
        } else {
            console.warn('No se encontró "data-course-id" en el <body>. Las calificaciones no se guardarán por separado.');
        }
    })();


    (function () {
        const headers = document.querySelectorAll('.unidad-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const card = this.closest('.unidad-card');
                if (card.classList.contains('is-locked')) return;
                const body = card.querySelector('.unidad-body');
                card.classList.toggle('is-open');
                if (card.classList.contains('is-open')) {
                    body.style.display = 'block';
                } else {
                    body.style.display = 'none';
                }
            });
        });
    })();

    (function () {
        const modal = document.getElementById('videoModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const videoLinks = document.querySelectorAll('.open-modal-video');
        const player = document.getElementById('youtubePlayer');
        if (!modal || !closeModalBtn || !videoLinks.length || !player) return;

        function openModal(videoId) {
            player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            document.body.classList.add('modal-visible');
        }
        function closeModal() {
            document.body.classList.remove('modal-visible');
            player.src = '';
        }
        videoLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const videoId = this.dataset.videoId;
                openModal(videoId);
            });
        });
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
    })();
    
    const courseProgress = {};
    
    courseProgress.updateCourseState = function() {
        const modulos = document.querySelectorAll('.unidad-card');
        let allPreviousModulesComplete = true;

        modulos.forEach(modulo => {
            const isLocked = modulo.classList.contains('is-locked');
            if (isLocked && allPreviousModulesComplete) {
                this.unlockModule(modulo);
            }
            let leccionesCompletas = 0;
            const lecciones = modulo.querySelectorAll('.lista-lecciones li');
            lecciones.forEach(leccion => {
                const leccionId = leccion.dataset.leccionId;
                if (localStorage.getItem(leccionId) === 'true') {
                    this.completeLeccion(leccion, false);
                    leccionesCompletas++;
                }
            });
            if (lecciones.length > 0 && leccionesCompletas < lecciones.length) {
                allPreviousModulesComplete = false;
            }
        });
        this.updateProgressCircle();
        this.updateNextClassWidget();
    };

    courseProgress.completeLeccion = function(leccion, save = true) {
        const leccionId = leccion.dataset.leccionId;
        const icon = leccion.querySelector('.status-icon');
        if (!icon.classList.contains('completed')) {
            icon.classList.remove('fa-regular', 'fa-circle-play');
            icon.classList.add('fa-solid', 'fa-circle-check', 'completed');
        }
        if (save && leccionId) {
            localStorage.setItem(leccionId, 'true');
            this.updateCourseState();
        }
    };

    courseProgress.unlockModule = function(modulo) {
        modulo.classList.remove('is-locked');
        const mainIcon = modulo.querySelector('.lock-icon');
        if (mainIcon) {
            mainIcon.classList.remove('fa-solid', 'fa-lock', 'lock-icon');
            mainIcon.classList.add('fa-solid', 'fa-chevron-down', 'chevron-icon');
        }
        modulo.querySelectorAll('.lista-lecciones .status-icon').forEach(icon => {
            icon.classList.remove('fa-solid', 'fa-lock');
            icon.classList.add('fa-regular', 'fa-circle-play');
        });
    };

    courseProgress.updateProgressCircle = function() {
        const clasesCompletadas = document.querySelectorAll('.lista-lecciones .status-icon.completed').length;
        const totalClases = document.querySelectorAll('.lista-lecciones li').length;
        const canvas = document.getElementById('progressCircle');
        const progressPercentageText = document.getElementById('progressPercentage');
        const progressSummaryText = document.getElementById('progressSummary');
        if (!canvas || !progressPercentageText || !progressSummaryText) return;
        const ctx = canvas.getContext('2d');
        let percentage = 0;
        if (totalClases > 0) {
            percentage = Math.round((clasesCompletadas / totalClases) * 100);
        }
        progressPercentageText.innerText = `${percentage}%`;
        if (percentage === 100) {
            progressSummaryText.innerText = '¡Felicidades, curso completado!';
        } else if (percentage > 40) {
            progressSummaryText.innerText = 'Vas muy bien, sigue avanzando.';
        } else {
            progressSummaryText.innerText = '¡Sigue así para completar el curso!';
        }
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50;
        const lineWidth = 10;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();
        if (percentage > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, (percentage / 100) * 2 * Math.PI - Math.PI / 2);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = '#00e27f';
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    };

    courseProgress.setupLeccionListeners = function() {
        const lecciones = document.querySelectorAll('.lista-lecciones li');
        lecciones.forEach(leccion => {
            const link = leccion.querySelector('a, label');
            if (link) {
                link.addEventListener('click', (e) => {
                    const modulo = leccion.closest('.unidad-card');
                    if (modulo.classList.contains('is-locked')) {
                        e.preventDefault();
                        return;
                    }
                    this.completeLeccion(leccion);
                });
            }
        });
    };
    
    courseProgress.updateNextClassWidget = function() {
        const allLessons = document.querySelectorAll('.lista-lecciones li');
        const completedLessons = document.querySelectorAll('.lista-lecciones .status-icon.completed');
        const nextClassText = document.getElementById('nextClassName');
        const nextClassButton = document.getElementById('nextClassButton');
        if (!allLessons.length || !nextClassText || !nextClassButton) return;
        const nextLessonIndex = completedLessons.length;
        if (nextLessonIndex < allLessons.length) {
            const nextLessonElement = allLessons[nextLessonIndex];
            const lessonLink = nextLessonElement.querySelector('a, label');
            const lessonText = lessonLink ? lessonLink.textContent.trim() : 'Siguiente Lección';
            nextClassText.textContent = lessonText;
            nextClassButton.innerHTML = 'Empezar Ahora <i class="fa-solid fa-arrow-right"></i>';
            nextClassButton.disabled = false;
            nextClassButton.dataset.nextLessonId = nextLessonElement.dataset.leccionId;
        } else {
            nextClassText.textContent = '¡Felicidades! Has terminado el curso.';
            nextClassButton.innerHTML = 'Curso Completado <i class="fa-solid fa-check"></i>';
            nextClassButton.disabled = true;
            nextClassButton.dataset.nextLessonId = '';
            this.enableCertificate();
        }
    };

    courseProgress.setupNextClassButton = function() {
        const nextClassButton = document.getElementById('nextClassButton');
        if (!nextClassButton) return;
        nextClassButton.addEventListener('click', () => {
            const nextLessonId = nextClassButton.dataset.nextLessonId;
            if (!nextLessonId) return;
            const nextLessonElement = document.querySelector(`li[data-leccion-id="${nextLessonId}"]`);
            if (!nextLessonElement) return;
            const parentModule = nextLessonElement.closest('.unidad-card');
            if (parentModule) {
                parentModule.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (!parentModule.classList.contains('is-open')) {
                    parentModule.querySelector('.unidad-header').click();
                }
            }
        });
    };
    
    courseProgress.enableCertificate = function() {
        const message = document.getElementById('certificateMessage');
        const button = document.getElementById('certificateButton');
        if (message) {
            message.textContent = '¡Felicidades! Ya puedes descargar tu diploma.';
        }
        if (button) {
            button.textContent = 'Descargar Certificado';
            button.classList.remove('disabled');
        }
    };

    courseProgress.updateCourseState();
    courseProgress.setupLeccionListeners();
    courseProgress.setupNextClassButton();
    
});