const Food = require('../models/food'); // 美食数据模型
const Category = require('../models/category'); // 美食分类模型
const Comment = require('../models/comment'); // 美食评论模型
const Keyword = require('../models/keyword'); // 搜索关键词模型

/* 美食首页控制器 */
exports.index = function(req, res) {
	Category.find({}).populate({path:'foods'}).exec(function(err,categories){
		if(err)  console.log(err);
		// 热门美食排行（按照点击率进行排行）
		Food.find({}).sort({pv: -1}).limit(9).exec(function(err,foods){
			res.render('index',{ // 返回首页
				title: '地方特色美食网站', // 传递参数，替代占位符
				category: categories,
				ranks: foods
			});
		})
	})
}

/* 美食搜索控制器 */
exports.search = function(req,res){
	let catId = req.query.cat; // 获取美食分类查询串ID
	let search_text = req.query.search_text;
	let page = parseInt(req.query.p) || 0; // 没传默认0
	let count = 10; // 每页展示美食数量
	let start = page * count;

	// 如果包含catId，则是点击了相应的美食分类标题，进入results页面显示相应美食分类的美食
	if(catId){
		// 通过category.find和.populate拿到当前分类下的所有美食数据,然后再去取movies
		Category.find({_id:catId}).populate({path:'foods'}).exec(function(err,categories){
			if(err){
				console.log(err);
			}
			let category = categories[0] || {}; // 查询到的美食分类
			let foods = category.foods || []; // 分类中包含的美食

			// 调用slice方法，第一个参数是我们要从哪一个参数开始取,到哪里结束
			let totalPage = Math.ceil(foods.length / count);
			let results = foods.slice(start,start + count);

			// 修复主页点击分类进入搜索页面后无法看到热门关键词bug
			Keyword.find({}).sort({count: -1}).limit(10).exec(function(err,keywords){
				res.render('search',{
					title: '查询结果',
					keyword: category.name, 
					currentPage: page + 1, // 当前页
					totalPage: totalPage,  
					foods: results, // 查询到美食分类下所含的美食
					keywords: keywords 
				});
			})
		})
	} else {
		// 如果搜索词不为空，保存搜索关键词
		if(search_text != ''){
			Keyword.findOne({keyword:search_text},function(err,keyword){
				if(err)	console.log(err);
				if(!keyword){
					let _keyword = new Keyword({
						keyword:  search_text,
						count: 1
					});	
					_keyword.save(function(err,keyword){
						if(err)	console.log(err);
					})
				} else {
					Keyword.update({_id:keyword._id},{$inc:{count:1}},function(err){
						if(err)	console.log(err);
					})
				}
			})
		}
		Food.find({title: new RegExp(search_text+".*",'i')}).exec(function(err,foods){
			if(err){
				console.log(err);
			}
			// Math.ceil向上取整
			let totalPage = Math.ceil(foods.length / count);
			let results = foods.slice(start,start + count);
			
			Keyword.find({}).sort({count: -1}).limit(10).exec(function(err,keywords){
				res.render('search',{
					title: '查询结果',
					keyword: search_text,
					currentPage: page + 1,
					totalPage: totalPage, 
					foods: results,
					keywords: keywords
				});
			})
		})
	}
}