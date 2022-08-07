var mysql = require('mysql');
var mssql = require("mssql");
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const { get } = require('../data-access/pool-manager')

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
  
  router.get('/', async function(req,res){
    const command = 'select * from [DATASIGMA].[dbo].[Users] ';
    const pool = await get(db.Sigma);
    await pool.connect()
    const request = pool.request();
    const result = await request.query(command);
    res.json({result})
  });

  router.post('/',async function(req,res){
    var Login = req.body.username;
    var password = req.body.password;
    if(Login){
        const pool = await get(db.Sigma);
        await pool.connect()
        const request = pool.request();
        request
        .input('Login',mssql.VarChar(50),Login)
        .input('Password',mssql.VarChar(50),password)
        .query('select Login,Name,StAdmin from [DATASIGMA].[dbo].[Users] where Login = @Login and Password = @Password',function(err,data,fields){
            if(data.rowsAffected > 0){
                req.session.Login = Login;
                res.json({result:data.recordsets});
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

router.post('/table',async function(req,res){
    const body = req.body.e;
    let valueSearch;
    let Str ='';
    if(body.length >1){
        const typeStr = body.map((e)=>{
            Str=  Str +e+',';
          })
          valueSearch =Str.substring(0, Str.length - 1)
    }else{
        valueSearch = body[0];
    }
    const sql = " select tmp.* " +
                " from ( " +
                        " select  0 as rowNum ,'' as codem , '' as  itemcode , DepartName as Name , '' as Barcode ,  DepartName, '' as Pack, '' as minPrice, '' as maxPrice , '' as TyItemDm , '' as QBal , '' as BAL , '' as CostN , '' as DateCn , '' as costNew , '' as price, '' as PriceRE , '' as datePrice , '' as datePriceRe, ROW_NUMBER ( ) OVER ( ORDER BY DepartName ASC) as num  from DATASIGMA.dbo.ItemDm  where itemdm.TyItemDm like '%['+@Type+']%' group by DePartName " +
                        " union all " +
                        " Select 1 as rowNum ,itemdm.codem,itemDm.itemcode,itemdm.Name,itemDm.Barcode,itemdm.DePartName, itemdm.Pack,cast(CONVERT(VARCHAR, CAST(a.p1 AS MONEY), 1) AS VARCHAR) as minPrice , cast(CONVERT(VARCHAR, CAST(a.p2 AS MONEY), 1) AS VARCHAR) as  maxPrice,itemdm.TyItemDm,cast(CONVERT(VARCHAR, CAST(b.Qbal AS MONEY), 1) AS VARCHAR) as QBal ,cast(CONVERT(VARCHAR, CAST(b.BAL AS MONEY), 1) AS VARCHAR)  as BAL,  " +
                                                        " cast(CONVERT(VARCHAR, CAST(COSTN AS MONEY), 1) AS VARCHAR)  as CostN , FORMAT(DateCN ,'dd/MM/yyyy') as DateCn , case when (CAST(DateAddI AS DATETIME)>CAST(DateAddE AS DATETIME) OR  DateAddE is null ) and DateAddI is not null then cast(CONVERT(VARCHAR, CAST(CostI AS MONEY), 1) AS VARCHAR) "+
                                                        " when (CAST(DateAddE AS DATETIME)>CAST(DateAddI AS DATETIME) or DateAddI is null) and DateAddE  is not null  then cast(CONVERT(VARCHAR, CAST(CostE AS MONEY), 1) AS VARCHAR) " +
                                                        " else '0.00'  " +
                                                        " end as costNew ,cast(CONVERT(VARCHAR, CAST( itemdm.price AS MONEY), 1) AS VARCHAR) as price,cast(CONVERT(VARCHAR, CAST( itemdm.PriceRE AS MONEY), 1) AS VARCHAR) as PriceRE ,FORMAT(itemdm.datePrice ,'dd/MM/yyyy') as datePrice,FORMAT(itemdm.datepriceRe ,'dd/MM/yyyy') as datePriceRe , DENSE_RANK()  OVER (ORDER BY itemdm.DepartName ASC) as num " +
                                                        " from DATASIGMA.dbo.ItemDm   " +
                                                        " inner join DATASIGMA.dbo.qitemdmbal  " +
                                                        " on itemdm.itemcode=qitemdmbal.itemcode  " +
                                                        " left join (  " +
                                                        " Select min(price) as p1, max(price) as p2 ,ItemCode  from DATASIGMA.dbo.IteminSub group by ItemCode  " +
                                                        " ) a  " +
                                                        " on a.ItemCode = itemDm.itemcode  " +
                                                        " inner join (  " +
                                                                " Select  itemcode,name,sum(qbal +QS2) as QBal,pack, sum(qbal) - sum(QD) - sum(QP1) - sum(qp2) - Sum(QP3) - Sum(QP4)  + Sum(Qs) + Sum(Qs2) as BAL,Note " +
                                                                " From DATASIGMA.dbo.rptstock2   " +
                                                                " Group by itemcode,name,pack ,Note   " +
                                                                " )b on b.itemcode = itemDm.itemcode " +      
                                                                " where itemdm.TyItemDm like '%['+@Type+']%'"+ 
                        " ) tmp " +
                        " order by tmp.num,tmp.rowNum,tmp.Name ASC ;Select a.Code,a.ItemCode,a.ItemName,a.Qty,a.Pack,cast(CONVERT(VARCHAR, CAST(b.cost AS MONEY), 1) AS VARCHAR) as Cost ,cast(CONVERT(VARCHAR, CAST(b.costn AS MONEY), 1) AS VARCHAR) as CostN from DATASIGMA.dbo.QitemBom a inner join DATASIGMA.dbo.BomSub b on b.code  = a.code and b.itemcode = a.ItemCode    ; select Code ,cast(CONVERT(VARCHAR, CAST(AmtDM AS MONEY), 1) AS VARCHAR) as  AmtDM,AmtEXP ,cast(CONVERT(VARCHAR, CAST(AmtCost AS MONEY), 1) AS VARCHAR) as AmtCost,DateCN from DATASIGMA.dbo.bom; select DePartName from itemDm GROUP BY DePartName";
    const pool = await get(db.Sigma);
    await pool.connect()
    const request = pool.request();
    try{
        const data = await request
                    .input('Type',mssql.VarChar(50),valueSearch)
                    .query(sql);
        let Data = data.recordset;
        let Data2 = data.recordsets[1];
        let Data3 = data.recordsets[2];
        let Data4 = data.recordsets[3];
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
        res.json({result:Data,Data4});
    }
    catch (error) {
        console.log(error);
    }
});
  router.get('/subTable',function(req,res){
    // const sql = "Select *  from DATASIGMA.dbo.QitemBom where Code = @itemCode";
    const sql = "Select *  from DATASIGMA.dbo.QitemBom";
    const itemCode = req.query.itemCode;
    // console.log(itemCode)
    var Sig = new mssql.Request();
    // db.input('itemCode',mssql.VarChar(50),itemCode);
    Sig.query(sql,function(err,data,fields){
        try {
            let Data = data.recordset;
            let Data2 = data.recordsets[1];
            let NewData = new Array(Data.length);
            for(let i=0;i>1;i++){           
            }
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
  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
  module.exports = router;