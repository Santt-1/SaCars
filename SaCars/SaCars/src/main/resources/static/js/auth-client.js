// Verificar si el usuario está autenticado como cliente
$(document).ready(function() {
    const token = localStorage.getItem('cliente_token');
    const usuario = JSON.parse(localStorage.getItem('cliente_usuario') || '{}');

    // Redirigir si no está autenticado
    if (!token || usuario.rol !== 'cliente') {
        window.location.href = '/auth/login';
        return;
    }

    // Mostrar datos del usuario
    $('#usuario-nombre').text(usuario.nombre || 'Cliente');
    $('#user-email').text(usuario.correo || 'usuario@email.com');

    // Cargar datos del dashboard
    cargarDatosCliente();
});

function cargarDatosCliente() {
    const token = localStorage.getItem('cliente_token');

    $.ajax({
        type: 'GET',
        url: '../backend/api/cliente/datos.php',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.success) {
                $('#total-gastado').text('S/ ' + response.datos.total_gastado.toFixed(2));
                $('#total-pedidos').text(response.datos.total_pedidos);
                $('#total-favoritos').text(response.datos.total_favoritos);
            }
        }
    });
}

function cerrarSesion() {
    localStorage.removeItem('cliente_token');
    localStorage.removeItem('cliente_usuario');
    window.location.href = '/';
}
