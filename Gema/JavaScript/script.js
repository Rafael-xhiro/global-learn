document.addEventListener('DOMContentLoaded', function() {
    const answerButtons = document.querySelectorAll('.answer-btn');
    const submitBtn = document.getElementById('submit-btn');
    const examForm = document.getElementById('exam-form');
    
    answerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const question = this.getAttribute('data-question');
            
            const otherButtons = document.querySelectorAll(`.answer-btn[data-question="${question}"]`);
            otherButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
            
            this.classList.add('selected');
        });
    });
    
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name-input');
        if (nameInput.value.trim() === '') {
            alert('Por favor, escribe tu nombre antes de enviar el examen');
            nameInput.focus();
            return;
        }
        
        const totalQuestions = 20;
        let answered = 0;
        
        for (let i = 1; i <= totalQuestions; i++) {
            const selected = document.querySelector(`.answer-btn[data-question="${i}"].selected`);
            if (selected) {
                answered++;
            }
        }
        
        if (answered < totalQuestions) {
            alert(`Has respondido ${answered} de ${totalQuestions} preguntas. Por favor, responde todas las preguntas antes de enviar.`);
            return;
        }
        
        alert(`Examen enviado correctamente. ¡Gracias ${nameInput.value}!`);
    });
});