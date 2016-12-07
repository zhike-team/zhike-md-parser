# 解析自定义标签为格式化数据

markdown自定义标签及规则参考产品整理的文件

## Demo

```js

const MDParser = require('zhikemd-parser');
const mdParser = new MDParser({cdnCommon: '//xxx.xxx.com'});
let str = '{{paragraph}}\n{{time}}0.34/5.17{{end}}\n{{raw}}__You will hear a tutor and a student{{end}}'
 + '{{raw}}__You will hear a tutor and a student{{end}}{{trans}}{{end}}{{raw}}__You will hear a tutor and a student{{end}}{{end}}';
let mdArray = mdParser.parse(str, true, true);

```

## result 
```json
[ { start: 0.34,
    end: 5.17,
    raw: '__You will hear a tutor and a student',
    trans: '' } ]

```

```
test in browser 
cd zhikemd-parser 
npm i 
node test/server
localhost:8888/browser.html
```
## api

### 1.MDParser(opts)
#### params 

+ cdnCommon e: {cdnCommon: 'http:xxx.xxx.com'} (如果md中有img标签,cdnCommon为图片cdn前缀地址)


### 2.mdParser.parse(mdStr, isCombine, toHtml);

#### params

+ mdStr md的字符串   string
+ isCombine 是否合并  boolean
+ toHtml 是否转为html boolean 





