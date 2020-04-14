const express = require('express');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 3000;
const routes = require('./config/router');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const favicon = require('serve-favicon');
const template = require('art-template');
const mongoose = require('mongoose');
const mongoStore = require('connect-mongo')(session);
const logger = require('morgan');

// 实例化express对象,用于连接中间件
const app = express();
const env = process.env.NODE_ENV || 'development';

// 数据库连接
let dbUrl = 'mongodb://localhost/Cuisine';
mongoose.Promise = global.Promise;
mongoose.connect(dbUrl, function(err){
	if(err){
		console.log('数据库连接失败');
	}else{
		console.log('数据库连接成功')
		console.log("server started on port:" + port);
	}
});

app.locals.moment = require('moment');

let models_path = __dirname + '/app/models';
let walk = function(path){
	fs.readdirSync(path).forEach(function(file){
		var newPath = path + '/' + file;
		var stat = fs.statSync(newPath);
		if(stat.isFile()){
			if(/(.*)\.(js|coffee)/.test(file)){
				require(newPath);
			} else if(stat.isDirectory){
				walk(newPath);
			}
		}
	})
}
walk(models_path);

// art-template引擎
app.set("views","./app/views"); // 视图文件根目录
template.config('base','');
template.config('extname', '.html');
app.engine('.html', template.__express); // 设置模板引擎
app.set('view engine', 'html');

// 解析json格式
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit:"50mb"}));
app.use(cookieParser());
// 设置session
app.use(session({
	secret:"MovieSite",
	resave: true, 
	saveUninitialized: true,
	store: new mongoStore({
		url: dbUrl,
		collection: 'sessions',
	}),
	cookie: {maxAge: 1000 * 60 * 60 * 24},
}));
// 访问所有public目录下的静态资源文件
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public/images', 'icon.png'))); //设置网站图标

routes(app); // 路由控制

// 错误处理
if(env === 'development'){
	app.set("showStackError",true);
	app.use(logger(':method :url :status'));
	mongoose.set("debug",true);
}

app.listen(port);
