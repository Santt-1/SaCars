/**
 * Gestión de Pedidos - Panel Administrativo
 * SaCars
 */

let pedidoIdActual = null;

$(document).ready(function() {
    verificarAutenticacionAdmin();
    cargarPedidos();

    // Filtro por estado
    $('#filtroEstado').on('change', function() {
        aplicarFiltros();
    });

    // Filtro por zona
    $('#filtroZona').on('change', function() {
        aplicarFiltros();
    });

    // Resumen del día
    $('#btnResumenHoy').on('click', function() {
        cargarResumenDelDia();
    });

    // Marcar como completado desde el modal
    $('#btnMarcarCompletado').on('click', function() {
        if (pedidoIdActual) {
            marcarComoCompletado(pedidoIdActual);
        }
    });
});

// Verificar autenticación
function verificarAutenticacionAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!usuario.correo || usuario.rol !== 'administrador') {
        window.location.href = '/admin/login';
        return;
    }
    
    $('#adminEmail').text(usuario.correo);
}

// Cargar todos los pedidos
function cargarPedidos() {
    $.ajax({
        url: '/admin/pedidos/api/listar',
        method: 'GET',
        beforeSend: function() {
            $('#tablaPedidos').html('<tr><td colspan="8" class="loading">Cargando pedidos...</td></tr>');
        },
        success: function(data) {
            mostrarPedidos(data);
        },
        error: function() {
            $('#tablaPedidos').html('<tr><td colspan="8" class="empty-state">Error al cargar pedidos</td></tr>');
        }
    });
}

// Aplicar filtros
function aplicarFiltros() {
    const estado = $('#filtroEstado').val();
    const zona = $('#filtroZona').val();

    if (!estado && !zona) {
        cargarPedidos();
        return;
    }

    let url = '/admin/pedidos/api/';
    let params = {};

    if (estado && zona) {
        // Si hay ambos filtros, usamos el de estado y filtramos en cliente
        url += `estado/${estado}`;
        cargarPedidosFiltrados(url, zona);
    } else if (estado) {
        url += `estado/${estado}`;
        cargarPedidosFiltrados(url);
    } else if (zona) {
        url += `zona/${zona}`;
        cargarPedidosFiltrados(url);
    }
}

// Cargar pedidos filtrados
function cargarPedidosFiltrados(url, zonaFiltro = null) {
    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            if (zonaFiltro) {
                data = data.filter(p => p.zonaEntrega === zonaFiltro);
            }
            mostrarPedidos(data);
        },
        error: function() {
            $('#tablaPedidos').html('<tr><td colspan="8" class="empty-state">Error al aplicar filtros</td></tr>');
        }
    });
}

// Mostrar pedidos en tabla
function mostrarPedidos(pedidos) {
    const tbody = $('#tablaPedidos');
    tbody.empty();

    if (pedidos.length === 0) {
        tbody.html('<tr><td colspan="8" class="empty-state">No se encontraron pedidos</td></tr>');
        return;
    }

    pedidos.forEach(pedido => {
        // Badge de estado
        let badgeEstado = '';
        switch(pedido.estado) {
            case 'pendiente':
                badgeEstado = '<span class="badge badge-warning">⏳ Pendiente</span>';
                break;
            case 'completado':
                badgeEstado = '<span class="badge badge-success">✅ Completado</span>';
                break;
            case 'cancelado':
                badgeEstado = '<span class="badge badge-danger">❌ Cancelado</span>';
                break;
            default:
                badgeEstado = `<span class="badge badge-info">${pedido.estado}</span>`;
        }

        // Formatear fecha
        const fecha = new Date(pedido.fechaPedido);
        const fechaFormateada = fecha.toLocaleDateString('es-PE') + ' ' + fecha.toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'});

        // Formatear total
        const total = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(pedido.total);

        // Cantidad de items
        const items = pedido.cantidadItems || '-';

        const fila = `
            <tr>
                <td><strong>#${pedido.idPedido}</strong></td>
                <td>${pedido.nombreCliente || 'Cliente'}</td>
                <td>${fechaFormateada}</td>
                <td><strong>${total}</strong></td>
                <td>${badgeEstado}</td>
                <td>${pedido.zonaEntrega || '-'}</td>
                <td><span class="badge badge-info">${items}</span></td>
                <td>
                    <button class="btn-action btn-view" onclick="verDetallePedido(${pedido.idPedido})" title="Ver detalle">
                        👁️
                    </button>
                    ${pedido.estado === 'pendiente' 
                        ? `<button class="btn-action btn-complete" onclick="marcarComoCompletado(${pedido.idPedido})" title="Completar">✅</button>`
                        : ''
                    }
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// Ver detalle del pedido
function verDetallePedido(idPedido) {
    pedidoIdActual = idPedido;
    
    $.ajax({
        url: `/admin/pedidos/api/${idPedido}`,
        method: 'GET',
        success: function(pedido) {
            // Número de pedido
            $('#numeroPedido').text(`#${pedido.idPedido}`);

            // Información del cliente
            $('#clienteNombre').text(pedido.nombreCliente || 'N/A');
            $('#clienteEmail').text(pedido.emailCliente || 'N/A');
            $('#clienteTelefono').text(pedido.telefonoCliente || 'N/A');
            $('#clienteDireccion').text(pedido.direccionCliente || 'N/A');

            // Información del pedido
            const fecha = new Date(pedido.fechaPedido);
            const fechaFormateada = fecha.toLocaleDateString('es-PE') + ' ' + fecha.toLocaleTimeString('es-PE');
            $('#pedidoFecha').text(fechaFormateada);
            
            // Badge de estado
            let badgeEstado = '';
            switch(pedido.estado) {
                case 'pendiente':
                    badgeEstado = '<span class="badge badge-warning">⏳ Pendiente</span>';
                    break;
                case 'completado':
                    badgeEstado = '<span class="badge badge-success">✅ Completado</span>';
                    break;
                case 'cancelado':
                    badgeEstado = '<span class="badge badge-danger">❌ Cancelado</span>';
                    break;
                default:
                    badgeEstado = `<span class="badge badge-info">${pedido.estado}</span>`;
            }
            $('#pedidoEstado').html(badgeEstado);
            $('#pedidoZona').text(pedido.zonaEntrega || 'N/A');

            const total = new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN'
            }).format(pedido.total);
            $('#pedidoTotal').text(total);

            // Productos del pedido
            const productosBody = $('#productosDetalle');
            productosBody.empty();

            if (pedido.productos && pedido.productos.length > 0) {
                let subtotalGeneral = 0;
                pedido.productos.forEach(producto => {
                    const precioUnit = new Intl.NumberFormat('es-PE', {
                        style: 'currency',
                        currency: 'PEN'
                    }).format(producto.precioUnitario);

                    const subtotal = producto.cantidad * producto.precioUnitario;
                    subtotalGeneral += subtotal;

                    const subtotalFormateado = new Intl.NumberFormat('es-PE', {
                        style: 'currency',
                        currency: 'PEN'
                    }).format(subtotal);

                    const row = `
                        <tr>
                            <td style="padding: 12px;">${producto.nombreProducto}</td>
                            <td style="padding: 12px; text-align: center;"><strong>${producto.cantidad}</strong></td>
                            <td style="padding: 12px; text-align: right;">${precioUnit}</td>
                            <td style="padding: 12px; text-align: right;"><strong>${subtotalFormateado}</strong></td>
                        </tr>
                    `;
                    productosBody.append(row);
                });

                // Fila de total
                const totalFormateado = new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: 'PEN'
                }).format(subtotalGeneral);

                productosBody.append(`
                    <tr style="border-top: 2px solid #1a1a2e;">
                        <td colspan="3" style="padding: 15px; text-align: right;"><strong>TOTAL:</strong></td>
                        <td style="padding: 15px; text-align: right; font-size: 18px; color: #27ae60;"><strong>${totalFormateado}</strong></td>
                    </tr>
                `);
            } else {
                productosBody.append('<tr><td colspan="4" style="padding: 20px; text-align: center; color: #999;">No hay productos en este pedido</td></tr>');
            }

            // Mostrar/ocultar botón de completar
            if (pedido.estado === 'pendiente') {
                $('#btnMarcarCompletado').show();
            } else {
                $('#btnMarcarCompletado').hide();
            }

            $('#modalDetallePedido').fadeIn();
        },
        error: function() {
            mostrarMensaje('Error al cargar el detalle del pedido', 'error');
        }
    });
}

// Marcar pedido como completado
function marcarComoCompletado(idPedido) {
    if (!confirm('¿Estás seguro de marcar este pedido como completado?')) return;

    $.ajax({
        url: `/admin/pedidos/api/completar/${idPedido}`,
        method: 'PUT',
        success: function() {
            mostrarMensaje('Pedido marcado como completado', 'success');
            cerrarModal();
            aplicarFiltros(); // Recargar con los filtros actuales
        },
        error: function() {
            mostrarMensaje('Error al completar el pedido', 'error');
        }
    });
}

// Cargar resumen del día
function cargarResumenDelDia() {
    $.ajax({
        url: '/admin/pedidos/api/resumen-hoy',
        method: 'GET',
        success: function(data) {
            $('#resumenPedidos').text(data.totalPedidos || 0);
            $('#resumenCompletados').text(data.pedidosCompletados || 0);
            $('#resumenPendientes').text(data.pedidosPendientes || 0);
            
            const totalFormateado = new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN'
            }).format(data.totalVentas || 0);
            $('#resumenTotal').text(totalFormateado);

            $('#resumenDelDia').slideDown();
        },
        error: function() {
            mostrarMensaje('Error al cargar el resumen del día', 'error');
        }
    });
}

// Cerrar modal
function cerrarModal() {
    $('#modalDetallePedido').fadeOut();
    pedidoIdActual = null;
}

// Mostrar mensaje toast
function mostrarMensaje(mensaje, tipo) {
    const toast = $(`
        <div class="toast toast-${tipo}" style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${tipo === 'success' ? '#155724' : '#721c24'};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

// Estilos adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .btn-view {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    .btn-view:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .btn-complete {
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
    }
    .btn-complete:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
    }
`;
document.head.appendChild(style);
