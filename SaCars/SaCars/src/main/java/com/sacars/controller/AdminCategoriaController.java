package com.sacars.controller;

import com.sacars.dto.CategoriaFormDTO;
import com.sacars.dto.CategoriaResponseDTO;
import com.sacars.model.Categoria;
import com.sacars.service.AdminCategoriaService;
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
 * Controlador para CRUD de Categorías (RQ1.7)
 * Gestión de categorías que organizan el catálogo
 */
@Controller
@RequestMapping("/admin/categorias")
@RequiredArgsConstructor
public class AdminCategoriaController {
    
    private final AdminCategoriaService categoriaService;
    
    /**
     * Vista de gestión de categorías
     * GET /admin/categorias
     */
    @GetMapping
    public String mostrarVistaCategorias() {
        return "admin/categorias";
    }
    
    /**
     * API: Listar todas las categorías
     * GET /admin/categorias/api/listar
     */
    @GetMapping("/api/listar")
    @ResponseBody
    public ResponseEntity<List<CategoriaResponseDTO>> listarCategorias() {
        try {
            List<CategoriaResponseDTO> categorias = categoriaService.listarTodasConProductos();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Obtener categoría por ID
     * GET /admin/categorias/api/{id}
     */
    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<?> obtenerCategoria(@PathVariable Long id) {
        try {
            return categoriaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * API: Crear nueva categoría
     * POST /admin/categorias/api/crear
     */
    @PostMapping("/api/crear")
    @ResponseBody
    public ResponseEntity<?> crearCategoria(@Valid @RequestBody CategoriaFormDTO dto, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(error -> 
                errores.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errores);
        }
        
        try {
            Categoria categoria = categoriaService.crearCategoria(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(categoria);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear categoría: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * API: Editar categoría existente
     * PUT /admin/categorias/api/editar/{id}
     */
    @PutMapping("/api/editar/{id}")
    @ResponseBody
    public ResponseEntity<?> editarCategoria(
        @PathVariable Long id,
        @Valid @RequestBody CategoriaFormDTO dto,
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
            Categoria categoria = categoriaService.editarCategoria(id, dto);
            return ResponseEntity.ok(categoria);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al editar categoría: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /**
     * API: Eliminar categoría permanentemente
     * DELETE /admin/categorias/api/eliminar/{id}
     */
    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarCategoria(@PathVariable Long id) {
        try {
            categoriaService.eliminarCategoria(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Categoría eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar categoría: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
