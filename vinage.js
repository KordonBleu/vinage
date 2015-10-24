"use strict";
function GeometricObject() {
	//To inherit from `GeometricObject`:
	// * call `return GeometricObject.call(this);` at the end of any constructor
	// * create a new prototype for your object, whose prototype is `GeometricObject.prototype`. Example: `YourConstructor.prototype = Object.create(GeometricObject.prototype);`.
	// * add a `_proxyMap` property to your object (directly or to its prototype).
	this._cache = {};
	this._upToDate = {};
	this._parents = [];
	if(typeof Proxy !== "undefined") {
		this._proxy = new Proxy(this, GeometricObject.proxyHandler);
		return this._proxy;
	}
}
GeometricObject.proxyHandler = {
	set: function(target, name, value, receiver) {
		if(receiver !== target._proxy) {//if the proxy is used as an object's prototype
			Object.defineProperty(receiver, name, {
				value: value
			});
			return true;
		}

		target[name] = value;

		if(name === "_proxyMap") return true;
		if(target.hasOwnProperty(name)) {
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
	var tCircleX = Math.cos(-rectAngle) * (circleX - rectX) - Math.sin(-rectAngle) * (circleY - rectY) + rectX,//rotate the circle around the center of the OOB
		tCircleY = Math.sin(-rectAngle) * (circleX - rectX) + Math.cos(-rectAngle) * (circleY - rectY) + rectY;//so that the OBB can be treated as an AABB

	var deltaX = Math.abs(tCircleX - rectX),
		deltaY = Math.abs(tCircleY - rectY);

	if(deltaX > rectWidth/2 + circleRadius || deltaY > rectHeight/2 + circleRadius) return false;

	if(deltaX <= rectWidth/2 || deltaY <= rectHeight/2) return true;

	return Math.pow(deltaX - rectWidth/2, 2) + Math.pow(deltaY - rectHeight/2, 2) <= Math.pow(circleRadius, 2);
}
GeometricObject.prototype.sat = function(objOneVertices, objTwoVertices) {
	var axes = [];
	function getAxes(vertices) {
		vertices.forEach(function(vertex, index, vertices) {
			axes.push(new Vector(vertex, vertices[(index - 1 + vertices.length)%vertices.length]));
		});
		return axes;
	}
	getAxes(objOneVertices);
	getAxes(objTwoVertices);

	function project(axis, vertices) {
		var min = axis.dotProduct(vertices[0]),
			max = min;
		vertices.slice(1).forEach(function(vertex) {//shallow copy
			var pVert = axis.dotProduct(vertex);
			if(pVert < min) min = pVert;
			else if(pVert > max) max = pVert;
		});
		return {min: min, max: max};
	}
	function overlap(ovOne, ovTwo) {
		return ((ovOne.min < ovTwo.max && ovTwo.max < ovOne.max) || (ovOne.min < ovTwo.min && ovTwo.min < ovOne.max)) || ((ovTwo.min < ovOne.max && ovOne.max < ovTwo.max) || (ovTwo.min < ovOne.min && ovOne.min < ovTwo.max));
	}
	return axes.every(function(axis) {
		var projOne = project(axis, objOneVertices),
		projTwo = project(axis, objTwoVertices);

		return overlap(projOne, projTwo);
	});
}
GeometricObject.prototype.circleCircle = function(circleOneX, circleOneY, circleOneRadius, circleTwoX, circleTwoY, circleTwoRadius) {
	return Math.pow(circleOneX - circleTwoX, 2) + Math.pow(circleOneY - circleTwoY, 2) < Math.pow(circleOneRadius + circleTwoRadius, 2);
}
GeometricObject.prototype.aabbAabb = function(rectOneX, rectOneY, rectOneWidth, rectOneHeight, rectTwoX, rectTwoY, rectTwoWidth, rectTwoHeight) {
	return ! (rectTwoX - rectTwoWidth/2 >= rectOneX + rectOneWidth/2
	|| rectTwoX + rectTwoWidth/2 <= rectOneX - rectOneWidth/2
	|| rectTwoY - rectTwoHeight/2 >= rectOneY + rectOneHeight/2
	|| rectTwoY + rectTwoHeight/2 <= rectOneY - rectOneHeight/2);
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
	function makePseudoClones(vertices) {
		var pseudoClone = [];
		vertices.forEach(function(vertex) {
			pseudoClone.push(Object.create(vertex));
		});
		return pseudoClone;
	}
	var errStr = "Not a valid geometric object";
	if(geomObjOne instanceof Rectangle) {
		if(geomObjTwo instanceof Rectangle) {
			if(geomObjOne.angle === geomObjTwo.angle) {
					return this.aabbAabb(0, 0, geomObjOne.width, geomObjOne.height, isFinite(this.width) ? (geomObjTwo.center.x - geomObjOne.center.x + this.width)%this.width : geomObjTwo.center.x - geomObjOne.center.x, isFinite(this.height) ? (geomObjTwo.center.y - geomObjOne.center.y + this.height)%this.height : geomObjTwo.center.y - geomObjOne.center.y, geomObjTwo.width, geomObjTwo.height);
				} else {
					var vertiOne = makePseudoClones(geomObjOne.vertices),
						vertiTwo = makePseudoClones(geomObjTwo.vertices);
					if(isFinite(this.width)) {
						vertiOne.forEach(function(vertex) {
							vertex.x -= geomObjOne.center.x;
						});
						vertiTwo.forEach(function(vertex) {
							vertex.x -= geomObjOne.center.x + geomObjTwo.center.x;
						});
					}
					if(isFinite(this.height)) {
						vertiOne.forEach(function(vertex) {
							vertex.y -= geomObjOne.center.y;
						});
						vertiTwo.forEach(function(vertex) {
							vertex.y -= geomObjOne.center.y + geomObjTwo.center.y;
						});
					}

					return this.sat(vertiOne, vertiTwo);
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
