const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Start listening to resize events and draw canvas.
initialize();

function initialize() {
	// Register an event listener to call the resizeCanvas() function 
	// each time the window is resized.
	window.addEventListener('resize', resizeCanvas, false);
	// Draw canvas border for the first time.
	resizeCanvas();
}

// Display custom canvas. In this case it's a blue, 5 pixel 
// border that resizes along with the browser window.
function redraw() {
	// c.strokeStyle = 'blue';
	// c.lineWidth = '5';
	c.strokeRect(0, 0, window.innerWidth, window.innerHeight);
}

// Function to update the UI bar
function updateCooldownBar(cdTimer, coolDown) {
	var cooldownBar = document.getElementById("cooldown-bar");
	var cooldownFill = document.getElementById("cooldown-fill");
	var progress = (coolDown - cdTimer) / coolDown * 100;
	cooldownFill.style.width = progress + "%";
	console.log(cooldownBar.style.width)
}

// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	redraw();
}

// canvas.width = 1920
// canvas.height = 1280

collisionsMap = []
for (let i = 0; i < collisions.length; i += 80) {
	collisionsMap.push(collisions.slice(i, i + 80))
}

const boundaries = []
const offset = {
	x: -1200,
	y: -2000
}

collisionsMap.forEach((row, i) => {
	row.forEach((symbol, j) => {
		if (symbol === 131)
			boundaries.push(
				new Boundary({
					position: {
						x: j * Boundary.width + offset.x,
						y: i * Boundary.height + offset.y
					}
				})
			)
	})
})

const player = new Sprite({
	position: {
		x: canvas.width / 2 - 1024 / 4 / 2, y: canvas.height / 2 - 256 / 2,
		//x: canvas.width / 2 - 1024 / 4 / 2, //player image width = 256
		//y: canvas.height / 2 - 256 / 2 //player image height = 80. Use static value to avoid slow loading
	},
	image: IdleDownImage,
	frames: {
		max: 4
	},
	sprites: {
		idleUp: IdleUpImage,
		idleDown: IdleDownImage,
		idleLeft: IdleLeftImage,
		idleRight: IdleRightImage,

		rollUp: rollUpImage,
		rollDown: rollDownImage,
		rollLeft: rollLeftImage,
		rollRight: rollRightImage,

		up: playerUpImage,
		down: playerDownImage,
		left: playerLeftImage,
		right: playerRightImage,

		attackDown: attackDownImage,
		attackUp: attackUpImage,
		attackLeft: attackLeftImage,
		attackRight: attackRightImage

	}
})


// const hair = new Sprite({
// 	position: {
// 		x: canvas.width / 2 - 1024 / 4 / 2, //player image width = 256
// 		y: canvas.height / 2 - 256 / 2 //player image height = 80. Use static value to avoid slow loading
// 	},
// 	image: hairDownImage,
// 	frames: {
// 		max: 6
// 	},
// 	sprites: {
// 		hairUp: hairUpImage,
// 		hairDown: hairDownImage,
// 		hairLeft: hairLeftImage,
// 		hairRight: hairRightImage,
// 	}
// })

// const clothe = new Sprite({
// 	position: {
// 		x: canvas.width / 2 - 1024 / 4 / 2, //player image width = 256
// 		y: canvas.height / 2 - 256 / 2 //player image height = 80. Use static value to avoid slow loading
// 	},
// 	image: clotheDownImage,
// 	frames: {
// 		max: 6
// 	},
// 	sprites: {
// 		clotheUp: clotheUpImage,
// 		clotheDown: clotheDownImage,
// 		clotheLeft: clotheLeftImage,
// 		clotheRight: clotheRightImage,
// 	}
// })

const shadow = new Sprite({
	position: {
		x: canvas.width / 2 - 1024 / 4 / 2, //player image width = 256
		y: canvas.height / 2 - 256 / 2 //player image height = 80. Use static value to avoid slow loading
	},
	image: shadowImage,
	frames: {
		max: 4
	}
})

const homePortal = new Sprite({
	position: {
		x: canvas.width / 2 - 3800 / 10 / 2, 
		y: canvas.height / 2 - 380 / 2 
	},
	image: portalImage,
	frames: {
		max: 8
	}
})

const background = new Sprite({
	position: {
		x: offset.x,
		y: offset.y
	},
	image: image
})

const foreground = new Sprite({
	position: {
		x: offset.x,
		y: offset.y
	},
	image: foregroundImage
})

const keys = {
	w: {
		pressed: false
	},
	a: {
		pressed: false
	},
	s: {
		pressed: false
	},
	d: {
		pressed: false
	},
	j: {
		pressed: false
	},
	k: {
		pressed: false
	}
}

// movement variables
let moveSpeed = 2;
let rollingSpeed = 3;

let lastKey = ''
const portals = [homePortal]
const movables = [background, ...boundaries, foreground, homePortal]

function rectangularCollision({ rectangle1, rectangle2 }) {
	return (
		rectangle1.position.x + rectangle1.width >= rectangle2.position.x && //left
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width && //right
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height && //down
		rectangle1.position.y + rectangle1.height >= rectangle2.position.y //up
	)
}

const actions = {
	roll: { frames: 80, inProgress: false, cooldown: 200, cdTimer: 0 },
	attack: { frames: 80, inProgress: false, cooldown: 10, cdTimer: 0 }
}

let forcemoving = true //variable to force-stop some actions(attack, etc)
let portalCooldown = 0;

function forwardToNewDestination(portalName) {
	switch (portalName) {
		case homePortal:
			var result = confirm("Taking you back to homepage. Are you ready?");
      		if (result) {
        		// User clicked OK, perform the desired action
        		// Add your code here
        		window.location.href = "index.html";
				portalCooldown = 400
				resetKeys()
      		} else {
        		// cancel
				// portal cooldown reset 
				portalCooldown = 400
				resetKeys()
			}
	}
}

function animate() {
	window.requestAnimationFrame(animate)
	background.draw()
	boundaries.forEach(boundary => {
		boundary.draw()
	})
	homePortal.draw()
	// dummyTarget.draw()
	player.draw()
	// clothe.draw()
	// hair.draw()
	foreground.draw()

	player.moving = false
	// hair.moving = false

	// default states
	homePortal.moving = true

	let moving = true
	actions.roll.cdTimer--
	actions.attack.cdTimer--
	if (actions.roll.cdTimer >= 0) {
		updateCooldownBar(actions.roll.cdTimer, actions.roll.cooldown)
	} 

	if (!forcemoving)
		moving = false

	// check for collision w home portal
	if ( portalCooldown-- < 0 &&
		rectangularCollision({
			rectangle1: {
				width: 4 * 4, // Width of the attack Change according to the image
				height: 4 * 4, // Height of the attack Change according to the image
				position: {
					x: player.position.x + 40 * 4,
					y: player.position.y + 35 * 4 
				}
			},
			rectangle2: {
				width: 10 * 4, // Width of the attack Change according to the image
				height: 24 * 4, // Height of the attack Change according to the image
				position: {
					x: homePortal.position.x + 22 * 4,
					y: homePortal.position.y + 10 * 4 
				}
			}
		})  
	) {
		forwardToNewDestination(homePortal)
	}

	if (keys.j.pressed || actions.roll.inProgress/*&& lastKey === 'j'*/) {
		actions.roll.cdTimer = actions.roll.cooldown
		keys.j.pressed = false
		player.moving = true
		switch (lastKey) {
			case 'w':
				actions.roll.inProgress = true
				player.moving = true
				actions.roll.frames--
				if (actions.roll.inProgress) {
					player.image = player.sprites.rollUp
					for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]

						if (
							rectangularCollision({
								rectangle1: {
									width: 4 * 4, // Change according to the image
									height: 4 * 4, // Change according to the image
									position: {
										x: player.position.x + 30 * 4,
										y: player.position.y + 38 * 4
									}
								},
								rectangle2: {
									...boundary,
									position: {
										x: boundary.position.x,
										y: boundary.position.y + rollingSpeed
									}
								}
							})
						) {
							moving = false
							break
						}
					}
					if (moving)
						movables.forEach((movable) => {
							movable.position.y += rollingSpeed
						})
				}
				if (actions.roll.frames <= 0) {
					actions.roll.frames = 80
					actions.roll.inProgress = false
				}
				break

			case 'a':
				actions.roll.inProgress = true
				player.moving = true
				actions.roll.frames--
				if (actions.roll.inProgress) {
					player.image = player.sprites.rollLeft
					for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]

						if (
							rectangularCollision({
								rectangle1: {
									width: 4 * 4, // Change according to the image
									height: 4 * 4, // Change according to the image
									position: {
										x: player.position.x + 30 * 4,
										y: player.position.y + 38 * 4
									}
								},
								rectangle2: {
									...boundary,
									position: {
										x: boundary.position.x + rollingSpeed,
										y: boundary.position.y
									}
								}
							})
						) {
							moving = false
							break
						}
					}
					if (moving)
						movables.forEach((movable) => {
							movable.position.x += rollingSpeed
						})
				}
				if (actions.roll.frames <= 0) {
					actions.roll.frames = 80
					actions.roll.inProgress = false
				}
				break

			case 's':
				actions.roll.inProgress = true
				player.moving = true
				actions.roll.frames--
				if (actions.roll.inProgress) {
					player.image = player.sprites.rollDown
					for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]

						if (
							rectangularCollision({
								rectangle1: {
									width: 4 * 4, // Change according to the image
									height: 4 * 4, // Change according to the image
									position: {
										x: player.position.x + 30 * 4,
										y: player.position.y + 38 * 4
									}
								},
								rectangle2: {
									...boundary,
									position: {
										x: boundary.position.x,
										y: boundary.position.y - rollingSpeed
									}
								}
							})
						) {
							moving = false
							break
						}
					}
					if (moving)
						movables.forEach((movable) => {
							movable.position.y -= rollingSpeed
						})
				}
				if (actions.roll.frames <= 0) {
					actions.roll.frames = 80
					actions.roll.inProgress = false
				}
				break

			case 'd':
				actions.roll.inProgress = true
				player.moving = true
				actions.roll.frames--
				if (actions.roll.inProgress) {
					player.image = player.sprites.rollRight
					for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]

						if (
							rectangularCollision({
								rectangle1: {
									width: 4 * 4, // Change according to the image
									height: 4 * 4, // Change according to the image
									position: {
										x: player.position.x + 30 * 4,
										y: player.position.y + 38 * 4
									}
								},
								rectangle2: {
									...boundary,
									position: {
										x: boundary.position.x - rollingSpeed,
										y: boundary.position.y
									}
								}
							})
						) {
							moving = false
							break
						}
					}
					if (moving)
						movables.forEach((movable) => {
							movable.position.x -= rollingSpeed
						})
				}
				if (actions.roll.frames <= 0) {
					actions.roll.frames = 80
					actions.roll.inProgress = false
				}
				break
		}
	}
	else if (keys.k.pressed || actions.attack.inProgress/*&& lastKey === 'j'*/) {
		actions.attack.cdTimer = actions.attack.cooldown
		keys.k.pressed = false
		player.moving = true
		forcemoving = false
		switch (lastKey) {
			case 'w':
				actions.attack.inProgress = true
				player.moving = true
				actions.attack.frames--
				if (actions.attack.inProgress) {
					player.image = player.sprites.attackUp
					/*for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]

						if (
							rectangularCollision({ 
								rectangle1: { 
									width: 4*4, // Change according to the image
									height: 4*4, // Change according to the image
									position: {
										x: player.position.x + 30 * 4,
										y: player.position.y + 38 * 4
									}
								}, 
								rectangle2: {
									...boundary, 
									position: {
										x: boundary.position.x,
										y: boundary.position.y + moveSpeed
									}
								}
							})
						) {
							moving = false
							break
						}
				}*/ //attack collision
				}
				if (actions.attack.frames <= 0) {
					actions.attack.frames = 80
					actions.attack.inProgress = false
					forcemoving = true
				}
				break

			case 'a':
				actions.attack.inProgress = true
				player.moving = true
				actions.attack.frames--
				if (actions.attack.inProgress) {
					player.image = player.sprites.attackLeft
					/*for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]

						if (
							rectangularCollision({ 
								rectangle1: { 
									width: 4*4, // Change according to the image
									height: 4*4, // Change according to the image
									position: {
										x: player.position.x + 30 * 4,
										y: player.position.y + 38 * 4
									}
								}, 
								rectangle2: {
									...boundary, 
									position: {
										x: boundary.position.x + moveSpeed,
										y: boundary.position.y
									}
								}
							})
						) {
							moving = false
							break
						}
				}*/
				}
				if (actions.attack.frames <= 0) {
					actions.attack.frames = 80
					actions.attack.inProgress = false
					forcemoving = true
				}
				break

			case 's':
				actions.attack.inProgress = true
				player.moving = true
				actions.attack.frames--
				if (actions.attack.inProgress) {
					player.image = player.sprites.attackDown
					/*for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]

						if (
							rectangularCollision({ 
								rectangle1: { 
									width: 4*4, // Change according to the image
									height: 4*4, // Change according to the image
									position: {
										x: player.position.x + 30 * 4,
										y: player.position.y + 38 * 4
									}
								}, 
								rectangle2: {
									...boundary, 
									position: {
										x: boundary.position.x,
										y: boundary.position.y - moveSpeed
									}
								}
							})
						) {
							moving = false
							break
						}
				}*/
				}
				if (actions.attack.frames <= 0) {
					actions.attack.frames = 80
					actions.attack.inProgress = false
					forcemoving = true
				}
				break

			case 'd':
				actions.attack.inProgress = true
				player.moving = true
				actions.attack.frames--
				if (actions.attack.inProgress) {
					player.image = player.sprites.attackRight
					/*for (let i = 0; i < boundaries.length; i++) {

						const boundary = boundaries[i]
					
					if (
						rectangularCollision({
							rectangle1: {
								width: 9 * 4, // Width of the attack Change according to the image
								height: 3 * 4, // Height of the attack Change according to the image
								position: {
									x: player.position.x + 36 * 4,
									y: player.position.y + 34 * 4
								}
							},
							rectangle2: dummyTarget
						}) && actions.attack.frames === 40 //hit once at the middle frame of the action
					) {
						console.log("hit")
						doDamage()
					}*/
				}

				if (actions.attack.frames <= 0) {
					actions.attack.frames = 80
					actions.attack.inProgress = false
					forcemoving = true
				}
				break
		}
	}
	else if (keys.w.pressed && lastKey === 'w') {
		player.moving = true
		// hair.moving = true
		// clothe.moving = true
		player.image = player.sprites.up
		for (let i = 0; i < boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectangularCollision({
					rectangle1: {
						width: 4 * 4, // Change according to the image
						height: 4 * 4, // Change according to the image
						position: {
							x: player.position.x + 30 * 4,
							y: player.position.y + 38 * 4
						}
					},
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x,
							y: boundary.position.y + moveSpeed
						}
					}
				})
			) {
				moving = false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.y += moveSpeed
			})
	}

	else if (keys.a.pressed && lastKey === 'a') {
		player.moving = true
		// hair.moving = true
		// clothe.moving = true
		player.image = player.sprites.left
		for (let i = 0; i < boundaries.length; i++) {

			const boundary = boundaries[i]

			if (
				rectangularCollision({
					rectangle1: {
						width: 4 * 4, // Change according to the image
						height: 4 * 4, // Change according to the image
						position: {
							x: player.position.x + 30 * 4,
							y: player.position.y + 38 * 4
						}
					},
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x + moveSpeed,
							y: boundary.position.y
						}
					}
				})
			) {
				moving = false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.x += moveSpeed
			})
	}
	else if (keys.s.pressed && lastKey === 's') {
		player.moving = true
		// hair.moving = true
		// clothe.moving = true
		player.image = player.sprites.down
		for (let i = 0; i < boundaries.length; i++) {

			const boundary = boundaries[i]

			if (
				rectangularCollision({
					rectangle1: {
						width: 4 * 4, // Change according to the image
						height: 4 * 4, // Change according to the image
						position: {
							x: player.position.x + 30 * 4,
							y: player.position.y + 38 * 4
						}
					},
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x,
							y: boundary.position.y - moveSpeed
						}
					}
				})
			) {
				moving = false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.y -= moveSpeed
			})
	}
	else if (keys.d.pressed && lastKey === 'd') {
		player.moving = true
		// hair.moving = true
		// clothe.moving = true
		player.image = player.sprites.right
		for (let i = 0; i < boundaries.length; i++) {

			const boundary = boundaries[i]

			if (
				rectangularCollision({
					rectangle1: {
						width: 4 * 4, // Change according to the image
						height: 4 * 4, // Change according to the image
						position: {
							x: player.position.x + 30 * 4,
							y: player.position.y + 38 * 4
						}
					},
					rectangle2: {
						...boundary,
						position: {
							x: boundary.position.x - moveSpeed,
							y: boundary.position.y
						}
					}
				})
			) {
				moving = false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {
				movable.position.x -= moveSpeed
			})
	}
	else {
		player.moving = true
		// hair.moving = true
		// clothe.moving = true
		switch (lastKey) {
			case 'w':
				player.image = player.sprites.idleUp
				// hair.image = hair.sprites.hairUp
				// clothe.image = clothe.sprites.clotheUp
				break;
			case 'a':
				player.image = player.sprites.idleLeft
				// hair.image = hair.sprites.hairLeft
				// clothe.image = clothe.sprites.clotheLeft
				break;
			case 's':
				player.image = player.sprites.idleDown
				// hair.image = hair.sprites.hairDown
				// clothe.image = clothe.sprites.clotheDown
				break;
			case 'd':
				player.image = player.sprites.idleRight
				// hair.image = hair.sprites.hairRight
				// clothe.image = clothe.sprites.clotheRight
				break;
		}
	}
}

animate()

window.addEventListener('keydown', (e) => {
	switch (e.key) {
		case 'w':
			keys.w.pressed = true
			lastKey = 'w'
			break
		case 'a':
			keys.a.pressed = true
			lastKey = 'a'
			break
		case 's':
			keys.s.pressed = true
			lastKey = 's'
			break
		case 'd':
			keys.d.pressed = true
			lastKey = 'd'
			break
		case 'j':
			if (actions.roll.cdTimer <= 0)
				keys.j.pressed = true
			//lastKey ='j'
			break
		case 'k':
			if (actions.attack.cdTimer <= 0)
				keys.k.pressed = true
			//lastKey ='k'
			break
	}
})

function resetKeys() {
	keys.w.pressed = false
			
	keys.a.pressed = false
			
	keys.s.pressed = false
			
	keys.d.pressed = false
			
	keys.j.pressed = false
			
	keys.k.pressed = false
}

window.addEventListener('keyup', (e) => {
	switch (e.key) {
		case 'w':
			keys.w.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			break
		case 's':
			keys.s.pressed = false
			break
		case 'd':
			keys.d.pressed = false
			break
		case 'j':
			keys.j.pressed = false
			break
		case 'k':
			keys.k.pressed = false
			break
	}
})