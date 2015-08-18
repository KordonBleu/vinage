# Vinage

## Documentation for users

Vinage is a collision library usable in both the browser and Node.js.
When you import Vinage to your project, you will get access to the following classes.

### Point(x, y)
```JavaScript
var myPoint = new Point(12, 45);
console.log(myPoint.x, myPoint.y);//12, 45
```
#### Properties
* x: the point's x-coordinate (abscissa)
* y: the point's y-coordinate (ordinate)

#### Methods
* collision(geomObj): returns true if there is a collision with the `geomObj` (an instance of `Rectangle`, `Circle` or `Point`), false otherwise


### Vector(x, y) or Vector(point1, point2)
An euclidean vector.
```JavaScript
var myVectorOne = new Vector(25, 87);
var myVectorTwo = new Vector(myPointOne, myPointTwo);
console.log(myVectorOne.x, myVectorOne.y, myVectorOne.orthogonalVector, myVectorOne.length);//25, 87, Vector, 90.52071586106685
```
#### Properties
* x: the vector's x-component
* y: the vector's y-component
* orthogonalVector: a vector which is orthogonal to the vector
* length: the length of the vector

#### Methods
* dotProduct(vector): returns the dot product of the vector and the other vector passed as a parameter
* normalize(): make the vector into a unit vector
* apply(point): adds the vector to `point`'s coordinates


### Circle(point, radius)
```JavaScript
var myCircle = new Circle(myPoint, 45);
```
#### Properties
* center: a point, the center of the circle
* radius: the circle's radius

#### Methods
* collision(geomObj): returns true if there is a collision with the `geomObj` (an instance of `Rectangle`, `Circle` or `Point`), false otherwise


### Rectangle(point, width, height, angle) or Rectangle(point, width, height)
```JavaScript
var myRectangle = new Rectangle(myPoint, 45, 87, Math.PI/7);
```
#### Properties
* center: a point, the center of the rectangle
* width: the width of the rectangle
* height: the height of the rectangle
* angle: the angle defining the orientation of the rectangle
* vertices: an array of points, which are the vertices of the rectangle

#### Methods
* collision(geomObj): returns true if there is a collision with the `geomObj` (an instance of `Rectangle`, `Circle` or `Point`), false otherwise
* project(vector): returns the projection of the rectangle against an axis

## Documentation for contributors
