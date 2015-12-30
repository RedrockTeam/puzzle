	var rankImgPath  = 'Public/src/images/rank/',
		clockImgPath = 'Public/src/images/clock/',
		sliderImgPath = 'Public/src/images/slider/';

	var random, randomArray = [];
	
	// 游戏主程序
	var game = (function () {
		var	rankInfo,
			prevIndex, // 每次交换时选择的第一个滑块的索引
			trueCount, // 滑块在正确位置的数目
			spendTime, // 游戏总共耗时
			tempValue; // 临时变量

		var $container = $('.pic-container');
		// 载入游戏
		var init = function (isReplay, again) {

			if (!isReplay) { // 从主页进去
				layout.indexViewShow(isReplay);
			} else {
				if (!again) { // 从结果页面进入
					layout.indexViewShow(isReplay);
				} else {
					stop(again);
				}
			}
			// 修正滑块容器位置
			layout.sliderContainerFix();
			// 随机分布滑块 
			layout.sliderRandomSort();
			// 计时器开始计时
			clock.start();
		};

		// 开始游戏
		var play = function (isReplay, again) {
			init(isReplay, again);
			$container.on('click', '.one-pic', function () {
				layout.sliderSelect(this);
				var nextIndex = $(this).find('img').data('index');
				if (prevIndex === undefined || prevIndex === nextIndex) {
					prevIndex === nextIndex ? _prevIndexChange(nextIndex, true) : _prevIndexChange(nextIndex);
				} else {
					// 如果游戏结束,调用stop方法
					if (_sliderExchange(prevIndex, nextIndex)) {
						stop();
					} else {
						prevIndex = undefined;
					}
				}
			});
		};

		// 结束游戏
		var stop = function (again) {
			// 计时器停止
			spendTime = clock.stop();
			$.each($('.one-pic'), function (index, element) {
				$(element).removeClass('selectedSlider').addClass('unselectSlider');
			});
			if (spendTime) {
				// 数据回收
				randomArray = [];
				prevIndex = undefined;
				$container.off('click', '.one-pic');
			}
			if (!again) {
				var data = {
					spendTime: spendTime,
					openid: $('html').data('openid')
				};
				util.getRankInfo('index.php?s=/Home/Index/getRank', data, function (response) {
					if (response.status === 200) {
						// 显示结果页面
						layout.resultViewShow(spendTime, response.data);
						util.setCookie('rank', response.number);
					} else {
						alert('你的网络有问题, 刚刚的成绩未生效!');
					}
				});
			}
		};

		// 交换滑块位置
		var _sliderExchange = function (prevIndex, thisIndex) {
			$('.one-pic').eq(thisIndex).find('img').attr({
				src: sliderImgPath + randomArray[prevIndex] + '.png'
			}).parent().removeClass('selectedSlider').addClass('unselectSlider');

			$('.one-pic').eq(prevIndex).find('img').attr({
				src: sliderImgPath + randomArray[thisIndex] + '.png'
			}).parent().addClass('unselectSlider').removeClass('selectedSlider');

			// 交换两个滑块在数组中的值
			tempValue = randomArray[prevIndex];
			randomArray[prevIndex] = randomArray[thisIndex];
			randomArray[thisIndex] = tempValue;
			tempValue = undefined;

			if (_gameOverCheck(randomArray)) {
				// 游戏结束
				return true;
			} else {
				// 游戏继续
				return false;
			}
		};

		// 改变选中的滑块索引
		// isSelf表示两次点击的为同一个滑块
		var _prevIndexChange = function (nextIndex, isSelf) {
			if (isSelf) {
				// 如果两次点击了一个滑块则重置索引
				prevIndex = undefined;
			} else {
				prevIndex = nextIndex;
			}
		};

		// 判断游戏时候结束
		var _gameOverCheck = function (randomArray) {
			trueCount = 0;
			for (var i = 0; i <= randomArray.length - 1; i++) {
				if (randomArray[i] - i != 1) {
					trueCount++;
					break;
				}
			}
			if (trueCount > 0) {
				// 游戏继续
				return false;
			} else {
				// 游戏结束
				return true;
			}
		};

		return {
			play: play
		};
	})();


		// 页面布局
	var layout = (function () {
		var start = $('#start'),
			index = $('#index'),
			result = $('#result');

		var totalSecond,    // 总过所花时间的秒数
			rankInfoImg,    // 排名数字图片
			spendTimeImg;   // 耗时数字图片

		// 内部函数
		var	_rankInfoShow,
			_spendTimeShow;

		// 滑块容器的百分比定位
		var	position = {
			top: 80 / 1136,
			bottom: 79 /1136,
			left: 136 / 640,
			right: 63 / 640
		};

		// 所有滑块
		var $sliderImgArray = $('.one-pic');

		// 选择滑块时的动画
		var sliderSelect = function (that) {
			$(that).removeClass('unselectSlider');
			if ($(that).hasClass('selectedSlider')) {
				$(that).addClass('unselectSlider').removeClass('selectedSlider');
				setTimeout(function () {
					$(that).removeClass('unselectSlider');
				}, 200);
			} else {
				$(that).addClass('selectedSlider');
			}
		};

			
		// 修订容器位置
		var sliderContainerFix = function () {
			$('.pic-container').css({
				height: ((1 - position.top - position.bottom) * 100) + '%',
				width: ((1 - position.left - position.right) * 100) + '%',
				position: 'absolute',
				top: position.top * 100 + '%',
				left: position.left * 100 + '%'
			});
		};

		// 随机排列滑块
		var sliderRandomSort = function () {
			$('.one-pic').css({
				float: 'left',
				height: ($('.pic-container').height()) / 4,
				width: ($('.pic-container').width() - 1) / 3
			});
			
			$.each($sliderImgArray, function (index, item) {
				$(item).find('img').attr({
					src: sliderImgPath + util.randomGenerate() + '.png'
				}).data('index', index);
			});
		};

		// 显示游戏主界面
		var indexViewShow = function (isReplay) {
			if (!isReplay) {
				// 开始游戏, 从主页切换过去
				start.addClass('animated bounceOutDown').css('display', 'none');
				index.css('display', 'block').addClass('animated bounceInDown');
			} else {
				// 再玩一次, 从结果页切换过去
				index.css('display', 'block').removeClass('flipOutX').addClass('bounceInRight');
				result.removeClass('flipInX').addClass('bounceOutLeft').css('display', 'none');
			}
		};

		// 显示结果页面
		var resultViewShow = function (spendTime, rankInfo) {
			index.removeClass('bounceInDown').addClass('flipOutX').css('display', 'none');
			_rankInfoShow(rankInfo);
			_spendTimeShow(spendTime);
			result.css('display', 'block').addClass('animated flipInX');
		};

		// 结果页面排名显示
		_rankInfoShow = function (rankInfo) {
			rankInfoImg = $('.rank-info img');
			for (var i = rankInfo.length - 1; i >= 0; i--) {
				rankInfoImg.eq(i).attr('src', rankImgPath + rankInfo[i] + '.png').css('display', 'block');
			}
		};

		// 结果页面耗时显示
		_spendTimeShow = function (spendTime) {
			// 总耗时
			totalSecond = (spendTime.kilobit * 10 + spendTime.hundreds) * 60 + spendTime.decade * 10 + spendTime.theUnit;
			// 字符串倒序
			totalSecond = String(totalSecond).split("").reverse().join("");
			spendTimeImg = $('.spend-time img');
			for (var i = totalSecond.length - 1; i >= 0; i--) {
				spendTimeImg.eq(i).attr('src', rankImgPath + totalSecond[i] + '.png').css('display', 'block');
			}
		};

		return {
			sliderSelect: sliderSelect,
			indexViewShow: indexViewShow,
			resultViewShow: resultViewShow,
			sliderRandomSort: sliderRandomSort,
			sliderContainerFix: sliderContainerFix
		};
	})();


	// 计时器
	var clock = (function () {
		// 计时器
		var timer;
		// 游戏计时器指针
		var clockHand = {
			theUnit: 0, // 个位
			decade: 0,  // 十位
			hundreds: 0,// 百位
			kilobit: 0  // 千位
		};
		var $container = $('.time-counter-container');

		// 游戏计时器
		var timeCounterStart = function () {
			_timeCounterShow();
			timer = setInterval(function () {
				if (clockHand.theUnit === 9) {
					// 个位置零
					clockHand.theUnit = 0;
					_timerCounterImgChange(0);
					if (clockHand.decade === 5) {
						// 十位置零
						clockHand.decade = 0;
						_timerCounterImgChange(1);
						if (clockHand.hundreds === 9) {
							// 百位置零
							clockHand.hundreds = 0;
							_timerCounterImgChange(3);
							if (clockHand.kilobit === 5) {
								_timerCounterImgChange(4, 6);
								timeCounterStop(true);
							} else {
								_timerCounterImgChange(4, ++clockHand.kilobit);
							}
						} else {
							_timerCounterImgChange(3, ++clockHand.hundreds);
						}
					} else {
						_timerCounterImgChange(1, ++clockHand.decade);
					}
				} else {
					_timerCounterImgChange(0, ++clockHand.theUnit);
				}
			}, 1001);
		};

		var timeCounterStop = function (flag) {
			clearInterval(timer);
			tempClockHand = clockHand;
			clockHand = {
				theUnit: 0, // 个位
				decade: 0,  // 十位
				hundreds: 0,// 百位
				kilobit: 0  // 千位
			};
			if (flag) {
				alert('时间到了!');
				location.reload();
			}
			return tempClockHand;
		};

		// 显示计时器
		var _timeCounterShow = function () {
			$container.css({
				display: 'block'
			}).addClass('animated shake').removeClass('animated shake');
			$.each($container.find('img'), function (index, item) {
				if (index != 2){
					$(item).attr('src', clockImgPath + '0.png');
				}
			});
		};

		// 改变计时器的图片
		var _timerCounterImgChange = function (index, number) {
			!number ? number = 0 : number = number;
			$container.find('img').eq(index).attr({
				src: clockImgPath + number + '.png'
			}).addClass('animated fadeInLeft');
		};

		return {
			start: timeCounterStart,
			stop: timeCounterStop
		};
	})();

	// 工具函数
	var util = (function () {
		
		// 随机位置生成
		var randomGenerate = function () {
			random = Math.floor(Math.random() * 12 + 1);
			if ($.inArray(random, randomArray) == -1) {
				randomArray.push(random);
				return random;
			} else {
				return randomGenerate();
			}
		};

		// 得到排名信息
		var getRankInfo = function (url, data, success) {
			$.ajax({
				url: url,
				type: 'POST',
				data: data,
				dataType: 'json',
				success: success,
				error: function (xhr, type) {
					alert('网络错误, 请重试!');
				}
			});
		};

		// 设置cookie
		var setCookie = function (name, value) {
			document.cookie = name + "=" + escape(value);
		};

		// 获取cookie
		var getCookie = function (name) {
			if (document.cookie.length > 0) {
		  		start = document.cookie.indexOf(name + "=");
		  		if (start != -1) {
		    		start = start + name.length + 1;
		    		end = document.cookie.indexOf(";", start);
		    		if (end == -1)  {
		    			end = document.cookie.length;
		    		}
		    		return unescape(document.cookie.substring(start,end));
		  		}
				return undefined;
			}
		};

		var delCookie = function (name) {
			var exp = new Date();
			exp.setTime(exp.getTime() - 1);
			var cval = getCookie(name);
			if(cval != null) {
				document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
			}
		};

		return {
			setCookie: setCookie,
			getCookie: getCookie,
			delCookie: delCookie,
			getRankInfo: getRankInfo,
			randomGenerate: randomGenerate
		};
	})();

