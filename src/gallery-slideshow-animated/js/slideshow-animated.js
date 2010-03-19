    /***********************************
    * Functionality to add animation to the slideshow
    *
    ***********************************/
    function Animated() { 
        this._init_animated(); 
    }

    Animated.ANIMATION_DURATION = 0.5;
    Animated.easing = Y.Easing.easeNone;
    Animated.ATTRS = { 
        animation_out: { 
            value: {
                from: { opacity: 1},
                to: { opacity: 0 },
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            }
        },
        animation_in: { 
            value: {
                from: {opacity: 0},
                to: { opacity: 1 },
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            }
        },
        reverse_animation: { value: false }
    };

    Animated.prototype = { 
        _init_animated: function() {
            // Setup the display/hide animation
            if (this.get('animation_in')) {
                this.anim_in = new Y.Anim(this.get('animation_in'));
                this.anim_in.on('end', this._after_display, this);
                if (this.get('reverse_animation')) {
                    this.orig_anim_in = this.anim_in;
                    // Creating the reverse animation
                    this.reverse_anim_in = new Y.Anim(this.get('animation_out'));
                    this.reverse_anim_in.on('end', this._after_display, this);
                    this.reverse_anim_in.set('reverse', true);
                }
            } else {
                this.anim_in = null;
            }
            if (this.get('animation_in')) {
                this.anim_out = new Y.Anim(this.get('animation_out'));
                this.anim_out.on('end', this._after_hide, this);
                if (this.get('reverse_animation')) {
                    this.orig_anim_out = this.anim_out;
                    // Creating the reverse animation
                    this.reverse_anim_out = new Y.Anim(this.get('animation_in'));
                    this.reverse_anim_out.on('end', this._after_hide, this);
                    this.reverse_anim_out.set('reverse', true);
                }
            } else {
                this.anim_out = null;
            }

            this._prep_slides();

        },

        _prep_slides: function() {
            // Checking if the animation is setting the opacity
            // If it is then set all the non-current slides to the opacity
            var t = this.anim_out.get('to'),
                opacity = (parseInt(t.opacity, 10));
            if (!isNaN(opacity)) {
                this.get('slides').each(function(slide) {
                    if (!slide.hasClass(Y.Slideshow.CURRENT_CLASS)) {
                        slide.setStyle('opacity', opacity);
                    }
                });
            }
        },

        show_slide: function(slide_number) {
            this.timer.cancel();
            if (this._anim_running()) {
                Y.later(this.get('pause_time')/20, this, 'show_slide', slide_number);
            } else {
                this.set('current_slide', slide_number);
                this.syncUI();
            }
        },

        _anim_running: function() {
            if (this.anim_in.get('running') || this.anim_out.get('running')) {  
                return true; 
            } else {
                return false;
            }
        },
        
        _display_slide: function(slide_number) {
            var slide = this.get('slides').item(slide_number);
            this._before_display();
            slide.addClass(Y.Slideshow.CURRENT_CLASS);
            this.anim_in.set('node', slide);
            this.anim_in.run();
        },
        
        _hide_slide: function(slide_number) {
            this._before_hide();
            this.anim_out.set('node', this.get('slides').item(slide_number));
            this.anim_out.run();
        },
        _after_hide: function() {
            this.get('slides').item(this.hide_slide).removeClass(Y.Slideshow.CURRENT_CLASS);
            this.fire('slideshow:slide-hidden', {
                slide: this.get('slides').item(this.hide_slide),
                slide_number: this.hide_slide
            });
        },
        advance: function() {
            if (this.get('reverse_animation')) {
                this.anim_in = this.orig_anim_in;
                this.anim_out = this.orig_anim_out;
            }
            this.anim_in.set('reverse', false);
            this.anim_out.set('reverse', false);
            this.show_slide(this._get_next_slide());
        },

        previous: function() {
            if (this.get('reverse_animation')) {
                this.anim_in = this.reverse_anim_in;
                this.anim_out = this.reverse_anim_out;
            }
            this.show_slide(this._get_previous_slide());
        }
    };

    var SlideshowAnimated = Y.Base.build("SlideshowAnimated", Y.Slideshow, [Animated]);

    SlideshowAnimated.AUTO_HORIZONTAL_CLASS = 'horizontalSlideshow';
    SlideshowAnimated.AUTO_CROSS_HORIZONTAL_CLASS = 'horizontalCrossSlideshow';
    SlideshowAnimated.AUTO_VERTICAL_CLASS = 'verticalSlideshow';
    SlideshowAnimated.AUTO_CROSS_VERTICAL_CLASS = 'verticalCrossSlideshow';
    SlideshowAnimated.auto_shows = {};
    SlideshowAnimated.auto_shows[SlideshowAnimated.AUTO_HORIZONTAL_CLASS] = function(show_node) {
        var slide, width, x, right_x;
        slide = show_node.one('.slide.current');
        if (! slide ) {
            slide = show_node.one('.slide');
        }
        
        width = parseInt(slide.getComputedStyle('width'), 10);
        if (! width) {
            if(slide.getStyle('display').toLowerCase() == 'none') {
                slide.setStyle('display', 'block');
                width = parseInt(slide.getComputedStyle('width'), 10);
                slide.setStyle('display', 'none');
            }
        }
        
        x = parseInt(slide.getComputedStyle('left'), 10) || 0;
        right_x = x + width;

        return new SlideshowAnimated({
            contentBox: show_node,
            pause_time:  Y.Slideshow.ATTRS.pause_time.value,
            animation_out: {
                from: { left: x },
                to: {left: (-1 * right_x)},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            animation_in: {
                from: {left: right_x },
                to: {left: x},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            reverse_animation: { value: true }
        });
    };
    SlideshowAnimated.auto_shows[SlideshowAnimated.AUTO_CROSS_HORIZONTAL_CLASS] = function(show_node) {
        var slide, width, x, right_x;
        slide = show_node.one('.slide.current');
        if (! slide ) {
            slide = show_node.one('.slide');
        }
        
        width = parseInt(slide.getComputedStyle('width'), 10);
        if (! width) {
            if(slide.getStyle('display').toLowerCase() == 'none') {
                slide.setStyle('display', 'block');
                width = parseInt(slide.getComputedStyle('width'), 10);
                slide.setStyle('display', 'none');
            }
        }
        
        x = parseInt(slide.getComputedStyle('left'), 10) || 0;
        right_x = x + width;

        return new SlideshowAnimated({
            contentBox: show_node,
            pause_time:  Y.Slideshow.ATTRS.pause_time.value,
            animation_out: {
                from: { left: x },
                to: {left: right_x},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            animation_in: {
                from: {left: right_x },
                to: {left: x},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            reverse_animation: { value: true }
        });
    };
    SlideshowAnimated.auto_shows[SlideshowAnimated.AUTO_VERTICAL_CLASS] = function(show_node) {
        var slide, height;
        slide = show_node.one('.slide.current');
        if (! slide ) {
            slide = show_node.one('.slide');
        }
        height = parseInt(slide.getComputedStyle('height'), 10);
        if (! height) {
            if(slide.getStyle('display').toLowerCase() == 'none') {
                slide.setStyle('display', 'block');
                height = parseInt(slide.getComputedStyle('height'), 10);
                slide.setStyle('display', 'none');
            }
        }

        return new SlideshowAnimated({
            contentBox: show_node,
            pause_time:  Y.Slideshow.ATTRS.pause_time.value,
            animation_out: {
                from: { top: 0 },
                to: {top: height},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            animation_in: {
                from: {top: (-1 * height) },
                to: {top: 0},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            reverse_animation: { value: true }
        });
    };
    SlideshowAnimated.auto_shows[SlideshowAnimated.AUTO_CROSS_VERTICAL_CLASS] = function(show_node) {
        var slide, height;
        slide = show_node.one('.slide.current');
        if (! slide ) {
            slide = show_node.one('.slide');
        }
        height = parseInt(slide.getComputedStyle('height'), 10);
        if (! height) {
            if(slide.getStyle('display').toLowerCase() == 'none') {
                slide.setStyle('display', 'block');
                height = parseInt(slide.getComputedStyle('height'), 10);
                slide.setStyle('display', 'none');
            }
        }

        return new SlideshowAnimated({
            contentBox: show_node,
            pause_time:  Y.Slideshow.ATTRS.pause_time.value,
            animation_out: {
                from: { top: 0 },
                to: {top: (-1 * height)},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            animation_in: {
                from: {top: (-1 * height) },
                to: {top: 0},
                duration: Animated.ANIMATION_DURATION,
                easing: Animated.easing
            },
            reverse_animation: { value: true }
        });
    };

    SlideshowAnimated.auto = function() {
        var show_classes = [], show, c, i, len;
        for (c in SlideshowAnimated.auto_shows){
            if (SlideshowAnimated.auto_shows.hasOwnProperty(c)) {
                show_classes.push(c);
            }
        }
        Y.all(Y.Slideshow.AUTO_SLIDESHOW_SELECTOR).each(function() {
            show = false;
            for (i=0, len = show_classes.length; i < len; i++) {
                if (this.hasClass(show_classes[i])){
                    show = SlideshowAnimated.auto_shows[show_classes[i]](this);
                    show.render();
                    break;
                }
            }
            if (!show) {
                show = new SlideshowAnimated({contentBox: this });
                show.render();
            }
        });
    };

    Y.SlideshowAnimated = SlideshowAnimated;