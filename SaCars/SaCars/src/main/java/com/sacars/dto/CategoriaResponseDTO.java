package com.sacars.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para categorías con información adicional
 * Incluye la cantidad de productos asociados
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaResponseDTO {
    
    private Long idCategoria;
    private String nombre;
    private String descripcion;
    private String imagenUrl;
    private Long cantidadProductos;
    
    /**
     * Constructor sin cantidadProductos (valor por defecto 0)
     */
    public CategoriaResponseDTO(Long idCategoria, String nombre, String descripcion, String imagenUrl) {
        this.idCategoria = idCategoria;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.cantidadProductos = 0L;
    }
}
