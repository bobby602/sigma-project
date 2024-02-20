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
    const sql = " select * from UNoGroup.dbo.Users ";
    const pool = await get(db.Unogroup);
     try {
          await pool.connect()
          const request = pool.request();
          const result = await request.query(sql);
          res.json({result});
        } catch (err) {
          // ... handle it locally
          throw new Error(err.message);
        }
    });

  router.put('/',checkAuthMiddleware,async function(req,res){
     const TyItem = req.body.itemRowAll.TyItemDm;
     const value = req.body.inputValue;
     const item  = req.body.itemRowAll.itemcode;
     const itemName = req.body.itemRowAll.Name;
     const pack = req.body.itemRowAll.Pack;
     const type = req.body.columnInput;
     let date1 = new Date();
     let dateToday = '';
     dateToday = date1.getFullYear() +'-'+ ('0' + (date1.getMonth()+1)).slice(-2)+ '-'+ ('0' + date1.getDate()).slice(-2);
     let Type = '';
     if(TyItem =='1'){
      Type = 'RM';
     }else if(TyItem == '2'){
      Type = 'TE';
     }else if(TyItem == '3'){
      Type = 'SI';
     }else if(TyItem == '4'){
      Type = 'SF';
     }
     try {   
     const pool = await get(db.Sigma);
     await pool.connect();
     const request = pool.request();
     if(type =='cost'){
          const sql = " update DATASIGMA.dbo.BomSub " +
          " set Cost  = @value , " + 
          " CostN = cast(CAST(@value as float) *qty/1000 as varchar), " +
          " DateN = GETDATE() " +
          " where ItemCode = @item ; " + 
          " update a " +
          " set  AmtDM = (select CostN from DATASIGMA.dbo.QSumBom a where Code = b.Code  )," +
               " AmtCost  = (select CostN from DATASIGMA.dbo.QSumBom a where Code = b.Code  ) + AmtEXP " +
          " from DATASIGMA.dbo.bom as  a inner join DATASIGMA.dbo.BomSub as  b on b.Code = a.Code " +
          " where b.ItemCode  = @item ; update DATASIGMA.dbo.ItemDm " +
          " set CostN = @value, " +
          " DateCN  = GETDATE()" +
          " where ItemCode = @item ; update a "+
          " set  CostN = b.CostN ," +
               " DateCN  =  GETDATE() " +
          " from DATASIGMA.dbo.ItemDm a " +
          " inner join DATASIGMA.dbo.QSumBom b on b.code = a.itemcode " +
     " inner join DATASIGMA.dbo.bomsub c on c.code = b.code " + 
     " where c.itemcode = @item ;"+
     "update b " +
     " set Cost = c.AmtDM, " +
          " CostN = cast(CAST(c.AmtDM as float) *b.qty/1000 as varchar) " +
     " from " + 
          " ( " +
          " select " +
               " * " +
          " from	" +		
               " DATASIGMA.dbo.bomsub a " +
          " where a.ItemCode = @item " +
          " )a  " +
          " inner join DATASIGMA.dbo.BomSub b " +
          " on b.ItemCode = a.code " +
          " inner join DATASIGMA.dbo.QItemBom c " +
          " on c.Code = a.Code and c.ItemCode = a.itemCode ";  
          const data = await request
          .input('value',mssql.VarChar(50),value)
          .input('item',mssql.VarChar(50),item) 
          .query(sql)  
          res.json({result:data});
     }else if (type =='price'){
               const sql = "update DATASIGMA.dbo.ItemDm " +
               " set Price = @value,  " +
                    " DatePrice  = GETDATE() " +
               " where ItemCode = @item; ";
               const checkInsert = " select  TOP 1 FORMAT(DocDate,'yyyy-MM-dd') as DocDate ,DocNo " +
                              " from DATASIGMA.dbo.itemPrice " +
                              " where Month(DocDate) = MONTH(GETDATE()) and  " +
                              " YEAR(DocDate) = YEAR(GETDATE()) "+
                              " order by right(DocNo,4) DESC " ;
               const insertSub = " insert into DATASIGMA.dbo.ItemPriceSub (DocNo,IDNO,Code,Name,Pack,GrItem,Price,DatePrice) " +
                              " values " +
                              " ( "+
                              " @docNo, " +
                              " (select COALESCE (str((select TOP 1 IDNo " +
                              " from DATASIGMA.dbo.ItemPriceSub " +
                              " where DocNo = @docNo order by IDNo DESC )+1 ),'1') )," +
                              " @code," +
                              " @itemName," +
                              " @pack," +
                              " @Type," +
                              " @values," +
                              " GETDATE()" +
                              " ) " ;                         
               const data = await request
               .input('value',mssql.VarChar(50),value)
               .input('item',mssql.VarChar(50),item) 
               .query(sql) 
               const dataCheck = await request.query(checkInsert);
               let arrRecord = [];
               // let [arrRecord] = dataCheck.recordset;
               if(dataCheck.recordset.length == 0){
                    arrRecord.push({
                         DocDate:'',
                         DocNo:''
                    })
               }else if(dataCheck.recordset.length != 0){
                    [arrRecord] = dataCheck.recordset;
               }
               if(arrRecord.DocDate != dateToday  ){
                    const insertDocNO = "insert into DATASIGMA.dbo.ItemPrice (DocNo,QNo,DocDate,EmpCode,MonthCal,GrItem) " +
                                        "VALUES  " +
                                        "( " +
                                             "(select concat('P','-', right(FORMAT(GETDATE() ,'yyyy') +543,2), " +
                                                       "format(GETDATE(),'MM'), " +
                                                       "( " +
                                                            "select FORMAT( " +
                                                                           "COALESCE " +
                                                                                     "( " +
                                                                                          "(					 " +
                                                                                          "select max(b.DocNo) as DocNo " +
                                                                                          "from( " +
                                                                                                    "select right(DocNo,4) as DocNo  " +
                                                                                                    "from DATASIGMA.dbo.ItemPrice a  " +
                                                                                                    "where Month(DocDate) = MONTH(GETDATE()) and  " +
                                                                                                         "YEAR(DocDate) = YEAR(GETDATE()) " +
                                                                                               ")b " +
                                                                                          ")+1,'0001' " +
                                                                                     ") , '0000') as r  " +
                                                            ") " +
                                                       ") " +
                                             "), " +
                                             "( " +
                                             "select COALESCE( " +
                                                            "( " +
                                                            "select max(b.DocNo) as DocNo " +
                                                            "from( " +
                                                                 "select right(DocNo,4) as DocNo  " +
                                                                 "from DATASIGMA.dbo.ItemPrice a  " +
                                                                 "where Month(DocDate) = MONTH(GETDATE()) and  " +
                                                                      "YEAR(DocDate) = YEAR(GETDATE()) " +
                                                                 ")b	    " +
                                                            ")+1,'0001' " +
                                                            ")   " +
                                             "), " +
                                             "GETDATE(), " +
                                             " 'ADMIN', " +
                                             "MONTH(getDATE()), " +
                                             " @TypeMain " +
                                        ") " ;
                                        const insertMain = await request 
                                        .input('TypeMain',mssql.VarChar(50),Type) 
                                        .query(insertDocNO) 
                                   const dataCheck2 = await request.query(checkInsert);
                                   [arrRecord] = dataCheck2.recordset;        

               }
               const insert = await request
               .input('docNo',mssql.VarChar(50),arrRecord.DocNo)
               .input('code',mssql.VarChar(50),item) 
               .input('itemName',mssql.VarChar(200),itemName) 
               .input('pack',mssql.VarChar(50),pack) 
               .input('Type',mssql.VarChar(50),Type) 
               .input('values',mssql.VarChar(50),value)
               .query(insertSub)
               res.json({result:data});
     }else if (type =='priceRe'){
          const sql = "update DATASIGMA.dbo.ItemDm " +
                    " set PriceRE = @value,  " +
                    " DatePriceRE  = GETDATE() " +
                    " where ItemCode = @item ; " +
                    " Update ItemF " + 
                    " Set  CU = @value  , " +
                    " DateADD = GETDATE(), " +
                    " CP = Rpack * CAST(@value as float) / RpackRPT ,TOT = COP + (Rpack *CAST(@value as float) / RpackRPT ), " +
                    " PriceSale = Round((COP + (Rpack * CAST(@value as float)/ RpackRPT )),0) + Depart.RateCOP * (COP + (Rpack * CAST(@value as float) / RpackRPT ))/100   From ItemF ,Depart " +
                    " Where ItemF.Departcode = Depart.code and  ItemF.ItemCode = @item ";
          const checkInsert = " select  TOP 1 FORMAT(DocDate,'yyyy-MM-dd') as DocDate ,DocNo " +
                    " from DATASIGMA.dbo.itemPriceRE " +
                    " where Month(DocDate) = MONTH(GETDATE()) and  " +
                    " YEAR(DocDate) = YEAR(GETDATE()) "+
                    " order by right(DocNo,4) DESC " ;
     const insertSub = " insert into DATASIGMA.dbo.ItemPriceRESub (DocNo,IDNO,Code,Name,Pack,GrItem,PriceRE,DatePriceRE) " +
                    " values " +
                    " ( "+
                    " @docNo, " +
                    " (select COALESCE (str((select TOP 1 IDNo " +
                    " from DATASIGMA.dbo.ItemPriceRESub " +
                    " where DocNo = @docNo order by IDNo DESC)+1   ),'1') )," +
                    " @code," +
                    " @itemName," +
                    " @pack," +
                    " @Type," +
                    " @values," +
                    " GETDATE()" +
                    " ) " ;    
                                       
          const data = await request
          .input('value',mssql.VarChar(50),value)
          .input('item',mssql.VarChar(50),item) 
          .query(sql)
          const dataCheck = await request.query(checkInsert);
          let arrRecord = [];
          // let [arrRecord] = dataCheck.recordset;
          if(dataCheck.recordset.length == 0){
              arrRecord.push({
               DocDate:'',
               DocNo:''
              })
          }else if(dataCheck.recordset.length != 0){
               [arrRecord] = dataCheck.recordset;
          }
          if(arrRecord.DocDate != dateToday){
               const insertDocNO = "insert into DATASIGMA.dbo.ItemPriceRE (DocNo,QNo,DocDate,EmpCode,MonthCal,GrItem) " +
                                   "VALUES  " +
                                   "( " +
                                        "(select concat('PRE','-', right(FORMAT(GETDATE() ,'yyyy') +543,2), " +
                                                  "format(GETDATE(),'MM'), " +
                                                  "( " +
                                                       "select FORMAT( " +
                                                                      "COALESCE " +
                                                                                "( " +
                                                                                     "(					 " +
                                                                                     "select max(b.DocNo) as DocNo " +
                                                                                     "from( " +
                                                                                               "select right(DocNo,4) as DocNo  " +
                                                                                               "from DATASIGMA.dbo.ItemPriceRE a  " +
                                                                                               "where Month(DocDate) = MONTH(GETDATE()) and  " +
                                                                                                    "YEAR(DocDate) = YEAR(GETDATE()) " +
                                                                                          ")b " +
                                                                                     ")+1,'0001' " +
                                                                                ") , '0000') as r  " +
                                                       ") " +
                                                  ") " +
                                        "), " +
                                        "( " +
                                        "select COALESCE( " +
                                                       "( " +
                                                       "select max(b.DocNo) as DocNo " +
                                                       "from( " +
                                                            "select right(DocNo,4) as DocNo  " +
                                                            "from DATASIGMA.dbo.ItemPriceRE a  " +
                                                            "where Month(DocDate) = MONTH(GETDATE()) and  " +
                                                                 "YEAR(DocDate) = YEAR(GETDATE()) " +
                                                            ")b	    " +
                                                       ")+1 ,'0001' " +
                                                       ")  " +
                                        "), " +
                                        "GETDATE(), " +
                                        " 'ADMIN', " +
                                        "MONTH(getDATE()), " +
                                        " @TypeMain " +
                                   ") " ;
                                   const insertMain = await request 
                                   .input('TypeMain',mssql.VarChar(50),Type) 
                                   .query(insertDocNO) 
                              const dataCheck2 = await request.query(checkInsert);
                              [arrRecord] = dataCheck2.recordset;        

          }
          const insert = await request
          .input('docNo',mssql.VarChar(50),arrRecord.DocNo)
          .input('code',mssql.VarChar(50),item) 
          .input('itemName',mssql.VarChar(200),itemName) 
          .input('pack',mssql.VarChar(50),pack) 
          .input('Type',mssql.VarChar(50),Type) 
          .input('values',mssql.VarChar(50),value)
          .query(insertSub)
          res.json({result:data});
     }
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