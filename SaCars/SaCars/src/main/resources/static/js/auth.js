const API_URL = 'http://localhost:8082/api';
console.log("AUTH.JS CARGADO");
$(document).ready(function() {
    // Cambiar entre pestañas
    $('.tab-button').click(function() {
        const tab = $(this).data('tab');
        
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        
        $('.auth-form').removeClass('active');
        $('#' + tab).addClass('active');
    });

    // Manejo del login
    $('#login-form').submit(function(e) {
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
                    
                    // Redirigir según rol
                    if (response.data.usuario.rol === 'administrador') {
                        alert('Bienvenido Admin');
                        window.location.href = 'index.html'; // Por ahora redirige a inicio
                    } else {
                        alert('Bienvenido ' + response.data.usuario.nombre);
                        window.location.href = 'index.html'; // Redirige a inicio como cliente
                    }
                } else {
                    mostrarError('#login-error', response.message || 'Error en login');
                }
            },
            error: function(xhr) {
                console.error('Error:', xhr);
                mostrarError('#login-error', 'Error al conectar con el servidor. ¿Está ejecutándose en puerto 8080?');
            }
        });
    });

    // Manejo del registro
    $('#registro-form').submit(function(e) {
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
                    $('.tab-button[data-tab="login"]').click();
                    $('#registro-form')[0].reset();
                } else {
                    mostrarError('#registro-error', response.message || 'Error en registro');
                }
            },
            error: function() {
                mostrarError('#registro-error', 'Error al conectar con el servidor');
            }
        });
    });
});

function mostrarError(selector, mensaje) {
    const errorEl = $(selector);
    errorEl.text(mensaje).addClass('show');
    setTimeout(() => {
        errorEl.removeClass('show');
    }, 5000);
}
