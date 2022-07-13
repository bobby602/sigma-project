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
    const sql = "select  code,name,ItemCode,Rpack,PackR,RpackSale,PackD,PackSale,RPackRpt,concat(Str(Rpack),' ',PackR,'x',RpackSale) as containProduct,cast(CONVERT(VARCHAR, CAST( CU AS MONEY), 1) AS VARCHAR) as CU,cast(CONVERT(VARCHAR, CAST( CP AS MONEY), 1) AS VARCHAR) as CP,cast(CONVERT(VARCHAR, CAST( COP AS MONEY), 1) AS VARCHAR) as COP ,cast(CONVERT(VARCHAR, CAST( TOT AS MONEY), 1) AS VARCHAR) as TOT,  FORMAT(DateAdd ,'dd/MM/yyyy') as DateAdd ,DepartCode,DepartName,NameFG,NameFGS " +
    " From ItemF  Order by departCode,NameFG  ";
    const pool = await get(db.Sigma);
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