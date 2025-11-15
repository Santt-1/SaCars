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
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthApiController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");

        Optional<Usuario> optUser = usuarioService.buscarPorEmail(email);

        if (optUser.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
            ));
        }

        Usuario usuario = optUser.get();

        // VALIDAR CONTRASEÑA (contraseña en tu modelo)
        if (!passwordEncoder.matches(password, usuario.getContrasena())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Contraseña incorrecta"
            ));
        }

        // RESPUESTA DE LOGIN
        Map<String, Object> data = new HashMap<>();
        data.put("usuario", usuario);
        data.put("token", "token-demo");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data
        ));
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Map<String, String> body) {

        String nombre = body.get("nombre");
        String apellido = body.get("apellido"); 
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
