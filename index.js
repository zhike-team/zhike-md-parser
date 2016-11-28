/**
 * Created by du on 16/11/27.
 * md中以paragraph标签包含,是聚合起来的
 */
'use strict'
function MDParser(opts){
	// if (!opts || !opts.mdStr) throw  new Error('缺少参数');
	opts = opts || {};
	this.mdStr = opts.mdStr;
	this.mdArr = [];
	this.tmpArr = [];
	this.openSymbol = [];
}

MDParser.prototype = {
	parse: function(mdStr, isCombine){
		mdStr = mdStr || this.mdStr;
		this.getArrayData(mdStr);
		let resultArray = this.mdArr.length > 0 ? this.mdArr : this.tmpArr;
		return resultArray;
	},

	getArrayData: function(mdStr){
		let symbolIndex = new RegExp('{{(.*?)}}');
		let strResult = mdStr.match(symbolIndex);
		if (strResult.index === -1) {
			this.mdArr.push({text: mdStr});
			return;
		}

		let key = strResult[1];
		let leftStr = mdStr.substring(strResult.index + strResult[0].length);
		if (key !== 'end'){
			this.openSymbol.push(key);
		}else if (this.openSymbol.length === 0){
			throw new Error('标签闭合错误');
		}else {
			//标签出栈
			let keyWord = this.openSymbol.pop();
			//每次paragraph出栈时 openSymbol必然为空
			if (keyWord === 'paragraph' && this.openSymbol.length === 0){
				this.rawCombine();
			}else if(['time', 'raw', 'trans'].indexOf(keyWord) > -1){
				//raw, time, end 标签
				if(this.tmpArr[this.tmpArr.length - 1] === 'time' && keyWord !== 'raw'){
					throw new Error('time标签之后必须要有raw标签');
				}
				if (keyWord === 'trans' && this.tmpArr[this.tmpArr.length - 1] !== 'raw'){
					throw new Error('trans标签之前必须要有raw标签');
				}
				let text = mdStr.substring(0, strResult.index);
				this.tmpArr.push({key: keyWord, text: text});
			}else {
				//出现不允许的自定义标签
				throw new Error(`UNKNOWN SYMBOL: ${keyWord}`);
			}
		}
		if(leftStr){
			this.getArrayData(leftStr);
		}
	},

	timeCount: function (text) {
		return {
			start: text.split('/')[0]*1,
			end: text.split('/')[1]*1
		}
	},

	rawCombine: function () {
		let rawArray = this.tmpArr;
		let start = 0, end = 0, raw = '', trans = '';
		for(let i=0; i < rawArray.length; i++){
			if (rawArray[i].key === 'time'){
				let timeObj = this.timeCount(rawArray[i].text);
				start = timeObj.start - start > 0 ? start : timeObj.start;
				end = timeObj.end - end > 0 ? timeObj.end : end;
			}else if (rawArray[i].key === 'raw'){
				raw += rawArray[i].text;
			}else if (rawArray[i].key === 'trans'){
				trans += rawArray[i].text;
			}
		}
		this.tmpArr = [];
		this.mdArr.push({start, end, raw, trans});
	}
}

module.exports = MDParser;