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

            String sql = "INSERT INTO productos (id_producto, nombre, descripcion, precio, stock, imagen_url, id_categoria, fecha_creacion, activo) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)";

            Object[][] rows = new Object[][]{
                    {4, "67 Camaro (HW Art Cars)", "Arte y músculo se fusionan en esta increíble pieza de la serie 'HW Art Cars'. Sobre la legendaria carrocería de un Chevrolet Camaro de 1967, se despliega un diseño único que simula circuitos electrónicos. Una joya que combina un clásico inmortal con un toque de creatividad moderna.", 20.00, 10, "/img/Catalogo1.png", null},
                    {5, "Electrack (X-Raycers)", "Mira bajo el capó sin siquiera abrirlo. Este Hot Rod de la serie X-Raycers cuenta con un chasis de policarbonato traslúcido que revela su potente motor y detalles internos. Es una pieza perfecta para los amantes de la ingeniería y el diseño radical.", 15.00, 10, "/img/Catalogo2.png", null},
                    {6, "15 Dodge Challenger SRT Hellcat", "La bestia del Mopar, lista para tu colección. Esta es una réplica fiel y detallada del supercargado Dodge Challenger SRT Hellcat, capturando su agresividad y potencia en cada línea. Un modelo indispensable para los fans del 'muscle car' moderno.", 15.00, 10, "/img/Catalogo3.png", null},
                    {7, "Impavido 1", "Velocidad y estilo italiano en su máxima expresión. El Impavido 1 es un diseño original de Hot Wheels que toma inspiración de los superdeportivos más exóticos del mundo. Sus líneas aerodinámicas y su perfil bajo lo convierten en una pieza central en cualquier exhibición.", 15.00, 10, "/img/Catalogo4.png", null},
                    {8, "Driftsta", "Diseñado para ir de lado, pero perfecto para estar al frente de tu colección. Con una clara inspiración en la cultura JDM (Japanese Domestic Market), este convertible modificado para el drifting es pura agresividad. Su enorme alerón y carrocería ancha lo hacen inconfundible.", 20.00, 10, "/img/Catalogo5.png", null},
                    {9, "Rip Rod", "El espíritu del Hot Rod clásico, llevado al extremo. Basado en un auto de los años 30, el Rip Rod está reimaginado con un motor V8 expuesto y una suspensión todoterreno. Es la combinación perfecta entre nostalgia y la fantasía extrema de Hot Wheels.", 22.00, 10, "/img/Catalogo6.png", null},
                    {10, "Ford GT-40", "Posee una pieza de la historia del automovilismo. Esta es una réplica del legendario Ford GT-40, el auto que fue construido para vencer a Ferrari en las 24 Horas de Le Mans y lo logró. No es solo un carrito, es un tributo a una hazaña épica.", 35.00, 10, "/img/Catalogo7.png", null},
                    {11, "Carbonator", "Probablemente la pieza más útil y conversada de tu colección. Este icónico modelo de la serie 'Experimotors' tiene una doble función: es un auto coleccionable y un práctico abridor de botellas. Un diseño genial que nunca pasa desapercibido.", 20.00, 10, "/img/Catalogo8.png", null},
                    {12, "Let's GO", "Para la aventura más allá del asfalto. Este ágil Go-Kart todoterreno está diseñado para la máxima diversión. Con su estructura expuesta y llantas de gran agarre, el 'Let's GO' es una pieza única que evoca velocidad y acción en cualquier terreno.", 15.00, 10, "/img/Catalogo9.png", null},
                    {13, "Lamborghini Aventador J", "Una bestia italiana de edición limitada. El Aventador J es uno de los Lamborghini más exclusivos jamás creados, con solo una unidad producida. Este modelo de Hot Wheels captura su diseño radical sin techo y su potencia V12.", 40.00, 10, "/img/Catalogo1.png", null},
                    {14, "Porsche 911 GT3 RS", "Ingeniería alemana al límite. El 911 GT3 RS representa lo mejor de Porsche: motor atmosférico, aerodinámica avanzada y un manejo quirúrgico. Un ícono moderno del automovilismo.", 38.00, 10, "/img/Catalogo2.png", null},
                    {15, "McLaren P1", "Tecnología de F1 para la calle. El P1 combina un motor V8 twin-turbo con un sistema híbrido para producir 903 HP. Su diseño aerodinámico y su DRS activo lo convierten en una obra maestra de la ingeniería.", 45.00, 10, "/img/Catalogo3.png", null},
                    {16, "Bugatti Chiron Super Sport", "El rey de la velocidad. El Chiron Super Sport alcanza más de 490 km/h, convirtiéndose en el auto de producción más rápido del planeta. Su motor W16 quad-turbo es una obra de arte mecánica.", 50.00, 10, "/img/Catalogo4.png", null},
                    {17, "Ferrari LaFerrari", "El Ferrari definitivo. Con 963 HP combinados de su V12 y motor eléctrico, LaFerrari representa la cúspide de la tecnología de Maranello. Solo 499 unidades fueron producidas.", 42.00, 10, "/img/Catalogo5.png", null},
                    {18, "Nissan GT-R R35 Nismo", "El asesino de superdeportivos. El GT-R R35 usa un V6 twin-turbo y tracción total para ofrecer un rendimiento brutal a un precio accesible. La versión Nismo lleva todo al extremo.", 30.00, 10, "/img/Catalogo6.png", null},
                    {19, "Corvette C8 Stingray", "Revolución americana. Por primera vez en su historia, el Corvette tiene el motor en el medio, transformándolo en un verdadero competidor de Ferrari y Lamborghini a una fracción del precio.", 28.00, 10, "/img/Catalogo7.png", null},
                    {20, "Audi R8 V10 Plus", "El superdeportivo cotidiano. El R8 V10 Plus combina el motor V10 atmosférico de Lamborghini con la practicidad y tecnología Quattro de Audi. Perfecto para uso diario y track days.", 32.00, 10, "/img/Catalogo8.png", null},
                    {21, "BMW M4 Competition", "Precisión bávara. El M4 Competition es el equilibrio perfecto entre un auto deportivo de alto rendimiento y un gran turismo. Su motor S58 de 510 HP ofrece una experiencia de conducción inolvidable.", 25.00, 10, "/img/Catalogo9.png", null}
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
