package com.sacars.controller;

import com.sacars.dto.CheckoutRequestDTO;
import com.sacars.model.Factura;
import com.sacars.model.Pedido;
import com.sacars.model.Usuario;
import com.sacars.service.PedidoService;
import com.sacars.service.UsuarioService;
import com.sacars.repository.PedidoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;
    private final PedidoRepository pedidoRepository;
    
    // Directorio para guardar comprobantes - rutas absolutas correctas
    private static final String BASE_DIR = "C:/xampp/htdocs/SaCars/SaCars/SaCars";
    private static final String UPLOAD_DIR = BASE_DIR + "/src/main/resources/static/img/comprobantes/";
    private static final String TARGET_DIR = BASE_DIR + "/target/classes/static/img/comprobantes/";

    public CheckoutController(PedidoService pedidoService,
                              UsuarioService usuarioService,
                              PedidoRepository pedidoRepository) {
        this.pedidoService = pedidoService;
        this.usuarioService = usuarioService;
        this.pedidoRepository = pedidoRepository;
    }

    @PostMapping
    public ResponseEntity<?> finalizarCompra(@RequestBody CheckoutRequestDTO request) {
        System.out.println("REQUEST RECIBIDO:");
        System.out.println("ID usuario: " + request.getIdUsuario());
        System.out.println("Items:");
        request.getItems().forEach(i -> {
            System.out.println(" - idProducto: " + i.getIdProducto());
            System.out.println("   cantidad: " + i.getCantidad());
            System.out.println("   precio: " + i.getPrecioUnitario());
        });
        if (request.getIdUsuario() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "ID de usuario no enviado")
            );
        }

        Usuario usuario = usuarioService.buscarPorId(request.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            Factura factura = pedidoService.crearPedidoYFactura(request, usuario);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("idFactura", factura.getId());
            response.put("numeroFactura", factura.getNumeroFactura());
            response.put("idPedido", factura.getPedido().getId());

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", ex.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    /**
     * Endpoint para subir comprobante de pago (Yape/Plin)
     * POST /api/checkout/comprobante/{idPedido}
     */
    @PostMapping("/comprobante/{idPedido}")
    public ResponseEntity<?> subirComprobante(
            @PathVariable Long idPedido,
            @RequestParam("file") MultipartFile file) {
        
        try {
            // Validar que el pedido existe
            Pedido pedido = pedidoRepository.findById(idPedido)
                    .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
            
            // Validar que es un archivo de imagen
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Solo se permiten archivos de imagen")
                );
            }
            
            // Crear directorios si no existen (src y target)
            Path uploadPath = Paths.get(UPLOAD_DIR);
            Path targetPath = Paths.get(TARGET_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            if (!Files.exists(targetPath)) {
                Files.createDirectories(targetPath);
            }
            
            // Generar nombre único para el archivo
            String extension = getFileExtension(file.getOriginalFilename());
            String fileName = "comprobante_" + idPedido + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
            
            // Guardar archivo en ambas ubicaciones (src y target)
            Path filePath = uploadPath.resolve(fileName);
            Path targetFilePath = targetPath.resolve(fileName);
            byte[] fileBytes = file.getBytes();
            Files.write(filePath, fileBytes);
            Files.write(targetFilePath, fileBytes);
            
            // Actualizar pedido con la ruta del comprobante
            String rutaWeb = "/img/comprobantes/" + fileName;
            pedido.setComprobantePago(rutaWeb);
            pedido.setPagoVerificado(false); // El admin debe verificar
            pedidoRepository.save(pedido);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comprobante subido correctamente");
            response.put("rutaComprobante", rutaWeb);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.status(500).body(
                Map.of("success", false, "message", "Error al guardar el archivo: " + e.getMessage())
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Map.of("success", false, "message", e.getMessage())
            );
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

}
