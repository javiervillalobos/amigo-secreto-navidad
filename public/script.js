document.addEventListener('DOMContentLoaded', () => {
    
    // --- UTILIDADES ---
    const mostrarToast = (titulo, mensaje, esError = false) => {
        const toastEl = document.getElementById('liveToast');
        const toastTitle = document.getElementById('toast-title');
        const toastBody = document.getElementById('toast-body');
        const toastHeader = toastEl.querySelector('.toast-header');

        toastTitle.textContent = titulo;
        toastBody.textContent = mensaje;
        
        // Cambiar colores según estado
        if (esError) {
            toastHeader.className = 'toast-header bg-danger text-white';
        } else {
            toastHeader.className = 'toast-header bg-success text-white';
        }

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    };

    const formUnirse = document.getElementById('form-unirse');
    
    if (formUnirse) {
        formUnirse.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Enviando a Polo Norte...';

            const payload = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                nombre_regalo: document.getElementById('nombre-regalo').value,
                precio: document.getElementById('precio').value,
                url_regalo: document.getElementById('url-regalo').value
            };

            try {
                const res = await fetch('/unirse', { // Nueva ruta
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                mostrarToast('¡Inscrito!', `Bienvenido/a ${data.usuario.nombre}. Tu deseo fue guardado.`);
                e.target.reset();
                btn.textContent = '¡Listo! Inscribir a otro';

            } catch (err) {
                mostrarToast('Error', err.message, true);
                btn.textContent = '🎄 ¡Confirmar Participación! 🎄';
            } finally {
                btn.disabled = false;
            }
        });
    }    

    const btnSorteo = document.getElementById('btn-sorteo');

    if (btnSorteo) {
        document.getElementById('btn-sorteo').addEventListener('click', async (e) => {
            if (!confirm('¿Seguro? Esto enviará los correos a todos.')) return;

            const btn = e.target;
            btn.disabled = true;
            btn.textContent = 'Procesando...';

            try {
                const res = await fetch('/sorteo', { method: 'POST' });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);

                mostrarToast('¡Sorteo Listo!', data.mensaje);
                btn.textContent = '¡Sorteo Finalizado!';
                
            } catch (err) {
                mostrarToast('Error', err.message, true);
                btn.disabled = false;
                btn.textContent = '🎲 REALIZAR SORTEO Y ENVIAR CORREOS';
            }
        });
    }
});