$(document).ready(function () {

    // Obtiene usuario desde localStorage
    function getUsuarioLocal() {
        return JSON.parse(localStorage.getItem("usuario"));
    }

    // Cargar perfil desde backend y rellenar formulario
    async function cargarPerfil() {
        const usuarioLocal = getUsuarioLocal();
        if (!usuarioLocal) {
            alert("Debes iniciar sesión.");
            window.location.href = "/auth/login";
            return;
        }
        const id = usuarioLocal.id;
        try {
            const res = await fetch(`http://localhost:8082/api/usuarios/${id}`);
            if (!res.ok) throw new Error("Error al obtener perfil");
            const usuario = await res.json();

            // Rellenar formulario (ajustar ids en el HTML)
            $("#profile-nombre").val(usuario.nombre || "");
            $("#profile-apellido").val(usuario.apellido || "");
            $("#profile-telefono").val(usuario.telefono || "");
            $("#profile-email").val(usuario.correo || "");
            $("#profile-dni").val(usuario.dni || "");

            // Sincronizar localStorage
            const sync = {
                id: usuario.id ?? id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                telefono: usuario.telefono,
                correo: usuario.correo,
                dni: usuario.dni
            };
            localStorage.setItem("usuario", JSON.stringify(sync));
        } catch (err) {
            console.error(err);
            alert("No se pudo cargar el perfil.");
        }
    }

    // Guardar cambios de perfil (PUT)
    async function guardarPerfil(e) {
        e.preventDefault();
        const usuarioLocal = getUsuarioLocal();
        if (!usuarioLocal) {
            alert("Debes iniciar sesión.");
            return;
        }
        const id = usuarioLocal.id;
        const payload = {
            nombre: $("#profile-nombre").val().trim(),
            apellido: $("#profile-apellido").val().trim(),
            telefono: $("#profile-telefono").val().trim(),
            correo: $("#profile-email").val().trim(),
            dni: $("#profile-dni").val().trim()
        };

        try {
            const res = await fetch(`http://localhost:8082/api/usuarios/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Error al guardar perfil");
            }
            const actualizado = await res.json();

            // Actualizar localStorage y mostrar confirmación
            const nuevo = {
                id: actualizado.id ?? id,
                nombre: actualizado.nombre ?? payload.nombre,
                apellido: actualizado.apellido ?? payload.apellido,
                telefono: actualizado.telefono ?? payload.telefono,
                correo: actualizado.correo ?? payload.correo,
                dni: actualizado.dni ?? payload.dni
            };
            localStorage.setItem("usuario", JSON.stringify(nuevo));
            alert("Perfil actualizado correctamente.");
        } catch (err) {
            console.error(err);
            alert("No se pudo actualizar el perfil.");
        }
    }

    // Cargar pedidos del usuario y mostrarlos en #pedidos-list
    async function cargarPedidos() {
        const usuarioLocal = getUsuarioLocal();
        if (!usuarioLocal) return;
        const id = usuarioLocal.id;
        try {
            const res = await fetch(`http://localhost:8082/api/pedidos/usuario/${id}`);
            if (!res.ok) throw new Error("Error al obtener pedidos");
            const pedidos = await res.json();

            const cont = $("#pedidos-list");
            cont.empty();

            if (!Array.isArray(pedidos) || pedidos.length === 0) {
                cont.append("<p>No tienes pedidos aún.</p>");
                return;
            }

            pedidos.forEach(p => {
                // Ajustar según la estructura real del pedido devuelto por el backend
                const fecha = new Date(p.fechaCreacion || p.fecha || Date.now()).toLocaleString();
                const total = (p.total ?? p.monto ?? 0).toFixed(2);
                const estado = p.estado ?? p.estadoPedido ?? "Pendiente";
                let html = `
                    <div class="pedido-item">
                        <div><strong>Factura:</strong> ${p.numeroFactura ?? p.id ?? "-"}</div>
                        <div><strong>Fecha:</strong> ${fecha}</div>
                        <div><strong>Total:</strong> S/ ${total}</div>
                        <div><strong>Estado:</strong> ${estado}</div>
                    </div>
                `;
                cont.append(html);
            });
        } catch (err) {
            console.error(err);
            $("#pedidos-list").empty().append("<p>Error al cargar pedidos.</p>");
        }
    }

    // Bind eventos
    $("#form-perfil").on("submit", guardarPerfil); // formulario con id form-perfil
    $("#btn-actualizar-pedidos").on("click", cargarPedidos); // botón opcional para recargar pedidos

    // Inicializar
    cargarPerfil();
    cargarPedidos();

});
