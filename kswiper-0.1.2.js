/**
**author: kekobin@163.com
**A custom swiper
**version: 0.1.2
**(1)添加paganation功能
**(2)添加auto play功能
**/

;(function() {
	var KSwiper = function(element, options) {//element可以是id、class、DOM或者标签element
		if (!(this instanceof KSwiper)) return new KSwiper(element, options);
		if(!element) return;
		this.opts = options;
		this.speed = options.speed || 100;
		this.index = 0;//默认开始的索引
		this.callback = options.callback;

		this.pagination = !!options.pagination;
		this.auto = !!options.auto;
		this.autoDuration = options.autoDuration;
		this.autoTimeout = null;

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

		this.$element = $(this.$container.children()[0]);

		this.init();

		return this;
	};

	KSwiper.prototype.init = function() {
		this.$slides = this.$element.children();
		this.length = this.$slides.length;
		this.width = this.$container.width();
		//设置包裹元素的宽
		this.$element.css('width', this.width * this.length + 'px');

		//设置slide item的样式
		this.$slides.css({
			'width': this.width + 'px',
			'height': '100%',
			'display': 'table-cell'
		});

		//设置分页
		if(this.pagination) {
			this.initPagination();
		}

		if(this.auto) {
			var autoIndex = 1;
			var _this = this;
			this.autoTimeout = setInterval(function() {
				_this.slideTo(autoIndex++);
			}, this.autoDuration);
		}

		this.initEvent();
	};

	KSwiper.prototype.initPagination = function() {
		var $wrap = $("<div class='kswiper-pagination'></div");

		var child = '';
		for(var i=0;i<this.length;i++) {
			var className = i === 0 ? 'active' : "";

			i === 0 ? child = "<a class='active' data-index='0'></a>" : child += "<a data-index="+i+"></a>";
		}

		$wrap.append(child);

		this.$container.append($wrap);
	};

	KSwiper.prototype.initEvent = function() {
		this.$element.on('touchstart touchmove touchend webkitTransitionEnd msTransitionEnd'+
		+' msTransitionEnd oTransitionEnd transitionEnd', this.handleEvent.bind(this));

		//如果有分页，对分页按钮添加点击事件
		if(this.pagination) {
			var _this = this;
			this.$container.find('.kswiper-pagination>a').on('click', function(e) {
				e.preventDefault();
				$(this).addClass('active').siblings().removeClass('active');
				_this.slideTo($(this).attr('data-index'));
			});
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

		if(this.pagination) {
			this.$container.find('.kswiper-pagination>a.active').removeClass('active');
			this.$container.find('.kswiper-pagination>a:nth-child('+(index+1)+')').addClass('active');
		}
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
    	if(selector && !context) {
    		if(selector instanceof DOM) {
    			return selector;
    		}
    	}

    	var elems = [];

    	//string
    	if(typeof selector === 'string') {
    		var tempParent, toCreate, html = selector.trim();

    		//可使用$("<div></div>")创建新元素
    		if(html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
    			toCreate = 'div';

    			tempParent = document.createElement(toCreate);

    			tempParent.innerHTML = selector;

    			var childNodes = tempParent.childNodes;
    			for(var i=0, len = childNodes.length;i<len;i++) {
    				var childNode = childNodes[i];
    				elems.push(childNode);
    			}
    		} else if(/^#(.*)$/.test(selector)) {
	    		elems = [(context || document).getElementById(RegExp.$1)];
	    	} else {
	    		elems = (context || document).querySelectorAll(selector);
	    	}
    	}
    	//node/element
    	else if(selector.nodeType || selector === window || selector === document) {
    		elems.push(selector);
    	}
    	// Array of elements
    	else if(selector.length > 0 && selector[0].nodeType) {
    		elems = selector;
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
        },
        append: function(newChild) {
        	var i,j;

        	for(i=0;i<this.length;i++) {
        		if(typeof newChild === 'string') {
        			var tempDIV = document.createElement('div');

        			tempDIV.innerHTML = newChild;

        			while(tempDIV.firstChild) {
        				this[i].appendChild(tempDIV.firstChild);
        			}
        		} else if(newChild instanceof DOM) {
        			this[i].appendChild(newChild[0]);
        		}
        	}

        	return this;
        },
        find: function(selector) {
        	var foundElements = [];

        	for(var i=0;i<this.length;i++) {
        		var found = this[i].querySelectorAll(selector);

        		for(var j=0;j<found.length;j++) {
        			foundElements.push(found[j]);
        		}
        	}

        	return new DOM(foundElements);
        },
        attr: function (attrs, value) {
            if (arguments.length === 1 && typeof attrs === 'string') {
                // Get attr
                if (this[0]) return this[0].getAttribute(attrs);
                else return undefined;
            }
            else {
                // Set attrs
                for (var i = 0; i < this.length; i++) {
                    if (arguments.length === 2) {
                        // String
                        this[i].setAttribute(attrs, value);
                    }
                    else {
                        // Object
                        for (var attrName in attrs) {
                            this[i][attrName] = attrs[attrName];
                            this[i].setAttribute(attrName, attrs[attrName]);
                        }
                    }
                }
                return this;
            }
        },
        addClass: function (className) {
            if (typeof className === 'undefined') {
                return this;
            }
            var classes = className.split(' ');
            for (var i = 0; i < classes.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    this[j].classList.add(classes[i]);
                }
            }
            return this;
        },
        removeClass: function (className) {
            var classes = className.split(' ');
            for (var i = 0; i < classes.length; i++) {
                for (var j = 0; j < this.length; j++) {
                    this[j].classList.remove(classes[i]);
                }
            }
            return this;
        },
        siblings: function() {
        	var ret = [], elem;

        	for(var i=0;i<this.length;i++) {
        		var parentNode = this[i].parentNode;
        		var childNodes = parentNode.childNodes;

        		for(var j=0;j<childNodes.length;j++) {
        			if(childNodes[j].nodeType === 1) {
        				elem = childNodes[j];
        				break;
        			}
        		}

        		if(elem) {
        			if(elem != this[i]) {
        				ret.push(elem);
        			}

        			while(elem = elem.nextSibling) {
        				if(elem.nodeType === 1 && elem != this[i]) {
        					ret.push(elem);
        				}
        			}
        		}
        	}

        	return new DOM(ret);
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