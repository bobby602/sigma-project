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
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const {jwtGenerate,jwtRefreshTokenGenerate} = require('./generateTokens');
const checkAuthMiddleware = require('../util/auth')
const saltRounds = 10;
let jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');
const line = require('@line/bot-sdk');
const { sign, verify } = require('jsonwebtoken');
var app = express();
const router = express.Router();
const env = dotenv.config().parsed;
const KEYRefresh = env.REFRESH_TOKEN_PRIVATE_KEY;

  router.use(session({
      secret: 'secret',
      resave:true,
      saveUninitialized:true
  }));

  router.use(express.urlencoded({extended:true}));
  router.use(bodyParser.json());

  router.post('/refresh',async(req,res)=>{
    const refreshToken = req.body.token;
    let new_access_token;
    let new_refresh_token;
   
    var Login = req.body.username;
    const command = 'select * from [DATASIGMA].[dbo].[Token] where user_id = @user;';
    const sql = "update Token set token = @token, expire_date = @exp where user_id = @Login2;";
    const pool = await get(db.Sigma);
    await pool.connect()
    const request = pool.request();
    const result = await request
                    .input('user',mssql.VarChar(50),Login)
                    .query(command);
    if(!refreshToken) return res.status(401).json("You are not authenticated!");
    if((refreshToken != result.recordsets[0][0].token)){
        return res.status(403).json("Refresh token is not valid!")
    }
    verify(refreshToken, KEYRefresh,async(err)=>{
        err&& console.log(err);
        new_access_token = jwtGenerate(Login);
        new_refresh_token = jwtRefreshTokenGenerate(Login);
        console.log(new_refresh_token  + Login);
        const decoded = jwtDecode(refreshToken);
           const update= await request
                    .input('token',mssql.VarChar(200),new_refresh_token)
                    .input('exp',mssql.Numeric(20),decoded.exp) 
                    .input('Login2',mssql.VarChar(200),Login) 
                    .query(sql);
                    console.log(update);



        res.status(200).json({accessToken:new_access_token,refreshToken:new_refresh_token});
        
        
    });


  })

  router.post("/logout",async(req,res,next)=>{
    const refreshToken = req.body.token;
    var Login = req.body.username;
    const sql = "update Token set token = null, expire_date = null where user_id = @Login2;";
    const pool = await get(db.Sigma);
    await pool.connect()
    const request = pool.request();
                request
                    .input('Login2',mssql.VarChar(200),Login) 
                    .query(sql) 
    res.status(200).json("You Logged out Succesfully.");
  })
  
  router.get('/',checkAuthMiddleware, async(req,res,next)=>{
    const command = 'select * from [DATASIGMA].[dbo].[Users] ';
    const pool = await get(db.Sigma);
    await pool.connect()
    const request = pool.request();
    const result = await request.query(command);
    res.json({result})
    await pool.close()
  });

    router.post('/',async function(req,res){
        const pool =  get(db.Sigma);
        const pool2 = get(db.SigmaOffice);
        
        try {
            var Login = req.body.username;
            var password = req.body.password;
            let saleCode;
            await pool.connect()
            const request = pool.request();
            await pool2.connect()
            const request2 = pool2.request();
            
            if(Login){          
                const data =  await request
                                .input('Login',mssql.VarChar(50),Login)
                                .input('Password',mssql.VarChar(50),password)
                                .query('select Login,Name,StAdmin,SaleCode from [DATASIGMA].[dbo].[Users] where Login = @Login and Password = @Password');
                if(data.rowsAffected > 0){
                        const access_token = jwtGenerate(data.recordsets[0][0]);
                        const refresh_token = jwtRefreshTokenGenerate(data.recordsets[0][0]);
                        
                        if(data.recordsets[0][0].SaleCode != undefined && data.recordsets[0][0].SaleCode!=''){
                            saleCode = data.recordsets[0][0].SaleCode;
                           const Data2 = await request2
                            .input('salecode',mssql.VarChar(50),saleCode)
                            .query('select Name,SurName from sale where Code = @salecode');
                                if(Data2.rowsAffected > 0){
                                    req.session.Login = Login;
                                    const decoded = jwtDecode(refresh_token);
                                    const sql = "update Token set token = @token, expire_date = @exp where user_id = @Login2;";
                                      await request
                                            .input('token',mssql.VarChar(200),refresh_token)
                                            .input('exp',mssql.Numeric(20),decoded.exp) 
                                            .input('Login2',mssql.VarChar(200),Login) 
                                            .query(sql);
                                    res.json({access_token,refresh_token,result:data.recordsets,resultInfo:Data2.recordsets});
                                }
                        }else{
                            req.session.Login = Login;
                            const decoded = jwtDecode(refresh_token);
                                    const sql = "update Token set token = @token, expire_date = @exp where user_id = @Login2;";
                                       await request
                                            .input('token',mssql.VarChar(200),refresh_token)
                                            .input('exp',mssql.Numeric(20),decoded.exp) 
                                            .input('Login2',mssql.VarChar(200),Login) 
                                            .query(sql) 
                            res.json({access_token,refresh_token,result:data.recordsets});
                        }
                    }else{
                        res.status(400).send({
                            result: "There was an issue signing up."
                        });
                    }
            } else{
                res.json('Please Fill Username and Password');
            }

        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
        finally{
            try {
                 await pool.close();
                 await pool2.close();
                console.log('Connection pool closed');
              } catch (err) {
                console.error('Error closing connection pool:', err);
              }
        }
    });

router.post('/table',checkAuthMiddleware,async function(req,res){
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
                        " select  0 as rowNum ,'' as codem ,'' as PriceOffer, '' as  ItemCode , DepartName as Name , '' as Barcode ,  DepartName, '' as Pack, '' as minPrice, '' as maxPrice , '' as TyItemDm , '' as Reserve, '' as QBal , '' as BAL , '' as CostN , '' as DateCn , '' as costNew , '' as price, '' as PriceRE , '' as datePrice , '' as datePriceRe, ROW_NUMBER ( ) OVER ( ORDER BY DepartName ASC) as num  from DATASIGMA.dbo.ItemDm  where itemdm.TyItemDm like '%['+@Type+']%' group by DePartName " +
                        " union all " +
                        " Select 1 as rowNum ,itemdm.codem,itemDm.PriceOffer,itemDm.ItemCode,itemdm.Name,itemDm.Barcode,itemdm.DePartName, itemdm.Pack,cast(CONVERT(VARCHAR, CAST(a.p1 AS MONEY), 1) AS VARCHAR) as minPrice , cast(CONVERT(VARCHAR, CAST(a.p2 AS MONEY), 1) AS VARCHAR) as  maxPrice,itemdm.TyItemDm,cast(CONVERT(VARCHAR, CAST(ISNULL(c.QTY,'0.00') AS MONEY), 1) AS VARCHAR) as Reserve,cast(CONVERT(VARCHAR, CAST(ISNULL(b.BAL,'0.00') AS MONEY), 1) AS VARCHAR) as QBal ,cast(CONVERT(VARCHAR, CAST(ISNULL((b.BAL-ISNULL(QTY,0)),'0.00') AS MONEY), 1) AS VARCHAR)  as BAL,  " +
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
                                                                " Select  itemcode,name,sum(qbal) as QBal,pack, sum(qbal) - sum(QD) - sum(QP1) - sum(qp2) - Sum(QP3) - Sum(QP4)  + Sum(Qs)  as BAL,Note " +
                                                                " From DATASIGMA.dbo.rptstock2   " +
                                                                " Group by itemcode,name,pack ,Note   " +
                                                                " )b on b.itemcode = itemDm.itemcode " +   
                                                        " left join ( " +
                                                            " SELECT tmp.itemCode , SUM ( QTY ) AS Qty  FROM " +
                                                            " ( " +
                                                                " select case when tmp.code = '' then tmp.item else tmp.code end as itemCode , sum(tmp.QTY) as QTY,tmp.code,tmp.item,tmp.Num  " +
                                                                    " from ( " +
                                                                            " select 0 AS NUM,itemCode as item,  QTY , '' as code " +
                                                                            " from ReserveProduct " +
                                                                            " union all " +
                                                                            " select 1 AS NUM,a.code as item,((a.QTY * b.QTY)/1000)  as QTY,a.ItemCode as code " +
                                                                            " from BomSub a  " +
                                                                            "left join ( " +
                                                                                        " select itemCode , sum(QTY) as QTY from ReserveProduct group by itemcode " +
                                                                                        ") b on b.itemCode = a.code where b.QTY is not null " +
                                                                        " )tmp   " +
                                                                        " LEFT JOIN ( SELECT itemcode, name, SUM ( qbal ) AS QBal, pack, SUM ( qbal ) - SUM ( QD ) - SUM ( QP1 ) - SUM ( qp2 ) - SUM ( QP3 ) - SUM ( QP4 ) + SUM ( Qs ) AS BAL, Note " +
                                                                                     " FROM DATASIGMA.dbo.rptstock2 " +
                                                                                     "GROUP BY itemcode, name, pack, Note " +
                                                                                    " ) b ON b.itemcode = tmp.item " +
                                                                        " WHERE tmp.NUM = CASE WHEN b.bal <= 0 THEN tmp.NUM ELSE 0 END " +
                                                                        " GROUP BY tmp.code, tmp.item , tmp.Num " +
                                                                    ") tmp "+
                                                                " group by tmp.itemCode ) c on c.itemCode = ItemDm.ItemCode " +    
                                                                " where itemdm.TyItemDm like '%['+@Type+']%' and  itemdm.StDispPrice <> '2'"+ 
                        " ) tmp " +
                        " order by tmp.num,tmp.rowNum,tmp.Name ASC;Select a.Code,a.ItemCode,a.ItemName,a.Qty,a.Pack,cast(CONVERT(VARCHAR, CAST(a.cost AS MONEY), 1) AS VARCHAR) as Cost ,cast(CONVERT(VARCHAR, CAST(a.costn AS MONEY), 1) AS VARCHAR) as CostN from DATASIGMA.dbo.QitemBom a ; select Code ,cast(CONVERT(VARCHAR, CAST(AmtDM AS MONEY), 1) AS VARCHAR) as  AmtDM,AmtEXP ,cast(CONVERT(VARCHAR, CAST(AmtCost AS MONEY), 1) AS VARCHAR) as AmtCost,DateCN from DATASIGMA.dbo.bom; select DePartName from itemDm GROUP BY DePartName";
    const pool = get(db.Sigma);
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
                  
                if(Data[i].ItemCode==e.Code){
                    return e;
                }
            })
            sumData[i] = Data3.filter((e)=>{
                if(Data[i].ItemCode==e.Code){
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
        throw new Error(error);
    }finally{
        try {
             await pool.close();
            console.log('Connection pool closed');
          } catch (err) {
            console.error('Error closing connection pool:', err);
          }
    }
});
  router.get('/subTable',checkAuthMiddleware, async function(req,res){
    // const sql = "Select *  from DATASIGMA.dbo.QitemBom where Code = @itemCode";
    const pool =  get(db.Sigma);
    const sql = "Select *  from DATASIGMA.dbo.QitemBom";
    const itemCode = req.query.itemCode;
    try {
        await pool.connect()
        const request = pool.request();
    // console.log(itemCode)
    // var Sig = new mssql.Request();
    // db.input('itemCode',mssql.VarChar(50),itemCode);
     const data = await request.query(sql)
            let Data = data.recordset;
            let Data2 = data.recordsets[1];
            let NewData = new Array(Data.length);
    } catch(err) {
        console.log(err);
    } finally{
        try {
             await pool.close();
            console.log('Connection pool closed');
          } catch (err) {
            console.error('Error closing connection pool:', err);
          }
    }      

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