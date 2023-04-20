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

  router.post('/',async function(req,res){
    let data1;
    const itemCode = req.body.e.ItemCode;
    const saleName = req.body.a;
   const sql = " select * from DATASIGMA.dbo.ReserveProduct  where itemCode = @itemCode and SaleName = @saleName ";
   const pool = await get(db.Sigma);
    try {
         await pool.connect()
         const request = pool.request();
         const result = await request
         .input('itemCode',mssql.VarChar(50),itemCode)
         .input('saleName',mssql.VarChar(50),saleName)
         .query(sql);
         console.log(result)
         res.json({result});
       } catch (err) {
         // ... handle it locally
         throw new Error(err.message);
       }
   });

   router.use((err,req,res,next)=>{
    const {status = 500} =err
    res.status(status).send('ERORR')
  })

  router.post('/deleteRecord',async function(req,res){
    const id = req.body.a.e.id;
    const sql = " delete from DATASIGMA.dbo.ReserveProduct where id = @id";
    const pool = await get(db.Sigma);
    try {
         await pool.connect()
         const request = pool.request();
         const result = await request
         .input('id',mssql.VarChar(50),id)
         .query(sql);
         res.json({result});
       } catch (err) {
         // ... handle it locally
         throw new Error(err.message);
       }
   });

   router.post('/insertRecord',async function(req,res){
    const price = req.body.a;
    const saleName = req.body.saleName;
    const itemCode = req.body.item.ItemCode;
    const itemName = req.body.item.name;
    const Pack = req.body.item.pack;
    console.log( req.body)
    const sql = " insert into ReserveProduct (id,itemCode,itemName ,Qty,pack, SaleCode,SaleName,docdate) VALUES (NEWID(),@itemCode,@itemName,@price,@Pack,(select DePartCode from users where Name = @saleName),@saleName2,CURRENT_TIMESTAMP);";
    const pool = await get(db.Sigma);
    try {
         await pool.connect()
         const request = pool.request();
         const result = await request
         .input('itemCode',mssql.VarChar(50),itemCode)
         .input('itemName',mssql.VarChar(50),itemName)
         .input('price',mssql.Float(53),price)
         .input('Pack',mssql.VarChar(50),Pack)
         .input('saleName',mssql.VarChar(50),saleName)
         .input('saleName2',mssql.VarChar(50),saleName)
         .query(sql);
         res.json({result});
       } catch (err) {
         // ... handle it locally
         throw new Error(err.message);
       }
   });

   router.use((err,req,res,next)=>{
    const {status = 500} =err
    res.status(status).send('ERORR')
  })


   module.exports = router;  