const test = require("tape");
const tapDiff = require('tap-diff')

const vinage = require('../vinage.js');

// more readable and beautiful console output
test.createStream().pipe(tapDiff()).pipe(process.stdout);

// universe is used to execute collide function, which detects collision/intersection of two geometric objects
var universe = new vinage.Rectangle(new vinage.Point(0, 0), 600, 400);

function runCollisionTest(t, geomObj1, geomObj2, expected, extra) {
	var properties = '', i, obj;
	for (i = 0; i !== 2; ++i) {
		var p = {};
		obj = (i === 0) ? geomObj1 : geomObj2;
		
		// determine type of geometric object
		if (obj instanceof vinage.Rectangle) p.type = 'rect';
		else if (obj instanceof vinage.Circle) p.type = 'circle';
		else if (obj instanceof vinage.Point) p.type = 'point';

		// check whether the object will be wrapped
		if (obj.center.x - obj.width/2 < 0
			|| obj.center.x + obj.width/2 > universe.width
			|| obj.center.y - obj.height/2 < 0
			|| obj.center.y + obj.height/2 > universe.height) {
			p.wrapped = 'wrap';
		} else {
			p.wrapped = 'no-wrap';
		}

		properties += p.type + ' (' + p.wrapped + ')';
		if (i === 0) properties += ' - ';
	}
	
	// add description with nice readability and important information	
	t.equal(universe.collide(geomObj1, geomObj2), expected, (expected ? 'Collision' : 'NoCollision') + (extra ? ' (' + extra + ')' : '') + ': ' + properties); 
}

// collision between two rectangles without rotation (angle = 0)
test('Testing collision: rect-rect (no rotation)', function(t) {
	// we will run three tests
	t.plan(8);

	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point( 10, 200), 100,  20),
		new vinage.Rectangle(new vinage.Point(110, 200), 100,  20),
		true, // expecting collision
		'x-Touch' // objects touch each other on the left/right edge
	);
	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point(590, 200), 100,  20),
		new vinage.Rectangle(new vinage.Point( 90, 200), 100,  20),
		true, // expecting collision
		'x-Touch' // objects touch each other on the left/right edge
	);
	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point(200,  10),  20, 100),
		new vinage.Rectangle(new vinage.Point(200, 110),  20, 100),
		true, // expecting collision
		'y-Touch' // objects touch each other on the top/bottom edge
	);
	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point(200, 390),  20, 100),
		new vinage.Rectangle(new vinage.Point(200,  90),  20, 100),
		true, // expecting collision
		'y-Touch' // objects touch each other on the top/bottom edge 
	);
	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point(  0, 200), 100,  20),
		new vinage.Rectangle(new vinage.Point(111, 200), 100,  20),
		false, // expecting no collision
		'x-Dodge' // objects are too far apart on the x-Axis
	);
	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point(590, 200), 100,  20),
		new vinage.Rectangle(new vinage.Point( 91, 200), 100,  20),
		false, // expecting no collision
		'x-Dodge' // objects are too far apart on the x-Axis
	);
	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point(200,  10),  20, 100),
		new vinage.Rectangle(new vinage.Point(200, 111),  20, 100),
		false, // expecting no collision
		'y-Dodge' // objects are too far apart on the y-Axis
	);
	runCollisionTest(t,
		new vinage.Rectangle(new vinage.Point(200, 390),  20, 100),
		new vinage.Rectangle(new vinage.Point(200,  91),  20, 100),
		false, // expecting no collision
		'y-Dodge' // objects are too far apart on the y-Axis
	);

	t.end();
});

