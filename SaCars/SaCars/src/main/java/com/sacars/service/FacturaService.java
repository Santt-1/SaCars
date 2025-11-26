package com.sacars.service;

import com.sacars.model.Factura;
import com.sacars.model.Pedido;
import com.sacars.model.Usuario;
import com.sacars.repository.FacturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class FacturaService {

    private static final String SERIE = "B001";

    private final FacturaRepository facturaRepository;

    public FacturaService(FacturaRepository facturaRepository) {
        this.facturaRepository = facturaRepository;
    }

    @Transactional
    public Factura generarFacturaDesdePedido(Pedido pedido,
                                             BigDecimal subtotal,
                                             BigDecimal total) {

        Usuario usuario = pedido.getUsuario();

        // 1. Creamos factura con numero temporal para obtener el ID
        Factura factura = new Factura();
        factura.setPedido(pedido);
        factura.setNumeroFactura("TEMP");
        factura.setFechaEmision(LocalDateTime.now());

        factura.setNombreCliente(usuario.getNombre() + " " + usuario.getApellido());
        factura.setDniCliente(usuario.getDni());
        factura.setSubtotal(subtotal);
        factura.setTotal(total);

        factura.setEmpresaNombre("SaCars");
        factura.setEmpresaRuc("00000000000");
        factura.setEmpresaDireccion("Tarapoto - Perú");

        factura = facturaRepository.save(factura);

        // 2. Generar número correlativo con el id_factura
        String correlativo = String.format("%s-%06d", SERIE, factura.getId());
        factura.setNumeroFactura(correlativo);

        return facturaRepository.save(factura);
    }
}
