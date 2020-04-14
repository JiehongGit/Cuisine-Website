// 加载mongoose工具模块
var mongoose = require('mongoose')
// 引入模式文件
var FoodSchema = require('../schemas/food')
// 使用mongoose的模型方法编译生成模型
var Food = mongoose.model('Food',FoodSchema)
// 将模型构造函数导出
module.exports = Food 