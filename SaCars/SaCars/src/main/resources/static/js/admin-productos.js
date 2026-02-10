/**
 * Gestión de Productos - Panel Administrativo
 * SaCars
 */

$(document).ready(function() {
    verificarAutenticacionAdmin();
    cargarCategorias();
    cargarProductos();

    // Buscar productos
    let timeoutBusqueda;
    $('#buscarProducto').on('input', function() {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            const termino = $(this).val().trim();
            if (termino.length >= 2) {
                buscarProductos(termino);
            } else if (termino.length === 0) {
                cargarProductos();
            }
        }, 500);
    });

    // Botón filtro stock bajo
    $('#btnFiltroStockBajo').on('click', function() {
        if ($(this).hasClass('activo')) {
            $(this).removeClass('activo');
            cargarProductos();
        } else {
            $(this).addClass('activo');
            cargarProductosStockBajo();
        }
    });

    // Botón nuevo producto
    $('#btnNuevoProducto').on('click', function() {
        mostrarModalCrear();
    });

    // Submit formulario producto
    $('#formProducto').on('submit', function(e) {
        e.preventDefault();
        guardarProducto();
    });

    // Submit formulario stock
    $('#formStock').on('submit', function(e) {
        e.preventDefault();
        agregarStock();
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

// Cargar categorías
function cargarCategorias() {
    $.ajax({
        url: '/admin/categorias/api/listar',
        method: 'GET',
        success: function(data) {
            const select = $('#idCategoria');
            select.empty();
            select.append('<option value="">Seleccionar categoría</option>');
            data.forEach(cat => {
                select.append(`<option value="${cat.idCategoria}">${cat.nombre}</option>`);
            });
        },
        error: function() {
            console.error('Error al cargar categorías');
        }
    });
}

// Cargar todos los productos
function cargarProductos() {
    $.ajax({
        url: '/admin/productos/api/listar',
        method: 'GET',
        beforeSend: function() {
            $('#tablaProductos').html('<tr><td colspan="10" class="loading">Cargando productos...</td></tr>');
        },
        success: function(data) {
            mostrarProductos(data);
        },
        error: function() {
            $('#tablaProductos').html('<tr><td colspan="10" class="empty-state">Error al cargar productos</td></tr>');
        }
    });
}

// Buscar productos
function buscarProductos(termino) {
    $.ajax({
        url: '/admin/productos/api/buscar',
        method: 'GET',
        data: { texto: termino },
        success: function(data) {
            mostrarProductos(data);
        },
        error: function() {
            $('#tablaProductos').html('<tr><td colspan="10" class="empty-state">Error en la búsqueda</td></tr>');
        }
    });
}

// Cargar productos con stock bajo
function cargarProductosStockBajo() {
    $.ajax({
        url: '/admin/productos/api/stock-bajo',
        method: 'GET',
        success: function(data) {
            mostrarProductos(data);
            if (data.length === 0) {
                $('#tablaProductos').html('<tr><td colspan="10" class="empty-state">No hay productos con stock bajo</td></tr>');
            }
        },
        error: function() {
            $('#tablaProductos').html('<tr><td colspan="10" class="empty-state">Error al cargar productos</td></tr>');
        }
    });
}

// Mostrar productos en tabla
function mostrarProductos(productos) {
    const tbody = $('#tablaProductos');
    tbody.empty();

    if (productos.length === 0) {
        tbody.html('<tr><td colspan="10" class="empty-state">No se encontraron productos</td></tr>');
        return;
    }

    productos.forEach(producto => {
        // Badge de stock
        let badgeStock = '';
        if (producto.stock === 0) {
            badgeStock = '<span class="badge badge-danger">Sin stock</span>';
        } else if (producto.stock < 10) {
            badgeStock = `<span class="badge badge-warning">${producto.stock}</span>`;
        } else {
            badgeStock = `<span class="badge badge-success">${producto.stock}</span>`;
        }

        // Estado activo/inactivo
        const badgeEstado = producto.activo 
            ? '<span class="badge badge-success">Activo</span>'
            : '<span class="badge badge-danger">Inactivo</span>';

        // Destacado
        const badgeDestacado = producto.destacado 
            ? '⭐'
            : '';

        // Imagen
        const imagen = producto.imagenUrl 
            ? `<img src="${producto.imagenUrl}" alt="${producto.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">`
            : '<div style="width: 60px; height: 60px; background: #eee; border-radius: 5px; display: flex; align-items: center; justify-content: center;">📦</div>';

        // Precio formateado
        const precio = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(producto.precio);

        const fila = `
            <tr>
                <td>${producto.idProducto}</td>
                <td>${imagen}</td>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion || '-'}</td>
                <td><strong>${precio}</strong></td>
                <td>${badgeStock}</td>
                <td>${producto.categoriaNombre || '-'}</td>
                <td>${badgeDestacado}</td>
                <td>${badgeEstado}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarProducto(${producto.idProducto})" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-action btn-stock" onclick="mostrarModalStock(${producto.idProducto}, '${producto.nombre}')" title="Agregar Stock">
                        📦
                    </button>
                    ${producto.activo 
                        ? `<button class="btn-action btn-delete" onclick="desactivarProducto(${producto.idProducto})" title="Desactivar">🚫</button>`
                        : `<button class="btn-action btn-activate" onclick="activarProducto(${producto.idProducto})" title="Activar">✅</button>`
                    }
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// Mostrar modal para crear producto
function mostrarModalCrear() {
    $('#tituloModal').text('Nuevo Producto');
    $('#formProducto')[0].reset();
    $('#idProducto').val('');
    $('#stock').prop('disabled', false);
    $('#activo').val('true');
    $('#destacado').val('false');
    $('#modalProducto').fadeIn();
}

// Editar producto
function editarProducto(idProducto) {
    $.ajax({
        url: `/admin/productos/api/${idProducto}`,
        method: 'GET',
        success: function(producto) {
            $('#tituloModal').text('Editar Producto');
            $('#idProducto').val(producto.idProducto);
            $('#nombre').val(producto.nombre);
            $('#descripcion').val(producto.descripcion);
            $('#precio').val(producto.precio);
            $('#stock').val(producto.stock);
            $('#stock').prop('disabled', true); // No permitir editar stock directamente
            $('#idCategoria').val(producto.idCategoria);
            $('#imagenUrl').val(producto.imagenUrl);
            $('#destacado').val(producto.destacado.toString());
            $('#activo').val(producto.activo.toString());
            $('#modalProducto').fadeIn();
        },
        error: function() {
            mostrarMensaje('Error al cargar el producto', 'error');
        }
    });
}

// Guardar producto (crear o editar)
function guardarProducto() {
    const idProducto = $('#idProducto').val();
    const isEdicion = idProducto !== '';

    const producto = {
        nombre: $('#nombre').val(),
        descripcion: $('#descripcion').val(),
        precio: parseFloat($('#precio').val()),
        stock: parseInt($('#stock').val()),
        idCategoria: parseInt($('#idCategoria').val()),
        imagenUrl: $('#imagenUrl').val(),
        destacado: $('#destacado').val() === 'true',
        activo: $('#activo').val() === 'true'
    };

    const url = isEdicion 
        ? `/admin/productos/api/editar/${idProducto}`
        : '/admin/productos/api/crear';
    
    const method = isEdicion ? 'PUT' : 'POST';

    $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(producto),
        success: function() {
            mostrarMensaje(
                isEdicion ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                'success'
            );
            cerrarModal();
            cargarProductos();
        },
        error: function(xhr) {
            const mensaje = xhr.responseJSON?.mensaje || 'Error al guardar el producto';
            mostrarMensaje(mensaje, 'error');
        }
    });
}

// Activar producto
function activarProducto(idProducto) {
    if (!confirm('¿Estás seguro de activar este producto?')) return;

    $.ajax({
        url: `/admin/productos/api/activar/${idProducto}`,
        method: 'PUT',
        success: function() {
            mostrarMensaje('Producto activado correctamente', 'success');
            cargarProductos();
        },
        error: function() {
            mostrarMensaje('Error al activar el producto', 'error');
        }
    });
}

// Desactivar producto
function desactivarProducto(idProducto) {
    if (!confirm('¿Estás seguro de desactivar este producto?')) return;

    $.ajax({
        url: `/admin/productos/api/desactivar/${idProducto}`,
        method: 'PUT',
        success: function() {
            mostrarMensaje('Producto desactivado correctamente', 'success');
            cargarProductos();
        },
        error: function() {
            mostrarMensaje('Error al desactivar el producto', 'error');
        }
    });
}

// Mostrar modal agregar stock
function mostrarModalStock(idProducto, nombreProducto) {
    $('#idProductoStock').val(idProducto);
    $('#nombreProductoStock').text(`Producto: ${nombreProducto}`);
    $('#cantidadStock').val('');
    $('#modalStock').fadeIn();
}

// Agregar stock
function agregarStock() {
    const idProducto = $('#idProductoStock').val();
    const cantidad = parseInt($('#cantidadStock').val());

    $.ajax({
        url: `/admin/productos/api/agregar-stock/${idProducto}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ cantidad: cantidad }),
        success: function() {
            mostrarMensaje(`Se agregaron ${cantidad} unidades al inventario`, 'success');
            cerrarModalStock();
            cargarProductos();
        },
        error: function() {
            mostrarMensaje('Error al agregar stock', 'error');
        }
    });
}

// Cerrar modal producto
function cerrarModal() {
    $('#modalProducto').fadeOut();
    $('#formProducto')[0].reset();
}

// Cerrar modal stock
function cerrarModalStock() {
    $('#modalStock').fadeOut();
    $('#formStock')[0].reset();
}

// Mostrar mensaje toast
function mostrarMensaje(mensaje, tipo) {
    // Crear elemento del mensaje
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

// Animación para los mensajes
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
    .btn-stock {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    .btn-stock:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .btn-secondary.activo {
        background: #ffc107;
        color: #1a1a2e;
    }
`;
document.head.appendChild(style);
