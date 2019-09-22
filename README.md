## Moving floor animation - React Component

![Moving floor](https://raw.githubusercontent.com/Wufe/floor-animation/master/images/screenshot.png)

***

## Installation

`yarn add @wufe/floor-animation`

## How to use

### Code

```javascript
import FloorAnimation from '@wufe/floor-animation';

const App = () => <div>
	<FloorAnimation />
</div>
```

### Props

|Prop|Type|Default|Definition|
|----|----|-------|----------|
|scale|number|60|Dimensions of the triangles (in px)|
|pitch|number|0|Pitch of the camera|
|yaw|number|3.05|Yaw of the camera|
|color|string|"#000"|Color for the background|
|mode|number|0|0 for simplex noise animation, 1 for random animation|
|precision|number|1|precision for simplex noise mode|
|canvasClassName|string|""|class name to be applied to the canvas|
|canvasStyle|object|{}|object containing css style for the canvas|
|listenWindowResize|bool|true|automatic recalc on resize|

***

### Reporting issues

+ Look for any related issues.  
+ If you find an issue that seems related, please comment there instead of creating a new one.  
+ If you find no related issue, create a new one.  
+ Include all details you can ( operative system, environment, interpreter version, etc.. ).  
+ Include the error log.  
+ Remember to check the discussion and update if there changes.  

### Contributing  

+ Fork the repository  
+ Create your feature branch  
+ Commit your changes and push the branch  
+ Submit a pull request