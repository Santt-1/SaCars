package com.sacars.controller;

import com.sacars.dto.CheckoutRequestDTO;
import com.sacars.model.Factura;
import com.sacars.model.Usuario;
import com.sacars.service.PedidoService;
import com.sacars.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;

    public CheckoutController(PedidoService pedidoService,
                              UsuarioService usuarioService) {
        this.pedidoService = pedidoService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<?> finalizarCompra(@RequestBody CheckoutRequestDTO request) {
        System.out.println("REQUEST RECIBIDO:");
        System.out.println("ID usuario: " + request.getIdUsuario());
        System.out.println("Items:");
        request.getItems().forEach(i -> {
            System.out.println(" - idProducto: " + i.getIdProducto());
            System.out.println("   cantidad: " + i.getCantidad());
            System.out.println("   precio: " + i.getPrecioUnitario());
        });
        if (request.getIdUsuario() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "ID de usuario no enviado")
            );
        }

        Usuario usuario = usuarioService.buscarPorId(request.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            Factura factura = pedidoService.crearPedidoYFactura(request, usuario);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idFactura", factura.getId());
            response.put("numeroFactura", factura.getNumeroFactura());
            response.put("idPedido", factura.getPedido().getId());

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", ex.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

}
