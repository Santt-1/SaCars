// auth-admin-login.js - Login exclusivo para administradores
const API_URL = "http://localhost:8082/api";

jQuery(document).ready(function ($) {
    console.log("✅ Auth Admin Login cargado");

    // Verificar si ya hay sesión activa de admin
    const usuarioActual = localStorage.getItem("usuario");
    if (usuarioActual) {
        try {
            const user = JSON.parse(usuarioActual);
            if (user.rol === 'administrador') {
                console.log("Admin ya autenticado, redirigiendo...");
                window.location.href = "/admin/dashboard";
                return;
            }
        } catch (e) {
            console.error("Error al parsear usuario:", e);
            localStorage.clear();
        }
    }

    // ---------------------------
    // LOGIN ADMIN
    // ---------------------------
    $("#admin-login-form").submit(function (e) {
        e.preventDefault();
        console.log("🔐 Iniciando login admin...");

        const email = $("#admin-email").val().trim();
        const password = $("#admin-password").val();

        // Validación básica
        if (!email || !password) {
            $("#admin-login-error").text("Por favor completa todos los campos");
            return;
        }

        console.log("Enviando credenciales admin:", email);

        // Limpiar mensaje de error previo
        $("#admin-login-error").text("");

        $.ajax({
            type: "POST",
            url: API_URL + "/auth/login",
            contentType: "application/json",
            data: JSON.stringify({ email, password }),

            success: function (response) {
                console.log("✅ Respuesta del servidor:", response);

                if (response.success) {
                    const u = response.data.usuario;
                    console.log("Usuario recibido:", u);
                    console.log("Rol del usuario:", u.rol);

                    // VALIDACIÓN CRÍTICA: Solo administradores pueden acceder
                    if (u.rol !== 'administrador') {
                        console.warn("⛔ Acceso denegado: Usuario no es administrador");
                        $("#admin-login-error").text("Acceso denegado. Esta sección es solo para administradores.");
                        
                        // Opcional: Redirigir a login de clientes
                        setTimeout(function() {
                            window.location.href = "/auth/login";
                        }, 2000);
                        
                        return;
                    }

                    // Guardar token
                    localStorage.setItem("token", response.data.token);

                    // Guardar usuario en localStorage
                    localStorage.setItem("usuario", JSON.stringify({
                        id: u.idUsuario,
                        nombre: u.nombre,
                        apellido: u.apellido,
                        correo: u.email,
                        telefono: u.telefono,
                        dni: u.dni,
                        rol: u.rol
                    }));

                    console.log("✅ Admin autenticado correctamente");
                    console.log("🔄 Redirigiendo a dashboard...");

                    // Redirección al dashboard admin
                    alert("Bienvenido " + u.nombre + " " + u.apellido);
                    window.location.href = "/admin/dashboard";

                } else {
                    console.error("❌ Login fallido:", response.message);
                    $("#admin-login-error").text(response.message || "Credenciales incorrectas");
                }
            },

            error: function (xhr, status, error) {
                console.error("❌ Error en login admin:", xhr.responseText);
                console.error("Status:", status);
                console.error("Error:", error);

                let mensaje = "Error al conectar con el servidor.";
                
                if (xhr.responseJSON) {
                    mensaje = xhr.responseJSON.message || mensaje;
                }

                $("#admin-login-error").text(mensaje);
            },
        });
    });

    // Efecto de focus en inputs
    $("input").focus(function() {
        $(this).parent().addClass("focused");
    }).blur(function() {
        $(this).parent().removeClass("focused");
    });
});
