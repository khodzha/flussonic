import $ from 'jquery';
import autosize from 'autosize';
import ScrollMagic from 'scrollmagic';
import debounce from 'lodash.debounce';
import SVGMorpheus from './svgmorpheus';
import { initMap } from './map';
import { dispatcher, actions } from './dispatcher';
import './draw-swg-lines';
window.$ = window.jQuery = $;
import './draw-svg';
import svg4everybody from 'svg4everybody';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
console.log(isSafari);
const scrollController = new ScrollMagic.Controller({
    container: 'body',
    loglevel: 2
});

const mq = window.matchMedia('(max-width: 767px)');

$('.hero-btn').on('click touchend', toggleSection);

$(window).on('resize', debounce(() => {
    setFeaturesHeight();
}, 200));

$('.menu-button').on('click touchend', function(e) {
    e.preventDefault();
    $(this).parents('.header').toggleClass('is-show-menu');
});

$.extend($.easing, {
    easeOutCubic: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    }
});

// morhOnvif();
// morphLightning();
initTextareaAutoresize();
buildHeaderScrollScene();
buildContentFadeScenes();
buildCommonScrollScenes();
setTimeout(setFeaturesHeight, 200);
// initMap('#map');
svg4everybody();
drawHeroSvg('.hero-figure.is-active svg', 300);
activateScrollToAnchor();

function drawHeroSvg(el, timeout = 0, cb = $.noop) {
    if (mq.matches) return;

    if (typeof el === 'string') {
        el = $(el);
    }

    if (/drawsvg-initialized/.test(el.attr('class'))) {
        el.drawsvg('animate');
        return;
    }

    el.drawsvg({
        duration: 1000,
        stagger: 0,
        reverse: false,
        callback: cb
    });

    setTimeout(() => {
        el.drawsvg('animate');
    }, timeout);
}

function toggleSection(e) {
    e.preventDefault();

    const targetBtn = $(e.delegateTarget);

    if (targetBtn.hasClass('is-active')) return;


    const sectionName  = targetBtn.data('section');
    const targetFigure = $(`.hero-figure-${sectionName}`);
    const targetFeatures = $(`.features-${sectionName}`);

    dispatcher.trigger(actions.BEGIN_CHANGE_SECTION, sectionName);

    $('.hero-btn.is-active, .hero-figure.is-active, .features.is-active').removeClass('is-active');

    targetFeatures.parent().addClass('is-changing');

    targetBtn
        .add(`.hero-btn[data-section='${sectionName}']`)
        .add(targetFigure)
        .add(targetFeatures)
        .addClass('is-active');

    setFeaturesHeight(targetFeatures);

    drawHeroSvg(targetFigure.find('svg'), null, () => {
        targetFeatures.parent().removeClass('is-changing');
        dispatcher.trigger(actions.END_CHANGE_SECTION, sectionName);
    });
}

function setFeaturesHeight(activeFeatures) {
    if (activeFeatures === undefined || activeFeatures === null) {
        activeFeatures = $('.features.is-active');
    }

    activeFeatures.parent().css({ height: activeFeatures.outerHeight() });
}

function morhOnvif() {
    const morph = new SVGMorpheus('.onvif svg');

    const options = {
        duration: 5000,
        rotation: 'none',
        easing: 'sine-in-out'
    };

    function toStateOne() {
        morph.to('onvif-state-1', options, toStateTwo);
    }

    function toStateTwo() {
        morph.to('onvif-state-2', options, toStateThree);
    }

    function toStateThree() {
        morph.to('onvif-state-3', options, toStateOne);
    }

    toStateOne();
}

function morphLightning() {
    const morph = new SVGMorpheus('#lightning-shape');

    function toStateOne() {
        morph.to('lightningpath2', {
            duration: 1500,
            rotation: 'none',
            easing: 'sine-in-out'
        }, toStateTwo);
    }

    function toStateTwo() {
        morph.to('lightningpath3', {
            duration: 2500,
            rotation: 'none',
            easing: 'sine-in-out'
        }, toStateTree);
    }

    function toStateTree() {
        morph.to('lightningpath1', {
            duration: 1500,
            rotation: 'none',
            easing: 'sine-in-out'
        }, toStateOne);
    }

    toStateOne();
}

function initTextareaAutoresize() {
    let el = $('textarea').filter('[data-autoresize]');
    if (el.length) {
        autosize(el);

        $(window).on('resize', () => {
            autosize.update(el);
        });
    }
}

function buildHeaderScrollScene() {
    const header    = $('header');
    const container = $('.features-container');
    const trigger   = $('.hero .hero-links');

    function calcDuration() {
        return container.outerHeight() + container.offset().top - trigger.offset().top - 70;
    }

    const scene = new ScrollMagic.Scene({
        duration: calcDuration(),
        offset: -22,
        triggerElement: trigger[0],
        triggerHook: 'onLeave'
    }).on('start', (e) => {
        header.toggleClass('is-show-buttons');
    }).on('end', (e) => {
        header.toggleClass('is-hide-buttons');
    }).addTo(scrollController);

    const scene2 = new ScrollMagic.Scene({
        offset: 5,
        triggerElement: 'body',
        triggerHook: 'onLeave'
    }).on('start', () => {
        header.toggleClass('has-shadow');
    }).addTo(scrollController);

    $(window).on('resize', debounce((e) => {
        scene.duration(calcDuration());
    }, 500));
}

function buildCommonScrollScenes() {
    const legoScene = new ScrollMagic.Scene({
        offset: -100,
        triggerElement: '.lego',
        triggerHook: 'onCenter'
    }).setClassToggle('.lego', 'animate').addTo(scrollController);

    const mouseScene = new ScrollMagic.Scene({
        offset: -100,
        triggerElement: '.web-access',
        triggerHook: 'onCenter'
    }).setClassToggle('.web-access, .mobile-app', 'animate').addTo(scrollController);
}

function buildContentFadeScenes() {
    const sections = $('.fade-in');
    const duration = 500;
    const stack = [];

    const debouncedAnimate = debounce(() => {
        stack.forEach((obj, i) => {
            let delay = 150 * i;
            delay = delay > 450 ? 450 : delay;

            if (obj.init) return;

            obj.init = true;

            setTimeout(() => {
                obj.$el.addClass('animate');
            }, delay);

            setTimeout(() => {
                obj.$el.removeClass('fade-in slide-up animate');
            }, delay + duration);
        });
        stack.length = 0;
    }, 100);

    sections.each((index, section) => {
        let $section = $(section);
        let offset = $section.hasClass('slide-up') ? 100 : 50;

        let scene = new ScrollMagic.Scene({
            offset,
            triggerElement: section,
            triggerHook: 'onEnter'
        }).on('start', () => {
            stack.push({
                $el: $section,
                init: false
            });
            debouncedAnimate();
            scene.destroy();
        }).addTo(scrollController);
    });
}

function scrollTo(target, duration = 1000, shift = 100) {
    $('html, body').animate({
        scrollTop: target.offset().top - shift
    }, duration, 'easeOutCubic');
}

function activateScrollToAnchor() {
    $('.nav__link').on('click', function(e) {
        let name = this.hash.slice(1);
        let $target = name.length ? $(`a[name='${name}']`) : null;
        e.preventDefault();
        if ($target && $target.length) {
            let shift = $target.data('shift') || 80;
            scrollTo($target, 1000, shift);
        }
    });
}
