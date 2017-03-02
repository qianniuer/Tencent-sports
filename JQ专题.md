  jQuery中常用方法：
* children:在所有子元素中进行查找
* find:在所有后代元素中进行查找
* filter:首先获取一个集合，在集合中进行二次筛选，同级查找





JQ盒子模型的方法：
height():快捷获取高度
width():快捷获取宽度
$(window).height();
$(window).innerHeight;->JS:clientHeight
$(window).outerHeight;->JS:offsetHeight
offset();获取当前元素距离body的左偏移和上偏移-->{top:xxx,left:xxx}
document.documentElement.clientHeight||document.body.clientHeight;


JQ选择器获取的结果都是类数组(JQ对象)，如果没有获取到指定的元素他也是一个空集合，判断是否存在的时候，要通过判断length是否为0
JQ中获取集合中的某一项：
$link[0] / $link.get[0]: 获取的结果是JS对象
$link.eq[0]: 获取的结果是JQ对象


==============================================
同源/非同源(跨域)
当前页面的URL地址(浏览器地址栏中找到)
请求数据的接口地址(后台在API文档中规定的获取数据地址)

三个维度：协议、域名、端口号
对比两个地址的三个维度是否相同。若都相同，属于同源请求，可以使用ajax技术；
只要有一个不一样，属于跨域数据请求，需要使用非同源策略，常使用JSONP

            $.ajax({
                url:'http://matchweb.sports.qq.com/kbs/calendar?columnId=100000',
                type:'get',
                dataType:'jsonp',
                success:function(result){
                    console.log(result);
                }
            });
 这就是ajax请求，但是如果把dataType:'jsonp',此时就变为jsonp数据请求了

发布订阅：
创建一个计划
列出需要执行的方法
发布



















任务：高程3  最后一章  惰性思想单利模式