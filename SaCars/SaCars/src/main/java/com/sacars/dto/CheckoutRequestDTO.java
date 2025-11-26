package com.sacars.dto;
import java.math.BigDecimal;
import java.util.List;

public class CheckoutRequestDTO {

    // Datos de envío
    private String direccionEnvio;
    private String ciudadEnvio;
    private String codigoPostal;
    private Long idUsuario;


    // Métodos de pago / envío
    private String metodoPago;   // Yape, Efectivo...
    private BigDecimal costoEnvio;

    // Carrito
    private List<CheckoutItemDTO> items;

    // Totales
    private BigDecimal subtotal;
    private BigDecimal total;

    // getters y setters
    public String getDireccionEnvio() {
        return direccionEnvio;
    }
    public void setDireccionEnvio(String direccionEnvio) {
        this.direccionEnvio = direccionEnvio;
    }
    public String getCiudadEnvio() {
        return ciudadEnvio;
    }
    public void setCiudadEnvio(String ciudadEnvio) {
        this.ciudadEnvio = ciudadEnvio;
    }
    public String getCodigoPostal() {
        return codigoPostal;
    }
    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }
    public String getMetodoPago() {
        return metodoPago;
    }
    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }
    public BigDecimal getCostoEnvio() {
        return costoEnvio;
    }
    public void setCostoEnvio(BigDecimal costoEnvio) {
        this.costoEnvio = costoEnvio;
    }
    public List<CheckoutItemDTO> getItems() {
        return items;
    }
    public void setItems(List<CheckoutItemDTO> items) {
        this.items = items;
    }
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    public BigDecimal getTotal() {
        return total;
    }
    public void setTotal(BigDecimal total) {
        this.total = total;
    }
    public Long getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

}