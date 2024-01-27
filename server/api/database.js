var mssql = require("mssql");
const express = require('express');
const bodyParser = require("body-parser");
var Connection = require('tedious').Connection;

const app = express();

let result;
   var conn1 = {
    Sigma:{
      name:"Sigma",
      config:{
        server:'1.0.169.153',
        database:'dataSIGMA',
        user: 'sa',
          port:1433,      // Replace with your database username
        password: 'GoodMan@Pm.Com'  ,
        driver: "msnodesqlv8",
        pool: {
          max: 100,
          min: 0
        },
        connectionTimeout: 300000,
        idleTimeoutMillis: 300000,
        requestTimeout: 300000,
        trustServerCertificate: true,
        options: {
          trustedConnection: true,
          enableArithAbort: true,
          encrypt:false,
          cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
          }
        }
      }  
    },
    Unogroup:{
      name:'Unogroup',
      config:{
        server:'25.32.222.7',
        database:'UNOGROUP',
        user: 'sa',
          port:1433,      // Replace with your database username
        password: 'GoodMan@Pm.Com'  ,
        driver: "msnodesqlv8",
        connectionTimeout: 300000,
        idleTimeoutMillis: 300000,
        requestTimeout: 300000,
        trustServerCertificate: true,
        options: {
          trustedConnection: true,
          enableArithAbort: true,
          encrypt:false,
          cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
          }
        }     // Replace wit
      }
    }, 
    SigmaOffice:{
      name:"DAT-OFFICE", //Server Name
      config:{
        server:'49.0.87.90',
        database:'SIGMA-OFFICE', // Database Name
        user: 'sa',
          port:1433,      // Replace with your database username
        password: 'GoodMan@Pm.Com'  ,
        driver: "msnodesqlv8",
        pool: {
          max: 200,
          min: 0
        },
        connectionTimeout: 300000,
        idleTimeoutMillis: 300000,
        requestTimeout: 300000,
        trustServerCertificate: true,
        options: {
          trustedConnection: true,
          enableArithAbort: true,
          encrypt:false,
          cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
          }
        }
      }  
    }      // Replace with your database password // // Replace with your database Name
  }; 

module.exports = conn1;