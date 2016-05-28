$(window).on('scroll.elasticity',function (e){
    e.preventDefault();
}).on('touchmove.elasticity',function(e){
        if (e.target.className !== "story") {
            e.preventDefault();
        }
    console.log(e.target);
});
//  去掉页面默认滚动

$(document).ready(() => {

    const [
            score,
            minute,
            second,
            mesc,
            rank,
            total
        ] = [
            localStorage.breakOut_score,
            localStorage.breakOut_minute,
            localStorage.breakOut_second,
            localStorage.breakOut_msec,
            localStorage.breakOut_rank,
            localStorage.breakOut_total
        ].map(item => {return parseInt(item)});
    /*
    *   因为 localStorage 存的是字符串
    *   然后就先转数字再赋值吧 hhh
    * */

    const $time = $("#time");
    const $title = $("#title");
    const $story = $("#story");
    const $btn_submit = $("#submit");
    const $btn_tel_back = $("#tel-back");
    const $btn_tel_submit = $("#tel-submit");
    const $cover = $("#cover");
    /*
    *   @params
    *       score: 当前关卡
    *       minute: 分钟数
    *       second: 秒数
    *       mesc: 毫秒
    *       $time: 显示秒数的 dom 元素
    *       $title: 显示当前关卡的 dom 元素
    * */

    $("#range").text(rank);
    /*
    *   显示排名
    * */


    function returnTimeStr (min, sec, mes) {
        let arr = [].map.call(arguments, item => {
            if (item < 10) {
                return '0' + item;
            } else {
                return '' + item;
            }
        });
        return arr.join(" : ");
    }
    // 以正确显示格式返回游戏时间

    function returnTitle (sco) {
        let text = ['冲破四道封锁线', '强渡乌江', '遵义会议', '四渡赤水', '巧渡金沙江', '强渡大渡河、飞夺泸定桥', '爬雪山、过草地', '突破腊子口', '胜利会师'];
        return text[sco];
    }

    function returnStory (sco) {
        let text = [
            '红军长征的第一步,首先是要冲破国民党军的四道封锁线。第一道封锁线：东南起于安远、信丰，西北迄止赣州、南康、大余间，以桃江为天然屏障，南北长约120公里，东西宽约50公里。第二道封锁线：止红军直下仁化县城，威胁韶关，保卫广东，而实施迫使红军尽快离开粤境的军事行动。第三道封锁线：设在粤汉铁路沿湘粤边湖南境内良田到宜章之间。第四道封锁线：第一步堵截红军于潇水以东地区，消灭在宁远天堂圩与道县之间；第二步前计不成，就阻击红军于湘江以东地区，消灭在湘江地带，这两步计划构成了第四道封锁线。',
            '1935 年 1 月 1日，中共中央在瓮安猴场作出重要决定：“建立川黔边新苏区根据地。首先以遵义为中心的黔北地区，然后向川南发展，是目前最中心的任务。”距离瓮安县城 45 公里的乌江江界河渡口是通往遵义的主要渡口，中央红军立即作出强渡乌江战斗的决定。1935 年 1 月 1 日，毛泽东、朱德、周恩来等率领中央红军，经过 3 天 3 夜的顽强战斗，强渡乌江，击败黔军，向遵义挺进。',
            '遵义会议是指 1935 年 1 月 15 日至 17 日，中共中央政治局在贵州遵义召开的独立自主地解决中国革命问题的一次极其重要的扩大会议。是在红军第五次反“围剿”失败和长征初期严重受挫的情况下，为了纠正王明“左”倾领导在军事指挥上的错误而召开的。这次会议是中国共产党第一次独立自主地运用马克思列宁主义基本原理解决自己的路线、方针政策的会议。这次会议开始确立实际以毛泽东为代表的马克思主义的正确路线在中共中央的领导地位，挽救了党、挽救了红军、挽救了革命，是中国共产党历史上一个生死攸关的转折点，标志着中国共产党从幼稚走向成熟。',
            '四渡赤水战役，中央红军在长征途中，进行的一次决定性运动战战役。一渡赤水，作势北渡长江却回师黔北；二渡赤水，红军回师向东，利用敌人判断红军将要北渡长江的错觉，5 天之内，取桐梓、夺娄山关、重占遵义城；三渡赤水，再入川南，待蒋介石向川南调集重兵之时，红军已从敌军间隙穿过；四渡赤水，南渡乌江，兵锋直指贵阳，趁坐镇贵阳的蒋介石急调滇军入黔之际，红军又入云南…… 1960 年，当来访的二战名将蒙哥马利赞誉毛泽东指挥的解放战争三大战役时，毛泽东说，四渡赤水才是他自己的得意之笔。',
            '1935 年 4 月 6 日，中央红军直逼贵阳，坐镇贵阳督战的蒋介石急调滇军入黔。而正当云南孙渡纵队急忙入黔救驾时，红军却反向穿插，乘虚进军云南。昆明告急，蒋介石从金沙江防线回撤 3 个团。滇西北金沙江沿线成了几乎不设防的地带。4 月 29 日，红军虚晃一枪绕过昆明，兵分三路，直扑金沙江。5 月 3 日，红军夺取皎平渡，靠着找到的7条小木船和当地 36 名各族船工顺利渡江，跳出了数十万敌军围追堵截的包围圈。',
            '1935 年 5 月 25 日至 29 日，中央红军两次上演长征路上最为精彩的经典之战：强渡大渡河和飞夺泸定桥。5 月 24 日夜，红军先头部队1团突然出现在大渡河安顺场渡口，并夺取 1 条木船。翌日 9 时，营长孙继先率领 17 勇士奇迹般强渡成功。然而，水急船少，红军无法迅速渡过。安顺场北 320 里外的泸定桥成了唯一通道。红 2 师 4 团于 5 月 29 日 6 时赶到泸定桥。此刻，泸定桥上只剩下 13 根铁索。16 时整，由连长廖大珠等 22 人组成的突击队，踩着摇晃的索链向对岸冲去，一个队员倒下了，后面的仍奋勇向前……至 19 时，红 4 团击溃川军，一举占领泸定城。',
            '在长征中，红一方面军先后翻越了夹金山、梦笔山等 5 座海拔 4000 米以上的雪山。红二方面军先后翻越了哈巴雪山(玉龙雪山)、大、小雪山、扎拉亚卡山等二十多座雪山。红四方面军是最早踏入雪山地区的部队，由于曾三次跋涉雪山草地，在雪线以上区域停留时间最长，累计翻越雪山超过 20 次。 红军过的草地属于高原湿地，为泥质沼泽。位于青藏高原与四川盆地的过渡地带，主要是指川西北若尔盖地区。 纵长 500 余里，横宽 300 余里，面积约 15200 平方公里，海拔在 3500 米以上。每年的 5 月至 9 月为草地雨季，使本已滞水泥泞的沼泽，更成漫漫泽国。红军正是在这个季节经过草地的。',
            '腊子口，是中央红军长征路上跨越的最后天险，周围群山耸立，峡道宽仅 8 米。腊子河从峡口奔涌而出，只有一座 1 米多宽的木桥可通行。山后，敌人 3 个团纵深部署，企图堵死红军北上之路。1935 年 9 月中国工农红军进入腊子口地区，通过正面强攻与攀登悬崖峭壁迂回包抄的战术，经过浴血奋战，一举攻破了鲁大昌部和邓秀廷部据险扼守的天险腊子口天险，打开了中央红军北上进入陕甘的通道。聂荣臻元帅曾对此评论说：“腊子口一战，北上的通道打开了。如果腊子口打不开，无论军事上、政治上，都会处于进退失据的境地。',
            '1934 年 10 月，第五次反“围剿”失败后，中央主力红军被迫实行战略大转移，退出中央根据地进行长征。长征是人类历史上的伟大奇迹，中央红军共进行了 380 余次战斗，攻占七百多座县城。其间共经过 11 个省，翻越 18 座大山，跨过 24 条大河，走过荒草地，翻过雪山，行程约二万五千里，于 1935 年 10 月到达陕北，与陕北红军胜利会师。1936 年 10 月，红二、四方面军到达甘肃会宁地区，同红一方面军会师。红军三大主力会师，标志着长征的胜利结束。'
        ];
        return text[sco];
    }
    function judgeBanner (sco) {
        if (sco === 8) {
            $("#banner").addClass('banner-win');
        }
    }
    /*
     *   returnTitle: 返回需要显示的 title
     *   returnStory: 返回需要显示的 story
     *   judgeBanner: 通关该 banner
     *
     *   暂时做的是 通关也是显示的最后一关的文字
     *   然后前三的文字颜色 class=best-three
     * */

    judgeBanner(score);

    $btn_submit.on('touchstart', () => {
        $cover.addClass("cover-show");
        $cover.height(window.innerHeight);
    });
    $btn_tel_back.on('touchstart', () => {
        $cover.removeClass("cover-show");
        $cover.height(window.innerHeight);
        setTimeout(() => {
            document.querySelector("#phone").setAttribute('placeholder', '请输入手机号参与比赛');
        }, 1000);
    });
    $cover.on('touchmove', (e) => {
        e.preventDefault();
    });
    /*
    *   改了一下逻辑 避免安卓机输入法弹起的时候显示问题
    * */
    $btn_tel_submit.on('touchstart', () => {
        /*
        *   正则判断手机号
        *   然后是提交啥的
        *   其实排序的时候就提交了数据
        *   然后这个是否提交就是看有没有参与资格?
        * */
        let text = $("#phone").val().trim();
        let reg = /^(13[0-9]|14[0-9]|15[0-9]|18[0-9])\d{8}$/i;
        let data = {};

        data = {
            'phone': text,
            'barrier': score,
            'use_time': total
        };
        /*
        *   然后需要发请求
        * */

        $("#phone").val("");

        if (reg.test(text)) {
            document.querySelector("#phone").setAttribute('placeholder', '提交中 请稍等');
            $.ajax({
                'url': 'http://hongyan.cqupt.edu.cn/puzzle/index.php/Home/BreakOut/submitScore',
                'data': JSON.stringify(data),
                'type': 'POST',
                success (data) {
                    if (data.code == 0) {
                        document.querySelector("#phone").setAttribute('placeholder', '成功 点击右上角分享到朋友圈');
                    } else {
                        document.querySelector("#phone").setAttribute('placeholder', '失败 点击右上角分享到朋友圈');
                    }
                },
                error (err) {
                    document.querySelector("#phone").setAttribute('placeholder', '失败 点击右上角分享到朋友圈');
                    console.log(err);
                }
            });
        } else {
            document.querySelector("#phone").setAttribute('placeholder', '请输入正确的手机号');
        }

    });


    $time.text(returnTimeStr(minute, second, mesc));
    $title.text('当前关卡：' + returnTitle(score));
    $story.text(returnStory(score));
});