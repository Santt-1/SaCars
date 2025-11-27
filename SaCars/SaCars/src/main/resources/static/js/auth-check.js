// auth-check.js - Controla qué se muestra según autenticación
$(document).ready(function () {
    verificarAutenticacion();
});

function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (token && usuario) {
        // USUARIO LOGUEADO - Mostrar funcionalidades completas
        $('#usuario-conectado').show();

        // LIMITAR NOMBRE A 15 CARACTERES
        let nombreMostrar = usuario.nombre || 'Usuario';
        if (nombreMostrar.length > 15) {
            nombreMostrar = nombreMostrar.substring(0, 15) + '...';
        }
        $('#nombre-usuario').text(nombreMostrar);

        $('.btn-login-header').hide();
        $('#btn-logout').show();

        // Hacer que el nombre de usuario sea clickeable y redirija al perfil
        $('#usuario-conectado').css('cursor', 'pointer').off('click').on('click', function (e) {
            e.preventDefault();
            window.location.href = '/perfil';
        });

        // Actualizar contador del carrito
        actualizarContadorCarrito();

    } else {
        // USUARIO NO LOGUEADO - Solo mostrar UI
        $('#usuario-conectado').hide();
        $('.btn-login-header').show();
        $('#btn-logout').hide();
    }
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const contador = carrito.reduce((total, item) => total + item.cantidad, 0);

    // Crear o actualizar contador
    let $contador = $('.contador-carrito');
    if ($contador.length === 0) {
        $('.carrito-icono').append('<span class="contador-carrito">0</span>');
        $contador = $('.contador-carrito');
    }

    $contador.text(contador).toggle(contador > 0);
}

// Logout
$('#btn-logout').click(function (e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrito');
    window.location.href = '/';
});