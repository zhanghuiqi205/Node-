const express = require("express"); //express框架的引入
const expressStatic = require('express-static'); //express静态资源的存放
const cookieParser = require('cookie-parser'); //解析coolie的数据
const cookieSession = require('cookie-session'); //解析session的数据
const bodyParser = require('body-parser');
const multer = require("multer"); //上传图片的模块
const jade = require('jade'); //jade模板解析
const ejs = require('ejs'); //ejs模板的解析
const considate = require("consolidate"); //模板引擎的图书馆
const mysql = require('mysql'); //MySQL数据库的连接中间件
const time = require('./timeformate'); //格式化时间(自定义模块)

//连接池
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "151766",
    database: "blog"
});
//bodyParser
var server = express(); //注册服务
server.listen(8088); //监听端口

//1.解析cookie
server.use(cookieParser('asfdfa'));

// 2.使用seesion
var arr = [];
for (var i = 0; i < 10000; i++) {
    arr.push("keys_" + Math.random());
}
server.use(cookieSession({
    name: "zhq520",
    keys: arr,
    maxAge: 20 * 3600 * 1000
}));

//3.post数据
server.use(bodyParser.urlencoded({ //上传post数据
    extended: false
}));

server.use(multer({
    dest: './www/uploder' //上传的文件地址
}).any());

//4.配置模板引擎
//输出什么东西：
server.set("view engine", "html");
//模板引擎 模板文件在什么地方：
server.set('views', './template/');
//使用什么模板引擎：
server.engine("html", considate.ejs);
//5.接受用户的请求(进入首页看到的banner和article渲染)

server.get('/', function (req, res, next) {
    db.query("SELECT *FROM banner_table;", (err, data) => { //查询数据库，获得数据
        console.log(111);
        if (err) {
            res.status(500).send("database error").end();
        } else {
            res.banners = data;
            next();
        }
    });
});
server.get('/', function (req, res, next) {
    db.query("SELECT title,summery,ID FROM article_table;", (err, data) => {
        if (err) {
            res.status(500).send("database error").end();
        } else {
            res.news = data;
            next();
        }
    });
});
server.get('/', function (req, res) {
    res.render("index.ejs", {
        banners: res.banners, //轮播图数据
        aritcle: res.news //新闻列表数据
    }); //渲染数据
});
server.get('/news', function (req, res) {

    if (req.query.id) {
        if (req.query.act == 'like') {
            db.query(`UPDATE article_table SET n_like=n_like+1 WHERE ID=${req.query.id}`, (err, data) => {
                if (err) {
                    res.status(500).send("database error").end();
                } else {
                    db.query(`SELECT *FROM article_table WHERE ID=${req.query.id}`, (err, data) => {
                        if (err) {
                            res.status(500).send("database error").end();
                        } else {
                            if (data.length == 0) {
                                res.status(404).send("你输入的页面不存在").end();
                            } else {
                                var news_data = data[0];
                                news_data.sDate = time.timeFormate(news_data.post_time);
                                news_data.content = news_data.content.replace(/^/gm, '<p>').replace(/$/gm, '</p>');

                                res.render("conText.ejs", {
                                    news_data: news_data //新闻详细数据
                                });
                            }
                        }
                    });
                }
            });
        } else {

            db.query(`SELECT *FROM article_table WHERE ID=${req.query.id}`, (err, data) => {
                if (err) {
                    res.status(500).send("database error").end();
                } else {
                    if (data.length == 0) {
                        res.status(404).send("你输入的页面不存在").end();
                    } else {
                        var news_data = data[0];
                        news_data.sDate = time.timeFormate(news_data.post_time);
                        news_data.content = news_data.content.replace(/^/gm, '<p>').replace(/$/gm, '</p>');

                        res.render("conText.ejs", {
                            news_data: news_data //新闻详细数据
                        });
                    }
                }
            });
        }
    } else {
        res.status(404).send("你输入的页面不存在").end();
    }

});
server.get('/mydoc', function (req, res) {
    res.render("mydoc.ejs", {}); //渲染数据
});
server.get('/login_user', function (req, res) {
    res.render("login_user.ejs", {}); //渲染数据
});

//6.staic数据
server.use(expressStatic('./www')); //指定静态文件的存在目录