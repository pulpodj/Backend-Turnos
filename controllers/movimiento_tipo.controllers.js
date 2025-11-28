const { poolPg } = require('../database/dbconfig');
const { responseCreator } = require('../utils/utils');

/* Obtener lista de tipos de movimiento */
const getMovimientoTipos = async (req, res) => {
    try {
        let tipos = await poolPg.query('SELECT dbo.getMovimientoTipos() AS result');
        return res.status(200).send(tipos.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer los Tipos de Movimiento' });
    }
};

/* Obtener tipo de movimiento */
const getMovimientoTipo = async (req, res) => {
    try {
        let tipo = await poolPg.query('SELECT dbo.getMovimientoTipo($1) AS result', [req.params.id]);
        return res.status(200).send(tipo.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer el Tipo de Movimiento' });
    }
};

/* Crear Tipo Movimiento */
const postMovimientoTipo = async (req, res) => {
    try {
        const { tipo, descripcion } = req.body;

        const query = `SELECT dbo.postMovimientoTipo($1, $2) AS result`;
        const values = [tipo, descripcion];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en postMovimientoTipo: ${err}`);
        return res.status(500).send({ msg: `Error en postMovimientoTipo: ${err}` });
    }
};

/* Actualizar Tipo Movimiento */
const putMovimientoTipo = async (req, res) => {
    try {
        const { id, tipo, descripcion } = req.body;

        const query = `SELECT dbo.putMovimientoTipo($1, $2, $3) AS result`;
        const values = [id, tipo, descripcion];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en putMovimientoTipo: ${err}`);
        return res.status(500).send({ msg: `Error en putMovimientoTipo: ${err}` });
    }
};

/* Baja lógica Tipo Movimiento */
const delMovimientoTipo = async (req, res) => {
    try {
        const id = req.params.id;

        const query = `SELECT dbo.deleteMovimientoTipo($1) AS result`;
        const values = [id];

        let respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en deleteMovimientoTipo: ${err}`);
        return res.status(500).send({ msg: `Error en deleteMovimientoTipo: ${err}` });
    }
};

module.exports = {
    getMovimientoTipos,
    getMovimientoTipo,
    postMovimientoTipo,
    putMovimientoTipo,
    delMovimientoTipo
};
