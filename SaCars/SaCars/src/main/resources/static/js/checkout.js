$(document).ready(function () {

    // ---------------------- AUTOCARGAR DATOS DEL USUARIO ----------------------
    function cargarUsuario() {
        const usuarioLocal = JSON.parse(localStorage.getItem("cliente_usuario"));
        if (!usuarioLocal) {
            alert("Debes iniciar sesión para comprar.");
            window.location.href = "/auth/login";
            return;
        }

        // Intentar obtener datos frescos desde el backend si tenemos id
        const id = usuarioLocal.id;
        if (!id) {
            // Si por alguna razón no hay id, usar localStorage antiguo
            console.log("Usuario sin ID, usando localStorage:", usuarioLocal);
            $("#nombre").val(usuarioLocal.nombre + " " + usuarioLocal.apellido);
            $("#telefono").val(usuarioLocal.telefono || '');
            $("#email").val(usuarioLocal.correo || usuarioLocal.email || '');
            $("#dni").val(usuarioLocal.dni || '');
            return;
        }

        fetch(`http://localhost:8082/api/usuarios/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("No se pudo obtener usuario");
                return res.json();
            })
            .then(usuarioBackend => {
                // Normalizar campos según respuesta del backend
                const usuario = {
                    id: usuarioBackend.id ?? id,
                    nombre: usuarioBackend.nombre ?? usuarioBackend.nombre,
                    apellido: usuarioBackend.apellido ?? usuarioBackend.apellido,
                    telefono: usuarioBackend.telefono ?? usuarioBackend.telefono,
                    correo: usuarioBackend.correo ?? usuarioBackend.email,
                    dni: usuarioBackend.dni ?? usuarioBackend.dni
                };
                // actualizar localStorage para sincronizar con cambios de perfil
                localStorage.setItem("cliente_usuario", JSON.stringify(usuario));

                console.log("Usuario desde backend:", usuario);
                $("#nombre").val(usuario.nombre + " " + usuario.apellido);
                $("#telefono").val(usuario.telefono || '');
                $("#email").val(usuario.correo || usuario.email || '');
                $("#dni").val(usuario.dni || '');
            })
            .catch(err => {
                console.warn("No se pudo sincronizar usuario:", err);
                console.log("Usuario desde localStorage:", usuarioLocal);
                // fallback a localStorage si falla
                $("#nombre").val(usuarioLocal.nombre + " " + usuarioLocal.apellido);
                $("#telefono").val(usuarioLocal.telefono || '');
                $("#email").val(usuarioLocal.correo || usuarioLocal.email || '');
                $("#dni").val(usuarioLocal.dni || '');
            });
    }

    cargarUsuario();


    // ---------------------- CODIGOS POSTALES AUTOMÁTICOS ----------------------
    const codigosPostales = {
        "Banda de Shilcayo": "22003",
        "Tarapoto": "22002",
        "Morales": "22001",
        "Otros": "00000"
    };


    // -------------------------- CARGAR DATOS DEL CHECKOUT ---------------------
    function cargarDatosCheckout() {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const zonaEnvio = localStorage.getItem("zonaEnvio") || "No definida";
        const costoEnvio = parseFloat(localStorage.getItem("costoEnvio")) || 0;

        if (carrito.length === 0) {
            alert("No tienes productos en tu carrito");
            window.location.href = "carrito.html";
            return;
        }

        mostrarProductosCheckout(carrito);
        mostrarTotalesCheckout(carrito, costoEnvio, zonaEnvio);

        $("#zona-entrega").val(zonaEnvio);
    }

    cargarDatosCheckout();


    // ---------------------- MÉTODOS DE PAGO -----------------------------------
    // Mostrar/ocultar sección de Yape/Plin según selección
    $('input[name="metodo-pago"]').on("change", function() {
        const metodoPago = $(this).val();
        if (metodoPago === "Yape/Plin") {
            $("#seccion-yape-plin").slideDown(300);
        } else {
            $("#seccion-yape-plin").slideUp(300);
            // Limpiar el input de archivo
            $("#comprobante-pago").val('');
            $("#preview-comprobante").hide();
        }
    });

    // Preview de imagen del comprobante
    $("#comprobante-pago").on("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $("#img-preview").attr("src", e.target.result);
                $("#preview-comprobante").show();
            };
            reader.readAsDataURL(file);
        } else {
            $("#preview-comprobante").hide();
        }
    });


    // ---------------------------- MOSTRAR PRODUCTOS ---------------------------
    function mostrarProductosCheckout(carrito) {
        const contenedor = $("#checkout-productos");
        contenedor.empty();

        carrito.forEach(producto => {
            const cantidad = producto.cantidad || 1;
            const precioTotal = producto.precio * cantidad;
            const item = `
                <div class="checkout-producto-item">
                    <img src="${producto.imagen}" alt="${producto.titulo}">
                    <div class="checkout-producto-info">
                        <h4>${producto.titulo}</h4>
                        <p class="checkout-producto-cantidad">Cantidad: ${cantidad}</p>
                        <p class="checkout-producto-precio">S/ ${precioTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
            contenedor.append(item);
        });
    }


    // ---------------------------- MOSTRAR TOTALES -----------------------------
    function mostrarTotalesCheckout(carrito, costoEnvio, zonaEnvio) {
        const subtotal = carrito.reduce((total, producto) => {
            const cantidad = producto.cantidad || 1;
            return total + (producto.precio * cantidad);
        }, 0);
        const total = subtotal + costoEnvio;

        $("#checkout-subtotal").text(`S/ ${subtotal.toFixed(2)}`);

        if (costoEnvio > 0) {
            $("#checkout-envio").text(`${zonaEnvio}: S/ ${costoEnvio.toFixed(2)}`);
        } else {
            $("#checkout-envio").text("Por coordinar");
        }

        $("#checkout-total").text(`S/ ${total.toFixed(2)}`);
    }


    // ------------------------------ SUBMIT CHECKOUT ---------------------------
    $("#form-checkout").on("submit", async function (e) {
        e.preventDefault();

        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const usuario = JSON.parse(localStorage.getItem("cliente_usuario"));
        const zonaEnvio = localStorage.getItem("zonaEnvio") || "No definida";
        const costoEnvio = parseFloat(localStorage.getItem("costoEnvio")) || 0;

        const direccion = $("#direccion").val().trim();
        const comentarios = $("#comentarios").val().trim();
        const metodoPago = $('input[name="metodo-pago"]:checked').val();

        if (!direccion) {
            alert("Por favor ingresa una dirección.");
            return;
        }

        // Validar comprobante si es Yape/Plin
        const comprobanteFile = $("#comprobante-pago")[0].files[0];
        if (metodoPago === "Yape/Plin" && !comprobanteFile) {
            alert("Por favor sube la captura del comprobante de pago.");
            return;
        }

        const codigoPostal = codigosPostales[zonaEnvio] || "00000";

        // Calcular subtotal considerando cantidades
        const subtotal = carrito.reduce((t, p) => t + (p.precio * (p.cantidad || 1)), 0);
        const total = subtotal + costoEnvio;

        const checkoutData = {
            idUsuario: usuario.id,
            direccionEnvio: direccion,
            ciudadEnvio: zonaEnvio,
            codigoPostal: codigoPostal,

            metodoPago: metodoPago,
            costoEnvio: costoEnvio,

            subtotal: subtotal,
            total: total,
            dniCliente: usuario.dni,
            items: carrito.map(p => ({
                idProducto: p.id,
                cantidad: p.cantidad || 1,
                precioUnitario: p.precio
            }))
        };


        // --------------------------- ENVIAR AL BACKEND -------------------------
        let respuesta;
        try {
            const res = await fetch("http://localhost:8082/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(checkoutData)
            });

            respuesta = await res.json();
        } catch (err) {
            console.error(err);
            alert("Hubo un error con el servidor.");
            return;
        }

        if (!respuesta.success) {
            alert("Error al procesar el pedido: " + (respuesta.message || ""));
            return;
        }

        // ---------------------- SUBIR COMPROBANTE SI ES YAPE/PLIN --------------
        if (metodoPago === "Yape/Plin" && comprobanteFile) {
            const formData = new FormData();
            formData.append("file", comprobanteFile);

            try {
                const resComprobante = await fetch(`http://localhost:8082/api/checkout/comprobante/${respuesta.idPedido}`, {
                    method: "POST",
                    body: formData
                });

                const comprobanteResp = await resComprobante.json();
                if (!comprobanteResp.success) {
                    console.warn("No se pudo subir el comprobante:", comprobanteResp.message);
                }
            } catch (err) {
                console.warn("Error al subir comprobante:", err);
            }
        }

        // ---------------------- LIMPIAR Y REDIRIGIR ----------------------------
        localStorage.removeItem("carrito");
        
        // Mostrar mensaje de éxito
        if (metodoPago === "Yape/Plin") {
            alert("¡Pedido realizado con éxito!\n\nTu comprobante de pago ha sido enviado y está pendiente de verificación.\n\nSerás redirigido a tu perfil donde podrás ver el estado de tu pedido.");
        } else {
            alert("¡Pedido realizado con éxito!\n\nRecuerda tener el dinero listo para el pago contra entrega.\n\nSerás redirigido a tu perfil donde podrás ver el estado de tu pedido.");
        }

        // Redirigir al perfil del cliente (pestaña de pedidos)
        window.location.href = "/perfil#pedidos";
    });


    // ------------------------------ MODAL ZONAS -------------------------------
    $("#btn-cambiar-zona").on("click", function () {
        $("#modal-envio").addClass("modal-visible");
    });

    $(".zona-item:not(.zona-otros)").on("click", function () {
        const zona = $(this).data("zona");
        const costo = $(this).data("costo");

        localStorage.setItem("zonaEnvio", zona);
        localStorage.setItem("costoEnvio", costo);

        cargarDatosCheckout();
        $("#modal-envio").removeClass("modal-visible");

        alert(`Zona de envío cambiada a: ${zona} - S/ ${costo}.00`);
    });

    $(".modal-cerrar-envio").on("click", function () {
        $("#modal-envio").removeClass("modal-visible");
    });

    $("#modal-envio").on("click", function (e) {
        if (e.target === this) {
            $(this).removeClass("modal-visible");
        }
    });

    $(".boton-whatsapp").on("click", function (e) {
        e.stopPropagation();
        const mensaje = encodeURIComponent("Hola! Quisiera consultar el costo de envío para otra zona.");
        window.open(`https://wa.me/51918341898?text=${mensaje}`, "_blank");
    });

});
