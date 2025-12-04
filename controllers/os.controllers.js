const { poolPg } = require('../database/dbconfig');
const { responseCreator } = require('../utils/utils');

/* Obtener lista de tipos de movimiento */
const getOSs = async (req, res) => {
    try { 
        let tipos = await poolPg.query('SELECT * FROM dbo.get_obras_sociales() AS result');
        return res.status(200).send(tipos.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer las Obras Sociales' });
    }
};

/* Obtener tipo de movimiento */
const getOS = async (req, res) => {
    try {
        let tipo = await poolPg.query('SELECT * FROM dbo.get_obra_social($1) AS result', [req.params.id]);
        return res.status(200).send(tipo.rows[0].result);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer la Obra Social' });
    }
};

/* Crear Tipo Movimiento */
const postOS = async (req, res) => {
    try {
    const { nombre, detalle, codigo, sistema, estado, cuit } = req.body;

        const query = "SELECT * FROM dbo.obra_social_post($1,$2,$3,$4,$5,$6)";
        const respuesta = await pool.query(query, [
            nombre,
            detalle,
            codigo,
            sistema,
            estado,
            cuit,
        ]);

        return res.status(200).send(respuesta.rows[0].result);        
    } catch (err) {
        console.log(`Error en postMovimientoTipo: ${err}`);
        return res.status(500).send({ msg: `Error en postMovimientoTipo: ${err}` });
    }
};

/* Actualizar Tipo Movimiento */
const putOS = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, detalle, codigo, sistema, estado, cuit } = req.body;

        const query =
            "SELECT * FROM dbo.obra_social_put($1,$2,$3,$4,$5,$6,$7)";
        const respuesta = await pool.query(query, [
            id,
            nombre,
            detalle,
            codigo,
            sistema,
            estado,
            cuit,
        ]);

        if (respuesta.rows.length === 0)
            return res.status(404).json({ error: "Obra social no encontrada" });

        return res.status(200).send(respuesta.rows[0].result);
    } catch (err) {
        console.log(`Error en putMovimientoTipo: ${err}`);
        return res.status(500).send({ msg: `Error en putMovimientoTipo: ${err}` });
    }
};



module.exports = {
    getOSs,
    getOS,
    postOS,
    putOS
};
