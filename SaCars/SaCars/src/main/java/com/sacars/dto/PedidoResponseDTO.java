package com.sacars.dto;

import com.sacars.model.Pedido;
import com.sacars.model.DetallePedido;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO de respuesta para pedidos con información completa
 * Incluye datos del cliente y productos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponseDTO {
    
    private Long idPedido;
    private LocalDateTime fechaPedido;
    private String estado;
    private BigDecimal total;
    private String metodoPago;
    
    // Información de envío
    private String direccionEnvio;
    private String ciudadEnvio;  // Zona: Tarapoto, Morales, Banda de Shilcayo
    private String codigoPostal;
    
    // Información del cliente
    private Long idCliente;
    private String nombreCliente;
    private String emailCliente;
    private String telefonoCliente;
    private String direccionCliente;
    
    // Cantidad de items
    private Integer cantidadItems;
    
    // Lista de productos (para detalle)
    private List<ProductoDetalle> productos;
    
    /**
     * Constructor desde entidad Pedido
     */
    public static PedidoResponseDTO fromPedido(Pedido pedido) {
        PedidoResponseDTO dto = new PedidoResponseDTO();
        dto.setIdPedido(pedido.getId());
        dto.setFechaPedido(pedido.getFechaPedido());
        dto.setEstado(pedido.getEstado());
        dto.setTotal(pedido.getTotal());
        dto.setMetodoPago(pedido.getMetodoPago());
        dto.setDireccionEnvio(pedido.getDireccionEnvio());
        dto.setCiudadEnvio(pedido.getCiudadEnvio());
        dto.setCodigoPostal(pedido.getCodigoPostal());
        
        // Información del cliente
        if (pedido.getUsuario() != null) {
            dto.setIdCliente(pedido.getUsuario().getIdUsuario());
            dto.setNombreCliente(pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido());
            dto.setEmailCliente(pedido.getUsuario().getEmail());
            dto.setTelefonoCliente(pedido.getUsuario().getTelefono());
            dto.setDireccionCliente(pedido.getUsuario().getDireccion());
        }
        
        // Cantidad de items y productos
        if (pedido.getDetalles() != null && !pedido.getDetalles().isEmpty()) {
            dto.setCantidadItems(pedido.getDetalles().size());
            dto.setProductos(pedido.getDetalles().stream()
                    .map(ProductoDetalle::fromDetalle)
                    .collect(Collectors.toList()));
        } else {
            dto.setCantidadItems(0);
        }
        
        return dto;
    }
    
    /**
     * Subclase para productos del pedido
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoDetalle {
        private Long idProducto;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
        
        public static ProductoDetalle fromDetalle(DetallePedido detalle) {
            ProductoDetalle prod = new ProductoDetalle();
            prod.setCantidad(detalle.getCantidad());
            prod.setPrecioUnitario(detalle.getPrecioUnitario());
            prod.setSubtotal(detalle.getSubtotal());
            
            // Nombre y ID del producto
            if (detalle.getProducto() != null) {
                prod.setIdProducto(detalle.getProducto().getId());
                prod.setNombreProducto(detalle.getProducto().getNombre());
            } else {
                prod.setIdProducto(null);
                prod.setNombreProducto("Producto desconocido");
            }
            
            return prod;
        }
    }
}
