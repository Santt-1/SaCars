package com.sacars.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private String apellido;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String contrasena;
    
    private String telefono;
    private String direccion;
    
    @Enumerated(EnumType.STRING)
    private RolUsuario rol = RolUsuario.cliente;
    
    private boolean activo = true;
    
    public enum RolUsuario {
        cliente,       // ← minúscula
        administrador  // ← minúscula
    }
}
