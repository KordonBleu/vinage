"use strict";
function GeometricObject() {
	//To inherit from `GeometricObject`:
	// * call `return GeometricObject.call(this);` at the end of any constructor
	// * create a new prototype for your object, whose prototype is `GeometricObject.prototype`. Example: `YourConstructor.prototype = Object.create(GeometricObject.prototype);`.
	// * add a `_proxyMap` property to your object (directly or to its prototype).
	this._cache = {};
	this._upToDate = {};
	this._parents = [];
	if(typeof Proxy !== "undefined") return new Proxy(this, GeometricObject.proxyHandler);
}
GeometricObject.proxyHandler = {
	set: function(target, name, value) {
		if(name === "_proxyMap") {
			target[name] = value;
			return true;
		}
		if(target.hasOwnProperty(name)) {
			target[name] = value;
			for(var key in target._proxyMap) {
				if(key === name) {
					target._proxyMap[key].forEach(function(key) {
						if(target._parents.length === 0) target._upToDate[key] = false;
						else target._parents.forEach(function(parent) {
							parent._upToDate[key] = false;
						});
					});
					return true;
				}
			}
			return true;
		}
		return false;
	}
}
GeometricObject.prototype.circleObb = function(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight, rectAngle) {//haha, rectAngle
	var rot = rectAngle > 0 ? -rectAngle : -rectAngle + Math.PI,
		deltaX = circleX - rectX,
		deltaY = circleY - rectY,
		tCircleX = Math.cos(rot) * deltaX - Math.sin(rot) * deltaY + rectX,//rotate the circle around the center of the OOB
		tCircleY = Math.sin(rot) * deltaX + Math.cos(rot) * deltaY + rectY;//so that the OBB can be treated as an AABB
	deltaX = Math.abs(tCircleX - rectX);
	deltaY = Math.abs(tCircleY - rectY);

	if(deltaX > rectWidth / 2 + circleRadius || deltaY > rectHeight / 2 + circleRadius) return false;

	if(deltaX <= rectWidth / 2 || deltaY <= rectHeight / 2) return true;

	return Math.pow(deltaX - rectHeight/2, 2) + Math.pow(deltaY - rectWidth/2, 2) <= Math.pow(circleRadius, 2);
}
GeometricObject.prototype.obbObb = function(rectOneX, rectOneY, rectOneWidth, rectOneHeigth, rectOneAngle, rectTwoX, rectTwoY, rectTwoWidth, rectTwoHeigth, rectTwoAngle) {
	//rotate the first OOB to transform it in AABB to simplify calculations
	/*var rectTwoRot = rectTwo.angle - rectOne.angle,
		rectOne = new Rectangle(rectOne.center, rectOne.width, rectOne.height),
		rectTwo = new Rectangle(rectTwo.center, rectTwo.width, rectTwo.height, rectTwoRot);*/
	var rectOne = new Rectangle(new Point(rectOneX, rectOneY), rectOneWidth, rectOneHeigth, 0),
		rectTwo = new Rectangle(new Point(rectTwoX, rectTwoY), rectTwoWidth, rectTwoHeigth, rectTwoAngle - rectOneAngle);

	//we can't check against the diagonal because it is too CPU intensive
	var sideSum = rectTwo.width + rectTwo.height;//so we check against the sum of the sides which is > than the diagonal (not to much hopefully)
	if (!this.aabbAabb(rectOne, new Rectangle(new Point(rectTwo.center.x, rectTwo.center.y), sideSum, sideSum))) return false;//eliminates most non-collisions

	var axesVectOne = [new Vector(1, 0), new Vector(0, 1)],//rectOne is an AABB
		axesVectTwo = [];
	rectTwo.vertices.forEach(function(vertex, index, array) {
		var prevVertex = index === 0 ? array[array.length - 1] : array[index - 1],
		vector = new Vector(vertex, prevVertex).orthogonalVector;//this is stupid for a rectangle, not for a polygon

		//vector.normalize();
		axesVectTwo.push(vector);
	});
	var axesVect = axesVectOne.concat(axesVectTwo);

	return !axesVect.some(function(axis) {
		var projOne = rectOne.project(axis),
			projTwo = rectTwo.project(axis);

		return projOne.max < projTwo.min || projTwo.max < projOne.min;//overlapp or not
	});
}
GeometricObject.prototype.circleCircle = function(circleOneX, circleOneY, circleOneRadius, circleTwoX, circleTwoY, circleTwoRadius) {
	return Math.pow(circleOneX - circleTwoX, 2) + Math.pow(circleOneY - circleTwoY, 2) < Math.pow(circleOneRadius + circleTwoRadius, 2);
}
GeometricObject.prototype.aabbAabb = function(rectOneX, rectOneY, rectOneWidth, rectOneHeight, rectTwoX, rectTwoY, rectTwoWidth, rectTwoHeight) {
	if(rectOneX - rectTwoWidth/2 >= rectOneX + rectOneWidth/2
	|| rectTwoX + rectTwoWidth/2 <= rectOneX - rectOneWidth/2
	|| rectTwoY - rectTwoHeight/2 >= rectOneY + rectOneHeight/2
	|| rectTwoY + rectTwoHeight/2 <= rectOneY - rectOneHeight/2)
		return false;
	else
		return true;
}
GeometricObject.prototype.pointCircle = function(pointX, pointY, circleX, circleY, radius) {
	return Math.pow(circleX - pointX, 2) + Math.pow(circleY - pointY, 2) < Math.pow(radius, 2);
}
GeometricObject.prototype.pointObb = function(pointX, pointY, rectX, rectY, rectWidth, rectHeight, rectAngle) {
	var rotPoint = new Point(Math.cos(-rectAngle)*(pointX - rectX) - Math.sin(-rectAngle)*(pointY - rectY) + rectX, Math.sin(-rectAngle)*(pointX - rectX) + Math.cos(-rectAngle)*(pointY - rectY) + rectY);

	return rotPoint.x < rectX + rectWidth/2 && rotPoint.x > rectX - rectWidth/2 && rotPoint.y < rectY + rectHeight/2 && rotPoint.y > rectY - rectHeight/2;
}
GeometricObject.prototype.pointPoint = function(pointOneX, pointOneY, pointTwoX, pointTwoY) {//this function isn't really usefull as this is a really simple check
	return pointOneX === pointTwoX && pointOneY === pointTwoY;//but it's there for consistency
}


function Point(x, y) {
	this.x = x;
	this.y = y;
	return GeometricObject.call(this);
}
Point.prototype = Object.create(GeometricObject.prototype);

function Vector(argOne, argTwo) {
	if(typeof argOne === "number" && typeof argTwo === "number") {//they are coordinates
		this.x = argOne;
		this.y = argTwo;
	} else if(argOne instanceof Point && argTwo instanceof Point) {
		this.x = argTwo.x - argOne.x;
		this.y = argTwo.y - argOne.y;
	}
	return GeometricObject.call(this);
}
Vector.prototype._proxyMap = {
	x: ["orthogonalVector", "length"],
	y: ["orthogonalVector", "length"]
};
Object.defineProperties(Vector.prototype, {
	"orthogonalVector": {
		get: function() {
			if(!this._upToDate.orthogonalVector) {
				this._upToDate.orthogonalVector = true;
				this._cache.orthogonalVector = new Vector(-this.y, this.x);
			}
			return this._cache.orthogonalVector;
		}
	},
	"length": {
		get: function() {
			if(!this._upToDate.length) {
				this._upToDate.length = true;
				this._cache.length = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
			}
			return this._cache.length;
		}
	}
});
Vector.prototype.dotProduct = function(vector) {
	return this.x*vector.x + this.y*vector.y;
}
Vector.prototype.normalize = function() {
	this.x /= this.length;
	this.y /= this.length;
}
Vector.prototype.apply = function(point) {
	point.x += this.x;
	point.y += this.y;
}

function Rectangle(centerPoint, width, height, angle) {
	this.center = centerPoint;
	this.center._proxyMap = Rectangle.centerProxyMap;//TODO: alow differents parents
	this.center._parents.push(this);//to have differents maps applied to them
	//this creates references to an object and might prevent it from being GC'd

	this.width = width;
	this.height = height;

	this.angle = angle === undefined ? 0 : angle;

	return GeometricObject.call(this);
}
Rectangle.prototype = Object.create(GeometricObject.prototype);
Rectangle.prototype._proxyMap = {
	width: ["vertices", "AAVertices"],
	height: ["vertices", "AAVertices"],
	angle: ["vertices"]
};
Rectangle.centerProxyMap = {
	x: ["vertices", "AAVertices"],
	y: ["vertices", "AAVertices"]
};
Object.defineProperties(Rectangle.prototype, {
	"vertices": {
		get: function() {
			if(!this._upToDate.vertices) {
				this._upToDate.vertices = true;

				this._cache.vertices = [];
				this.AAVertices.forEach(function(vertex) {
					var x = vertex.x - this.center.x,
						y = vertex.y - this.center.y,
						newVertex = new Point(
							x*Math.cos(this.angle) - y*Math.sin(this.angle) + this.center.x,
							x*Math.sin(this.angle) + y*Math.cos(this.angle) + this.center.y
					);
					this._cache.vertices.push(newVertex);
				}, this);
			}
			return this._cache.vertices;
		},
		enumerable: true
	},
	"AAVertices": {
		get: function() {
			if(!this._upToDate.AAVertices) {
				this._upToDate.AAVertices = true;
				this._cache.AAVertices = [new Point(this.center.x - this.width/2, this.center.y - this.height/2), new Point(this.center.x + this.width/2, this.center.y - this.height/2), new Point(this.center.x + this.width/2, this.center.y + this.height/2), new Point(this.center.x - this.width/2, this.center.y + this.height/2)];
			}
			return this._cache.AAVertices;
		}
	}
});
Rectangle.prototype.collide = function(geomObjOne, geomObjTwo) {
	var errStr = "Not a valid geometric object";
	if(geomObjOne instanceof Rectangle) {
		if(geomObjTwo instanceof Rectangle) {
			if(geomObjOne.angle === geomObjTwo.angle) {
					return this.aabbAabb(0, 0, geomObjOne.width, geomObjOne.height, isFinite(this.width) ? (geomObjTwo.center.x - geomObjOne.center.x + this.width)%this.width : geomObjTwo.center.x - geomObjOne.center.x, isFinite(this.height) ? (geomObjTwo.center.y - geomObjOne.center.y + this.height)%this.height : geomObjTwo.center.y - geomObjOne.center.y, geomObjTwo.width, geomObjTwo.height);
				} else {
					return this.obbObb(0, 0, geomObjOne.width, geomObjOne.height, geomObjOne.angle, isFinite(this.width) ? (geomObjTwo.center.x - geomObjOne.center.x + this.width)%this.width : geomObjTwo.center.x - geomObjOne.center.x, isFinite(this.height) ? (geomObjTwo.center.y - geomObjOne.center.y + this.height)%this.height : geomObjTwo.center.y - geomObjOne.center.y, geomObjTwo.width, geomObjTwo.height, geomObjOne.angle);
				}
		} else if(geomObjTwo instanceof Circle) {
			return this.circleObb(0, 0, geomObjTwo.radius, isFinite(this.width) ? (geomObjTwo.center.x - geomObjOne.center.x + this.width)%this.width : geomObjTwo.center.x - geomObjOne.center.x, isFinite(this.height) ? (geomObjTwo.center.y - geomObjOne.center.y + this.height)%this.height : geomObjTwo.center.y - geomObjOne.center.y, geomObjOne.width, geomObjOne.height, geomObjOne.angle);
		} else if(geomObjTwo instanceof Point) {
			return this.pointObb(0, 0, isFinite(this.width) ? (geomObjTwo.x - geomObjOne.center.x + this.width)%this.width : geomObjTwo.x - geomObjOne.center.x, isFinite(this.height) ? (geomObjTwo.y - geomObjOne.center.y + this.height)%this.height : geomObjTwo.y - geomObjOne.center.y, geomObjOne.width, geomObjOne.height, geomObjOne.angle);
		} else {
			throw new TypeError(errStr);
		}
	} else if(geomObjOne instanceof Circle) {
		if(geomObjTwo instanceof Rectangle) {
			return this.circleObb(0, 0, geomObjOne.radius, isFinite(this.width) ? (geomObjOne.center.x - geomObjTwo.center.x + this.width)%this.width : geomObjOne.center.x - geomObjTwo.center.x, isFinite(this.height) ? (geomObjOne.center.y - geomObjTwo.center.y + this.height)%this.height : geomObjOne.center.y - geomObjTwo.center.y, geomObjTwo.width, geomObjTwo.height, geomObjTwo.angle);
		} else if(geomObjTwo instanceof Circle) {
			return this.circleCircle(0, 0, geomObjOne.radius, isFinite(this.width) ? (geomObjTwo.center.x - geomObjOne.center.x + this.width)%this.width : geomObjTwo.center.x - geomObjOne.center.x, isFinite(this.height) ? (geomObjTwo.center.y - geomObjOne.center.y + this.height)%this.height : geomObjTwo.center.y - geomObjOne.center.y, geomObjTwo.radius);
		} else if(geomObjTwo instanceof Point) {
			return this.pointCircle(0, 0, isFinite(this.width) ? (geomObjTwo.x - geomObjOne.center.x + this.width)%this.width : geomObjTwo.x - geomObjOne.center.x, isFinite(this.height) ? (geomObjTwo.y - geomObjOne.center.y + this.height)%this.height : geomObjTwo.y - geomObjOne.center.y, geomObjOne.radius);
		} else {
			throw new TypeError(errStr);
		}
	} else if(geomObjOne instanceof Point) {
		if(geomObjTwo instanceof Circle) {
			return this.pointCircle(0, 0, isFinite(this.width) ? (geomObjOne.x - geomObjTwo.center.x + this.width)%this.width : geomObjOne.x - geomObjTwo.center.x, isFinite(this.height) ? (geomObjOne.y - geomObjTwo.center.y + this.height)%this.height : geomObjOne.y - geomObjTwo.center.y, geomObjTwo.radius);
		} else if(geomObjTwo instanceof Rectangle) {
			return this.pointObb(0, 0, isFinite(this.width) ? (geomObjOne.x - geomObjTwo.center.x + this.width)%this.width : geomObjOne.x - geomObjTwo.center.x, isFinite(this.height) ? (geomObjOne.y - geomObjTwo.center.y + this.height)%this.height : geomObjOne.y - geomObjTwo.center.y, geomObjTwo.width, geomObjTwo.height, geomObjTwo.angle);
		} else if(geomObjTwo instanceof Point) {
			return this.pointPoint(0, 0, isFinite(this.width) ? (geomObjTwo.x - geomObjOne.x + this.width)%this.width : geomObjTwo.x - geomObjOne.x, isFinite(this.height) ? (geomObjTwo.y - geomObjOne.y + this.height)%this.height : geomObjTwo.y - geomObjOne.y);
		} else {
			throw new TypeError(errStr);
		}
	} else {
		throw new TypeError(errStr);
	}
}
Rectangle.prototype.project = function(axis) {
	var min = axis.dotProduct(this.vertices[0]),
		max = min;
	for(var i = 1; i !== this.vertices.length - 1; i++) {
		var proj = axis.dotProduct(this.vertices[i]);
		if(proj < min) min = proj;
		else if(proj > max) max = proj;
	}
	return {min: min, max: max};
}

function Circle(centerPoint, radius) {
	this.center = centerPoint;
	this.radius = radius;
}
Circle.prototype = Object.create(GeometricObject.prototype);


if(typeof module !== "undefined" && typeof module.exports !== "undefined") module.exports = {
	Point: Point,
	Vector: Vector,
	Rectangle: Rectangle,
	Circle: Circle
};
