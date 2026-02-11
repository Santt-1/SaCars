-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-02-2026 a las 16:24:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sacars_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id_item` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `fecha_agregado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`, `imagen_url`) VALUES
(1, 'Deportivos', 'Autos deportivos de alta gama', NULL),
(2, 'Clásicos', 'Autos clásicos y de colección', NULL),
(3, 'Tuners', 'Autos modificados y personalizados', NULL),
(4, 'Carreras', 'Autos de competición', NULL),
(5, 'Fantasía', 'Diseños únicos y especiales', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

CREATE TABLE `contactos` (
  `id_contacto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `asunto` varchar(200) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_contacto` timestamp NOT NULL DEFAULT current_timestamp(),
  `leido` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` bigint(20) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(38,2) NOT NULL,
  `subtotal` decimal(38,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id_detalle`, `id_pedido`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 4, 1, 20.00, 20.00),
(2, 2, 4, 1, 20.00, 20.00),
(3, 3, 4, 1, 20.00, 20.00),
(4, 4, 4, 1, 20.00, 20.00),
(5, 5, 8, 1, 20.00, 20.00),
(6, 6, 4, 1, 20.00, 20.00),
(7, 7, 5, 1, 15.00, 15.00),
(8, 8, 8, 1, 20.00, 20.00),
(9, 8, 6, 1, 15.00, 15.00),
(10, 9, 13, 1, 40.00, 40.00),
(11, 10, 8, 1, 20.00, 20.00),
(12, 10, 6, 1, 15.00, 15.00),
(13, 11, 4, 1, 20.00, 20.00),
(14, 12, 4, 1, 20.00, 20.00),
(15, 13, 4, 1, 20.00, 20.00),
(16, 13, 5, 1, 15.00, 15.00),
(17, 13, 6, 1, 15.00, 15.00),
(18, 13, 7, 1, 15.00, 15.00),
(19, 14, 9, 1, 22.00, 22.00),
(20, 14, 8, 1, 20.00, 20.00),
(21, 15, 4, 1, 20.00, 20.00),
(22, 15, 5, 1, 15.00, 15.00),
(23, 16, 4, 1, 20.00, 20.00),
(24, 17, 8, 1, 20.00, 20.00),
(25, 18, 6, 1, 15.00, 15.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` bigint(20) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `numero_factura` varchar(20) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `nombre_cliente` varchar(100) NOT NULL,
  `dni_cliente` varchar(20) NOT NULL,
  `subtotal` decimal(38,2) NOT NULL,
  `total` decimal(38,2) NOT NULL,
  `empresa_nombre` varchar(150) DEFAULT 'SaCars',
  `empresa_ruc` varchar(20) DEFAULT '45529645621',
  `empresa_direccion` varchar(100) DEFAULT 'Tarapoto - Perú'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura`
--

INSERT INTO `factura` (`id_factura`, `id_pedido`, `numero_factura`, `fecha_emision`, `nombre_cliente`, `dni_cliente`, `subtotal`, `total`, `empresa_nombre`, `empresa_ruc`, `empresa_direccion`) VALUES
(1, 1, 'B001-000001', '2025-11-27 03:48:37', 'Cliente Prueba', '00000000', 20.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(2, 2, 'B001-000002', '2025-11-27 03:59:23', 'Cliente Prueba', '00000000', 20.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(3, 3, 'B001-000003', '2025-11-27 03:59:48', 'Cliente Prueba', '00000000', 20.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(4, 4, 'B001-000004', '2025-11-27 04:07:53', 'Cliente Prueba', '00000000', 20.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(5, 5, 'B001-000005', '2025-11-27 04:12:17', 'Jose sa Po Ri', '72129871', 20.00, 30.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(6, 6, 'B001-000006', '2025-11-27 16:24:37', 'José Santiago Ponce Riveros ', '72129871', 20.00, 30.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(7, 7, 'B001-000007', '2025-11-27 16:53:07', 'Pepe Perez', '00000000', 15.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(8, 8, 'B001-000008', '2025-11-27 22:12:40', 'José Santiago Ponce Riveros ', '72129871', 35.00, 45.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(9, 9, 'B001-000009', '2025-11-27 22:45:10', 'José Santiago Ponce Riveros ', '72129871', 40.00, 50.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(10, 10, 'B001-000010', '2025-11-27 22:55:16', 'Jose sa Po Ri', '72129871', 35.00, 45.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(11, 11, 'B001-000011', '2025-11-27 23:54:03', 'Josesito san Ponce Riveros', '72129870', 20.00, 30.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(12, 12, 'B001-000012', '2025-12-01 23:11:40', 'Jose sa pinedo', '72129871', 20.00, 30.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(13, 13, 'B001-000013', '2025-12-01 23:23:44', 'Josesitox pinedo', '72129871', 65.00, 70.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(14, 14, 'B001-000014', '2025-12-01 23:50:42', 'Pita Pen', '71273737', 42.00, 52.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(15, 15, 'B001-000015', '2025-12-02 00:06:06', 'Pita Pen', '71273737', 35.00, 45.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(16, 16, 'B001-000016', '2025-12-02 00:10:04', 'Josesitox pinedo', '72129871', 20.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(17, 17, 'B001-000017', '2025-12-02 00:21:05', 'Josesitox pinedo', '72129871', 20.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú'),
(18, 18, 'B001-000018', '2026-01-31 14:45:06', 'Jordy Adriel Ponce', '23434432', 15.00, 25.00, 'SaCars', '00000000000', 'Tarapoto - Perú');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` varchar(20) DEFAULT NULL,
  `direccion_envio` text NOT NULL,
  `ciudad_envio` varchar(100) NOT NULL,
  `codigo_postal` varchar(20) NOT NULL,
  `total` decimal(38,2) NOT NULL,
  `metodo_pago` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `id_usuario`, `fecha_pedido`, `estado`, `direccion_envio`, `ciudad_envio`, `codigo_postal`, `total`, `metodo_pago`) VALUES
(1, 4, '2025-11-27 08:48:36', 'PENDIENTE', 'Calle Falsa 123', 'Tarapoto', '22002', 25.00, 'Contra entrega'),
(2, 4, '2025-11-27 08:59:23', 'PENDIENTE', 'Calle Falsa 123', 'Tarapoto', '22002', 25.00, 'efectivo'),
(3, 4, '2025-11-27 08:59:48', 'PENDIENTE', 'Calle Falsa 123', 'Tarapoto', '22002', 25.00, 'efectivo'),
(4, 4, '2025-11-27 09:07:53', 'PENDIENTE', 'Calle Falsa 123', 'Tarapoto', '22002', 25.00, 'efectivo'),
(5, 14, '2025-11-27 09:12:17', 'PENDIENTE', 'Jr Arica 236\nBarrio Huayco', 'Morales', '22001', 30.00, 'Contra entrega'),
(6, 11, '2025-11-27 21:24:37', 'PENDIENTE', 'jr jaimito 129', 'Morales', '22001', 30.00, 'Contra entrega'),
(7, 5, '2025-11-27 21:53:07', 'PENDIENTE', 'jr pinos 123', 'Morales', '22001', 25.00, 'Contra entrega'),
(8, 11, '2025-11-28 03:12:40', 'PENDIENTE', 'jr lopez', 'Morales', '22001', 45.00, 'Contra entrega'),
(9, 11, '2025-11-28 03:45:10', 'PENDIENTE', 'jr mamaco', 'Morales', '22001', 50.00, 'Contra entrega'),
(10, 14, '2025-11-28 03:55:16', 'PENDIENTE', 'avenida peru', 'Morales', '22001', 45.00, 'Contra entrega'),
(11, 11, '2025-11-28 04:54:03', 'PENDIENTE', 'jr melon', 'Morales', '22001', 30.00, 'Contra entrega'),
(12, 14, '2025-12-02 04:11:40', 'PENDIENTE', 'jr los peloteros 999', 'Morales', '22001', 30.00, 'Contra entrega'),
(13, 14, '2025-12-02 04:23:44', 'PENDIENTE', 'jr los jasminez 236', 'Banda de Shilcayo', '22003', 70.00, 'Contra entrega'),
(14, 13, '2025-12-02 04:50:42', 'PENDIENTE', 'jr juan vargas 1234', 'Morales', '22001', 52.00, 'Contra entrega'),
(15, 13, '2025-12-02 05:06:06', 'PENDIENTE', 'jr los marios 9999', 'Morales', '22001', 45.00, 'Contra entrega'),
(16, 14, '2025-12-02 05:10:04', 'PENDIENTE', 'jr mmmmm', 'Banda de Shilcayo', '22003', 25.00, 'Contra entrega'),
(17, 14, '2025-12-02 05:21:05', 'PENDIENTE', 'jr pablito grandez', 'Banda de Shilcayo', '22003', 25.00, 'Contra entrega'),
(18, 16, '2026-01-31 19:45:06', 'PENDIENTE', 'jr peru 111', 'Morales', '22001', 25.00, 'Contra entrega');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(38,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `imagen_url` varchar(255) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `destacado` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre`, `descripcion`, `precio`, `stock`, `imagen_url`, `id_categoria`, `destacado`, `fecha_creacion`, `activo`) VALUES
(4, '67 Camaro (HW Art Cars)', '67 Camaro - descripción', 20.00, 10, '/img/Catalogo1.png', NULL, 0, '2025-11-27 03:35:25', 1),
(5, 'Electrack (X-Raycers)', 'Electrack - descripción', 15.00, 10, '/img/Catalogo2.png', NULL, 0, '2025-11-27 03:35:25', 1),
(6, '15 Dodge Challenger SRT Hellcat', 'Dodge - descripción', 15.00, 10, '/img/Catalogo3.png', NULL, 0, '2025-11-27 03:35:25', 1),
(7, 'Impavido 1', 'Impavido - descripción', 15.00, 10, '/img/Catalogo4.png', NULL, 0, '2025-11-27 03:35:25', 1),
(8, 'Driftsta', 'Driftsta - descripción', 20.00, 10, '/img/Catalogo5.png', NULL, 0, '2025-11-27 03:35:25', 1),
(9, 'Rip Rod', 'Rip Rod - descripción', 22.00, 10, '/img/Catalogo6.png', NULL, 0, '2025-11-27 03:35:25', 1),
(10, 'Ford GT-40', 'Ford GT-40 - descripción', 35.00, 10, '/img/Catalogo7.png', NULL, 0, '2025-11-27 03:35:25', 1),
(11, 'Carbonator', 'Carbonator - descripción', 20.00, 10, '/img/Catalogo8.png', NULL, 0, '2025-11-27 03:35:25', 1),
(12, 'Let\'s GO', 'Let\'s GO - descripción', 15.00, 10, '/img/Catalogo9.png', NULL, 0, '2025-11-27 03:35:25', 1),
(13, 'Lamborghini Aventador J', 'Aventador - descripción', 40.00, 10, '/img/Catalogo1.png', NULL, 0, '2025-11-27 03:35:25', 1),
(14, 'Porsche 911 GT3 RS', 'Porsche - descripción', 38.00, 10, '/img/Catalogo2.png', NULL, 0, '2025-11-27 03:35:25', 1),
(15, 'McLaren P1', 'McLaren P1 - descripción', 45.00, 10, '/img/Catalogo3.png', NULL, 0, '2025-11-27 03:35:25', 1),
(16, 'Bugatti Chiron Super Sport', 'Bugatti - descripción', 50.00, 10, '/img/Catalogo4.png', NULL, 0, '2025-11-27 03:35:25', 1),
(17, 'Ferrari LaFerrari', 'LaFerrari - descripción', 42.00, 10, '/img/Catalogo5.png', NULL, 0, '2025-11-27 03:35:25', 1),
(18, 'Nissan GT-R R35 Nismo', 'Nissan - descripción', 30.00, 10, '/img/Catalogo6.png', NULL, 0, '2025-11-27 03:35:25', 1),
(19, 'Corvette C8 Stingray', 'Corvette - descripción', 28.00, 10, '/img/Catalogo7.png', NULL, 0, '2025-11-27 03:35:25', 1),
(20, 'Audi R8 V10 Plus', 'Audi R8 - descripción', 32.00, 10, '/img/Catalogo8.png', NULL, 0, '2025-11-27 03:35:25', 1),
(21, 'BMW M4 Competition', 'BMW M4 - descripción', 25.00, 10, '/img/Catalogo9.png', NULL, 0, '2025-11-27 03:35:25', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(8) NOT NULL DEFAULT '00000000',
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `rol` enum('cliente','administrador') DEFAULT 'cliente',
  `activo` tinyint(1) DEFAULT 1,
  `contrasena` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `dni`, `email`, `telefono`, `direccion`, `fecha_registro`, `rol`, `activo`, `contrasena`) VALUES
(3, 'Admin', 'Principal', '00000000', 'admin@sacars.com', '+000000000', 'Oficina', '2025-11-16 01:04:06', 'administrador', 1, '$2y$10$gO3a7p9FQfTL7x1IuYkF9uW3OD8i4OKe2ZjzQGQOkScpZq3Q0KM5O'),
(4, 'Cliente', 'Prueba', '00000000', 'cliente@sacars.com', '+111111111', 'Calle Falsa 123', '2025-11-16 01:04:06', 'cliente', 1, '$2y$10$7ZCY8WwJP0zZ7M8mFQG5zOikOfqI3CjsIq3Qc8hozRTQ9Lrbf5EfW'),
(5, 'Pepe', 'Perez', '', 'pepe@gmail.com', '918341878', '', '2025-11-16 01:47:26', 'cliente', 1, '$2a$10$9xRWOZ5tG/MSDlrBBAHlBe9R//GJZ/FI588Zk1rH/5c0H347Vvnpq'),
(10, 'Jose Santiago', 'Ponce ', '00000000', 'ponceri@gmail.com', '918341898', '', '2025-11-19 11:50:47', 'cliente', 1, '$2a$10$uNlLdvdmouwo5ECCxUfBEOIEwgxGmH0H67Rblssdlo.eupFGfSQVu'),
(11, 'Josesito san', 'Ponce Riveros', '72129870', 'ponceriverosjosesantiagoo@gmail.com', '918341899', 'Jr Lima 123', '2025-11-26 16:59:15', 'cliente', 1, '$2a$10$/N/aauX1RsrAWnuqhnb9GOU2zeGy/UFPLE37xkvoeOTn7NUA9De1q'),
(12, 'Katty', 'de Ponce', '61953526', 'katty@gmail.com', '+34937355858', '', '2025-11-26 22:31:18', 'cliente', 1, '$2a$10$H.JsTtf6rGrNDDtvexrWJOE2yBpc5srqt.N5xeUWQyq8XuzHfIoXC'),
(13, 'Pita', 'Pen', '71273737', 'pita@gmail.com', '91838848', '', '2025-11-26 22:34:22', 'cliente', 1, '$2a$10$dEpgoHFlGDd0gQn5kNe0euHZe.i0LSJaxflZVEd.03okjMVTA/mhe'),
(14, 'Josesitox', 'pinedo', '72129871', 'saap@gmail.com', '987456732', 'jr lola', '2025-11-26 23:58:51', 'cliente', 1, '$2a$10$.t9vw8Md2x0aqDmFoFZtzOtUT2/wijlEfl.wyELWT.9a0uLFMO5XK'),
(15, 'ramiro', 'lopez', '71678963', 'juanito@gmail.com', '999999991', '', '2025-12-02 16:53:53', 'cliente', 1, '$2a$10$IbcJnmH6dvf55IIGP7WjpuXAskdXrTQb7VVSJylTmzR27dQAw.AXK'),
(16, 'Jordy Adriel', 'Ponce', '23434432', 'jordy@gmail.com', '999666111', '', '2026-01-31 12:49:36', 'cliente', 1, '$2a$10$SADifeGqoaNugAx8WHo9L.Jz/HL/BGfHXG1GPkEHQ4iiNArv.QDOS');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id_item`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`id_contacto`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD UNIQUE KEY `numero_factura` (`numero_factura`),
  ADD KEY `fk_factura_pedido` (`id_pedido`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id_contacto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id_factura` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `fk_factura_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
