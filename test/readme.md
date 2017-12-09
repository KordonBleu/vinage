# Unit testing

To check whether vinage is detecting collisions between two objects, you can run the command `npm test` which will start `test.js` with Node. The script requires two modules that can be downloaded with npm so you might want to consider installing them before running the unit test. Use `npm install`, it will automatically download necessary modules.

`test.js` will check whether vinage is detecting collision when two objects should collide due to their position, width, angle and shape or shouldn't collide (when they're too far apart e. g.). If the unit test completes succesful vinage should be able to detect collisions without errors.
