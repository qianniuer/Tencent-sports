~function (pro) {
    /*
     * '2017-1-12 17:10:3' => '2017年01月12日 17时10分03秒'
     *                     => '01-12 17:10'
     */
    function myFormatTime(template) {
        template = template || '{0}年{1}月{2}日 {3}时{4}分{5}秒';
        var _this = this,
            ary = _this.match(/\d+/g);
        //console.log(ary);//->["2017", "1", "12", "17", "10", "3"]
        template = template.replace(/\{(\d)\}/g, function () {
            /*var n = arguments[1],
             val = ary[n] || '00';
             val.length < 2 ? val = '0' + val : null;
             return val;*/
            return (ary[arguments[1]] || '00').length < 2 ? '0' + ary[arguments[1]] : ary[arguments[1]];
        });
        return template;
    }

    pro.myFormatTime = myFormatTime;
}(String.prototype);


/*计算main区域及子元素的高度
 * ->main高度
 * ->menu nav 高度
 * */
/*jQuery中常用方法：
 * children:在所有子元素中进行查找
 * find:在所有后代元素中进行查找
 * filter:首先获取一个集合，在集合中进行二次筛选，同级查找*/
~(function () {
    var $header = $('.header'),
        $main = $(".main"),
        $menuNav = $main.children('.menuNav');

    function fn() {
        var winH = $(window).innerHeight(),
            headerH = $header.outerHeight(),
            resultH = winH - headerH - 40;//40是margin值
        $main.css('height', resultH);
        $menuNav.css('height', resultH - 2);
    }

    fn();
    $(window).on('resize', fn);//当浏览器窗口大小发生改变，触发resize事件
})();

/*menuNav区域的操作：使用最简单的设计模式--单例模式*/
/*基于惰性思想的高级单例模式  实现区域局部滚动*/

var menuRender = (function () {
    //先把需要操作的元素获取到
    var $menuNav = $('.menuNav'),
        $link = $menuNav.find('a'),
    //exampleIs:一个实例
        exampleIs = null;

    /*利用单例模式--命令模式*/
    //completeScroll:实现区域局部滚动
    function completeScroll() {
        exampleIs = new IScroll('.menuNav', {
            scrollbars: true,//显示滚东条
            fadeScrollbars: true,//操控的时候，滚动条显示，反之，隐藏
            mouseWheel: true,//开启鼠标滚轮的操控
            bounce: false,//禁止到达边界的反弹效果，默认的是true
            uesTransform: true//开始transform滚动，默认是开启的，false禁止
        });
    }

    //specificLocation:根据hash值定位到具体某个位置
    function specificLocation() {
        var nowUrl = window.location.href,
            hash = nowUrl.substr(nowUrl.lastIndexOf('#'));//获取hash
        //在所有a中，找到对应hash值对应相同的那项，找不到的话，选中第一个a
        var $tar = $link.filter('[href="' + hash + '"]');
        $tar.length === 0 ? $tar = $link.eq(0) : null;
        $tar.addClass('bg');
        exampleIs.scrollToElement($tar[0], 300);

        //控制右侧日历展示不同信息
        calendarRender.init($tar.attr('data-id'));
    }

    //bindEvent:给所有a绑定点击事件
    function bindEvent() {
        $link.on('click', function () {
            //点击的是谁，让谁有选中的样式，其余的移除选中样式
            //JQ链式查找：$(this).addClass('bg').parent().siblings().children('a');.removeClass('bg');
            var _this = this;
            $link.each(function (index, item) {
                item === _this ? $(item).addClass('bg') : $(item).removeClass('bg');

            });

            //控制右侧日历展示不同信息
            calendarRender.init($(_this).attr('data-id'));
        });
    }

    return {
        /*思路：1、实现局部滚动
         *      2、根据当前的hash值定位到具体的a标签
         *      3、给所有的a标签绑定点击事件*/
        init: function () {
            completeScroll();
            specificLocation();
            bindEvent();
        }
    }
})();

/*CALENDAR区域的操作*/
var calendarRender = (function () {
    var $calendarPlan = $.Callbacks();//创建一个计划表（或者是一个函数集合），
    // 然后使用add/remove方法向计划表中增加方法和移除方法，使用fire方法通知这些方法执行
    var $calendar = $('.calendar'),
        $wrapper = $calendar.find('.wrapper'),
        $btn = $calendar.find(".btn"),
        $link = null;
    var maxL = 0, minL = 0;

    //1 数据绑定
    $calendarPlan.add(function (today, data,columnId) {
        var str = '';
        //data-time:设置一个自定义属性储存代表的时间，
        //以后点击这个a如果需要使用时间，直接从自定义属性上获取即可
        $.each(data, function (index, item) {
            str += '<li><a href="javascript:;" data-time="' + item.date + '">';
            str += '<span class="week">' + item.weekday + '</span>';
            str += '<span class="date">' + item.date.myFormatTime('{1}-{2}') + '</span>';
            str += '</a></li>';
        });
        $wrapper.html(str).css('width', data.length * 110);
        //数据绑定完成之后，获取所有的a
        $link = $wrapper.find('a');
        minL = -(data.length - 7) * 110;
    });
    //2 定位到今天日期
    $calendarPlan.add(function (today, data,columnId) {
        /*
         * 1 在所有的a中筛选和今天日期相匹配的一项，但是不一定能获取到，
         *   例如：今天日期没有比赛，在a中没有今天日期
         * 2 找到今天日期往后最靠近的那一项作为展示(展示在七个中间即可):
         *   循环所有的a标签获取每一个a代表的日期，和今天的进行比较，直到遇到比今天大的，就是我们要找的
         * 3 上面操作完，如果发现一个比today大的都没有，直接选中最后一个a即可
         * 4 让当前选中的a在中间展示
         * */
        var $tar = $link.filter('[data-time="' + today + '"]');
        if ($tar.length === 0) {
            $link.each(function (index, item) {
                var todayTime = today.replace(/-/g, '');
                var itemTime = $(item).attr('data-time');
                itemTime = itemTime.replace(/-/g, '');
                if (itemTime > todayTime) {
                    $tar = $(item);
                    return false;//结束each循环
                }

            });
        }
        if ($tar.length === 0) {
            $tar = $link.eq($link.length - 1);
        }
        var index = $tar.parent().index(),
            curL = -index * 110 + 330;
        curL = curL > maxL ? maxL : (curL < minL ? minL : curL);
        $wrapper.addClass('bg');
        $wrapper.css('left', curL);

        //->控制MATCH区域的数据
        var starIndex = Math.abs(curL) / 110,
            endIndex = starIndex + 6,
            startTime = $link.eq(starIndex).attr('data-time'),
            endTime = $link.eq(endIndex).attr('data-time');
        matchRender.init(columnId, startTime, endTime);
    });
    //左右切换
    $calendarPlan.add(function (today, data,columnId) {
        $btn.on('click', function () {
            var curL = parseFloat($wrapper.css('left'));
            if (curL % 110 !== 0) {
                curL = Math.round(curL / 110) * 110;
            }
            $(this).hasClass("btnLeft") ? curL += 770 : curL -= 770;
            curL = curL > maxL ? maxL : (curL < minL ? minL : curL);
            $wrapper.stop().animate({left:curL},300,function(){
               var starIndex= Math.abs(curL)/110;
                $link.eq(starIndex).addClass('bg').parent().siblings().children('a').removeClass('bg');

                //->控制MATCH区域的数据
                matchRender.init(columnId);
            });
        });
    });
    return {
        init: function (columnId) {
            /*
             columnId：赛事类型ID，不同赛事有不同的且唯一的ID，
             例如：NBA：100000，CBA：100008..我们每一次获取数据都是把传递进来的ID发送给服务器
             * 1 从服务器上获取数据,然后解析成我们需要的
             * 2 绑定数据，展示在页面中
             * 3 定位到今天日期的位置
             * 4 实现左右切换
             * 5 给每一项绑定点击事件
             * */
            $.ajax({
                url: 'http://matchweb.sports.qq.com/kbs/calendar?columnId=' + columnId,
                type: 'get',
                dataType: 'jsonp',
                success: function (result) {
                    //获取数据
                    if (result && result.code == 0) {
                        result = result.data;
                        //数据获取和数据解析
                        var today = result.today,
                            data = result.data;
                        //数据获取成功后，通知计划表中的方法执行即可
                        $calendarPlan.fire(today, data,columnId);

                    }
                }
            });
        }
    }
})();
/*
 * MATCH区域的操作
 */
var matchRender = (function () {
    return {
        init: function (columnId, startTime, endTime) {
            //->http://matchweb.sports.qq.com/kbs/list?columnId=100000&startTime=2017-01-09&endTime=2017-01-15
        }
    }
})();

menuRender.init();