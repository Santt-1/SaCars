package com.sacars.controller;

import com.sacars.dto.ProductoFormDTO;
import com.sacars.model.Producto;
import com.sacars.service.AdminProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador para CRUD de Productos (RQ1.8)
 * Gestión completa del catálogo de productos desde el panel administrativo
 */
@Controller
@RequestMapping("/admin/productos")
@RequiredArgsConstructor
public class AdminProductoController {
    
    private final AdminProductoService productoService;
    
    /**
     * Vista de gestión de productos
     * GET /admin/productos
     */
    @GetMapping
    public String mostrarVistaProductos() {
        return "admin/productos";
    }
    
    /**
     * API: Listar todos los productos
     * GET /admin/productos/api/listar
     */
    @GetMapping("/api/listar")
    @ResponseBody
    public ResponseEntity<List<Producto>> listarProductos() {
        try {
            List<Producto> productos = productoService.listarTodos();
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Listar solo productos activos
     * GET /admin/productos/api/activos
     */
    @GetMapping("/api/activos")
    @ResponseBody
    public ResponseEntity<List<Producto>> listarProductosActivos() {
        try {
            List<Producto> productos = productoService.listarActivos();
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Buscar productos por texto
     * GET /admin/productos/api/buscar?q=texto
     */
    @GetMapping("/api/buscar")
    @ResponseBody
    public ResponseEntity<List<Producto>> buscarProductos(@RequestParam(required = false) String q) {
        try {
            List<Producto> productos = productoService.buscarProductos(q);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Listar productos por categoría
     * GET /admin/productos/api/categoria/{idCategoria}
     */
    @GetMapping("/api/categoria/{idCategoria}")
    @ResponseBody
    public ResponseEntity<List<Producto>> listarPorCategoria(@PathVariable Long idCategoria) {
        try {
            List<Producto> productos = productoService.listarPorCategoria(idCategoria);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Obtener producto por ID
     * GET /admin/productos/api/{id}
     */
    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<?> obtenerProducto(@PathVariable Long id) {
        try {
            return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Obtener productos con stock bajo
     * GET /admin/productos/api/stock-bajo?cantidad=3
     */
    @GetMapping("/api/stock-bajo")
    @ResponseBody
    public ResponseEntity<List<Producto>> obtenerStockBajo(
        @RequestParam(defaultValue = "3") Integer cantidad
    ) {
        try {
            List<Producto> productos = productoService.obtenerProductosStockBajo(cantidad);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Obtener productos sin stock
     * GET /admin/productos/api/sin-stock
     */
    @GetMapping("/api/sin-stock")
    @ResponseBody
    public ResponseEntity<List<Producto>> obtenerSinStock() {
        try {
            List<Producto> productos = productoService.obtenerProductosSinStock();
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Obtener estadísticas de inventario
     * GET /admin/productos/api/estadisticas-inventario
     */
    @GetMapping("/api/estadisticas-inventario")
    @ResponseBody
    public ResponseEntity<?> obtenerEstadisticasInventario() {
        try {
            AdminProductoService.InventarioStats stats = productoService.obtenerEstadisticasInventario();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Crear nuevo producto
     * POST /admin/productos/api/crear
     */
    @PostMapping("/api/crear")
    @ResponseBody
    public ResponseEntity<?> crearProducto(@Valid @RequestBody ProductoFormDTO dto, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(error -> 
                errores.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errores);
        }
        
        try {
            Producto producto = productoService.crearProducto(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(producto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * API: Editar producto existente
     * PUT /admin/productos/api/editar/{id}
     */
    @PutMapping("/api/editar/{id}")
    @ResponseBody
    public ResponseEntity<?> editarProducto(
        @PathVariable Long id,
        @Valid @RequestBody ProductoFormDTO dto,
        BindingResult result
    ) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(error -> 
                errores.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errores);
        }
        
        try {
            Producto producto = productoService.editarProducto(id, dto);
            return ResponseEntity.ok(producto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al editar producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * API: Agregar stock a un producto (RQ1.9)
     * PUT /admin/productos/api/agregar-stock/{id}
     */
    @PutMapping("/api/agregar-stock/{id}")
    @ResponseBody
    public ResponseEntity<?> agregarStock(
        @PathVariable Long id,
        @RequestBody Map<String, Integer> request
    ) {
        try {
            Integer cantidad = request.get("cantidad");
            if (cantidad == null || cantidad <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La cantidad debe ser mayor a 0");
                return ResponseEntity.badRequest().body(error);
            }
            
            Producto producto = productoService.agregarStock(id, cantidad);
            return ResponseEntity.ok(producto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al agregar stock: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * API: Reducir stock de un producto
     * PUT /admin/productos/api/reducir-stock/{id}
     */
    @PutMapping("/api/reducir-stock/{id}")
    @ResponseBody
    public ResponseEntity<?> reducirStock(
        @PathVariable Long id,
        @RequestBody Map<String, Integer> request
    ) {
        try {
            Integer cantidad = request.get("cantidad");
            if (cantidad == null || cantidad <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La cantidad debe ser mayor a 0");
                return ResponseEntity.badRequest().body(error);
            }
            
            Producto producto = productoService.reducirStock(id, cantidad);
            return ResponseEntity.ok(producto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al reducir stock: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * API: Activar producto
     * PUT /admin/productos/api/activar/{id}
     */
    @PutMapping("/api/activar/{id}")
    @ResponseBody
    public ResponseEntity<?> activarProducto(@PathVariable Long id) {
        try {
            Producto producto = productoService.activarProducto(id);
            return ResponseEntity.ok(producto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Desactivar producto (soft delete)
     * PUT /admin/productos/api/desactivar/{id}
     */
    @PutMapping("/api/desactivar/{id}")
    @ResponseBody
    public ResponseEntity<?> desactivarProducto(@PathVariable Long id) {
        try {
            Producto producto = productoService.desactivarProducto(id);
            return ResponseEntity.ok(producto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Eliminar producto permanentemente
     * DELETE /admin/productos/api/eliminar/{id}
     */
    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.eliminarProducto(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Producto eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar producto: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
