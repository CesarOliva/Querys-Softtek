use tiendita;

CREATE TABLE clientes (
	id_cliente INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR (13),
    email VARCHAR (50),
    estatus BOOLEAN NOT NULL,
    categoria INT UNSIGNED NOT NULL,
    fecha_registro DATETIME NOT NULL
);

CREATE TABLE pedidos (
    id_pedido INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    direccion VARCHAR (100),
    fecha DATETIME NOT NULL,
    id_cliente INT UNSIGNED NOT NULL,
    CONSTRAINT fk_cliente
    FOREIGN KEY (id_cliente)
    REFERENCES clientes (id_cliente)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE productos_clientes(
    id_producto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    precio DECIMAL (8,2) NOT NULL,
    CONSTRAINT check_precio CHECK (precio>=0)
);


CREATE TABLE productos_pedidos(
    id_pedido INT UNSIGNED NOT NULL,

    id_producto INT UNSIGNED NOT NULL,

    cantidad INT UNSIGNED NOT NULL,

    PRIMARY KEY (id_pedido, id_producto),

    CONSTRAINT fk_pedido
    FOREIGN KEY (id_pedido)
    REFERENCES pedidos (id_pedido)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    CONSTRAINT fk_producto
    FOREIGN KEY (id_producto)
    REFERENCES productos_clientes (id_producto)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    CONSTRAINT check_cantidad
    CHECK (cantidad > 0)
);



--Views

CREATE VIEW VW_Pedidos_Info AS
SELECT productos_pedidos.id_pedido, clientes.nombre, productos_clientes.nombre AS libro, productos_pedidos.cantidad, productos_clientes.precio AS precio_unitario,
clientes.id_cliente
FROM productos_pedidos
INNER JOIN pedidos ON productos_pedidos.id_pedido = pedidos.id_pedido
INNER JOIN clientes ON pedidos.id_cliente = clientes.id_cliente
INNER JOIN productos_clientes ON productos_clientes.id_producto = productos_pedidos.id_producto;

SELECT * FROM VW_Pedidos_Info;



CREATE VIEW VW_Clientes_Info AS
SELECT id_cliente AS id, nombre, email, calcular_total_gastado(id_cliente) AS total_gastado, calcular_total_pedidos(id_cliente) AS total_pedidos
FROM clientes;

SELECT * from vw_clientes_info;


-- SP 

DELIMITER %%
/* Add or remove procedure IN/OUT/INOUT parameters as needed. */
CREATE PROCEDURE ActualizarCategoria(,IN pedidos INT 
UNSIGNED,IN gasto DECIMAL(10,2), IN id INT UNSIGNED)
SQL SECURITY DEFINER
NOT DETERMINISTIC
BEGIN
	UPDATE clientes
    SET categoria = CASE
		WHEN pedidos <= 10 AND gasto <= 5000.00 THEN 2
        WHEN pedidos > 10 AND gasto >= 20000.00 THEN 3
        ELSE 1
	END
    WHERE id_cliente = id;
END%%
DELIMITER ;

-- Funciones

-- Regresa el total gastado de un cliente
DELIMITER %%
CREATE DEFINER=`root`@`localhost` FUNCTION `tiendita`.`calcular_total_gastado`(id INTEGER UNSIGNED) RETURNS decimal(10,2)
    READS SQL DATA
BEGIN
    DECLARE total_cliente DECIMAL (10,2);
    
    SELECT SUM(precio_unitario) INTO total_cliente 
    FROM VW_Pedidos_Info 
    WHERE id_cliente = id;
    
    RETURN total_cliente;
END%%
DELIMITER ;


-- Regresa el total de pedidos por cliente

DELIMITER %%
CREATE DEFINER=`root`@`localhost` FUNCTION `tiendita`.`calcular_total_pedidos`(id INTEGER UNSIGNED) RETURNS INTEGER UNSIGNED
    READS SQL DATA
BEGIN
    DECLARE total_pedidos INTEGER UNSIGNED;
    
    SELECT COUNT(DISTINCT id_pedido)
    INTO total_pedidos
    FROM VW_Pedidos_Info 
    WHERE id_cliente = id;
    
    RETURN total_pedidos;
END%%
DELIMITER ;

DELIMITER //


--id_cliente, fecha, dirección, json


CREATE FUNCTION CrearPedidos(
    p_direccion VARCHAR(100),
    p_fecha DATETIME,
    p_id_cliente INT UNSIGNED
)
RETURNS INT UNSIGNED
MODIFIES SQL DATA
BEGIN

    DECLARE nuevo_id INT UNSIGNED;

    INSERT INTO pedidos (
        direccion,
        fecha,
        id_cliente
    )
    VALUES (
        p_direccion,
        p_fecha,
        p_id_cliente
    );

    SET nuevo_id = LAST_INSERT_ID();

    RETURN nuevo_id;

END;

CREATE PROCEDURE InsertarDatos(IN id_cliente INT UNSIGNED, IN fecha DATETIME, IN direccion VARCHAR(100), IN datos_pedido JSON)
BEGIN
    
    DECLARE id_pedido_generado INT UNSIGNED;

    SET id_pedido_generado =  CrearPedidos(direccion, fecha, id_cliente); -- funcion que haga insert en la tabla pedidos y regrese el id del pedido que se genero, la funcion debe recibir direccion, fecha y id del cliente

    Call CrearProductosDelPedido(IN id INT UNSIGNED, IN datos_pedido JSON);
    Call AsignarCategoria(id_cliente, fecha);

END




CREATE PROCEDURE AsignarCategoria(IN id_cliente INT UNSIGNED, IN fecha DATETIME)

BEGIN
	DECLARE pedidos_ultimos_90_dias INT UNSIGNED;
    DECLARE gasto INT UNSIGNED;
    DECLARE pedidos_al_mes BOOLEAN;
    
    DECLARE mes_actual INT;
    DECLARE anio_actual INT;
    
    DECLARE mes_anterior INT;
    DECLARE anio_anterior INT;
    
    DECLARE mes_hace_dos INT;
    DECLARE anio_hace_dos INT;
    
    DECLARE p_actual INT UNSIGNED;
    DECLARE p_anterior INT UNSIGNED;
    DECLARE p_hace_dos INT UNSIGNED;
    
    SET pedidos_ultimos_90_dias = calcular_total_pedidos(id_cliente);
    SET gasto = calcular_total_gastado(id_cliente);

    CALL ActualizarCategoria(pedidos_ultimos_90_dias, gasto, id_cliente); 
END //

DELIMITER ;

DELIMITER //

CREATE FUNCTION consultar_pedidos_en_mes (_id_cliente INT UNSIGNED, mes INT, anio INT)
RETURNS INT UNSIGNED
DETERMINISTIC
BEGIN
	DECLARE cantidad_pedidos INT UNSIGNED;
    
    SELECT COUNT(*) INTO cantidad_pedidos
    FROM pedidos
    WHERE id_cliente = _id_cliente AND MONTH(fecha) = mes AND YEAR(fecha) = anio;
    
    RETURN cantidad_pedidos;
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE CrearProductosDelPedido(
	IN _id_pedido INT,
    IN productos_data JSON
)
BEGIN
	INSERT INTO productos_pedidos (id_pedido, id_producto, cantidad)
    SELECT _id_pedido, jt.id_producto, jt.cantidad
    FROM JSON_TABLE(
		productos_data,
        '$[*]'
        COLUMNS (
			id_producto INT UNSIGNED PATH '$.producto',
            cantidad INT UNSIGNED PATH '$.cantidad'
        )
    ) AS jt;
END //

DELIMITER ;