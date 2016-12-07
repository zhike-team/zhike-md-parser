/**
 * Created by du on 16/11/27.
 * tmpArr 标签数据 item: {key: 'raw', text: 'mdStr'}
 * mdArr  聚合数据 item :{start: 0. end: 1024, raw: 'mdStr', trans: 'mdStr'}
 * openSymbol 自定义标签栈 ['paragraph', 'time', 'raw', 'trans'];
 */
'use strict';
import MarkdownParser from './markdown';
let Markdown = new MarkdownParser();

function MDParser(opts) {
	this.mdArr = [];
	this.tmpArr = [];
	this.openSymbol = [];
	this.config = opts ? opts : {};
}

MDParser.prototype = {
	init: function () {
		this.mdArr = [];
		this.tmpArr = [];
		this.openSymbol = [];
		Markdown.config = this.config;
	},

	parse: function (mdStr, isCombine, isToHtml) {
		if (typeof mdStr !== 'string') {
			throw new Error('非法参数');
		}
		this.init();
		this.isToHtml = isToHtml;
		this.getArrayData(mdStr);
		if (this.tmpArr.length) {
			this.rawParser(this.tmpArr)
		}
		if (isCombine) {
			return this.rawCombine(this.mdArr);                 		//合并
		}
		return this.mdArr;
	},

	//解析原始字符串
	getArrayData: function (mdStr) {
		let symbolIndex = new RegExp('{{(.*?)}}');
		let strResult = mdStr.match(symbolIndex);
		if (!strResult) {
			if (mdStr.trim()) {
				mdStr = this.isToHtml ? Markdown.toHTML(mdStr) : mdStr;
				this.mdArr.push({raw: mdStr});
			}
			return;
		}

		let key = strResult[1];
		let leftStr = mdStr.substring(strResult.index + strResult[0].length);

		if (key !== 'end') {
			this.openSymbol.push(key);
			if (key === 'paragraph' && this.tmpArr.length > 0) this.rawParser(this.tmpArr);
		} else if (this.openSymbol.length === 0) {
			throw new Error('标签闭合错误');
		} else {
			let keyWord = this.openSymbol.pop();			                       //标签出栈
			if (keyWord === 'paragraph' && this.openSymbol.length === 0) { 	 //每次paragraph出栈时 openSymbol必然为空
				this.paragraphParser();
			} else if (['time', 'raw', 'trans'].indexOf(keyWord) > -1) {        //raw, time, end 标签
				let lastItem = this.tmpArr[this.tmpArr.length - 1];
				if (lastItem && lastItem.key === 'time' && keyWord !== 'raw') {
					throw new Error('time标签之后必须要有raw标签');
				}
				if (keyWord === 'trans' && lastItem && lastItem.key !== 'raw') {
					throw new Error('trans标签之前必须要有raw标签');
				}
				let text = mdStr.substring(0, strResult.index);
				this.tmpArr.push({key: keyWord, text: text});
			} else {
				throw new Error(`UNKNOWN SYMBOL: ${keyWord}`);                  //出现不允许的自定义标签
			}
		}
		if (leftStr) {
			this.getArrayData(leftStr);
		}
	},

	//解析时间 second
	timeParser: function (text) {
		return {
			start: text.split('/')[0] * 1,
			end: text.split('/')[1] * 1
		}
	},

	//段落解析合并
	paragraphParser: function () {
		let rawArray = this.tmpArr;
		let start = 0, end = 0, raw = '', trans = '';
		for (let i = 0; i < rawArray.length; i++) {
			if (rawArray[i].key === 'time') {
				let timeObj = this.timeParser(rawArray[i].text);
				start = start ? start : timeObj.start;
				start = timeObj.start - start > 0 ? start : timeObj.start;
				end = timeObj.end - end > 0 ? timeObj.end : end;
			} else if (rawArray[i].key === 'raw') {
				raw += rawArray[i].text;
			} else if (rawArray[i].key === 'trans') {
				trans += rawArray[i].text;
			}
		}
		this.tmpArr = [];
		raw = this.isToHtml ? Markdown.toHTML(raw) : raw;
		this.mdArr.push({start, end, raw, trans});
	},

	//单独raw解析 逐条
	rawParser: function (rawArray) {
		let rawObj = {};
		for (let i = 0; i < rawArray.length; i++) {
			if (rawArray[i].key === 'time') {
				if (rawObj.raw) {
					this.mdArr.push(rawObj);
				}
				rawObj = this.timeParser(rawArray[i].text);
			} else if (rawArray[i].key === 'raw') {
				if (rawObj.raw) {
					this.mdArr.push(rawObj);
					rawObj = {};
				}
				rawObj.raw = this.isToHtml ? Markdown.toHTML(rawArray[i].text) : rawArray[i].text;
			} else if (rawArray[i].key === 'trans') {
				rawObj.trans = this.isToHtml ? Markdown.toHTML(rawArray[i].text) : rawArray[i].text;
				this.mdArr.push(rawObj);
				rawObj = {};
			}
			if (i === rawArray.length - 1) {
				this.mdArr.push(rawObj);
			}
		}
	},

	//合并raw
	rawCombine: function (mdArr) {
		let start, end, raw = '', trans = '';
		mdArr.forEach(function (m) {
			start = start ? m.start - start > 0 ? start : m.start : m.start;
			end = end ? m.end - end > 0 ? m.end : end : m.end;
			raw += m.raw || '';
			trans += m.trans || '';
		});
		raw = this.isToHtml ? Markdown.toHTML(raw) : raw;
		return {start, end, raw, trans};
	}
}

export default MDParser;
