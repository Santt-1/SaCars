$(document).ready(function () {

    // ---------------------- AUTOCARGAR DATOS DEL USUARIO ----------------------
    function cargarUsuario() {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            alert("Debes iniciar sesión para comprar.");
            window.location.href = "/auth/login";
            return;
        }

        $("#nombre").val(usuario.nombre + " " + usuario.apellido);
        $("#telefono").val(usuario.telefono);
        $("#email").val(usuario.correo);
        $("#dni").val(usuario.dni);

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


    // ---------------------------- MOSTRAR PRODUCTOS ---------------------------
    function mostrarProductosCheckout(carrito) {
        const contenedor = $("#checkout-productos");
        contenedor.empty();

        carrito.forEach(producto => {
            const item = `
                <div class="checkout-producto-item">
                    <img src="${producto.imagen}" alt="${producto.titulo}">
                    <div class="checkout-producto-info">
                        <h4>${producto.titulo}</h4>
                        <p class="checkout-producto-precio">S/ ${producto.precio.toFixed(2)}</p>
                    </div>
                </div>
            `;
            contenedor.append(item);
        });
    }


    // ---------------------------- MOSTRAR TOTALES -----------------------------
    function mostrarTotalesCheckout(carrito, costoEnvio, zonaEnvio) {
        const subtotal = carrito.reduce((total, producto) => total + producto.precio, 0);
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
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const zonaEnvio = localStorage.getItem("zonaEnvio") || "No definida";
        const costoEnvio = parseFloat(localStorage.getItem("costoEnvio")) || 0;

        const direccion = $("#direccion").val().trim();
        const comentarios = $("#comentarios").val().trim();

        if (!direccion) {
            alert("Por favor ingresa una dirección.");
            return;
        }

        const codigoPostal = codigosPostales[zonaEnvio] || "00000";

        const checkoutData = {
            idUsuario: usuario.id,
            direccionEnvio: direccion,
            ciudadEnvio: zonaEnvio,
            codigoPostal: codigoPostal,

            metodoPago: "Contra entrega",
            costoEnvio: costoEnvio,

            subtotal: carrito.reduce((t, p) => t + p.precio, 0),
            total: carrito.reduce((t, p) => t + p.precio, 0) + costoEnvio,
            dniCliente: usuario.dni,
            items: carrito.map(p => ({
                idProducto: p.idProducto,
                cantidad: 1,
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
            alert("Error al procesar el pedido.");
            return;
        }


        // ------------------------------ MENSAJE WHATSAPP -----------------------
        let mensaje = `🧾 *PEDIDO REALIZADO*\n`;
        mensaje += `Factura: ${respuesta.numeroFactura}\n\n`;
        mensaje += `📍 Dirección: ${direccion}\n`;
        mensaje += `🚚 Zona: ${zonaEnvio}\n\n`;

        mensaje += `📦 *PRODUCTOS:*\n`;
        carrito.forEach((p, i) => {
            mensaje += `${i + 1}. ${p.titulo} - S/ ${p.precio.toFixed(2)}\n`;
        });

        mensaje += `\n💰 *TOTAL:* S/ ${(checkoutData.total).toFixed(2)}\n`;

        if (comentarios) {
            mensaje += `\n📝 Comentarios: ${comentarios}`;
        }

        const whatsappURL = `https://wa.me/51918341898?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappURL, "_blank");

        alert("Pedido realizado con éxito.");

        localStorage.removeItem("carrito");
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
