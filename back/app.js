const http = require("http");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const request = require('request');
var cors = require('cors')
const sls = require('serverless-http');

const port = parseInt(process.env.PORT, 10) || 8081;
const YOUTUBE_API = "https://www.googleapis.com/youtube/v3/videos";
const API_KEY = "AIzaSyDXGVuf55eTTL8Z3OBvKnTYxWIGFual9Eo";


const app = express();

app.use(logger("dev"));

app.use(cors())


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const con = mysql.createConnection({
    host     : "prueba-afex.cvsbs7eofqss.eu-north-1.rds.amazonaws.com",
    user     : "sebastian",
    password : "PruebaAfex123",
    port     : "3306",
    database : "prueba"
});


app.get("/videos/get", (req, res) => {

    var sql = "SELECT * FROM videos ORDER BY id DESC";
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).send({
            estado:200,
            videos:result,
            msg:"Exito"
        })
    });  
});

app.post("/videos/anadir", (req, res) => {

    var youtube_id = req.body.youtube_id;

    var sql = "SELECT * FROM videos WHERE youtube_id = '" + youtube_id + "' LIMIT 1";

    con.query(sql, async function (err, result) {
        if (err) throw err;

        if(result.length == 0) {

            var details = await getVideoDetails(youtube_id);

            if(!details) 
                res.status(200).send({
                    estado:404,
                    msg:"No se encontro el video"
                })

            var sql = `INSERT INTO prueba.videos
            (
                nombre,descripcion,
                thumbnail,duracion,
                created_at,youtube_id
            )
            VALUES
            (
                '${details.nombre}',
                '${details.descripcion}',
                '${details.thumbnail}',
                '${details.duracion}',
                '${getActualDateTime()}',
                '${details.youtube_id}'
            )`;

            con.query(sql, function (err, result) {
                if (err) throw err;
                res.status(200).send({
                    estado:200,
                    video:details,
                    msg:"Exito"
                })
            })
        } else {
            res.status(200).send({
                estado:500,
                msg:"El video ya se encuentra registrado"
            })
        }
    });  
});

app.post("/videos/eliminar", (req, res) => {

    var youtube_id = req.body.youtube_id;

    var sql = "DELETE FROM videos WHERE youtube_id='" + youtube_id + "'";
    
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).send({
            estado:200,
            msg:"Exito"
        })
    });  
});

function getActualDateTime(){
    let now = Date.now();

    let date = new Date(now);
    let dia = date.getDate();
    let mes = date.getMonth() + 1;
    let ano = date.getFullYear();
    let hrs = date.getHours();
    let min = date.getMinutes();
    let seg = date.getSeconds();

    return ano + "-" + mes + "-" + dia + " " + hrs + ":" + min + ":" + seg;
}

function getVideoDetails(youtube_id) {
    return new Promise(function (resolve, reject) {
        request(YOUTUBE_API + "?id=" + youtube_id + "&key="+ API_KEY + "&part=snippet&part=contentDetails", function(err, body){
            var res = JSON.parse(body.body).items;
            if(res.length == 0) reject(false);
            var snippet = res[0].snippet;
            var contentDetails = res[0].contentDetails;
            resolve({nombre:snippet.title,duracion:parseDuracion(contentDetails.duration),thumbnail:snippet.thumbnails['medium'].url,descripcion:snippet.description,youtube_id:youtube_id});
         });
      });
}

function parseDuracion(duracion) {
    var duracion_parsed = duracion.replace("PT","").replace("H",":").replace("M",":").replace("S","");
    if(duracion_parsed.substring(duracion_parsed.length - 1) == ":") duracion_parsed += "00";
    return duracion_parsed;
}

module.exports.server = sls(app);