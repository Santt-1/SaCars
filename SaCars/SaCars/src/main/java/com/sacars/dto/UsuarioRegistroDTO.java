package com.sacars.dto;

import com.sacars.model.Usuario;
import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

@Data
public class UsuarioRegistroDTO {
    private Long id;
    
    @NotEmpty(message = "El nombre es obligatorio")
    private String nombre;
    
    @NotEmpty(message = "El apellido es obligatorio")
    private String apellido;

    @NotEmpty(message = "El DNI es obligatorio")
    private String dni;
    
    @NotEmpty(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;
    
    @NotEmpty(message = "La contraseña es obligatoria")
    private String contrasena;
    
    private String telefono;
    private String direccion;


    
    public Usuario toUsuario() {
        Usuario usuario = new Usuario();
        usuario.setIdUsuario(this.id);
        usuario.setNombre(this.nombre);
        usuario.setApellido(this.apellido);
        usuario.setDni(this.dni);
        usuario.setEmail(this.email);
        usuario.setContrasena(this.contrasena);
        usuario.setTelefono(this.telefono);
        usuario.setDireccion(this.direccion);
        return usuario;
    }
}
