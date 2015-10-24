"use strict";
document.rootElement.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
var universe = new Rectangle(new Point(0, 0), Infinity, Infinity),
	xmlns = "http://www.w3.org/2000/svg";

function degToRad(deg) {
	return deg * (Math.PI/180);
}
function radToDeg(rad) {
	return rad * (180/Math.PI);
}

var dObjs = [];

function dObj() {
	this.label = document.createElementNS(xmlns, "text");
	this.label.setAttribute("fill", "black");
	this.label.setAttribute("font-size", "16");
	this.label.setAttribute("y", 16);

	this.moveImage();
	this.label.textContent = this.box.center.x + ", " + this.box.center.y;

	this.image.appendChild(this.label);
	document.rootElement.appendChild(this.image);


	var boundDrag = dObj.prototype.drag.bind(this);

	this.image.addEventListener("mousedown", function() {
		document.addEventListener("mousemove", boundDrag);
	});
	this.image.addEventListener("mouseup", function() {
		document.removeEventListener("mousemove", boundDrag);
	});

	dObjs.push(this);
	this.collided = false;
}
dObj.prototype.checkColl = function(thisObj) {
	dObjs.forEach(function(obj) {
		if(obj !== thisObj) {
			if(universe.collide(obj.box, thisObj.box)) {
				thisObj.collided = true;
				obj.collided = true;
			}
		}
	});
	dObjs.forEach(function(obj) {
		if(obj.collided) obj.image.firstChild.setAttribute("fill", "red");
		else obj.image.firstChild.setAttribute("fill", "green");

		obj.collided = false;
	});
};
dObj.prototype.drag = function(e) {
	this.box.center.x = e.clientX;
	this.box.center.y = e.clientY;
	this.label.textContent = this.box.center.x + ", " + this.box.center.y;

	this.moveImage();
	dObj.prototype.checkColl(this);
}



function dRect(point, width, height, angle) {
	this.box = new Rectangle(point, width, height, angle);

	this.image = document.createElementNS(xmlns, "g");

	var rect = document.createElementNS(xmlns, "rect");
	rect.setAttribute("height", this.box.height);
	rect.setAttribute("width", this.box.width);
	if(angle !== undefined) rect.setAttribute("transform", "rotate(" + radToDeg(angle) + " " + width/2  + " " + height/2 + ")");
	this.image.appendChild(rect);

	return dObj.call(this);
}
dRect.prototype.moveImage = function() {
	this.image.setAttribute("transform", "translate(" + (this.box.center.x - this.box.width/2) + ", " + (this.box.center.y - this.box.height/2) + ")");
}

function dCircle(point, radius) {
	this.box = new Circle(point, radius);

	this.image = document.createElementNS(xmlns, "g");

	var circle = document.createElementNS(xmlns, "circle");
	circle.setAttribute("r", this.box.radius);
	this.image.appendChild(circle);

	return dObj.call(this);
}
dCircle.prototype.moveImage = function() {
	this.image.setAttribute("transform", "translate(" + this.box.center.x + ", " + this.box.center.y + ")");
}

new dRect(new Point(400, 100), 50, 50, 73245*Math.PI/6323);
new dRect(new Point(600, 150), 270, 200, 3*Math.PI/4);

//new dCircle(new Point(400, 200), 30);
//new dCircle(new Point(400, 400), 100);
