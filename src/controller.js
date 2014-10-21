// controller, could be automatically derived from view annotations / further refinement.
var s = {};

var newCode = null;
var qs = document.querySelector.bind(document);
var qsA = document.querySelectorAll.bind(document);

function saveAndLoad() {
  // eval user code into a function
  var strCode = s.editor.getValue();
  $.globalEval("var newCode = " + strCode);
  s.currentLevel.map.setAI(newCode);
}

function toggleLDesc() {
  if (JSON.parse(localStorage.lDescVis)) {
    localStorage.lDescVis = JSON.stringify(false);
    setLDescVis(false);
  } else {
    localStorage.lDescVis = JSON.stringify(true);
    setLDescVis(true);
  }
}

function setLDescVis(bool) {
  if (bool) {
    for (var d of Array.prototype.slice.call(qsA('.lDesc')))
      d.style.display = "none";
    qs('#toggleLDesc').innerHTML = "Show Level Descriptions";
  } else {
    for (var d of Array.prototype.slice.call(qsA('.lDesc')))
      d.style.display = "";
    qs('#toggleLDesc').innerHTML = "Hide Level Descriptions";
  }
}

var levels = [
  Level1,
  Level2,
  Level3,
  Level4
]

function setLevelInsert(levelI) {
  setLevelInitial(levelI);
  insertAnswerIndex(0);
  setLevel(levelI);
}

function setLevelInitial(levelI) {
  var levelcons = levels[levelI];
  var level = new levelcons();
  s.currentLevel = level;
}

function setLevel(levelI) {
  localStorage.levelI = JSON.stringify(levelI);

  var ide = qs('#ide');
  ide.remove();
  qs('core-animated-pages').selectIndex(levelI).appendChild(ide);

  changeOrRestartLevel(s.currentLevel);

  qs('#forward-button').disabled = false;
  qs('#back-button').disabled = false;
  qs('#chapterName').innerHTML = "L" + (levelI + 1) + ": " + s.currentLevel.name;
  if (levelI == (levels.length - 1)) qs('#forward-button').disabled = true;
  if (levelI == 0) qs('#back-button').disabled = true;
}

function insertAnswerIndex(i) {
  s.editor.setValue(js_beautify(s.currentLevel.answers[i].toString(), {
    'indent_size': 2
  }));
}

function changeLevel(num) {
  var i = qs('core-animated-pages').selectedIndex;
  var levelI = i + num; // zero-indexed level value

  setLevelInsert(levelI);
}

s.table = null;
s.interval = null;
s.endLevelO = null;
s.currentLevel = null;

function changeOrRestartLevel(level) {
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
    var levelI = JSON.parse(localStorage.levelI);
    if (s.currentLevel.endLevelState == EndLevelState.WIN) {
      var turns = (levelI.turns) ? " in " + levelI.turns + "." : "";
      alert("You beat level " + (levelI + 1) + turns);
    }
    if (s.currentLevel.endLevelState == EndLevelState.LOSE) {
      alert("You lost level " + (levelI + 1) + ". Error message: " + s.currentLevel.endMessage);
    }
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
  var levelI = JSON.parse(localStorage.levelI);
  setLevelInitial(levelI);
  setLevel(levelI);
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


window.addEventListener('polymer-ready', function(e) {
  s.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    matchBrackets: true,
    continueComments: "Enter",
    viewportMargin: Infinity,
    extraKeys: {
      "Ctrl-Q": "toggleComment"
    }
  });

  if (localStorage.levelI) {
    setLevelInsert(JSON.parse(localStorage.levelI));
  } else {
    setLevelInsert(0);
  }

  if (localStorage.lDescVis) {
    setLDescVis(JSON.parse(localStorage.lDescVis));
  } else {
    localStorage.lDescVis = JSON.stringify(true);
    setLDescVis(true);
  }

  // http://stackoverflow.com/questions/8349571/codemirror-editor-is-not-loading-content-until-clicked
  var p = document.querySelector('core-animated-pages');
  p.addEventListener('core-animated-pages-transition-end', function(e) {
    s.editor.refresh();
  });
});