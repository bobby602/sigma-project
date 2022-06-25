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

  var app = express();
  const router = express.Router();
  router.use(session({
      secret: 'secret',
      resave:true,
      saveUninitialized:true
  }));
 
  router.use(express.urlencoded({extended:true}));
  router.use(bodyParser.json());

  router.get('/',function(req,res){
    const sql = " select * from DATASIGMA2.dbo.BomSub bs where ItemCode = 'RMACETO01' ";
    var db = new mssql.Request();
    db.query(sql,function(err,data,fields){
        if (err) throw err;
            console.log(data)
            res.json({result:data});
        });
    });

  router.put('/',function(req,res){
    const item = req.body;
    console.log(item)
    const sql = " update DATASIGMA2.dbo.BomSub " +
                " set Cost  = '200' , " + 
                " CostN = cast(CAST(1000 as float) *qty/1000 as varchar), " +
                " DateN = GETDATE() " +
                " where ItemCode = 'RMACETO01' ; " + 
                " update a " +
                " set  AmtDM = (select CostN from DATASIGMA2.dbo.QSumBom a where Code = b.Code  )," +
                     " AmtCost  = (select CostN from DATASIGMA2.dbo.QSumBom a where Code = b.Code  ) + AmtEXP " +
                " from DATASIGMA2.dbo.bom as  a inner join DATASIGMA2.dbo.BomSub as  b on b.Code = a.Code " +
                " where b.ItemCode  = 'RMACETO01' ; update DATASIGMA2.dbo.ItemDm " +
                " set CostN = '51.0', " +
                    " DateCN  = GETDATE()" +
                " where ItemCode = 'RMAGRIL01'";
    var db = new mssql.Request();
    db.query(sql,function(err,data,fields){
        if (err) throw err;
            console.log(data)
        res.json({result:data});
    });
  });
 

  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
  module.exports = router;