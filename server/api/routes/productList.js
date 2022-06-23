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
                    " )b on b.itemcode = a.itemcode ; Select *  from DATASIGMA.dbo.QitemBom ";
    var db = new mssql.Request();
    db.query(sql,function(err,data,fields){
        if (err) throw err;
            let Data = data.recordset;
            let Data2 = data.recordsets[1];
            let NewData = new Array(Data.length);
            for(let i=0;i<Data.length;i++){
                NewData[i] = Data2.filter((e)=>{
                    if(Data[i].itemcode==e.Code){
                        return e;
                    }
                })
                const NewArr = NewData[i];
                Data[i] = {...Data[i], NewArr,i};
                
            }
            console.log(Data[2]);

        res.json({result:Data});
    });
  });
 

  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
  module.exports = router;