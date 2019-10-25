const express = require('express');
const mysql=require('mysql');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

var con=mysql.createConnection({
    host:'sgp88.siteground.asia',
    port:'3306',
    user:'siddardh_pd',
    password: 'Siddhu!995',
    database:'siddardh_mydevelopertest'
});

con.connect(function(err){
    if(err){
        throw err;
    }
    console.log("connected");
});


app.use(express.static(__dirname + '/views'));



app.get("/",function(req,res){
    res.render('index');
});


app.post("/filterdata",function(req,res){
    var station =req.body.station;
    sql=`select sum(tripduration) as trip from users where From_station_name="${station}" Group By From_station_name;`;
    con.query(sql,function(err,result){
        if(err) throw err;
        console.log(result);
        result.forEach(element => {
            element=element.trip;
            result=parseFloat(((element)/60)*0.10);
        });
     res.write(`<html><body><h5>Revenue from station is:</h5> ${result}`);

    });
     sql=`Select s1.to_station_name from(select to_station_name, count(to_station_name) trips from users where from_station_name="${station}" group by to_station_name order by count(to_station_name) desc ) s1 inner join (select to_station_name, count(to_station_name) trips from users where from_station_name="${station}" group by to_station_name order by count(to_station_name) desc limit 1) s2 on s1.trips= s2.trips;`;
     con.query(sql,function(err, data){
         simple ='';
         if(err) throw err;
         console.log(data);
         data.forEach(element =>{
             simple+=element.to_station_name;
         });
         res.write(`<h5>Common station from this stations is/are:</h5> ${simple}`);
     });
     sql=`select DATE_FORMAT(start_time, '%H') as st_time, sum(tripduration) as total_duration  from users  where from_station_name="${station}"  group by st_time ;`;
     con.query(sql,function(err,data){
         var result1=new Array();
         var result2=new Array();
         if(err) throw err;
         data.forEach(element=>{
             result1.push(element.st_time);
             result2.push(element.total_duration);
         });
         results='';
         for( var i=0;i<result1.length;i++){
             results+=`<tr><td>${result1[i]}</td><td>${result2[i]}</td></tr>`;
        }
        res.write('<h5>Raw Data For Trend Line</h5>');
        res.write('<table cellpadding="2"><tr><th>Time</th><th> duration</th></tr></table>');
        res.write(`<table border="1" cellpadding="4">${results}</table>`);
        


     });

    sql=`Select  distinct q1. age,   q2.members from ( select  YEAR(CURDATE()) -birthyear as age , birthyear from users where from_station_name="${station}" order by birthyear desc) q1 join (Select birthyear , count(birthyear) as members from users where from_station_name="${station}" group by birthyear  order by birthyear desc) q2 on q1.birthyear=q2.birthyear order by q1.age asc;`;
    var bucket1=0;
    var bucket2=0;
    var bucket3=0;
    var bucket4=0;
     con.query(sql,function(err,data){
         data.forEach(element=>{
             if(element.age<16){
                bucket1=bucket1+element.members;
             }
             else if(element.age>=16 && element.age<31){
                bucket2=bucket2+element.members;
             }
             else if(element.age>=31 && element.age<46){
                bucket3=bucket3+element.members;

             }
             else if(element.age>=46 && element.age<150){
                 bucket4=bucket4+element.members;
             }
         });
         console.log(bucket1+" "+bucket2+" "+bucket3+" "+bucket4);
         var max_bucket=Math.max(bucket1,bucket2,bucket3,bucket4);
         if (max_bucket==bucket1) res.write(`<h4>Most Prevelent Age Groups in ${station} is 0-15 with ${bucket1} users</h4></body></html>`);
         else if (max_bucket==bucket2) res.write(`<h4>Most Prevelent Age Groups in ${station} is 16-30 with ${bucket2} users</h4></body></html>`);
         else if (max_bucket==bucket3) res.write(`<h4>Most Prevelent Age Groups in ${station} is 31-45 with ${bucket3} users</h4></body></html>`);
         else if(max_bucket==bucket4) res.write(`<h4>Most Prevelent Age Groups in ${station} is 46+ with ${bucket4} users</h4></body></html>`);
         res.end();
     });
    });


app.get("/toprevenue", function(req,res){
    let sql='select from_station_name, sum(tripduration) as trip from users Group By From_station_name order by trip desc limit 3;';
    var table ='';
    con.query(sql,function(err,result){
        if(err) throw err;
        result.forEach(element =>{
            table+=`<tr><td>${element.from_station_name}</tr></td>`;
        });
        res.write('<h1>Top Revenue Generating Stations are');
        res.write(`<table border="1">${table}</table>`);
        res.end();
    });

});

app.get("/repair",function(req,res){
    let sql="select t.* from (select bikeid, sum(tripduration) as temp from users group by bikeid)as t having temp>60000";
    var table='';
    con.query(sql, function(err,result){
        if(err) throw err;
        result.forEach(element => {
            table+=`<tr><td>${element.bikeid}</td></tr>`;
        });
        res.write('<h1>bike id</h1>');
        res.write(`<table border="1">${table}</table>`);
        res.end();
    });
});

app.listen(process.env.PORT || 5000, function(){
    console.log("app running on port 5000");
});
