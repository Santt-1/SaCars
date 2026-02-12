package com.sacars.service;

import com.sacars.dto.ProductoFormDTO;
import com.sacars.model.Categoria;
import com.sacars.model.Producto;
import com.sacars.repository.CategoriaRepository;
import com.sacars.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio para CRUD de Productos (RQ1.8)
 * Gestión completa del catálogo de productos Hot Wheels
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductoService {
    
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    
    /**
     * Cargar nombres de categorías en los productos
     */
    private void cargarNombresCategorias(List<Producto> productos) {
        // Obtener todas las categorías de los productos
        List<Long> idsCategorias = productos.stream()
                .map(Producto::getIdCategoria)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        
        if (!idsCategorias.isEmpty()) {
            Map<Long, String> nombresCategorias = categoriaRepository.findAllById(idsCategorias)
                    .stream()
                    .collect(Collectors.toMap(Categoria::getIdCategoria, Categoria::getNombre));
            
            productos.forEach(p -> {
                if (p.getIdCategoria() != null) {
                    p.setCategoriaNombre(nombresCategorias.get(p.getIdCategoria()));
                }
            });
        }
    }
    
    /**
     * Listar todos los productos (activos e inactivos)
     */
    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        List<Producto> productos = productoRepository.findAll();
        cargarNombresCategorias(productos);
        return productos;
    }
    
    /**
     * Listar solo productos activos
     */
    @Transactional(readOnly = true)
    public List<Producto> listarActivos() {
        List<Producto> productos = productoRepository.findByActivo(true);
        cargarNombresCategorias(productos);
        return productos;
    }
    
    /**
     * Listar productos por categoría
     */
    @Transactional(readOnly = true)
    public List<Producto> listarPorCategoria(Long idCategoria) {
        List<Producto> productos = productoRepository.findByIdCategoria(idCategoria);
        cargarNombresCategorias(productos);
        return productos;
    }
    
    /**
     * Buscar producto por ID
     */
    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }
    
    /**
     * Buscar productos por nombre o descripción
     */
    @Transactional(readOnly = true)
    public List<Producto> buscarProductos(String busqueda) {
        List<Producto> productos;
        if (busqueda == null || busqueda.trim().isEmpty()) {
            productos = productoRepository.findAll();
        } else {
            productos = productoRepository.buscarProductos(busqueda.trim());
        }
        cargarNombresCategorias(productos);
        return productos;
    }
    
    /**
     * Obtener productos con stock bajo (menos de X unidades)
     */
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosStockBajo(Integer cantidad) {
        List<Producto> productos = productoRepository.findProductosStockBajo(cantidad);
        cargarNombresCategorias(productos);
        return productos;
    }
    
    /**
     * Obtener productos sin stock
     */
    @Transactional(readOnly = true)
    public List<Producto> obtenerProductosSinStock() {
        return productoRepository.findProductosSinStock();
    }
    
    /**
     * Crear nuevo producto
     */
    public Producto crearProducto(ProductoFormDTO dto) {
        Producto producto = new Producto();
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        producto.setIdCategoria(dto.getIdCategoria());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setActivo(dto.getActivo());
        producto.setFechaCreacion(LocalDateTime.now());
        
        return productoRepository.save(producto);
    }
    
    /**
     * Editar producto existente
     * Se pueden modificar todos los campos excepto ID y fecha de creación
     */
    public Producto editarProducto(Long id, ProductoFormDTO dto) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setStock(dto.getStock());
        producto.setIdCategoria(dto.getIdCategoria());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setActivo(dto.getActivo());
        // NO modificamos fechaCreacion
        
        return productoRepository.save(producto);
    }
    
    /**
     * Agregar stock a un producto existente (RQ1.9)
     */
    public Producto agregarStock(Long id, Integer cantidad) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        
        producto.setStock(producto.getStock() + cantidad);
        return productoRepository.save(producto);
    }
    
    /**
     * Reducir stock de un producto
     */
    public Producto reducirStock(Long id, Integer cantidad) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        
        if (producto.getStock() < cantidad) {
            throw new IllegalArgumentException(
                "Stock insuficiente. Disponible: " + producto.getStock() + ", solicitado: " + cantidad
            );
        }
        
        producto.setStock(producto.getStock() - cantidad);
        return productoRepository.save(producto);
    }
    
    /**
     * Activar producto (vuelve a aparecer en el catálogo)
     */
    public Producto activarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        
        producto.setActivo(true);
        return productoRepository.save(producto);
    }
    
    /**
     * Desactivar producto (soft delete)
     * El producto desaparece del catálogo público pero se mantiene en BD
     * Los pedidos existentes no se afectan
     */
    public Producto desactivarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        
        producto.setActivo(false);
        return productoRepository.save(producto);
    }
    
    /**
     * Eliminar producto permanentemente (hard delete)
     * NOTA: Usar con precaución, puede causar problemas con pedidos asociados
     */
    public void eliminarProducto(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new IllegalArgumentException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }
    
    /**
     * Obtener estadísticas de inventario
     */
    @Transactional(readOnly = true)
    public InventarioStats obtenerEstadisticasInventario() {
        Long totalProductos = productoRepository.count();
        Long productosActivos = productoRepository.countByActivo(true);
        Long totalUnidadesStock = productoRepository.sumTotalStock();
        Integer productosStockBajo = productoRepository.findProductosStockBajo(3).size();
        Integer productosSinStock = productoRepository.findProductosSinStock().size();
        
        return new InventarioStats(
            totalProductos,
            productosActivos,
            totalUnidadesStock != null ? totalUnidadesStock : 0L,
            productosStockBajo,
            productosSinStock
        );
    }
    
    /**
     * Clase interna para estadísticas de inventario
     */
    public record InventarioStats(
        Long totalProductos,
        Long productosActivos,
        Long totalUnidadesStock,
        Integer productosStockBajo,
        Integer productosSinStock
    ) {}
}
