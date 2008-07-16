var Ci = Components.interfaces;
var Cc = Components.classes;

var gClipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);

window.addEventListener('load', function(e) {
  const ICON_SIZE = 16;

  var canvas = document.getElementById("myCanvas");
  var contextMenu = document.getElementById("colorpicker-menu");
  var menuItems = {};
  var colorTypes = [];

  Array.forEach(contextMenu.childNodes[0].childNodes, function(menuItem) {
    menuItems[menuItem.className] = menuItem;
    colorTypes.push(menuItem.className);
  });

  gBrowser.addEventListener("load", function(e) {
    if (e.originalTarget instanceof HTMLDocument) {
      e.originalTarget.addEventListener('click', getColor, false);
    }
  }, true);

  function getColor(e) {
    var win = window.content;
    var x = e.pageX;
    var y = e.pageY;
    var w = h = 1;

    canvas.style.display = "inline";
    canvas.width = w;
    canvas.height = h;

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawWindow(win, x, y, w, h, "rgb(255,255,255)");

    var color = Color.fromImageData(ctx.getImageData(0, 0, w, h));

    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    ctx.fillStyle = color.toRGB();
    ctx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);
    contextMenu.style.listStyleImage = 'url(' + canvas.toDataURL('image/png') + ')';

    colorTypes.forEach(function(type) {
      menuItems[type].label = color['to' + type]();
      menuItems[type].addEventListener('command', function() {
	gClipboardHelper.copyString(color['to' + type]());
      }, false);
    });

    canvas.style.display = "none";
  }

  var Color = function(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  Color.fromImageData = function(imageData) {
    var [r, g, b] = imageData.data;
    return new Color(r, g, b);
  };

  Color.prototype = {
    toRGB: function() {
      return 'rgb(' + this.rgb.join(',') + ')';
    },
    toHex: function() {
      return '#' + this.rgb.map(format).join('');
      
      function format(number) {
	var hex = (number).toString(16);
	return hex.length == 1 ? '0' + hex : hex;
      }
    },
    get rgb() {
      return [this.r, this.g, this.b];
    }
  }
}, false);
