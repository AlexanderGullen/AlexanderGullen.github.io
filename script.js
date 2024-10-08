import subtitles from "./objects/subtitles.json" with { type: "json" };
import backgrounds from "./objects/backgrounds.json" with { type: "json" };

/* Utilities */

/**
 * Somewhat efficient function to transform 2 uniformly distributed values into values on a gaussian distribution
 * https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 * @param {!number} u1 - 1st uniformly distributed random number
 * @param {!number} u2 - 2nd uniformly distributed random number
 */

function boxMuller(u1,u2){
	let R = Math.sqrt( -2 * Math.log(u2));
	let phi = 2 * Math.PI * u1;
	return [R * Math.cos(phi), R * Math.sin(phi)];

}

/**
 * Converts numeric color values to a string usable for parsing color in javascript
 * Implementation taken from https://github.com/sigvef/arktis-tweet-demo
 * @param {number} r - numeric value from 0 to 255 representing the intensity of the color red
 * @param {number} g - numeric value from 0 to 255 representing the intensity of the color green
 * @param {number} b - numeric value from 0 to 255 representing the intensity of the color blue
 * @param {number} a - numeric value from 0 to 1 representing the intensity of the alpha channel (i.e the transparancy of the color)
 */

function numToRGBA(r,g,b,a){
	a = a === undefined ? 1 : a;
       	return "rgba("+(r|0)+","+(g|0)+","+(b|0)+","+a+")";
}

/**
 * Function to render the instructions provided JavaScript string onto a HTML5 canvas
 * the function includes a custom implementation of this https://github.com/sigvef/arktis-tweet-demo microframework
 * @param {Object} canvas - HTML5 Canvas being rendered to
 * @param {Object} context - CanvasRenderingContext that will be drawn to
 * @param {number} time - Value to control time passed into the code
 * @param {string} code - The code that will run when this function is executed 
 *
 */
function backgroundRender(canvas,context,time,code){
	//NOTE: using new Function() in this way to dynamically generate code is inherintly unsafe, however since this implementation only loads the code from a client side JSON file there **should be** minimal risk.
	
	let callback = new Function('c','x','t','S','C','T','R',code);
	callback(canvas,context,time,Math.sin,Math.cos,Math.tan,numToRGBA)
}

const [subtitleGaussianValue,heroBackgroundGaussianValue] = boxMuller(Math.random(),Math.random())

//TODO: update these to a more mathematically rigourous (and computationally efficient) value
const subtitleIndex = Math.abs(Math.floor(subtitleGaussianValue * subtitles.length % subtitles.length))
let heroBackgroundIndex = Math.abs(Math.floor(heroBackgroundGaussianValue * backgrounds.length % backgrounds.length))

/* Subtitle */

const subtitle = document.getElementById("subtitle");

subtitle.innerHTML = subtitles[subtitleIndex];

/* Background */

const heroBackgroundSelector = document.getElementById("selector");

/* Hero */

const c = document.getElementById("background");
const x = c.getContext("2d");

// initialization code for the FPS counter
const heroFpsIndicator = document.getElementById("fps");
let secondsPassed = 0;
let frameStart = 0;

console.log(heroBackgroundIndex)
console.log(backgrounds[heroBackgroundIndex].code)

function heroGameLoop(t){

	//calculate FPS
	secondsPassed = (t - frameStart) / 1000;
	frameStart = t;
	heroFpsIndicator.innerHTML = Math.round(1/secondsPassed) + 'fps';
	try {
		backgroundRender(c,x,t,backgrounds[heroBackgroundIndex].code);
	} catch (error) {

		let errorMessage = "[Development in progress]";
		x.fillStyle = "#005b24";
		x.font = "10em league-spartan";
		x.fillText(errorMessage,960 - (x.measureText(errorMessage).width/2),520);
	}
		
	requestAnimationFrame(heroGameLoop);
}

requestAnimationFrame(heroGameLoop)
