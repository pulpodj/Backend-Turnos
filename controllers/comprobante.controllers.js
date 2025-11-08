const {pool,poolPgL} = require('../database/dbconfig');
const sql = require('mssql');
const axios = require('axios');
const funcionesLehmann = require('../ETL/funcionesLehmann')
const urlPhysis = 'https://cuentas.cooperativalehmann.coop/phy2service/api';

const formatoArgentino = new Intl.NumberFormat('es-AR', {
    style: 'decimal',
    currency: 'ARS',
    maximumFractionDigits: 0, // Máximo de decimales
});

// Generar y obtener URL de comprobante en PDF
const postPDF = async (req, res) => {
    try {
        let idEjercicio = req.body.idEjercicio;
        let idComprobante = req.body.idComprobante;
        let url = await funcionesLehmann.URLComprobante(idEjercicio, idComprobante);
        //console.log(url);    
        return res.status(200).send({url: url});
    }catch(error){
        console.log(error); 
        return res.status(500).send(error);
    }
};

//
const getListaMontosPendientes = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let request = pool.request();
        let respuesta = await request
            .query(`exec DW_Lehmann.dbo.getListaMontosPendientes '${idSocio}'`);
        return res.status(200).send(respuesta.recordsets[0]);
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}

// Swagger Documentation
const getListaProdPendRetirarAgro = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let request = pool.request();
        let respuesta = await request
            .query(`SELECT Fecha_Comprobante = P.Fecha
                            ,Cliente = Trim(C.Nombre)
                            ,Comprobante = Trim(P.CN)
                            ,Producto = Trim(P.Producto)
                            ,Unidad_Medida = Trim(P.UMStock)
                            ,P.CantidadPedida
                            ,CantidadRetirada = P.CantidadPedida - P.CantidadPendiente
                            ,P.CantidadPendiente
                    FROM DW_Lehmann.dbo.BI_FacturasSinRemitarAgro as P
					Join Phy_WinSiges_00576_01_00001_0100.dbo.CuentasAuxi as C
					on P.CtaReagTercero = C.IdCtaAuxi and C.IdAuxi = 1
                    Where not P.producto like '%flete%' 
                        and P.Plazo >= convert(date,getDate())
                        and CtaReagTercero =  '${idSocio}'`);
        if(respuesta.recordsets[0].length === 0){
            return res.status(400).send({error: 'No se pudieron obtener los productos pendientes de retiro'});
        }               
        return res.status(200).send(respuesta.recordsets[0]);
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}


// Swagger Documentation
const getListaProdPendRetirarNA = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let request = pool.request();
        let respuesta = await request
            .query(`SELECT Fecha_Comprobante = P.Fecha
                            ,Cliente = Trim(C.Nombre)
                            ,Comprobante = Trim(P.CN)
                            ,Producto = Trim(P.Producto)
                            ,Unidad_Medida = Trim(P.UMStock)
                            ,P.CantidadPedida
                            ,CantidadRetirada = P.CantidadPedida - P.CantidadPendiente
                            ,P.CantidadPendiente
                    FROM DW_Lehmann.dbo.BI_FacturasSinRemitarNA as P
					Join Phy_WinSiges_00576_01_00001_0100.dbo.CuentasAuxi as C
					on P.CtaReagTercero = C.IdCtaAuxi and C.IdAuxi = 1
                    Where not P.producto like '%flete%' 
                        and P.Plazo >= convert(date,getDate())
                        and CtaReagTercero =  '${idSocio}'`);
        if(respuesta.recordsets[0].length === 0){
            return res.status(400).send({error: 'No se pudieron obtener los productos pendientes de retiro'});
        }
        return res.status(200).send(respuesta.recordsets[0]);
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}

// Swagger Documentation
const getUltimosCompHacienda = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let cant = 10;
        let request = pool.request();
        let respuesta = await request
            .query(`exec DW_Lehmann.dbo.getUltimosCompHacienda '${idSocio}',${cant}`);

       if(respuesta.recordset.length === 0){
            return res.status(400).send({error: 'El socio Seleccionado no posee comprobantes de Hacienda'});
        }     

        // Agrupar por comprobante (tipo + número)
        const mapa = new Map();
        for (const r of respuesta.recordset) {
            const key = `${r.Tipo_comprobante}|${r.Nro_comprobante}`;
            if (!mapa.has(key)) {
            mapa.set(key, {
                Tipo_comprobante: r.Tipo_comprobante,
                Nro_comprobante: r.Nro_comprobante,
                Fecha_operacion: r.Fecha_operacion,     // ISO/Date de SQL Server
                Tipo_Operacion: r.Tipo_Operacion,
                Tipo_Hacienda: r.Tipo_Hacienda,
                Lugar: r.Lugar,
                ImporteBrutoLotes: Number(r.ImporteBrutoLotes), // a número JS
                Lotes: []
            });
            }
            mapa.get(key).Lotes.push({
            Especie: r.Especie,
            Categoria: r.Categoria,
            cabezas: r.cabezas,
            kilos_total: r.kilos_total,
            precio_kg: Number(r.precio_kg)
            });
        }

        return res.status(200).send(Array.from(mapa.values()));
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}


// Swagger Documentation
const getUltimosCompAgro = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let cant = 10;
        let request = pool.request();
        let respuesta = await request
            .query(`exec DW_Lehmann.dbo.getUltimosCompAgro '${idSocio}',${cant}`);

        if(respuesta.recordset.length === 0){
            return res.status(400).send({error: 'El socio Seleccionado no posee comprobantes de Agroinsumos'});
        }    

        // Agrupar por comprobante (tipo + número)
        const mapa = new Map();
        for (const r of respuesta.recordset) {
            const key = `${r.tipo_comprobante}|${r.nro_comprobante}`;
            if (!mapa.has(key)) {
            mapa.set(key, {
                tipo_comprobante: r.tipo_comprobante,
                nro_comprobante: r.nro_comprobante,
                fecha_operacion: r.fecha_operacion,     // ISO/Date de SQL Server
                id_socio: r.id_socio,
                moneda: r.moneda,
                cotiza_dolar: r.cotiza_dolar,
                importe_total: Number(r.importe_total), // a número JS
                destalle: []
            });
            }
            mapa.get(key).destalle.push({
            id_producto: r.id_producto,
            producto: r.descripcion,
            cantidad: Number(r.cantidad)
            });
        }

        return res.status(200).send(Array.from(mapa.values()));
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}


// Swagger Documentation
const getUltimosCompNA = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let cant = 10;
        let request = pool.request();
        let respuesta = await request
            .query(`exec DW_Lehmann.dbo.getUltimosCompNA '${idSocio}',${cant}`);

        if(respuesta.recordset.length === 0){
            return res.status(400).send({error: 'El socio Seleccionado no posee comprobantes de Nutricion Animal'});
        }

        // Agrupar por comprobante (tipo + número)
        const mapa = new Map();
        for (const r of respuesta.recordset) {
            const key = `${r.tipo_comprobante}|${r.nro_comprobante}`;
            if (!mapa.has(key)) {
            mapa.set(key, {
                tipo_comprobante: r.tipo_comprobante,
                nro_comprobante: r.nro_comprobante,
                fecha_operacion: r.fecha_operacion,     // ISO/Date de SQL Server
                id_socio: r.id_socio,
                moneda: r.moneda,
                cotiza_dolar: r.cotiza_dolar,
                importe_total: Number(r.importe_total), // a número JS
                destalle: []
            });
            }
            mapa.get(key).destalle.push({
            id_producto: r.id_producto,
            producto: r.descripcion,
            cantidad: Number(r.cantidad)
            });
        }

        return res.status(200).send(Array.from(mapa.values()));
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}


// Swagger Documentation
const getUltimosCompAcopio = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let cant = 10;
        let request = pool.request();
        let respuesta = await request
            .query(`exec DW_Lehmann.dbo.getUltimosCompAcopio '${idSocio}',${cant}`);

        if(respuesta.recordset.length === 0){
            return res.status(400).send({error: 'El socio Seleccionado no posee comprobantes de Acopio'});
        }
        return res.status(200).send(respuesta.recordset);
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}

// Swagger Documentation
const getUltimosCompSeguros = async(req,res) => {
    try {
        let idSocio = String(req.params.id).padStart(5, '0');
        let cant = 10;
        let request = poolPgL;
        let respuesta = await request
           .query(`SELECT s.inicio_vigencia
                        ,s.tomador
                        ,s.cultivo
                        ,s.cosecha
                        ,s.cobertura
                        ,s.cantidad_has
                        ,s.suma_asegurada
                        ,s.forma_pago
                        ,s.localidad
                        ,RIGHT(LEFT(s.campania, 4), 2) || RIGHT(s.campania, 2) as campania

                    FROM dbo.fact_seguros as s
                    WHERE s.id_socio = ${idSocio} 
                    ORDER BY s.inicio_vigencia desc
                    Limit ${cant};`);

        if(respuesta.rows.length === 0){
            return res.status(400).send({error: 'El socio Seleccionado no posee comprobantes de Seguros'});
        }

        return res.status(200).send(respuesta.rows);
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
}

module.exports = {
    postPDF,
    getListaMontosPendientes,
    getListaProdPendRetirarAgro,
    getListaProdPendRetirarNA,
    getUltimosCompHacienda,
    getUltimosCompAgro,
    getUltimosCompNA,
    getUltimosCompAcopio,
    getUltimosCompSeguros
}