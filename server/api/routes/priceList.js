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
  router.get('/',async function(req,res){
    let data1;
      const sql = " select  ROW_NUMBER ( ) OVER ( ORDER BY ItemCode DESC) as number ,code,name,ItemCode,Rpack,PackR,RpackSale,PackD,PackSale,RPackRpt,concat(Str(Rpack),' ',PackR,'x',RpackSale) as containProduct,cast(CONVERT(VARCHAR, CAST( CU AS MONEY), 1) AS VARCHAR) as CU,cast(CONVERT(VARCHAR, CAST( CP AS MONEY), 1) AS VARCHAR) as CP,cast(CONVERT(VARCHAR, CAST( COP AS MONEY), 1) AS VARCHAR) as COP ,cast(CONVERT(VARCHAR, CAST( TOT AS MONEY), 1) AS VARCHAR) as TOT,  FORMAT(DateAdd ,'dd/MM/yyyy') as DateAdd ,DepartCode,DepartName,NameFG,NameFGS, " +
                  " cast(CONVERT(VARCHAR, CAST( ISNULL(Pricelist,'0.00') AS MONEY), 1) AS VARCHAR)  as priceList	,FORMAT(DatePriceList ,'dd/MM/yyyy') as datePriceList,ISNULL(NoteF,'') as NoteF " +
                  " From ItemF  Order by departCode,NameFG  ";
    const pool = await get(db.Sigma);
    await pool.connect()
    const request = pool.request();
    const result = await request.query(sql);
    res.json({result});
    });
    router.put('/',async function(req,res){
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
     const pool = await get(db.Sigma);
     await pool.connect();
     const request = pool.request();
     if (type =='priceList'){
      const sql = "update DATASIGMA.dbo.itemF " +
      " set Pricelist = @value,  " +
           " DatePriceList  = GETDATE() " +
      " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
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
                                                  "),'0001' " +
                                                  ")+1   " +
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
      .query(insertSub)
      console.log(insert)
      res.json({result:data});
     }else if(type =='note'){
          const sql = "update DATASIGMA.dbo.itemF " +
                    " set NoteF = @value  " +
                    " where ItemCode = @ItemCode and NameFGS = @NameFGS and Code = @code ";
                    console.log('test')
          const data = await request
                         .input('value',mssql.VarChar(50),value)
                         .input('ItemCode',mssql.VarChar(50),ItemCode) 
                         .input('NameFGS',mssql.VarChar(200),NameFGS) 
                         .input('code',mssql.VarChar(200),code) 
                         .query(sql) 
          res.json({result:data});               
     }
   });
 
 
  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
  module.exports = router;