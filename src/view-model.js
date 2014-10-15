// "model of the view", visual things, should not be tied to specific elements
function Table(tbody, width, height) {
  this.tbody = tbody;
  for (var i = 0; i < width; i++) {
    var row = $("<tr>");
    for (var j = 0; j < height; j++) {
      row.append($("<td>"));
    }
    row.appendTo(tbody);
  }
}

Table.prototype.color = function(twoDColorArray, bimap) {
  var trElem = this.tbody[0].children[0];
  for (var i = 0; i < twoDColorArray.length; i++) {
    var elem = trElem.children[0];
    for (var j = 0; j < twoDColorArray[i].length; j++) {
      var t = twoDColorArray[j][i];
      $(elem).removeAttr("class");
      $(elem).addClass(bimap.val(t));
      elem = elem.nextSibling || elem;
    }
    trElem = trElem.nextSibling;
  }
}
