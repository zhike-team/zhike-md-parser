# 解析自定义标签为格式化数据

markdown自定义标签及规则参考产品整理的文件

## Demo

```js

const MDParser = require('zhikemd-parser');
const mdParser = new MDParser();
let str = '{{paragraph}}\n{{time}}0.34/5.17{{end}}\n{{raw}}__You will hear a tutor and a student{{end}}{{trans}}{{end}}{{end}}';
let mdArray = mdParser.parse(str);

```

## result 
```json
[ { start: 0.34,
    end: 5.17,
    raw: '__You will hear a tutor and a student',
    trans: '' } ]

```
