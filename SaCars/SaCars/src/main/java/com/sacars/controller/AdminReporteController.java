package com.sacars.controller;

import com.sacars.dto.ReporteClienteDTO;
import com.sacars.dto.ReporteVentasDTO;
import com.sacars.service.AdminReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/* Controlador para Reportes del Sistema / Generación de reportes simples para negocio local */
@Controller
@RequestMapping("/admin/reportes")
@RequiredArgsConstructor
public class AdminReporteController {
    
    private final AdminReporteService reporteService;
    
    /* Vista de reportes / GET /admin/reportes */
    @GetMapping
    public String mostrarVistaReportes() {
        return "admin/reportes";
    }
    
    /* API: Reporte de ventas de HOY / GET /admin/reportes/api/ventas/hoy */
    @GetMapping("/api/ventas/hoy")
    @ResponseBody
    public ResponseEntity<ReporteVentasDTO> reporteVentasHoy() {
        try {
            ReporteVentasDTO reporte = reporteService.reporteVentasHoy();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de ventas de la ÚLTIMA SEMANA / GET /admin/reportes/api/ventas/ultima-semana */
    @GetMapping("/api/ventas/ultima-semana")
    @ResponseBody
    public ResponseEntity<ReporteVentasDTO> reporteVentasUltimaSemana() {
        try {
            ReporteVentasDTO reporte = reporteService.reporteVentasUltimaSemana();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de ventas del ÚLTIMO MES / GET /admin/reportes/api/ventas/ultimo-mes */
    @GetMapping("/api/ventas/ultimo-mes")
    @ResponseBody
    public ResponseEntity<ReporteVentasDTO> reporteVentasUltimoMes() {
        try {
            ReporteVentasDTO reporte = reporteService.reporteVentasUltimoMes();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de ventas del MES ACTUAL / GET /admin/reportes/api/ventas/mes-actual */
    @GetMapping("/api/ventas/mes-actual")
    @ResponseBody
    public ResponseEntity<ReporteVentasDTO> reporteVentasMesActual() {
        try {
            ReporteVentasDTO reporte = reporteService.reporteVentasMesActual();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de ventas por PERÍODO PERSONALIZADO / GET /admin/reportes/api/ventas/periodo */
    @GetMapping("/api/ventas/periodo")
    @ResponseBody
    public ResponseEntity<ReporteVentasDTO> reporteVentasPorPeriodo(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        try {
            ReporteVentasDTO reporte = reporteService.reporteVentasPorPeriodo(inicio, fin);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de CLIENTES REGISTRADOS / GET /admin/reportes/api/clientes */
    @GetMapping("/api/clientes")
    @ResponseBody
    public ResponseEntity<List<ReporteClienteDTO>> reporteClientesRegistrados() {
        try {
            List<ReporteClienteDTO> reporte = reporteService.reporteClientesRegistrados();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de TOP CLIENTES que más compraron (top 10) / GET /admin/reportes/api/clientes/top */
    @GetMapping("/api/clientes/top")
    @ResponseBody
    public ResponseEntity<List<ReporteClienteDTO>> reporteTopClientes() {
        try {
            List<ReporteClienteDTO> reporte = reporteService.reporteTopClientes();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de PEDIDOS POR ESTADO / GET /admin/reportes/api/pedidos/por-estado */
    @GetMapping("/api/pedidos/por-estado")
    @ResponseBody
    public ResponseEntity<Map<String, Long>> reportePedidosPorEstado() {
        try {
            Map<String, Long> reporte = reporteService.reportePedidosPorEstado();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de PEDIDOS POR ZONA (ciudad) / GET /admin/reportes/api/pedidos/por-zona */
    @GetMapping("/api/pedidos/por-zona")
    @ResponseBody
    public ResponseEntity<Map<String, Long>> reportePedidosPorZona() {
        try {
            Map<String, Long> reporte = reporteService.reportePedidosPorZona();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: Reporte de INGRESOS POR ZONA / GET /admin/reportes/api/ingresos/por-zona */
    @GetMapping("/api/ingresos/por-zona")
    @ResponseBody
    public ResponseEntity<Map<String, BigDecimal>> reporteIngresosPorZona() {
        try {
            Map<String, BigDecimal> reporte = reporteService.reporteIngresosPorZona();
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /* API: RESUMEN GENERAL del negocio / GET /admin/reportes/api/resumen-general */
    @GetMapping("/api/resumen-general")
    @ResponseBody
    public ResponseEntity<?> obtenerResumenGeneral() {
        try {
            AdminReporteService.ResumenGeneral resumen = reporteService.obtenerResumenGeneral();
            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
