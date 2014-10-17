// controller, could be automatically derived from view annotations / further refinement.
var s = {};

var newCode = null;

function saveAndLoad() {
  // eval user code into a function
  var strCode = $("#editor")[0].innerHTML;
  $.globalEval("var newCode = " + strCode);
  s.currentLevel.map.setAI(newCode);
}

s.table = null;
s.interval = null;
s.endLevelO = null;
s.currentLevel = null;

function changeOrRestartLevel(level) {
  s.currentLevel = level;
  if (s.endlevelO) s.endlevelO.close();
  if (s.table) s.table.tbody.children().remove();

  s.table = new Table($("#gridBody"), s.currentLevel.map.width, s.currentLevel.map.height);
  s.table.color(s.currentLevel.map.tiles, mapColor);
  $("#pause").prop("disabled", true);
  $("#resume").prop("disabled", true);

  saveAndLoad();
  s.endlevelO = new PathObserver(s, 'currentLevel.endLevelState');
  s.endlevelO.open(function(n, o) {
    changeState(false);
    $("#resume").prop("disabled", true);
  });
}

function changeState(running) {
  if (s.interval) clearInterval(s.interval);
  if (running) {
    s.table.color(s.currentLevel.map.tiles, mapColor);
    s.interval = setInterval(function() {
      stepRender();
    }, 200);
    $("#pause").prop("disabled", false);
    $("#resume").prop("disabled", true);
  } else {
    $("#pause").prop("disabled", true);
    $("#resume").prop("disabled", false);
  }
}

function stepRender() {
  s.currentLevel.step();
  s.table.color(s.currentLevel.map.tiles, mapColor);
}

$("#step").click(function(ev) {
  stepRender();
});
$("#run").click(function(ev) {
  changeOrRestartLevel(new Level1());
  changeState(true);
});
$("#saveLoad").click(function(ev) {
  saveAndLoad();
});
$("#pause").click(function(ev) {
  changeState(false);
});
$("#resume").click(function(ev) {
  changeState(true);
});

changeOrRestartLevel(new Level1());