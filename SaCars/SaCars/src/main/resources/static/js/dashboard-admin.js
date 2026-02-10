/**
 * Dashboard Administrativo - SaCars
 * Carga estadísticas en tiempo real y pedidos recientes
 */

$(document).ready(function() {
    // Verificar autenticación admin
    verificarAutenticacionAdmin();
    
    // Cargar datos del dashboard
    cargarEstadisticas();
    cargarPedidosRecientes();
    
    // Recargar cada 30 segundos
    setInterval(cargarEstadisticas, 30000);
});

/**
 * Verifica que el usuario sea administrador
 */
function verificarAutenticacionAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const adminEmail = document.getElementById('admin-email');
    
    if (!usuario.correo || usuario.rol !== 'administrador') {
        // Redirigir al login si no es admin
        window.location.href = '/admin/login';
        return;
    }
    
    if (adminEmail) {
        adminEmail.textContent = usuario.correo;
    }
}

/**
 * Carga las estadísticas del dashboard (RQ1.4)
 */
function cargarEstadisticas() {
    $.ajax({
        url: '/admin/api/estadisticas',
        method: 'GET',
        success: function(data) {
            actualizarEstadisticas(data);
        },
        error: function(xhr) {
            console.error('Error al cargar estadísticas:', xhr);
            if (xhr.status === 401 || xhr.status === 403) {
                window.location.href = '/auth/login.html';
            }
        }
    });
}

/**
 * Actualiza los valores de las tarjetas de estadísticas
 */
function actualizarEstadisticas(stats) {
    // Ingresos del mes
    const ingresosMes = stats.ingresosMesActual || 0;
    $('#ingresos-mes').text('S/ ' + formatearNumero(ingresosMes));
    
    // Calcular porcentaje de crecimiento
    const porcentaje = stats.porcentajeCrecimiento || 0;
    const changeElement = $('#ingresos-mes').siblings('.stat-change');
    if (porcentaje >= 0) {
        changeElement.text('+' + porcentaje.toFixed(1) + '% respecto al mes anterior')
                    .css('color', '#27ae60');
    } else {
        changeElement.text(porcentaje.toFixed(1) + '% respecto al mes anterior')
                    .css('color', '#e74c3c');
    }
    
    // Pedidos pendientes
    $('#pedidos-pendientes').text(stats.pedidosPendientes || 0);
    
    // Total clientes
    $('#total-clientes').text(stats.totalClientes || 0);
    
    // Productos en stock (unidades totales)
    $('#productos-stock').text(formatearNumero(stats.totalUnidadesStock || 0));
    
    // Actualizar mensaje de nuevos clientes
    const nuevosClientes = stats.clientesNuevosUltimaSemana || 0;
    if (nuevosClientes > 0) {
        $('#total-clientes').siblings('.stat-change')
            .text('+' + nuevosClientes + ' nuevos esta semana');
    }
}

/**
 * Carga los pedidos recientes
 */
function cargarPedidosRecientes() {
    $.ajax({
        url: '/admin/pedidos/api/recientes',
        method: 'GET',
        success: function(pedidos) {
            mostrarPedidosRecientes(pedidos);
        },
        error: function(xhr) {
            console.error('Error al cargar pedidos:', xhr);
            $('#tabla-pedidos').html('<tr><td colspan="6" style="text-align: center; color: #e74c3c;">Error al cargar pedidos</td></tr>');
        }
    });
}

/**
 * Muestra los pedidos recientes en la tabla
 */
function mostrarPedidosRecientes(pedidos) {
    const tbody = $('#tabla-pedidos');
    tbody.empty();
    
    if (!pedidos || pedidos.length === 0) {
        tbody.html('<tr><td colspan="6" style="text-align: center; color: #666;">No hay pedidos recientes</td></tr>');
        return;
    }
    
    pedidos.forEach(pedido => {
        const fechaFormateada = formatearFecha(pedido.fechaPedido);
        const nombreCliente = pedido.usuario ? 
            (pedido.usuario.nombre + ' ' + pedido.usuario.apellido) : 'Cliente';
        
        const estadoBadge = obtenerBadgeEstado(pedido.estado);
        
        const fila = `
            <tr>
                <td>#${pedido.id}</td>
                <td>${nombreCliente}</td>
                <td>S/ ${formatearNumero(pedido.total)}</td>
                <td>${estadoBadge}</td>
                <td>${fechaFormateada}</td>
                <td>
                    <button class="btn-action btn-view" onclick="verDetallePedido(${pedido.id})" title="Ver detalles">
                        👁️
                    </button>
                    ${pedido.estado === 'PENDIENTE' ? 
                        `<button class="btn-action btn-complete" onclick="completarPedido(${pedido.id})" title="Marcar como completado">
                            ✅
                        </button>` : ''}
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

/**
 * Retorna el badge HTML según el estado del pedido
 */
function obtenerBadgeEstado(estado) {
    const estados = {
        'PENDIENTE': '<span class="badge badge-warning">Pendiente</span>',
        'COMPLETADO': '<span class="badge badge-success">Completado</span>',
        'CANCELADO': '<span class="badge badge-danger">Cancelado</span>',
        'EN_PROCESO': '<span class="badge badge-info">En Proceso</span>'
    };
    return estados[estado] || `<span class="badge badge-secondary">${estado}</span>`;
}

/**
 * Ver detalle de pedido
 */
function verDetallePedido(idPedido) {
    window.location.href = `/admin/pedidos?id=${idPedido}`;
}

/**
 * Marcar pedido como completado
 */
function completarPedido(idPedido) {
    if (!confirm('¿Marcar este pedido como completado?')) {
        return;
    }
    
    $.ajax({
        url: `/admin/pedidos/api/completar/${idPedido}`,
        method: 'PUT',
        success: function() {
            mostrarMensaje('Pedido marcado como completado', 'success');
            cargarEstadisticas();
            cargarPedidosRecientes();
        },
        error: function(xhr) {
            const mensaje = xhr.responseJSON?.error || 'Error al completar pedido';
            mostrarMensaje(mensaje, 'error');
        }
    });
}

/**
 * Cerrar sesión del administrador
 */
function cerrarSesionAdmin() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}

/**
 * Formatea un número con separador de miles
 */
function formatearNumero(numero) {
    return Number(numero).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Formatea una fecha en formato DD/MM/YYYY HH:MM
 */
function formatearFecha(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
}

/**
 * Muestra un mensaje toast
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    const color = tipo === 'success' ? '#27ae60' : 
                  tipo === 'error' ? '#e74c3c' : '#3498db';
    
    const toast = $(`
        <div class="toast-message" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        ">
            ${mensaje}
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(() => {
        toast.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}
