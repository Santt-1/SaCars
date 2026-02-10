/**
 * Gestión de Categorías - Panel Administrativo
 * SaCars
 */

$(document).ready(function() {
    verificarAutenticacionAdmin();
    cargarCategorias();

    // Buscar categorías
    let timeoutBusqueda;
    $('#buscarCategoria').on('input', function() {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            const termino = $(this).val().trim();
            if (termino.length >= 2) {
                buscarCategorias(termino);
            } else if (termino.length === 0) {
                cargarCategorias();
            }
        }, 500);
    });

    // Botón nueva categoría
    $('#btnNuevaCategoria').on('click', function() {
        mostrarModalCrear();
    });

    // Submit formulario
    $('#formCategoria').on('submit', function(e) {
        e.preventDefault();
        guardarCategoria();
    });

    // Preview de imagen
    $('#imagenUrl').on('input', function() {
        const url = $(this).val().trim();
        if (url) {
            $('#previewImagen').attr('src', url);
            $('#previewContainer').fadeIn();
        } else {
            $('#previewContainer').fadeOut();
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

// Cargar todas las categorías
function cargarCategorias() {
    $.ajax({
        url: '/admin/categorias/api/listar',
        method: 'GET',
        beforeSend: function() {
            $('#tablaCategorias').html('<tr><td colspan="6" class="loading">Cargando categorías...</td></tr>');
        },
        success: function(data) {
            mostrarCategorias(data);
        },
        error: function() {
            $('#tablaCategorias').html('<tr><td colspan="6" class="empty-state">Error al cargar categorías</td></tr>');
        }
    });
}

// Buscar categorías
function buscarCategorias(termino) {
    $.ajax({
        url: '/admin/categorias/api/buscar',
        method: 'GET',
        data: { texto: termino },
        success: function(data) {
            mostrarCategorias(data);
        },
        error: function() {
            $('#tablaCategorias').html('<tr><td colspan="6" class="empty-state">Error en la búsqueda</td></tr>');
        }
    });
}

// Mostrar categorías en tabla
function mostrarCategorias(categorias) {
    const tbody = $('#tablaCategorias');
    tbody.empty();

    if (categorias.length === 0) {
        tbody.html('<tr><td colspan="6" class="empty-state">No se encontraron categorías</td></tr>');
        return;
    }

    categorias.forEach(categoria => {
        // Imagen
        const imagen = categoria.imagenUrl 
            ? `<img src="${categoria.imagenUrl}" alt="${categoria.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">`
            : '<div style="width: 60px; height: 60px; background: #eee; border-radius: 5px; display: flex; align-items: center; justify-content: center;">📁</div>';

        // Cantidad de productos
        const cantidadProductos = categoria.cantidadProductos || 0;
        const badgeProductos = cantidadProductos > 0 
            ? `<span class="badge badge-info">${cantidadProductos}</span>`
            : '<span class="badge badge-secondary">0</span>';

        const fila = `
            <tr>
                <td><strong>${categoria.idCategoria}</strong></td>
                <td>${imagen}</td>
                <td><strong>${categoria.nombre}</strong></td>
                <td>${categoria.descripcion || '-'}</td>
                <td>${badgeProductos}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarCategoria(${categoria.idCategoria})" title="Editar">
                        ✏️
                    </button>
                    ${cantidadProductos === 0 
                        ? `<button class="btn-action btn-delete" onclick="eliminarCategoria(${categoria.idCategoria})" title="Eliminar">🗑️</button>`
                        : `<button class="btn-action btn-disabled" title="No se puede eliminar (tiene productos asociados)" disabled>🗑️</button>`
                    }
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

// Mostrar modal para crear categoría
function mostrarModalCrear() {
    $('#tituloModal').text('Nueva Categoría');
    $('#formCategoria')[0].reset();
    $('#idCategoria').val('');
    $('#previewContainer').hide();
    $('#modalCategoria').fadeIn();
}

// Editar categoría
function editarCategoria(idCategoria) {
    $.ajax({
        url: `/admin/categorias/api/${idCategoria}`,
        method: 'GET',
        success: function(categoria) {
            $('#tituloModal').text('Editar Categoría');
            $('#idCategoria').val(categoria.idCategoria);
            $('#nombre').val(categoria.nombre);
            $('#descripcion').val(categoria.descripcion);
            $('#imagenUrl').val(categoria.imagenUrl);
            
            if (categoria.imagenUrl) {
                $('#previewImagen').attr('src', categoria.imagenUrl);
                $('#previewContainer').show();
            }
            
            $('#modalCategoria').fadeIn();
        },
        error: function() {
            mostrarMensaje('Error al cargar la categoría', 'error');
        }
    });
}

// Guardar categoría (crear o editar)
function guardarCategoria() {
    const idCategoria = $('#idCategoria').val();
    const isEdicion = idCategoria !== '';

    const categoria = {
        nombre: $('#nombre').val(),
        descripcion: $('#descripcion').val(),
        imagenUrl: $('#imagenUrl').val()
    };

    const url = isEdicion 
        ? `/admin/categorias/api/editar/${idCategoria}`
        : '/admin/categorias/api/crear';
    
    const method = isEdicion ? 'PUT' : 'POST';

    $.ajax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(categoria),
        success: function() {
            mostrarMensaje(
                isEdicion ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente',
                'success'
            );
            cerrarModal();
            cargarCategorias();
        },
        error: function(xhr) {
            const mensaje = xhr.responseJSON?.mensaje || 'Error al guardar la categoría';
            mostrarMensaje(mensaje, 'error');
        }
    });
}

// Eliminar categoría
function eliminarCategoria(idCategoria) {
    if (!confirm('¿Estás seguro de eliminar esta categoría?\n\nEsta acción no se puede deshacer.')) return;

    $.ajax({
        url: `/admin/categorias/api/eliminar/${idCategoria}`,
        method: 'DELETE',
        success: function() {
            mostrarMensaje('Categoría eliminada correctamente', 'success');
            cargarCategorias();
        },
        error: function(xhr) {
            const mensaje = xhr.responseJSON?.mensaje || 'Error al eliminar la categoría. Puede que tenga productos asociados.';
            mostrarMensaje(mensaje, 'error');
        }
    });
}

// Cerrar modal
function cerrarModal() {
    $('#modalCategoria').fadeOut();
    $('#formCategoria')[0].reset();
    $('#previewContainer').hide();
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
    .btn-disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #95a5a6;
    }
    .badge-secondary {
        background: #95a5a6;
        color: white;
        padding: 5px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }
`;
document.head.appendChild(style);
