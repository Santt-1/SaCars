$(document).ready(function() {
    
    // Cargar datos del carrito y zona de envío
    function cargarDatosCheckout() {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const zonaEnvio = localStorage.getItem("zonaEnvio") || "No definida";
        const costoEnvio = parseFloat(localStorage.getItem("costoEnvio")) || 0;
        
        // Si no hay productos, redirigir al carrito
        if (carrito.length === 0) {
            alert("No tienes productos en tu carrito");
            window.location.href = "carrito.html";
            return;
        }
        
        // Mostrar productos
        mostrarProductosCheckout(carrito);
        
        // Mostrar totales
        mostrarTotalesCheckout(carrito, costoEnvio, zonaEnvio);
        
        // Llenar zona de entrega
        $("#zona-entrega").val(zonaEnvio + (costoEnvio > 0 ? ` - S/ ${costoEnvio.toFixed(2)}` : ""));
    }
    
    // Mostrar productos en el checkout
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
    
    // Mostrar totales
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
    
    // Manejar envío del formulario
    $("#form-checkout").on("submit", function(e) {
        e.preventDefault();
        
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const zonaEnvio = localStorage.getItem("zonaEnvio") || "No definida";
        const costoEnvio = parseFloat(localStorage.getItem("costoEnvio")) || 0;
        
        // Obtener datos del formulario
        const nombre = $("#nombre").val().trim();
        const telefono = $("#telefono").val().trim();
        const email = $("#email").val().trim();
        const direccion = $("#direccion").val().trim();
        const comentarios = $("#comentarios").val().trim();
        
        // Validar campos requeridos
        if (!nombre || !telefono || !direccion) {
            alert("Por favor completa todos los campos obligatorios (*)");
            return;
        }
        
        // Calcular totales
        const subtotal = carrito.reduce((total, producto) => total + producto.precio, 0);
        const total = subtotal + costoEnvio;
        
        // Crear mensaje para WhatsApp
        let mensaje = `🛒 *NUEVO PEDIDO - SACARS*\n\n`;
        mensaje += `👤 *Cliente:* ${nombre}\n`;
        mensaje += `📱 *Teléfono:* ${telefono}\n`;
        if (email) mensaje += `📧 *Email:* ${email}\n`;
        mensaje += `📍 *Dirección:* ${direccion}\n`;
        mensaje += `🚚 *Zona de envío:* ${zonaEnvio}\n\n`;
        
        mensaje += `📦 *PRODUCTOS:*\n`;
        carrito.forEach((producto, index) => {
            mensaje += `${index + 1}. ${producto.titulo} - S/ ${producto.precio.toFixed(2)}\n`;
        });
        
        mensaje += `\n💰 *RESUMEN:*\n`;
        mensaje += `• Subtotal: S/ ${subtotal.toFixed(2)}\n`;
        mensaje += `• Envío: S/ ${costoEnvio.toFixed(2)}\n`;
        mensaje += `• *Total: S/ ${total.toFixed(2)}*\n`;
        
        if (comentarios) {
            mensaje += `\n📝 *Comentarios:* ${comentarios}`;
        }
        
        // Enviar por WhatsApp
        const numeroWhatsApp = "51918341898";
        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
        
        // Abrir WhatsApp
        window.open(urlWhatsApp, "_blank");
        
        // Mostrar confirmación
        alert("¡Pedido enviado! Te redirigiremos a WhatsApp para confirmar tu compra.");

    });
    
    // Botón para cambiar zona de envío
    $("#btn-cambiar-zona").on("click", function() {
        $("#modal-envio").addClass("modal-visible");
    });
    
    // Manejar selección de nueva zona
    $(".zona-item:not(.zona-otros)").on("click", function() {
        const zona = $(this).data("zona");
        const costo = $(this).data("costo");
        
        // Actualizar localStorage
        localStorage.setItem("zonaEnvio", zona);
        localStorage.setItem("costoEnvio", costo);
        
        // Recargar datos
        cargarDatosCheckout();
        
        // Cerrar modal
        $("#modal-envio").removeClass("modal-visible");
        
        // Mostrar confirmación
        alert(`Zona de envío cambiada a: ${zona} - S/ ${costo}.00`);
    });
    
    // Cerrar modal de envío
    $(".modal-cerrar-envio").on("click", function() {
        $("#modal-envio").removeClass("modal-visible");
    });
    
    $("#modal-envio").on("click", function(e) {
        if (e.target === this) {
            $(this).removeClass("modal-visible");
        }
    });
    
    // Botón de WhatsApp para otros lugares
    $(".boton-whatsapp").on("click", function(e) {
        e.stopPropagation();
        const mensaje = encodeURIComponent("Hola! Quisiera consultar el costo de envío para mi pedido a otra zona de Perú.");
        const numeroWhatsApp = "51918341898";
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, "_blank");
    });
    
    // Cargar datos al iniciar
    cargarDatosCheckout();
});
