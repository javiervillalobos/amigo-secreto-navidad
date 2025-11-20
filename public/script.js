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

    // --- API CALLS ---
    
    // 1. Registro
    document.getElementById('form-registro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;

        const payload = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email-registro').value
        };

        try {
            const res = await fetch('/api/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            mostrarToast('¡Éxito!', `Bienvenido/a ${data.nombre}. Ahora pide tu regalo.`);
            // Pre-llenar el email en el siguiente formulario para mejor UX
            document.getElementById('email-regalo').value = data.email;
            e.target.reset();

        } catch (err) {
            mostrarToast('Error', err.message, true);
        } finally {
            btn.disabled = false;
        }
    });

    // 2. Regalo
    document.getElementById('form-regalo').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;

        const payload = {
            email: document.getElementById('email-regalo').value,
            nombre_regalo: document.getElementById('nombre-regalo').value,
            precio: document.getElementById('precio').value,
            url_regalo: document.getElementById('url-regalo').value
        };

        try {
            const res = await fetch('/api/regalo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            mostrarToast('¡Regalo Guardado!', 'Tu deseo ha sido registrado 🎁');
            e.target.reset();

        } catch (err) {
            mostrarToast('Error', err.message, true);
        } finally {
            btn.disabled = false;
        }
    });

    // 3. Sorteo
    document.getElementById('btn-sorteo').addEventListener('click', async (e) => {
        if (!confirm('¿Seguro? Esto enviará los correos a todos.')) return;

        const btn = e.target;
        btn.disabled = true;
        btn.textContent = 'Procesando...';

        try {
            const res = await fetch('/api/sorteo', { method: 'POST' });
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
});