package com.sacars.controller;

import com.sacars.model.Categoria;
import com.sacars.model.Producto;
import com.sacars.repository.CategoriaRepository;
import com.sacars.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    @GetMapping("/")
    public String home() {
        return "index"; // ← Página principal
    }
    
    @GetMapping("/carrito")
    public String carrito() {
        return "carrito";
    }
    
    @GetMapping("/catalogo")
    public String catalogo(Model model) {
        // Obtener productos activos
        List<Producto> productos = productoRepository.findByActivo(true);
        
        // Obtener todas las categorías
        List<Categoria> categorias = categoriaRepository.findAll();
        
        // Crear mapa de categorías para búsqueda rápida
        Map<Long, String> mapaCategorias = new HashMap<>();
        for (Categoria cat : categorias) {
            mapaCategorias.put(cat.getIdCategoria(), cat.getNombre());
        }
        
        // Asignar nombre de categoría a cada producto
        for (Producto producto : productos) {
            if (producto.getIdCategoria() != null) {
                producto.setCategoriaNombre(mapaCategorias.get(producto.getIdCategoria()));
            }
        }
        
        model.addAttribute("productos", productos);
        model.addAttribute("categorias", categorias);
        
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