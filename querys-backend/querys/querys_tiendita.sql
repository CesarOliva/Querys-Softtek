CREATE TABLE producto (
	id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    status BOOLEAN NOT NULL,
    precio DECIMAL(7,2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0)
);

INSERT INTO producto
    (id_producto, nombre, descripcion, categoria, status, precio, stock)
VALUES
    ('Teclado mecánico', 'Teclado mecánico RGB con conexión USB', 'Periféricos', TRUE, 899.99, 15),
    ('Mouse inalámbrico', 'Mouse ergonómico con receptor USB', 'Periféricos', TRUE, 349.90, 30),
    ('Audífonos gamer', 'Audífonos con micrófono y sonido envolvente', 'Audio', TRUE, 749.50, 12),
    ('Memoria USB 64 GB', 'Unidad USB 3.0 con capacidad de 64 GB', 'Almacenamiento', TRUE, 189.99, 50),
    ('Base para laptop', 'Base ajustable de aluminio para computadora portátil', 'Accesorios', TRUE, 599.00, 20),
    ('Webcam Full HD', 'Cámara web con resolución 1080p y micrófono integrado', 'Video', TRUE, 949.99, 8),
    ('Cable HDMI', 'Cable HDMI de alta velocidad con longitud de 2 metros', 'Accesorios', TRUE, 159.50, 40),
    ('Bocina Bluetooth', 'Bocina portátil inalámbrica con batería recargable', 'Audio', FALSE, 699.00, 0),
    ('Mousepad XL', 'Alfombrilla extendida con superficie antideslizante', 'Periféricos', TRUE, 299.99, 25),
    ('Adaptador USB-C', 'Adaptador USB-C a USB 3.0 compatible con laptops y teléfonos', 'Accesorios', TRUE, 249.90, 35);


-- Stored Procedure que reabastece producto
DELIMITER //
 
CREATE PROCEDURE ReabastecerProducto(
	IN stock_nuevo INT,
    IN producto_id INT
)
BEGIN
    UPDATE producto
    SET 
        stock = stock + stock_nuevo,
        status = IF(status = false, TRUE, status)
    WHERE id_producto = producto_id;
END
 
DELIMITER ;


-- Trigger para cambiar el estado de status a 0, el front no lo permite pero te rechaza la consulta
-- si intentas insertar un valor negativo de stock
DELIMITER //

CREATE TRIGGER validar_stock
BEFORE UPDATE ON producto
FOR EACH ROW
BEGIN
    IF NEW.stock < 0 THEN 
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El stock no puede ser negativo';
    ELSEIF NEW.stock = 0 THEN
        SET NEW.status = false;
    END IF;
END//
 
DELIMITER ;

CREATE VIEW vw_productos AS
    SELECT id_producto AS id, nombre, descripcion, categoria, status, precio, stock
    FROM producto;

CREATE VIEW vw_productos_bajo_stock AS
    SELECT id_producto AS id, nombre, descripcion, categoria, status, precio, stock
    FROM producto
    WHERE
        (stock <= 10 AND precio > 100)
        OR
        (stock <= 3 AND precio <= 100)
    ORDER BY stock, id_producto;


-- Views para mostrar los productos

CREATE VIEW vw_productos AS
    SELECT id_producto AS id, nombre, descripcion, categoria, status, precio, stock
    FROM producto;

CREATE VIEW vw_productos_bajo_stock AS
    SELECT id_producto AS id, nombre, descripcion, categoria, status, precio, stock
    FROM producto
    WHERE
        (stock <= 10 AND precio > 100)
        OR
        (stock <= 3 AND precio <= 100)
    ORDER BY stock, id_producto;


-- Stored Procedure para manejar el todas las acciones de la interfaz.
-- Los selects son necesarios, porque Express necesita que le regrese datos
DELIMITER //

CREATE PROCEDURE CrudProductos(
    IN opc INT,
    IN data JSON
)

BEGIN

    DECLARE _id_producto INT;
    DECLARE _nombre VARCHAR(100);
    DECLARE _descripcion VARCHAR(500);
    DECLARE _categoria VARCHAR(50);
    DECLARE _status BOOLEAN;
    DECLARE _precio DECIMAL(7,2);
    DECLARE _stock INT;
    DECLARE _stockNuevo INT;

    SET _id_producto = CAST(JSON_UNQUOTE(JSON_EXTRACT(data, '$.id_producto')) AS UNSIGNED);
    SET _nombre = JSON_UNQUOTE(JSON_EXTRACT(data, '$.nombre'));
    SET _descripcion = JSON_UNQUOTE(JSON_EXTRACT(data, '$.descripcion'));
    SET _categoria = JSON_UNQUOTE(JSON_EXTRACT(data, '$.categoria'));
    SET _status = CAST(JSON_UNQUOTE(JSON_EXTRACT(data, '$.status')) AS UNSIGNED);
    SET _precio = CAST(JSON_UNQUOTE(JSON_EXTRACT(data, '$.precio')) AS DECIMAL(7,2));
    SET _stock = CAST(JSON_UNQUOTE(JSON_EXTRACT(data, '$.stock')) AS UNSIGNED);
    SET _stockNuevo = CAST(JSON_UNQUOTE(JSON_EXTRACT(data, '$.stockUpdate')) AS UNSIGNED);


    CASE opc

        -- Reabastece el stock, con el sp Reabastecer Producto
        WHEN 1 THEN

            CALL ReabastecerProducto(_stockNuevo, _id_producto);

            SELECT id_producto AS id, nombre, descripcion, categoria, status, precio, stock
            FROM producto
            WHERE id_producto = _id_producto;

        -- Delete un producto
        WHEN 2 THEN

            IF EXISTS (SELECT 1 FROM producto WHERE id_producto = _id_producto) 
                THEN

                    DELETE FROM producto
                    WHERE id_producto = _id_producto;
                    
                    SELECT _id_producto AS id_producto,
                    'Producto eliminado correctamente' AS mensaje;
            ELSE
                SELECT
                    NULL AS id_producto,
                    'Producto no encontrado' AS mensaje
                WHERE FALSE;
            END IF;
        
        -- Actualizar un producto
        WHEN 3 THEN

            UPDATE producto
            SET
                nombre = _nombre,
                descripcion = _descripcion,
                categoria = _categoria,
                status = _status,
                precio = _precio,
                stock = _stock
            WHERE id_producto = _id_producto;

            SELECT id_producto AS id, nombre, descripcion, categoria, status, precio, stock
            FROM producto
            WHERE id_producto = _id_producto;

    END CASE;
END //

DELIMITER ;