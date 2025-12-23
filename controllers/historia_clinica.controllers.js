const { poolPg } = require('../database/dbconfig');
const { responseCreator } = require('../utils/utils');

/* Obtener historias clínicas de un paciente */
const getHistoriasClinicas = async (req, res) => {
    try {
        const { id_paciente } = req.params;

        const historias = await poolPg.query(
            'SELECT * FROM dbo.get_historias_clinicas($1)',
            [id_paciente]
        );

        return res.status(200).send(historias.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer historias clínicas' });
    }
};

/* Obtener una historia clínica */
const getHistoriaClinica = async (req, res) => {
    try {
        const  id = req.params;

        const historia = await poolPg.query(
            'SELECT * FROM dbo.get_historia_clinica($1)',
            [id]
        );

        if (historia.rows.length === 0) {
            return res.status(404).send({ msg: 'Historia clínica no encontrada' });
        }

        return res.status(200).send(historia.rows[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'Error al traer la historia clínica' });
    }
};

/* Crear historia clínica */
const postHistoriaClinica = async (req, res) => {
    try {
        const {
            id_paciente,
            diagnostico,
            cant_sesiones,
            fecha_ini,
            fecha_fin,
            tratamiento,
            observaciones
        } = req.body;

        const query = `
            SELECT * FROM dbo.historia_clinica_post(
                $1,$2,$3,$4,$5,$6,$7
            )
        `;

        const values = [
            id_paciente,
            diagnostico,
            cant_sesiones,
            fecha_ini,
            fecha_fin,
            tratamiento,
            observaciones
        ];

        const respuesta = await poolPg.query(query, values);

        return res.status(200).send(respuesta.rows[0]);
    } catch (err) {
        console.log(`Error en postHistoriaClinica: ${err}`);
        return res.status(500).send({ msg: 'Error al crear historia clínica' });
    }
};

/* Actualizar historia clínica */
const putHistoriaClinica = async (req, res) => {
    try {
        const {
            id,
            id_paciente,
            diagnostico,
            cant_sesiones,
            fecha_ini,
            fecha_fin,
            tratamiento,
            observaciones
        } = req.body;

        const query = `
            SELECT * FROM dbo.historia_clinica_put(
                $1,$2,$3,$4,$5,$6,$7,$8
            )
        `;

        const values = [
            id,
            id_paciente,
            diagnostico,
            cant_sesiones,
            fecha_ini,
            fecha_fin,
            tratamiento,
            observaciones
        ];

        const respuesta = await poolPg.query(query, values);

        if (respuesta.rows.length === 0) {
            return res.status(404).send({ msg: 'Historia clínica no encontrada o dada de baja' });
        }

        return res.status(200).send(respuesta.rows[0]);
    } catch (err) {
        console.log(`Error en putHistoriaClinica: ${err}`);
        return res.status(500).send({ msg: 'Error al actualizar historia clínica' });
    }
};

/* Eliminar historia clínica (baja lógica) */
const delHistoriaClinica = async (req, res) => {
    try {
        const id = req.params;

        const query = `SELECT dbo.historia_clinica_delete($1) AS result`;
        const values = [id];

        const respuesta = await poolPg.query(query, values);

        if (!respuesta.rows[0].result) {
            return res.status(404).send({ msg: 'Historia clínica no encontrada o ya eliminada' });
        }

        return res.status(200).send({ deleted: true });
    } catch (err) {
        console.log(`Error en delHistoriaClinica: ${err}`);
        return res.status(500).send({ msg: 'Error al eliminar historia clínica' });
    }
};

module.exports = {
    getHistoriasClinicas,
    getHistoriaClinica,
    postHistoriaClinica,
    putHistoriaClinica,
    delHistoriaClinica
};
