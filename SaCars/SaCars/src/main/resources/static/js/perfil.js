$(function () {

    // Helpers
    function getUsuarioLocal() {
        try {
            return JSON.parse(localStorage.getItem("usuario"));
        } catch (e) {
            return null;
        }
    }

    function formatCurrency(v) {
        return 'S/ ' + Number(v || 0).toFixed(2);
    }

    function showAlerta(tipo, texto) {
        const $a = $("#alerta-info");
        $a.removeClass("exito error").addClass(tipo).text(texto).show();
        setTimeout(() => $a.fadeOut(400), 4000);
    }

    // Auth UI
    function initAuthUI() {
        const usuario = getUsuarioLocal();
        if (usuario) {
            $("#usuario-conectado").show();
            $("#nombre-usuario").text((usuario.nombre ? usuario.nombre : "") + (usuario.apellido ? " " + usuario.apellido : ""));
            $("#btn-login").hide();
            $("#btn-logout").show();
        } else {
            $("#usuario-conectado").hide();
            $("#btn-login").show();
            $("#btn-logout").hide();
        }

        $("#btn-logout").off("click").on("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("usuario");
            // opcional: limpiar carrito
            // localStorage.removeItem("carrito");
            window.location.href = "/";
        });
    }

    // Pestañas
    $(".perfil-tab-btn").on("click", function () {
        const tab = $(this).data("tab");
        $(".perfil-tab-btn").removeClass("activo");
        $(this).addClass("activo");
        $(".perfil-seccion").removeClass("activo");
        if (tab === "informacion") {
            $("#tab-informacion").addClass("activo");
        } else {
            $("#tab-pedidos").addClass("activo");
        }
    });

    // Cargar perfil desde backend
    async function cargarPerfil() {
        const usuarioLocal = getUsuarioLocal();
        if (!usuarioLocal || !usuarioLocal.id) {
            alert("Debes iniciar sesión para ver tu perfil.");
            window.location.href = "/auth/login";
            return;
        }
        const id = usuarioLocal.id;
        try {
            const res = await fetch(`http://localhost:8082/api/usuarios/${id}`);
            if (!res.ok) throw new Error("No se pudo obtener perfil");
            const usuario = await res.json();

            // Rellenar formulario
            $("#nombre").val(usuario.nombre || "");
            $("#apellido").val(usuario.apellido || "");
            $("#email").val(usuario.correo || usuario.email || "");
            $("#telefono").val(usuario.telefono || "");
            $("#dni").val(usuario.dni || "");
            $("#direccion").val(usuario.direccion || "");

            // sincronizar localStorage
            const sync = {
                id: usuario.id ?? id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                telefono: usuario.telefono,
                correo: usuario.correo ?? usuario.email,
                dni: usuario.dni
            };
            localStorage.setItem("usuario", JSON.stringify(sync));
            initAuthUI();
        } catch (err) {
            console.error(err);
            showAlerta("error", "No se pudo cargar el perfil.");
            // fallback a localStorage si existe
            if (usuarioLocal) {
                $("#nombre").val(usuarioLocal.nombre || "");
                $("#apellido").val(usuarioLocal.apellido || "");
                $("#email").val(usuarioLocal.correo || "");
                $("#telefono").val(usuarioLocal.telefono || "");
                $("#dni").val(usuarioLocal.dni || "");
                initAuthUI();
            }
        }
    }

    // Guardar perfil (PUT)
    async function guardarPerfil(e) {
        e && e.preventDefault();
        const usuarioLocal = getUsuarioLocal();
        if (!usuarioLocal || !usuarioLocal.id) {
            alert("Debes iniciar sesión.");
            window.location.href = "/auth/login";
            return;
        }
        const id = usuarioLocal.id;
        const payload = {
            nombre: $("#nombre").val().trim(),
            apellido: $("#apellido").val().trim(),
            correo: $("#email").val().trim(),
            telefono: $("#telefono").val().trim(),
            dni: $("#dni").val().trim(),
            direccion: $("#direccion").val().trim()
        };

        try {
            const res = await fetch(`http://localhost:8082/api/usuarios/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || "Error al guardar");
            }
            const actualizado = await res.json();
            const nuevo = {
                id: actualizado.id ?? id,
                nombre: actualizado.nombre ?? payload.nombre,
                apellido: actualizado.apellido ?? payload.apellido,
                telefono: actualizado.telefono ?? payload.telefono,
                correo: actualizado.correo ?? payload.correo,
                dni: actualizado.dni ?? payload.dni
            };
            localStorage.setItem("usuario", JSON.stringify(nuevo));
            showAlerta("exito", "Perfil actualizado correctamente.");
            initAuthUI();
        } catch (err) {
            console.error(err);
            showAlerta("error", "No se pudo actualizar el perfil.");
        }
    }

    // Cancelar cambios -> recarga perfil
    $("#btn-cancelar").on("click", function (e) {
        e.preventDefault();
        cargarPerfil();
    });

    $("#btn-guardar").on("click", guardarPerfil);

    // Cargar pedidos del usuario
    async function cargarPedidos() {
        const usuarioLocal = getUsuarioLocal();
        if (!usuarioLocal || !usuarioLocal.id) {
            $("#pedidos-lista").html('<div class="sin-pedidos">📭 No tienes pedidos aún</div>');
            return;
        }
        const id = usuarioLocal.id;
        try {
            const res = await fetch(`http://localhost:8082/api/pedidos/usuario/${id}`);
            if (!res.ok) throw new Error("No se pudo obtener pedidos");
            const pedidos = await res.json();
            renderPedidos(pedidos);
        } catch (err) {
            console.error(err);
            $("#pedidos-lista").html('<div class="sin-pedidos">Error al cargar pedidos.</div>');
        }
    }

    function mapEstadoClass(estado) {
        if (!estado) return "estado-pendiente";
        const e = estado.toString().toLowerCase();
        if (e.includes("pend")) return "estado-pendiente";
        if (e.includes("proc") || e.includes("proces")) return "estado-procesando";
        if (e.includes("env") || e.includes("enviado")) return "estado-enviado";
        if (e.includes("entreg") || e.includes("entregado")) return "estado-entregado";
        return "estado-pendiente";
    }

    function renderPedidos(pedidos) {
        const $cont = $("#pedidos-lista");
        $cont.empty();
        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            $cont.html('<div class="sin-pedidos">📭 No tienes pedidos aún</div>');
            return;
        }
        pedidos.forEach(p => {
            const factura = p.numeroFactura ?? p.id ?? "-";
            const fecha = new Date(p.fechaCreacion || p.fecha || Date.now()).toLocaleString();
            const total = formatCurrency(p.total ?? p.monto ?? 0);
            const estado = p.estado ?? p.estadoPedido ?? "Pendiente";
            const estadoClass = mapEstadoClass(estado);

            const $card = $(`
                <div class="pedido-card" data-pedido-id="${p.id ?? p.numeroFactura}">
                    <div class="pedido-header">
                        <div class="pedido-numero">Factura: ${factura}</div>
                        <div class="pedido-estado ${estadoClass}">${estado}</div>
                    </div>
                    <div class="pedido-detalles">
                        <div><strong>Fecha:</strong> ${fecha}</div>
                        <div style="text-align:right;"><strong>Total:</strong> <span class="pedido-total">${total}</span></div>
                    </div>
                </div>
            `);
            $card.on("click", function () {
                abrirModalPedido(p.id ?? p.numeroFactura);
            });
            $cont.append($card);
        });
    }

    // Modal pedido: carga detalle si es necesario
    async function abrirModalPedido(pedidoId) {
        if (!pedidoId) return;
        $("#modal-pedido").addClass("activo");
        $("#modal-factura").text("Cargando...");
        $("#modal-fecha").text("");
        $("#modal-estado").text("");
        $("#modal-direccion").text("");
        $("#modal-zona").text("");
        $("#modal-productos").empty();
        $("#modal-total").text("");

        try {
            const res = await fetch(`http://localhost:8082/api/pedidos/${pedidoId}`);
            if (!res.ok) throw new Error("No se pudo obtener detalle del pedido");
            const p = await res.json();

            $("#modal-factura").text(p.numeroFactura ?? p.id ?? "-");
            $("#modal-fecha").text(new Date(p.fechaCreacion || p.fecha || Date.now()).toLocaleString());
            $("#modal-estado").text(p.estado ?? p.estadoPedido ?? "Pendiente");
            $("#modal-direccion").text(p.direccionEnvio ?? p.direccion ?? "-");
            $("#modal-zona").text(p.ciudadEnvio ?? p.zona ?? "-");

            const items = p.items ?? p.detalle ?? [];
            if (!Array.isArray(items) || items.length === 0) {
                $("#modal-productos").html("<p>No hay productos listados.</p>");
            } else {
                items.forEach(it => {
                    // intentar normalizar campos
                    const titulo = it.titulo ?? it.nombre ?? it.productoNombre ?? ("ID " + (it.idProducto ?? it.productoId ?? ""));
                    const cantidad = it.cantidad ?? it.cant ?? 1;
                    const precio = it.precioUnitario ?? it.precio ?? it.precioUnit ?? it.subtotal ?? 0;
                    const $item = $(`
                        <div class="producto-item">
                            <div class="producto-info">
                                <h4>${titulo}</h4>
                                <p>Cantidad: ${cantidad}</p>
                            </div>
                            <div class="producto-precio">${formatCurrency(precio)}</div>
                        </div>
                    `);
                    $("#modal-productos").append($item);
                });
            }
            $("#modal-total").text(formatCurrency(p.total ?? p.monto ?? 0));
        } catch (err) {
            console.error(err);
            $("#modal-productos").html("<p>Error al cargar productos del pedido.</p>");
            $("#modal-factura").text(pedidoId);
        }
    }

    // Cerrar modal
    function cerrarModalPedido() {
        $("#modal-pedido").removeClass("activo");
    }
    // Exponer para el onclick inline en HTML
    window.cerrarModalPedido = cerrarModalPedido;

    // Cerrar al click en fondo
    $("#modal-pedido").on("click", function (e) {
        if (e.target === this) cerrarModalPedido();
    });
    // Cerrar con ESC
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") cerrarModalPedido();
    });

    // Inicialización
    initAuthUI();
    cargarPerfil();
    cargarPedidos();

});
