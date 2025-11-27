package com.sacars.controller;

import com.sacars.model.Producto;
import com.sacars.repository.ProductoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    private final ProductoRepository productoRepository;

    public DebugController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping("/producto/{id}")
    public ResponseEntity<?> producto(@PathVariable Long id) {
        Optional<Producto> p = productoRepository.findById(id);
        if (p.isPresent()) {
            return ResponseEntity.ok(p.get());
        } else {
            return ResponseEntity.status(404).body(java.util.Map.of("error", "No encontrado"));
        }
    }
}
