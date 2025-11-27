package com.sacars.service;

import com.sacars.dto.CheckoutItemDTO;
import com.sacars.dto.CheckoutRequestDTO;
import com.sacars.model.*;
import com.sacars.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final FacturaService facturaService;

    public PedidoService(PedidoRepository pedidoRepository,
                         ProductoRepository productoRepository,
                         DetallePedidoRepository detallePedidoRepository,
                         FacturaService facturaService) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.facturaService = facturaService;
    }

    @Transactional
    public Factura crearPedidoYFactura(CheckoutRequestDTO request, Usuario usuario) {

        // 1. Crear Pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado("PENDIENTE");
        pedido.setDireccionEnvio(request.getDireccionEnvio());
        pedido.setCiudadEnvio(request.getCiudadEnvio());
        pedido.setCodigoPostal(request.getCodigoPostal());
        pedido.setMetodoPago(request.getMetodoPago());

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("No se enviaron items en el pedido");
        }

        // Calculamos subtotal a partir de los items por seguridad
        BigDecimal subtotal = BigDecimal.ZERO;
        List<DetallePedido> detalles = new ArrayList<>();

        for (CheckoutItemDTO itemDto : request.getItems()) {
            Producto producto = productoRepository.findById(itemDto.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemDto.getIdProducto()));

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(itemDto.getCantidad());
            detalle.setPrecioUnitario(itemDto.getPrecioUnitario());

            BigDecimal lineSubtotal =
                    itemDto.getPrecioUnitario().multiply(BigDecimal.valueOf(itemDto.getCantidad()));

            detalle.setSubtotal(lineSubtotal);
            subtotal = subtotal.add(lineSubtotal);

            detalles.add(detalle);
        }

        // total = subtotal + costo de envío (si no viene, asumimos 0)
        BigDecimal costoEnvio = request.getCostoEnvio() != null ? request.getCostoEnvio() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(costoEnvio);

        pedido.setTotal(total);
        pedido.setDetalles(detalles);

        // Guardar pedido (cascade guarda los detalles)
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 2. Crear factura a partir del pedido
        return facturaService.generarFacturaDesdePedido(
        pedidoGuardado,
        subtotal,
        total,
        usuario.getDni()
    );
    }
}