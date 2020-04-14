var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var FoodSchema = new Schema({
	foodID: String, 
	title: String,
	main: String,
	assist: String,
	taste: String,
	knack: String,
	summary: String,
	trailer: String,
	summary: String,
	poster: String,
	explain0: String,
	explain1: String,
	explain2: String,
	explain3: String,
	explain4: String,
	explain5: String,
	explain6: String,
	pv: {
		type: Number,
		default: 0
	},
	comments: {
		type: Number,
		default: 0
	},
	category:{
		type: ObjectId,
		ref:'Category'
	},
	meta:{
		createAt:{
			type:Date,
			default: Date.now()
		},
		updateAt:{
			type:Date,
			default: Date.now()
		}
	}
})

// 为模式添加新的方法
FoodSchema.pre('save',function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
})

// 静态方法
// 静态方法不会与数据库直接交互，需要经过模型编译实例化后才会具有该方法
FoodSchema.statics = {
	// 取出数据库所有数据,并且按照更新时间进行排序
	fetch: function(cb){
		return this.find({}).sort('meta.updateAt').exec(cb);
	},
	// 查询单条数据
	findById: function(id,cb){
		return this.findOne({_id: id}).exec(cb);
	},
	// 删除数据
	delete: function(id,cb){
		return this.remove({_id: id}).exec(cb);
	},
}

// 导出模式
module.exports = FoodSchema