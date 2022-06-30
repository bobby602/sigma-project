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
const dotenv = require('dotenv')
const line = require('@line/bot-sdk')

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
    request.query('select * from [DATASIGMA2].[dbo].[Users] ',function(err,data,fields){
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
        request.query('select * from [DATASIGMA2].[dbo].[Users] where Login = @Login and Password = @Password',function(err,data,fields){
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
    const sql = "Select itemdm.codem,itemDm.itemcode,itemdm.Name,itemDm.Barcode, itemdm.Pack,cast(CONVERT(VARCHAR, CAST(a.p1 AS MONEY), 1) AS VARCHAR) as minPrice , cast(CONVERT(VARCHAR, CAST(a.p2 AS MONEY), 1) AS VARCHAR) as  maxPrice,TyItemDm,cast(CONVERT(VARCHAR, CAST(b.Qbal AS MONEY), 1) AS VARCHAR) as QBal ,cast(CONVERT(VARCHAR, CAST(b.BAL AS MONEY), 1) AS VARCHAR)  as BAL, " +
                " cast(CONVERT(VARCHAR, CAST(COSTN AS MONEY), 1) AS VARCHAR)  as CostN , FORMAT(DateCN ,'dd/MM/yyyy') as DateCn , case when (CAST(DateAddI AS DATETIME)>CAST(DateAddE AS DATETIME) OR  DateAddE is null ) and DateAddI is not null then cast(CONVERT(VARCHAR, CAST(CostI AS MONEY), 1) AS VARCHAR) " +
                " when (CAST(DateAddE AS DATETIME)>CAST(DateAddI AS DATETIME) or DateAddI is null) and DateAddE  is not null  then cast(CONVERT(VARCHAR, CAST(CostE AS MONEY), 1) AS VARCHAR) " +
                " else '0.00' " +
                " end as costNew " +
                " from DATASIGMA2.dbo.ItemDm " + 
                " inner join DATASIGMA2.dbo.qitemdmbal " +
                " on itemdm.itemcode=qitemdmbal.itemcode " +
                " inner join ( " +
                " Select min(price) as p1, max(price) as p2 ,ItemCode  from DATASIGMA.dbo.IteminSub group by ItemCode " +
                " ) a " +
                " on a.ItemCode = itemDm.itemcode "+
                "inner join ( " +
                    " Select  itemcode,name,sum(qbal +QS2) as QBal,pack, sum(qbal) - sum(QD) - sum(QP1) - sum(qp2) - Sum(QP3) - Sum(QP4)  + Sum(Qs) + Sum(Qs2) as BAL,Note "+
                    " From DATASIGMA2.dbo.rptstock2  "+
                    " Group by itemcode,name,pack ,Note  " +
                    " )b on b.itemcode = a.itemcode ;Select a.Code,a.ItemCode,a.ItemName,a.Qty,a.Pack,cast(CONVERT(VARCHAR, CAST(b.cost AS MONEY), 1) AS VARCHAR) as Cost ,cast(CONVERT(VARCHAR, CAST(b.costn AS MONEY), 1) AS VARCHAR) as CostN from DATASIGMA2.dbo.QitemBom a inner join DATASIGMA2.dbo.BomSub b on b.code  = a.code and b.itemcode = a.ItemCode    ; select Code ,cast(CONVERT(VARCHAR, CAST(AmtDM AS MONEY), 1) AS VARCHAR) as  AmtDM,AmtEXP ,cast(CONVERT(VARCHAR, CAST(AmtCost AS MONEY), 1) AS VARCHAR) as AmtCost,DateCN from DATASIGMA2.dbo.bom ";
    var db = new mssql.Request();
    db.query(sql,function(err,data,fields){
        if (err) throw err;
            let Data = data.recordset;
            let Data2 = data.recordsets[1];
            let Data3 = data.recordsets[2];
            console.log(Data2)
            let NewData = new Array(Data.length);
            let sumData = new Array(Data.length);
            for(let i=0;i<Data.length;i++){
                NewData[i] = Data2.filter((e)=>{
                    if(Data[i].itemcode==e.Code){
                        return e;
                    }
                })
                sumData[i] = Data3.filter((e)=>{
                    if(Data[i].itemcode==e.Code){
                        return e;
                    }
                })
                const NewArr = NewData[i];
                const SumArr = sumData[i];
                if(SumArr.length == 0){
                    Data[i] = {...Data[i], NewArr,i,SumArr:""};  
                }else{
                    Data[i] = {...Data[i], NewArr,i,SumArr};  
                }
            }
        res.json({result:Data});
    });
  });
  router.get('/subTable',function(req,res){
    // const sql = "Select *  from DATASIGMA.dbo.QitemBom where Code = @itemCode";
    const sql = "Select *  from DATASIGMA2.dbo.QitemBom";
    const itemCode = req.query.itemCode;
    // console.log(itemCode)
    var db = new mssql.Request();
    // db.input('itemCode',mssql.VarChar(50),itemCode);
    db.query(sql,function(err,data,fields){
        try {
            let Data = data.recordset;
            let Data2 = data.recordsets[1];
            let NewData = new Array(Data.length);
            for(let i=0;i>1;i++){
                console.log(Data[i])
                // NewData[i] = Data2.map((e)=>{
                //         console.log(e);
                // })
                
            }
            // res.json({result:data});

                // res.status(400).send({
                //     result: "There was an issue signing up."
                // });
        }
        catch(err) {
          console.log(err);
        }    
    });
  });
  router.get('/callback', (req, res) => {
    console.log(req.body)
    res.send("hi")
  });
  router.post('/callback', (req, res) => {
    console.log(req.body)
    res.send("hi")
  });
  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
  module.exports = router;