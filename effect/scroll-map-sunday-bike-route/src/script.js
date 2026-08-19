// tween the svg path + circle
gsap
  .timeline({
    defaults:{ ease:'none' },
    scrollTrigger:{ trigger:'#scrollDist', start:'0 0', end:'100% 100%', scrub:1}
  }) 
  .to('#c', {motionPath:'#p', immediateRender:true}, 0)
  .from('#p', {drawSVG:'0 0'}, 0)

// move container's x/y to follow the red circle
const xTo = gsap.quickTo('#container', 'x', {duration:0.7})
const yTo = gsap.quickTo('#container', 'y', {duration:0.7})
gsap.ticker.add( ()=> {
  xTo( -gsap.getProperty('#c', 'x') )
  yTo( -gsap.getProperty('#c', 'y') ) 
})

// center the container's left/top position
window.onload = window.onresize = ()=> gsap.set('#container', {left:innerWidth/2, top:innerHeight/2})

// fade in
gsap.to('#container', {duration:1, opacity:1, ease:'power2.inOut', delay:0.3})