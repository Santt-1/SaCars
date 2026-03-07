package com.sacars.controller;

import com.sacars.model.Pedido;
import com.sacars.model.DetallePedido;
import com.sacars.repository.PedidoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {
    private final PedidoRepository pedidoRepository;

    public PedidoController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listar(@PathVariable Long idUsuario) {
        List<Pedido> pedidos = pedidoRepository.findByUsuario_IdUsuario(idUsuario);
        List<Map<String, Object>> resultado = new ArrayList<>();
        
        for (Pedido p : pedidos) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("estado", p.getEstado());
            m.put("fecha", p.getFechaPedido());
            m.put("total", p.getTotal());
            m.put("direccion", p.getDireccionEnvio());
            m.put("zona", p.getCiudadEnvio());
            m.put("metodoPago", p.getMetodoPago());
            m.put("pagoVerificado", p.getPagoVerificado());
            resultado.add(m);
        }
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detalle(@PathVariable Long id) {
        Optional<Pedido> opt = pedidoRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("error", "No encontrado"));
        
        Pedido p = opt.get();
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("estado", p.getEstado());
        m.put("fecha", p.getFechaPedido());
        m.put("total", p.getTotal());
        m.put("direccion", p.getDireccionEnvio());
        m.put("zona", p.getCiudadEnvio());
        m.put("metodoPago", p.getMetodoPago());
        m.put("pagoVerificado", p.getPagoVerificado());
        m.put("motivoCancelacion", p.getMotivoCancelacion());
        
        List<Map<String, Object>> items = new ArrayList<>();
        for (DetallePedido d : p.getDetalles()) {
            Map<String, Object> item = new HashMap<>();
            item.put("nombre", d.getProducto().getNombre());
            item.put("cantidad", d.getCantidad());
            item.put("precio", d.getPrecioUnitario());
            items.add(item);
        }
        m.put("items", items);
        return ResponseEntity.ok(m);
    }
}
