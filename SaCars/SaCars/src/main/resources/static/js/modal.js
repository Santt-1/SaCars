// SISTEMA DE MODALES DE PRODUCTOS
$(document).ready(function() {
    // Variables del modal
    const modal = document.getElementById('modal-producto');
    const cerrarModal = document.querySelector('.modal-cerrar');
    const modalImg = document.getElementById('modal-img');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalDescripcion = document.getElementById('modal-descripcion');
    const modalPrecio = document.getElementById('modal-precio');

    // Función para abrir modal con datos del producto
    function abrirModal(e) {
        const boton = e.target.closest('.btn-ver-producto');
        if (!boton) return;
        
        const id = boton.dataset.id;
        const imagen = boton.dataset.imagen;
        const titulo = boton.dataset.titulo;
        const descripcion = boton.dataset.descripcion;
        const precio = boton.dataset.precio;

        // Guardar ID en el modal
        $("#modal-id").text(id);
        // También establecer el atributo `data-id` en el contenedor del modal
        $("#modal-producto").attr("data-id", id);
        // y almacenarlo en la cache de datos de jQuery para lecturas con .data()
        $("#modal-producto").data("id", id);

        modalImg.src = imagen;
        modalTitulo.textContent = titulo;
        modalDescripcion.textContent = descripcion;
        modalPrecio.textContent = "S/ " + precio;
        
        modal.classList.add('modal-visible');
    }

    // Función para cerrar modal
    function cerrarElModal() {
        modal.classList.remove('modal-visible');
    }

    // Función para verificar autenticación antes de acciones
    function verificarYRedirigir() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth/login';
            return false;
        }
        return true;
    }

    // DELEGACIÓN DE EVENTOS: Funciona con elementos dinámicos
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-ver-producto')) {
            abrirModal(e);
        }
        
        // Nota: acciones de "Agregar" y "Comprar" son manejadas en `main.js`.

    });

    // Event listeners para cerrar modal
    if (cerrarModal) {
        cerrarModal.addEventListener('click', cerrarElModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarElModal();
            }
        });
    }
});