var mysql = require('mysql');
var mssql = require("mssql");
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const db = require('../database');
const res = require('express/lib/response');
const { resourceLimits } = require('worker_threads');
const { request } = require('http');
const { response } = require('../app');
const { get } = require('../data-access/pool-manager')
  var app = express();
  const router = express.Router();
  router.use(session({
      secret: 'secret',
      resave:true,
      saveUninitialized:true
  }));

  router.use(express.urlencoded({extended:true}));
  router.use(bodyParser.json());
  router.get('/',async function(req,res){
    let data1;
    const sql = " select * from UNoGroup.dbo.Users ";
    const pool = await get(db.Unogroup);
    console.log(pool)
    await pool.connect()
    const request = pool.request();
    const result = await request.query(sql);
    res.json({result});
    });

 
  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
  module.exports = router;