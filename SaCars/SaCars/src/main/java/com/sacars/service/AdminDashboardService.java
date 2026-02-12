package com.sacars.service;

import com.sacars.dto.EstadisticasDTO;
import com.sacars.model.Usuario;
import com.sacars.repository.PedidoRepository;
import com.sacars.repository.ProductoRepository;
import com.sacars.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Servicio para el Dashboard Administrativo (RQ1.4)
 * Proporciona estadísticas en tiempo real del negocio
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {
    
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    
    /**
     * Obtiene todas las estadísticas para el dashboard administrativo
     */
    public EstadisticasDTO obtenerEstadisticas() {
        EstadisticasDTO stats = new EstadisticasDTO();
        
        // CLIENTES REGISTRADOS
        // Total de clientes activos
        stats.setTotalClientes(
            usuarioRepository.countByRolAndActivo(Usuario.RolUsuario.cliente, true)
        );
        
        // Nuevos clientes en los últimos 7 días
        LocalDateTime hace7Dias = LocalDateTime.now().minusDays(7);
        LocalDateTime ahora = LocalDateTime.now();
        // Por simplicidad, contamos todos los activos (en producción harías un query con fecha)
        stats.setClientesNuevosUltimaSemana(0L); // TODO: implementar con fecha_registro
        
        // PEDIDOS
        // Pedidos pendientes (requieren atención)
        stats.setPedidosPendientes(
            pedidoRepository.countByEstado("PENDIENTE")
        );
        
        // Pedidos completados
        stats.setPedidosCompletados(
            pedidoRepository.countByEstado("COMPLETADO")
        );
        
        // Total de pedidos
        stats.setPedidosTotales(pedidoRepository.count());
        
        // INGRESOS POR VENTAS
        // Ingresos del mes actual
        LocalDateTime inicioMesActual = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime finMesActual = LocalDateTime.now();
        
        int anioActual = LocalDateTime.now().getYear();
        int mesActual = LocalDateTime.now().getMonthValue();
        
        stats.setIngresosMesActual(
            pedidoRepository.calcularVentasMes(anioActual, mesActual)
        );
        
        // Ingresos del mes anterior
        LocalDateTime mesAnteriorDate = LocalDateTime.now().minusMonths(1);
        int anioAnterior = mesAnteriorDate.getYear();
        int mesAnterior = mesAnteriorDate.getMonthValue();
        
        stats.setIngresosMesAnterior(
            pedidoRepository.calcularVentasMes(anioAnterior, mesAnterior)
        );
        
        // Calcular porcentaje de crecimiento
        Double porcentajeCrecimiento = calcularPorcentajeCrecimiento(
            stats.getIngresosMesActual(),
            stats.getIngresosMesAnterior()
        );
        stats.setPorcentajeCrecimiento(porcentajeCrecimiento);
        
        // PRODUCTOS
        // Total de productos activos
        stats.setProductosActivos(
            productoRepository.countByActivo(true)
        );
        
        // Total de productos (activos e inactivos)
        stats.setTotalProductos(productoRepository.count());
        
        // Total de unidades en stock
        Long totalStock = productoRepository.sumTotalStock();
        stats.setTotalUnidadesStock(totalStock != null ? totalStock : 0L);
        
        // Productos con stock bajo (menos de 3 unidades)
        stats.setProductosStockBajo(
            (long) productoRepository.findProductosStockBajo(3).size()
        );
        
        // Productos sin stock
        stats.setProductosSinStock(
            (long) productoRepository.findProductosSinStock().size()
        );
        
        return stats;
    }
    
    /**
     * Calcula el porcentaje de crecimiento entre dos valores
     */
    private Double calcularPorcentajeCrecimiento(BigDecimal valorActual, BigDecimal valorAnterior) {
        if (valorAnterior == null || valorAnterior.compareTo(BigDecimal.ZERO) == 0) {
            return valorActual != null && valorActual.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        
        if (valorActual == null) {
            return -100.0;
        }
        
        BigDecimal diferencia = valorActual.subtract(valorAnterior);
        BigDecimal porcentaje = diferencia
            .divide(valorAnterior, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
        
        return porcentaje.doubleValue();
    }
}
