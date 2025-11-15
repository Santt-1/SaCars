// SISTEMA DE FILTROS, BÚSQUEDA Y PAGINACIÓN DEL CATÁLOGO
$(document).ready(function() {
    let todosLosProductos = []; 
    let productosFiltrados = [];
    let paginaActual = 1;
    const productosPorPagina = 6; 
    
    // INICIALIZAR: Guardar todos los productos originales
    function inicializarProductos() {
        todosLosProductos = [];
        $('.producto-item').each(function() {
            todosLosProductos.push(this);
        });
    }
    
    // APLICAR FILTROS
    function aplicarFiltros() {
        const textoBusqueda = $('#buscar-producto').val().toLowerCase();
        const filtroPrecio = $('#filtro-precio').val();
        const ordenamiento = $('#ordenar-por').val();           
        // Empezar con TODOS los productos originales
        productosFiltrados = todosLosProductos.slice(); // Copia del array
        
        // FILTRAR POR BÚSQUEDA
        if (textoBusqueda !== '') {
            productosFiltrados = $(productosFiltrados).filter(function() {
                const nombre = $(this).data('nombre').toLowerCase();
                return nombre.includes(textoBusqueda);
            }).toArray();
        }
        
        // FILTRAR POR PRECIO 
        productosFiltrados = $(productosFiltrados).filter(function() {
            const precio = parseFloat($(this).data('precio'));
            
            switch(filtroPrecio) {
                case 'economico': return precio >= 15 && precio <= 20;
                case 'medio': return precio >= 21 && precio <= 30;
                case 'premium': return precio >= 31;
                default: return true;
            }
        }).toArray();
        
        // ORDENAR
        if (ordenamiento !== 'default') {
            productosFiltrados.sort(function(a, b) {
                const precioA = parseFloat($(a).data('precio'));
                const precioB = parseFloat($(b).data('precio'));
                const nombreA = $(a).data('nombre').toLowerCase();
                const nombreB = $(b).data('nombre').toLowerCase();
                
                switch(ordenamiento) {
                    case 'precio-asc':
                        return precioA - precioB;
                    case 'precio-desc':
                        return precioB - precioA;
                    case 'nombre-asc':
                        return nombreA.localeCompare(nombreB);
                    case 'nombre-desc':
                        return nombreB.localeCompare(nombreA);
                    default:
                        return 0;
                }
            });
        }           
        // Resetear a página 1 cuando se aplican filtros
        paginaActual = 1;
        
        // Actualizar la vista
        actualizarVista();
    }
    
    // ACTUALIZAR VISTA CON PAGINACIÓN 
    function actualizarVista() {
        const totalProductos = productosFiltrados.length;
        
        if (totalProductos === 0) {
            // No hay productos
            $('.grid-catalogo .producto-item').hide();
            $('#sin-resultados').show();
            $('#paginacion-controles').hide();
            return;
        } else {
            $('#sin-resultados').hide();
            $('#paginacion-controles').show();
        }
        
        // Calcular paginación
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        
        // Ocultar todos los productos primero
        $('.grid-catalogo .producto-item').hide();
        
        // Mostrar solo los productos de la página actual
        for (let i = inicio; i < fin && i < totalProductos; i++) {
            $(productosFiltrados[i]).show();
        }
        
        // Actualizar controles de paginación
        $('#info-pagina').text(`Página ${paginaActual} de ${totalPaginas}`);
        $('#btn-anterior').prop('disabled', paginaActual === 1);
        $('#btn-siguiente').prop('disabled', paginaActual === totalPaginas);
        
        // Animación suave al cambiar página
        if (totalProductos > 0) {
            $('.grid-catalogo').hide().fadeIn(400);
        }
    }
    
    // EVENTOS DE FILTROS      
    // Búsqueda en tiempo real
    $('#buscar-producto').on('keyup', function() {
        aplicarFiltros();
    });
    
    // Filtro de precio
    $('#filtro-precio').on('change', function() {
        aplicarFiltros();
    });
    
    // Ordenamiento
    $('#ordenar-por').on('change', function() {
        aplicarFiltros();
    });
    
    // Limpiar filtros
    $('#limpiar-filtros').on('click', function() {
        $('#buscar-producto').val('');
        $('#filtro-precio').val('todos');
        $('#ordenar-por').val('default');
        aplicarFiltros();
    });
    
    // También mantener el botón de "sin resultados"
    $('#reset-busqueda').on('click', function() {
        $('#buscar-producto').val('');
        $('#filtro-precio').val('todos');
        $('#ordenar-por').val('default');
        aplicarFiltros();
    });
    
    // EVENTOS DE PAGINACIÓN
    
    // Botón anterior
    $('#btn-anterior').on('click', function() {
        if (paginaActual > 1) {
            paginaActual--;
            actualizarVista();
            $('html, body').animate({
                scrollTop: $('.grid-catalogo').offset().top - 100
            }, 500);
        }
    });
    
    // Botón siguiente
    $('#btn-siguiente').on('click', function() {
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            actualizarVista();
            $('html, body').animate({
                scrollTop: $('.grid-catalogo').offset().top - 100
            }, 500);
        }
    });
    
    // INICIALIZACIÓN
    inicializarProductos(); // Primero guardamos todos los productos
    aplicarFiltros(); // Luego aplicamos filtros 
    
    // Efecto hover en productos
    $(document).on('mouseenter', '.producto-item', function() {
        $(this).find('img').css('transform', 'scale(1.05)');
    });
    
    $(document).on('mouseleave', '.producto-item', function() {
        $(this).find('img').css('transform', 'scale(1)');
    });
});
