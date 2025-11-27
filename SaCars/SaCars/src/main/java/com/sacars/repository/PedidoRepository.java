package com.sacars.repository;

import com.sacars.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // Buscar pedidos por el idUsuario del objeto Usuario (propiedad `idUsuario`)
    List<Pedido> findByUsuario_IdUsuario(Long idUsuario);
}