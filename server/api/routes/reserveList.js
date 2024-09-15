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
const { get } = require('../data-access/pool-manager');
const checkAuthMiddleware = require('../util/auth')
  var app = express();
  const router = express.Router();
  router.use(session({
      secret: 'secret',
      resave:true,
      saveUninitialized:true
  }));

  router.use(express.urlencoded({extended:true}));
  router.use(bodyParser.json());

  router.post('/',checkAuthMiddleware,async function(req,res){
    let data1;
    const itemCode = req.body.e.ItemCode;
    const saleName = req.body.a;
    const type = req.body.type;
    
    const pool = get(db.Sigma);
    try {
        if(type ==  'pricePage'){
          const NameFGS = req.body.e.NameFGS;
          const code = req.body.e.code;
          const sql = " select * , FORMAT(docdate ,'dd/MM/yyyy') as docdateT  from DATASIGMA.dbo.ReserveProduct  where itemCode = @itemCode and SaleName = @saleName and NameFGS = @NameFGS and code = @code";
          await pool.connect()
          const request = pool.request();
          const result = await request
          .input('itemCode',mssql.VarChar(50),itemCode)
          .input('saleName',mssql.VarChar(50),saleName)
          .input('NameFGS',mssql.VarChar(150),NameFGS)
          .input('code',mssql.VarChar(50),code)
          .query(sql);
          console.log(result)
          res.json({result});
        }else{
          const sql = " select * , FORMAT(docdate ,'dd/MM/yyyy') as docdateT  from DATASIGMA.dbo.ReserveProduct  where itemCode = @itemCode and SaleName = @saleName ";
          await pool.connect()
          const request = pool.request();
          const result = await request
          .input('itemCode',mssql.VarChar(50),itemCode)
          .input('saleName',mssql.VarChar(50),saleName)
          .query(sql);
          console.log(result)
          res.json({result});
        }
       } catch (err) {
         // ... handle it locally
         res.status(500).send({
          result: "Error"
      });
         throw new Error(err.message);
       }finally{
        try {
             await pool.close();
            console.log('Connection pool closed');
          } catch (err) {
            console.error('Error closing connection pool:', err);
            res.status(500).send({
              result: "Error"
          });
          }
      }
   });

   router.use((err,req,res,next)=>{
    const {status = 500} =err
    res.status(status).send('ERORR')
  })

  router.post('/deleteRecord',checkAuthMiddleware,async function(req,res){
    const id = req.body.a.e.id;
    const sql = " delete from DATASIGMA.dbo.ReserveProduct where id = @id";
    const pool = get(db.Sigma);
    try {
          if(id === undefined || id ==""){
           const result = false;
           res.json({result});
          }else{
            await pool.connect()
            const request = pool.request();
            const result = await request
            .input('id',mssql.VarChar(50),id)
            .query(sql);
            res.json({result});
          }
       } catch (err) {
         // ... handle it locally
         res.status(500).send({
          result: "Error"
        });
         throw new Error(err.message);
       }finally{
        try {
             await pool.close();
            console.log('Connection pool closed');
          } catch (err) {
            console.error('Error closing connection pool:', err);
            res.status(500).send({
              result: "Error"
          });
          }
      }
   });

   router.post('/insertRecord',checkAuthMiddleware,async function(req,res){
    const price = req.body.a;
    const saleName = req.body.saleName;
    const itemCode = req.body.item.ItemCode;
    const itemName = req.body.item.name;
    const code = req.body.item.code;
    const NameFGS = req.body.item.NameFGS;
    const type = req.body.type;
    const pool =  get(db.Sigma);
    try {
        if(type == 'pricePage'){
          const Pack = req.body.item.pack;
          const sql = " insert into ReserveProduct (id,itemCode,itemName ,Qty,pack, SaleCode,SaleName,docdate,code,NameFGS) VALUES (left(NEWID(),8),@itemCode,@itemName,@price,@Pack,(select DePartCode from users where Name = @saleName),@saleName2,CURRENT_TIMESTAMP,@code,@NameFGS);";
          await pool.connect()
          const request = pool.request();
          const result = await request
          .input('itemCode',mssql.VarChar(50),itemCode)
          .input('itemName',mssql.VarChar(300),itemName)
          .input('price',mssql.Float(53),price)
          .input('Pack',mssql.VarChar(50),Pack)
          .input('saleName',mssql.VarChar(50),saleName)
          .input('saleName2',mssql.VarChar(50),saleName)
          .input('code',mssql.VarChar(50),code)
          .input('NameFGS',mssql.VarChar(150),NameFGS)
          .query(sql);
          res.json({result});
        }else{
          const Pack = req.body.item.Pack;
          const sql = " insert into ReserveProduct (id,itemCode,itemName ,Qty, SaleCode,SaleName,docdate,pack) VALUES (left(NEWID(),8),@itemCode,@itemName,@price,(select DePartCode from users where Name = @saleName),@saleName2,CURRENT_TIMESTAMP,@Pack);";
          await pool.connect()
          const request = pool.request();
          const result = await request
          .input('itemCode',mssql.VarChar(50),itemCode)
          .input('itemName',mssql.VarChar(300),req.body.item.Name)
          .input('price',mssql.Float(53),price)
          .input('saleName',mssql.VarChar(50),saleName)
          .input('saleName2',mssql.VarChar(50),saleName)
          .input('Pack',mssql.VarChar(50),Pack)
          .query(sql);
          console.log('insert')
          res.json({result});
        }

       } catch (err) {
         throw new Error(err.message);
       }finally{
        try {
             await pool.close();
            console.log('Connection pool closed');
          } catch (err) {
            console.error('Error closing connection pool:', err);
            res.status(500).send({
              result: "Error"
          });
          }
      }
   });

   router.use((err,req,res,next)=>{
    const {status = 500} =err
    res.status(status).send('ERORR')
  })


   module.exports = router;  