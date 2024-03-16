const express = require("express");
const cors = require("cors");
const { json } = require("body-parser");
const { writeFile } = require("fs");
const colores = require("./datos/colores.json");
let proximoId = colores.length > 0 ? colores[colores.length - 1].id + 1 : 1;

function actualizarFichero(){
    return new Promise((ok,ko) => {
        writeFile("./datos/colores.json",JSON.stringify(colores), error => {
            !error ? ok() : ko({ error : "error en sistema de ficheros" });
        }); 
    });   
}

const servidor = express();

//middleware

servidor.use(cors());

servidor.use(json());//interceptar cualquier petición con formato JSON y pasarla por JSON.parse

//servidor.use(express.static("./site_de_prueba"));

servidor.get("/colores",(peticion,respuesta) => {
    respuesta.json(colores);
});

servidor.post("/colores/nuevo", async (peticion,respuesta) => {
    try{
        let {r,g,b} = peticion.body;

        colores.push({r,g,b,id : proximoId});

        await actualizarFichero();

        respuesta.json({id : proximoId});

        proximoId++;

    }catch(error){

        colores.pop();

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });

    }
});

servidor.delete("/colores/borrar/:id([0-9]+)", async (peticion,respuesta) => {
    let {id} = peticion.params;

    let colorBorrado = null;

    let indice = 0;

    let existe = false;

    while(!existe && indice < colores.length){
        existe = colores[indice].id == id;
        indice = existe ? indice : indice + 1;
    }

    if(existe){
        colorBorrado = colores.splice(indice,1);
    }

    try{
        await actualizarFichero();

        respuesta.json({ resultado : existe ? "ok" : "ko" });

    }catch(error){

        if(existe){
            colores.push(colorBorrado);
            //colores.splice(indice,0,colorBorrado);
        }

        respuesta.status(500);

        respuesta.json({ error : "error en el servidor" });
    }

});

servidor.use((error,peticion,respuesta,siguiente) => {
    respuesta.status(400);//bad request
    respuesta.json({ error: "error en la petición" });
});

servidor.use((peticion,respuesta) => {
    respuesta.status(404);//not found
    respuesta.json({ error : "recurso  no encontrado" });
});


servidor.listen(process.env.PORT || 4000);

