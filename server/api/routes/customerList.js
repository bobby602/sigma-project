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
   const sql = " select Code, Name, concat(ADDR1,' ' , ADDR2) as addr , Phone , cast(CONVERT(VARCHAR, CAST( ISNULL(MaxCr,'0') AS MONEY), 1) AS VARCHAR)   as MaxCr , CAST(ISNULL(CRTERM,0) AS DECIMAL(30,2)) as CRTERM from cust where substring(codeSale,1,2)='RE'";
   const pool = await get(db.SigmaOffice);
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

   router.post('/selectSummaryUser',async function(req,res){
    let data1;
   const sql = " select  CustCode ,CustName ,cast(CONVERT(VARCHAR, CAST( ISNULL(sum(NetAmt), 0.00) AS MONEY), 1) AS VARCHAR) as NetAmt,  cast(CONVERT(VARCHAR, CAST( ISNULL(sum(Amt),0.00) AS MONEY), 1) AS VARCHAR)  as Amt,  cast(CONVERT(VARCHAR, CAST( ISNULL(sum(Cost),0.00) AS MONEY), 1) AS VARCHAR) as Cost, cast(CONVERT(VARCHAR, CAST( ISNULL(sum(amtdiff),0.00) AS MONEY), 1) AS VARCHAR)  as amtdiff, cast(CONVERT(VARCHAR, CAST( ISNULL(sum(Coltd),0.00) AS MONEY), 1) AS VARCHAR)   as Coltd, cast(CONVERT(VARCHAR, CAST( ISNULL(sum(CUMSSP),0.00) AS MONEY), 1) AS VARCHAR)  as CUMSSP, cast(CONVERT(VARCHAR, CAST( ISNULL(sum(MS),0.00) AS MONEY), 1) AS VARCHAR)  as MS,cast(CONVERT(VARCHAR, CAST( ISNULL(sum(Comsale),0.00) AS MONEY), 1) AS VARCHAR)  as Comsale from RptAR1G where DocDate between @date1 and @date2 AND saleCode = @salecode group by CustCode,CustName ";
   const pool = await get(db.SigmaOffice);
   let date1 = new Date();
   let date1Query;
   let date2Query;
    try {
        let date1 = req.body.input.date1Val;
        let date2 = req.body.input.date2Val;
        let saleCode = req.body.saleCode;
        if(date1 != undefined && date2 != undefined && saleCode != undefined){
          let arrayDate1 = date1.split("/");
          let arrayDate2 = date2.split("/");
          date1Query = arrayDate1[2]+'-'+arrayDate1[1]+'-'+arrayDate1[0];
          date2Query = arrayDate2[2]+'-'+arrayDate2[1]+'-'+arrayDate2[0];
        }else{
          date1 = '';
          date2 = '';
          saleCode = 'aaa';
        }
        
        await pool.connect()
        const request = pool.request();
        const result = await request
        .input('date1',mssql.VarChar(50),date1Query)
        .input('date2',mssql.VarChar(50),date2Query)
        .input('salecode',mssql.VarChar(50),saleCode)
        .query(sql);
        const num = result.rowsAffected[0];
        let sumArr;
        let sumNetAmt = 0;
        let sumAmt = 0;
        let sumCost = 0;
        let sumamtdiff = 0;
        let sumColtd = 0;
        let sumCUMSSP = 0;
        let sumMS = 0;
        let sumComsale = 0;
        let NetAmt ;
        let Amt;
        let Cost;
        let amtdiff;
        let Coltd;
        let CUMSSP;
        let MS;
        let Comsale;
        let sumAll = result.recordset.map((e,i)=>{
          if(e.NetAmt!= null){
            NetAmt =  parseFloat(e.NetAmt.replaceAll(',',''));
          }
          if( e.Amt != null){
            Amt =  parseFloat(e.Amt.replaceAll(',',''));
          }
          if(e.Cost != null){
            Cost =  parseFloat(e.Cost.replaceAll(',',''));
          }
          if(e.amtdiff!= null){
            amtdiff =  parseFloat(e.amtdiff.replaceAll(',',''));
          }
          if(e.Coltd!= null){
            Coltd =  parseFloat(e.Coltd.replaceAll(',',''));
          }

          if(e.CUMSSP!= null){
            CUMSSP =  parseFloat(e.CUMSSP.replaceAll(',',''));
          }
          if(e.MS!= null){
            MS =  parseFloat(e.MS.replaceAll(',',''));
          }

          if(e.Comsale!= null){
            Comsale =  parseFloat(e.Comsale.replaceAll(',',''));
          }
          sumNetAmt += NetAmt; 
          sumAmt +=  Amt;
          sumCost += Cost;
          sumamtdiff += amtdiff;
          sumColtd += Coltd;
          sumCUMSSP += CUMSSP;
          sumMS += MS;
          sumComsale += Comsale;
        });

        if(sumNetAmt != null){
          sumNetAmt= sumNetAmt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
          sumNetAmt = '0.00';
        }

        if(sumAmt != null){
          sumAmt= sumAmt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
          sumAmt = '0.00';
        }

        if(sumamtdiff != null){
          sumamtdiff= sumamtdiff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
          sumamtdiff = '0.00';
        }

        if(sumCUMSSP != null){
          sumCUMSSP= sumCUMSSP.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
          sumCUMSSP = '0.00';
        }


        if(sumColtd != null){
          sumColtd= sumColtd.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
          sumColtd = '0.00';
        }
        if(sumMS != null){
          sumMS= sumMS.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
          sumMS = '0.00';
        }

        if(sumComsale != null){
          sumComsale= sumComsale.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
          sumComsale = '0.00';
        }

        let finalResult = {
          ...result.recordset,
          '110' :{
            CustCode: 'รวม',
            NetAmt: sumNetAmt,
            Amt: sumAmt,
            Cost: sumCost,
            amtdiff: sumamtdiff,
            Coltd: sumColtd,
            CUMSSP: sumCUMSSP,
            MS: sumMS,
            Comsale: sumComsale
          }
        }
         res.json({finalResult});
       } catch (err) {
         // ... handle it locally
         throw new Error(err.message);
       }
   });
   router.get('/custReg',async function(req,res){
    let data1;
   const sql = " select * from custREG ";
   const pool = await get(db.SigmaOffice);
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

   router.use((err,req,res,next)=>{
    const {status = 500} =err
    res.status(status).send('ERORR')
  })



   module.exports = router;  