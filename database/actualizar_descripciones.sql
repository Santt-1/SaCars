-- Script para actualizar las descripciones de los productos Hot Wheels
-- Ejecutar en phpMyAdmin o MySQL Workbench

USE sacars_db;

-- Actualizar descripciones de productos existentes
UPDATE productos SET descripcion = 'Arte y músculo se fusionan en esta increíble pieza de la serie ''HW Art Cars''. Sobre la legendaria carrocería de un Chevrolet Camaro de 1967, se despliega un diseño único que simula circuitos electrónicos. Una joya que combina un clásico inmortal con un toque de creatividad moderna.' WHERE id_producto = 4;

UPDATE productos SET descripcion = 'Mira bajo el capó sin siquiera abrirlo. Este Hot Rod de la serie X-Raycers cuenta con un chasis de policarbonato traslúcido que revela su potente motor y detalles internos. Es una pieza perfecta para los amantes de la ingeniería y el diseño radical.' WHERE id_producto = 5;

UPDATE productos SET descripcion = 'La bestia del Mopar, lista para tu colección. Esta es una réplica fiel y detallada del supercargado Dodge Challenger SRT Hellcat, capturando su agresividad y potencia en cada línea. Un modelo indispensable para los fans del ''muscle car'' moderno.' WHERE id_producto = 6;

UPDATE productos SET descripcion = 'Velocidad y estilo italiano en su máxima expresión. El Impavido 1 es un diseño original de Hot Wheels que toma inspiración de los superdeportivos más exóticos del mundo. Sus líneas aerodinámicas y su perfil bajo lo convierten en una pieza central en cualquier exhibición.' WHERE id_producto = 7;

UPDATE productos SET descripcion = 'Diseñado para ir de lado, pero perfecto para estar al frente de tu colección. Con una clara inspiración en la cultura JDM (Japanese Domestic Market), este convertible modificado para el drifting es pura agresividad. Su enorme alerón y carrocería ancha lo hacen inconfundible.' WHERE id_producto = 8;

UPDATE productos SET descripcion = 'El espíritu del Hot Rod clásico, llevado al extremo. Basado en un auto de los años 30, el Rip Rod está reimaginado con un motor V8 expuesto y una suspensión todoterreno. Es la combinación perfecta entre nostalgia y la fantasía extrema de Hot Wheels.' WHERE id_producto = 9;

UPDATE productos SET descripcion = 'Posee una pieza de la historia del automovilismo. Esta es una réplica del legendario Ford GT-40, el auto que fue construido para vencer a Ferrari en las 24 Horas de Le Mans y lo logró. No es solo un carrito, es un tributo a una hazaña épica.' WHERE id_producto = 10;

UPDATE productos SET descripcion = 'Probablemente la pieza más útil y conversada de tu colección. Este icónico modelo de la serie ''Experimotors'' tiene una doble función: es un auto coleccionable y un práctico abridor de botellas. Un diseño genial que nunca pasa desapercibido.' WHERE id_producto = 11;

UPDATE productos SET descripcion = 'Para la aventura más allá del asfalto. Este ágil Go-Kart todoterreno está diseñado para la máxima diversión. Con su estructura expuesta y llantas de gran agarre, el ''Let''s GO'' es una pieza única que evoca velocidad y acción en cualquier terreno.' WHERE id_producto = 12;

UPDATE productos SET descripcion = 'Una bestia italiana de edición limitada. El Aventador J es uno de los Lamborghini más exclusivos jamás creados, con solo una unidad producida. Este modelo de Hot Wheels captura su diseño radical sin techo y su potencia V12.' WHERE id_producto = 13;

UPDATE productos SET descripcion = 'Ingeniería alemana al límite. El 911 GT3 RS representa lo mejor de Porsche: motor atmosférico, aerodinámica avanzada y un manejo quirúrgico. Un ícono moderno del automovilismo.' WHERE id_producto = 14;

UPDATE productos SET descripcion = 'Tecnología de F1 para la calle. El P1 combina un motor V8 twin-turbo con un sistema híbrido para producir 903 HP. Su diseño aerodinámico y su DRS activo lo convierten en una obra maestra de la ingeniería.' WHERE id_producto = 15;

UPDATE productos SET descripcion = 'El rey de la velocidad. El Chiron Super Sport alcanza más de 490 km/h, convirtiéndose en el auto de producción más rápido del planeta. Su motor W16 quad-turbo es una obra de arte mecánica.' WHERE id_producto = 16;

UPDATE productos SET descripcion = 'El Ferrari definitivo. Con 963 HP combinados de su V12 y motor eléctrico, LaFerrari representa la cúspide de la tecnología de Maranello. Solo 499 unidades fueron producidas.' WHERE id_producto = 17;

UPDATE productos SET descripcion = 'El asesino de superdeportivos. El GT-R R35 usa un V6 twin-turbo y tracción total para ofrecer un rendimiento brutal a un precio accesible. La versión Nismo lleva todo al extremo.' WHERE id_producto = 18;

UPDATE productos SET descripcion = 'Revolución americana. Por primera vez en su historia, el Corvette tiene el motor en el medio, transformándolo en un verdadero competidor de Ferrari y Lamborghini a una fracción del precio.' WHERE id_producto = 19;

UPDATE productos SET descripcion = 'El superdeportivo cotidiano. El R8 V10 Plus combina el motor V10 atmosférico de Lamborghini con la practicidad y tecnología Quattro de Audi. Perfecto para uso diario y track days.' WHERE id_producto = 20;

UPDATE productos SET descripcion = 'Precisión bávara. El M4 Competition es el equilibrio perfecto entre un auto deportivo de alto rendimiento y un gran turismo. Su motor S58 de 510 HP ofrece una experiencia de conducción inolvidable.' WHERE id_producto = 21;

-- Verificar actualizaciones
SELECT id_producto, nombre, LEFT(descripcion, 80) AS descripcion_preview FROM productos WHERE id_producto BETWEEN 4 AND 21;
