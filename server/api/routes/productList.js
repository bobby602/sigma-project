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
    const value = req.body.inputValue;
    const item  = req.body.itemRowAll.itemcode;
    const sql = " update DATASIGMA2.dbo.BomSub " +
                " set Cost  = @value , " + 
                " CostN = cast(CAST(@value as float) *qty/1000 as varchar), " +
                " DateN = GETDATE() " +
                " where ItemCode = @item ; " + 
                " update a " +
                " set  AmtDM = (select CostN from DATASIGMA2.dbo.QSumBom a where Code = b.Code  )," +
                     " AmtCost  = (select CostN from DATASIGMA2.dbo.QSumBom a where Code = b.Code  ) + AmtEXP " +
                " from DATASIGMA2.dbo.bom as  a inner join DATASIGMA2.dbo.BomSub as  b on b.Code = a.Code " +
                " where b.ItemCode  = @item ; update DATASIGMA2.dbo.ItemDm " +
                " set CostN = @value, " +
                    " DateCN  = GETDATE()" +
                " where ItemCode = @item ; update a "+
                " set  CostN = b.CostN ," +
                     " DateCN  =  GETDATE() " +
               " from DATASIGMA2.dbo.ItemDm a " +
               " inner join DATASIGMA2.dbo.QSumBom b on b.code = a.itemcode " +
               " inner join DATASIGMA2.dbo.bomsub c on c.code = b.code " + 
               " where c.itemcode = @item ";              
    var db = new mssql.Request();
    db.input('value',mssql.VarChar(50),value);
    db.input('item',mssql.VarChar(50),item); 
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