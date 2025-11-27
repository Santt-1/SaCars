package com.sacars.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Si ya existe al menos un producto con id 4 asumimos que el seeding ya se ejecutó antes
            Integer exists = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM productos WHERE id_producto = 4", Integer.class);
            if (exists != null && exists > 0) {
                System.out.println("DataInitializer: Productos ya presentes, no se inserta nada.");
                return;
            }

            String sql = "INSERT INTO productos (id_producto, nombre, descripcion, precio, stock, imagen_url, id_categoria, destacado, fecha_creacion, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)";

            Object[][] rows = new Object[][]{
                    {4, "67 Camaro (HW Art Cars)", "67 Camaro - descripción", 20.00, 10, "/img/Catalogo1.png", null, 0},
                    {5, "Electrack (X-Raycers)", "Electrack - descripción", 15.00, 10, "/img/Catalogo2.png", null, 0},
                    {6, "15 Dodge Challenger SRT Hellcat", "Dodge - descripción", 15.00, 10, "/img/Catalogo3.png", null, 0},
                    {7, "Impavido 1", "Impavido - descripción", 15.00, 10, "/img/Catalogo4.png", null, 0},
                    {8, "Driftsta", "Driftsta - descripción", 20.00, 10, "/img/Catalogo5.png", null, 0},
                    {9, "Rip Rod", "Rip Rod - descripción", 22.00, 10, "/img/Catalogo6.png", null, 0},
                    {10, "Ford GT-40", "Ford GT-40 - descripción", 35.00, 10, "/img/Catalogo7.png", null, 0},
                    {11, "Carbonator", "Carbonator - descripción", 20.00, 10, "/img/Catalogo8.png", null, 0},
                    {12, "Let's GO", "Let's GO - descripción", 15.00, 10, "/img/Catalogo9.png", null, 0},
                    {13, "Lamborghini Aventador J", "Aventador - descripción", 40.00, 10, "/img/Catalogo1.png", null, 0},
                    {14, "Porsche 911 GT3 RS", "Porsche - descripción", 38.00, 10, "/img/Catalogo2.png", null, 0},
                    {15, "McLaren P1", "McLaren P1 - descripción", 45.00, 10, "/img/Catalogo3.png", null, 0},
                    {16, "Bugatti Chiron Super Sport", "Bugatti - descripción", 50.00, 10, "/img/Catalogo4.png", null, 0},
                    {17, "Ferrari LaFerrari", "LaFerrari - descripción", 42.00, 10, "/img/Catalogo5.png", null, 0},
                    {18, "Nissan GT-R R35 Nismo", "Nissan - descripción", 30.00, 10, "/img/Catalogo6.png", null, 0},
                    {19, "Corvette C8 Stingray", "Corvette - descripción", 28.00, 10, "/img/Catalogo7.png", null, 0},
                    {20, "Audi R8 V10 Plus", "Audi R8 - descripción", 32.00, 10, "/img/Catalogo8.png", null, 0},
                    {21, "BMW M4 Competition", "BMW M4 - descripción", 25.00, 10, "/img/Catalogo9.png", null, 0}
            };

            for (Object[] row : rows) {
                try {
                    jdbcTemplate.update(sql, row);
                } catch (Exception ex) {
                    // Ignorar errores de inserción individuales para no romper el arranque
                    System.out.println("DataInitializer: No se pudo insertar producto: " + row[0] + " -> " + ex.getMessage());
                }
            }

            System.out.println("DataInitializer: Productos de prueba insertados.");
        } catch (Exception ex) {
            System.err.println("DataInitializer: Error al inicializar productos: " + ex.getMessage());
        }
    }
}
