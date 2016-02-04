"use strict";
document.rootElement.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
var mainUniverse = document.getElementById("mainUniverse"),
	universe = new Rectangle(new Point(0, 0), mainUniverse.getAttribute("width") === "100%" ? Infinity : parseInt(mainUniverse.getAttribute("width"), 10), mainUniverse.getAttribute("height") === "100%" ? Infinity : parseInt(mainUniverse.getAttribute("height"), 10)),
	xmlns = "http://www.w3.org/2000/svg";

function degToRad(deg) {
	return deg * (Math.PI/180);
}
function radToDeg(rad) {
	return rad * (180/Math.PI);
}
function collide(objOne, objTwo) {
	var collOne = universe.collide(objOne, objTwo),
		collTwo = universe.collide(objTwo, objOne);

	if (collOne !== collTwo) throw new Error("Equivalent tests returned a different result");
	else return collOne;
}

var dObjs = [],
	 objBeingMoved = null,
	 deltaCenter = null;

function drag(e) {
	objBeingMoved.box.center.x = e.clientX + deltaCenter.x;
	objBeingMoved.box.center.y = e.clientY + deltaCenter.y;
	objBeingMoved.label.textContent = objBeingMoved.box.center.x + ", " + objBeingMoved.box.center.y;
	objBeingMoved.label.setAttribute("x", -objBeingMoved.label.getComputedTextLength()/2);

	objBeingMoved.moveImage();
	dObj.prototype.checkColl(objBeingMoved);
}

document.rootElement.addEventListener("mousedown", function(e) {
	var pointer = new Point(e.clientX, e.clientY);
	dObjs.forEach(function(obj) {//replace with .some()?
		if (collide(pointer, obj.box)) {
			objBeingMoved = obj;
			deltaCenter = new Vector(pointer, obj.box.center);

			document.addEventListener("mousemove", drag);
		}
	});

});
document.rootElement.addEventListener("mouseup", function() {
	document.removeEventListener("mousemove", drag);
});

function dObj() {
	this.label = document.createElementNS(xmlns, "text");
	this.label.setAttribute("fill", "black");
	this.label.setAttribute("font-size", "16");
	this.label.textContent = this.box.center.x + ", " + this.box.center.y;

	this.moveImage();

	this.image.appendChild(this.label);
	mainUniverse.appendChild(this.image);

	this.label.setAttribute("x", -this.label.getComputedTextLength()/2);

	dObjs.push(this);
	this.collided = false;
}
dObj.prototype.checkColl = function(thisObj) {
	dObjs.forEach(function(obj) {
		if (obj !== thisObj) {
			if (collide(obj.box, thisObj.box)) {
				thisObj.collided = true;
				obj.collided = true;
			}
		}
	});
	dObjs.forEach(function(obj) {
		if (obj.collided) obj.image.firstChild.setAttribute("fill", "red");
		else obj.image.firstChild.setAttribute("fill", "green");

		obj.collided = false;
	});
};



function dRect(point, width, height, angle) {
	this.box = new Rectangle(point, width, height, angle);

	this.image = document.createElementNS(xmlns, "g");

	var rect = document.createElementNS(xmlns, "rect");
	rect.setAttribute("height", this.box.height);
	rect.setAttribute("width", this.box.width);
	if (angle !== undefined) rect.setAttribute("transform", "rotate(" + radToDeg(angle) + " " + width/2  + " " + height/2 + ")");
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

var a = new Point(400, 100),
	b = new dRect(a, 50, 50*((1 + Math.sqrt(5))/2), 73245*Math.PI/6323);
b.box.center = new Point(45, 87);
b.moveImage();//resfresh position once center is replaced

//b.box.forget();
//new dRect(new Point(500, 150), 270, 200, 3*Math.PI/4);

//new dCircle(new Point(400, 200), 30);
new dCircle(new Point(400, 400), 100);
