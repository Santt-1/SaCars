/**
 * Gestión de Usuarios - SaCars Admin (RQ1.5)
 * CRUD completo de usuarios
 */

let modoEdicion = false;
let usuarioActual = null;

$(document).ready(function() {
    // Verificar autenticación admin
    verificarAutenticacionAdmin();
    
    // Cargar usuarios
    cargarUsuarios();
    
    // Búsqueda en tiempo real
    $('#buscar-usuario').on('input', function() {
        const busqueda = $(this).val();
        buscarUsuarios(busqueda);
    });
});

/**
 * Cargar todos los usuarios
 */
function cargarUsuarios() {
    $.ajax({
        url: '/admin/usuarios/api/listar',
        method: 'GET',
        success: function(usuarios) {
            mostrarUsuarios(usuarios);
        },
        error: function(xhr) {
            console.error('Error al cargar usuarios:', xhr);
            $('#tabla-usuarios').html(
                '<tr><td colspan="8" style="text-align: center; color: #e74c3c;">Error al cargar usuarios</td></tr>'
            );
        }
    });
}

/**
 * Buscar usuarios por texto
 */
function buscarUsuarios(busqueda) {
    $.ajax({
        url: '/admin/usuarios/api/buscar',
        method: 'GET',
        data: { q: busqueda },
        success: function(usuarios) {
            mostrarUsuarios(usuarios);
        },
        error: function(xhr) {
            console.error('Error al buscar usuarios:', xhr);
        }
    });
}

/**
 * Mostrar usuarios en la tabla
 */
function mostrarUsuarios(usuarios) {
    const tbody = $('#tabla-usuarios');
    tbody.empty();
    
    if (!usuarios || usuarios.length === 0) {
        tbody.html('<tr><td colspan="8" style="text-align: center; color: #666;">No se encontraron usuarios</td></tr>');
        return;
    }
    
    usuarios.forEach(usuario => {
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
        const rolBadge = usuario.rol === 'administrador' 
            ? '<span class="badge badge-info">Admin</span>'
            : '<span class="badge badge-secondary">Cliente</span>';
        const estadoBadge = usuario.activo 
            ? '<span class="badge badge-success">Activo</span>'
            : '<span class="badge badge-danger">Inactivo</span>';
        
        const fila = `
            <tr>
                <td>#${usuario.idUsuario}</td>
                <td>${nombreCompleto}</td>
                <td>${usuario.dni}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefono || '-'}</td>
                <td>${rolBadge}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editarUsuario(${usuario.idUsuario})" title="Editar">
                        ✏️
                    </button>
                    ${usuario.activo ? 
                        `<button class="btn-action btn-delete" onclick="desactivarUsuario(${usuario.idUsuario})" title="Desactivar">
                            ❌
                        </button>` : 
                        `<button class="btn-action btn-complete" onclick="activarUsuario(${usuario.idUsuario})" title="Activar">
                            ✅
                        </button>`
                    }
                </td>
            </tr>
        `;
        tbody.append(fila);
    });
}

/**
 * Mostrar modal para crear usuario
 */
function mostrarModalCrear() {
    modoEdicion = false;
    usuarioActual = null;
    
    $('#modal-titulo').text('Nuevo Usuario');
    $('#form-usuario')[0].reset();
    $('#usuario-id').val('');
    $('#grupo-contrasena').show();
    $('#usuario-contrasena').attr('required', true);
    $('#usuario-rol').val('cliente');
    $('#usuario-activo').val('true');
    
    $('#modal-usuario').fadeIn(300);
}

/**
 * Editar usuario
 */
function editarUsuario(id) {
    $.ajax({
        url: `/admin/usuarios/api/${id}`,
        method: 'GET',
        success: function(usuario) {
            modoEdicion = true;
            usuarioActual = usuario;
            
            $('#modal-titulo').text('Editar Usuario');
            $('#usuario-id').val(usuario.idUsuario);
            $('#usuario-nombre').val(usuario.nombre);
            $('#usuario-apellido').val(usuario.apellido);
            $('#usuario-dni').val(usuario.dni);
            $('#usuario-email').val(usuario.email);
            $('#usuario-telefono').val(usuario.telefono || '');
            $('#usuario-direccion').val(usuario.direccion || '');
            $('#usuario-rol').val(usuario.rol);
            $('#usuario-activo').val(usuario.activo.toString());
            
            // Ocultar contraseña en edición
            $('#grupo-contrasena').hide();
            $('#usuario-contrasena').attr('required', false);
            $('#usuario-contrasena').val('');
            
            $('#modal-usuario').fadeIn(300);
        },
        error: function(xhr) {
            mostrarMensaje('Error al cargar usuario', 'error');
        }
    });
}

/**
 * Guardar usuario (crear o editar)
 */
function guardarUsuario(event) {
    event.preventDefault();
    
    const datos = {
        nombre: $('#usuario-nombre').val().trim(),
        apellido: $('#usuario-apellido').val().trim(),
        dni: $('#usuario-dni').val().trim(),
        email: $('#usuario-email').val().trim(),
        telefono: $('#usuario-telefono').val().trim(),
        direccion: $('#usuario-direccion').val().trim(),
        rol: $('#usuario-rol').val(),
        activo: $('#usuario-activo').val() === 'true'
    };
    
    // Agregar contraseña solo al crear
    if (!modoEdicion) {
        const contrasena = $('#usuario-contrasena').val();
        if (!contrasena || contrasena.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        datos.contrasena = contrasena;
    }
    
    const url = modoEdicion 
        ? `/admin/usuarios/api/editar/${$('#usuario-id').val()}`
        : '/admin/usuarios/api/crear';
    const metodo = modoEdicion ? 'PUT' : 'POST';
    
    $.ajax({
        url: url,
        method: metodo,
        contentType: 'application/json',
        data: JSON.stringify(datos),
        success: function() {
            mostrarMensaje(
                modoEdicion ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
                'success'
            );
            cerrarModal();
            cargarUsuarios();
        },
        error: function(xhr) {
            const mensaje = xhr.responseJSON?.error || 'Error al guardar usuario';
            mostrarMensaje(mensaje, 'error');
        }
    });
}

/**
 * Activar usuario
 */
function activarUsuario(id) {
    if (!confirm('¿Activar este usuario?')) return;
    
    $.ajax({
        url: `/admin/usuarios/api/activar/${id}`,
        method: 'PUT',
        success: function() {
            mostrarMensaje('Usuario activado correctamente', 'success');
            cargarUsuarios();
        },
        error: function(xhr) {
            const mensaje = xhr.responseJSON?.error || 'Error al activar usuario';
            mostrarMensaje(mensaje, 'error');
        }
    });
}

/**
 * Desactivar usuario
 */
function desactivarUsuario(id) {
    if (!confirm('¿Desactivar este usuario? No podrá iniciar sesión pero sus datos se mantendrán.')) return;
    
    $.ajax({
        url: `/admin/usuarios/api/desactivar/${id}`,
        method: 'PUT',
        success: function() {
            mostrarMensaje('Usuario desactivado correctamente', 'success');
            cargarUsuarios();
        },
        error: function(xhr) {
            const mensaje = xhr.responseJSON?.error || 'Error al desactivar usuario';
            mostrarMensaje(mensaje, 'error');
        }
    });
}

/**
 * Cerrar modal
 */
function cerrarModal() {
    $('#modal-usuario').fadeOut(300);
    $('#form-usuario')[0].reset();
    modoEdicion = false;
    usuarioActual = null;
}

/**
 * Verificar autenticación admin
 */
function verificarAutenticacionAdmin() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!usuario.correo || usuario.rol !== 'administrador') {
        window.location.href = '/admin/login';
        return;
    }
    
    $('#admin-email').text(usuario.correo);
}

/**
 * Cerrar sesión
 */
function cerrarSesionAdmin() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        window.location.href = '/';
    }
}

/**
 * Mostrar mensaje toast
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

// Cerrar modal al hacer clic fuera
$(document).on('click', '.modal', function(e) {
    if (e.target === this) {
        cerrarModal();
    }
});
