package com.sacars.controller;

import com.sacars.dto.UsuarioFormDTO;
import com.sacars.model.Usuario;
import com.sacars.service.AdminUsuarioService;
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

/*Controlador para CRUD de Usuarios / Gestión completa de usuarios desde el panel administrativo*/
@Controller
@RequestMapping("/admin/usuarios")
@RequiredArgsConstructor
public class AdminUsuarioController {
    
    private final AdminUsuarioService usuarioService;
    
    /* Vista de gestión de usuarios / GET /admin/usuarios */
    @GetMapping
    public String mostrarVistaUsuarios() {
        return "admin/usuarios";
    }
    
    /* API: Listar todos los usuarios / GET /admin/usuarios/api/listar */
    @GetMapping("/api/listar")
    @ResponseBody
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        try {
            List<Usuario> usuarios = usuarioService.listarTodos();
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Buscar usuarios por texto / GET /admin/usuarios/api/buscar =texto */
    @GetMapping("/api/buscar")
    @ResponseBody
    public ResponseEntity<List<Usuario>> buscarUsuarios(@RequestParam(required = false) String q) {
        try {
            List<Usuario> usuarios = usuarioService.buscarUsuarios(q);
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Obtener usuario por ID / GET /admin/usuarios/api/{id} */
    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
        try {
            return usuarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Crear nuevo usuario / POST /admin/usuarios/api/crear*/
    @PostMapping("/api/crear")
    @ResponseBody
    public ResponseEntity<?> crearUsuario(@Valid @RequestBody UsuarioFormDTO dto, BindingResult result) {
        if (result.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            result.getFieldErrors().forEach(error -> 
                errores.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errores);
        }
        
        try {
            Usuario usuario = usuarioService.crearUsuario(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /* API: Editar usuario existente / PUT /admin/usuarios/api/editar/{id} */
    @PutMapping("/api/editar/{id}")
    @ResponseBody
    public ResponseEntity<?> editarUsuario(
        @PathVariable Long id,
        @Valid @RequestBody UsuarioFormDTO dto,
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
            Usuario usuario = usuarioService.editarUsuario(id, dto);
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al editar usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /* API: Activar usuario / PUT /admin/usuarios/api/activar/{id} */
    @PutMapping("/api/activar/{id}")
    @ResponseBody
    public ResponseEntity<?> activarUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.activarUsuario(id);
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Desactivar usuario (soft delete) / PUT /admin/usuarios/api/desactivar/{id} */
    @PutMapping("/api/desactivar/{id}")
    @ResponseBody
    public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.desactivarUsuario(id);
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Eliminar usuario permanentemente / DELETE /admin/usuarios/api/eliminar/{id} */
    @DeleteMapping("/api/eliminar/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Usuario eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar usuario: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /* API: Cambiar contraseña de usuario / PUT /admin/usuarios/api/cambiar-contrasena/{id} */
    @PutMapping("/api/cambiar-contrasena/{id}")
    @ResponseBody
    public ResponseEntity<?> cambiarContrasena(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        try {
            String nuevaContrasena = request.get("contrasena");
            if (nuevaContrasena == null || nuevaContrasena.length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La contraseña debe tener al menos 6 caracteres");
                return ResponseEntity.badRequest().body(error);
            }
            
            usuarioService.cambiarContrasena(id, nuevaContrasena);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Contraseña actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al cambiar contraseña: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
