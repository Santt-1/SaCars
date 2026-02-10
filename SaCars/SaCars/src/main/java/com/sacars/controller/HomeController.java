package com.sacars.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index"; // ← Página principal
    }
    
    @GetMapping("/carrito")
    public String carrito() {
        return "carrito";
    }
    
    @GetMapping("/catalogo")
    public String catalogo() {
        return "catalogo";
    }
    
    @GetMapping("/checkout")
    public String checkout() {
        return "checkout";
    }

    @GetMapping("/perfil")
    public String perfil() {
        return "perfil";
    }
    
    @GetMapping("/contacto")
    public String contacto() {
        return "contacto";
    }
    
    @GetMapping("/mas-sobre-nosotros")
    public String masSobreNosotros() {
        return "mas-sobre-nosotros";
    }
}