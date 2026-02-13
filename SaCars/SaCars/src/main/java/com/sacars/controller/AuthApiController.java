package com.sacars.controller;

import com.sacars.model.Usuario;
import com.sacars.dto.UsuarioRegistroDTO;
import com.sacars.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthApiController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");

        // Validar que vengan los datos
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email y contraseña son requeridos"
            ));
        }

        try {
            // Buscar usuario por email
            Usuario usuario = usuarioService.buscarPorEmail(email);

            // Validar contraseña encriptada
            if (!passwordEncoder.matches(password, usuario.getContrasena())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Contraseña incorrecta"
                ));
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("usuario", usuario);
            data.put("token", "token-demo");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", data
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado o credenciales incorrectas"
            ));
        }
    }

    // ---------------- Generar hash por siaca xd ----------------
    @GetMapping("/generar-hash")
    public ResponseEntity<?> generarHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        return ResponseEntity.ok(Map.of(
                "password", password,
                "hash", hash,
                "mensaje", "Copia este hash y úsalo en tu INSERT de SQL"
        ));
    }

    // ---------------- REGISTRO ----------------
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Map<String, String> body) {

        String nombre = body.get("nombre");
        String apellido = body.get("apellido");
        String dni = body.get("dni");  
        String email = body.get("email");
        String telefono = body.get("telefono");
        String password = body.get("password");

        if (usuarioService.existePorEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El email ya está registrado"
            ));
        }

        UsuarioRegistroDTO dto = new UsuarioRegistroDTO();
        dto.setNombre(nombre);
        dto.setApellido(apellido);
        dto.setDni(dni);              
        dto.setEmail(email);
        dto.setTelefono(telefono);
        dto.setContrasena(password);

        Usuario nuevo = usuarioService.guardar(dto);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registro exitoso",
                "usuario", nuevo
        ));
    }
}
