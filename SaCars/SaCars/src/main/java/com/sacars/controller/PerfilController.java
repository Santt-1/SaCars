package com.sacars.controller;

import com.sacars.model.Pedido;
import com.sacars.model.Usuario;
import com.sacars.repository.PedidoRepository;
import com.sacars.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/perfil")
@CrossOrigin(origins = "*")
public class PerfilController {

    private final UsuarioService usuarioService;
    private final PedidoRepository pedidoRepository;

    public PerfilController(UsuarioService usuarioService, PedidoRepository pedidoRepository) {
        this.usuarioService = usuarioService;
        this.pedidoRepository = pedidoRepository;
    }

    // Obtener información del perfil del usuario
    @GetMapping("/{idUsuario}")
    public ResponseEntity<?> obtenerPerfil(@PathVariable Long idUsuario) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(idUsuario);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(404).body(
                        Map.of("success", false, "message", "Usuario no encontrado")
                );
            }

            Usuario usuario = usuarioOpt.get();
            Map<String, Object> perfil = new HashMap<>();
            perfil.put("id", usuario.getIdUsuario());
            perfil.put("nombre", usuario.getNombre());
            perfil.put("apellido", usuario.getApellido());
            perfil.put("email", usuario.getEmail());
            perfil.put("telefono", usuario.getTelefono());
            perfil.put("dni", usuario.getDni());
            perfil.put("direccion", usuario.getDireccion());
            perfil.put("rol", usuario.getRol());
            perfil.put("activo", usuario.isActivo());

            return ResponseEntity.ok(Map.of("success", true, "data", perfil));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    Map.of("success", false, "message", "Error al obtener perfil: " + ex.getMessage())
            );
        }
    }

    // Actualizar información del perfil del usuario
    @PutMapping("/{idUsuario}")
    public ResponseEntity<?> actualizarPerfil(@PathVariable Long idUsuario, @RequestBody Map<String, String> datos) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(idUsuario);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(404).body(
                        Map.of("success", false, "message", "Usuario no encontrado")
                );
            }

            Usuario usuario = usuarioOpt.get();

            // Actualizar solo los campos que vienen en el request
            if (datos.containsKey("nombre") && !datos.get("nombre").isEmpty()) {
                usuario.setNombre(datos.get("nombre"));
            }
            if (datos.containsKey("apellido") && !datos.get("apellido").isEmpty()) {
                usuario.setApellido(datos.get("apellido"));
            }
            if (datos.containsKey("email") && !datos.get("email").isEmpty()) {
                usuario.setEmail(datos.get("email"));
            }
            if (datos.containsKey("telefono") && !datos.get("telefono").isEmpty()) {
                usuario.setTelefono(datos.get("telefono"));
            }
            if (datos.containsKey("dni") && !datos.get("dni").isEmpty()) {
                usuario.setDni(datos.get("dni"));
            }
            if (datos.containsKey("direccion") && !datos.get("direccion").isEmpty()) {
                usuario.setDireccion(datos.get("direccion"));
            }

            usuarioService.guardar(usuario);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Perfil actualizado correctamente",
                    "data", Map.of(
                            "id", usuario.getIdUsuario(),
                            "nombre", usuario.getNombre(),
                            "apellido", usuario.getApellido(),
                            "email", usuario.getEmail(),
                            "telefono", usuario.getTelefono(),
                            "dni", usuario.getDni(),
                            "direccion", usuario.getDireccion()
                    )
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    Map.of("success", false, "message", "Error al actualizar perfil: " + ex.getMessage())
            );
        }
    }

    // Obtener historial de pedidos del usuario
    @GetMapping("/{idUsuario}/pedidos")
    public ResponseEntity<?> obtenerPedidos(@PathVariable Long idUsuario) {
        try {
            Optional<Usuario> usuarioOpt = usuarioService.buscarPorId(idUsuario);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(404).body(
                        Map.of("success", false, "message", "Usuario no encontrado")
                );
            }

            List<Pedido> pedidos = pedidoRepository.findByUsuario_IdUsuario(idUsuario);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "total", pedidos.size(),
                    "pedidos", pedidos
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    Map.of("success", false, "message", "Error al obtener pedidos: " + ex.getMessage())
            );
        }
    }

    // Obtener detalles de un pedido específico
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<?> obtenerDetallePedido(@PathVariable Long idPedido) {
        try {
            Optional<Pedido> pedidoOpt = pedidoRepository.findById(idPedido);
            if (pedidoOpt.isEmpty()) {
                return ResponseEntity.status(404).body(
                        Map.of("success", false, "message", "Pedido no encontrado")
                );
            }

            Pedido pedido = pedidoOpt.get();

            Map<String, Object> detalle = new HashMap<>();
            detalle.put("idPedido", pedido.getId());
            detalle.put("fechaPedido", pedido.getFechaPedido());
            detalle.put("estado", pedido.getEstado());
            detalle.put("direccionEnvio", pedido.getDireccionEnvio());
            detalle.put("ciudadEnvio", pedido.getCiudadEnvio());
            detalle.put("codigoPostal", pedido.getCodigoPostal());
            detalle.put("metodoPago", pedido.getMetodoPago());
            detalle.put("total", pedido.getTotal());
            detalle.put("detalles", pedido.getDetalles());

            return ResponseEntity.ok(Map.of("success", true, "data", detalle));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    Map.of("success", false, "message", "Error al obtener detalles del pedido: " + ex.getMessage())
            );
        }
    }

}
