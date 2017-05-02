/**
**author: kekobin@163.com
**A custom swiper
**version: 0.1.0
**基本功能:
**支持单一元素滑动，且传进来的必须为DOM
**/

;(function() {
	var KSwiper = function KSwiper(element, options) {
		if(!element) return;

		this.container = element;
		this.element = this.container.children[0];
		this.opts = options;
		this.speed = options.speed || 100;
		this.index = 0;//默认开始的索引
		this.callback = options.callback;
		this.init();
	};

	KSwiper.prototype.init = function() {
		this.slides = this.element.children;
		this.length = this.slides.length;
		this.width = ('getBoundingClientRect' in this.container) ? this.container.getBoundingClientRect().width : this.container.offsetWidth;
		//设置包裹元素的宽
		this.element.style.width = this.width * this.length + 'px';

		//设置slide item的样式
		var index = this.length;
		while(index--) {
			var slide = this.slides[index];

			slide.style.width = this.width + 'px';
			slide.style.height = '100%';
			slide.style.display = 'table-cell';
		}

		this.initEvent();
	};

	KSwiper.prototype.initEvent = function() {
		if(this.element.addEventListener) {
			this.element.addEventListener('touchstart', this, false);
			this.element.addEventListener('touchmove', this, false);
			this.element.addEventListener('touchend', this, false);
			this.element.addEventListener('webkitTransitionEnd', this, false);
			this.element.addEventListener('msTransitionEnd', this, false);
			this.element.addEventListener('oTransitionEnd', this, false);
			this.element.addEventListener('transitionEnd', this, false);
		}
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
		var style = this.element.style;
		style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = 0 + 'ms';
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
			var style = this.element.style;

			style.MozTransform = style.webkitTransform = 'translate3d(' + (this.delta.x - this.index * this.width) + 'px, 0, 0)';
			style.msTransform = style.OTransform = 'translateX(' + (this.delta.x - this.index * this.width) + 'px)';
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
		
		var style = this.element.style;

		style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 'ms';
		style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px, 0, 0)';
		style.msTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';
	};

	KSwiper.prototype.transitionEnd = function(e) {
		this.callback && this.callback.call(this,this.index);
	};

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