$(document).ready(function() {

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

        $("#zona-entrega").val(zonaEnvio + (costoEnvio > 0 ? ` - S/ ${costoEnvio.toFixed(2)}` : ""));
    }

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

    // -------------------------------------------------------------
    // 🚀 FORMULARIO DE CHECKOUT CON INTEGRACIÓN BACKEND + FACTURA
    // -------------------------------------------------------------
    $("#form-checkout").on("submit", async function(e) {
        e.preventDefault();

        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const zonaEnvio = localStorage.getItem("zonaEnvio") || "No definida";
        const costoEnvio = parseFloat(localStorage.getItem("costoEnvio")) || 0;

        const nombre = $("#nombre").val().trim();
        const telefono = $("#telefono").val().trim();
        const email = $("#email").val().trim();
        const direccion = $("#direccion").val().trim();
        const comentarios = $("#comentarios").val().trim();

        if (!nombre || !telefono || !direccion) {
            alert("Por favor completa todos los campos obligatorios (*)");
            return;
        }

        // Obtener usuario logueado
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) {
            alert("Debes iniciar sesión para realizar una compra.");
            window.location.href = "/auth/login";
            return;
        }

        // Crear el JSON que espera tu backend
        const checkoutData = {
            idUsuario: usuario.idUsuario,         
            direccionEnvio: direccion,
            ciudadEnvio: zonaEnvio,
            codigoPostal: "00000",

            metodoPago: "Contra entrega",
            costoEnvio: costoEnvio,

            subtotal: carrito.reduce((t, p) => t + p.precio, 0),
            total: carrito.reduce((t, p) => t + p.precio, 0) + costoEnvio,

            items: carrito.map(p => ({
                idProducto: p.id,
                cantidad: 1,
                precioUnitario: p.precio
            }))
        };


        let respuesta;
        try {

            respuesta = await fetch("http://localhost:8082/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Si usas token:
                    // "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(checkoutData)
            }).then(r => r.json());

        } catch (err) {
            console.error(err);
            alert("Hubo un error con el servidor.");
            return;
        }

        if (!respuesta.success) {
            alert("Error al procesar el pedido.");
            return;
        }

        // -------------------------------------------------------
        // 🚀  El backend ya generó Pedido + Factura con número B001-000001
        // -------------------------------------------------------

        const numeroFactura = respuesta.numeroFactura;

        // Armar mensaje de WhatsApp FINAL
        let mensaje = `🧾 *BOLETA GENERADA*\n`;
        mensaje += `*N°:* ${numeroFactura}\n\n`;

        mensaje += `🛒 *COMPRA REALIZADA*\n\n`;
        mensaje += `👤 *Cliente:* ${nombre}\n`;
        mensaje += `📱 *Teléfono:* ${telefono}\n`;
        if (email) mensaje += `📧 *Email:* ${email}\n`;
        mensaje += `📍 *Dirección:* ${direccion}\n`;
        mensaje += `🚚 *Zona:* ${zonaEnvio}\n\n`;

        mensaje += `📦 *PRODUCTOS:*\n`;
        carrito.forEach((p, i) => {
            mensaje += `${i + 1}. ${p.titulo} - S/ ${p.precio.toFixed(2)}\n`;
        });

        mensaje += `\n💰 *TOTAL:* S/ ${(checkoutData.total).toFixed(2)}\n`;

        if (comentarios) {
            mensaje += `\n📝 *Comentarios:* ${comentarios}`;
        }

        // Abrir WhatsApp
        const numeroWhatsApp = "51918341898";
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

        window.open(urlWhatsApp, "_blank");

        alert("¡Pedido enviado correctamente! Se te ha generado tu boleta.");
        localStorage.removeItem("carrito");
    });

    // ---------------------- ZONA DE ENVÍO ------------------------
    $("#btn-cambiar-zona").on("click", function() {
        $("#modal-envio").addClass("modal-visible");
    });

    $(".zona-item:not(.zona-otros)").on("click", function() {
        const zona = $(this).data("zona");
        const costo = $(this).data("costo");

        localStorage.setItem("zonaEnvio", zona);
        localStorage.setItem("costoEnvio", costo);

        cargarDatosCheckout();

        $("#modal-envio").removeClass("modal-visible");
        alert(`Zona de envío cambiada a: ${zona} - S/ ${costo}.00`);
    });

    $(".modal-cerrar-envio").on("click", function() {
        $("#modal-envio").removeClass("modal-visible");
    });

    $("#modal-envio").on("click", function(e) {
        if (e.target === this) {
            $(this).removeClass("modal-visible");
        }
    });

    $(".boton-whatsapp").on("click", function(e) {
        e.stopPropagation();
        const mensaje = encodeURIComponent("Hola! Quisiera consultar el costo de envío para otra zona.");
        const numeroWhatsApp = "51918341898";
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, "_blank");
    });

    cargarDatosCheckout();
});
