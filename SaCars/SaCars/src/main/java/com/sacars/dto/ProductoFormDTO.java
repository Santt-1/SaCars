package com.sacars.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para formulario de creación/edición de productos (RQ1.8)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoFormDTO {
    
    private Long id;
    
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;
    
    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;
    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;
    
    @NotNull(message = "El stock inicial es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;
    
    private Long idCategoria;
    
    @Size(max = 255, message = "La URL de imagen no puede exceder 255 caracteres")
    private String imagenUrl;
    
    private Boolean activo = true;
}
