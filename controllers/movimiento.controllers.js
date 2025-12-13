const { poolPg } = require('../database/dbconfig');
const { responseCreator } = require('../utils/utils');

/* Obtener lista de Movimientos */
const getMovimientos = async (req, res) => {
    try {
        let movimientos = await poolPg
            .query('SELECT dbo.getMovimientos() AS result');

        return res.status(200).send(movimientos.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer los Movimientos' });
    }
};

/* Obtener un Movimiento */
const getMovimiento = async (req, res) => {
    try {
        const id = req.params.id;

        let movimiento = await poolPg
            .query('SELECT dbo.getMovimiento($1) AS result', [id]);

        return res.status(200).send(movimiento.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer el Movimiento' });
    }
};

/* Obtener lista de Movimientos */
const getSearchMovimientos = async (req, res) => {
    try {
        
        const {
            fecha_desde,
            fecha_hasta,
            id_cliente = 0,
            id_movimiento_tipo = 0
        } = req.query;

        const query = `
            SELECT * 
            FROM dbo.get_movimientos($1, $2, $3, $4)
        `;

        const movimientos = await poolPg.query(query, [
            fecha_desde,
            fecha_hasta,
            id_cliente,
            id_movimiento_tipo
        ]);

        return res.status(200).send(movimientos.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer los Movimientos' });
    }
};

/* Crear un nuevo Movimiento */
const postMovimiento = async (req, res) => {
    try {
        const {
            id_movimiento_tipo,
            fecha,
            fecha_vencimiento,
            debe,
            haber,
            observaciones,
            id_cliente
        } = req.body;

        const query = `SELECT dbo.postMovimiento(
            $1,$2,$3,$4,$5,$6,$7
        ) AS result`;

        const values = [
            id_movimiento_tipo,
            fecha,
            fecha_vencimiento,
            debe,
            haber,
            observaciones,
            id_cliente
        ];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en postMovimiento: ${err}`);
        return res.status(500).send({ msg: `Error en postMovimiento: ${err}` });
    }
};

/* Actualizar un Movimiento */
const putMovimiento = async (req, res) => {
    try {
        const {
            id,
            id_movimiento_tipo,
            fecha,
            fecha_vencimiento,
            debe,
            haber,
            observaciones
        } = req.body;

        const query = `SELECT dbo.putMovimiento(
            $1,$2,$3,$4,$5,$6,$7
        ) AS result`;

        const values = [
            id,
            id_movimiento_tipo,
            fecha,
            fecha_vencimiento,
            debe,
            haber,
            observaciones
        ];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en putMovimiento: ${err}`);
        return res.status(500).send({ msg: `Error en putMovimiento: ${err}` });
    }
};

/* Eliminar un Movimiento */
const delMovimiento = async (req, res) => {
    try {
        const id = req.params.id;

        const query = `SELECT dbo.deleteMovimiento($1) AS result`;
        const values = [id];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en deleteMovimiento: ${err}`);
        return res.status(500).send({ msg: `Error en deleteMovimiento: ${err}` });
    }
};

module.exports = {
    getMovimientos,
    getMovimiento,
    getSearchMovimientos,
    postMovimiento,
    putMovimiento,
    delMovimiento
};
