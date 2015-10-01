document.rootElement.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
var universe = new Rectangle(new Point(0, 0), Infinity, Infinity),
	xmlns = "http://www.w3.org/2000/svg";

function degToRad(deg) {
	return deg * (Math.PI/180);
}
function radToDeg(rad) {
	return rad * (180/Math.PI);
}

var dRects = [];

function dRect(point, width, height) {
	this.box = new Rectangle(point, width, height);

	this.image = document.createElementNS(xmlns, "rect");
	this.image.setAttribute("x", this.box.center.x);
	this.image.setAttribute("y", this.box.center.y);
	this.image.setAttribute("height", this.box.height);
	this.image.setAttribute("width", this.box.width);
	this.image.setAttribute("fill", "orange");
	document.rootElement.appendChild(this.image);


	var checkColl = function() {
		dRects.forEach(function(rect) {
			if(rect !== this) {
				if(universe.collide(rect.box, this.box)) {
					rect.image.setAttribute("fill", "red");
					this.image.setAttribute("fill", "red");
				} else {
					rect.image.setAttribute("fill", "green");
					this.image.setAttribute("fill", "green");
				}
			}
		}.bind(this));
	}.bind(this);

	checkColl();

	var drag = function(e) {
		this.box.center.x = e.clientX - this.box.width/2;
		this.box.center.y = e.clientY - this.box.height/2;

		this.image.setAttribute("x", this.box.center.x);
		this.image.setAttribute("y", this.box.center.y);

		checkColl();
	}.bind(this);

	this.image.addEventListener("mousedown", function(e) {
		document.addEventListener("mousemove", drag);
	}.bind(this));
	this.image.addEventListener("mouseup", function(e) {
		document.removeEventListener("mousemove", drag);
	}.bind(this));

	dRects.push(this);
}

new dRect(new Point(600, 150), 50, 50);
new dRect(new Point(400, 150), 50, 50);
