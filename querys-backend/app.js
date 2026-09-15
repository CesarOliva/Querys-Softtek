const express = require('express');
const pool = require("./db");
const app = express();
const port = process.env.PORT || 3000;

const STATES = (function(){
    const Enum = {
        SELECT: 1,
        SELECT_WARNING: 2,
        UPDATE_STOCK: 3,
        DELETE_PRODUCT: 4,
        UPDATE_PRODUCT: 5
    }
})

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Endpoint health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const ejecutarCrud = async (option, data = {}) => {
    const [resultSets] = await pool.query('CALL CrudProductos(?, ?)', [option, JSON.stringify(data)]);
    return Array.isArray(resultSets) ? (resultSets[0] ?? []) : [];
};

// Operaciones: 1 listar, 2 advertencias, 3 stock, 4 eliminar, 5 editar.
app.post('/products/crud', async (req, res) => {
    const option = Number(req.body?.optionMenu);
    const data = req.body?.data ?? {};

    if (!Number.isInteger(option) || option < 1 || option > 5 || typeof data !== 'object' || data === null) {
        return res.status(400).json({ error: 'La opción y los datos CRUD no son válidos' });
    }

    try {
        res.json(await ejecutarCrud(option, data));
    } catch (error) {
        console.error('Error en CRUD:', error.message);
        res.status(500).json({ error: error.sqlMessage || 'No se pudo realizar la operación CRUD' });
    }
});

// Obtener todos los productos desde la tabla producto.
app.get('/products', async (req, res) => {
    try {
        res.json(await ejecutarCrud(SELECT));
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
        res.status(500).json({ error: 'No se pudieron obtener los productos' });
    }
});

// Obtener productos con stock <= 10.
app.get('/products/productsWarning', async (req, res) => {
    try {
        res.json(await ejecutarCrud(SELECT_WARNING));
    } catch (error) {
        console.error('Error al obtener productos con poco stock:', error.message);
        res.status(500).json({ error: 'No se pudieron obtener los productos con poco stock' });
    }
});

// Updating stock
app.patch("/products/updateStock/:id", async (req, res) => {
    const productId = Number.parseInt(req.params.id, 10);
    const stockUpdate = req.body.stock;

    if (!Number.isInteger(productId) || !Number.isInteger(stockUpdate) || stockUpdate <= 0) {
        return res.status(400).json({
            error: "El stock requerido debe ser un entero mayor que cero"
        });
    }

    try {
        const products = await ejecutarCrud(UPDATE_STOCK, { productId, stockUpdate });

        if (products.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error('Error al actualizar stock:', error.message);
        res.status(500).json({ error: 'No se pudo actualizar el stock' });
    }
});

// Deleting product
app.delete("/products/delete/:id", async (req, res) => {
    const productId = Number.parseInt(req.params.id, 10);

    try {
        const result = await ejecutarCrud(DELETE_PRODUCT, { productId });
        if (!result[0]?.affectedRows) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        res.status(500).json({ error: 'No se pudo eliminar el producto' });
    }
});

// Updating product
app.put("/products/update/:id", async (req, res) => {
    const productId = Number.parseInt(req.params.id, 10);
    const { nombre, precio, stock } = req.body;

    if (!Number.isInteger(productId) || !nombre?.trim() || typeof precio !== 'number' || precio < 0 || !Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({ error: 'Nombre, precio y stock válidos son obligatorios' });
    }

    try {
        const products = await ejecutarCrud(UPDATE_PRODUCT, { productId, nombre: nombre.trim(), precio, stock });
        if (products.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(products[0]);
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        res.status(500).json({ error: 'No se pudo actualizar el producto' });
    }
});

app.listen(port, ()=> {
    console.log(`Servidor corriendo en el puerto: ${port}`);
})