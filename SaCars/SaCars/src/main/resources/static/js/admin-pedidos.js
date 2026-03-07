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

    // Buscador por nombre de cliente
    let timeoutBusqueda = null;
    $('#buscarCliente').on('input', function() {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            buscarPorCliente();
        }, 400); // Debounce de 400ms
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

    // Cancelar pedido desde el modal
    $('#btnCancelarPedido').on('click', function() {
        if (pedidoIdActual) {
            cancelarPedido(pedidoIdActual);
        }
    });
});

// Verificar autenticación
function verificarAutenticacionAdmin() {
    const usuario = JSON.parse(localStorage.getItem('admin_usuario') || '{}');
    
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

// Buscar por nombre de cliente
function buscarPorCliente() {
    const query = $('#buscarCliente').val().trim();
    
    // Limpiar otros filtros cuando se busca
    if (query) {
        $('#filtroEstado').val('');
        $('#filtroZona').val('');
    }
    
    $.ajax({
        url: '/admin/pedidos/api/buscar',
        method: 'GET',
        data: { q: query },
        beforeSend: function() {
            $('#tablaPedidos').html('<tr><td colspan="8" class="loading">Buscando...</td></tr>');
        },
        success: function(data) {
            mostrarPedidos(data);
        },
        error: function() {
            $('#tablaPedidos').html('<tr><td colspan="8" class="empty-state">Error al buscar</td></tr>');
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
                data = data.filter(p => p.ciudadEnvio === zonaFiltro);
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
        // Badge de estado (normalizar a mayúsculas)
        const estadoUpper = (pedido.estado || '').toUpperCase();
        let badgeEstado = '';
        switch(estadoUpper) {
            case 'PENDIENTE':
                badgeEstado = '<span class="badge badge-warning">⏳ Pendiente</span>';
                break;
            case 'COMPLETADO':
                badgeEstado = '<span class="badge badge-success">✅ Completado</span>';
                break;
            case 'CANCELADO':
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
                <td>${pedido.ciudadEnvio || '-'}</td>
                <td><span class="badge badge-info">${items}</span></td>
                <td>
                    <button class="btn-action btn-view" onclick="verDetallePedido(${pedido.idPedido})" title="Ver detalle">
                        👁️
                    </button>
                    ${estadoUpper === 'PENDIENTE' 
                        ? `<button class="btn-action btn-complete" onclick="marcarComoCompletado(${pedido.idPedido})" title="Completar">✅</button>
                           <button class="btn-action btn-cancel" onclick="cancelarPedido(${pedido.idPedido})" title="Cancelar" style="background: #e74c3c;">❌</button>`
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
            $('#clienteDireccion').text(pedido.direccionEnvio || 'N/A');

            // Información del pedido
            const fecha = new Date(pedido.fechaPedido);
            const fechaFormateada = fecha.toLocaleDateString('es-PE') + ' ' + fecha.toLocaleTimeString('es-PE');
            $('#pedidoFecha').text(fechaFormateada);
            
            // Badge de estado (normalizar a mayúsculas)
            const estadoUpper = (pedido.estado || '').toUpperCase();
            let badgeEstado = '';
            switch(estadoUpper) {
                case 'PENDIENTE':
                    badgeEstado = '<span class="badge badge-warning">⏳ Pendiente</span>';
                    break;
                case 'COMPLETADO':
                    badgeEstado = '<span class="badge badge-success">✅ Completado</span>';
                    break;
                case 'CANCELADO':
                    badgeEstado = '<span class="badge badge-danger">❌ Cancelado</span>';
                    break;
                default:
                    badgeEstado = `<span class="badge badge-info">${pedido.estado}</span>`;
            }
            $('#pedidoEstado').html(badgeEstado);
            $('#pedidoZona').text(pedido.ciudadEnvio || 'N/A');

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
                        <tr style="border-bottom: 1px solid #eee; background: #fff;">
                            <td style="padding: 14px 12px; color: #333; font-weight: 500;">${producto.nombreProducto}</td>
                            <td style="padding: 14px 12px; text-align: center; color: #1a1a2e;"><strong>${producto.cantidad}</strong></td>
                            <td style="padding: 14px 12px; text-align: right; color: #555;">${precioUnit}</td>
                            <td style="padding: 14px 12px; text-align: right; color: #27ae60;"><strong>${subtotalFormateado}</strong></td>
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
                    <tr style="border-top: 2px solid #1a1a2e; background: #f8f9fa;">
                        <td colspan="3" style="padding: 16px 12px; text-align: right; color: #1a1a2e; font-size: 16px;"><strong>TOTAL:</strong></td>
                        <td style="padding: 16px 12px; text-align: right; font-size: 20px; color: #27ae60;"><strong>${totalFormateado}</strong></td>
                    </tr>
                `);
            } else {
                productosBody.append('<tr><td colspan="4" style="padding: 20px; text-align: center; color: #999;">No hay productos en este pedido</td></tr>');
            }

            // Mostrar/ocultar botones según estado
            if (estadoUpper === 'PENDIENTE') {
                $('#btnMarcarCompletado').show();
                $('#btnCancelarPedido').show();
            } else {
                $('#btnMarcarCompletado').hide();
                $('#btnCancelarPedido').hide();
            }

            // Mostrar sección de comprobante si es Yape/Plin
            if (pedido.metodoPago === 'Yape/Plin') {
                $('#seccionComprobante').show();
                
                if (pedido.comprobantePago) {
                    $('#imgComprobante').attr('src', pedido.comprobantePago);
                    $('#imgComprobanteContainer').show();
                } else {
                    $('#imgComprobanteContainer').hide();
                }
                
                // Mostrar estado de verificación
                if (pedido.pagoVerificado) {
                    $('#badgePagoVerificado').show();
                    $('#badgePagoPendiente').hide();
                    $('#btnVerificarPago').hide();
                } else {
                    $('#badgePagoVerificado').hide();
                    $('#badgePagoPendiente').show();
                    $('#btnVerificarPago').show();
                }
            } else {
                $('#seccionComprobante').hide();
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

// Cancelar pedido - mostrar modal para ingresar motivo
function cancelarPedido(idPedido) {
    $('#pedidoACancelar').val(idPedido);
    $('#motivoCancelacion').val('');
    $('#modalCancelacion').fadeIn(200);
}

// Cerrar modal de cancelación
function cerrarModalCancelacion() {
    $('#modalCancelacion').fadeOut(200);
    $('#pedidoACancelar').val('');
    $('#motivoCancelacion').val('');
}

// Confirmar cancelación con motivo
function confirmarCancelacion() {
    const idPedido = $('#pedidoACancelar').val();
    const motivo = $('#motivoCancelacion').val().trim();
    
    if (!motivo) {
        alert('Debes ingresar un motivo para cancelar el pedido');
        return;
    }
    
    $.ajax({
        url: `/admin/pedidos/api/cancelar/${idPedido}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ motivo: motivo }),
        success: function() {
            mostrarMensaje('Pedido cancelado correctamente', 'success');
            cerrarModalCancelacion();
            cerrarModal();
            aplicarFiltros();
        },
        error: function(xhr) {
            const msg = xhr.responseJSON?.error || 'Error al cancelar el pedido';
            mostrarMensaje(msg, 'error');
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

// Verificar pago de pedido Yape/Plin
function verificarPago() {
    if (!pedidoIdActual) return;
    
    if (!confirm('¿Confirmas que el pago ha sido verificado correctamente?')) return;
    
    $.ajax({
        url: `/admin/pedidos/api/verificar-pago/${pedidoIdActual}`,
        method: 'PUT',
        success: function(response) {
            mostrarMensaje('Pago verificado correctamente', 'success');
            // Actualizar UI
            $('#badgePagoVerificado').show();
            $('#badgePagoPendiente').hide();
            $('#btnVerificarPago').hide();
        },
        error: function(xhr) {
            const error = xhr.responseJSON?.error || 'Error al verificar el pago';
            mostrarMensaje(error, 'error');
        }
    });
}

// Ampliar imagen del comprobante
function ampliarComprobante() {
    const imgSrc = $('#imgComprobante').attr('src');
    if (!imgSrc) return;
    
    const modal = $(`
        <div id="modalAmpliarImg" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            cursor: pointer;
        " onclick="this.remove()">
            <img src="${imgSrc}" style="max-width: 90%; max-height: 90%; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <span style="position: absolute; top: 20px; right: 30px; color: white; font-size: 30px; cursor: pointer;">&times;</span>
        </div>
    `);
    
    $('body').append(modal);
}

// Event listener para botón de verificar pago
$(document).ready(function() {
    $('#btnVerificarPago').on('click', verificarPago);
});

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
