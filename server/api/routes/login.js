var mysql = require('mysql');
var mssql = require("mssql");
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
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
  
  router.get('/', function(req,res){
    var request = new mssql.Request();
    request.query('select * from [DATASIGMA].[dbo].[Users] ',function(err,data,fields){
        console.log(data);
        res.json({data});
        
    });

  });

  router.post('/',function(req,res){
    var Login = req.body.username;
    console.log(Login);
    var password = req.body.password;
    console.log(password);
    if(Login){
        var request = new mssql.Request();
        request.input('Login',mssql.VarChar(50),Login);
        request.input('Password',mssql.VarChar(50),password);
        request.query('select * from [DATASIGMA].[dbo].[Users] where Login = @Login and Password = @Password',function(err,data,fields){
            console.log(data);
            if(data.rowsAffected > 0){
                console.log('IN');
                req.session.Login = Login;
                res.json({result:"Login Successful"});
            }else{
                res.status(400).send({
                    result: "There was an issue signing up."
                  });
            }
        });
    } else{
        res.json('Please Fill Username and Password');
    }
});
  router.get('/table',function(req,res){
    var request = new mssql.Request();
    const sql = "Select itemdm.codem,itemDm.itemcode,itemdm.Name,itemDm.Barcode, a.p1 as minPrice, a.p2 as maxPrice,TyItemDm,b.QBal,b.BAL " +
                " from DATASIGMA.dbo.ItemDm " + 
                " inner join DATASIGMA.dbo.qitemdmbal " +
                " on itemdm.itemcode=qitemdmbal.itemcode " +
                " inner join ( " +
                " Select min(price) as p1, max(price) as p2 ,ItemCode  from DATASIGMA.dbo.IteminSub group by ItemCode " +
                " ) a " +
                " on a.ItemCode = itemDm.itemcode "+
                "inner join ( " +
                    " Select  itemcode,name,sum(qbal +QS2) as QBal,pack, sum(qbal) - sum(QD) - sum(QP1) - sum(qp2) - Sum(QP3) - Sum(QP4)  + Sum(Qs) + Sum(Qs2) as BAL,Note "+
                    " From rptstock2  "+
                    " Group by itemcode,name,pack ,Note  " +
                    " )b on b.itemcode = a.itemcode ";
    request.query(sql,function(err,data,fields){
        console.log(data);
        if(data.rowsAffected > 0){
            res.json({result:data});
        }else{
            res.status(400).send({
                result: "There was an issue signing up."
            });
        }
    });
  });
  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
  module.exports = router;