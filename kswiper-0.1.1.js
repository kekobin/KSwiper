/**
**author: kekobin@163.com
**A custom swiper
**version: 0.1.1
**添加简单的内部$()，并且将功能使用这种jquery语法进行重构，为后续扩展提供便利
**/

;(function() {
	var KSwiper = function KSwiper(element, options) {//element可以是id、class、DOM或者标签element
		if(!element) return;
		var _this = this;
		this.opts = options;
		this.speed = options.speed || 100;
		this.index = 0;//默认开始的索引
		this.callback = options.callback;

		this.$container = $(element);

		if(this.$container.length == 0) return;

		//如果是多个对象，则初始化多个KSwiper实例返回.
		if(this.$container.length > 1) {
			var swipers = [];

			this.$container.each(function() {
				swipers.push(new KSwiper(this, options));
			});

			return swipers;
		}

		this.$element = this.$container.children();

		this.init();
	};

	KSwiper.prototype.init = function() {
		this.$slides = this.$element.children();
		this.length = this.$slides.length;
		this.width = this.$container.width();
		//设置包裹元素的宽
		this.$element.css('width', this.width * this.length + 'px');

		//设置slide item的样式
		var index = this.length;
		while(index--) {
			var slide = this.$slides[index];

			$(slide).css({
				'width': this.width + 'px',
				'height': '100%',
				'display': 'table-cell'
			});
		}

		this.initEvent();
	};

	KSwiper.prototype.initEvent = function() {
		this.$element.on('touchstart touchmove touchend webkitTransitionEnd msTransitionEnd'+
		+' msTransitionEnd oTransitionEnd transitionEnd', this.handleEvent.bind(this));
	};

	KSwiper.prototype.handleEvent = function(event) {
		var type = event.type;

		switch(type) {
			case 'touchstart': 
				this.onTouchStart(event);
				break;
			case 'touchmove': 
				this.onTouchMove(event);
				break;
			case 'touchend': 
				this.onTouchEnd(event);
				break;
			case 'webkitTransitionEnd':
			case 'msTransitionEnd':
			case 'oTransitionEnd':
			case 'transitionEnd':
				this.transitionEnd(event);
				break;
		}
	};

	KSwiper.prototype.onTouchStart = function(e) {
		var touch = e.touches[0];

		this.start = {
			pageX: touch.pageX,
			pageY: touch.pageY,
			time: Number(new Date())
		};

		//设置滑动的标识(主要从性能上考虑)
		this.isScrolling = undefined;

		//在每次滑动触发的开始设置element的动画的持续时间设为0
		this.$element.css({
			'webkitTransitionDuration': 0 + 'ms',
			'MozTransitionDuration': 0 + 'ms',
			'msTransitionDuration': 0 + 'ms',
			'OTransitionDuration': 0 + 'ms',
			'transitionDuration': 0 + 'ms'
		});
	};	

	KSwiper.prototype.onTouchMove = function(e) {
		if(e.touches.length > 1) return;//多指操作不认为是swipe操作
		var touch = e.touches[0];

		this.delta = {
			x: touch.pageX - this.start.pageX,
			y: touch.pageY - this.start.pageY
		};

		if(typeof this.isScrolling == 'undefined') {
			this.isScrolling = Math.abs(this.delta.x) > Math.abs(this.delta.y);//x轴的偏移大于y轴偏于才认为是正常滑动
		}

		if(this.isScrolling) {
			var duration = this.speed;

			this.$element.css({
				'MozTransform': 'translate3d(' + (this.delta.x - this.index * this.width) + 'px, 0, 0)',
				'webkitTransform': 'translate3d(' + (this.delta.x - this.index * this.width) + 'px, 0, 0)',
				'msTransform': 'translateX(' + (this.delta.x - this.index * this.width) + 'px)',
				'OTransform': 'translateX(' + (this.delta.x - this.index * this.width) + 'px)'
			});
		}
	};

	//在滑动结束的时候计算出当前滑动到的索引index，然后滑动到对应索引item.
	//滑动item宽度的1/6(已经足够灵敏了)即认为是有效的滑动到下一个了,否则依然是当前index.
	KSwiper.prototype.onTouchEnd = function(e) {
		if(this.delta.x > 0 && this.delta.x > this.width / 6) {
			this.index -= 1;
			if(this.index < 0) this.index = 0;
		}

		if(this.delta.x < 0 && Math.abs(this.delta.x) > this.width / 6) {
			this.index += 1;
			if(this.index == this.length) this.index = this.length - 1;
		}

		if(this.isScrolling) this.slideTo(this.index);
	};

	KSwiper.prototype.slideTo = function(index, duration) {
		duration = duration || this.speed;

		var gap = index % this.length;

		if(index >= this.length) index = gap;
		if(index < 0) index = this.length + gap - 1;
		
		this.index = index;
		
		this.$element.css({
			'webkitTransitionDuration': duration + 'ms',
			'MozTransitionDuration': duration + 'ms',
			'msTransitionDuration': duration + 'ms',
			'OTransitionDuration': duration + 'ms',
			'transitionDuration': duration + 'ms',

			'MozTransform': 'translate3d(' + -(index * this.width) + 'px, 0, 0)',
			'webkitTransform': 'translate3d(' + -(index * this.width) + 'px, 0, 0)',
			'msTransform': 'translateX(' + -(index * this.width) + 'px)',
			'OTransform': 'translateX(' + -(index * this.width) + 'px)'
		});
	};

	KSwiper.prototype.transitionEnd = function(e) {
		this.callback && this.callback.call(this,this.index);
	};

	/*===========================
	Simple dom query func.
	===========================*/
	function DOM(arr) {
		if(!arr || arr.length == 0) return;
		for(var i=0;i<arr.length;i++) {
			this[i] = arr[i];
		}

		this.length = arr.length;

		return this;
	}

    function $(selector, context) {
    	if(selector && ! context) {
    		if(selector instanceof DOM) {
    			return selector;
    		}
    	}

    	var elems = [];

    	//string
    	if(typeof selector === 'string') {
    		if(/^#(.*)$/.test(selector)) {
	    		elems = [(context || document).getElementById(RegExp.$1)];
	    	} else if(/^\.(.*)$/.test(selector)) {
	    		elems = (context || document).getElementsByClassName(RegExp.$1);
	    	} else {
	    		elems = (context || document).querySeletorAll(selector);
	    	}
    	}
    	//node/element
    	else if(selector.nodeType || selector === window || selector === document) {
    		elems.push(selector);
    	}

    	return new DOM(elems);
    }

    $.prototype = DOM.prototype;

    DOM.prototype = {
    	each: function (callback) {
            for (var i = 0; i < this.length; i++) {
                callback.call(this[i], i, this[i]);
            }
            return this;
        },
        width:function() {
        	var _this = this[0];

        	if(_this === window) {
        		return window.innerWidth;
        	} else {
        		return ('getBoundingClientRect' in _this) ? _this.getBoundingClientRect().width : _this.offsetWidth;
        	}
        },
        children:function() {
        	var results = [];
        	for(var i=0;i<this.length;i++) {
        		var childNodes = this[i].childNodes;

        		for(var j=0;j<childNodes.length;j++) {
        			if(childNodes[j].nodeType === 1) results.push(childNodes[j]);
        		}
        	}

        	return new DOM(results);
        },
        css: function(props, value) {
        	var i;
        	if(arguments.length === 1) {
        		if(typeof props === 'string') {
        			if(this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
        		} else {
        			//object情况为设置样式
        			for(i = 0;i< this.length; i++) {
        				var _this = this[i];
        				for(var key in props) {
        					_this.style[key] = props[key]; 
        				}
        			}

        			return this;
        		}
        	}

        	if(arguments.length === 2) {
        		for(i = 0;i< this.length; i++) {
    				this[i].style[props] = value;
    			}
    			return this;
        	}

        	return this;
        },
        //Event
        on: function(types, callback) {
        	var typeArr = types.split(' ');

        	for(var i=0;i<this.length;i++) {
	    		var _this = this[i];

	    		for(var t=0;t<typeArr.length;t++) {
	        		var type = typeArr[t];

	        		if(_this.addEventListener) {
		    			_this.addEventListener(type, callback, false);
		    		} else if(_this.attachEvent) {
		    			_this.attachEvent('on' + type, callback);
		    		} else {
		    			_this['on' + type] = callback;
		    		}
	        	}
	    	}
        },
        off: function(types) {
        	var typeArr = types.split(' ');

        	for(var i=0;i<this.length;i++) {
	    		var _this = this[i];

	    		for(var t=0;t<typeArr.length;t++) {
	        		var type = typeArr[t];

	        		if(_this.removeEventListener) {
		    			_this.removeEventListener(type, null, false);
		    		} else if(_this.detachEvent) {
		    			_this.detachEvent('on' + type, null);
		    		} else {
		    			_this['on' + type] = null;
		    		}
	        	}
	    	}
        }
    }

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = KSwiper;
	} else if(typeof define === 'function' && (define.amd || define.cmd)) {
		define(function() { return KSwiper; });
	} else {
		this.KSwiper = KSwiper;
	}
}).call(function() {
	return this || (typeof window != 'undefined' ? window : global);
}());