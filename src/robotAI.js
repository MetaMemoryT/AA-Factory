/**
 * this is the skeleton of the method you will implement to control your Robot. 
 * @param  {int} x     x location
 * @param  {int} y     y location
 * @param  {Tile[]} tiles the adjacent tiles to your robot
 * @param  {Object} info  store information you want to save about your robot in this object
 * @return {int}       The direction to move in
 */
function moveRobot (x,y,tiles, info) {
	var result = (info.lastMove == Directions.DOWN) ? Directions.RIGHT : Directions.DOWN;
	info.lastMove = result;
	return result;
}
