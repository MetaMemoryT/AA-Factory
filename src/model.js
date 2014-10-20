// model should know nothing of the view or rendering, (no DOM interaction)
var Directions = {
  UPLEFT:0,
  LEFT:1,
  DOWNLEFT:2,
  UP: 3,
  CENTER: 4,
  DOWN:5,
  UPRIGHT: 6,
  RIGHT: 7,
  DOWNRIGHT:8,
  
}
var Dirs = {
  // shorthands
  UL:Directions.UPLEFT,
  U:Directions.UP,
  UR:Directions.UPRIGHT,
  L: Directions.LEFT,
  R: Directions.RIGHT,
  DL: Directions.DOWNLEFT,
  D: Directions.DOWN,
  DR: Directions.DOWNRIGHT,
  C:Directions.CENTER
}

function getDirName(dir) {
  var res = undefined;
  for (var d in Directions) {
    if (Directions[d] == dir) return res = d;
  }
  return res;
}
var EndLevelState = {
  WIN: "win",
  LOSE: "lose"
}
var mapColor = new BiMap();
mapColor.push("empty", 0);
mapColor.push("target", 1);
mapColor.push("robot", 2);

function Robot(x, y) {
  this.x = x;
  this.y = y;
  this.state = {};
  this.lambda = null;
}

function Map(x, y, robots, level) {
  this.level = level;
  this.robots = robots;
  this.width = x;
  this.height = y;
  this.tiles = [];
  // additional logic callbacks executed in Map.step
  this.stepLogicCbs = [];
  for (var i = 0; i < this.width; i++) {
    this.tiles[i] = new Array(this.height);
    for (var j = 0; j < this.tiles[i].length; j++) {
      this.tiles[i][j] = mapColor.key("empty");
    }
  }


  var self = this;
  this.robots.forEach(function(r) {
    self.tiles[r.x][r.y] = self.colorRobot(r);
  })
  /**
   * the default function for giving data to a robot
   * note: the `this` keyword is set to the map inside this function when it is called
   * @param  {Robot} robot a the specific robot to get data for
   * @return {Array}       an array of args to pass to Robot.lambda
   */
  this.getRobotData = function (robot) {
    return [robot.x, robot.y, this.tiles, robot.state];
  }

  
}

/**
 * Default method for giving a color to a tile
 * @param  {Robot} robot 
 * @return {number}       Color to be returned
 */
Map.prototype.colorRobot = function (robot) {
  return mapColor.key("robot")
}
Map.prototype.makeErrorMessage = function(x, y, dir) {
  return "Robot at (" + x + "," + y + ") went out of bounds heading " + dir + ".";
}
Map.prototype.setAI = function(fn) {
  for (var r of this.robots)
    r.lambda = fn;
}

Map.prototype.step = function() {
  for (var i = 0; i < this.robots.length; i++) {
    var r = this.robots[i];
    var dir = r.lambda.apply(null, this.getRobotData.call(this, r));
    this.tiles[r.x][r.y] = mapColor.key("empty");
    // check if dir is a valid direction
    var validDir = _.some(this.getValidDirections(r.x,r.y), function(el){
      return dir == el;
    })
    if (validDir) {
      this.transform(r, dir)
      for (var fn of this.stepLogicCbs) {
        fn.call(this, r, dir);
      }
      this.tiles[r.x][r.y] = this.colorRobot.call(this, r);
    } else {
      this.level.endMessage = this.makeErrorMessage(r.x, r.y, getDirName(dir));
      this.level.endLevelState = EndLevelState.LOSE;
    }
  }
}
/**
 * set a robot's location based on the direction
 * higher order programming would come in handy here!
 * @param  {Robot} robot     
 * @param  {Direction} direction 
 * @return {void}
 */
Map.prototype.transform = function(r, direction) {
  switch (direction) {
    case (Dirs.UL):
      r.x-=1;
      r.y-=1;
      break;
    case (Dirs.L):
      r.x -=1;
      break;
    case (Dirs.DL):
      r.x-=1;
      r.y+=1;
      break;
    case Dirs.U:
      r.y-=1;
      break;
    case Dirs.C:
      break;
    case Dirs.D:
      r.y+=1;
      break;
    case Dirs.UR:
      r.x+=1;
      r.y-=1;
      break;
    case Dirs.R:
      r.x+=1;
      break;
    case Dirs.DR:
      r.x+=1;
      r.y+=1;
  }
};

Map.prototype.getNeighbors = function(x,y) {
   var minX = Math.max(0, x-1)
       , maxX = Math.min(this.width - 1, x+1)
       , minY = Math.max(0, y-1)
       , maxY = Math.min(this.height - 1, y+1);
  var neis = [];
  for (var i = x-1; i <= x+1; i++) {
    for (var j = y-1; j <= y+1; j++) {
      // need to push null if the tiles is out of bounds
      if (i < minX || i > maxX || j < minY || j > maxY) neis.push(null);
      else neis.push(this.tiles[i][j]);
    }
  }
  return neis;
}

Map.prototype.getValidDirections = function(x,y) {
  var dirs = [];
  var neis = this.getNeighbors(x,y);
  for (var dir in Directions){
    // 0 evaluates to false!!!
    if (neis[Directions[dir]] != null) dirs.push(Directions[dir]);
  }
  return dirs;
};

// things all levels have
function Level(size, map) {
  this.endMessage = null;
  this.endLevelState = null;
  this.map = map || new Map(size, size, [new Robot(0, 0)], this);
  this.turn = 0;
}
Level.prototype.step = function() {
  this.turn++;
  this.map.step();
  if (this.testVictory()) this.endLevelState = EndLevelState.WIN;
}

function Level1() {
  Level.call(this, 5);
  this.name = "Constant Behaviour"
  this.answers = [
    function(x, y, tiles, info) {
      // level 1, answer 1
      return Directions.RIGHT;
    },
    function(x, y, tiles, info) {
      // level 1, answer 2
      // test losing message
      return Directions.LEFT;
    }
  ]
  for (var i = 0; i < this.map.tiles.length; i++)
    this.map.tiles[this.map.tiles.length - 1][i] = mapColor.key("target");


}
Level1.prototype = Object.create(Level.prototype);
Level1.prototype.testVictory = function() {
  for (var r of this.map.robots)
    if (r.x == (this.map.tiles.length - 1)) return true;
  return false;
}

function Level2() {
  Level.call(this, 5);
  this.name = "Adding State"
  this.answers = [
    function(x, y, tiles, info) {
      // level 2, answer 1
      info.lastMove = (info.lastMove == Directions.DOWN) ? Directions.RIGHT : Directions.DOWN;
      return info.lastMove;
    },
     function (x, y, tiles, info) {
        function Foo () {this.x = 0};
        // level 2, answer 1
        info.foo = info.foo || new Foo();
        info.foo += 1;
        // test console.log()
        console.log(info.foo);
        info.lastMove = (info.lastMove == Directions.DOWN) ? Directions.RIGHT : Directions.DOWN;
        return info.lastMove;
      } 
  ]
  this.map.tiles[this.map.tiles.length - 1][this.map.tiles.length - 1] = mapColor.key("target");
}
Level2.prototype = Object.create(Level.prototype);
Level2.prototype.testVictory = function() {
  for (var r of this.map.robots)
    if (r.x == (this.map.tiles.length - 1)) return true;
  return false;
}

/**
 * Special Map for level 3
 */
function L3Map (w, h, robots, level) {
  Map.call(this, w, h, robots, level)
}
L3Map.prototype = Object.create(Map.prototype);
L3Map.prototype.colorRobot = function(robot) {
  if(robot instanceof Dud) return mapColor.key("target");
  else return mapColor.key("robot");
}
/**
 * seek and destroy
 */
function Level3() {
  var duds = [];
  // add duds
  for (var i = 0; i < 2; i++){
    duds.push(new Dud(Math.floor(Math.random()*6), Math.floor(Math.random()*6)));
  }
  var map = new L3Map(7,7, [new Robot(0,0)].concat(duds) , this);
  Level.call(this, 5, map);
  this.name = "Seek and Destroy";
  this.answers = [
    function(x, y, tiles, info) {
      // level 3, answer 1
      return Dirs.C;
    }
  ]
  // set map.getRobotData
  this.map.getRobotData = function(robot) {
    // this = this.get
    return [robot.x, robot.y, this.getNeighbors(robot.x, robot.y)
          , this.getValidDirections(robot.x, robot.y), robot.state]
  }

  // change the default setAI behavior
  this.map.setAI = function (fn) {
    this.robots[0].lambda = fn;
  }

  // add functionality to remove a dud if the robot moves on it
  this.map.stepLogicCbs.push(function(r, dir){
    // this is set to the map
    if (this.tiles[r.x][r.y] == 2) {
      var dudToDestroy = [];
      for (var d of this.robots.slice(1, this.robots.length)){
        if (d.x == r.x && d.y == r.y) {
          // if a dud is at the same location of the robot, kill it
          dudToDestroy.push(d);
        }
      }
      this.robots = _.difference(this.robots, dudToDestroy);
    }
  })
}
Level3.prototype = Object.create(Level.prototype);
Level3.prototype.testVictory = function() {
  return (this.map.robots.length == 1);
}

function Dud (xVal, yVal) {
  Robot.call(this, xVal, yVal);
  this.lambda = function(x, y, neighbors,validDirections, data) {
    var n = Math.floor(Math.random() * (validDirections.length));
    return validDirections[n];
  }
}

Dud.prototype = Object.create(Robot.prototype);


function Level4() {
  Level.call(this, 5);
  this.name = "Lion Pack";
  this.answers = [
    function(x, y, tiles, info) {
      // level 4, answer 1
      return null;
    }
  ]
}
Level4.prototype = Object.create(Level.prototype);