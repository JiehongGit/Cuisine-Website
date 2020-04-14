const _ = require('underscore'); 
const Food = require('../models/food'); 
const Category = require('../models/category'); 
const Comment = require('../models/comment'); 
const fs =require('fs'); 
const path = require('path'); 

/* 美食信息录入控制器 */
exports.food= function(req, res) {
	Category.fetch(function(err,categories){
		res.render('addFood',{
			title: '后台录入',
			food:{
				title:'',
				main: '',
				assist:'',
				taste:'',
				knack:'',
				poster:'',
				explain0:'',
				explain1:'',
				explain2:'',
				explain3:'',
				explain4:'',
				explain5:'',
				explain6:'',
				trailer:'',
				download:'',
				summary:''
			},
			categories: categories
		})
	})
};

/* 美食详情页面控制器 */
exports.detail = function(req, res) {
	let id = req.params.id;
	// 美食用户访问统计，每次访问美食详情页，pv值增加1
	Food.update({_id:id},{$inc:{pv:1}},function(err){
		if(err){
			console.log(err);
		}
	})
	Food.findById(id, function(err,food){
		Comment
		  .find({food:id})
		  .populate("from","name")
		  .populate('reply.from reply.to', 'name')
		  .exec(function(err,comments){
			if(err){
				console.log(err);
			}
			res.render('detail',{
				title: food.title + ' - 详情',
				food: food,
				comments: comments
			})
		});
	});
};

/* 美食信息更新控制器 */
exports.update = function(req, res) {
	let id = req.params.id;
	if(id){
		// 若id存在，则通过Food模型拿到这款美食的数据
		Food.findById(id, function(err,food){
			if(err){
				console.log(err);
			}
			Category.fetch(function(err,categories){
				if(err){
					console.log(err);
				}
				res.render('addFood',{
					title: '美食编辑',
					food: food,
					categories: categories
				})
			});
		});
	}
};

/* 美食信息添加控制器 */
exports.add = function(req,res){
	let id = req.body.food._id;
	let foodObj = req.body.food;
	// 声明一个food对象
	let _food;
	if(id){
		Food.findById(id,function(err,food){
			if(err){
				console.log(err);
			}
			// 调用underscore的extend方法
			_food = _.extend(food,foodObj);

			_food.save(function(err,food){
				if(err){
					console.log(err);
				}
				res.json({"success":true,"data":"编辑电影成功"});
			})
		})
	} else {
		_food = new Food(foodObj);
		let categoryId = _food.category;
		_food.save(function(err,food){
			if(err){
				console.log(err);
			}
			Category.findById(categoryId,function(err,category){
				if(err){
					console.log(err);
				}
				category.foods.push(food._id);
				category.save(function(err,category){
					res.json({"success":true,"data":"添加美食成功"});
				})
			})
		});
	}
};

/* 美食信息列表控制器 */
exports.list = function(req, res) {
	Food.fetch(function(err,foods){
		if(err){
			console.log(err);
		}
		res.render('list',{
			title: '美食列表',
			foods: foods
		});
	})
};

/* 美食列表删除控制器 */
exports.delete = function(req, res) {
	// 获取客户端Ajax发送的URL值中的id值
	let id = req.query.id;
	// 如果id存在则服务器中将该条数据删除并返回删除成功的json数据
	if(id){
		// 查找该条美食信息
		Food.delete(id,function(err,food){
			if(err){
				console.log(err);
			} else {
				// 给客户端返回json数据
				res.json({'success': true});
			}
		})
	}
};

exports.fileUpload = function(req,res){
	let postData = req.files.file;
	let filePath = postData.path;
	let originalFilename = postData.originalFilename;
	if(originalFilename){
		fs.readFile(filePath,function(err,data){
			let timestamp = Date.now();
			let type = postData.type.split('/')[1];
			let poster = timestamp+'.'+type;
			let newPath = path.join(__dirname,'../../','public/upload/'+poster);
			fs.writeFile(newPath,data,function(err){
				let src = '/upload/' + poster;
				res.json({'src':src});
			});
		});
	}
}

exports.uploadPoster = function(req,res,next){
	let postData = req.files.uploadPoster;
	let filePath = postData.path;
	let originalFilename = postData.originalFilename;
	if(originalFilename){
		fs.readFile(filePath,function(err,data){
			let timestamp = Date.now();
			let type = postData.type.split('/')[1];
			let poster = timestamp+'.'+type;
			let newPath = path.join(__dirname,'../../','public/upload/'+poster);
			fs.writeFile(newPath,data,function(err){
				req.poster = '/upload/' + poster;
				next();
			});
		});
	} else {
		next();
	}
}
