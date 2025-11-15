// Verificar si el usuario está autenticado como admin
$(document).ready(function() {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Redirigir si no está autenticado como admin
    if (!token || rol !== 'admin') {
        window.location.href = '../login.html';
        return;
    }

    // Mostrar datos del admin
    $('#admin-email').text(usuario.email || 'admin@sacars.com');

    // Cargar datos del dashboard
    cargarDatosAdmin();
});

function cargarDatosAdmin() {
    const token = localStorage.getItem('token');

    $.ajax({
        type: 'GET',
        url: '../backend/api/admin/datos.php',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.success) {
                $('#ingresos-mes').text('S/ ' + response.datos.ingresos_mes.toFixed(2));
                $('#pedidos-pendientes').text(response.datos.pedidos_pendientes);
                $('#total-clientes').text(response.datos.total_clientes);
                $('#productos-stock').text(response.datos.productos_stock);
            }
        }
    });
}

function cerrarSesionAdmin() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    window.location.href = '../login.html';
}
