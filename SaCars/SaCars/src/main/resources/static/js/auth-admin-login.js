// auth-admin-login.js - Login exclusivo para administradores
const API_URL = "http://localhost:8082/api";

console.log("📄 Archivo auth-admin-login.js cargado");
console.log("🔗 API_URL:", API_URL);

jQuery(document).ready(function ($) {
    console.log("✅ jQuery ready - Auth Admin Login cargado");
    console.log("📝 Formulario encontrado:", $("#admin-login-form").length > 0 ? "SÍ" : "NO");

    // Verificar si ya hay sesión activa de admin
    const adminUsuario = localStorage.getItem("admin_usuario");
    if (adminUsuario) {
        try {
            const user = JSON.parse(adminUsuario);
            if (user.rol === 'administrador') {
                console.log("Admin ya autenticado, redirigiendo...");
                window.location.href = "/admin/dashboard";
                return;
            }
        } catch (e) {
            console.error("Error al parsear usuario:", e);
            localStorage.removeItem('admin_usuario');
            localStorage.removeItem('admin_token');
        }
    }

    // ---------------------------
    // LOGIN ADMIN
    // ---------------------------
    $("#admin-login-form").on("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("🔐 Iniciando login admin...");
        console.log("✅ preventDefault ejecutado correctamente");

        const email = $("#admin-email").val().trim();
        const password = $("#admin-password").val();

        // Validación básica
        if (!email || !password) {
            $("#admin-login-error").text("Por favor completa todos los campos").addClass('show');
            return;
        }

        console.log("Enviando credenciales admin:", email);

        // Limpiar mensaje de error previo
        $("#admin-login-error").text("").removeClass('show');

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
                        $("#admin-login-error").html(
                            '<span style="color: #e74c3c;">⛔ Acceso denegado. Esta sección es solo para administradores. ' +
                            '<a href="/auth/login" style="color: #ffc107; font-weight: bold;">Ir al login de clientes</a></span>'
                        ).addClass('show');
                        
                        // NO redirigir automáticamente
                        return;
                    }

                    // Guardar token de admin
                    localStorage.setItem("admin_token", response.data.token);

                    // Guardar usuario admin en localStorage (key separada)
                    localStorage.setItem("admin_usuario", JSON.stringify({
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
                    $("#admin-login-error").text(response.message || "Credenciales incorrectas").addClass('show');
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

                $("#admin-login-error").text(mensaje).addClass('show');
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
