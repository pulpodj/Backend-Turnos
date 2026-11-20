const { poolPg } = require('../database/dbconfig');
const { responseCreator } = require('../utils/utils');

/* Obtener lista de orígenes de movimiento */
const getMovimientoOrigenes = async (req, res) => {
    try {
        let orígenes = await poolPg.query('SELECT dbo.getMovimientoOrigenes() AS result');
        return res.status(200).send(orígenes.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer los Orígenes de Movimiento' });
    }
};

/* Obtener orígen de movimiento */
const getMovimientoOrigen = async (req, res) => {
    try {
        let orígen = await poolPg.query('SELECT dbo.getMovimientoOrigen($1) AS result', [req.params.id]);
        return res.status(200).send(orígen.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer el Orígen de Movimiento' });
    }
};

/* Crear Orígen Movimiento */
const postMovimientoOrigen = async (req, res) => {
    try {
        const { origen, descripcion } = req.body;

        const query = `SELECT dbo.postMovimientoOrigen($1, $2) AS result`;
        const values = [origen, descripcion];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en postMovimientoOrigen: ${err}`);
        return res.status(500).send({ msg: `Error en postMovimientoOrigen: ${err}` });
    }
};

/* Actualizar Orígen Movimiento */
const putMovimientoOrigen = async (req, res) => {
    try {
        const { id, origen, descripcion } = req.body;

        const query = `SELECT dbo.putMovimientoOrigen($1, $2, $3) AS result`;
        const values = [id, origen, descripcion];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en putMovimientoOrigen: ${err}`);
        return res.status(500).send({ msg: `Error en putMovimientoOrigen: ${err}` });
    }
};

/* Baja lógica Orígen Movimiento */
const delMovimientoOrigen = async (req, res) => {
    try {
        const id = req.params.id;

        const query = `SELECT dbo.deleteMovimientoOrigen($1) AS result`;
        const values = [id];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en deleteMovimientoOrigen: ${err}`);
        return res.status(500).send({ msg: `Error en deleteMovimientoOrigen: ${err}` });
    }
};

module.exports = {
    getMovimientoOrigenes,
    getMovimientoOrigen,
    postMovimientoOrigen,
    putMovimientoOrigen,
    delMovimientoOrigen
};
