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
  router.get('/',checkAuthMiddleware,async function(req,res){
     const pool = get(db.Sigma);
     let data1;
     try {
          const sql = " select  ROW_NUMBER ( ) OVER ( ORDER BY a.ItemCode DESC) as number ,cast(CONVERT(VARCHAR, CAST( ISNULL((b.BAL-ISNULL(d.QTY,0)),'0.00') AS MONEY), 1) AS VARCHAR) as bal ,b.pack,a.code,a.name,a.ItemCode,a.Rpack,a.PackR,a.RpackSale,a.PackD,a.PackSale,a.RPackRpt,concat(a.Rpack,' ',a.PackR,' x ',a.RpackSale) as containProduct,cast(CONVERT(VARCHAR, CAST( a.CU AS MONEY), 1) AS VARCHAR) as CU,cast(CONVERT(VARCHAR, CAST( a.CP AS MONEY), 1) AS VARCHAR) as CP,cast(CONVERT(VARCHAR, CAST( a.COP AS MONEY), 1) AS VARCHAR) as COP ,cast(CONVERT(VARCHAR, CAST( a.TOT AS MONEY), 1) AS VARCHAR) as TOT,  FORMAT(a.DateAdd ,'dd/MM/yyyy') as DateAdd ,a.DepartCode,a.DepartName,a.NameFG,a.NameFGS, " +
                      " cast(CONVERT(VARCHAR, CAST( ISNULL(a.Pricelist,'0.00') AS MONEY), 1) AS VARCHAR)  as priceList	,FORMAT(a.DatePriceList ,'dd/MM/yyyy') as datePriceList,ISNULL(a.NoteF,'') as NoteF " +
                         " ,cast(CONVERT(VARCHAR, CAST( a.Price10  AS MONEY), 1) AS VARCHAR) as Price10,  AmtF10,cast(CONVERT(VARCHAR, CAST( a.Price25  AS MONEY), 1) AS VARCHAR) as Price25, a.AmtF25,cast(CONVERT(VARCHAR, CAST( a.Price50  AS MONEY), 1) AS VARCHAR) as Price50, a.AmtF50,cast(CONVERT(VARCHAR, CAST( a.Price100  AS MONEY), 1) AS VARCHAR) as Price100, a.AmtF100 ,ISNULL(cast(CONVERT(VARCHAR, CAST( c.QTY  AS MONEY), 1) AS VARCHAR),'0.00')  as Reserve , FORMAT(DatePriceList ,'dd/MM/yyyy') as DatePriceList, CAST( ISNULL(a.point ,0) AS VARCHAR) as point ,a.RateSP " +
                         " From ItemF a inner join (Select  itemcode,name,sum(qbal ) as QBal,pack, sum(qbal) - sum(QD) - sum(QP1) - sum(qp2) - Sum(QP3) - Sum(QP4)  + Sum(Qs)  as BAL,Note " +
                                                  " From DATASIGMA.dbo.rptstock2 " +  
                                                  " Group by itemcode,name,pack ,Note ) b on b.itemcode = a.ItemCode " +
                                                  " left join ( select itemCode,sum(QTY) as QTY ,code ,NameFGS from ReserveProduct  group by itemCode,code,NameFGS ) c on c.itemCode = a.ItemCode and c.code = a.code and c.NameFGS = a.NameFGS  " + 
                                                  " left join ( select itemCode,sum(QTY) as QTY  from ReserveProduct  group by itemCode ) d on d.itemCode = a.ItemCode " +
                                                  " Order by departCode,NameFG ";
        await pool.connect()
        const request = pool.request();
        const result = await request.query(sql);
        res.json({result});
        } catch (err) {
          // ... handle it locally
          throw new Error(err.message);
        }finally{
          try {
               await pool.close();
              console.log('Connection pool closed');
            } catch (err) {
              console.error('Error closing connection pool:', err);
            }
        }
    });
    router.put('/',checkAuthMiddleware,async function(req,res){
     const ItemCode = req.body.itemRowAll.ItemCode;
     let value = req.body.inputValue;
     const itemName = req.body.itemRowAll.name;
     const DepartCode = req.body.itemRowAll.DepartCode;
     const RpackSale = req.body.itemRowAll.RpackSale;
     const PackR = req.body.itemRowAll.PackR;
     const Rpack = req.body.itemRowAll.Rpack;
     const NameFGS = req.body.itemRowAll.NameFGS;
     const NameFG = req.body.itemRowAll.NameFG;
     const code = req.body.itemRowAll.code;
     const type = req.body.columnInput;
     let date1 = new Date();
     let dateToday = '';
     const pool = get(db.Sigma);
     try {
          dateToday = date1.getFullYear() +'-'+ ('0' + (date1.getMonth()+1)).slice(-2)+ '-'+ ('0' + date1.getDate()).slice(-2);
          await pool.connect();
          const request = pool.request();
          if(type =='note'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set NoteF = @value  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='price10'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set Price10 = Round(@value,0)  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='AmtF10'){
               if(value=='-'){
                    value = '0'
               }
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set AmtF10 = @value  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='price25'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set Price25 = Round(@value,0)  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='AmtF25'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set AmtF25 = @value  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
                         console.log('test')
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='price50'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set Price50 = Round(@value,0)  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
                         console.log('test')
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='AmtF50'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set AmtF50 = @value  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";

               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='price100'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set Price100 = Round(@value,0)  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
                         console.log('testq')
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }else if(type =='AmtF100'){
               const sql = "update DATASIGMA.dbo.itemF " +
                         " set AmtF100 = @value  " +
                         " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
               const data = await request
                              .input('value',mssql.VarChar(50),value)
                              .input('ItemCode',mssql.VarChar(50),ItemCode) 
                              .input('NameFGS',mssql.VarChar(200),NameFGS) 
                              .input('code',mssql.VarChar(200),code) 
                              .query(sql) 
               res.json({result:data});               
          }
        } catch (err) {
          // ... handle it locally
          throw new Error(err.message);
        }finally{
          try {
               await pool.close();
              console.log('Connection pool closed');
            } catch (err) {
              console.error('Error closing connection pool:', err);
            }
        }
   });

   router.post('/updatePriceList',checkAuthMiddleware,async function(req,res){
     const pool = get(db.Sigma);
     try {
          const DepartName = req.body.itemRowAll.DepartName;
          const ItemCode = req.body.itemRowAll.ItemCode;
         const value = req.body.inputValue;
         const itemName = req.body.itemRowAll.name;
         const DepartCode = req.body.itemRowAll.DepartCode;
         const RpackSale = req.body.itemRowAll.RpackSale;
         const PackR = req.body.itemRowAll.PackR;
         const Rpack = req.body.itemRowAll.Rpack;
         const NameFGS = req.body.itemRowAll.NameFGS;
         const NameFG = req.body.itemRowAll.NameFG;
         const code = req.body.itemRowAll.code;
         const type = req.body.columnInput;
         let date1 = new Date();
         let dateToday = '';
         dateToday = date1.getFullYear() +'-'+ ('0' + (date1.getMonth()+1)).slice(-2)+ '-'+ ('0' + date1.getDate()).slice(-2);
         await pool.connect();
         const request = pool.request();
         if (type =='priceList'){
             const sqlRes =  "select * from DATASIGMA.dbo.Depart  where Name = @DepartName ";
             const sql = "update a " +
                      " set a.Pricelist = @value,  " +
                              " a.DatePriceList  = GETDATE(),  " +
                              " a.Price10 = Round((@value - (@value * Disc10/100)),0) , " +
                              " a.Price25 = Round((@value - (@value * Disc25/100)),0) , " +
                              " a.Price50 = Round((@value - (@value * Disc50/100)),0) , " +
                              " a.Price100 = Round((@value - (@value * Disc100/100)),0) , " +
                              " a.AmtF10 = b.AmtF10, " +
                              " a.AmtF25 = b.AmtF25, " +
                              " a.AmtF50 = b.AmtF50, " +
                              " a.AmtF100 = b.AmtF100 " +
                         " from 	DATASIGMA.dbo.itemF a inner join 	 DATASIGMA.dbo.Depart b on b.Name = a.DePartName " +
                         " where a.ItemCode = @ItemCode and a.NameFGS = @NameFGS and a.Code = @code " ;
          const checkInsert = " select  TOP 1 FORMAT(DocDate,'yyyy-MM-dd') as DocDate ,DocNo " +
          " from DATASIGMA.dbo.ItemPricePack " +
          " where Month(DocDate) = MONTH(GETDATE()) and  " +
          " YEAR(DocDate) = YEAR(GETDATE()) "+
          " order by right(DocNo,4) DESC " ;
          const insertSub = "insert into DATASIGMA.dbo.ItemPricePackSub(DocNo,IDNO,ItemCode,Code,NameFG,NameFGS,Package,DepartCode,GrItem,Pricepack,DatePricePack,Name) " +  
                             "values " + 
                             "( " +
                             "@docNo, " + 
                             "(select COALESCE (str((select TOP 1  IDNo " + 
                             "from DATASIGMA.dbo.ItemPricePackSub " +  
                             " where DocNo = @docNo order by IDNo DESC )+1 ),'1') ), " + 
                             " @ItemCode2, " +
                             "@code2, " +
                             "@NameFG, " +
                             "@NameFGS2," +
                             "concat( @Rpack , @PackR,'X',@RpackSale), " +
                             "@DepartCode, " +
                             "@DepartCode, " +
                             "@values, " +
                             "GETDATE(), " + 
                             "@itemName " +
                             " ) " ;                         
          const data = await request
          .input('value',mssql.VarChar(50),value)
          .input('ItemCode',mssql.VarChar(50),ItemCode) 
          .input('NameFGS',mssql.VarChar(200),NameFGS) 
          .input('code',mssql.VarChar(200),code) 
          .query(sql) 
          const dataCheck = await request.query(checkInsert);
          let [arrRecord] = dataCheck.recordset;
              if(arrRecord.DocDate != dateToday ){
                   const insertDocNO = "insert into DATASIGMA.dbo.ItemPricePack (DocNo,QNo,DocDate,EmpCode,MonthCal,GrItem) " +
                                       "VALUES  " +
                                       "( " +
                                       "(select concat('PAC','-', right(FORMAT(GETDATE() ,'yyyy') +543,2), " +
                                                 "format(GETDATE(),'MM'), " +
                                                 "( " +
                                                      "select FORMAT( " +
                                                                     "COALESCE " +
                                                                               "( " +
                                                                                    "(                       " +
                                                                                    "select max(b.DocNo) as DocNo " +
                                                                                    "from( " +
                                                                                              "select right(DocNo,4) as DocNo  " +
                                                                                              "from DATASIGMA.dbo.ItemPricePack a  " +
                                                                                              "where Month(DocDate) = MONTH(GETDATE()) and  " +
                                                                                                   "YEAR(DocDate) = YEAR(GETDATE()) " +
                                                                                         ")b " +
                                                                                    "),'0001' " +
                                                                               ")+1 , '0000') as r  " +
                                                      ") " +
                                                 ") " +
                                       "), " +
                                       "( " +
                                       "select COALESCE( " +
                                                      "( " +
                                                      "select max(b.DocNo) as DocNo " +
                                                      "from( " +
                                                           "select right(DocNo,4) as DocNo  " +
                                                           "from DATASIGMA.dbo.ItemPricePack a  " +
                                                           "where Month(DocDate) = MONTH(GETDATE()) and  " +
                                                                "YEAR(DocDate) = YEAR(GETDATE()) " +
                                                           ")b     " +
                                                      ")+1 ,'0001' " +
                                                      ")  " +
                                       "), " +
                                       "GETDATE(), " +
                                       " 'ADMIN', " +
                                       "MONTH(getDATE()), " +
                                       " @TypeMain " +
                                  ") " ;
                   const insertMain = await request 
                                   .input('TypeMain',mssql.VarChar(50),DepartCode) 
                                   .query(insertDocNO) 
                   const dataCheck2 = await request.query(checkInsert);
                   [arrRecord] = dataCheck2.recordset;        
              }
          const insert = await request
          .input('docNo',mssql.VarChar(50),arrRecord.DocNo)
          .input('ItemCode2',mssql.VarChar(50),ItemCode) 
          .input('code2',mssql.VarChar(200),code) 
          .input('NameFG',mssql.VarChar(200),NameFG) 
          .input('NameFGS2',mssql.VarChar(200),NameFGS) 
          .input('Rpack',mssql.Numeric,Rpack)
          .input('PackR',mssql.VarChar(50),PackR)
          .input('RpackSale',mssql.Numeric,RpackSale)
          .input('DepartCode',mssql.VarChar(50),DepartCode)
          .input('values',mssql.VarChar(50),value)
          .input('itemName',mssql.VarChar(200),itemName)
          .query(insertSub);
          const  departData = await request
          .input('DepartName',mssql.VarChar(50),DepartName)
          .query(sqlRes)
          res.json({result:data,departData});
         }
        } catch (err) {
          // ... handle it locally
          throw new Error(err.message);
        }finally{
          try {
               await pool.close();
              console.log('Connection pool closed');
            } catch (err) {
              console.error('Error closing connection pool:', err);
            }
        }
  });
 
 
router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
  module.exports = router;  