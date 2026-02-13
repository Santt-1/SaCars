package com.sacars.controller;

import com.sacars.dto.PedidoResponseDTO;
import com.sacars.model.Pedido;
import com.sacars.service.AdminPedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/*Controlador para Gestión de Pedidos*/
@Controller
@RequestMapping("/admin/pedidos")
@RequiredArgsConstructor
public class AdminPedidoController {
    
    private final AdminPedidoService pedidoService;
    
    /* Vista de gestión de pedidos / GET /admin/pedidos */
    @GetMapping
    public String mostrarVistaPedidos() {
        return "admin/pedidos";
    }
    
    /* API: Listar todos los pedidos / GET /admin/pedidos/api/listar */
    @GetMapping("/api/listar")
    @ResponseBody
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos() {
        try {
            List<PedidoResponseDTO> pedidos = pedidoService.listarTodosDTO();
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Listar pedidos recientes / GET /admin/pedidos/api/recientes */
    @GetMapping("/api/recientes")
    @ResponseBody
    public ResponseEntity<List<Pedido>> listarRecientes() {
        try {
            List<Pedido> pedidos = pedidoService.listarRecientes();
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Obtener pedido por ID / GET /admin/pedidos/api/{id} */
    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<?> obtenerPedido(@PathVariable Long id) {
        try {
            return pedidoService.buscarPorIdDTO(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Listar pedidos por estado / GET /admin/pedidos/api/estado/{estado} */
    @GetMapping("/api/estado/{estado}")
    @ResponseBody
    public ResponseEntity<List<PedidoResponseDTO>> listarPorEstado(@PathVariable String estado) {
        try {
            List<PedidoResponseDTO> pedidos = pedidoService.listarPorEstadoDTO(estado.toUpperCase());
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Listar pedidos pendientes / GET /admin/pedidos/api/pendientes */
    @GetMapping("/api/pendientes")
    @ResponseBody
    public ResponseEntity<List<Pedido>> listarPendientes() {
        try {
            List<Pedido> pedidos = pedidoService.listarPendientes();
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Listar pedidos completados / GET /admin/pedidos/api/completados */
    @GetMapping("/api/completados")
    @ResponseBody
    public ResponseEntity<List<Pedido>> listarCompletados() {
        try {
            List<Pedido> pedidos = pedidoService.listarCompletados();
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Listar pedidos por zona / GET /admin/pedidos/api/zona/{ciudad} */
    @GetMapping("/api/zona/{ciudad}")
    @ResponseBody
    public ResponseEntity<List<Pedido>> listarPorZona(@PathVariable String ciudad) {
        try {
            List<Pedido> pedidos = pedidoService.listarPorZona(ciudad);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Buscar pedidos por cliente / GET /admin/pedidos/api/buscar?q=texto */
    @GetMapping("/api/buscar")
    @ResponseBody
    public ResponseEntity<List<PedidoResponseDTO>> buscarPorCliente(@RequestParam(required = false) String q) {
        try {
            List<PedidoResponseDTO> pedidos = pedidoService.buscarPorClienteDTO(q);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Listar pedidos por período */
    @GetMapping("/api/periodo")
    @ResponseBody
    public ResponseEntity<List<Pedido>> listarPorPeriodo(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        try {
            List<Pedido> pedidos = pedidoService.listarPorPeriodo(inicio, fin);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Marcar pedido como completado / PUT /admin/pedidos/api/completar/{id} */
    @PutMapping("/api/completar/{id}")
    @ResponseBody
    public ResponseEntity<?> marcarComoCompletado(@PathVariable Long id) {
        try {
            Pedido pedido = pedidoService.marcarComoCompletado(id);
            return ResponseEntity.ok(pedido);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al completar pedido: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /* API: Marcar pedido como pendiente / PUT /admin/pedidos/api/pendiente/{id} */
    @PutMapping("/api/pendiente/{id}")
    @ResponseBody
    public ResponseEntity<?> marcarComoPendiente(@PathVariable Long id) {
        try {
            Pedido pedido = pedidoService.marcarComoPendiente(id);
            return ResponseEntity.ok(pedido);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Cancelar pedido / PUT /admin/pedidos/api/cancelar/{id} */
    @PutMapping("/api/cancelar/{id}")
    @ResponseBody
    public ResponseEntity<?> cancelarPedido(@PathVariable Long id) {
        try {
            Pedido pedido = pedidoService.cancelarPedido(id);
            return ResponseEntity.ok(pedido);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al cancelar pedido: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /* API: Cambiar estado de pedido / PUT /admin/pedidos/api/cambiar-estado/{id} */
    @PutMapping("/api/cambiar-estado/{id}")
    @ResponseBody
    public ResponseEntity<?> cambiarEstado(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        try {
            String nuevoEstado = request.get("estado");
            if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El estado es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            Pedido pedido = pedidoService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(pedido);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al cambiar estado: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    /* API: Obtener resumen de pedidos de hoy / GET /admin/pedidos/api/resumen-hoy */
    @GetMapping("/api/resumen-hoy")
    @ResponseBody
    public ResponseEntity<?> obtenerResumenHoy() {
        try {
            AdminPedidoService.ResumenPedidosHoy resumen = pedidoService.obtenerResumenHoy();
            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Calcular ventas por período / GET /admin/pedidos/api/ventas */
    @GetMapping("/api/ventas")
    @ResponseBody
    public ResponseEntity<?> calcularVentas(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        try {
            BigDecimal total = pedidoService.calcularVentasPorPeriodo(inicio, fin);
            Map<String, Object> response = new HashMap<>();
            response.put("inicio", inicio);
            response.put("fin", fin);
            response.put("total", total);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
