# Vote App 开发文档

## HTTP 状态码

* 430 资源已存在

## API

### 创建投票

```
Method : POST
Path : /v1/votes
Request : 
{
	"name" : "vote_demo", //投票名称
	"anonymity" : false, //是否匿名投票
	"desc" : "An interesting vote.", //投票说明
	"candidate" : ["Tom","Dave"], //投票候选人 至少两名

}

{
	"_id" : "10000", //投票 id
	"name" : "vote", //投票名称
//	"image" : "http://456789.image", //投票 icon
	"anonymity" : "false", //是否匿名投票
	// "start_time" : "23456789", //投票开始时间
	// "end_time" : "3456789", //投票结束时间 
	"desc" : "A test vote.", //投票描述
	"candidate" : [ //候选人
	{
		"name" : "Tom", //候选人名称
		"desc" : "I am Tom.", //候选人描述
		"poll" : "2", //候选人获得票数
		"chooser" : ["122-224","21321-434"] //投票人 uuid 如果匿名投票该项为空

	},
	{
		"name" : "Dave",
		"desc" : "I am Dave.",
		"poll" : "1",
		"chooser" : ["53287"]
	}
	],
	"chooser"
}

