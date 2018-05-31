/*
 *  ranger.jquery.js 区间拖动插件
 *  DH @2018-4-23
 *  https://denghao.me
 */
;
(function () {
    let Ranger = function ($parent, opt) {
        this.$parent = $parent;
        this.defaults = {
            from: 0, // 拖动块（最小）
            to: 100, // 拖动块（最大）
            min: 0, //区间(最小)
            max: 100, //区间(最大)
            onDrag: function () { }
        };
        this.opts = $.extend({}, this.defaults, opt);
        this.cache = {
            uniq: Math.random().toString(36).substr(2, 5),
            $node: null,
            $dragger: [],
            rw: 0,
            rx: 0,
            dw: 0,
            process: null
        }
    }
    Ranger.prototype = {
        init: function () {
            if (this.$parent.length <= 0) {
                console.log('Ranger config error!');
                return;
            }
            this.render();
            this.events();
        },
        render: function () {
            let _html = "<div class='ranger' id='ranger_" + this.cache.uniq + "'><i class='process'></i><div class='dragger' data-type='low'></div><div class='dragger' data-type='high'></div></div>";
            this.$parent.append(_html);

            this.cache.$node = $("#ranger_" + this.cache.uniq);
            this.cache.$dragger = this.cache.$node.find('.dragger');
            this.cache.$low = this.cache.$dragger.first();
            this.cache.$high = this.cache.$dragger.last();
            this.cache.$process = this.cache.$node.find('.process');
            this.cache.rw = this.cache.$node.width();
            this.cache.rx = this.cache.$node.position().left;
            this.cache.dw = this.cache.$dragger.width();
        },
        events: function () {
            var _this = this,
                mx = 0,
                dx = { low: 0, high: 0 },
                isDown = false,
                tarType = '',
                min = Number(_this.opts.min),
                max = Number(_this.opts.max),
                from = Number(_this.opts.from),
                to = Number(_this.opts.to),
                _from = ((from - min) * this.cache.rw) / (max - min) - (this.cache.dw / 2),
                _to = ((to - min) * this.cache.rw) / (max - min) - (this.cache.dw / 2);

            // 初始位置渲染
            this.cache.$low.css({
                left: _from
            });
            this.cache.$high.css({
                left: _to
            });
            this.cache.$process.css({
                left: _from,
                width: _to - _from
            });

            dx['low'] = _from;
            dx['high'] = _to;

            function dragstart(e) {
                let type = $(e.target).data('type');
                isDown = true;
                tarType = type;
                mx = (e.clientX || e.clientX == 0) || (e.originalEvent && e.originalEvent.changedTouches[0].clientX) || e.changedTouches[0].clientX;
                dx[type] = Math.round($(e.target).position().left);

                $(document).on('mousemove.ranger touchmove.ranger', function (e) {
                    dragmove(e);
                });

                $(document).on('mouseup.ranger touchend.ranger touchcancel.ranger', function (e) {
                    dragend(e);
                });
            }

            function dragmove(e) {
                if (isDown) {
                    e = e || window.event;
                    let x = (e.clientX || e.clientX == 0) || (e.originalEvent && e.originalEvent.changedTouches[0].clientX) || e.changedTouches[0].clientX;
                    let _x = x - mx + dx[tarType];

                    if (tarType == 'low') {
                        if (_x <= -_this.cache.dw / 2) {
                            _x = -_this.cache.dw / 2;
                        } else if (_x >= (dx['high'])) {
                            _x = dx['high'];
                        }
                    } else if (tarType == 'high') {
                        if (_x <= dx['low']) {
                            _x = dx['low'];
                        } else if (_x > (_this.cache.rw - _this.cache.dw + (_this.cache.dw / 2))) {
                            _x = _this.cache.rw - _this.cache.dw + (_this.cache.dw / 2);
                        }
                    }

                    _this.cache.$node.find(".dragger[data-type='" + tarType + "']").css({
                        "left": _x
                    });

                    // 单位转换
                    let absFrom = _this.cache.$low.position().left + _this.cache.dw / 2;
                    let absTo = _this.cache.$high.position().left + _this.cache.dw / 2;
                    let min = Number(_this.opts.min);
                    let max = Number(_this.opts.max);
                    let _from = (max - min) * absFrom / _this.cache.rw + min;
                    let _to = (max - min) * absTo / _this.cache.rw + min;

                    //背景条渲染
                    _this.cache.$process.css({
                        left: absFrom,
                        width: absTo - absFrom
                    });

                    // 输出回调
                    _this.opts.onDrag({
                        from: Math.round(_from),
                        to: Math.round(_to)
                    });
                }
            }

            function dragend(e) {
                isDown = false;
                let type = $(e.target).data('type');
                dx[type] = Math.floor($(e.target).position().left);
                $(document).off('.ranger');
            }

            this.cache.$dragger.on('mousedown touchstart', function (e) {
                dragstart(e);
            });

        }
    }

    $.fn.Ranger = function (opts) {
        let drag = new Ranger(this, opts);
        drag.init();
        return this;
    }

    //兼容模块
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Ranger;
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function () {
            return Ranger;
        })
    } else {
        window.Ranger = Ranger;
    }
}).call(function () {
    return (typeof window !== 'undefined' ? window : global)
}, $)