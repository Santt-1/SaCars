package com.sacars.controller;

import com.sacars.dto.EstadisticasDTO;
import com.sacars.model.Usuario;
import com.sacars.service.AdminDashboardService;
import com.sacars.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para el Dashboard Administrativo (RQ1.4)
 * Proporciona vistas y APIs para estadísticas del panel admin
 */
@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminDashboardController {
    
    private final AdminDashboardService dashboardService;
    private final UsuarioService usuarioService;
    
    /**
     * Vista del login administrativo
     * GET /admin/login
     */
    @GetMapping("/login")
    public String mostrarLoginAdmin() {
        return "admin/login";
    }
    
    /**
     * Vista del dashboard administrativo
     * GET /admin/dashboard
     */
    @GetMapping("/dashboard")
    public String mostrarDashboard() {
        return "admin/dashboard";
    }
    
    /**
     * API: Obtener usuario actual autenticado
     * GET /admin/api/usuario-actual
     */
    @GetMapping("/api/usuario-actual")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerUsuarioActual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            
            Usuario usuario = usuarioService.buscarPorEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("email", usuario.getEmail());
            response.put("nombre", usuario.getNombre());
            response.put("apellido", usuario.getApellido());
            response.put("rol", usuario.getRol());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
    
    /**
     * API: Obtener estadísticas del dashboard
     * GET /admin/api/estadisticas
     */
    @GetMapping("/api/estadisticas")
    @ResponseBody
    public ResponseEntity<EstadisticasDTO> obtenerEstadisticas() {
        try {
            EstadisticasDTO estadisticas = dashboardService.obtenerEstadisticas();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
