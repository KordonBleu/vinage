# Vinage

Vinage is a collision library usable in both the browser and Node.js. It supports wrap-around.
Your JavaScript implementation needs to [support `Proxy`](https://kangax.github.io/compat-table/es6/#test-Proxy) for it to work. Firefox 18+, Chrome 49+ and Node.js 6+ work.

## For Node.js

```sh
$ npm install vinage --save
```

```JavaScript
var vinage = require("vinage");

var whatsThePoint = new vinage.Point(0, 0); // use it!
```

## For the browser

```HTML
<!-- add this to your html file -->
<script src="/vinage.js"></script>
```

```JavaScript
// you're all set
var whatsThePoint = new vinage.Point(0, 0);
```

## Geometric objects
To use it, you must define instances of the classes listed below, which represent geometric objects in a 2D space.
You can modify some properties, as indicated. Other properties are calculated when you read them, then cached. When accessed again, they are either retrieved or recalculated, depending on the modifications you made to other properties of the object.

### vinage.Point(x, y)
```JavaScript
var myPoint = new vinage.Point(12, 45);
console.log(myPoint.x, myPoint.y); // 12, 45
```
#### Properties
* `x`: the point's x-coordinate (abscissa). Writable
* `y`: the point's y-coordinate (ordinate). Writable


### vinage.Vector(x, y) or vinage.Vector(pointOne, pointTwo)
An euclidean vector.
```JavaScript
var myVectorOne = new vinage.Vector(25, 87),
	myVectorTwo = new vinage.Vector(myPointOne, myPointTwo);
console.log(myVectorOne.x, myVectorOne.y, myVectorOne.orthogonalVector, myVectorOne.length); // 25, 87, Vector, 90.52071586106685
```
#### Properties
* `x`: the vector's x-component. Writable
* `y`: the vector's y-component. Writable
* `orthogonalVector`: a vector which is orthogonal to the vector
* `length`: the length of the vector

#### Methods
* `dotProduct(vector)`: returns the dot product of the vector and the other vector passed as a parameter
* `normalize()`: make the vector into a unit vector
* `apply(point)`: adds the vector to `point`'s coordinates


### vinage.Circle(point, radius)
```JavaScript
var myCircle = new vinage.Circle(myPoint, 45);
```
#### Properties
* `center`: a point, the center of the circle
* `radius`: the circle's radius. Writable


### vinage.Rectangle(point, width, height[, angle])
```JavaScript
var myRectangleOne = new vinage.Rectangle(myPoint, 45, 87, Math.PI/7),
	myRectangleTwo = new vinage.Rectangle(myPoint, 97, 54);
```
#### Properties
* `center`: a point, the center of the rectangle
* `width`: the width of the rectangle. Writable
* `height`: the height of the rectangle. Writable
* `angle`: the angle defining the orientation of the rectangle. Writable
* `vertices`: an array of points, which are the vertices of the rectangle

#### Methods
* `project(vector)`: returns the projection of the rectangle against an axis
* `forget()`: vinage may prevent rectangles from being garbage collected<sup>[1](#footnote1)</sup>. If you don't want to use a rectangle anymore, for example before using `delete` on it or replacing it with something else, **please use this method**. *Do not use an object this method has been used on.*


## Universes
If you want to check for collision, you must first define a **universe** where collisions happen. Universes are mere instances of Rectangle.

Most of the time you will want them to happen in an Cartesian plane (i.e. an infinite universe). You can create it like this:
```JavaScript
var myUniverse = new vinage.Rectangle(new Point(0, 0), Infinity, Infinity);
```

However, if you want to implement wrap-around, you will need a bounded and finite universe:
```JavaScript
var myUniverse = new vinage.Rectangle(new Point(0, 0), 1000, 1000);
```
If your universe is finite and one of your geometric object overlap the "edge" of the universe, it will be as if this part of it was actually on the other side of the universe.
Note that your geometric objects can be beyond the limits of the universe; tests are internally remapped inside the universe.
```JavaScript
var myRectangle = new vinage.Rectangle(238, 153, 50, 50),
	myCircle = new vinage.Circle(new Point(-56, 27), 12),
	myUniverse = new vinage.Rectangle(new Point(-25, 0), 100, 100);
// it's valid to check whether myRectangle and myCircle collide under myUniverse
```


## Collisions
You can check for collisions *under* your universe like this:
```JavaScript
myUniverse.collide(myRectangle, myCircle); // returns true or false
```


## How it works
Vinage relies on the Proxy object (introduced in ES6) to cache data. Every instance of the above classes is actually a proxy to a regular object.
When a modification is made to a writable property, the proxy object searches for read-only properties relying on it, and keep a reminder that they must be calculated again. The next time one of those read-only properties will be retrieved, it will be recalculated and recached.
```JavaScript
var vec = new Vector(25, 87); // vec is actually a proxy
console.log(vec.length); // vec.length is caclulated based on vec.x and vec.y, then stored, and finally returned.
var someVar = 1 + vec.length; // vec.length is up-to-date, it is only read from the cache
vec.x = 64; // the vec.length and vec.orthogonalVector depend on the value of vec.x, they are both set to be refreshed
console.log(vec.length); // vec.length is set to be refreshed, therefore it is recaculated, then stored, and finally returned
```

Every instance has a `_upToDate` property, where it is stored in an object (used as a map) whether properties must be calculated (a boolean is used).
Every instance has a `_cache` property, an object (used as a map) where calculated values are stored.
`Vector` and `Rectangle` instances have a `_proxyMap` property, inherited from their prototype, an object (used as a map) which contains for each modifiable variable, the list of the calculated variable which will have to be refreshed.
`Point` instances have a `_proxyMap` property, inherited from their prototype, an object (used as a map) which contains for each modifiable variable, the list of the calculated variable which will have to be refreshed **on the parent**. That list takes into account the parent's type.
```JavaScript
// from Vinage's code
Vector.prototype._proxyMap = {
	x: ['orthogonalVector', 'length'], // if myVec.x is modified, myVec._upToDate.orthogonalVector and myVec._upToDate.length will both be set to false
	y: ['orthogonalVector', 'length'] // if myVec.y is modified, myVec._upToDate.orthogonalVector and myVec._upToDate.length will both be set to false
};
```


## Testing
You can open `graphical-tester.svg` in your browser and move around elements to check if collisions work as intended.
When the library reports a collision the colliding elements are red, otherwise they are green.


## Footnotes
<a id="footnote1">1</a>: This happens when an object is child of multiple parents (for example a point used as the center of differents rectangles), because the child keeps a reference to each parent.
