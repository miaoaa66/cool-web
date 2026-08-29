class Game {

  constructor() {
    this.score = 0;
    this.isRunning = 0; // 游戏未运行

    this.calculateScale();

    this.timeline = new TimelineMax({ smoothChildTiming: true });
    this.time = 1.6; // 初速度
    this.colors = ["#FF4571", "#FFD145", "#8260F6"]; // 游戏中使用的3种颜色
    this.colorsRGBA = ["rgba(255, 69, 113, 1)", "rgba(255, 69, 113, 1)", "rgba(255, 69, 113, 1)"];
    this.color = this.colors[0]; // 球的初始颜色
    this.prevColor = null; // 用作支架，防止球颜色重复
  }


  /**
  *游戏屏幕可扩展。我把1200x800px作为初始比例。
  *为了在多种屏幕尺寸下正确显示游戏
  *我必须将玩家的sreen大小与初始比例进行比较，
  *然后使用CSS Transform缩放游戏以适合屏幕
  *该函数在控制器和任何我需要的地方被调用
  *在调整屏幕大小或设备旋转时重新计算比例
  */
  calculateScale() {
    this.screen = $(window).width(); // screen width
    this.screenHeight = $(window).height();
    this.scale = this.screen > this.screenHeight ? this.screenHeight / 800 : this.screen / 1200;
    this.stickWidth = 180 * this.scale;
    this.steps = this.screen / this.stickWidth; // how many steps (stick width + margin) it takes from one end to another
  }


  /**
  *根据需要创建尽可能多的棒来填充屏幕
  *从屏幕的开始到结束。“步骤”属性用于此目的
  */
  generateSticks() {
    let numberOfSticks = Math.ceil(this.steps);
    for (let i = 0; i <= numberOfSticks; i++)
    new Stick();
  }

  generateBall() {
    this.balltween = new TimelineMax({ repeat: -1, paused: 1 });
    $('.scene .ball-holder').append('<div class="ball red" id="ball"></div>');
    this.bounce();
  }

  /**
   * 游戏开始时的问候
   */
  intro() {

    TweenMax.killAll();

    //TweenMax.to('.splash', 0.3, { opacity: 0, display: 'none', delay: 1 })

    $('.stop-game').css('display', 'none');
    $('.start-game').css('display', 'flex');

    let introTl = new TimelineMax();
    let ball = new TimelineMax({ repeat: -1, delay: 3 });
    introTl.
    fromTo('.start-game .logo-holder', 0.9, { opacity: 0 }, { opacity: 1 }).
    staggerFromTo('.start-game .logo span', 0.5, { opacity: 0 }, { opacity: 1 }, 0.08).
    staggerFromTo('.start-game .bar', 1.6, { y: '+100%' }, { y: '0%', ease: Elastic.easeOut.config(1, 0.3) }, 0.08).
    staggerFromTo('.start-game .ball-demo', 1, { scale: 0 }, { scale: 1, ease: Elastic.easeOut.config(1, 0.3) }, 0.8, 2);


    ball.fromTo('.start-game .section-1 .ball-demo', 0.5, { y: "0px" }, { y: "100px", scaleY: 1.1, transformOrigin: "bottom", ease: Power2.easeIn }).
    to('.start-game .section-1 .ball-demo', 0.5, { y: "0px", scaleY: 1, transformOrigin: "bottom", ease: Power2.easeOut,
      onStart: () => {
        while (this.prevColor == this.color) {
          this.color = new Color().getRandomColor();
        }
        this.prevColor = this.color;
        TweenMax.to('.start-game .section-1 .ball-demo', 0.5, { backgroundColor: this.color });
      } });

  }

  /**
  * 显示分数
   */
  showResult() {
    let score = this.score;
    $('.stop-game').css('display', 'flex');
    $('.stop-game .final-score').text(score + '!');
    $('.stop-game .result').text(this.showGrade(score));
    $('.nominee').show();

    let resultTimeline = new TimelineMax();
    resultTimeline.
    fromTo('.stop-game .score-container', 0.7, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, ease: Elastic.easeOut.config(1.25, 0.5) }).
    fromTo('.stop-game .final-score', 2, { scale: 0.5 }, { scale: 1, ease: Elastic.easeOut.config(2, 0.5) }, 0).
    fromTo('.stop-game .result', 1, { scale: 0.5 }, { scale: 1, ease: Elastic.easeOut.config(1.5, 0.5) }, 0.3);


  }

  /**
   * 获取玩家分数并生成欢呼副本
   * @param  {int} score
   * @return {string} grade
   */
  showGrade(score) {
    if (score > 30) return "Chuck Norris?";else
    if (score > 25) return "You're da man";else
    if (score > 20) return "Awesome";else
    if (score > 15) return "Great!";else
    if (score > 13) return "Nice!";else
    if (score > 10) return "Good Job!";else
    if (score > 5) return "Really?";else
    return "Poor...";
  }

  start() {

    this.stop(); // 游戏暂停

    $('.start-game, .stop-game').css('display', 'none'); // 隐藏所有的弹窗
    $('.nominee').hide();

    new Game();
    this.score = 0; // 重置

    this.isRunning = 1;

    // 清理球棍和球座
    // 并产生新的
    $('#sticks, .scene .ball-holder').html('');
    $('#score').text(this.score);
    this.generateSticks();
    this.generateBall();

    // 禁用手机场景动画
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)) {
      Animation.sceneAnimation();
    }
    this.moveToStart();
    this.moveScene();

    // 当游戏加速时，将时间刻度重置为正常
    this.timeline.timeScale(1);
    this.balltween.timeScale(1);
  }

  stop() {

    this.isRunning = 0;

    $('.start-game, .stop-game').css('display', 'none');
    $('#sticks, .scene .ball-holder, #score').html('');
    TweenMax.killAll();

    this.showResult();
  }

  scaleScreen() {

    TweenMax.killAll(); // 防止多次调用resize

    let height = $(window).height();
    let width = $(window).width();

    this.calculateScale();

    $('.container').
    css('transform', 'scale(' + this.scale + ')').
    css('height', height / this.scale).
    css('width', width / this.scale).
    css('transformOrigin', 'left top');

    $('#sticks').width(this.screen / this.scale + 3 * this.stickWidth / this.scale);

  }


  /**
  *调用上面的函数
  *如果游戏正在运行，它会停止并显示分数
  *如果游戏停止，玩家将进入主菜单
  */
  scaleScreenAndRun() {

    this.scaleScreen();

    if (this.isRunning) {
      this.stop();
    } else {
      this.intro();
    }

  }


  /**
  *这是初始动画
  *操纵杆到达起始位置的位置
  *球出现并落下
  */
  moveToStart() {

    let tip = new TimelineMax({ delay: 2 });

    tip.
    fromTo('.learn-to-play', 1, { scale: 0 }, { scale: 1, opacity: 1, ease: Elastic.easeOut.config(1.25, 0.5) }).
    to('.learn-to-play', 1, { scale: 0, opacity: 0, ease: Elastic.easeOut.config(1.25, 0.5) }, 3);

    TweenMax.fromTo('#ball', this.time,
    {
      scale: 0 },

    {
      scale: 1,
      delay: this.time * (this.steps - 3 - 1.5),
      onComplete: () => {
        this.balltween.play();
      } });


    this.timeline.add(
    TweenMax.fromTo('#sticks', this.time * this.steps, { x: this.screen / this.scale }, { x: 0, ease: Power0.easeNone }));

  }

  /**
   * 移动棍子的动画
   */
  moveScene() {

    this.timeline.add(
    TweenMax.to('#sticks', this.time, { x: '-=180px', ease: Power0.easeNone, repeat: -1, onRepeat: () => {this.rearrange();} }));


  }


  /**
  *移除第一根棍子，并在末端添加一根
  *这给了操纵杆无限的运动
  */
  rearrange() {

    let scale = this.speedUp();

    this.timeline.timeScale(scale);
    this.balltween.timeScale(scale);

    $('#sticks .stick').first().remove();
    new Stick();

  }


  /**
  *游戏根据分数加速
  *在时间轴上调用GSAP时间刻度()函数来加速游戏
  *这将计算游戏应该加速多少
  */
  speedUp() {
    if (this.score > 30) {
      return 1.8;
    }
    if (this.score > 20) {
      return 1.7;
    }
    if (this.score > 15) {
      return 1.5;
    } else
    if (this.score > 12) {
      return 1.4;
    } else
    if (this.score > 10) {
      return 1.3;
    } else
    if (this.score > 8) {
      return 1.2;
    } else
    if (this.score > 5) {
      return 1.1;
    }
    return 1;
  }


  /**
  *球弹跳动画
  *它检查球和棒的颜色是否匹配
  *并改变球的颜色
  */
  bounce() {

    this.balltween.
    to('#ball', this.time / 2, { y: '+=250px', scaleY: 0.7, transformOrigin: "bottom", ease: Power2.easeIn,
      onComplete: () => {
        this.checkColor();
      } }).
    to('#ball', this.time / 2, { y: '-=250px', scaleY: 1.1, transformOrigin: "bottom", ease: Power2.easeOut,
      onStart: () => {
        while (this.prevColor == this.color) {
          this.color = new Color().getRandomColor();
        }
        this.prevColor = this.color;
        TweenMax.to('#ball', 0.5, { backgroundColor: this.color });
        $('#ball').removeClass('red').
        removeClass('yellow').
        removeClass('purple').
        addClass(new Color().colorcodeToName(this.color));
      } });

  }

  checkColor() {

    let ballPos = $('#ball').offset().left + $('#ball').width() / 2;
    let stickWidth = $('.stick').width();
    let score = this.score;

    $('#sticks .stick').each(function () {
      if ($(this).offset().left < ballPos && $(this).offset().left > ballPos - stickWidth) {

        if (Color.getColorFromClass($(this)) == Color.getColorFromClass('#ball')) {
          // 如果匹配增加了分数
          score++;
          $('#score').text(score);
          TweenMax.fromTo('#score', 0.5, { scale: 1.5 }, { scale: 1, ease: Elastic.easeOut.config(1.5, 0.5) });
        } else {

          // 游戏停止
          game.stop();

        }

      }
    });

    this.score = score;
  }}



class Stick {

  constructor() {
    this.stick = this.addStick();
  }

  addStick() {
    this.stick = $('#sticks').append('<div class="stick inactive"></div>');
    return this.stick;
  }}



class Color {

  constructor() {
    this.colors = ["#FF4571", "#FFD145", "#8260F6"];
    this.effects = ["bubble", "triangle", "block"];
    this.prevEffect = null;
  }

  getRandomColor() {
    let colorIndex = Math.random() * 3;
    let color = this.colors[Math.floor(colorIndex)];
    return color;
  }

  colorcodeToName(color) {
    let colors = ["#FF4571", "#FFD145", "#8260F6"];
    let names = ["red", "yellow", "purple"];
    let index = colors.indexOf(color);
    if (index == -1) return false;
    return names[index];
  }


  /**
  *改变元素的颜色
  *如我们所添加的颜色的口头名称
  */
  changeColor(el) {
    let index = el.data("index");
    if (index === undefined) {index = 0;} else
    {index += 1;}
    if (index == 3) index = 0;
    el.
    css('background-color', this.colors[index]).
    data('index', index);

    el.removeClass('red').
    removeClass('yellow').
    removeClass('purple').
    addClass(this.colorcodeToName(this.colors[index]));

    if (el.hasClass('inactive')) {
      this.setEffect(el);
      el.addClass('no-effect');
    }

    el.removeClass('inactive');
  }

  getRandomEffect() {
    let effectIndex = null;

    effectIndex = Math.floor(Math.random() * 3);
    while (effectIndex == this.prevEffect) {
      effectIndex = Math.floor(Math.random() * 3);
    }

    this.prevEffect = effectIndex;
    return this.effects[effectIndex];
  }

  /**
   * 将特效粒子添加到棒中
   */
  setEffect(el) {
    let effect = this.getRandomEffect();
    el.addClass(effect + '-stick');
    for (let i = 1; i <= 14; i++) {
      if (effect == 'block') {
        el.append(`<div class="${effect} ${effect}-${i}"><div class="inner"></div><div class="inner inner-2"></div></div>`);
      } else {
        el.append(`<div class="${effect} ${effect}-${i}"></div>`);
      }
    }
  }

  /**
   * 因为球和棍子有几个类别
   * 此方法搜索颜色类
   * @param el [DOM element]
   * @return {string} class name
   */
  static getColorFromClass(el) {
    let classes = $(el).attr('class').split(/\s+/);
    for (var i = 0, len = classes.length; i < len; i++) {
      if (classes[i] == 'red' || classes[i] == 'yellow' || classes[i] == 'purple') {
        return classes[i];
      }
    }
  }}


class Animation {

  /**
   * 在屏幕上创建并定位小发光元素
   */
  static generateSmallGlows(number) {
    let h = $(window).height();
    let w = $(window).width();
    let scale = w > h ? h / 800 : w / 1200;

    h = h / scale;
    w = w / scale;

    for (let i = 0; i < number; i++) {
      let left = Math.floor(Math.random() * w);
      let top = Math.floor(Math.random() * (h / 2));
      let size = Math.floor(Math.random() * 8) + 4;
      $('.small-glows').prepend('<div class="small-glow"></div>');
      let noise = $('.small-glows .small-glow').first();
      noise.css({ left: left, top: top, height: size, width: size });
    }
  }

  /**
  *创建棍子的动画
  *效果是随机选择的
  *三个功能之一是
  *相应地调用
  */
  playBubble(el) {
    let bubble = new TimelineMax();
    bubble.staggerFromTo(el.find('.bubble'), 0.3, { scale: 0.1 }, { scale: 1 }, 0.03);
    bubble.staggerTo(el.find('.bubble'), 0.5, { y: '-=60px', yoyo: true, repeat: -1 }, 0.03);
  }

  playTriangle(el) {
    let triangle = new TimelineMax();
    triangle.staggerFromTo(el.find('.triangle'), 0.3, { scale: 0.1 }, { scale: 1 }, 0.03).
    staggerTo(el.find('.triangle'), 1.5, {
      cycle: {
        rotationY: [0, 360],
        rotationX: [360, 0] },

      repeat: -1,
      repeatDelay: 0.1 },
    0.1);
  }

  playBlock(el) {
    let block = new TimelineMax();
    let block2 = new TimelineMax({ delay: 0.69 });

    block.staggerFromTo(el.find('.block'), 0.3, { scale: 0.1 }, { scale: 1 }, 0.03).
    staggerTo(el.find('.block .inner:not(.inner-2)'), 1, {
      cycle: {
        x: ["+200%", "-200%"] },

      repeat: -1,
      repeatDelay: 0.6 },
    0.1);
    block2.staggerTo(el.find('.block .inner-2'), 1, {
      cycle: {
        x: ["+200%", "-200%"] },

      repeat: -1,
      repeatDelay: 0.6 },
    0.1);
  }

  static sceneAnimation() {

    const speed = 15; // 使用它的本地速度

    // 动画小发光圆周运动
    $('.small-glow').each(function () {
      let speedDelta = Math.floor(Math.random() * 8);
      let radius = Math.floor(Math.random() * 20) + 20;
      TweenMax.to($(this), speed + speedDelta, { rotation: 360, transformOrigin: "-" + radius + "px -" + radius + "px", repeat: -1, ease: Power0.easeNone });
    });

    var wavet = TweenMax.to('.top_wave', speed * 1.7 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
    var wave1 = TweenMax.to('.wave1', speed * 1.9 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
    var wave2 = TweenMax.to('.wave2', speed * 2 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
    var wave3 = TweenMax.to('.wave3', speed * 2.2 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });
    var wave4 = TweenMax.to('.wave4', speed * 2.4 / 42, { backgroundPositionX: '-=54px', repeat: -1, ease: Power0.easeNone });

    var mount1 = TweenMax.to('.mount1', speed * 8, { backgroundPositionX: '-=1760px', repeat: -1, ease: Power0.easeNone });
    var mount2 = TweenMax.to('.mount2', speed * 10, { backgroundPositionX: '-=1782px', repeat: -1, ease: Power0.easeNone });

    var clouds = TweenMax.to('.clouds', speed * 3, { backgroundPositionX: '-=1001px', repeat: -1, ease: Power0.easeNone });

  }}



var game = new Game();
var animation = new Animation();
var color = new Color();
var userAgent = window.navigator.userAgent;

Animation.generateSmallGlows(20);

$(document).ready(function () {
  //game.showResult();
  game.scaleScreen();
  game.intro();
  //game.start();
  //game.bounce();

  if ($(window).height() < 480) {
    $('.play-full-page').css('display', 'block');
  }
});

$(document).on('click', '.stick', function () {
  color.changeColor($(this));
  if ($(this).hasClass('no-effect')) {
    if ($(this).hasClass('bubble-stick')) {
      animation.playBubble($(this));
    } else if ($(this).hasClass('triangle-stick')) {
      animation.playTriangle($(this));
    } else if ($(this).hasClass('block-stick')) {
      animation.playBlock($(this));
    }
    $(this).removeClass('no-effect');
  }
});

$(document).on('click', '.section-2 .bar', function () {
  color.changeColor($(this));
});

$(window).resize(function () {
  if (!userAgent.match(/iPad/i) && !userAgent.match(/iPhone/i)) {
    game.scaleScreenAndRun();
  }
});

$(window).on("orientationchange", function () {
  game.scaleScreenAndRun();
});