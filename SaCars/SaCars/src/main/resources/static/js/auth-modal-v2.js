const API_URL = 'http://localhost:8082/api';            
$(document).ready(function() {
    // Abrir modal de login desde botón
    $('#btn-login').click(function(e) {
        e.preventDefault();
        $('#modal-login').fadeIn();
        $('#modal-login').attr('aria-hidden', 'false');
    });

    // Cerrar modal de login
    $('#modal-login .modal-cerrar').click(function() {
        $('#modal-login').fadeOut();
        $('#modal-login').attr('aria-hidden', 'true');
    });

    // Cambiar entre tabs (Login/Registro)
    $('#modal-login .tab-button').click(function() {
        const tab = $(this).data('tab');
        
        $('#modal-login .tab-button').removeClass('active');
        $(this).addClass('active');
        
        $('#modal-login .auth-form').removeClass('active');
        $('#' + tab).addClass('active');
    });

    // Enviar formulario de LOGIN
    $('#form-login').submit(function(e) {
        e.preventDefault();
        
        const email = $('#login-email').val();
        const password = $('#login-password').val();
        
        if (!email || !password) {
            mostrarError('#login-error', 'Por favor completa todos los campos');
            return;
        }

        $.ajax({
            type: 'POST',
            url: API_URL + '/auth/login',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            success: function(response) {
                if (response.success) {
                    // Guardar datos en localStorage
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
                    localStorage.setItem('rol', response.data.usuario.rol);
                    
                    // Cerrar modal
                    $('#modal-login').fadeOut();
                    
                    // Actualizar UI
                    verificarAutenticacion();
                    
                    // Mensaje de bienvenida
                    alert('¡Bienvenido ' + response.data.usuario.nombre + '!');
                    
                    // Limpiar formulario
                    $('#form-login')[0].reset();
                } else {
                    mostrarError('#login-error', response.message || 'Email o contraseña incorrectos');
                }
            },
            error: function(xhr) {
                console.error('Error:', xhr);
                mostrarError('#login-error', 'Error al conectar. ¿Spring Boot está en puerto 8081?');
            }
        });
    });

    // Enviar formulario de REGISTRO
    $('#form-registro').submit(function(e) {
        e.preventDefault();
        
        const nombre = $('#registro-nombre').val();
        const email = $('#registro-email').val();
        const telefono = $('#registro-telefono').val();
        const password = $('#registro-password').val();
        const password2 = $('#registro-password2').val();

        if (!nombre || !email || !telefono || !password || !password2) {
            mostrarError('#registro-error', 'Por favor completa todos los campos');
            return;
        }

        if (password !== password2) {
            mostrarError('#registro-error', 'Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            mostrarError('#registro-error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        $.ajax({
            type: 'POST',
            url: API_URL + '/auth/registro',
            contentType: 'application/json',
            data: JSON.stringify({
                nombre: nombre,
                email: email,
                telefono: telefono,
                password: password
            }),
            success: function(response) {
                if (response.success) {
                    alert('¡Registro exitoso! Por favor inicia sesión');
                    
                    // Cambiar a tab de login
                    $('#modal-login [data-tab="login-form"]').click();
                    
                    // Limpiar formulario de registro
                    $('#form-registro')[0].reset();
                } else {
                    mostrarError('#registro-error', response.message || 'Error en registro');
                }
            },
            error: function() {
                mostrarError('#registro-error', 'Error al conectar con el servidor');
            }
        });
    });

    // Cerrar modal al hacer click fuera
    $(window).click(function(event) {
        const modal = $('#modal-login')[0];
        if (event.target == modal) {
            $(modal).fadeOut();
            $(modal).attr('aria-hidden', 'true');
        }
    });
});

function mostrarError(selector, mensaje) {
    const errorEl = $(selector);
    errorEl.text(mensaje).addClass('show');
    setTimeout(() => {
        errorEl.removeClass('show');
    }, 5000);
}
