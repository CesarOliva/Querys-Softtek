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
    CONSTRAINT fk_pedido
    FOREIGN KEY (id_pedido)
    REFERENCES pedidos (id_pedido)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    id_producto INT UNSIGNED NOT NULL,
    CONSTRAINT fk_producto
    FOREIGN KEY (id_producto)
    REFERENCES productos_clientes (id_producto)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    cantidad INT UNSIGNED,
    CONSTRAINT check_cantidad CHECK (cantidad>=0)
);