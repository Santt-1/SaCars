// Verificar si el usuario está autenticado como admin
$(document).ready(function() {
    const token = localStorage.getItem('admin_token');
    const usuario = JSON.parse(localStorage.getItem('admin_usuario') || '{}');

    // Redirigir si no está autenticado como admin
    if (!token || usuario.rol !== 'administrador') {
        window.location.href = '/admin/login';
        return;
    }

    // Mostrar datos del admin
    $('#admin-email').text(usuario.correo || 'admin@sacars.com');

    // Cargar datos del dashboard
    cargarDatosAdmin();
});

function cargarDatosAdmin() {
    const token = localStorage.getItem('admin_token');

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
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_usuario');
    window.location.href = '/admin/login';
}
