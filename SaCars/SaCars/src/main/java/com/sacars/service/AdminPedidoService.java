package com.sacars.service;

import com.sacars.dto.PedidoResponseDTO;
import com.sacars.model.DetallePedido;
import com.sacars.model.Pedido;
import com.sacars.model.Producto;
import com.sacars.repository.PedidoRepository;
import com.sacars.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio para Gestión de Pedidos (RQ1.8)
 * Administración completa de pedidos desde el panel administrativo
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AdminPedidoService {
    
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    
    /**
     * Listar todos los pedidos
     */
    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }
    
    /**
     * Listar todos los pedidos como DTO (con datos del cliente)
     */
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodosDTO() {
        return pedidoRepository.findAllByOrderByFechaPedidoDesc().stream()
                .map(PedidoResponseDTO::fromPedido)
                .collect(Collectors.toList());
    }
    
    /**
     * Listar pedidos recientes (últimos 10)
     */
    @Transactional(readOnly = true)
    public List<Pedido> listarRecientes() {
        return pedidoRepository.findTop10ByOrderByFechaPedidoDesc();
    }
    
    /**
     * Buscar pedido por ID
     */
    @Transactional(readOnly = true)
    public Optional<Pedido> buscarPorId(Long id) {
        return pedidoRepository.findById(id);
    }
    
    /**
     * Listar pedidos por estado
     * Estados comunes: PENDIENTE, COMPLETADO, CANCELADO
     */
    @Transactional(readOnly = true)
    public List<Pedido> listarPorEstado(String estado) {
        return pedidoRepository.findByEstado(estado);
    }
    
    /**
     * Listar pedidos pendientes (requieren atención del admin)
     */
    @Transactional(readOnly = true)
    public List<Pedido> listarPendientes() {
        return pedidoRepository.findByEstado("PENDIENTE");
    }
    
    /**
     * Listar pedidos completados
     */
    @Transactional(readOnly = true)
    public List<Pedido> listarCompletados() {
        return pedidoRepository.findByEstado("COMPLETADO");
    }
    
    /**
     * Listar pedidos por zona de envío (ciudad)
     */
    @Transactional(readOnly = true)
    public List<Pedido> listarPorZona(String ciudad) {
        return pedidoRepository.findByCiudadEnvio(ciudad);
    }
    
    /**
     * Buscar pedidos por información del cliente
     */
    @Transactional(readOnly = true)
    public List<Pedido> buscarPorCliente(String busqueda) {
        if (busqueda == null || busqueda.trim().isEmpty()) {
            return listarTodos();
        }
        return pedidoRepository.buscarPedidosPorCliente(busqueda.trim());
    }
    
    /**
     * Buscar pedidos por información del cliente como DTO
     */
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> buscarPorClienteDTO(String busqueda) {
        if (busqueda == null || busqueda.trim().isEmpty()) {
            return listarTodosDTO();
        }
        return pedidoRepository.buscarPedidosPorCliente(busqueda.trim()).stream()
                .map(PedidoResponseDTO::fromPedido)
                .collect(Collectors.toList());
    }
    
    /**
     * Listar pedidos por estado como DTO
     */
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorEstadoDTO(String estado) {
        return pedidoRepository.findByEstado(estado).stream()
                .map(PedidoResponseDTO::fromPedido)
                .collect(Collectors.toList());
    }
    
    /**
     * Buscar pedido por ID como DTO
     */
    @Transactional(readOnly = true)
    public Optional<PedidoResponseDTO> buscarPorIdDTO(Long id) {
        return pedidoRepository.findById(id).map(PedidoResponseDTO::fromPedido);
    }

    /**
     * Buscar pedidos por rango de fechas
     */
    @Transactional(readOnly = true)
    public List<Pedido> listarPorPeriodo(LocalDateTime inicio, LocalDateTime fin) {
        return pedidoRepository.findByFechaPedidoBetween(inicio, fin);
    }
    
    /**
     * Cambiar estado de pedido a COMPLETADO
     * El administrador marca como completado cuando el pedido fue entregado
     * También reduce el stock de los productos vendidos
     */
    public Pedido marcarComoCompletado(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        
        // Solo reducir stock si el pedido pasa de PENDIENTE a COMPLETADO
        if ("PENDIENTE".equals(pedido.getEstado())) {
            // Reducir stock de cada producto en el pedido
            if (pedido.getDetalles() != null) {
                for (DetallePedido detalle : pedido.getDetalles()) {
                    Producto producto = detalle.getProducto();
                    if (producto != null) {
                        int nuevoStock = producto.getStock() - detalle.getCantidad();
                        producto.setStock(Math.max(0, nuevoStock)); // No permitir stock negativo
                        productoRepository.save(producto);
                    }
                }
            }
        }
        
        pedido.setEstado("COMPLETADO");
        return pedidoRepository.save(pedido);
    }
    
    /**
     * Cambiar estado de pedido a PENDIENTE
     */
    public Pedido marcarComoPendiente(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        
        pedido.setEstado("PENDIENTE");
        return pedidoRepository.save(pedido);
    }
    
    /**
     * Cambiar estado de pedido a CANCELADO
     */
    public Pedido cancelarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        
        // Validar que no esté ya completado
        if ("COMPLETADO".equals(pedido.getEstado())) {
            throw new IllegalStateException("No se puede cancelar un pedido completado");
        }
        
        pedido.setEstado("CANCELADO");
        return pedidoRepository.save(pedido);
    }
    
    /**
     * Cambiar estado de un pedido (genérico)
     */
    public Pedido cambiarEstado(Long id, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        
        // Validar estados permitidos
        List<String> estadosPermitidos = List.of("PENDIENTE", "COMPLETADO", "CANCELADO", "EN_PROCESO");
        if (!estadosPermitidos.contains(nuevoEstado.toUpperCase())) {
            throw new IllegalArgumentException("Estado no válido: " + nuevoEstado);
        }
        
        pedido.setEstado(nuevoEstado.toUpperCase());
        return pedidoRepository.save(pedido);
    }
    
    /**
     * Contar pedidos por estado
     */
    @Transactional(readOnly = true)
    public long contarPorEstado(String estado) {
        return pedidoRepository.countByEstado(estado);
    }
    
    /**
     * Calcular total de ventas por período
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularVentasPorPeriodo(LocalDateTime inicio, LocalDateTime fin) {
        BigDecimal total = pedidoRepository.calcularTotalVentas(inicio, fin);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    /**
     * Calcular total de ventas del mes actual
     */
    @Transactional(readOnly = true)
    public BigDecimal calcularVentasMesActual() {
        int anio = LocalDateTime.now().getYear();
        int mes = LocalDateTime.now().getMonthValue();
        BigDecimal total = pedidoRepository.calcularVentasMes(anio, mes);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    /**
     * Obtener resumen de pedidos de hoy
     */
    @Transactional(readOnly = true)
    public ResumenPedidosHoy obtenerResumenHoy() {
        LocalDateTime inicioDia = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime finDia = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        
        List<Pedido> pedidosHoy = pedidoRepository.findByFechaPedidoBetween(inicioDia, finDia);
        
        long totalPedidos = pedidosHoy.size();
        long pendientes = pedidosHoy.stream().filter(p -> "PENDIENTE".equals(p.getEstado())).count();
        long completados = pedidosHoy.stream().filter(p -> "COMPLETADO".equals(p.getEstado())).count();
        
        BigDecimal totalVentas = pedidosHoy.stream()
            .filter(p -> "COMPLETADO".equals(p.getEstado()))
            .map(Pedido::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new ResumenPedidosHoy(totalPedidos, pendientes, completados, totalVentas);
    }
    
    /**
     * Clase interna para resumen de pedidos del día
     */
    public record ResumenPedidosHoy(
        long totalPedidos,
        long pendientes,
        long completados,
        BigDecimal totalVentas
    ) {}
}
