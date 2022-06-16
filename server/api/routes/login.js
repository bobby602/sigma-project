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
const dotenv = require('dotenv')
const line = require('@line/bot-sdk').middleware

  var app = express();
  const router = express.Router();
  router.use(session({
      secret: 'secret',
      resave:true,
      saveUninitialized:true
  }));

const env = dotenv.config().parsed;
const lineConfig = {
    channelAccessToken:'sKmTfYYSIufVU3FOYub3YUPZPsjO3ZCrhCKdFLSlXpIxJqkNmPyJK5RqZkmaEuUmeiIi1N85zxe9k68M8BcJCs6TL9TP5vsxMd/6+uMxeVdiHYvWixH2GAhRTe9WcOcvofbSGes4oWcXuvnKKFtuqAdB04t89/1O/w1cDnyilFU=',
    channelSecret: '51164bd5fb56ba7b22ac72d46efb13eb'
}
console.log(env)
 
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
                Data[i] = {...Data[i], NewArr};
                
            }
            console.log(Data[1]);

        res.json({result:Data});
    });
  });
  router.get('/subTable',function(req,res){
    // const sql = "Select *  from DATASIGMA.dbo.QitemBom where Code = @itemCode";
    const sql = "Select *  from DATASIGMA.dbo.QitemBom";
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
  router.use((err,req,res,next)=>{
      const {status = 500} =err
      res.status(status).send('ERORR')
  })
 
    const client = new line.Client(lineConfig)
    router.post('/callback', line.middleware(lineConfig), (req, res) => {
        console.log('test')
        res.status(200).send("ok")
      });
      // event handler
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
      // ignore non-text-message event
      return Promise.resolve(null);
    }
  
    // create a echoing text message
    const echo = { type: 'text', text: event.message.text };
  
    // use reply API
    return client.replyMessage(event.replyToken, echo);
  }
  module.exports = router;