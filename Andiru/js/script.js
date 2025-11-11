document.addEventListener('DOMContentLoaded', function () {

    // =========================
    // Sistema de calificación
    // =========================
    function inicializarSistemaDeCalificacion(containerSelector, buttonsSelector, storageKey) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const buttons = container.querySelectorAll(`${buttonsSelector} button`);
        const msg = container.querySelector('.rating-msg');
        if (!buttons.length || !msg) return;

        const savedRating = parseInt(localStorage.getItem(storageKey)) || 0;

        function highlightButtons(count) {
            buttons.forEach(button => {
                const value = parseInt(button.dataset.value);
                button.classList.toggle('active', value <= count);
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

    const cursoId = document.body.dataset.courseId;
    if (cursoId) {
        inicializarSistemaDeCalificacion('.rating', '.stars', `curso-rating-${cursoId}`);
        inicializarSistemaDeCalificacion('.teacher-widget', '.emojis', `docente-rating-${cursoId}`);
    }

    // =========================
    // Abrir / Cerrar módulos
    // =========================
    document.querySelectorAll('.unidad-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.bsTarget;
            const collapseEl = document.querySelector(targetId);
            if (!collapseEl) return;
            new bootstrap.Collapse(collapseEl, { toggle: true });

            // Cambiar chevron
            const chevron = header.querySelector('.chevron-icon');
            if (chevron) {
                chevron.classList.toggle('rotate-180', collapseEl.classList.contains('show'));
            }
        });
    });

    // =========================
    // Modal de video
    // =========================
    const videoModalEl = document.getElementById('videoModal');
    const youtubePlayer = document.getElementById('youtubePlayer');
    if (videoModalEl && youtubePlayer) {
        const bsModal = new bootstrap.Modal(videoModalEl);

        document.querySelectorAll('.open-modal-video').forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault();
                const videoId = button.dataset.videoId;
                youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                bsModal.show();
            });
        });

        videoModalEl.addEventListener('hidden.bs.modal', () => {
            youtubePlayer.src = '';
        });
    }

    // =========================
    // Progreso del curso
    // =========================
    const courseProgress = {
        updateCourseState() {
            const modules = document.querySelectorAll('.unidad-card');
            let allPreviousComplete = true;

            modules.forEach(module => {
                const lessons = module.querySelectorAll('.lista-lecciones li');
                let completedLessons = 0;

                lessons.forEach(lesson => {
                    const id = lesson.dataset.leccionId;
                    if (localStorage.getItem(id) === 'true') {
                        this.completeLesson(lesson, false);
                        completedLessons++;
                    }
                });

                if (module.classList.contains('is-locked') && allPreviousComplete) {
                    this.unlockModule(module);
                }

                if (lessons.length && completedLessons < lessons.length) allPreviousComplete = false;
            });

            this.updateProgressCircle();
            this.updateNextClassWidget();
        },

        completeLesson(lesson, save = true) {
            const icon = lesson.querySelector('.status-icon');
            if (icon && !icon.classList.contains('completed')) {
                icon.classList.remove('fa-regular', 'fa-circle-play', 'fa-lock');
                icon.classList.add('fa-solid', 'fa-circle-check', 'completed');
            }
            if (save) {
                const id = lesson.dataset.leccionId;
                if (id) localStorage.setItem(id, 'true');
                this.updateCourseState();
            }
        },

        unlockModule(module) {
            module.classList.remove('is-locked');
            module.querySelectorAll('.status-icon').forEach(icon => {
                icon.classList.remove('fa-lock');
                icon.classList.add('fa-regular', 'fa-circle-play');
            });
        },

        updateProgressCircle() {
            const completed = document.querySelectorAll('.status-icon.completed').length;
            const total = document.querySelectorAll('.lista-lecciones li').length;
            const canvas = document.getElementById('progressCircle');
            const pctText = document.getElementById('progressPercentage');
            const summaryText = document.getElementById('progressSummary');
            if (!canvas || !pctText || !summaryText) return;

            const pct = total ? Math.round((completed / total) * 100) : 0;
            pctText.innerText = `${pct}%`;

            summaryText.innerText = pct === 100
                ? '¡Felicidades, curso completado!'
                : pct > 40
                    ? 'Vas muy bien, sigue avanzando.'
                    : '¡Sigue así para completar el curso!';

            const ctx = canvas.getContext('2d');
            const center = canvas.width / 2;
            const radius = 50;
            const lineWidth = 10;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // fondo
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, 2 * Math.PI);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();

            // progreso
            if (pct) {
                ctx.beginPath();
                ctx.arc(center, center, radius, -Math.PI / 2, (pct / 100) * 2 * Math.PI - Math.PI / 2);
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = '#00e27f';
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        },

        setupLessonListeners() {
            document.querySelectorAll('.lista-lecciones li').forEach(lesson => {
                const link = lesson.querySelector('a, label');
                if (!link) return;
                link.addEventListener('click', e => {
                    const module = lesson.closest('.unidad-card');
                    if (module?.classList.contains('is-locked')) e.preventDefault();
                    else this.completeLesson(lesson);
                });
            });
        },

        updateNextClassWidget() {
            const all = document.querySelectorAll('.lista-lecciones li');
            const completed = document.querySelectorAll('.status-icon.completed');
            const nextText = document.getElementById('nextClassName');
            const nextBtn = document.getElementById('nextClassButton');
            if (!all.length || !nextText || !nextBtn) return;

            const nextIndex = completed.length;

            if (nextIndex < all.length) {
                const nextLesson = all[nextIndex];
                const lessonLink = nextLesson.querySelector('a, label');
                nextText.textContent = lessonLink?.textContent.trim() || 'Siguiente Lección';
                nextBtn.innerHTML = 'Empezar Ahora <i class="fa-solid fa-arrow-right"></i>';
                nextBtn.disabled = false;
                nextBtn.dataset.nextLessonId = nextLesson.dataset.leccionId;
            } else {
                nextText.textContent = '¡Felicidades! Has terminado el curso.';
                nextBtn.innerHTML = 'Curso Completado <i class="fa-solid fa-check"></i>';
                nextBtn.disabled = true;
                nextBtn.dataset.nextLessonId = '';
                this.enableCertificate();
            }
        },

        setupNextClassButton() {
            const btn = document.getElementById('nextClassButton');
            if (!btn) return;

            btn.addEventListener('click', () => {
                const nextId = btn.dataset.nextLessonId;
                if (!nextId) return;
                const nextLesson = document.querySelector(`li[data-leccion-id="${nextId}"]`);
                if (!nextLesson) return;
                const module = nextLesson.closest('.unidad-card');
                module?.querySelector('.unidad-header').click();
                module?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        },

        enableCertificate() {
            const msg = document.getElementById('certificateMessage');
            const btn = document.getElementById('certificateButton');
            if (msg) msg.textContent = '¡Felicidades! Ya puedes descargar tu diploma.';
            if (btn) {
                btn.textContent = 'Descargar Certificado';
                btn.classList.remove('disabled');
            }
        }
    };

    courseProgress.updateCourseState();
    courseProgress.setupLessonListeners();
    courseProgress.setupNextClassButton();

});
