console.clear();

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const sections = document.querySelectorAll("section");

// this scrolling object just allows us to conveniently call scrolling.enable(), scrolling.disable(), and check if scrolling.enabled is true. 
// some browsers (like iOS Safari) handle scrolling on a separate thread and can cause things to get out of sync (jitter/jumpy), so when we're animating the scroll position, force an update of GSAP tweens when there's a scroll event in order to maintain synchronization)
const scrolling = {
    enabled: true,
    events: "scroll,wheel,touchmove,pointermove".split(","),
    prevent: e => e.preventDefault(),
    disable() {
      if (scrolling.enabled) {
        scrolling.enabled = false;
        window.addEventListener("scroll", gsap.ticker.tick, {passive: true});
        scrolling.events.forEach((e, i) => (i ? document : window).addEventListener(e, scrolling.prevent, {passive: false}));
      }
    },
    enable() {
      if (!scrolling.enabled) {
        scrolling.enabled = true;
        window.removeEventListener("scroll", gsap.ticker.tick);
        scrolling.events.forEach((e, i) => (i ? document : window).removeEventListener(e, scrolling.prevent));
      }
    }
  };


function goToSection(section, anim, i) {
  if (scrolling.enabled) { // skip if a scroll tween is in progress
    scrolling.disable();
    gsap.to(window, {
      scrollTo: {y: section, autoKill: false},
      onComplete: scrolling.enable,
      duration: 1
    });

    anim && anim.restart();
  }
}

sections.forEach((section, i) => {
  const intoAnim = gsap.from(section.querySelector(".right-col"), {yPercent: 50, duration: 1, paused: true});
  
  ScrollTrigger.create({
    trigger: section,
    start: "top bottom-=1",
    end: "bottom top+=1",
    onEnter: () => goToSection(section, intoAnim),
    onEnterBack: () => goToSection(section)
  });
 
});


// 💚 This just adds the GSAP link to this pen, don't copy this bit
import { GSAPInfoBar } from "https://codepen.io/GreenSock/pen/vYqpyLg.js"
new GSAPInfoBar({ link: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/"});
// 💚 Happy tweening!