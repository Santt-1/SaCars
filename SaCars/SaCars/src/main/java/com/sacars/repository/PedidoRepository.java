package com.sacars.repository;

import com.sacars.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Buscar pedidos por el idUsuario del objeto Usuario (propiedad `idUsuario`)
    List<Pedido> findByUsuario_IdUsuario(Long idUsuario);
    
    // Métodos para panel administrativo
    
    // Buscar pedidos por estado
    List<Pedido> findByEstado(String estado);
    
    // Contar pedidos por estado
    long countByEstado(String estado);
    
    // Buscar pedidos por ciudad (zona de envío)
    List<Pedido> findByCiudadEnvio(String ciudad);
    
    // Buscar pedidos por fecha
    List<Pedido> findByFechaPedidoBetween(LocalDateTime inicio, LocalDateTime fin);
    
    // Buscar pedidos recientes (ordenados por fecha descendente)
    List<Pedido> findTop10ByOrderByFechaPedidoDesc();
    
    // Obtener todos los pedidos ordenados por fecha descendente
    List<Pedido> findAllByOrderByFechaPedidoDesc();
    
    // Calcular total de ventas por período
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p " +
           "WHERE p.estado = 'COMPLETADO' " +
           "AND p.fechaPedido BETWEEN :inicio AND :fin")
    BigDecimal calcularTotalVentas(@Param("inicio") LocalDateTime inicio, 
                                    @Param("fin") LocalDateTime fin);
    
    // Calcular total de ventas del mes actual
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p " +
           "WHERE p.estado = 'COMPLETADO' " +
           "AND YEAR(p.fechaPedido) = :anio " +
           "AND MONTH(p.fechaPedido) = :mes")
    BigDecimal calcularVentasMes(@Param("anio") int anio, @Param("mes") int mes);
    
    // Contar pedidos por período
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.fechaPedido BETWEEN :inicio AND :fin")
    long contarPedidosPorPeriodo(@Param("inicio") LocalDateTime inicio, 
                                  @Param("fin") LocalDateTime fin);
    
    // Obtener pedidos con información del cliente (búsqueda)
    @Query("SELECT p FROM Pedido p JOIN p.usuario u " +
           "WHERE LOWER(u.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(u.apellido) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :busqueda, '%'))")
    List<Pedido> buscarPedidosPorCliente(@Param("busqueda") String busqueda);
}
