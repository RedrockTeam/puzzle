$(window).on('scroll.elasticity',function (e){e.preventDefault();}).on('touchmove.elasticity',function(e){e.preventDefault();});
/* 禁掉 webview 的拖动 */

$(document).ready(() => {

    $(document).on('touchstart', e => e.preventDefault());

    if (window.innerHeight > 568) {
        document.querySelector("#canvas").height = window.innerHeight;
    }
    /* 如果屏幕比预设值高, 那么更改 canvas 的高度 */

    const winHeight = window.innerHeight;
    const $pause = $("#pause");
    $pause.on('touchstart', () => {
        /*
         *   暂停按钮有很多坑 233
         * */
    });

    const $gameBarrier = $("#game-barrier");
    const $gameTimer = $("#game-timer");

    let gameTimer = {
        minute: 0,
        second: 0,
        millisec: 0,
        run () {
            this.millisec += 5;
            if (this.millisec >= 100) {
                this.second++;
                this.millisec = 0;
            }
            if (this.second >= 60) {
                this.minute++;
                this.second = 0;
            }
        },
        getTime () {
            var str = '';

            if (this.minute < 10) {
                str += '0';
            }
            str += this.minute;
            str += " : ";
            if (this.second < 10) {
                str += '0';
            }
            str += this.second;
            str += " : ";
            if (this.millisec < 10) {
                str += '0';
            }
            str += this.millisec;

            return str;

        }
    };

    let controller = {
        timer: null,
        startTime: null,
        totalTime: 0,
        stopTimer () {
            window.clearInterval(this.timer);
        }
    };

    /*
     *   上面是关于游戏控制的一些奇怪东西
     *   下面是游戏 canvas 中运行的一些东西
     * */

    let pub = {
        canvas: document.querySelector("#canvas"),
        context: document.querySelector("#canvas").getContext("2d"),
        timer: null,
        run: false,
        isStart: false,
        touchTimer: null,
        currentLevel: 0,
        rolled: 0,
        renderBarrier: [0, 3],
        barrierHeightArr: [
            winHeight - 500 - 20,
            winHeight - 800 - 20,
            winHeight - 1200 - 20,
            winHeight - 1650 - 20,
            winHeight - 2050 - 20,
            winHeight - 2400 - 20,
            winHeight - 2700 - 20,
            winHeight - 3000 - 20
        ],
        judgeRenderArr: [
            [150, 510],
            [510, 800],
            [800, 1250],
            [1250, 1650],
            [1650, 2050],
            [2050, 3200]
        ],
        judgeRender () {
            let rolled = this.rolled;
            let currentStage = 0;
            let arr = this.judgeRenderArr;

            arr.forEach((item, index) => {
                if (item[0] <= rolled && item[1] >= rolled) {
                    currentStage = index + 1;
                }
            });

            this.renderBarrier = [currentStage, 3 + currentStage];
        },
        judgeLevel () {
            const reach = star.top;
            let arr = this.barrierHeightArr;
            let tempLevel = 0;

            arr.forEach((item, index) => {
                if (reach <= item) {
                    tempLevel = index + 1;
                }
            });

            if (tempLevel > this.currentLevel) {
                this.currentLevel = tempLevel;
                $gameBarrier.text(this.currentLevel);
            }
        },
        stopTimer () {
            window.clearInterval(this.timer);
        },
        gameOver () {

            let data = {};

            controller.totalTime += new Date() - controller.startTime;

            console.log("Total time is: " +
                parseInt(controller.totalTime/60000) +
                ":" + parseInt((controller.totalTime%60000)/1000) +
                ":" + parseInt(controller.totalTime%60000%1000/10));
            console.log("Current level: " + pub.currentLevel);

            this.stopTimer();
            console.log("Game over");

            localStorage.breakOut_score = pub.currentLevel;
            localStorage.breakOut_minute = parseInt(controller.totalTime/60000);
            localStorage.breakOut_second = parseInt((controller.totalTime%60000)/1000);
            localStorage.breakOut_msec = parseInt(controller.totalTime%60000%1000/10);
            localStorage.breakOut_total = parseInt(controller.totalTime);
            /*
             *   因为结果页面有跳转, 所以用 localStorage 暂存一下数据
             *   @params:
             *       localStorage.breakOut_minute: 分
             *       localStorage.breakOut_second: 秒
             *       localStorage.breakOut_msec: 毫秒
             * */

            data = {
                'barrier': pub.currentLevel,
                'use_time': controller.totalTime
            };

            $.ajax({
                'url': 'http://hongyan.cqupt.edu.cn/puzzle/index.php/Home/BreakOut/getRank',
                'data': data,
                'type': 'POST',
                success (data) {
                    localStorage.breakOut_rank = data.msg;
                },
                error (err) {
                    console.log("error");
                    console.log(err);
                }
            });

            window.location.href = './result.html';


            /*
             *   ajax 用来传分数
             *   currentLevel 0-8
             * */
        },
        isWin (star, finish) {
            if (star.top <= finish.top + finish.height - 30) {
                this.gameOver();
            }
        }
    };
    /*
     *   pub 伪全局对象
     *   @pub.timer 刷新 canvas 的 interval
     *   @pub.run 游戏是否正在运行
     *   @pub.isStart 是否已经开始了（防止开始之前暂停）
     *   @touchTimer 在整个屏幕没有开始刷新之前, 只对下面小手的区域地方刷新
     *   @currentLevel 记录关卡
     *   @judgeLevel 每次通过一个关卡就加 1
     *   @rolled 被卷去高度
     *   @renderBarrier 控制游戏需要渲染的关卡
     */

    class Stage {

        constructor () {
            this.context = pub.context;
            this.startX = 0;
            this.startY = 0;
            this.width = 320;
            this.height = document.querySelector("#canvas").height;
            this.upFlag = false;
            this.upPosLow = window.innerHeight / 2.5 ;
            /* canvas 只有一个, 构造的时候不用传参 */
        }

        refresh () {
            this.context.clearRect(this.startX, this.startY, this.width, this.height);
            /* 重绘整个舞台 */
        }

        up (starTop) {
            this.upFlag = (starTop < this.upPosLow);
            /* 判断星星位置,是否向上走 */

            if (this.upFlag) {
                this.context.translate(0, 2);
                this.upPosLow -= 2;
                this.startY -= 2;

                window.innerHeight -= 2;
                pub.rolled += 2;
            }
            /*
             *   @starTop 星星位于屏幕的高度
             *   如果达到向上条件整个屏幕向下拉 3px
             *   减去 window.innerHeight 为了方便判断星星是否跳出屏幕下方
             * */
        }

        run () {
            pub.timer = setInterval(() => {

                stage.refresh();

                if (pub.rolled < 2800) {
                    stage.up(star.getPos()[1]);
                }
                /*
                *   最后一关过了冲刺重点的时候画布就不动了
                * */

                star.getHighestPos();

                pub.judgeRender();

                for (let i = pub.renderBarrier[0]; i <= pub.renderBarrier[1]; i++) {
                    gameController[i].forEach(item => eval(item));
                    //gameController[i].forEach(item => {
                    //    item.func.apply(item.obj, item.args);
                    //});
                }

                /*
                 *   运行整个游戏
                 *   强行变成了 eval 23333
                 * */

                star.fall();

                pub.judgeLevel();

                //console.log(pub.rolled);
                //console.log(star.top);
                //console.log(pub.barrierHeightArr);
            }, 1000/60);

        }
    }
    /*
     *   class Stage
     *   运行整个游戏的舞台
     * */

    class Star {
        constructor (obj) {
            this.context = pub.context;

            this.top = obj.top;
            this.left = obj.left;
            this.width = obj.width;
            this.height = obj.height;
            this.img = obj.img;

            this.timer = null;
            this.exp = .1;
            //this.reachHeight = window.innerHeight - this.top;
        }

        paint () {
            this.context.drawImage(this.img, this.left, this.top);
        }

        jump () {
            this.exp = -3.5;
        }

        fall () {
            this.top += this.exp;
            this.exp += .2;
            /* 模拟匀加速直线运动相同时间内 1 3 5... */
            this.paint();
            this.isEnd();
        }

        isEnd () {
            if (this.top > window.innerHeight) {
                console.log("Fall down game over");
                pub.gameOver();
            }
        }
        /*
         *   isEnd
         *   判断是否掉落出屏幕外
         *   掉出去之后的动作待写
         * */

        getPos () {
            return [this.left + this.width / 2, this.top + this.height / 2];
        }
        /*
         *   getPos
         *   获取星星中心点的坐标 [x, y]
         * */

        collision (posY, status, range) {
            let selfY = this.getPos()[1];

            if (Math.abs(posY - selfY) < range && status) {
                console.log("collision");
                pub.gameOver();
            }
        }
        /*
         *   collision
         *   检测星星是否碰撞了
         *   然后这里面也有一些碰撞之后的动作, 待写
         * */

        getHighestPos () {
            const curHeight = this.getPos()[1];

            if (curHeight < this.reachHeight) {
                this.reachHeight = curHeight;
            }

            //console.log("this height: " + this.reachHeight);
        }
    }
    /*
     *   class Star
     *   很跳的小星星
     * */

    class Circle {
        constructor (obj) {
            this.context = pub.context;

            this.start = {
                x: obj.x,
                y: obj.y
            };

            this.width = obj.width;
            this.height = obj.height;
            this.img = obj.img;
            this.rotateDeg = obj.rotateDegree;
            this.initDegree = obj.rotateDegree;
            this.testPoint = {
                up: {
                    y: this.start.y + 10,
                    zone: obj.zoneUp,
                    status: true
                },
                down: {
                    y: this.start.y - 10 + this.height,
                    zone: obj.zoneDown,
                    status: true
                }
            };
            this.rotateSpeed = obj.rotateSpeed;
        }
        /*
         *   x, y 和上面星星的 top left 一个道理
         *   rotateDeg 已经旋转角度
         *   initDeg 初始旋转角度, 用在转了一圈之后重新开始转
         *   testPoint 上下检测碰撞的点 为啥 +10 -10 补上宽度的差
         *   zoneUp 和 zoneDown 传二维数组
         * */

        paint () {
            this.context.save();
            this.context.translate(this.start.x + .5 * this.width, this.start.y + .5 * this.height);
            this.context.rotate(this.rotateDeg);
            this.context.drawImage(this.img, -.5 * this.width, -.5 * this.height);
            this.context.restore();
        }

        rotate () {
            this.context.save();
            this.context.translate(this.start.x + .5 * this.width, this.start.y + .5 * this.height);
            this.context.rotate(this.rotateDeg);
            this.context.restore();
            /* 通过改变画布的相对位置来进行重绘 */

            this.rotateDeg += this.rotateSpeed;
            /* 单位时间转过弧度, 越大越快 */

            if(this.rotateDeg >= 2 * Math.PI + this.initDegree) {
                this.rotateDeg = this.initDegree;
            }
            /* 转了一圈之后重新转/判断 */

            // console.log(this.rotateDeg);

            let upCount = 0;
            let downCount = 0;

            this.testPoint.up.zone.map(item => upCount += (this.rotateDeg >= item[0] && this.rotateDeg <= item[1]));
            this.testPoint.down.zone.map(item => downCount += (this.rotateDeg >= item[0] && this.rotateDeg <= item[1]));

            this.testPoint.up.status = !(upCount > 0);
            this.testPoint.down.status = !(downCount > 0);
            /*
             *   upCount 判断圆上面的点是否在碰撞范围内
             *   downCount 判断圆下面的点是否在碰撞范围内
             * */

            this.paint();
        }
    }
    /*
     *   Circle
     *   圆形的障碍物的构造函数
     * */

    class Block {
        constructor (obj) {
            this.context = pub.context;

            this.left = obj.left;
            this.top = obj.top;
            this.width = obj.width;
            this.height = obj.height;
            this.img = obj.img;
            this.direction = obj.direction;
            this.speed = obj.speed;
            this.maxLeft = obj.maxLeft;
            this.maxRight = obj.maxRight;
            this.zone = obj.zone;
            /*
             *   top 方块左边距画布左边位置
             *   left 方块顶端距画布顶端位置
             *   direction 初始移动方向 true -> 向右移动
             *   zone 空隙区域
             * */

            this.testPoint = this.top + this.height/2;
            this.isClose = true;
            /* isClose 能否碰撞 */

        }

        paint () {
            this.context.drawImage(this.img, this.left, this.top);
        }

        move () {
            let center = this.left + this.width / 2;
            let count = 0;
            let speed = this.speed;
            /*
             *   center 图形的中心点
             *   count 判断碰撞的标记
             * */

            //this.context.clearRect(this.left, this.top, this.width, this.height);

            this.zone.map(item => count +=  (center >= item[0] && center <= item[1]));
            this.isClose = (count > 0);
            /* 判断是否能够碰撞 */

            if ((this.direction && center >= this.maxRight) || (!this.direction && center <= this.maxLeft)) {
                this.direction = !this.direction;
            }

            this.direction ? this.left += speed : this.left -= speed;
            /* 这里的 1 可以改变用来改变速度 越大越快 */

            this.paint();
        }
    }
    /*
     *   Block
     *   左右移动小方块的构造函数
     * */

    class Sign {
        constructor (obj) {
            this.context = pub.context;

            this.left = obj.left;
            this.top = obj.top;
            this.width = obj.width;
            this.height = obj.height;
            this.img = obj.img;

            this.scale = 1;
            this.flag = false;
        }

        paint () {
            this.context.drawImage(this.img, this.left, this.top);
        }

        blink () {

            if (this.scale >= 1.3) {
                this.flag = false;
            }
            if (this.scale <= 1) {
                this.flag = true;
            }
            this.flag ? this.scale += 0.005 :  this.scale -= 0.005;
            this.context.drawImage(this.img, this.left-(this.width * this.scale/2), this.top-(this.height * this.scale/2), this.width * this.scale, this.height * this.scale);

        }

        blinkErase () {
            this.context.clearRect(0, this.top - 40, window.innerWidth, window.innerHeight);
        }
        /* blinkErase 在游戏开始前的闪烁 */
    }
    /*
     *   class Sign
     *   标志的构造函数
     *   沿路的路标 下面的小手啥的
     * */

    function randomCircleSpeed () {
        let arr = [0.02, 0.025, 0.03, 0.035];
        let len = arr.length;

        return arr[Math.floor(Math.random()*len)];
    }
    function randomCircleSlowSpeed () {
        let arr = [0.01, 0.015, 0.02];
        let len = arr.length;

        return arr[Math.floor(Math.random()*len)];
    }
    function randomBlockSpeed () {
        let arr = [1.5, 1.6, 1.7, 1.7, 1.8, 2, 2.2, 2.3];
        let len = arr.length;

        return arr[Math.floor(Math.random()*len)];
    }
    /*
     *   @params:
     *       randomCircleSpeed: 随机返回圆形的旋转速度
     *       randomBlockSpeed: 随机返回方块的移动速度
     * */

    const stage = new Stage();
    const touch = new Sign({
        left: 167,
        top: winHeight - 70,
        width: 40,
        height: 60,
        img: document.querySelector("#img-touch")
    });
    const star = new Star({
        top: winHeight - 180,
        left: 145,
        width: 30,
        height: 30,
        img: document.querySelector("#img-star")

    });
    /*
     *   @params:
     *       winHeight: 屏幕可见区域的高度
     *       stage: 游戏运行的舞台
     *       touch: 闪动触摸提醒
     *       star: 星星
     * */
    const barrier_one_bl = new Block({
        left: 0,
        top: winHeight - 350,
        width: 80,
        height: 13,
        img: document.querySelector("#img-rope"),
        direction: true,
        speed: randomBlockSpeed() + .5,
        maxLeft: 40,
        maxRight: 120,
        zone: [[110, 120]]
    });
    const barrier_one_br = new Block({
        left: 240,
        top: winHeight - 350,
        width: 80,
        height: 13,
        img: document.querySelector("#img-rope"),
        direction: false,
        speed: barrier_one_bl.speed,
        maxLeft: 200,
        maxRight: 280,
        zone: [[200, 215]]
    });
    const barrier_one_tl = new Block({
        left: 0,
        top: winHeight - 500,
        width: 80,
        height: 13,
        img: document.querySelector("#img-rope"),
        direction: true,
        speed: 3,
        maxLeft: 40,
        maxRight: 120,
        zone: [[110, 120]]
    });
    const barrier_one_tr = new Block({
        left: 240,
        top: winHeight - 500,
        width: 80,
        height: 13,
        img: document.querySelector("#img-rope"),
        direction: false,
        speed: barrier_one_tl.speed,
        maxLeft: 200,
        maxRight: 280,
        zone: [[200, 215]]
    });
    const sign_one = new Sign({
        left: 115,
        top: winHeight - 425,
        width: 80,
        height: 13,
        img: document.querySelector("#img-title-1")
    });
    /*
     *   第一关: 冲破四道封锁线
     *   @params
     *       barrier_one_bl: 四个小块左下方一块 (bottom left)
     *       barrier_one_br: 四个小块右下方一块 (bottom right)
     *       barrier_one_tl: 四个小块左上方一块 (top left)
     *       barrier_one_tr: 四个小方块右上方一块 (top right)
     *       sign_one: 关卡标志
     * */
    const barrier_two_b = new Block({
        left: 0,
        top: winHeight - 650,
        width: 100,
        height: 18,
        img: document.querySelector("#img-water-1"),
        direction: true,
        speed: randomBlockSpeed(),
        maxLeft: 50,
        maxRight: 270,
        zone: [[110, 210]]
    });
    const barrier_two_t = new Block({
        left: 220,
        top: winHeight - 800,
        width: 100,
        height: 18,
        img: document.querySelector("#img-water-2"),
        direction: true,
        speed: barrier_two_b.speed,
        maxLeft: 50,
        maxRight: 270,
        zone: [[110, 210]]
    });
    const sign_two = new Sign({
        left: 130,
        top: winHeight - 725,
        width: 80,
        height: 13,
        img: document.querySelector("#img-title-2")
    });
    /*
     *   第二关: 强渡乌江
     *   @params:
     *       barrier_two_b: 下面一块 (bottom)
     *       barrier_two_t: 上面一块 (top)
     *       sign_two: 关卡标志
     * */
    const barrier_three = new Circle({
        x: 85,
        y: winHeight - 1200,
        width: 150,
        height: 150,
        img: document.querySelector("#img-circle-1"),
        rotateDegree: 0,
        rotateSpeed: randomCircleSpeed(),
        zoneUp: [[0.8, 2.4]],
        zoneDown: [[3.9, 5.5]]
    });
    const sign_three = new Sign({
        left: 130,
        top: winHeight - 1125,
        width: 80,
        height: 13,
        img: document.querySelector("#img-title-3")
    });
    /*
     *   第三关: 遵义会议
     *   @params
     *       barrier_three: 圆环 (中间一个缺口的)
     *       sign_three: 关卡标志
     * */
    const barrier_four = new Circle({
        x: 35,
        y: winHeight - 1650,
        width: 250,
        height: 250,
        img: document.querySelector("#img-circle-4"),
        rotateDegree: 0,
        rotateSpeed: randomCircleSlowSpeed(),
        zoneUp: [[0.5, 1], [2.1, 2.6], [3.7, 4.2], [5.1, 5.7]],
        zoneDown: [[0.5, 1], [2.1, 2.6], [3.6, 4.2], [5.1, 5.7]]
    });
    const sign_four = new Sign({
        left: 130,
        top: winHeight - 1525,
        width: 80,
        height: 13,
        img: document.querySelector("#img-title-4")
    });
    /*
     *   第四关: 四渡赤水
     *   @params
     *       barrier_four: 圆环 (中间四个缺口的)
     *       sign_four: 关卡标志
     * */
    const barrier_five = new Circle({
        x: 60,
        y: winHeight - 2050,
        width: 200,
        height: 200,
        img: document.querySelector("#img-circle-3"),
        rotateDegree: 0,
        rotateSpeed: randomCircleSpeed(),
        zoneUp: [[0.5, 1.6], [2.6, 3.7], [4.7, 5.7]],
        zoneDown: [[0, 0.5], [1.6, 2.6], [3.7, 4.7], [5.75, 7]]
    });
    const sign_five = new Sign({
        left: 120,
        top: winHeight - 1950,
        width: 80,
        height: 13,
        img: document.querySelector("#img-title-5")
    });
    /*
     *   第五关: 巧渡金沙江
     *   @params:
     *       barrier_five: 圆环 (中间三个缺口的)
     *       sign_five: 关卡标志
     * */
    const barrier_six = new Circle({
        x: 88,
        y: winHeight - 2400,
        width: 144,
        height: 200,
        img: document.querySelector("#img-circle-2"),
        rotateDegree: 0,
        rotateSpeed: randomCircleSpeed(),
        zoneUp: [[1.1, 3.1], [4.2, 6.2]],
        zoneDown: [[1.1, 3.1], [4.2, 6.2]]
    });
    const sign_six = new Sign({
        left: 85,
        top: winHeight - 2300,
        width: 100,
        height: 13,
        img: document.querySelector("#img-title-6")
    });
    /*
     *   第六关: 飞夺泸定桥 强渡大渡河
     *   @params:
     *       barrier_six: 圆环 (中间两个缺口的)
     *       sign_six: 关卡标志
     * */
    const barrier_seven_mountain = new Block({
        left: 220,
        top: winHeight - 2600,
        width: 100,
        height: 21,
        img: document.querySelector("#img-mountain"),
        direction: false,
        speed: 3,
        maxLeft: 50,
        maxRight: 270,
        zone: [[110, 210]]
    });
    const barrier_seven_grass = new Block({
        left: 0,
        top: winHeight - 2700,
        width: 100,
        height: 21,
        img: document.querySelector("#img-grass"),
        direction: true,
        speed: randomBlockSpeed() + .5,
        maxLeft: 50,
        maxRight: 270,
        zone: [[110, 210]]
    });
    const sign_seven = new Sign({
        left: 100,
        top: winHeight - 2650,
        width: 80,
        height: 13,
        img: document.querySelector("#img-title-7")
    });
    /*
     *   第七关: 爬雪山 过草地
     *   @params:
     *       barrier_seven_mountain: 雪山
     *       barrier_seven_grass: 草地
     *       sign_seven: 关卡标志
     * */
    const barrier_eight = new Circle({
        x: 85,
        y: winHeight - 3000,
        width: 150,
        height: 150,
        img: document.querySelector("#img-circle-1"),
        rotateDegree: 0,
        rotateSpeed: randomCircleSpeed() + .02,
        zoneUp: [[0.8, 2.4]],
        zoneDown: [[3.9, 5.5]]
    });
    const sign_eight = new Sign({
        left: 125,
        top: winHeight - 2925,
        width: 80,
        height: 13,
        img: document.querySelector("#img-title-8")
    });
    /*
     *   第八关: 突破腊子口
     *   @params:
     *       barrier_eight: 圆环 (中间一个缺口的)
     *       sign_eight: 关卡标志
     * */
    const sign_finish = new Sign({
        left: 110,
        top: winHeight - 3270,
        width: 100,
        height: 47,
        img: document.querySelector("#img-finish")
    });
    /*
     *   结束表示
     * */

    let gameController = [
        [
            'touch.blink()'
        ],

        [
            'barrier_one_bl.move()',
            'barrier_one_br.move()',
            'barrier_one_tr.move()',
            'barrier_one_tl.move()',
            'sign_one.paint()',
            'star.collision(barrier_one_bl.testPoint, barrier_one_bl.isClose, 10)',
            'star.collision(barrier_one_tl.testPoint, barrier_one_tl.isClose, 10)'
        ],

        [
            'barrier_two_b.move()',
            'barrier_two_t.move()',
            'sign_two.paint()',
            'star.collision(barrier_two_b.testPoint, barrier_two_b.isClose, 21)',
            'star.collision(barrier_two_t.testPoint, barrier_two_t.isClose, 21)'
        ],

        [
            'barrier_three.rotate()',
            'sign_three.paint()',
            'star.collision(barrier_three.testPoint.down.y, barrier_three.testPoint.down.status, 22)',
            'star.collision(barrier_three.testPoint.up.y, barrier_three.testPoint.up.status, 22)'
        ],

        [
            'barrier_four.rotate()',
            'sign_four.paint()',
            'star.collision(barrier_four.testPoint.down.y, barrier_four.testPoint.down.status, 20)',
            'star.collision(barrier_four.testPoint.up.y, barrier_four.testPoint.up.status, 20)'
        ],

        [
            'barrier_five.rotate()',
            'sign_five.paint()',
            'star.collision(barrier_five.testPoint.down.y, barrier_five.testPoint.down.status, 24)',
            'star.collision(barrier_five.testPoint.up.y, barrier_five.testPoint.up.status, 24)'
        ],

        [
            'barrier_six.rotate()',
            'sign_six.paint()',
            'star.collision(barrier_six.testPoint.down.y, barrier_six.testPoint.down.status, 20)',
            'star.collision(barrier_six.testPoint.up.y, barrier_six.testPoint.up.status, 20)'
        ],

        [
            'barrier_seven_mountain.move()',
            'barrier_seven_grass.move()',
            'sign_seven.paint()',
            'star.collision(barrier_seven_mountain.testPoint, barrier_seven_mountain.isClose, 18)',
            'star.collision(barrier_seven_grass.testPoint, barrier_seven_grass.isClose, 18)'
        ],

        [
            'barrier_eight.rotate()',
            'sign_eight.paint()',
            'star.collision(barrier_eight.testPoint.down.y, barrier_eight.testPoint.down.status, 20)',
            'star.collision(barrier_eight.testPoint.up.y, barrier_eight.testPoint.up.status, 20)'
        ],

        [
            'sign_finish.paint()',
            'pub.isWin(star, sign_finish)'
        ]
    ];
    /*
     *   gameController
     *   二维数组, 第一维的每个元素代表关卡
     *   整个游戏运行所依赖的函数, 运行的时候从这里面取来...eval
     *
     *   暂时没有想到更好的方法 使用 bind apply new Function 都会报错
     *   apply 会发生存的对象属性是深拷贝 不是动态的 的问题
     * */

    stage.refresh();

    window.setTimeout(() => {
        barrier_one_bl.paint();
        barrier_one_br.paint();
        barrier_one_tl.paint();
        barrier_one_tr.paint();
        sign_one.paint();
        barrier_two_b.paint();
        barrier_two_t.paint();
        sign_two.paint();
        star.paint();
    }, 200);

    pub.touchTimer = window.setInterval(function () {
        touch.blinkErase();
        touch.blink();
    }, 1000/60);

    /* 在 refresh 之后延时加载, 避免被擦掉, 只用画第一关, 其他的画了也看不到 */

    document.addEventListener('readystatechange', () => {
        if (document.readyState === "complete") {
            window.setTimeout(() => {
                $("#container").on("touchstart", function () {
                    if (pub.run === false) {
                        window.clearInterval(pub.touchTimer);
                        /* 不让那小手那一块儿闪了, 跟着整个画布一起刷新 */
                        controller.timer = window.setInterval(() => {
                            gameTimer.run();
                            $gameTimer.text(gameTimer.getTime());
                        }, 50);
                        /* 不是 canvas 部分的计时器 */
                        controller.startTime = new Date();
                        /* 真正的游戏计时器 */
                        $(document).on('touchstart', function () {
                            star.jump();
                        });
                        stage.run();
                        pub.run = true;
                        pub.isStart = true;
                    }
                });
            }, 1000);
        }
    });
    /*
     *   触发游戏开始的
     *   等资源加载完之后可以玩
     *   为了避免一开始的时候卡 然后就延时执行
     * */
    $("#pause").on('touchstart', () => {
        if (pub.run) {
            controller.totalTime += new Date() - controller.startTime;
            controller.startTime = null;

            pub.stopTimer();
            controller.stopTimer();
            $("#cover").addClass("cover-show");

            //console.log(controller.totalTime);
        }
    });
    $("#gohome").on('touchstart', () => {
        window.location.href = './index';
    });
    $("#share").on('touchstart', () => {
        $(".share-text").addClass("show");
    });
    $("#resume").on('touchstart', () => {
        $("#cover").removeClass("cover-show");
        setTimeout(() => {
            stage.run();
            controller.timer = window.setInterval(() => {
                gameTimer.run();
                $gameTimer.text(gameTimer.getTime());
            }, 50);
            controller.startTime = new Date();
        }, 1000);
    });
    /*
     *   暂停部分
     * */
});