# canvas-image-crop

Live Demo: https://jsfiddle.net/vietvo90s/d8vfwm0g/12/

### Screenshot

![canvas%20image%20crop%20e3990b1afaca4b5baef016d1c9a964d0/screen_shot.png](canvas%20image%20crop%20e3990b1afaca4b5baef016d1c9a964d0/screen_shot.png)

### Example

```html
<canvas id="canvas_crop" class="hide"></canvas>
<canvas id="canvas" class="hide"></canvas>

<button onclick="JCanvasImageCrop.zoomIn()">+</button>
<button onclick="JCanvasImageCrop.zoomOut()">-</button>
<button onclick="JCanvasImageCrop.zoomOff()">x</button>

<script type="text/javascript" src="jquery-3.5.1.min.js"></script>
<script type="text/javascript" src="js/canvas_image_crop.js"></script>
<script type="text/javascript">
		JCanvasImageCrop.init(
				// canvasId
				'canvas',
				// canvasCropId
				'canvas_crop',
			 	// imageUrl
				'https://www.w3schools.com/html/pic_trulli.jpg'
			);
	</script>
```
