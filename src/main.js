function Robot(x, y) {
  this.x = x;
  this.y = y;
  this.userData = {};
  this.lambda = new Function();
}
Robot.prototype.move = function(tiles) {
  return this.lambda.call(this, this.x, this.y, tiles, this.userData);
};
/*
 * this function will be implemented by each AI script It allows for protection
 * of the Robot class as well as giving the AI all the relevant information.
 */
// function moveRobot (x,y,tiles, info) {
// var result = (info.lastMove == Directions.DOWN) ? Directions.RIGHT :
// Directions.DOWN;
// info.lastMove = result;
// return result;
// }
function Tile() {
  this.content;
}

function Map(x, y, robots) {
  this.robots = robots;
  this.width = x;
  this.height = y;
  this.tiles = [];
  this.endMessage = "";
  this.endGame = false;
  for (var i = 0; i < this.width; i++) {
    this.tiles[i] = new Array(this.height);
    for (var j = 0; j < this.tiles[i].length; j++) {
      this.tiles[i][j] = 0;
    }
  }
  var self = this;
  this.robots.forEach(function(r) {
    self.tiles[r.x][r.y] = 1;
  })
}
Map.prototype.makeErrorMessage = function(x, y, dir) {
  return "Robot at (" + x + "," + y + ") went out of bounds heading " + dir
      + "."
}

Map.prototype.update = function() {
  for (var i = 0; i < this.robots.length; i++) {
    var r = this.robots[i];
    // simulating calling r.move()
    // var dir = Directions.LEFT;
    var dir = r.move();
    this.tiles[r.x][r.y] = 0;
    switch (dir) {
    case Directions.LEFT:
      if (r.x - 1 < 0) {
        this.endGame = true;
        this.endMessage = this.makeErrorMessage(r.x, r.y, "left")
      } else
        r.x = r.x - 1;
      break;
    case Directions.RIGHT:
      if (r.x + 1 > (this.width - 1)) {
        this.endGame = true;
        this.endMessage = this.makeErrorMessage(r.x, r.y, "right");
      } else
        r.x = r.x + 1;
      break;
    case Directions.UP:
      if (r.y - 1 < 0) {
        this.endGame = true;
        this.endMessage = this.makeErrorMessage(r.x, r.y, "up");
      } else
        r.y -= 1;
      break;
    case Directions.DOWN:
      if (r.y + 1 > (this.height - 1)) {
        this.endGame = true;
        this.endMessage = this.makeErrorMessage(r.x, r.y, "down");
      } else
        r.y += 1;
      break;
    }
    this.tiles[r.x][r.y] = 1;
    this.robots[i] = r;
  }
}
// level 1
function Level1(fps) {
  this.speed = 1000 / fps;
  this.pause = false;
  // create robots array
  var robots = [ new Robot(0, 0) ];
  this.map = new Map(10, 10, robots);
  // DOM element which contains the tr and td elements
  this.container = $("#gridBody");
}
Level1.prototype.init = function() {

  // init the table to 10 by 10 grid
  var tbody = $(this.container);

  for (var i = 0; i < this.map.width; i++) {
    var row = $("<tr>");
    for (var j = 0; j < this.map.height; j++) {
      row.append($("<td>"));
    }
    row.appendTo(tbody);
  }
}

Level1.prototype.run = function() {
  this.render();
  var self = this;
  this.interval = setTimeout(function() {
    self.map.update();
    self.testVictory();
    if (self.map.endGame) {
      self.render();
      alert(self.map.endMessage);
    } else if (self.pause) {
      return;
    } else {
      self.run();
    }
  }, this.speed);
};
/**
 * remove the DOM elements related to this level, clear timeouts and kill
 * itself.
 * 
 * @return {[type]} [description]
 */
Level1.prototype.close = function() {
  $(this.container).children().remove();
  clearTimeout(this.interval);
  delete this;
};
Level1.prototype.render = function() {
  var trElem = $("#gridBody tr").first()[0];
  for (var i = 0; i < this.map.tiles.length; i++) {
    var elem = trElem.children[0];
    for (var j = 0; j < this.map.tiles[i].length; j++) {
      var t = this.map.tiles[j][i];
      if (t == 0) {
        $(elem).removeAttr("class");
        $(elem).toggleClass("land");
      } else if (t == 1) {
        $(elem).removeAttr("class");
        $(elem).addClass("robot");
      }
      elem = elem.nextSibling || elem;
    }
    trElem = trElem.nextSibling;
  }
};

Level1.prototype.testVictory = function() {
  var result = false;
  var self = this;
  this.map.robots.forEach(function(r, i) {
    if (r.x == 9) {
      self.map.endGame = true;
      self.map.endMessage = "Won";
    }
  })
  return result;
}

Level1.prototype.setAI = function(fn) {
  this.map.robots.forEach(function(r) {
    r.lambda = fn;
  })
};

function runGame(fn) {
  var level = new Level1(1, fn);
  level.init();
  run(level);
}

// function()
level = window.level || null;
$(function() {
  $("#pause").prop( "disabled", true );
  $("#resume").prop( "disabled", false );

  $("#run").click(function(ev) {
    // eval user code into a function
    var strCode = $("#editor")[0].innerHTML;
    var fn = eval("(" + strCode + ")");
    // clear old level
    if (level)
      level.close();
    level = new Level1(5);
    var observer = new PathObserver(level, 'pause');
    observer.open(function(newValue, oldValue) {
      if (newValue) {
        $("#pause").prop( "disabled", true );
        $("#resume").prop( "disabled", false );
      } else {
        $("#pause").prop( "disabled", false );
        $("#resume").prop( "disabled", true );
      }
    });
    level.init();
    level.setAI(fn);
    $("#pause").prop( "disabled", false );
    $("#resume").prop( "disabled", true );
    level.run();
  });
  $("#pause").click(function(ev) {
    level.pause = true;
    clearTimeout(level.interval);
  });
  $("#resume").click(function(ev) {
    level.pause = false;
    level.run();
  });
})