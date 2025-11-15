$(document).ready(function() {
// Verificar autenticación en cada página
    verificarAutenticacion();
    
    // FUNCIÓN PRINCIPAL: Detecta elementos visibles y los anima
    function chequearAnimacion() {
        // Calcula la posición inferior de la ventana del navegador
        let windowBottom = $(window).scrollTop() + $(window).height();
        // Itera sobre todos los elementos con clase ".animar"
        $('.animar').each(function(i) {
            // Obtiene la posición superior del elemento actual
            let objectTop = $(this).offset().top;
            
            // Verifica si el elemento está visible en pantalla
            if (windowBottom > objectTop + 100) { // +100px de margen para activación temprana
                
                // Aplica animación con delay escalonado para efecto secuencial
                $(this).delay(i * 100).queue(function(){
                    $(this).addClass('fade-in'); // Activa la animación CSS
                    $(this).dequeue(); // Continúa la cola de animaciones
                });
            }
        });
    }

    // EVENT LISTENER: Ejecuta animaciones durante el scroll
    $(window).scroll(function() {
        chequearAnimacion();
    });

    // INICIALIZACIÓN: Verifica elementos visibles al cargar la página
    chequearAnimacion();

});

// ANIMACIONES DEL HEADER PRINCIPAL (Página de Inicio)
$(document).ready(function(){
    // CONFIGURACIÓN INICIAL: Oculta elementos para la animación de entrada
    $(".site-header.inicio h2").css({opacity: 0, transform: "translateY(40px)"});
    $(".site-header.inicio p").css({opacity: 0, transform: "translateY(20px)"});

    // SECUENCIA DE ANIMACIÓN: Entrada escalonada del contenido principal
    $(".site-header.inicio h2").delay(300).animate({opacity: 1, top: 0}, 800);  // Título aparece primero
    $(".site-header.inicio p").delay(800).animate({opacity: 1, top: 0}, 800);   // Subtítulo aparece después
});


// CARRITO DE COMPRAS
$(document).ready(function () {
  // Inicializa carrito si no existe
  if (!localStorage.getItem("carrito")) {
    localStorage.setItem("carrito", JSON.stringify([]));
  }
  // Variable temporal para guardar el producto antes de seleccionar zona
  let productoTemporal = null;

  // Mostrar aviso al agregar producto
  function mostrarAviso(mensaje) {
    const aviso = $(`
      <div class="toast-aviso">
        ${mensaje}
      </div>
    `);
    $("body").append(aviso);
    setTimeout(() => {
      aviso.addClass("mostrar");
    }, 100);
    setTimeout(() => {
      aviso.removeClass("mostrar");
      setTimeout(() => aviso.remove(), 300);
    }, 2500);
  }

  // Agregar producto al carrito
  function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito"));
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  // Evento: Agregar al carrito - Ahora abre modal de envío
  $(document).on("click", ".boton-agregar", function () {
    // Verificar si ya hay una zona de envío seleccionada
    const zonaEnvio = localStorage.getItem("zonaEnvio");
    
    if (zonaEnvio) {
      // Si ya hay zona seleccionada, agregar directamente
      const producto = {
        titulo: $("#modal-titulo").text(),
        precio: parseFloat($("#modal-precio").text().replace("S/", "").trim()),
        imagen: $("#modal-img").attr("src"),
      };
      agregarAlCarrito(producto);
      mostrarAviso("✅ Producto agregado al carrito");
    } else {
      // Si no hay zona, guardar producto temporal y abrir modal de envío
      productoTemporal = {
        titulo: $("#modal-titulo").text(),
        precio: parseFloat($("#modal-precio").text().replace("S/", "").trim()),
        imagen: $("#modal-img").attr("src"),
      };
      
      // Cerrar modal de producto y abrir modal de envío
      $("#modal-producto").removeClass("modal-visible");
      $("#modal-envio").addClass("modal-visible");
    }
  });

  // ZONA DE ENVIO 
  
  // Cerrar modal de envío
  $(".modal-cerrar-envio").on("click", function() {
    $("#modal-envio").removeClass("modal-visible");
    productoTemporal = null;
  });

  // Cerrar modal al hacer click fuera
  $("#modal-envio").on("click", function(e) {
    if (e.target === this) {
      $(this).removeClass("modal-visible");
      productoTemporal = null;
    }
  });

  // Seleccionar zona de envío (excepto "Otros")
  $(".zona-item:not(.zona-otros)").on("click", function() {
    const zona = $(this).data("zona");
    const costo = $(this).data("costo");
    
    // Guardar zona y costo en localStorage
    localStorage.setItem("zonaEnvio", zona);
    localStorage.setItem("costoEnvio", costo);
    
    // Agregar el producto temporal al carrito
    if (productoTemporal) {
      agregarAlCarrito(productoTemporal);
      
      // Verificar si es compra directa
      if (productoTemporal.esCompraDirecta) {
        // Redirigir al checkout
        window.location.href = "checkout.html";
      } else {
        // Mostrar aviso normal
        mostrarAviso(`✅ Producto agregado al carrito<br>📍 Envío a ${zona}: S/ ${costo}.00`);
      }
      
      productoTemporal = null;
    }
    
    // Cerrar modal
    $("#modal-envio").removeClass("modal-visible");
  });

  // Botón de WhatsApp para "Otros lugares"
  $(".boton-whatsapp").on("click", function(e) {
    e.stopPropagation(); // Evitar que se active el click del zona-item
    const mensaje = encodeURIComponent("Hola! Quisiera consultar el costo de envío para mi pedido a otra zona de Perú.");
    const numeroWhatsApp = "51918341898"; 
    window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, "_blank");
  });

  // Evento: Comprar ahora
  $(document).on("click", ".boton-comprar", function () {
    // Verificar si ya hay una zona de envío seleccionada
    const zonaEnvio = localStorage.getItem("zonaEnvio");
    
    const producto = {
      titulo: $("#modal-titulo").text(),
      precio: parseFloat($("#modal-precio").text().replace("S/", "").trim()),
      imagen: $("#modal-img").attr("src"),
    };

    if (zonaEnvio) {
      // Si ya hay zona seleccionada, agregar y ir al checkout
      agregarAlCarrito(producto);
      window.location.href = "checkout.html";
    } else {
      // Si no hay zona, guardar producto temporal y abrir modal de envío
      productoTemporal = producto;
      productoTemporal.esCompraDirecta = true; // Marcar como compra directa
      
      // Cerrar modal de producto y abrir modal de envío
      $("#modal-producto").removeClass("modal-visible");
      $("#modal-envio").addClass("modal-visible");
    }
  });

  // === MOSTRAR PRODUCTOS EN EL CARRITO ===
  const contenedor = $("#carrito-contenido");
  const totalPrecio = $("#total-precio");
  const subtotal = $("#subtotal");
  const vacio = $(".carrito-vacio");

  if (contenedor.length > 0) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
      vacio.show();
    } else {
      vacio.hide();
      contenedor.empty();

      let total = 0;
      carrito.forEach((producto, index) => {
        total += producto.precio;

        const item = `
          <div class="carrito-item">
            <img src="${producto.imagen}" alt="${producto.titulo}">
            <div class="carrito-item-info">
              <h4>${producto.titulo}</h4>
              <p>S/ ${producto.precio.toFixed(2)}</p>
            </div>
            <button class="eliminar-item" data-index="${index}">🗑️</button>
          </div>
        `;
        contenedor.append(item);
      });

      // Calcular costo de envío
      const costoEnvio = parseFloat(localStorage.getItem("costoEnvio")) || 0;
      const zonaEnvio = localStorage.getItem("zonaEnvio") || "No definida";
      const totalConEnvio = total + costoEnvio;

      subtotal.text("S/ " + total.toFixed(2));
      
      // Actualizar costo de envío en el resumen
      if (costoEnvio > 0) {
        $("#costo-envio-texto").text(`${zonaEnvio}: S/ ${costoEnvio.toFixed(2)}`);
      } else {
        $("#costo-envio-texto").text("Por definir");
      }
      
      totalPrecio.text("S/ " + totalConEnvio.toFixed(2));
    }

    // Eliminar producto
    $(document).on("click", ".eliminar-item", function () {
      let carrito = JSON.parse(localStorage.getItem("carrito"));
      const index = $(this).data("index");
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      location.reload();
    });

    // Vaciar carrito
    $("#vaciar-carrito").on("click", function () {
      localStorage.removeItem("carrito");
      localStorage.removeItem("zonaEnvio");
      localStorage.removeItem("costoEnvio");
      location.reload();
    });
  }
  // Presiona Ctrl + Shift + L para limpiar todo el localStorage
  $(document).on("keydown", function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === "L") {
      localStorage.clear();
      alert("🗑️ Cache limpiado completamente");
      location.reload();
    }
  });
});
// NAVEGACIÓN GENERAL
$(document).ready(function() {
    // Finalizar compra - ir al checkout
    $('#finalizar-compra').on('click', function() {
        // Verificar que haya productos en el carrito
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        if (carrito.length === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de finalizar la compra.");
            return;
        }
        
        // Verificar que haya zona de envío seleccionada
        const zonaEnvio = localStorage.getItem("zonaEnvio");
        if (!zonaEnvio) {
            alert("Por favor selecciona una zona de envío antes de finalizar tu compra.");
            return;
        }
        
        window.location.href = 'checkout.html';
    });
    
    // Seguir comprando - ir al catálogo
    $('#seguir-comprando').on('click', function() {
        window.location.href = 'catalogo.html';
    });
});

// Funciones de autenticación
function verificarAutenticacion() {
    const usuario = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (usuario && token) {
        try {
            const usuarioObj = JSON.parse(usuario);
            
            // Mostrar nombre del usuario
            $('#usuario-conectado').show();
            $('#nombre-usuario').text(usuarioObj.nombre);
            
            // Mostrar botón logout
            $('#btn-login').hide();
            $('#btn-logout').show().off('click').click(function(e) {
                e.preventDefault();
                cerrarSesion();
            });
        } catch (e) {
            console.error('Error al parsear usuario:', e);
            limpiarSesion();
        }
    } else {
        // Usuario no autenticado
        $('#usuario-conectado').hide();
        $('#btn-logout').hide();
        $('#btn-login').show();
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        limpiarSesion();
        alert('Sesión cerrada');
        location.reload();
    }
}

function limpiarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
}
