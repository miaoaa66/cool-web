gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(MotionPathPlugin)

const rx = window.innerWidth < 1000 ? window.innerWidth / 1200 : 1
const ry = window.innerHeight < 700 ? window.innerHeight / 1200 : 1

const path = [
			// 1
			{ x: 800, y: 200 },
			{ x: 900, y: 20 },
			{ x: 1100, y: 100 },
			// 2
			{ x: 1000, y: 200 },
			{ x: 900, y: 20 },
			{ x: 10, y: 500 },
			// 3
			{ x: 100, y: 300 },
			{ x: 500, y: 400 },
			{ x: 1000, y: 200 },
			// 4
			{ x: 1100, y: 300 },
			{ x: 400, y: 400 },
			{ x: 200, y: 250 },
			// 5
			{ x: 100, y: 300 },
			{ x: 500, y: 450 },
			{ x: 1100, y: 500 }
		]

const scaledPath = path.map(({ x, y }) => {
	return {
		x: x * rx,
		y: y * ry
	}
})

const sections = [...document.querySelectorAll('section')]
const fish = document.querySelector('.fish')
const fishHeadAndBody = 
			[
				...document.querySelectorAll('.fish__head'),
				...document.querySelectorAll('.fish__body')
			]
const lights = [...document.querySelectorAll('[data-lights]')]
const rays = document.querySelector('[data-rays]')

const bubbles = gsap.timeline()
bubbles.set('.bubbles__bubble', {
	y: 100,
})
bubbles.to('.bubbles__bubble', {
	scale: 1.2,
	y: -300,
	opacity: 1,
	duration: 2,
	stagger: 0.2,
})
bubbles.to('.bubbles__bubble', {
	scale: 1,
	opacity: 0,
	duration: 1,
}, '-=1')

bubbles.pause()

const tl = gsap.timeline({
	scrollTrigger: {
		scrub: 1.5,
	},
})
tl.to(fish, {
	motionPath: {
		path: scaledPath,
		align: 'self',
		alignOrigin: [0.5, 0.5],
		autoRotate: true
	},
	duration: 10,
	immediateRender: true,
	// ease: 'power4'
})
tl.to('.indicator', {
	opacity: 0
}, 0)
tl.to(fish, {
	rotateX: 180
}, 1)
tl.to(fish, {
	rotateX: 0
}, 2.5)
tl.to(fish, {
	z: -500,
	duration: 2,
}, 2.5)
tl.to(fish, {
	rotateX: 180
}, 4)
tl.to(fish, {
	rotateX: 0
}, 5.5)
tl.to(fish, {
	z: -50,
	duration: 2,
}, 5)
tl.to(fish, {
	rotate: 0,
	duration: 1,
}, '-=1')
tl.to('.fish__skeleton', {
	opacity: 0.6,
	duration: 0.1,
	repeat: 4
}, '-=3')
tl.to(fishHeadAndBody, {
	opacity: 0,
	duration: 0.1,
	repeat: 4
}, '-=3')
tl.to('.fish__inner', {
	opacity: 0.1,
	duration: 1
}, '-=1')
tl.to('.fish__skeleton', {
	opacity: 0.1,
	duration: 1
}, '-=1')

bubbles.play()
tl.pause()

const lightsTl = gsap.timeline({
	scrollTrigger: {
		scrub: 6
	}
})
lightsTl.from(lights[0], {
	x: window.innerWidth * -1,
	y: window.innerHeight,
	ease: 'power4.out',
	duration: 80
}, 0)
lightsTl.to(lights[0], {
	x: window.innerWidth,
	y: window.innerHeight * -1,
	ease: 'power4.out',
	duration: 80
}, '-=5')

const makeBubbles = (p, i) => {
	const { top, left } = fish.getBoundingClientRect()
	gsap.to(p, { opacity: 1, duration: 1 })
	gsap.set('.bubbles', {
		x: left,
		y: top
	})
	if (bubbles.paused) {
		bubbles.restart()
	}
	if (i > 6) {
		gsap.to('.bubbles', {
			opacity: 0
		})
	}
}

const rotateFish = (self) => {
	if (self.direction === -1) {
		gsap.to(fish, { rotationY: 180, duration: 0.4 })
	} else {
		gsap.to(fish, { rotationY: 0, duration: 0.4 })
	}
}

const hideText = (p) => {
	gsap.to(p, { opacity: 0, duration: 1 })
}

sections.forEach((section, i) => {
	const p = section.querySelector('p')
	gsap.to(p, { opacity: 0 })
	
	ScrollTrigger.create({
		trigger: section,
		start: "top top",
		onEnter: () => makeBubbles(p, i),
		onEnterBack: () => {
			if (i <= 6) {
				gsap.to('.bubbles', {
					opacity: 1
				})
			}
		},
		onLeave: () => {
			hideText(p)
			if (i == 0) {
			gsap.to('.rays', {
				opacity: 0,
				y: -500,
				duration: 8,
				ease: 'power4.in'
			})
			}
		},
		onLeaveBack: () => hideText(p),
		onUpdate: (self) => rotateFish(self)
	})
})