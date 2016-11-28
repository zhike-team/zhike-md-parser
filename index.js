/**
 * Created by du on 16/11/27.
 * tmpArr 标签数据 item: {key: 'raw', text: 'mdStr'}
 * mdArr  聚合数据 item :{start: 0. end: 1024, raw: 'mdStr', trans: 'mdStr'}
 * openSymbol 自定义标签栈 ['paragraph', 'time', 'raw', 'trans'];
 */
'use strict'
function MDParser(){
	// if (!opts || !opts.mdStr) throw  new Error('缺少参数');
	// this.mdStr = opts.mdStr;
	this.mdArr = [];
	this.tmpArr = [];
	this.openSymbol = [];
}

MDParser.prototype = {
	init: function () {
		this.mdArr = [];
		this.tmpArr = [];
		this.openSymbol = [];
	},

	parse: function(mdStr, isCombine){
		if (typeof mdStr !== 'string') {
			throw new Error('非法参数');
		}
		this.init();
		this.getArrayData(mdStr);
		if (this.tmpArr.length){
			this.rawParser(this.tmpArr)
		}
		if (isCombine){
			return this.rawCombine(this.mdArr);                 		//合并
		}
		return this.mdArr;
	},

	getArrayData: function(mdStr){
		let symbolIndex = new RegExp('{{(.*?)}}');
		let strResult = mdStr.match(symbolIndex);
		if (!strResult) {
			this.mdArr.push({text: mdStr});
			return;
		}

		let key = strResult[1];
		let leftStr = mdStr.substring(strResult.index + strResult[0].length);

		if (key !== 'end'){
			this.openSymbol.push(key);
			if (key === 'paragraph' && this.tmpArr.length > 0) this.rawParser(this.tmpArr);
		}else if (this.openSymbol.length === 0){
			throw new Error('标签闭合错误');
		}else {
			let keyWord = this.openSymbol.pop();			                       //标签出栈
			if (keyWord === 'paragraph' && this.openSymbol.length === 0){ 	 //每次paragraph出栈时 openSymbol必然为空
				this.paragraphParser();
			}else if(['time', 'raw', 'trans'].indexOf(keyWord) > -1){        //raw, time, end 标签
				let lastItem = this.tmpArr[this.tmpArr.length - 1];
				if(lastItem && lastItem.key === 'time' && keyWord !== 'raw'){
					throw new Error('time标签之后必须要有raw标签');
				}
				if (keyWord === 'trans' && lastItem && lastItem.key !== 'raw'){
					throw new Error('trans标签之前必须要有raw标签');
				}
				let text = mdStr.substring(0, strResult.index);
				this.tmpArr.push({key: keyWord, text: text});
			}else {
				throw new Error(`UNKNOWN SYMBOL: ${keyWord}`);                  //出现不允许的自定义标签
			}
		}
		if(leftStr){
			this.getArrayData(leftStr);
		}
	},

	timeParser: function (text) {
		return {
			start: text.split('/')[0]*1,
			end: text.split('/')[1]*1
		}
	},

  //段落解析合并
	paragraphParser: function () {
		let rawArray = this.tmpArr;
		let start = 0, end = 0, raw = '', trans = '';
		for(let i=0; i < rawArray.length; i++){
			if (rawArray[i].key === 'time'){
				let timeObj = this.timeParser(rawArray[i].text);
				start = start ? start : timeObj.start;
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
	},

	//单独raw解析 逐条
	rawParser: function (rawArray) {
		let rawObj = {};
		for (let i = 0; i < rawArray.length; i++){
			if (rawArray[i].key === 'time'){
				if (rawObj.raw) {
					this.mdArr.push(rawObj);
				}
				rawObj = this.timeParser(rawArray[i].text);
			}else if (rawArray[i].key === 'raw'){
				if (rawObj.raw){
					this.mdArr.push(rawObj);
					rawObj = {};
				}
				rawObj.raw = rawArray[i].text;
			}else if(rawArray[i].key === 'trans'){
				rawObj.trans = rawArray[i].text;
				this.mdArr.push(rawObj);
				rawObj = {};
			}
		}
	},

	rawCombine: function (mdArr) {
		let start, end, raw = '', trans = '';
		mdArr.forEach(function(m){
			start = start ? m.start - start > 0 ? start : m.start : m.start;
			end = end ? m.end - end > 0 ? m.end : end : m.end;
			raw += m.raw || '';
			trans += m.trans || '';
		})
		return {start, end, raw, trans};
	}
}

module.exports = MDParser;