# Documentation

## For users

Vinage gives you several classes that you can use.

### Point(x, y)
```
var myPoint = new Point(12, 45);
console.log(myPoint.x, myPoint.y);//12, 45
```
#### Properties
* x:
* y:

### Vector(x, y) or Vector(point1, point2)
```
var myVectorOne = new Vector(25, 87);
var myVectorTwo = new Vector(myPointOne, myPointTwo);
console.log(myVectorOne.x, myVectorOne.y, myVectorOne.orthogonalVector, my
```
#### Properties
* x:
* y:
* orthogonalVector:
* length: the length of the vector

#### Methods
* dotProduct(vector): returns the dot product of the vector and the other vector passed as a parameter
* normalize(): make the vector into a unit vector
* apply(point): adds the vector to `point`'s coordinates

### Circle(point, radius)
```
var myCircle = new Circle(myPoint, 45);
```
#### Properties
* radius: the circle's radius

#### Methods
* collision(rectangle): returns true if there is a collision with `rectangle`, false otherwise

### Rectangle(point, width, height, angle) or Rectangle(point, width, height)
```
var myRectangle = new Rectangle(myPoint, 45, 87, Math.PI/7);
```
#### Properties
* center: a point, the center of the rectangle
* width:
* height:
* angle:
* vertices: an array of points, which are the vertices of the rectangle

#### Methods
* collision(rectangleOrCircle): returns true if there is a collision with the geometrical object passed as a paremeter, false otherwise
* project(vector): returns the projection of the rectangle against an axis

## For contributors
