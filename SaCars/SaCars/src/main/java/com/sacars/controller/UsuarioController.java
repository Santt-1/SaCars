package com.sacars.controller;

import com.sacars.model.Usuario;
import com.sacars.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        Optional<Usuario> opt = usuarioService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "No encontrado"));
        
        Usuario u = opt.get();
        return ResponseEntity.ok(Map.of(
            "id", u.getIdUsuario(),
            "nombre", u.getNombre(),
            "apellido", u.getApellido(),
            "email", u.getEmail(),
            "telefono", u.getTelefono(),
            "dni", u.getDni(),
            "direccion", u.getDireccion()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        Optional<Usuario> opt = usuarioService.buscarPorId(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "No encontrado"));
        
        Usuario u = opt.get();
        if (datos.containsKey("nombre")) u.setNombre(datos.get("nombre"));
        if (datos.containsKey("apellido")) u.setApellido(datos.get("apellido"));
        if (datos.containsKey("email")) u.setEmail(datos.get("email"));
        if (datos.containsKey("telefono")) u.setTelefono(datos.get("telefono"));
        if (datos.containsKey("dni")) u.setDni(datos.get("dni"));
        if (datos.containsKey("direccion")) u.setDireccion(datos.get("direccion"));
        
        usuarioService.guardar(u);
        return ResponseEntity.ok(Map.of("success", true, "message", "Actualizado"));
    }
}
