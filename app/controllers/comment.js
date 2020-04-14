const Comment = require('../models/comment'); // 美食评论模型
const Food = require('../models/food');

/* 评论回复控制器 */
exports.reply = function(req,res){
	// 获取Ajax发送的数据
	let _comment = req.body.comment;
	let foodId = _comment.food;
	// 如果存在cid说明是对评论人进行回复
	if(_comment.cid){
		// 通过点击回复一条美食评论的id，找到这条评论的内容
		Comment.findById(_comment.cid,function(err,comment){
			if(err) console.log(err);
			let reply = {
				from: _comment.from,
				to: _comment.tid,
				content: _comment.content,
				// 修复回复评论中时间错误问题
				meta:{
					createAt: Date.now()
				}
			}
			// 添加到评论的数组中
			comment.reply.push(reply);
			// 保存该条评论的回复内容
			comment.save(function(err,comment){
				if(err) console.log(err);
				Food.update({_id:foodId},{$inc:{comments:1}},function(err){
					if(err)	console.log(err);
				})
				res.redirect('/food/'+ foodId);
			})
		})
	} else {
		// 将用户评论创建新对象并保存
		let comment = new Comment(_comment);
		comment.save(function(err,comment){
			if(err) console.log(err);
			Food.update({_id:foodId},{$inc:{comments:1}},function(err){
				if(err)	console.log(err);
			})
			res.redirect('/food/'+ foodId);
		})
	}	
}