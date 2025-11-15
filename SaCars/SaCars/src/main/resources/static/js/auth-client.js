// Verificar si el usuario está autenticado
$(document).ready(function() {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Redirigir si no está autenticado
    if (!token || rol !== 'cliente') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar datos del usuario
    $('#usuario-nombre').text(usuario.nombre || 'Cliente');
    $('#user-email').text(usuario.email || 'usuario@email.com');

    // Cargar datos del dashboard
    cargarDatosCliente();
});

function cargarDatosCliente() {
    const token = localStorage.getItem('token');

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
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    window.location.href = '../login.html';
}
