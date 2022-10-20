(function(w){
    'use strict';
    if(!w.console){w.console={log:function(){}}}

    var $ = w.jQuery || function(fn){if(document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){fn();}else{document.addEventListener('DOMContentLoaded', fn);}};

    var ID = 'SANTEN';
    var subID = 'APP';

    var YOZA = w.YOZA = w.YOZA || {};
    var ROOT = YOZA[ID] = YOZA[ID] || {};
    var APP = ROOT[subID] = ROOT[subID] || {};
    var PACKAGE = APP.PACKAGE = {};
    var $w, $doc, $body, $html, $scroll;
    var SR2scroll = (YOZA.PLUGIN) ? YOZA.PLUGIN.sr2scroll : function(){};
    var LANG = document.documentElement.lang;
    var WORDBOX;
    var LocalStorage = w.localStorage;

    APP.fn = {};
    APP.param = {
        WORDBOX : {
            ja : {
                PREPOSITION_PDF      : 'PDF??????',
                PREPOSITION_EXTERNAL : '???????????',
                PREPOSITION_BLANK    : '???????'
            },
            en : {
                PREPOSITION_PDF      : 'PDF file.',
                PREPOSITION_EXTERNAL : 'Go to external site.',
                PREPOSITION_BLANK    : 'Page will open in a new window.'
            }
        },
        isPC : false,
        isSP : false,
        isTablet : false,
        SP_POINT : 736,
        BREAKPOINTS : [736, 1080, 1200]
    };

    var _vanilla = function(){
        WORDBOX = APP.param.WORDBOX[LANG];
        if(undefined === WORDBOX){ WORDBOX = {}; }
        var ua = navigator.userAgent;
        if (ua.indexOf('iPhone') > -1 || (ua.indexOf('Android') > -1 && ua.indexOf('Mobile') > -1)) {
            APP.param.isSP = true;
        } else if ((ua.indexOf('iPad') > -1 || ua.indexOf('Macintosh') > -1 && 'ontouchend' in document) || ua.indexOf('Android') > -1) {
            APP.param.isTablet = true;
        } else {
            APP.param.isPC = true;
        }
    };

    var _isReady = false;
    var _ready = function(){
        if(!w.jQuery){ return false; }
        $w = $(w); $doc = $(document); $body = $('body'); $html = $('html'); $scroll = $(('scrollingElement' in document) ? document.scrollingElement : (/*@cc_on!@*/false || (!!window.MSInputMethodContext && !!document.documentMode)) ? document.documentElement : document.body);

        APP.param.isSP && $body.addClass('is-sp');
        APP.param.isTablet && $body.addClass('is-tb');
        APP.param.isPC && $body.addClass('is-pc');

        APP.EventsManager = new PACKAGE.EventsManager;
        APP.Parts = new PACKAGE.Parts;
        APP.GlobalNavi = new PACKAGE._GlobalNavi;

        _isReady = true;
        document.removeEventListener('DOMContentLoaded', _ready);
    };
    var _loaded = function(){
        if(!w.jQuery){ return false; }
        if(!_isReady){ setTimeout(function(){ _loaded(); }, 33); return false; }

        SR2scroll({
            upperY : 0,
            addHash : false,
            duration : 300
        });

        w.ScrollHint && new w.ScrollHint('.c-table_wrapper');

        APP.EventsManager.update();

        w.removeEventListener('load', _loaded);
    };
    /**
     * EventsManager
     * CO.EventsManager.add('scroll',     function(isSP){});
     * CO.EventsManager.add('resize',     function(isSP){});
     * CO.EventsManager.add('breakpoint', function(isSP, borderW){});
     */
    PACKAGE.EventsManager = function(){
        this.init.apply(this, arguments);
    };
    PACKAGE.EventsManager.prototype = {
        init : function(){
            var self = this;
            self.arrBreakpoint = [];
            self.arrResize = [];
            self.arrScroll = [];
            self.setup.apply(self, arguments);
        },
        setup : function(){
            var self = this;
            var p = APP.param;
            var mem;
            $w
            .off('resize.' + ID)
            .on('resize.' + ID, function(){
                var ww = $w.width();
                var zoomer = document.body.clientWidth / w.innerWidth;
                // p.isSP = w.innerWidth * zoomer <= p.SP_POINT;

                if(0 < p.BREAKPOINTS.length){
                    var bp = p.BREAKPOINTS, borderW = ww, n;
                    for(var i = bp.length - 1, l = 0; i >= l; --i){
                        n = isNaN(bp[i-1]) ? 0 : bp[i-1];
                        if(n <= ww && ww <= bp[i]){ borderW = bp[i]; }
                    }
                    if(borderW > bp[bp.length - 1]){ borderW = bp[bp.length - 1]; }
                    if(borderW !== mem){
                        mem = borderW;
                        self._onBreakpoint(borderW);
                    }
                }
                self._onResize();
            })
            .off('scroll.' + ID)
            .on('scroll.' + ID, function(){
                self._onScroll();
            });
        },
        update : function(){
            $w.trigger('resize.' + ID).trigger('scroll.' + ID);
        },
        trigger : function(ID){
            var self = this;
            switch(ID.toLowerCase()){
                case 'breakpoint':
                    self._onBreakpoint();
                    break;
                case 'resize':
                    self._onResize();
                    break;
                case 'scroll':
                    self._onScroll();
                    break;
            }
        },
        _onScroll : function(){
            var self = this;
            var p = APP.param;
            var i = 0,l = self.arrScroll.length;
            for(; i < l; ++i){
                self.arrScroll[i](p.isSP);
            }
        },
        _onResize : function(){
            var self = this;
            var p = APP.param;
            var i = 0,l = self.arrResize.length;
            for(; i < l; ++i){
                self.arrResize[i](p.isSP);
            }
        },
        _onBreakpoint : function(borderW){
            var self = this;
            var p = APP.param;
            var i = 0,l = self.arrBreakpoint.length;
            for(; i < l; ++i){
                self.arrBreakpoint[i](p.isSP,borderW);
            }
        },
        add : function(ID, fn){
            var self = this;
            if('function' !== typeof fn){ return; }

            switch(ID.toLowerCase()){
                case 'breakpoint':
                    self.arrBreakpoint[self.arrBreakpoint.length] = fn;
                    break;
                case 'resize':
                    self.arrResize[self.arrResize.length] = fn;
                    break;
                case 'scroll':
                    self.arrScroll[self.arrScroll.length] = fn;
                    break;
            }
        }
    };

    /**
     * Parts
     */
    PACKAGE.Parts = function(){
        // params

        this.setup.apply(this, arguments);
    };
    PACKAGE.Parts.prototype = {
        setup : function(){
            // new this.RegionList('.p-region_list');
            // new this.BlockSkip('.c-block_skip', 'ul li a');
            new this.Preposition('.l-main','a.c-link, .listIcon002 a');
            new this.ToggleClass('.fn-hamburger', '.l-header', 'is-open_sp_nav');
            new this.ToggleClass('.fn-open_read_speaker', '.l-header', 'is-open_sp_read_speaker');
            new this.ToggleClass('.c-close_read_speaker', '.l-header', 'is-open_sp_read_speaker');
            new this.ChangeTextSize('.fn-header_text_size', 'li');
            new this.modal('.fn-modal');
        },

        RegionList : function(sel_root){
            var $root = $(sel_root);
            if(0 === $root.length){ return false; }
            var $triggers = $root.find('.p-region_list__col > figcaption');
            var CLS_ACTIVE = 'is-active';
            var ATTR_HIDDEN = 'aria-hidden';
            var ATTR_EXPANDED = 'aria-expanded';
            var DURATION = 200;
            var p = APP.param;

            $triggers
            .off('click.Parts')
            .on('click.Parts', function(){
                if(false === p.isSP){ return true; }
                var $t = $(this);
                var $u = $t.parent().children('ul');
                var memHasClass = $t.hasClass(CLS_ACTIVE);
                if(true === memHasClass){
                    $u.slideUp(DURATION).attr(ATTR_HIDDEN, true);
                    $t.removeClass(CLS_ACTIVE).attr(ATTR_EXPANDED, false);
                }
                else{
                    $u.slideDown(DURATION).attr(ATTR_HIDDEN, false);
                    $t.addClass(CLS_ACTIVE).attr(ATTR_EXPANDED, true);
                }
            });

            var fn_breakpoint = function(){
                $triggers
                .each(function(){
                    var $t = $(this);
                    var $u = $t.parent().children('ul');
                    var memHasClass = $t.hasClass(CLS_ACTIVE);
                    if(false === p.isSP){
                        $u.css('display', '').removeAttr(ATTR_HIDDEN);
                        $t.removeAttr(ATTR_EXPANDED);
                    }
                    else if(true === memHasClass){
                        $u.css({display : 'block'}).attr(ATTR_HIDDEN, false);
                        $t.attr(ATTR_EXPANDED, true);
                    }
                    else{
                        $u.hide().attr(ATTR_HIDDEN, 'true');
                        $t.attr(ATTR_EXPANDED, false);
                    }
                });
            };

            APP.EventsManager.add('breakpoint', function(isSP, borderW){
                fn_breakpoint();
            });
        },
        BlockSkip : function(sel_root, sel_target){
            var $root = $(sel_root);
            if(0 === $root.length){ return false; }
            var $targets = $root.find(sel_target);
            if(0 === $targets.length){ return false; }
            var CLS_SHOW = 'is-show';

            $targets
            .off('blur.Parts')
            .on('blur.Parts', function(){
                $root.removeClass(CLS_SHOW);
            })
            .off('focus.Parts')
            .on('focus.Parts', function(){
                $root.addClass(CLS_SHOW);
            });
        },
        Preposition : function(sel_root, sel_target){
            var $root = $(sel_root);
            if(0 === $root.length){return false;}
            var $targets = $root.find(sel_target);
            if(0 === $targets.length){return false;}

            var CLS_PDF = '-pdf';
            var CLS_EXTERNAL = '-different';

            var $PDF = $('<span>').addClass('c-pdf').text(WORDBOX.PREPOSITION_PDF);
            var $EXTERNAL = $('<span>').addClass('c-readable').text(WORDBOX.PREPOSITION_EXTERNAL);
            var $BLANK = $('<span>').addClass('c-readable').text(WORDBOX.PREPOSITION_BLANK);

            /*
             * DOM?????
             * ????
             * PDF
             * ???????
             * ???????????
             */
            $targets
            .each(function(){
                // PDF??????
                var $t = $(this);
                var href = this.getAttribute('href');
                if(undefined === href || null === href || 'string' !== typeof href ||  0 === href.length){ return true; }
                var sp = href.split('?')[0].split('#')[0];
                var isPDF = (/.pdf$/i).test(sp);
                if(true === isPDF){ $t.addClass(CLS_PDF).append($PDF.clone()); }
            })
            .each(function(){
                // ???????
                var $t = $(this);
                var target = this.getAttribute('target');
                var isBlank = '_blank' === target;
                if(true === isBlank){ $t.append($BLANK.clone()); }
            })
            .each(function(){
                // ???????????
                var $t = $(this);
                var href = this.getAttribute('href');
                if(undefined === href || null === href || 'string' !== typeof href ||  0 === href.length){ return true; }
                var isRelative = (/^\./i).test(href) || (/^\//i).test(href);
                var isFullPath = (/^http(|s):\/\/(|www\.)santen\.co\.jp/i).test(href);
                var isDirect = !isRelative && !isFullPath && !(/^http/i).test(href);
                if(false === isRelative && false === isFullPath && false === isDirect){ $t.addClass(CLS_EXTERNAL).append($EXTERNAL.clone()); }
            });

        },
        ToggleClass : function(sel_trigger, sel_toggle, cls_toggle, isAlways){
            var $trigger = $(sel_trigger);
            if(0 === $trigger.length){return false;}
            var $toggle = $(sel_toggle);
            if(0 === $toggle.length){return false;}
            $trigger.on('click.Hamburger_SP', function(){
                if (sel_trigger === '.fn-hamburger') {
                    if ($toggle.hasClass(cls_toggle)) {
                        $trigger.find('span').text('??????????');
                        $toggle.removeClass(cls_toggle);
                        setTimeout(function() {
                            $toggle.removeClass('is-display_sp_nav');
                        }, 300);
                    } else {
                        $toggle.addClass('is-display_sp_nav');
                        setTimeout(function() {
                            $toggle.addClass(cls_toggle);
                            $trigger.find('span').text('???????????');
                        }, 50);
                    }
                } else if (sel_trigger === '.fn-open_read_speaker') {
                    if ($toggle.hasClass(cls_toggle)) {
                        $toggle.removeClass('is-open_sp_read_speaker');
                        setTimeout(function() {
                            $toggle.removeClass('is-display_sp_read_speaker');
                        }, 300);
                    } else {
                        $toggle.addClass('is-display_sp_read_speaker');
                        setTimeout(function() {
                            $toggle.addClass('is-open_sp_read_speaker');
                        }, 50);
                    }
                } else if (sel_trigger === '.c-close_read_speaker') {
                    if ($toggle.hasClass(cls_toggle)) {
                        var eClick = new Event('click');
                        var $rsClose = document.querySelector('#readspeaker_button2 .rsbtn_exp .rsbtn_closer');
                        if ($rsClose) {
                            $rsClose.dispatchEvent(eClick);
                        }
                        $toggle.removeClass('is-open_sp_read_speaker');
                        setTimeout(function() {
                            $toggle.removeClass('is-display_sp_read_speaker');
                        }, 300);
                    }
                } else {
                    $toggle[true === isAlways ? 'addClass' : 'toggleClass'](cls_toggle);
                }
            });
        },
        ChangeTextSize : function(sel_root, sel_trigger){
            var $root = $(sel_root);
            if(0 === $root.length){return false;}
            var $triggers = $root.find(sel_trigger);
            if(0 === $triggers.length){return false;}
            var cls_active = 'is-active';
            var attr_size = 'data-font-size';
            $triggers.on('click.ChangeTextSize', function(){
                var fs = this.getAttribute(attr_size);
                if('string' !== typeof fs){ return; }
                $triggers.removeClass(cls_active);
                $(this).addClass(cls_active);
                $html.attr(attr_size, fs);
                LocalStorage && LocalStorage.setItem([ID,'customTextSize'].join('.'), fs);
            });
            var TS = LocalStorage.getItem([ID,'customTextSize'].join('.'));
            $triggers.filter('['+attr_size+'="'+TS+'"]').trigger('click.ChangeTextSize');
        },
        modal : function(sel_trigger){
            var $triggers = $(sel_trigger);
            if(0 === $triggers.length){ return false; }
            $triggers
            .off('click.modal')
            .on('click.modal', function(){
                var target = this.getAttribute('data-modal-target');
                var $modal = $(target);
                if(0 === $modal.length){ return true; }
                var $iframe = $modal.find('iframe');
                var $insert = $modal.find('.fn-insert_video');
                if(0 === $iframe.length || 0 === $insert.length){ return true; }
                var src = $insert.attr('data-video-src');
                $iframe.attr('src', src);
                $modal.addClass('is-show');
            });
            $('.p-modal')
            .off('click.modal')
            .on('click.modal', function(){
                $(this).removeClass('is-show')
                .find('iframe').removeAttr('src');
            });
        }
    };


    /**
     * GlobalNavi
     */
    PACKAGE._GlobalNavi = function(){
        // params
        this.SEL_ROOT = '.p-global_nav';
        this.SEL_LISTS = '.p-global_nav__item';
        this.SEL_LIST_TRIGGER = '.c-trigger, > a';
        this.SEL_LIST_TRIGGER_SP = '.c-trigger';
        this.SEL_MENU = '.p-mega_menu';
        this.ATTR_EXPANDED = 'aria-expanded';
        this.ATTR_HIDDEN = 'aria-hidden';
        this.CLS_FIXED = 'is-fixed';
        this.CLS_FULLOPEN = 'is-full_open';
        this.CLS_HASLINK = 'is-has_link';
        this.CLS_OEPN = 'is-open';

        this.$root = $(this.SEL_ROOT);
        if(0 === this.$root.length){ return false; }
        this.$wrapper = this.$root.find('.p-global_nav__body');
        if(0 === this.$wrapper.length){ return false; }
        this.$lists = this.$wrapper.find(this.SEL_LISTS);
        this.$btnClose = this.$lists.find('.c-btn.-close');

        this.setup.apply(this, arguments);
    };
    PACKAGE._GlobalNavi.prototype = {
        setup : function(){
            this.mvcSP();
            this.controller();
            this.activeEvent();
        },
        mvcSP : function(){
            var self = this;
            var p = APP.param;
            if(!p.isSP){ return false; }
            // init aria
            this.$lists
            .find('.c-col')
                .attr(this.ATTR_EXPANDED, false)
                .find('dd')
                    .attr(this.ATTR_HIDDEN, true);
            /*
            // full open
            this.$lists
            .find(this.SEL_MENU+'.'+this.CLS_FULLOPEN)
                .attr(this.ATTR_HIDDEN, false)
                .find('.c-col')
                    .attr(this.ATTR_EXPANDED, true)
                    .find('dd')
                        .attr(this.ATTR_HIDDEN, false)
            .closest('.p-global_nav__item')
                .attr(this.ATTR_EXPANDED, true)
                .find(this.SEL_LIST_TRIGGER_SP)
                    .addClass(this.CLS_OEPN);
            */
            // is-open
            this.$lists
            .filter(function(){ return 'true' === String($(this).attr(self.ATTR_EXPANDED)); })
                .find('dt')
                .addClass(this.CLS_OEPN)
                .nextAll('dd').show();
            // dt without .is-has_link
            var $dt = this.$lists.find('dt').not('.'+this.CLS_HASLINK);
            $dt
            .off('click.mvcSP')
            .on('click.mvcSP', function(){
                var $t = $(this);
                var $col = $t.closest('.c-col');
                if(0 === $col.length){ return true; }
                var nowOpen = 'true' === String($col.attr(self.ATTR_EXPANDED));
                $col.attr(self.ATTR_EXPANDED, !nowOpen);
                $col.find('dd')
                    .attr(self.ATTR_HIDDEN, nowOpen)
                    .stop()
                    [nowOpen ? 'slideUp' : 'slideDown'](200);
                $t[nowOpen ? 'removeClass' : 'addClass'](self.CLS_OEPN);
                return false;
            });
            // tabindex
            //$('.p-mega_menu dt button').attr('tabindex', 0);
        },
        controller : function(){
            var self = this;
            var p = APP.param;
            var fn_allSlideUp = function($tar){
                $tar
                .attr(self.ATTR_EXPANDED, false)
                .find(self.SEL_MENU)
                .css('z-index', '')
                .attr(self.ATTR_HIDDEN, true)
                .stop()
                .slideUp({
                    duration : 200,
                    complete : function(){ $(this).css('height',''); }
                });
            };
            var fn_clearIsOpen = function(){
                self.$lists
                .find(self.SEL_LIST_TRIGGER)
                .removeClass(self.CLS_OEPN);
            }

            this.$lists
            .off('mouseenter.gnav')
            .on('mouseenter.gnav', function(){
                var $t = $(this);
                if(p.isPC){
                    var $menu = $t.find(self.SEL_MENU);
                    if(0 === $menu.length){ return true; }
                    fn_allSlideUp(self.$lists);
                    $t
                    .attr(self.ATTR_EXPANDED, true)
                    .find(self.SEL_LIST_TRIGGER)
                    .addClass(self.CLS_OEPN);
                    $menu
                    .css('z-index', 11)
                    .attr(self.ATTR_HIDDEN, false)
                    .stop()
                    .slideDown({
                        duration : 200,
                        complete : function(){ $(this).css('height',''); }
                    });
                }
            })
            .off('mouseleave.gnav')
            .on('mouseleave.gnav', function(){
                var $t = $(this);
                if(p.isPC){
                    var $menu = $t.find(self.SEL_MENU);
                    if(0 === $menu.length){ return true; }
                    fn_allSlideUp(self.$lists);
                    $t
                    .attr(self.ATTR_EXPANDED, false)
                    .find(self.SEL_LIST_TRIGGER)
                    .removeClass(self.CLS_OEPN);
                    $menu
                    .attr(self.ATTR_HIDDEN, true)
                    .stop()
                    .slideUp({
                        duration : 200,
                        complete : function(){ $(this).css('height',''); }
                    });
                }
            })
            .off('click.gnav')
            .on('click.gnav', function(e){
                var $t = $(this);
                if(p.isPC){
                    0 === $(e.target).closest(self.SEL_MENU).length && $t.find('> a:first').get(0).click();
                }
            })
            .off('touchend.gnav force.gnav')
            .on('touchend.gnav force.gnav', function(e, send){
                var $t = $(this);
                if(p.isTablet || send && (send.keyDownEvent || send.focusEvent)){
                    var nowOpen = 'true' === String($t.attr(self.ATTR_EXPANDED));
                    var $menu = $t.find(self.SEL_MENU);
                    if($(e.target).closest(self.SEL_MENU).length){ return true; }
                    // usability
                    if(true === nowOpen && send && (send.keyDownEvent || send.focusEvent)){
                        send && send.keyDownEvent && $t.find('> a:first').get(0).click();
                        return false;
                    }
                    // menu
                    fn_allSlideUp(self.$lists);
                    fn_clearIsOpen();
                    if(0 === $menu.length){ return true; }
                    if(false === nowOpen){
                        $t
                        .attr(self.ATTR_EXPANDED, true)
                        .find(self.SEL_LIST_TRIGGER)
                        .addClass(self.CLS_OEPN);
                        $menu
                        .css('z-index', 11)
                        .attr(self.ATTR_HIDDEN, false)
                        .stop()
                        .slideDown({
                            duration : 200,
                            complete : function(){ $(this).css('height',''); }
                        });
                        return false;
                    }
                    else{
                        0 === $(e.target).closest(self.SEL_MENU).length && $t.find('> a:first').get(0).click();
                    }
                }
            });
            // SP accordion
            this.$lists.find(this.SEL_LIST_TRIGGER_SP)
            .off('click.gnav')
            .on('click.gnav', function(e){
                if(!p.isSP){ return true; }
                var $t = $(this).closest(self.SEL_LISTS);
                var isOpenMenu = 'true' === String($t.attr(self.ATTR_EXPANDED));
                var $menu = $t.find(self.SEL_MENU);
                if(0 === $t.find(self.SEL_MENU).length){ return true; }
                // clicked children
                if($(e.target).closest(self.SEL_MENU).length){ return true; }
                // accordion
                $t
                .attr(self.ATTR_EXPANDED, !isOpenMenu)
                .find(self.SEL_LIST_TRIGGER)
                    [isOpenMenu ? 'removeClass' : 'addClass'](self.CLS_OEPN);
                $menu
                .attr(self.ATTR_HIDDEN, isOpenMenu)
                .stop()
                    [isOpenMenu ? 'slideUp' : 'slideDown'](200);
                if (!isOpenMenu) {
                    if ($menu.data('condition') === 'full-open') {
                        $menu.find('.c-col > dt:not(.is-open) > button').trigger('click');
                    }
                }
                return false;
            });
            // focusin
            this.$lists.find('> a')
            .off('keydown.gnav')
            .on('keydown.gnav', function(e){
                if(p.isSP){ return true; }
                // [enter][space[
                if('keydown' === e.type && !(13 === e.keyCode || 32 === e.keyCode)){ return true; }
                $(this).closest(self.SEL_LISTS).trigger('force.gnav', {keyDownEvent:true});
                return false;
            })
            .off('focus.gnav')
            .on('focus.gnav', function(){
                if(p.isSP || p.isTablet){ return true; }
                $(this).closest(self.SEL_LISTS).trigger('force.gnav', {focusEvent:true});
                return false;
            });
            // focusout
            $w
            .off('keyup.gnav')
            .on('keyup.gnav', function(e){
                if(p.isSP){ return true; }
                // [tab]
                if('keyup' === e.type && 9 === e.keyCode){
                    if(document.activeElement && 0 === $(document.activeElement).closest(self.SEL_ROOT).length){
                        fn_allSlideUp(self.$lists);
                        fn_clearIsOpen();
                    }
                }
            });
            // close button
            this.$btnClose
            .off('click.gnav touchend.gnav')
            .on('click.gnav touchend.gnav', function(){
                fn_allSlideUp($(this).closest(self.SEL_LISTS));
                fn_clearIsOpen();
                return false;
            });
        },
        activeEvent : function(){
            var self = this;
            var p = APP.param;
            $w
            .off('resize.gnav scroll.gnav')
            .on('resize.gnav scroll.gnav', function(){
                // fixed
                var wT = $w.scrollTop();
                var oT = self.$root.offset().top;
                var nowFixed = self.$root.hasClass(self.CLS_FIXED);
                if(nowFixed && wT <= oT){
                    self.$root.removeClass(self.CLS_FIXED);
                }
                else if(!nowFixed && wT > oT){
                    self.$root.addClass(self.CLS_FIXED);
                }
                // max-height
                if(p.isPC || p.isTablet){
                    var $menus = self.$lists.find(self.SEL_MENU);
                    var headerSubH = Math.max(0, 154 - wT);
                    var menuH = 48;
                    var wH = window.innerHeight;
                    var innerSubH = p.isPC ? 40 : p.isTablet ? 124 : 0;
                    $menus
                    .css('max-height', wH - headerSubH - menuH)
                    .find('.p-mega_menu__inner')
                    .css('max-height', wH - headerSubH - menuH - innerSubH);
                }
            })
            .trigger('resize.gnav');
        }
    };

    _vanilla();
    document.addEventListener('DOMContentLoaded', _ready);
    w.addEventListener('load', _loaded);

    // local_nav
    $(window).scroll(function () {
        if ($body) {
            if ( $(this).scrollTop() > 220 ) {
                $body.addClass('is-show_local_nav');
            } else {
                $body.removeClass('is-show_local_nav');
            }
        }
    });

}(window, (function(){
    /**
     * plug.in.sr2scroll.min.js | Copyright 2021 FLEXTIME
     */
    !function(a,b){var c=b.YOZA?b.YOZA:b.YOZA={};c.PLUGIN=c.PLUGIN||{},c.PLUGIN.sr2scroll=a}(function(a){var b=!1,c=function(a,b,c,d){a.addEventListener?a.addEventListener(b,c,!0===d):a.attachEvent&&a.attachEvent("on"+b,c)},d=function(){return e.apply(this,arguments)},e=function(d){if(!b)return void setTimeout(function(){e.apply(this,arguments)},1e3/60);for(var f=d||{},g=f.upperY||0,h=f.exclusionClass||"exclusion",i=!0===f.addHash,j=document.querySelectorAll(f.selector||"a, .expand"),k=0,l=j.length,m=function(a){return a<.5?8*a*a*a*a:1-8*--a*a*a*a},n=function(b,c,d,e,f){var g,h,i=16,j=isNaN(e)?400:e,k=c-b,l=0;d&&(clearInterval(d),d=void 0),d=setInterval(function(){l+=i,g=l/j,g=g>1?1:g,h=b+k*m(g),a.scrollTo(0,h),g>=1&&(a.scrollTo(0,c),clearInterval(d),d=void 0,f&&f())},i)},o=function(a){},p=[];k<l;++k)!function(b){c(j[b],"click",function(c){var d=this;"A"!==this.tagName&&(d=(c.srcElement||this).querySelector("a"));var e=String(d.getAttribute("href"));if("#"===e.substr(0,1)&&e.length>1){var j=d.getAttribute("class");if(j&&-1!==String(j).indexOf(h))return void o(c);var k=d.getAttribute("data-upperY");uY=null===k||isNaN(k)?"function"==typeof g?g():0:Number(k);var l,m=a.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop||0,q=a.scrollY||a.pageYOffset,r=document.getElementsByName(e.replace("#","")),s=document.getElementById(e.replace("#",""));l=void 0!==s&&null!==s?s:0<r.length?r[0]:document.body,void 0!==l&&null!==l&&(q+=l.getBoundingClientRect().top,q-=uY,q<0&&(q=0),n(m,q,p[b],f.duration,function(){i&&(a.location.hash=e),a.scrollTo(0,q)})),o(c)}})}(k);return this.use=!0,this.setDuration=function(a){f.duration=a},this};return c(a,"load",function(){b=!0}),d}(window),window);
    // prototype
    String.prototype.clean = function(){ return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
    return void 0;
}())));

//??????????history
$(function(){
    if (window.matchMedia('(max-width: 736px)').matches) {
        $('.p-history__subnav__img').click(function() {
            var headerHight = 52;
         });
    } else if (window.matchMedia('(min-width:737px)').matches) {
        $('.p-history__subnav__img').click(function() {
            var headerHight = 110;
         });
        }
         var speed = 400;
         var href= $(this).attr("href");
         var target = $(href == "#" || href == "" ? 'html' : href);
         if (target.offset() !== undefined) {
            var position = target.offset().top-headerHight;
            $('body,html').animate({scrollTop:position}, speed, 'swing');
         }
         return false;
})
