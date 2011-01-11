(function () { 

/*
  File: Core.js
  
  Description:
  
  Provides common utility functions and the Class object used internally by the library.
  
  Also provides the <TreeUtil> object for manipulating JSON tree structures
  
  Some of the Basic utility functions and the Class system are based in the MooTools Framework <http://mootools.net>. Copyright (c) 2006-2009 Valerio Proietti, <http://mad4milk.net/>. MIT license <http://mootools.net/license.txt>.
  
  Author: 
  
  Nicolas Garcia Belmonte
  
  Copyright: 
  
  Copyright 2008-2009 by Nicolas Garcia Belmonte.
  
  Homepage: 
  
  <http://thejit.org>
  
  Version: 
  
  1.1.3

  License: 
  
  BSD License
 */



window.$jit = function(w) {
  w = w || window;
  for(var k in $jit) {
    if($jit[k].$extend) {
      w[k] = $jit[k];
    }
  }
};


var $ = function(d) {
  return document.getElementById(d);
};

$.empty = function() {
};

$.extend = function(original, extended) {
  for ( var key in (extended || {}))
    original[key] = extended[key];
  return original;
};

$.lambda = function(value) {
  return (typeof value == 'function') ? value : function() {
    return value;
  };
};

$.time = Date.now || function() {
  return +new Date;
};

$.splat = function(obj) {
  var type = $.type(obj);
  return type ? ((type != 'array') ? [ obj ] : obj) : [];
};

$.type = function(elem) {
  return $.type.s.call(elem).match(/^\[object\s(.*)\]$/)[1].toLowerCase();
};
$.type.s = Object.prototype.toString;

$.each = function(iterable, fn) {
  var type = $.type(iterable);
  if (type == 'object') {
    for ( var key in iterable)
      fn(iterable[key], key);
  } else {
    for ( var i = 0; i < iterable.length; i++)
      fn(iterable[i], i);
  }
};

$.merge = function() {
  var mix = {};
  for ( var i = 0, l = arguments.length; i < l; i++) {
    var object = arguments[i];
    if ($.type(object) != 'object')
      continue;
    for ( var key in object) {
      var op = object[key], mp = mix[key];
      mix[key] = (mp && $.type(op) == 'object' && $.type(mp) == 'object') ? $
          .merge(mp, op) : $.unlink(op);
    }
  }
  return mix;
};

$.unlink = function(object) {
  var unlinked;
  switch ($.type(object)) {
  case 'object':
    unlinked = {};
    for ( var p in object)
      unlinked[p] = $.unlink(object[p]);
    break;
  case 'array':
    unlinked = [];
    for ( var i = 0, l = object.length; i < l; i++)
      unlinked[i] = $.unlink(object[i]);
    break;
  default:
    return object;
  }
  return unlinked;
};

$.rgbToHex = function(srcArray, array) {
  if (srcArray.length < 3)
    return null;
  if (srcArray.length == 4 && srcArray[3] == 0 && !array)
    return 'transparent';
  var hex = [];
  for ( var i = 0; i < 3; i++) {
    var bit = (srcArray[i] - 0).toString(16);
    hex.push(bit.length == 1 ? '0' + bit : bit);
  }
  return array ? hex : '#' + hex.join('');
};

$.hexToRgb = function(hex) {
  if (hex.length != 7) {
    hex = hex.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
    hex.shift();
    if (hex.length != 3)
      return null;
    var rgb = [];
    for ( var i = 0; i < 3; i++) {
      var value = hex[i];
      if (value.length == 1)
        value += value;
      rgb.push(parseInt(value, 16));
    }
    return rgb;
  } else {
    hex = parseInt(hex.slice(1), 16);
    return [ hex >> 16, hex >> 8 & 0xff, hex & 0xff ];
  }
};

$.destroy = function(elem) {
  $.clean(elem);
  if (elem.parentNode)
    elem.parentNode.removeChild(elem);
  if (elem.clearAttributes)
    elem.clearAttributes();
};

$.clean = function(elem) {
  for ( var ch = elem.childNodes, i = 0, l = ch.length; i < l; i++) {
    $.destroy(ch[i]);
  }
};

$.addEvent = function(obj, type, fn) {
  if (obj.addEventListener)
    obj.addEventListener(type, fn, false);
  else
    obj.attachEvent('on' + type, fn);
};

$.hasClass = function(obj, klass) {
  return (' ' + obj.className + ' ').indexOf(' ' + klass + ' ') > -1;
};

$.addClass = function(obj, klass) {
  if (!$.hasClass(obj, klass))
    obj.className = (obj.className + " " + klass);
};

$.removeClass = function(obj, klass) {
  obj.className = obj.className.replace(new RegExp(
      '(^|\\s)' + klass + '(?:\\s|$)'), '$1');
};

$.getPos = function(elem) {
  if (elem.getBoundingClientRect) {
    var bound = elem.getBoundingClientRect(), html = elem.ownerDocument.documentElement;
    return {
      x: bound.left + html.scrollLeft - html.clientLeft,
      y: bound.top + html.scrollTop - html.clientTop
    };
  }

  var offset = getOffsets(elem);
  var scroll = getScrolls(elem);

  return {
    x: offset.x - scroll.x,
    y: offset.y - scroll.y
  };

  function getOffsets(elem) {
    var position = {
      x: 0,
      y: 0
    };
    while (elem && !isBody(elem)) {
      position.x += elem.offsetLeft;
      position.y += elem.offsetTop;
      elem = elem.offsetParent;
    }
    return position;
  }

  function getScrolls(elem) {
    var position = {
      x: 0,
      y: 0
    };
    while (elem && !isBody(elem)) {
      position.x += elem.scrollLeft;
      position.y += elem.scrollTop;
      elem = elem.parentNode;
    }
    return position;
  }

  function isBody(element) {
    return (/^(?:body|html)$/i).test(element.tagName);
  }
};

var Class = function(properties) {
  properties = properties || {};
  var klass = function() {
    for ( var key in this) {
      if (typeof this[key] != 'function')
        this[key] = $.unlink(this[key]);
    }
    this.constructor = klass;
    if (Class.prototyping)
      return this;
    var instance = this.initialize ? this.initialize.apply(this, arguments)
        : this;
    return instance;
  };

  for ( var mutator in Class.Mutators) {
    if (!properties[mutator])
      continue;
    properties = Class.Mutators[mutator](properties, properties[mutator]);
    delete properties[mutator];
  }

  $.extend(klass, this);
  klass.constructor = Class;
  klass.prototype = properties;
  return klass;
};

Class.Mutators = {

  Implements: function(self, klasses) {
    $.each($.splat(klasses), function(klass) {
      Class.prototyping = klass;
      var instance = (typeof klass == 'function') ? new klass : klass;
      for ( var prop in instance) {
        if (!(prop in self)) {
          self[prop] = instance[prop];
        }
      }
      delete Class.prototyping;
    });
    return self;
  }

};

$.extend(Class, {

  inherit: function(object, properties) {
    for ( var key in properties) {
      var override = properties[key];
      var previous = object[key];
      var type = $.type(override);
      if (previous && type == 'function') {
        if (override != previous) {
          Class.override(object, key, override);
        }
      } else if (type == 'object') {
        object[key] = $.merge(previous, override);
      } else {
        object[key] = override;
      }
    }
    return object;
  },

  override: function(object, name, method) {
    var parent = Class.prototyping;
    if (parent && object[name] != parent[name])
      parent = null;
    var override = function() {
      var previous = this.parent;
      this.parent = parent ? parent[name] : object[name];
      var value = method.apply(this, arguments);
      this.parent = previous;
      return value;
    };
    object[name] = override;
  }

});

Class.prototype.implement = function() {
  var proto = this.prototype;
  $.each(Array.prototype.slice.call(arguments || []), function(properties) {
    Class.inherit(proto, properties);
  });
  return this;
};

var Event = {
  getPos: function(e, win) {
    // get mouse position
    win = win || window;
    e = e || win.event;
    var doc = win.document;
    doc = doc.html || doc.body;
    var page = {
      x: e.pageX || e.clientX + doc.scrollLeft,
      y: e.pageY || e.clientY + doc.scrollTop
    };
    return page;
  }
};

//common json manipulation methods
$jit.json = {

  /*
     Method: prune
  
     Clears all tree nodes having depth greater than maxLevel.
  
     Parameters:
  
        tree - A JSON tree object. For more information please see <Loader.loadJSON>.
        maxLevel - An integer specifying the maximum level allowed for this tree. All nodes having depth greater than max level will be deleted.

  */
  prune: function(tree, maxLevel) {
    this.each(tree, function(elem, i) {
      if (i == maxLevel && elem.children) {
        delete elem.children;
        elem.children = [];
      }
    });
  },

  /*
     Method: getParent
  
     Returns the parent node of the node having _id_ as id.
  
     Parameters:
  
        tree - A JSON tree object. See also <Loader.loadJSON>.
        id - The _id_ of the child node whose parent will be returned.

    Returns:

        A tree JSON node if any, or false otherwise.
  
  */
  getParent: function(tree, id) {
    if (tree.id == id)
      return false;
    var ch = tree.children;
    if (ch && ch.length > 0) {
      for ( var i = 0; i < ch.length; i++) {
        if (ch[i].id == id)
          return tree;
        else {
          var ans = this.getParent(ch[i], id);
          if (ans)
            return ans;
        }
      }
    }
    return false;
  },

  /*
     Method: getSubtree
  
     Returns the subtree that matches the given id.
  
     Parameters:
  
        tree - A JSON tree object. See also <Loader.loadJSON>.
        id - A node *unique* identifier.
  
     Returns:
  
        A subtree having a root node matching the given id. Returns null if no subtree matching the id is found.

  */
  getSubtree: function(tree, id) {
    if (tree.id == id)
      return tree;
    for ( var i = 0, ch = tree.children; i < ch.length; i++) {
      var t = this.getSubtree(ch[i], id);
      if (t != null)
        return t;
    }
    return null;
  },

  /*
     Method: getLeaves
  
      Returns the leaves of the tree.
  
     Parameters:
  
        node - A JSON tree node. See also <Loader.loadJSON>.
        maxLevel - _optional_ A subtree's max level.
  
     Returns:
  
     An array having objects with two properties. 
     
      - The _node_ property contains the leaf node. 
      - The _level_ property specifies the depth of the node.

  */
  getLeaves: function(node, maxLevel) {
    var leaves = [], levelsToShow = maxLevel || Number.MAX_VALUE;
    this.each(node, function(elem, i) {
      if (i < levelsToShow && (!elem.children || elem.children.length == 0)) {
        leaves.push( {
          'node': elem,
          'level': levelsToShow - i
        });
      }
    });
    return leaves;
  },

  /*
     Method: eachLevel
  
      Iterates on tree nodes with relative depth less or equal than a specified level.
  
     Parameters:
  
        tree - A JSON tree or subtree. See also <Loader.loadJSON>.
        initLevel - An integer specifying the initial relative level. Usually zero.
        toLevel - An integer specifying a top level. This method will iterate only through nodes with depth less than or equal this number.
        action - A function that receives a node and an integer specifying the actual level of the node.
          
    Example:
   (start code js)
     TreeUtil.eachLevel(tree, 0, 3, function(node, depth) {
        alert(node.name + ' ' + depth);
     });
   (end code)
  */
  eachLevel: function(tree, initLevel, toLevel, action) {
    if (initLevel <= toLevel) {
      action(tree, initLevel);
      for ( var i = 0, ch = tree.children; i < ch.length; i++) {
        this.eachLevel(ch[i], initLevel + 1, toLevel, action);
      }
    }
  },

  /*
     Method: each
  
      A tree iterator.
  
     Parameters:
  
        tree - A JSON tree or subtree. See also <Loader.loadJSON>.
        action - A function that receives a node.

    Example:
    (start code js)
      TreeUtil.each(tree, function(node) {
        alert(node.name);
      });
    (end code)
          
  */
  each: function(tree, action) {
    this.eachLevel(tree, 0, Number.MAX_VALUE, action);
  },

  /*
     Method: loadSubtrees
  
      Appends subtrees to leaves by requesting new subtrees
      with the _request_ method.
  
     Parameters:
  
        tree - A JSON tree node. <Loader.loadJSON>.
        controller - An object that implements a request method.
    
     Example:
      (start code js)
        TreeUtil.loadSubtrees(leafNode, {
          request: function(nodeId, level, onComplete) {
            //Pseudo-code to make an ajax request for a new subtree
            // that has as root id _nodeId_ and depth _level_ ...
            Ajax.request({
              'url': 'http://subtreerequesturl/',
              
              onSuccess: function(json) {
                onComplete.onComplete(nodeId, json);
              }
            });
          }
        });
      (end code)
  */
  loadSubtrees: function(tree, controller) {
    var maxLevel = controller.request && controller.levelsToShow;
    var leaves = this.getLeaves(tree, maxLevel), len = leaves.length, selectedNode = {};
    if (len == 0)
      controller.onComplete();
    for ( var i = 0, counter = 0; i < len; i++) {
      var leaf = leaves[i], id = leaf.node.id;
      selectedNode[id] = leaf.node;
      controller.request(id, leaf.level, {
        onComplete: function(nodeId, tree) {
          var ch = tree.children;
          selectedNode[nodeId].children = ch;
          if (++counter == len) {
            controller.onComplete();
          }
        }
      });
    }
  }
};


/*
 * File: Animation.js
 * 
 * Core <Animation> and <Trans> transition classes.
 *
*/

/*
   Object: Trans
    
     An object containing multiple type of transformations. 
     
     Based on:
         
     Easing and Transition animation methods are based in the MooTools Framework <http://mootools.net>. Copyright (c) 2006-2009 Valerio Proietti, <http://mad4milk.net/>. MIT license <http://mootools.net/license.txt>.

     Used by:

     <RGraph>, <Hypertree> and <ST> classes.

     Description:

     This object is used for specifying different animation transitions in the <RGraph>, <Hypertree> and <ST> classes.

     There are many different type of animation transitions.

     linear:

     Displays a linear transition

     >Trans.linear
     
     (see Linear.png)

     Quad:

     Displays a Quadratic transition.
  
     >Trans.Quad.easeIn
     >Trans.Quad.easeOut
     >Trans.Quad.easeInOut
     
    (see Quad.png)

    Cubic:

    Displays a Cubic transition.

    >Trans.Cubic.easeIn
    >Trans.Cubic.easeOut
    >Trans.Cubic.easeInOut

    (see Cubic.png)

    Quart:

    Displays a Quartetic transition.

    >Trans.Quart.easeIn
    >Trans.Quart.easeOut
    >Trans.Quart.easeInOut

    (see Quart.png)

    Quint:

    Displays a Quintic transition.

    >Trans.Quint.easeIn
    >Trans.Quint.easeOut
    >Trans.Quint.easeInOut

    (see Quint.png)

    Expo:

    Displays an Exponential transition.

    >Trans.Expo.easeIn
    >Trans.Expo.easeOut
    >Trans.Expo.easeInOut

    (see Expo.png)

    Circ:

    Displays a Circular transition.

    >Trans.Circ.easeIn
    >Trans.Circ.easeOut
    >Trans.Circ.easeInOut

    (see Circ.png)

    Sine:

    Displays a Sineousidal transition.

    >Trans.Sine.easeIn
    >Trans.Sine.easeOut
    >Trans.Sine.easeInOut

    (see Sine.png)

    Back:

    >Trans.Back.easeIn
    >Trans.Back.easeOut
    >Trans.Back.easeInOut

    (see Back.png)

    Bounce:

    Bouncy transition.

    >Trans.Bounce.easeIn
    >Trans.Bounce.easeOut
    >Trans.Bounce.easeInOut

    (see Bounce.png)

    Elastic:

    Elastic curve.

    >Trans.Elastic.easeIn
    >Trans.Elastic.easeOut
    >Trans.Elastic.easeInOut

    (see Elastic.png)



*/
$jit.Trans = {
  $extend: true,
  
  linear: function(p){
    return p;
  }
};

var Trans = $jit.Trans;

(function(){

  var makeTrans = function(transition, params){
    params = $.splat(params);
    return $.extend(transition, {
      easeIn: function(pos){
        return transition(pos, params);
      },
      easeOut: function(pos){
        return 1 - transition(1 - pos, params);
      },
      easeInOut: function(pos){
        return (pos <= 0.5)? transition(2 * pos, params) / 2 : (2 - transition(
            2 * (1 - pos), params)) / 2;
      }
    });
  };

  var transitions = {

    Pow: function(p, x){
      return Math.pow(p, x[0] || 6);
    },

    Expo: function(p){
      return Math.pow(2, 8 * (p - 1));
    },

    Circ: function(p){
      return 1 - Math.sin(Math.acos(p));
    },

    Sine: function(p){
      return 1 - Math.sin((1 - p) * Math.PI / 2);
    },

    Back: function(p, x){
      x = x[0] || 1.618;
      return Math.pow(p, 2) * ((x + 1) * p - x);
    },

    Bounce: function(p){
      var value;
      for ( var a = 0, b = 1; 1; a += b, b /= 2) {
        if (p >= (7 - 4 * a) / 11) {
          value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
          break;
        }
      }
      return value;
    },

    Elastic: function(p, x){
      return Math.pow(2, 10 * --p)
          * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
    }

  };

  $.each(transitions, function(val, key){
    Trans[key] = makeTrans(val);
  });

  $.each( [
      'Quad', 'Cubic', 'Quart', 'Quint'
  ], function(elem, i){
    Trans[elem] = makeTrans(function(p){
      return Math.pow(p, [
        i + 2
      ]);
    });
  });

})();

/*
   Class: Animation
    
   A Class that can perform animations for generic objects.

   If you are looking for animation transitions please take a look at the <Trans> object.

   Used by:

   <Graph.Plot>
   
   Based on:
   
   The Animation class is based in the MooTools Framework <http://mootools.net>. Copyright (c) 2006-2009 Valerio Proietti, <http://mad4milk.net/>. MIT license <http://mootools.net/license.txt>.

*/

var Animation = new Class( {

  initalize: function(options){
    this.setOptions(options);
  },

  setOptions: function(options){
    var opt = {
      duration: 2500,
      fps: 40,
      transition: Trans.Quart.easeInOut,
      compute: $.empty,
      complete: $.empty,
      link: 'ignore'
    };
    this.opt = $.merge(opt, options || {});
    return this;
  },

  step: function(){
    var time = $.time(), opt = this.opt;
    if (time < this.time + opt.duration) {
      var delta = opt.transition((time - this.time) / opt.duration);
      opt.compute(delta);
    } else {
      this.timer = clearInterval(this.timer);
      opt.compute(1);
      opt.complete();
    }
  },

  start: function(){
    if (!this.check())
      return this;
    this.time = 0;
    this.startTimer();
    return this;
  },

  startTimer: function(){
    var that = this, fps = this.opt.fps;
    if (this.timer)
      return false;
    this.time = $.time() - this.time;
    this.timer = setInterval((function(){
      that.step();
    }), Math.round(1000 / fps));
    return true;
  },

  pause: function(){
    this.stopTimer();
    return this;
  },

  resume: function(){
    this.startTimer();
    return this;
  },

  stopTimer: function(){
    if (!this.timer)
      return false;
    this.time = $.time() - this.time;
    this.timer = clearInterval(this.timer);
    return true;
  },

  check: function(){
    if (!this.timer)
      return true;
    if (this.opt.link == 'cancel') {
      this.stopTimer();
      return true;
    }
    return false;
  }
});


/*
 * File: Options.js
 * 
 * Visualization common options.
 *
 * Description:
 *
 * Provides an Object with common visualization options
 * 
 * Implemented by:
 * 
 * <RGraph>, <Hypertree>, <TM>, <ST>.
 * 
 */

/*
 * Object: Options
 * 
 * Parent object for common Options.
 *
 */
var Options = function() {
  var args = Array.prototype.slice.call(arguments);
  for(var i=0, l=args.length, ans={}; i<l; i++) {
    var opt = Options[args[i]];
    if(opt.$extend) {
      $.extend(ans, opt);
    } else {
      ans[args[i]] = opt;  
    }
  }
  return ans;
};

/*
  Object: Options.Canvas
  
  Canvas Options.
  
  Description:
  
  Sets Canvas options as with, height, the element to be injected to, etc.
  
  Implemented by:
  
  
  Parameters:
  
*/

Options.Canvas = {
    $extend: true,
    
    'injectInto': 'id',
    'useCanvas': false,
    'labels': 'HTML', //can also be 'SVG' or 'Native'
    'backgroundCanvas': false
};

/*
  Object: Options.Node

  Provides Node options for <Canvas> based visualizations.

  Description:

  Node options for <Canvas> based visualizations.
  
  Implemented by:
  
  <ST>, <Hypertree>, <RGraph>

  These configuration parameters are currently used by <ST>, <RGraph> and <Hypertree>.

  These options are

     - _overridable_ Determine whether or not nodes properties can be overriden by a particular node. Default's false.

     If given a JSON tree or graph, a node _data_ property contains properties which are the same as defined here but prefixed with 
     a dollar sign (i.e $), the node properties will override the global node properties.

     - _type_ Node type (shape). Possible options are "none", "square", "rectangle", "circle", "triangle", "star". Default's "circle".
     - _color_ Node color. Default's '#ccb'.
     - _lineWidth_ Line width. If nodes aren't drawn with strokes then this property won't be of any use. Default's 1.
     - _alpha_ The Node's alpha value. Default's 1 (for full opacity).
     - _height_ Node height. Used for plotting rectangular nodes. Default's 20.
     - _width_ Node width. Used for plotting rectangular nodes. Default's 90.
     - _dim_ An extra parameter used by other complex shapes such as square and circle to determine the shape's diameter. Default's 3.
     - _transform_ *<Hypertree> only*. Whether to apply the moebius transformation to the nodes or not. Default's true.
     - _align_ *<ST> only*. Defines a node's alignment. Possible values are "center", "left", "right". Default's "center".
     - _angularWidth_ Used for calculating node and subtrees angular widths. It's used only in <Layouts.Radial>.

*/
Options.Node = {
  $extend: false,
  
  overridable: false,
  type: 'circle',
  dim: 3,
  color: '#ccb',
  height: 20,
  width: 90,
  autoHeight: false,
  autoWidth: false,
  labelPadding: 0,
  lineWidth: 1,
  transform: true,
  align: "center",
  alpha: 1,
  angularWidth:1,
  span:1
};


/*
  Object: Options.Edge

  Provides Edge options for <Canvas> based visualizations.

  Description:

  Edge options for <Canvas> based Graph visualizations.

  Implemented by:

  <ST>, <Hypertree>, <RGraph>

  These configuration parameters are currently used by <ST>, <RGraph> and <Hypertree>.

  This object has as properties

     - _overridable_ Determine whether or not edges properties can be overridden by a particular edge object. Default's false.

     If given a JSON _complex_ graph (defined in <Loader.loadJSON>), an adjacency _data_ property contains properties which are the same as defined here but prefixed with 
     a dollar sign (i.e $), the adjacency properties will override the global edge properties.

     - _type_ Edge type (shape). Default's "line" in the <RGraph> and <ST>, but "hyperline" in the <Hypertree> visualization.
     - _color_ Edge color. Default's '#ccb'.
     - _lineWidth_ Line width. If edges aren't drawn with strokes then this property won't be of any use. Default's 1.
     - _alpha_ The Edge's alpha value. Default's 1 (for full opacity).
     - _dim_ An extra parameter used by other complex shapes such as qudratic or bezier to determine the shape's diameter. Default's 15.

*/
Options.Edge = {
  $extend: false,
  
  overridable: false,
  type: 'line',
  color: '#ccb',
  lineWidth: 1,
  dim:15,
  alpha: 1
};


/*
  Object: Options.Fx

  Provides animation configuration options.

  Description:

  This object provides animation specific configuration options.
  
  These configuration parameters are currently used by <ST>, <RGraph> and <Hypertree>.
  
  These options are
  
     - _duration_ Duration of the animation in milliseconds. Default's 2500.
     - _fps_ Frames per second. Default's 40.
     - _transition_ One of the transitions defined in the <Animation> class. Default's Quart.easeInOut.
     - _clearCanvas_ Whether to clear canvas on each animation frame or not. Default's true.

*/
Options.Fx = {
  $extend: true, //TODO(nico): switch to false.
  
  fps:40,
  duration: 2500,
  transition: $jit.Trans.Quart.easeInOut,
  clearCanvas: true
};

/*
  Object: Options.Tips
  
  Options for Tips
  
  Description:
  
  Options for Tool Tips.
  
  Implemented by:
  
  <TM>

  These configuration parameters are currently used by <TM>.


  - _allow_ If *true*, a tooltip will be shown when a node is hovered. The tooltip is a div DOM element having "tip" as CSS class. Default's *false*. 
  - _offsetX_ An offset added to the current tooltip x-position (which is the same as the current mouse position). Default's 20.
  - _offsetY_ An offset added to the current tooltip y-position (which is the same as the current mouse position). Default's 20.
  - _onShow(tooltip, node, isLeaf, domElement)_ Implement this method to change the HTML content of the tooltip when hovering a node.
  
  Parameters:
    tooltip - The tooltip div element.
    node - The corresponding JSON tree node (See also <Loader.loadJSON>).
    isLeaf - Whether is a leaf or inner node.
    domElement - The current hovered DOM element.

*/
Options.Tips = {
  $extend: false,
  
  allow: false, //TODO(nico) change allow for enable
  attachToDOM: true,
  attachToCanvas: false,
  offsetX: 20,
  offsetY: 20,
  onShow: $.empty
};


/*
  Object: Options.NodeStyles
  
  Apply different styles when a node is hovered or selected.
  
  Description:
  
  Sets different node styles for nodes hovered or selected.
  
  Implemented by:
  
  <ForceDirected>
  
  Parameters:
  
  nodeStylesOnHover - An object with node styles or *false* otherwise. See <Options.Graph> for node styles.
  nodeStylesSelected - An object with node styles or *false* otherwise. See <Options.Graph> for node styles.
*/

Options.NodeStyles = {
  $extend: false,
  
  attachToDOM: true,
  attachToCanvas: false,
  stylesHover: false,
  stylesClick: false,
  stylesRightClick:false,
  onHover: $.empty,
  onClick: $.empty,
  onRightClick: $.empty
};

/*
  Object: Options.Controller
  
  Provides controller methods.
  
  Description:
  
  You can implement controller functions inside the configuration object of all visualizations.
  
  *Common to all visualizations*
    
   - _onBeforeCompute(node)_ This method is called right before performing all computation and animations to the JIT visualization.
   - _onAfterCompute()_ This method is triggered right after all animations or computations for the JIT visualizations ended.

  *Used in <Canvas> based visualizations <ST>, <Hypertree>, <RGraph>*

   - _onCreateLabel(domElement, node)_ This method receives the label dom element as first parameter, and the corresponding <Graph.Node> as second parameter. This method will only be called on label creation. Note that a <Graph.Node> is a node from the input tree/graph you provided to the visualization. If you want to know more about what kind of JSON tree/graph format is used to feed the visualizations, you can take a look at <Loader.loadJSON>. This method proves useful when adding events to the labels used by the JIT.
   - _onPlaceLabel(domElement, node)_ This method receives the label dom element as first parameter and the corresponding <Graph.Node> as second parameter. This method is called each time a label has been placed on the visualization, and thus it allows you to update the labels properties, such as size or position. Note that onPlaceLabel will be triggered after updating the labels positions. That means that, for example, the left and top css properties are already updated to match the nodes positions.
   - _onBeforePlotNode(node)_ This method is triggered right before plotting a given node. The _node_ parameter is the <Graph.Node> to be plotted. 
    This method is useful for changing a node style right before plotting it.
   - _onAfterPlotNode(node)_ This method is triggered right after plotting a given node. The _node_ parameter is the <Graph.Node> plotted.
   - _onBeforePlotLine(adj)_ This method is triggered right before plotting an edge. The _adj_ parameter is a <Graph.Adjacence> object. 
    This method is useful for adding some styles to a particular edge before being plotted.
   - _onAfterPlotLine(adj)_ This method is triggered right after plotting an edge. The _adj_ parameter is the <Graph.Adjacence> plotted.

   *Used in <TM> (Treemap) and DOM based visualizations*
    
   - _onCreateElement(content, node, isLeaf, elem1, elem2)_ This method is called on each newly created node. 
    
    Parameters:
     content - The div wrapper element with _content_ className.
     node - The corresponding JSON tree node (See also <Loader.loadJSON>).
     isLeaf - Whether is a leaf or inner node. If the node's an inner tree node, elem1 and elem2 will become the _head_ and _body_ div elements respectively. 
     If the node's a _leaf_, then elem1 will become the div leaf element.
    
    - _onDestroyElement(content, node, isLeaf, elem1, elem2)_ This method is called before collecting each node. Takes the same parameters as onCreateElement.
    
    *Used in <ST> and <TM>*
    
    - _request(nodeId, level, onComplete)_ This method is used for buffering information into the visualization. When clicking on an empty node,
    the visualization will make a request for this node's subtrees, specifying a given level for this subtree (defined by _levelsToShow_). Once the request is completed, the _onComplete_ 
    object should be called with the given result.
 
 */
Options.Controller = {
  $extend: true,
  
  onBeforeCompute: $.empty,
  onAfterCompute:  $.empty,
  onCreateLabel:   $.empty,
  onPlaceLabel:    $.empty,
  onComplete:      $.empty,
  onBeforePlotLine:$.empty,
  onAfterPlotLine: $.empty,
  onBeforePlotNode:$.empty,
  onAfterPlotNode: $.empty,
  onCreateElement: $.empty,
  onDestroyElement:$.empty,
  request:         false
};


/*
 * File: Extras.js
 * 
 * Provides Extras such as Tips and Style Effects.
 * 
 * Description:
 * 
 * Provides the <Tips> and <NodeStyles> classes and functions.
 *
 */

/* 
 * Provides the initialization function for <NodeStyles> and <Tips> implemented 
 * by all main visualizations.
 *
 */
var Extras = {
  initializeExtras: function() {
    var tips = this.config.Tips;
    var ns = this.config.NodeStyles;
    if(tips && tips.allow && tips.attachToCanvas 
        || ns && ns.attachToCanvas) {
      this.mouseEventsManager = new MouseEventsManager(this);
    }
    if(tips) {
      this.tips = new Tips(this);
      if(tips.allow && tips.attachToCanvas) {
        this.mouseEventsManager.register(this.tips);
      }
    }
    if(ns) {
      this.nodeStyles = new NodeStyles(this);
      if(ns.attachToCanvas) {
        this.mouseEventsManager.register(this.nodeStyles);
      }
    }
  }   
};

/*
 * Manager for mouse events (clicking and mouse moving).
 * 
 * This class is used for registering objects implementing onClick
 * and onMousemove methods. These methods are called when clicking or
 * moving the mouse around  the Canvas.
 * For now, <Tips> and <NodeStyles> are classes implementing these methods.
 * 
 */
var MouseEventsManager = new Class({
  initialize: function(viz) {
    this.viz = viz;
    this.canvas = viz.canvas;
    this.nodeTypes = viz.fx.nodeTypes;
    this.registeredObjects = [];

    this.click = {
      node: null,
      time: $.time()
    };
    
    this.rightClick = {
        node: null,
        time: $.time()
    };

    this.mousemove = {
      node: null,
      time: $.time()
    };
    
    this.mintime = 10;    
    this.attachEvents();
  },
  
  attachEvents: function() {
    var htmlCanvas = this.canvas.getElement(), that = this;
    htmlCanvas.oncontextmenu = $.lambda(false);
    $.addEvent(htmlCanvas, 'mouseup', function(e, win) {
      var rightClick = (e.which == 3 || e.button == 2);
      if (rightClick) {
        that.handleEvent(that.rightClick, 'onRightClick', e, win);
      } else {
        that.handleEvent(that.click, 'onClick', e, win);
      } 
          
      //prevent default 
      if (e.preventDefault) 
          e.preventDefault();
      else 
          e.returnValue = false;
    });
    $.addEvent(htmlCanvas, 'mousemove', function(e, win) {
      that.handleEvent(that.mousemove, 'onMousemove', e, win);
    });
  },
  
  register: function(obj) {
    this.registeredObjects.push(obj);
  },
  
  handleEvent: function(obj, method, e, win) {
    if($.time() - obj.time <= this.mintime) return;
    obj.time = $.time();
    var fx = this.viz.fx;
    var g = this.viz.graph;
    var pos = Event.getPos(e, win);
    var p = this.canvas.getPos();
    var s = this.canvas.getSize();
    var newpos = {
        x: pos.x - p.x - s.width /2,
        y: pos.y - p.y - s.height /2
    };
    var positions = this.nodeTypes;
    var opt = {
        'position': pos  
    };

    if(obj.node) {
      var n = g.getNode(obj.node);
      var elem = n && positions[n.getData('type')];
      if(elem && elem.contains && elem.contains.call(fx, n, newpos)) {
        for(var i=0, l=this.registeredObjects.length; i<l; i++) {
          this.registeredObjects[i][method](n, opt);
        }
        return;
      }
    }
    for(var id in g.nodes) {
      var n = g.nodes[id];
      var elem = n && positions[n.getData('type')];
      if(elem && elem.contains && elem.contains.call(fx, n, newpos)) {
        obj.node = id;
        for(var i=0, l=this.registeredObjects.length; i<l; i++) {
          this.registeredObjects[i][method](n, opt);
        }
        return;
      }
    }
    for(var i=0, l=this.registeredObjects.length; i<l; i++) {
      this.registeredObjects[i][method](false, opt);
    }
  }
});

/*
   Class: Tips
    
   A class containing tip related functions. This class is used internally.
   
   Used by:
   
   <ST>, <Sunburst>, <Hypertree>, <RGraph>, <TM>, <ForceDirected>, <Icicle>
   
   See also:
   
   <Options.Tips>
*/

var Tips = new Class({
  initialize: function(viz) {
    this.viz = viz;
    this.controller = this.config = viz.config;
    //add tooltip
    if(this.config.Tips.allow && document.body) {
        var tip = document.getElementById('_tooltip') || document.createElement('div');
        tip.id = '_tooltip';
        tip.className = 'tip';
        var style = tip.style;
        style.position = 'absolute';
        style.display = 'none';
        style.zIndex = 13000;
        document.body.appendChild(tip);
        this.tip = tip;
        this.node = false;
    }
  },
  
  attach: function(node, elem) {
    if(this.config.Tips.allow) {
      var that = this, cont = this.controller;
      $.addEvent(elem, 'mouseover', function(e){
        cont.Tips.onShow(that.tip, node, elem);
      });
      $.addEvent(elem, 'mouseout', function(e){
          that.tip.style.display = 'none';
      });
      //Add mousemove event handler
      $.addEvent(elem, 'mousemove', function(e, win){
        var pos = Event.getPos(e, win);
        that.setTooltipPosition(pos);
      });
    }
  },

  onClick: $.empty,
  onRightClick: $.empty,
  
  onMousemove: function(node, opt) {
    if(!node) {
      this.tip.style.display = 'none';
      this.node = false;
      return;
    }
    if(!this.node || this.node.id != node.id) {
      this.node = node;
      this.config.Tips.onShow(this.tip, node);
    }
    this.setTooltipPosition(opt.position);
  },
  
  setTooltipPosition: function(pos) {
    var tip = this.tip, style = tip.style, cont = this.config;
    style.display = '';
    //get window dimensions
    win = {
      'height': document.body.clientHeight,
      'width': document.body.clientWidth
    };
    //get tooltip dimensions
    var obj = {
      'width': tip.offsetWidth,
      'height': tip.offsetHeight  
    };
    //set tooltip position
    var x = cont.Tips.offsetX, y = cont.Tips.offsetY;
    style.top = ((pos.y + y + obj.height > win.height)?  
        (pos.y - obj.height - y) : pos.y + y) + 'px';
    style.left = ((pos.x + obj.width + x > win.width)? 
        (pos.x - obj.width - x) : pos.x + x) + 'px';
  }  
});

/*
  Class: NodeStyles
   
  Change node styles when clicking or hovering a node. This class is used internally.
  
  Used by:
  
  <ST>, <Sunburst>, <Hypertree>, <RGraph>, <TM>, <ForceDirected>, <Icicle>
  
  See also:
  
  <Options.NodeStyles>
*/
var NodeStyles = new Class({
  initialize: function(viz) {
    this.viz = viz;
    this.fx = viz.fx;
    this.nStyles = viz.config.NodeStyles;
    this.nodeStylesOnHover = this.nStyles.stylesHover;
    this.nodeStylesOnClick = this.nStyles.stylesClick;
    this.nodeStylesOnRightClick = this.nStyles.stylesRightClick;
  },
  
  getRestoredStyles: function(node, type) {
    var restoredStyles = {}, nStyles = this['nodeStylesOn' + type];
    for(var prop in nStyles) {
      restoredStyles[prop] = node.styles['$' + prop];
    }
    return restoredStyles;
  },
  
  toggleStylesOnHover: function(node, set) {
    if(this.nodeStylesOnHover) {
      this.toggleStylesOn('Hover', node, set);
    } else {
      this.nStyles.onHover(node, set);
    }
  },

  toggleStylesOnClick: function(node, set) {
    if(this.nodeStylesOnClick) {
      this.toggleStylesOn('Click', node, set);
    } else {
      this.nStyles.onClick(node, set);
    }
  },
  
  toggleStylesOnRightClick: function(node, set) {
    if(this.nodeStylesOnRightClick) {
      this.toggleStylesOn('RightClick', node, set);
    } else {
      this.nStyles.onRightClick(node, set);
    }
  },

  toggleStylesOn: function(type, node, set) {
    var viz = this.viz;
    var nStyles = this.nStyles;
    if(set) {
      var that = this;
      if(!node.styles) {
        node.styles = $.merge(node.data, {});
      }
      for(var s in this['nodeStylesOn' + type]) {
        var $s = '$' + s;
        if(!($s in node.styles)) {
            node.styles[$s] = node.getData(s); 
        }
      }
      viz.fx.nodeFx({
        'elements': {
          'id': node.id,
          'properties': that['nodeStylesOn' + type]
         },
         transition: Trans.Quart.easeOut,
         duration:300,
         fps:30,
         onComplete: function() {
           nStyles['on' + type](node, set);
         }
      });
    } else {
      var restoredStyles = this.getRestoredStyles(node, type);
      viz.fx.nodeFx({
        'elements': {
          'id': node.id,
          'properties': restoredStyles
         },
         transition: Trans.Quart.easeOut,
         duration:300,
         fps:30,
         onComplete: function() {
           nStyles['on' + type](node, set);
         }
      });
    }
  },

  attachOnHover: function(node, elem) {
    var that = this, viz = this.viz;
    var nStyles = viz.config.NodeStyles.stylesHover;
    $.addEvent(elem, 'mouseover', function() {
      if(!node.selected) {
        that.toggleStylesOnHover(node, true);
      }
    });
    
    $.addEvent(elem, 'mouseout', function() {
      !node.selected && that.toggleStylesOnHover(node, false);
    });
  },

  attachOnClick: function(node, elem) {
    var viz = this.viz, that = this;
    var nStyles = viz.config.NodeStyles.stylesClick;
    $.addEvent(elem, 'click', function() {
      that.onClick(node);
    });
  },
  
  onClick: function(node, opt) {
    if(!node) return;
    var nStyles = this.nodeStylesOnClick;
    if(!nStyles) {
      this.nStyles.onClick(node);
      return;
    }
    //if the node is selected then unselect it
    if(node.selected) {
      this.toggleStylesOnClick(node, false);
      delete node.selected;
    } else {
      //unselect all selected nodes...
      Graph.Util.eachNode(this.viz.graph, function(n) {
        if(n.selected) {
          for(var s in nStyles) {
            n.setData(s, n.styles['$' + s], 'end');
          }
          delete n.selected;
        }
      });
      //select clicked node
      this.toggleStylesOnClick(node, true);
      node.selected = true;
    }
  },
  
  onRightClick: function(node, opt) {
    if(!node) return;
    var nStyles = this.nodeStylesOnRightClick;
    if(!nStyles) {
      this.nStyles.onRightClick(node);
      return;
    }
    //if the node is selected then unselect it
    if(node.rightClickSelected) {
      this.toggleStylesOnRightClick(node, false);
      delete node.rightClickSelected;
    } else {
      //unselect all selected nodes...
      Graph.Util.eachNode(this.viz.graph, function(n) {
        if(n.rightClickSelected) {
          for(var s in nStyles) {
            n.setData(s, n.styles['$' + s], 'end');
          }
          delete n.rightClickSelected;
        }
      });
      //select clicked node
      this.toggleStylesOnRightClick(node, true);
      node.rightClickSelected = true;
    }
  },
  
  onMousemove: function(node, opt) {
    var GUtil = Graph.Util, that = this;
    var nStyles = this.nodeStylesOnHover;
    if(!nStyles) {
//      this.nStyles.onHover(node);
      return;
    }
    
    if(!node || node.selected) {
      GUtil.eachNode(this.viz.graph, function(n) {
        if(n.hovered && !n.selected) {
          that.toggleStylesOnHover(n, false);
          delete n.hovered;
        }
      });
      return;
    }
    //if the node is hovered then exit
    if(node.hovered) return;

    //check if an animation is running and exit
    //if it's a nodefx one.
    var anim = this.fx.animation;
    if(anim.timer) {
      if(anim.opt.type 
          && anim.opt.type == 'nodefx') {
        anim.stopTimer();
      } else {
        return;
      }
    }

    //unselect all hovered nodes...
    GUtil.eachNode(this.viz.graph, function(n) {
      if(n.hovered && !n.selected) {
        for(var s in nStyles) {
          n.setData(s, n.styles['$' + s], 'end');
        }
        delete n.hovered;
      }
    });
    //select hovered node
    this.toggleStylesOnHover(node, true);
    node.hovered = true;
  }
});

/*
 * File: Canvas.js
 *
 * A cross browser Canvas widget.
 *
 * Used By:
 *
 * <ST>, <Hypertree>, <RGraph>, <Icicle>, <Sunburst>, <ForceDirected>
 */
/*
 Class: Canvas
 
 	A multi-purpose Canvas Widget Class. This Class can be used with the ExCanvas library to provide
 cross browser Canvas based visualizations.
 
 Parameters:
 
 id - The canvas id. This id will be used as prefix for the canvas widget DOM elements ids.
 options - An object containing multiple options such as
 
 - _injectInto_ This property is _required_ and it specifies the id of the DOM element
 to which the Canvas widget will be appended. It can also be the actual DOM element container.
 - _width_ The width of the Canvas widget. Default's to 200px
 - _height_ The height of the Canvas widget. Default's to 200px
 - _styles_ A hash containing canvas specific style properties such as _fillStyle_ and _strokeStyle_ among others.
 
 Example:
 
 Suppose we have this HTML
 
 (start code xml)
 	<div id="infovis"></div>
 (end code)
 
 Now we create a new Canvas instance
 
 (start code js)
 	//Create a new canvas instance
 	var canvas = new Canvas('mycanvas', {
 		//Where to inject the canvas. Any div container will do.
 		'injectInto':'infovis',
		 //width and height for canvas. Default's to 200.
		 'width': 900,
		 'height':500,
		 //Canvas styles
		 'styles': {
		 'fillStyle': '#ccddee',
		 'strokeStyle': '#772277'
		 }
	 });
 (end code)

 The generated HTML will look like this
 
 (start code xml)
 <div id="infovis">
 	<div id="mycanvas" style="position:relative;">
 	<canvas id="mycanvas-canvas" width=900 height=500
 	style="position:absolute; top:0; left:0; width:900px; height:500px;" />
 	<div id="mycanvas-label"
 	style="overflow:visible; position:absolute; top:0; left:0; width:900px; height:0px">
 	</div>
 	</div>
 </div>
 (end code)
 
 As you can see, the generated HTML consists of a canvas DOM element of id _mycanvas-canvas_ and a div label container
 of id _mycanvas-label_, wrapped in a main div container of id _mycanvas_.
 You can also add a background canvas, for making background drawings.
 This is how the <RGraph> background concentric circles are drawn
 
 Example:
 
 (start code js)
 	//Create a new canvas instance.
 	var canvas = new Canvas('mycanvas', {
		//Where to inject the canvas. Any div container will do.
		'injectInto':'infovis',
		//width and height for canvas. Default's to 200.
		'width': 900,
		'height':500,
		//Canvas styles
		'styles': {
			'fillStyle': '#ccddee',
			'strokeStyle': '#772277'
		},
		//Add a background canvas for plotting
		//concentric circles.
		'backgroundCanvas': {
			//Add Canvas styles for the bck canvas.
			'styles': {
				'fillStyle': '#444',
				'strokeStyle': '#444'
			},
			//Add the initialization and plotting functions.
			'impl': {
				'init': function() {},
				'plot': function(canvas, ctx) {
					var times = 6, d = 100;
					var pi2 = Math.PI*2;
					for(var i=1; i<=times; i++) {
						ctx.beginPath();
						ctx.arc(0, 0, i * d, 0, pi2, true);
						ctx.stroke();
						ctx.closePath();
					}
				}
			}
		}
	});
 (end code)
 
 The _backgroundCanvas_ object contains a canvas _styles_ property and
 an _impl_ key to be used for implementing background canvas specific code.
 
 The _init_ method is only called once, at the instanciation of the background canvas.
 The _plot_ method is called for plotting a Canvas image.
 */
var Canvas = (function(){
    var config = {
        'injectInto': 'id',
        'width': false,
        'height': false,
        'useCanvas': false,
        'labels': 'HTML', //can also be 'SVG' or 'Native'
        'backgroundCanvas': false
    };
    
    function hasCanvas(){
        hasCanvas.t = hasCanvas.t || typeof(HTMLCanvasElement);
        return "function" == hasCanvas.t || "object" == hasCanvas.t;
    };
    
    function create(tag, prop, styles){
        var elem = document.createElement(tag);
        (function(obj, prop){
            if (prop) {
              for (var p in prop) {
                obj[p] = prop[p];
              }  
            }
            return arguments.callee;
        })(elem, prop)(elem.style, styles);
        //feature check
        if (tag == "canvas" && !hasCanvas() && G_vmlCanvasManager) {
            elem = G_vmlCanvasManager.initElement(document.body.appendChild(elem));
        }
        return elem;
    };

    function createLabelContainer(labels, idLabel, dim) {
      var NS = 'http://www.w3.org/2000/svg';

      if(labels == 'HTML' || labels == 'Native') {
        return create("div", {
            'id': idLabel
        }, {
            'overflow': 'visible',
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': dim.width + 'px',
            'height': 0
        });

      } else if(labels == 'SVG') {
        var svgContainer = document.createElementNS(NS, 'svg:svg');
        svgContainer.setAttribute("width", dim.width);
        svgContainer.setAttribute('height', dim.height);
        var style = svgContainer.style;
        style.position = 'absolute';
        style.left = style.top = '0px';
    
        var labelContainer = document.createElementNS(NS, 'svg:g');
        labelContainer.setAttribute('width', dim.width);
        labelContainer.setAttribute('height', dim.height);
        labelContainer.setAttribute('x', 0);
        labelContainer.setAttribute('y', 0);
        labelContainer.setAttribute('id', idLabel);

        svgContainer.appendChild(labelContainer);

        return svgContainer;
      }
    }; 
    
    function translateToCenter(canvas, ctx, w, h){
        var width = w ? (canvas.width - w) : canvas.width;
        var height = h ? (canvas.height - h) : canvas.height;
        ctx.translate(width / 2, height / 2);
    };
    
    return function(opt){
        var id = opt.injectInto, ctx, bkctx, mainContainer, labelContainer, canvas, bkcanvas;
        var idLabel = id + "-label", idCanvas = id + "-canvas", idBCanvas = id + "-bkcanvas";
        var wrapper = $(id);
        opt = $.merge(config, opt || {});
        //create elements
        var dim = {
            'width': opt.width || wrapper.offsetWidth || 200,
            'height': opt.height || wrapper.offsetHeight || 200
        };
        mainContainer = create("div", {
            'id': id + '-canvaswidget'
        }, $.merge(dim, {
            'position': 'relative'
        }));
        labelContainer =  createLabelContainer(opt.labels, idLabel, dim);       
        var dimPos = {
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': dim.width + 'px',
            'height': dim.height + 'px'
        };
        canvas = create("canvas", $.merge({
            'id': idCanvas
        }, dim), dimPos);
        var bc = opt.backgroundCanvas;
        if (bc) {
            bkcanvas = create("canvas", $.merge({
                'id': idBCanvas
            }, dim), dimPos);
            //append elements
            mainContainer.appendChild(bkcanvas);
        }
        mainContainer.appendChild(canvas);
        mainContainer.appendChild(labelContainer);
        wrapper.appendChild(mainContainer);
        
        //create contexts
        ctx = canvas.getContext('2d');
        translateToCenter(canvas, ctx);
        var st = opt.styles;
        var s;
        for (s in st) 
            ctx[s] = st[s];
        if (bc) {
            bkctx = bkcanvas.getContext('2d');
            st = bc.styles;
            for (s in st) {
              bkctx[s] = st[s];
            }
            translateToCenter(bkcanvas, bkctx);
            bc.impl.init(bkcanvas, bkctx);
            bc.impl.plot(bkcanvas, bkctx);
        }
        //create methods
        return {
            'id': id,
            
            'pos': null,
            /*
             Method: getCtx
             
             Returns the main canvas context object
             
             Returns:
             
             Main canvas context
             
             Example:
             
             (start code js)
             	var ctx = canvas.getCtx();
             	//Now I can use the native canvas context
             	//and for example change some canvas styles
             	ctx.globalAlpha = 1;
             (end code)
             */
            getCtx: function(){
                return ctx;
            },
            
            /*
             Method: getConfig
             
             Returns the current Configuration for this Canvas Widget.
             
             Returns:
             
             Canvas Widget Configuration
             
             Example:
             
             (start code js)
             	var config = canvas.getConfig();
             (end code)
             */
            getConfig: function(){
                return opt;
            },
            /*
             Method: getElement
             Returns the main Canvas DOM wrapper
             
             Returns:
             DOM canvas wrapper generated, (i.e the div wrapper element with id _mycanvas_)
             
             Example:
             (start code js)
             	var wrapper = canvas.getElement();
             	//Returns <div id="mycanvas" ... >...</div> as element
             (end code)
             */
            getElement: function(){
                return mainContainer;
            },
            
            /*
             Method: resize
             
             Resizes the canvas.
             
             Parameters:
             
             width - New canvas width.
             height - New canvas height.
             
             This method can be used with the <ST>, <Hypertree> or <RGraph> visualizations to resize
             the visualizations
             
             Example:
             
             (start code js)
             	function resizeViz(width, height) {
             		canvas.resize(width, height);
             		rgraph.refresh(); //ht.refresh or st.refresh() also work.
             		rgraph.onAfterCompute();
             	}
             (end code)
             
             */
            resize: function(width, height){
                var pwidth = canvas.width, pheight = canvas.height;
            	canvas.width = width;
                canvas.height = height;
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
                if (bc) {
                    bkcanvas.width = width;
                    bkcanvas.height = height;
                    bkcanvas.style.width = width + "px";
                    bkcanvas.style.height = height + "px";
                }
                //small ExCanvas fix
                if(!hasCanvas()) {
                	translateToCenter(canvas, ctx, pwidth, pheight);
                } else {
                	translateToCenter(canvas, ctx);
                }
                
                var st = opt.styles;
                var s;
                for (s in st) {
                  ctx[s] = st[s];
                }
                if (bc) {
                    st = bc.styles;
                    for (s in st) 
                        bkctx[s] = st[s];
                    //same ExCanvas fix here
                    if(!hasCanvas()) {
                    	translateToCenter(bkcanvas, bkctx, pwidth, pheight);
                    } else {
                    	translateToCenter(bkcanvas, bkctx);	
                    }
                    
                    bc.impl.init(bkcanvas, bkctx);
                    bc.impl.plot(bkcanvas, bkctx);
                }
            },
            
            /*
             Method: getSize
             
             Returns canvas dimensions.
             
             Returns:
             
             An object with _width_ and _height_ properties.
             Example:
             (start code js)
             canvas.getSize(); //returns { width: 900, height: 500 }
             (end code)
             */
            getSize: function(){
                return {
                    'width': canvas.width,
                    'height': canvas.height
                };
            },
            
            /*
            Method: getPos
            
            Returns canvas position vector.
            
            Returns:
            
            An object with _x_ and _y_ properties.
            Example:
            (start code js)
            canvas.getPos(); //returns { x: 900, y: 500 }
            (end code)
            */
           getPos: function(force){
              if(force || !this.pos) {
                return this.pos = $.getPos(this.getElement());
              }
              return this.pos;
           },

           path: function(type, action){
                ctx.beginPath();
                action(ctx);
                ctx[type]();
                ctx.closePath();
            },
            
            /*
             Method: clear
             
             Clears the canvas object.
             */
            clear: function(){
                var size = this.getSize();
                ctx.clearRect(-size.width / 2, -size.height / 2, size.width, size.height);
            }
        };
    };
    
})();



/*
 * File: Polar.js
 * 
 * Defines the <Polar> class.
 *
 * Description:
 *
 * The <Polar> class, just like the <Complex> class, is used by the <Hypertree>, <ST> and <RGraph> as a 2D point representation.
 *
 * See also:
 *
 * <http://en.wikipedia.org/wiki/Polar_coordinates>
 *
*/

/*
   Class: Polar

   A multi purpose polar representation.

   Description:
 
   The <Polar> class, just like the <Complex> class, is used by the <Hypertree>, <ST> and <RGraph> as a 2D point representation.
 
   See also:
 
   <http://en.wikipedia.org/wiki/Polar_coordinates>
 
   Parameters:

      theta - An angle.
      rho - The norm.
*/

var Polar = function(theta, rho) {
  this.theta = theta;
  this.rho = rho;
};

$jit.Polar = Polar;

Polar.prototype = {
    /*
       Method: getc
    
       Returns a complex number.
    
       Parameters:

       simple - _optional_ If *true*, this method will return only an object holding x and y properties and not a <Complex> instance. Default's *false*.

      Returns:
    
          A complex number.
    */
    getc: function(simple) {
        return this.toComplex(simple);
    },

    /*
       Method: getp
    
       Returns a <Polar> representation.
    
       Returns:
    
          A variable in polar coordinates.
    */
    getp: function() {
        return this;
    },


    /*
       Method: set
    
       Sets a number.

       Parameters:

       v - A <Complex> or <Polar> instance.
    
    */
    set: function(v) {
        v = v.getp();
        this.theta = v.theta; this.rho = v.rho;
    },

    /*
       Method: setc
    
       Sets a <Complex> number.

       Parameters:

       x - A <Complex> number real part.
       y - A <Complex> number imaginary part.
    
    */
    setc: function(x, y) {
        this.rho = Math.sqrt(x * x + y * y);
        this.theta = Math.atan2(y, x);
        if(this.theta < 0) this.theta += Math.PI * 2;
    },

    /*
       Method: setp
    
       Sets a polar number.

       Parameters:

       theta - A <Polar> number angle property.
       rho - A <Polar> number rho property.
    
    */
    setp: function(theta, rho) {
        this.theta = theta; 
        this.rho = rho;
    },

    /*
       Method: clone
    
       Returns a copy of the current object.
    
       Returns:
    
          A copy of the real object.
    */
    clone: function() {
        return new Polar(this.theta, this.rho);
    },

    /*
       Method: toComplex
    
        Translates from polar to cartesian coordinates and returns a new <Complex> instance.
    
        Parameters:

        simple - _optional_ If *true* this method will only return an object with x and y properties (and not the whole <Complex> instance). Default's *false*.
 
        Returns:
    
          A new <Complex> instance.
    */
    toComplex: function(simple) {
        var x = Math.cos(this.theta) * this.rho;
        var y = Math.sin(this.theta) * this.rho;
        if(simple) return { 'x': x, 'y': y};
        return new Complex(x, y);
    },

    /*
       Method: add
    
        Adds two <Polar> instances.
    
       Parameters:

       polar - A <Polar> number.

       Returns:
    
          A new Polar instance.
    */
    add: function(polar) {
        return new Polar(this.theta + polar.theta, this.rho + polar.rho);
    },
    
    /*
       Method: scale
    
        Scales a polar norm.
    
        Parameters:

        number - A scale factor.
        
        Returns:
    
          A new Polar instance.
    */
    scale: function(number) {
        return new Polar(this.theta, this.rho * number);
    },
    
    /*
       Method: equals
    
       Comparison method.

       Returns *true* if the theta and rho properties are equal.

       Parameters:

       c - A <Polar> number.

       Returns:

       *true* if the theta and rho parameters for these objects are equal. *false* otherwise.
    */
    equals: function(c) {
        return this.theta == c.theta && this.rho == c.rho;
    },
    
    /*
       Method: $add
    
        Adds two <Polar> instances affecting the current object.
    
       Paramters:

       polar - A <Polar> instance.

       Returns:
    
          The changed object.
    */
    $add: function(polar) {
        this.theta = this.theta + polar.theta; this.rho += polar.rho;
        return this;
    },

    /*
       Method: $madd
    
        Adds two <Polar> instances affecting the current object. The resulting theta angle is modulo 2pi.
    
       Parameters:

       polar - A <Polar> instance.

       Returns:
    
          The changed object.
    */
    $madd: function(polar) {
        this.theta = (this.theta + polar.theta) % (Math.PI * 2); this.rho += polar.rho;
        return this;
    },

    
    /*
       Method: $scale
    
        Scales a polar instance affecting the object.
    
      Parameters:

      number - A scaling factor.

      Returns:
    
          The changed object.
    */
    $scale: function(number) {
        this.rho *= number;
        return this;
    },
    
    /*
       Method: interpolate
    
        Calculates a polar interpolation between two points at a given delta moment.

        Parameters:
      
        elem - A <Polar> instance.
        delta - A delta factor ranging [0, 1].
    
       Returns:
    
          A new <Polar> instance representing an interpolation between _this_ and _elem_
    */
    interpolate: function(elem, delta) {
        var pi = Math.PI, pi2 = pi * 2;
        var ch = function(t) {
            return (t < 0)? (t % pi2) + pi2 : t % pi2;
        };
        var tt = this.theta, et = elem.theta;
        var sum;
        if(Math.abs(tt - et) > pi) {
            if(tt > et) {
                sum =ch((et + ((tt - pi2) - et) * delta)) ;
            } else {
                sum =ch((et - pi2 + (tt - (et - pi2)) * delta));
            }
        } else {
            sum =ch((et + (tt - et) * delta)) ;
        }
        var r = (this.rho - elem.rho) * delta + elem.rho;
        return {
            'theta': sum,
            'rho': r
        };
    }
};


var $P = function(a, b) { return new Polar(a, b); };

Polar.KER = $P(0, 0);



/*
 * File: Complex.js
 * 
 * Defines the <Complex> class.
 *
 * Description:
 *
 * The <Complex> class, just like the <Polar> class, is used by the <Hypertree>, <ST> and <RGraph> as a 2D point representation.
 *
 * See also:
 *
 * <http://en.wikipedia.org/wiki/Complex_number>
 *
*/

/*
   Class: Complex
    
   A multi-purpose Complex Class with common methods.
 
   Description:
 
   The <Complex> class, just like the <Polar> class, is used by the <Hypertree>, <ST> and <RGraph> as a 2D point representation.
 
   See also:
 
   <http://en.wikipedia.org/wiki/Complex_number>

   Parameters:

   x - _optional_ A Complex number real part.
   y - _optional_ A Complex number imaginary part.
 
*/

var Complex = function(x, y) {
  this.x = x;
  this.y = y;
};

$jit.Complex = Complex;

Complex.prototype = {
    /*
       Method: getc
    
       Returns a complex number.
    
       Returns:
    
          A complex number.
    */
    getc: function() {
        return this;
    },

    /*
       Method: getp
    
       Returns a <Polar> representation of this number.
    
       Parameters:

       simple - _optional_ If *true*, this method will return only an object holding theta and rho properties and not a <Polar> instance. Default's *false*.

       Returns:
    
          A variable in <Polar> coordinates.
    */
    getp: function(simple) {
        return this.toPolar(simple);
    },


    /*
       Method: set
    
       Sets a number.

       Parameters:

       c - A <Complex> or <Polar> instance.
    
    */
    set: function(c) {
      c = c.getc(true);
      this.x = c.x; 
      this.y = c.y;
    },

    /*
       Method: setc
    
       Sets a complex number.

       Parameters:

       x - A <Complex> number Real part.
       y - A <Complex> number Imaginary part.
    
    */
    setc: function(x, y) {
        this.x = x; 
        this.y = y;
    },

    /*
       Method: setp
    
       Sets a polar number.

       Parameters:

       theta - A <Polar> number theta property.
       rho - A <Polar> number rho property.
    
    */
    setp: function(theta, rho) {
        this.x = Math.cos(theta) * rho;
        this.y = Math.sin(theta) * rho;
    },

    /*
       Method: clone
    
       Returns a copy of the current object.
    
       Returns:
    
          A copy of the real object.
    */
    clone: function() {
        return new Complex(this.x, this.y);
    },

    /*
       Method: toPolar
    
       Transforms cartesian to polar coordinates.
    
       Parameters:

       simple - _optional_ If *true* this method will only return an object with theta and rho properties (and not the whole <Polar> instance). Default's *false*.
       
       Returns:
    
          A new <Polar> instance.
    */
    
    toPolar: function(simple) {
        var rho = this.norm();
        var atan = Math.atan2(this.y, this.x);
        if(atan < 0) atan += Math.PI * 2;
        if(simple) return { 'theta': atan, 'rho': rho };
        return new Polar(atan, rho);
    },
    /*
       Method: norm
    
       Calculates a <Complex> number norm.
    
       Returns:
    
          A real number representing the complex norm.
    */
    norm: function () {
        return Math.sqrt(this.squaredNorm());
    },
    
    /*
       Method: squaredNorm
    
       Calculates a <Complex> number squared norm.
    
       Returns:
    
          A real number representing the complex squared norm.
    */
    squaredNorm: function () {
        return this.x*this.x + this.y*this.y;
    },

    /*
       Method: add
    
       Returns the result of adding two complex numbers.
       
       Does not alter the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of adding two complex numbers.
    */
    add: function(pos) {
        return new Complex(this.x + pos.x, this.y + pos.y);
    },

    /*
       Method: prod
    
       Returns the result of multiplying two <Complex> numbers.
       
       Does not alter the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of multiplying two complex numbers.
    */
    prod: function(pos) {
        return new Complex(this.x*pos.x - this.y*pos.y, this.y*pos.x + this.x*pos.y);
    },

    /*
       Method: conjugate
    
       Returns the conjugate of this <Complex> number.

       Does not alter the original object.

       Returns:
    
         The conjugate of this <Complex> number.
    */
    conjugate: function() {
        return new Complex(this.x, -this.y);
    },


    /*
       Method: scale
    
       Returns the result of scaling a <Complex> instance.
       
       Does not alter the original object.

       Parameters:
    
          factor - A scale factor.
    
       Returns:
    
         The result of scaling this complex to a factor.
    */
    scale: function(factor) {
        return new Complex(this.x * factor, this.y * factor);
    },

    /*
       Method: equals
    
       Comparison method.

       Returns *true* if both real and imaginary parts are equal.

       Parameters:

       c - A <Complex> instance.

       Returns:

       A boolean instance indicating if both <Complex> numbers are equal.
    */
    equals: function(c) {
        return this.x == c.x && this.y == c.y;
    },

    /*
       Method: $add
    
       Returns the result of adding two <Complex> numbers.
       
       Alters the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of adding two complex numbers.
    */
    $add: function(pos) {
        this.x += pos.x; this.y += pos.y;
        return this;    
    },
    
    /*
       Method: $prod
    
       Returns the result of multiplying two <Complex> numbers.
       
       Alters the original object.

       Parameters:
    
          pos - A <Complex> instance.
    
       Returns:
    
         The result of multiplying two complex numbers.
    */
    $prod:function(pos) {
        var x = this.x, y = this.y;
        this.x = x*pos.x - y*pos.y;
        this.y = y*pos.x + x*pos.y;
        return this;
    },
    
    /*
       Method: $conjugate
    
       Returns the conjugate for this <Complex>.
       
       Alters the original object.

       Returns:
    
         The conjugate for this complex.
    */
    $conjugate: function() {
        this.y = -this.y;
        return this;
    },
    
    /*
       Method: $scale
    
       Returns the result of scaling a <Complex> instance.
       
       Alters the original object.

       Parameters:
    
          factor - A scale factor.
    
       Returns:
    
         The result of scaling this complex to a factor.
    */
    $scale: function(factor) {
        this.x *= factor; this.y *= factor;
        return this;
    },
    
    /*
       Method: $div
    
       Returns the division of two <Complex> numbers.
       
       Alters the original object.

       Parameters:
    
          pos - A <Complex> number.
    
       Returns:
    
         The result of scaling this complex to a factor.
    */
    $div: function(pos) {
        var x = this.x, y = this.y;
        var sq = pos.squaredNorm();
        this.x = x * pos.x + y * pos.y; this.y = y * pos.x - x * pos.y;
        return this.$scale(1 / sq);
    }
};

var $C = function(a, b) { return new Complex(a, b); };

Complex.KER = $C(0, 0);



/*
 * File: Graph.js
 *
 * Generic <Graph>, <Graph.Node> and <Graph.Adjacence> classes.
 *
 * Used by:
 *
 * <Hypertree>, <RGraph> and <ST>.
 *
*/

/*
 Class: Graph

 A generic Graph class.

 Description:

 When a json graph/tree structure is loaded by <Loader.loadJSON>, an internal <Graph> representation is created. 

 In most cases you'll be dealing with an already created <Graph> structure, so methods like <Graph.addNode> or <Graph.addAdjacence> won't 
 be of many use. However methods like <Graph.getNode> and <Graph.hasNode> are pretty useful.

 <Graph.Util> provides also iterators for <Graphs> and advanced and useful graph operations and methods.

 Used by:

 <Loader.loadJSON>, <Hypertree>, <RGraph> and <ST>.

 Access:

 An instance of this class can be accessed by using the _graph_ parameter of a <Hypertree>, <RGraph> or <ST> instance

 Example:

 (start code js)
   var st = new ST(canvas, config);
   st.graph.getNode //or any other <Graph> method.
   
   var ht = new Hypertree(canvas, config);
   ht.graph.getNode //or any other <Graph> method.
   
   var rg = new RGraph(canvas, config);
   rg.graph.getNode //or any other <Graph> method.
 (end code)
 
*/  

$jit.Graph = new Class({

 initialize: function(opt, Node, Edge) {
    var innerOptions = {
    'complex': false,
    'Node': {}
    };
    this.Node = Node;
    this.Edge = Edge;
    this.opt = $.merge(innerOptions, opt || {});
    this.nodes= {};
 },

/*
     Method: getNode
    
     Returns a <Graph.Node> by _id_.

     Parameters:

     id - A <Graph.Node> id.

     Returns:

     A <Graph.Node> having _id_ as id. Returns *false* otherwise.

     Example:

     (start code js)
       var node = graph.getNode('someid');
     (end code)
*/  
 getNode: function(id) {
    if(this.hasNode(id)) return this.nodes[id];
    return false;
 },

/*
     Method: getAdjacence
    
     Returns an array of <Graph.Adjacence> objects connecting nodes with ids _id_ and _id2_.

     Parameters:

     id - A <Graph.Node> id.
     id2 - A <Graph.Node> id.

     Returns:

     An Array of <Graph.Adjacence> objects. Returns *false* if there's not a <Graph.Adjacence> connecting those two nodes.
*/  
  getAdjacence: function (id, id2) {
    var adjs = [];
    if(this.hasNode(id) && this.hasNode(id2) 
    && this.nodes[id].adjacentTo({ 'id':id2 }) 
    && this.nodes[id2].adjacentTo({ 'id':id })) {
        adjs.push(this.nodes[id].getAdjacency(id2));
        adjs.push(this.nodes[id2].getAdjacency(id));
        return adjs;
    }
    return false;   
 },

    /*
     Method: addNode
    
     Adds a node.
     
     Parameters:
    
        obj - An object containing as properties

        - _id_ node's id
        - _name_ node's name
        - _data_ node's data hash

    See also:
    <Graph.Node>

  */  
  addNode: function(obj) {
    if(!this.nodes[obj.id]) {  
      this.nodes[obj.id] = new Graph.Node($.extend({
        'id': obj.id,
        'name': obj.name,
        'data': obj.data
      }, this.opt.Node), 
      this.opt.complex, 
      this.Node, 
      this.Edge);
    }
    return this.nodes[obj.id];
  },
  
    /*
     Method: addAdjacence
    
     Connects nodes specified by _obj_ and _obj2_. If not found, nodes are created.
     
     Parameters:
    
        obj - a <Graph.Node> object.
        obj2 - Another <Graph.Node> object.
        data - A DataSet object. Used to store some extra information in the <Graph.Adjacence> object created.

    See also:

    <Graph.Node>, <Graph.Adjacence>
    */  
  addAdjacence: function (obj, obj2, data) {
    var adjs = [];
    if(!this.hasNode(obj.id)) { this.addNode(obj); }
    if(!this.hasNode(obj2.id)) { this.addNode(obj2); }
    obj = this.nodes[obj.id]; obj2 = this.nodes[obj2.id];
    
    for(var i in this.nodes) {
        if(this.nodes[i].id == obj.id) {
            if(!this.nodes[i].adjacentTo(obj2)) {
                adjs.push(this.nodes[i].addAdjacency(obj2, data));
            }
        }
        
        if(this.nodes[i].id == obj2.id) {   
            if(!this.nodes[i].adjacentTo(obj)) {
                adjs.push(this.nodes[i].addAdjacency(obj, data));
            }
        }
    }
    return adjs;
 },

    /*
     Method: removeNode
    
     Removes a <Graph.Node> matching the specified _id_.

     Parameters:

     id - A node's id.

    */  
  removeNode: function(id) {
    if(this.hasNode(id)) {
        var node = this.nodes[id];
        for(var i=0 in node.adjacencies) {
            var adj = node.adjacencies[i];
            this.removeAdjacence(id, adj.nodeTo.id);
        }
        delete this.nodes[id];
    }
  },
  
/*
     Method: removeAdjacence
    
     Removes a <Graph.Adjacence> matching _id1_ and _id2_.

     Parameters:

     id1 - A <Graph.Node> id.
     id2 - A <Graph.Node> id.
*/  
  removeAdjacence: function(id1, id2) {
    if(this.hasNode(id1)) this.nodes[id1].removeAdjacency(id2);
    if(this.hasNode(id2)) this.nodes[id2].removeAdjacency(id1);
  },

   /*
     Method: hasNode
    
     Returns a Boolean instance indicating if the node belongs to the <Graph> or not.
     
     Parameters:
    
        id - Node id.

     Returns:
      
     A Boolean instance indicating if the node belongs to the graph or not.
   */  
  hasNode: function(id) {
    return id in this.nodes;
  },
  
  /*
    Method: empty

    Empties the Graph

  */
  empty: function() { this.nodes = {}; }

});

var Graph = $jit.Graph;

/*
     Class: Graph.Node

     A <Graph> node.

     Parameters:

     obj - An object containing an 'id', 'name' and 'data' properties as described in <Graph.addNode>.
     complex - Whether node position properties should contain <Complex> or <Polar> instances.

     See also:

     <Graph>

     Description:

     An instance of <Graph.Node> is usually passed as parameter for most configuration/controller methods in the 
     <Hypertree>, <RGraph> and <ST> classes.

     A <Graph.Node> object has as properties

      id - Node id.
      name - Node name.
      data - Node data property containing a hash (i.e {}) with custom options. For more information see <Loader.loadJSON>.
      selected - Whether the node is selected or not. Used by <ST> for selecting nodes that are between the root node and the selected node.
      angleSpan - For radial layouts such as the ones performed by the <Hypertree> and the <RGraph>. Contains _begin_ and _end_ properties containing angle values describing the angle span for this subtree.
      pos - Current position. Can be a <Complex> or <Polar> instance.
      startPos - Starting position. Used for interpolation.
      endPos - Ending position. Used for interpolation.
*/
Graph.Node = new Class({
    
    initialize: function(opt, complex, Node, Edge) {
    var innerOptions = {
      'id': '',
      'name': '',
      'data': {},
      'startData': {},
      'endData': {},
      'adjacencies': {},

      'selected': false,
      'drawn': false,
      'exist': false,

      'angleSpan': {
        'begin': 0,
        'end' : 0
      },

      'pos': (complex && $C(0, 0)) || $P(0, 0),
      'startPos': (complex && $C(0, 0)) || $P(0, 0),
      'endPos': (complex && $C(0, 0)) || $P(0, 0)
    };
    
    $.extend(this, $.extend(innerOptions, opt));
    this.Node = Node;
    this.Edge = Edge;
},

    /*
       Method: adjacentTo
    
       Indicates if the node is adjacent to the node specified by id

       Parameters:
    
          id - A node id.
    
       Returns:
    
         A Boolean instance indicating whether this node is adjacent to the specified by id or not.

       Example:
       (start code js)
        node.adjacentTo('mynodeid');
       (end code)
    */
    adjacentTo: function(node) {
        return node.id in this.adjacencies;
    },

    /*
       Method: getAdjacency
    
       Returns a <Graph.Adjacence> object connecting the current <Graph.Node> and the node having _id_ as id.

       Parameters:
    
          id - A node id.

       Returns:

          A <Graph.Adjacence> object or undefined.
    */  
    getAdjacency: function(id) {
        return this.adjacencies[id];
    },
    /*
       Method: addAdjacency
    
       Connects the current node and the given node.

       Parameters:
    
          node - A <Graph.Node>.
          data - Some custom hash information.
    */  
    addAdjacency: function(node, data) {
        var adj = new Graph.Adjacence(this, node, data, this.Edge);
        return this.adjacencies[node.id] = adj;
    },
    
    /*
       Method: removeAdjacency
    
       Removes a <Graph.Adjacence> by _id_.

       Parameters:
    
          id - A node id.
    */  
    removeAdjacency: function(id) {
        delete this.adjacencies[id];
    },

    /*
      Method: getPos
   
      Returns the position of the node. Possible values are <Complex> or <Polar> instances.
  
      Parameters:
   
         type - Possible values are "start", "end" or "current". Default's "current".
   
      Returns:
   
        A <Complex> or <Polar> instance.
  
      Example:
      (start code js)
       node.getPos('end');
      (end code)
   */
   getPos: function(type) {
       type = type || "current";
       if(type == "current") {
         return this.pos;
       } else if(type == "end") {
         return this.endPos;
       } else if(type == "start") {
         return this.startPos;
       }
   },
   /*
     Method: setPos
  
     Sets the node's position.
  
     Parameters:
  
        value - A <Complex> or <Polar> instance.
        type - Possible values are "start", "end" or "current". Default's "current".
  
     Example:
     (start code js)
      node.setPos(new Complex(0, 0), 'end');
     (end code)
  */
  setPos: function(value, type) {
      type = type || "current";
      var pos;
      if(type == "current") {
        pos = this.pos;
      } else if(type == "end") {
        pos = this.endPos;
      } else if(type == "start") {
        pos = this.startPos;
      }
      pos.set(value);
  },
    /*
    Method: getData
 
    Returns the specified data value property. This is useful for querying special/reserved 
    <Graph.Node> data properties (i.e dollar prefixed properties).

    Parameters:
 
       prop - The name of the property. The dollar sign is not necessary. For example _getData('width')_ will query 
       _data.$width_
       type - The type of the data property queried. Default's "current".
       force - Whether to obtain the true value of the property (equivalent to _data.$prop_) or to check for _node.overridable=true_ first. 
       For more information about _node.overridable_ please check the <Options.Node> and <Options.Edge> sections.
 
    Returns:
 
      The value of the dollar prefixed property or the global Node property value if _overridable=false_

    Example:
    (start code js)
     node.getData('width'); //will return node.data.$width if Node.overridable=true;
    (end code)
     */
   getData: function(prop, type, force) {
      type = type || 'current';
      var data;
      if(type == 'current') {
        data = this.data;
      } else if(type == 'start') {
        data = this.startData;
      } else if(type == 'end') {
        data = this.endData;
      }
      if(force) {
        return data['$' + prop];
      }
      var n = this.Node, dollar = '$' + prop;
      if(!n.overridable) return n[prop] || 0;
      return (dollar in data)? data[dollar] : ((dollar in this.data)? this.data[dollar] : (n[prop] || 0));
   },
    
    /*
    Method: setData
 
    Sets the current data property with some specific value. 
    This method is only useful for (dollar prefixed) reserved properties.
    
    Parameters:
 
       prop - The name of the property. The dollar sign is not necessary. For example _setData('width')_ will set 
       _data.$width_.
       value - The value to store.
       type - The type of the data property to store. Default's "current" but can also be "begin" or "end".
 
    Example:
    (start code js)
     node.setData('width', 30);
    (end code)
     */
   setData: function(prop, value, type) {
      type = type || 'current';
      var data;
      if(type == 'current') {
        data = this.data;
      } else if(type == 'start') {
        data = this.startData;
      } else if(type == 'end') {
        data = this.endData;
      }
      data['$' + prop] = value;
   }
});

/*
     Class: Graph.Adjacence

     A <Graph> adjacence (or edge). Connects two <Graph.Nodes>.

     Parameters:

     nodeFrom - A <Graph.Node>.
     nodeTo - A <Graph.Node>.
     data - Some custom hash data.

     See also:

     <Graph>

     Description:

     An instance of <Graph.Adjacence> is usually passed as parameter for some configuration/controller methods in the 
     <Hypertree>, <RGraph> and <ST> classes.

     A <Graph.Adjacence> object has as properties

      nodeFrom - A <Graph.Node> connected by this edge.
      nodeTo - Another  <Graph.Node> connected by this edge.
      data - Node data property containing a hash (i.e {}) with custom options. For more information see <Loader.loadJSON>.
*/
Graph.Adjacence = new Class({
  
  initialize: function(nodeFrom, nodeTo, data, edge) {
    this.nodeFrom = nodeFrom;
    this.nodeTo = nodeTo;
    this.data = data || {};
    this.startData = {};
    this.endData = {};
    this.Edge = edge;
  },
  
  /*
  Method: getData

  Returns the specified data value property. This is useful for querying special/reserved 
  <Graph.Adjacence> data properties (i.e dollar prefixed properties).

  Parameters:

     prop - The name of the property. The dollar sign is not necessary. For example _getData('width')_ will query 
     _data.$width_
     type - The type of the queried data property. Default's "current".
     force - Whether to obtain the true value of the property (equivalent to _data.$prop_) or to check for _node.overridable=true_ first. 
     For more information about _node.overridable_ please check the <Options.Node> and <Options.Edge> sections.

  Returns:

    The value of the dollar prefixed property or the global Node property value if _overridable=false_

  Example:
  (start code js)
   adj.getData('lineWidth'); //will return adj.data.$lineWidth if Node.overridable=true;
  (end code)
   */
 getData: function(prop, type, force) {
    type = type || 'current';
    var data;
    if(type == 'current') {
      data = this.data;
    } else if(type == 'start') {
      data = this.startData;
    } else if(type == 'end') {
      data = this.endData;
    }
    if(force) {
      return data['$' + prop];
    }
    var n = this.Edge, dollar = '$' + prop;
    if(!n.overridable) return n[prop];
    return (dollar in data)? data[dollar] : ((dollar in this.data)? this.data[dollar] : n[prop]);
 },
 /*
   Method: setData
  
   Sets the current data property with some specific value. 
   This method is only useful for (dollar prefixed) reserved properties.
   
   Parameters:
  
      prop - The name of the property. The dollar sign is not necessary. For example _setData('width', value)_ will set 
      _data.$width_ with _value_.
      value - The value to store.
      type - The type of the data property to store. Default's "current" but can also be "begin" or "end".
  
   Example:
   (start code js)
    adj.setData('lineWidth', 30);
   (end code)
    */
   setData: function(prop, value, type) {
     type = type || 'current';
     var data;
     if(type == 'current') {
       data = this.data;
     } else if(type == 'start') {
       data = this.startData;
     } else if(type == 'end') {
       data = this.endData;
     }
     data['$' + prop] = value;
  }  
});

/*
   Object: Graph.Util

   <Graph> traversal and processing utility object.
*/
Graph.Util = {
    /*
       filter
    
       For internal use only. Provides a filtering function based on flags.
    */
    filter: function(param) {
        if(!param || !($.type(param) == 'string')) return function() { return true; };
        var props = param.split(" ");
        return function(elem) {
            for(var i=0; i<props.length; i++) { 
              if(elem[props[i]]) { 
                return false; 
              }
            }
            return true;
        };
    },
    /*
       Method: getNode
    
       Returns a <Graph.Node> by _id_.

       Parameters:

       graph - A <Graph> instance.
       id - A <Graph.Node> id.

       Returns:

       A <Graph> node.

       Example:

       (start code js)
         Graph.Util.getNode(graph, 'nodeid');
       (end code)
    */
    getNode: function(graph, id) {
        return graph.getNode(id);
    },
    
    /*
       Method: eachNode
    
       Iterates over <Graph> nodes performing an _action_.

       Parameters:

       graph - A <Graph> instance.
       action - A callback function having a <Graph.Node> as first formal parameter.

       Example:
       (start code js)
         Graph.Util.each(graph, function(node) {
          alert(node.name);
         });
       (end code)
    */
    eachNode: function(graph, action, flags) {
        var filter = this.filter(flags);
        for(var i in graph.nodes) {
          if(filter(graph.nodes[i])) action(graph.nodes[i]);
        } 
    },
    
    /*
       Method: eachAdjacency
    
       Iterates over <Graph.Node> adjacencies applying the _action_ function.

       Parameters:

       node - A <Graph.Node>.
       action - A callback function having <Graph.Adjacence> as first formal parameter.

       Example:
       (start code js)
         Graph.Util.eachAdjacency(node, function(adj) {
          alert(adj.nodeTo.name);
         });
       (end code)
    */
    eachAdjacency: function(node, action, flags) {
        var adj = node.adjacencies, filter = this.filter(flags);
        for(var id in adj) {
          if(filter(adj[id])) {
            action(adj[id], id);
          }
        }
    },

     /*
       Method: computeLevels
    
       Performs a BFS traversal setting the correct depth for each node.

       The depth of each node can then be accessed by 
       >node._depth

       Parameters:

       graph - A <Graph>.
       id - A starting node id for the BFS traversal.
       startDepth - _optional_ A minimum depth value. Default's 0.

    */
    computeLevels: function(graph, id, startDepth, flags) {
        startDepth = startDepth || 0;
        var filter = this.filter(flags);
        this.eachNode(graph, function(elem) {
            elem._flag = false;
            elem._depth = -1;
        }, flags);
        var root = graph.getNode(id);
        root._depth = startDepth;
        var queue = [root];
        while(queue.length != 0) {
            var node = queue.pop();
            node._flag = true;
            this.eachAdjacency(node, function(adj) {
                var n = adj.nodeTo;
                if(n._flag == false && filter(n)) {
                    if(n._depth < 0) n._depth = node._depth + 1 + startDepth;
                    queue.unshift(n);
                }
            }, flags);
        }
    },

    /*
       Method: eachBFS
    
       Performs a BFS traversal applying _action_ to each <Graph.Node>.

       Parameters:

       graph - A <Graph>.
       id - A starting node id for the BFS traversal.
       action - A callback function having a <Graph.Node> as first formal parameter.

       Example:
       (start code js)
         Graph.Util.eachBFS(graph, 'mynodeid', function(node) {
          alert(node.name);
         });
       (end code)
    */
    eachBFS: function(graph, id, action, flags) {
        var filter = this.filter(flags);
        this.clean(graph);
        var queue = [graph.getNode(id)];
        while(queue.length != 0) {
            var node = queue.pop();
            node._flag = true;
            action(node, node._depth);
            this.eachAdjacency(node, function(adj) {
                var n = adj.nodeTo;
                if(n._flag == false && filter(n)) {
                    n._flag = true;
                    queue.unshift(n);
                }
            }, flags);
        }
    },
    
    /*
       Method: eachLevel
    
       Iterates over a node's subgraph applying _action_ to the nodes of relative depth between _levelBegin_ and _levelEnd_.

       Parameters:
       
       node - A <Graph.Node>.
       levelBegin - A relative level value.
       levelEnd - A relative level value.
       action - A callback function having a <Graph.Node> as first formal parameter.

    */
    eachLevel: function(node, levelBegin, levelEnd, action, flags) {
        var d = node._depth, filter = this.filter(flags), that = this;
        levelEnd = levelEnd === false? Number.MAX_VALUE -d : levelEnd;
        (function loopLevel(node, levelBegin, levelEnd) {
            var d = node._depth;
            if(d >= levelBegin && d <= levelEnd && filter(node)) action(node, d);
            if(d < levelEnd) {
                that.eachAdjacency(node, function(adj) {
                    var n = adj.nodeTo;
                    if(n._depth > d) loopLevel(n, levelBegin, levelEnd);
                });
            }
        })(node, levelBegin + d, levelEnd + d);      
    },

    /*
       Method: eachSubgraph
    
       Iterates over a node's children recursively.

       Parameters:
       node - A <Graph.Node>.
       action - A callback function having a <Graph.Node> as first formal parameter.

       Example:
       (start code js)
         Graph.Util.eachSubgraph(node, function(node) {
          alert(node.name);
         });
       (end code)
    */
    eachSubgraph: function(node, action, flags) {
      this.eachLevel(node, 0, false, action, flags);
    },

    /*
       Method: eachSubnode
    
       Iterates over a node's children (without deeper recursion).
       
       Parameters:
       node - A <Graph.Node>.
       action - A callback function having a <Graph.Node> as first formal parameter.

       Example:
       (start code js)
         Graph.Util.eachSubnode(node, function(node) {
          alert(node.name);
         });
       (end code)
    */
    eachSubnode: function(node, action, flags) {
        this.eachLevel(node, 1, 1, action, flags);
    },

    /*
       Method: anySubnode
    
       Returns *true* if any subnode matches the given condition.

       Parameters:
       node - A <Graph.Node>.
       cond - A callback function returning a Boolean instance. This function has as first formal parameter a <Graph.Node>.

       Returns:
       A boolean value.

       Example:
       (start code js)
         Graph.Util.anySubnode(node, function(node) { return node.name == "mynodename"; });
       (end code)
    */
    anySubnode: function(node, cond, flags) {
      var flag = false;
      cond = cond || $.lambda(true);
      var c = $.type(cond) == 'string'? function(n) { return n[cond]; } : cond;
      this.eachSubnode(node, function(elem) {
        if(c(elem)) flag = true;
      }, flags);
      return flag;
    },
  
    /*
       Method: getSubnodes
    
       Collects all subnodes for a specified node. The _level_ parameter filters nodes having relative depth of _level_ from the root node.

       Parameters:
       node - A <Graph.Node>.
       level - _optional_ A starting relative depth for collecting nodes. Default's 0.

       Returns:
       An array of nodes.

    */
    getSubnodes: function(node, level, flags) {
        var ans = [], that = this;
        level = level || 0;
        var levelStart, levelEnd;
        if($.type(level) == 'array') {
            levelStart = level[0];
            levelEnd = level[1];
        } else {
            levelStart = level;
            levelEnd = Number.MAX_VALUE - node._depth;
        }
        this.eachLevel(node, levelStart, levelEnd, function(n) {
            ans.push(n);
        }, flags);
        return ans;
    },
  
  
    /*
       Method: getParents
    
       Returns an Array of <Graph.Nodes> wich are parents of the given node. 

       Parameters:
       node - A <Graph.Node>.

       Returns:
       An Array of <Graph.Nodes>.

       Example:
       (start code js)
         var pars = Graph.Util.getParents(node);
         if(pars.length > 0) {
           //do stuff with parents
         }
       (end code)
    */
    getParents: function(node) {
        var ans = [];
        this.eachAdjacency(node, function(adj) {
            var n = adj.nodeTo;
            if(n._depth < node._depth) ans.push(n);
        });
        return ans;
    },
    
    /*
    Method: isDescendantOf
 
    Returns a Boolean instance indicating if some node is descendant of the node with the given id. 

    Parameters:
    node - A <Graph.Node>.
    id - A <Graph.Node> id.

    Returns:
    Ture if _node_ is descendant of the node with the given _id_. False otherwise.

    Example:
    (start code js)
      var pars = Graph.Util.isDescendantOf(node, "nodeid");
    (end code)
 */
 isDescendantOf: function(node, id) {
    if(node.id == id) return true;
    var pars = this.getParents(node), ans = false;
    for ( var i = 0; !ans && i < pars.length; i++) {
    ans = ans || this.isDescendantOf(pars[i], id);
  }
    return ans;
 },

 /*
     Method: clean
  
     Cleans flags from nodes (by setting the _flag_ property to false).

     Parameters:
     graph - A <Graph> instance.
  */
  clean: function(graph) { this.eachNode(graph, function(elem) { elem._flag = false; }); },
};



/*
 * File: Graph.Op.js
 *
 * Defines an abstract class for performing <Graph> Operations.
*/

/*
   Object: Graph.Op

   Generic <Graph> Operations.
   
   Description:

   An abstract class holding unary and binary powerful graph operations such as removingNodes, removingEdges, adding two graphs and morphing.

   Implemented by:

   <Hypertree.Op>, <RGraph.Op> and <ST.Op>.

   Access:

   The subclasses for this abstract class can be accessed by using the _op_ property of the <Hypertree>, <RGraph> or <ST> instances created.

   See also:

   <Hypertree.Op>, <RGraph.Op>, <ST.Op>, <Hypertree>, <RGraph>, <ST>, <Graph>.
*/
Graph.Op = {

    options: {
        type: 'nothing',
        duration: 2000,
        hideLabels: true,
        fps:30
    },
  
    /*
       Method: removeNode
    
       Removes one or more <Graph.Nodes> from the visualization. 
       It can also perform several animations like fading sequentially, fading concurrently, iterating or replotting.

       Parameters:
    
          node - The node's id. Can also be an array having many ids.
          opt - Animation options. It's an object with optional properties
          
          - _type_ Type of the animation. Can be "nothing", "replot", "fade:seq",  "fade:con" or "iter". Default's "nothing".
          - _duration_ Duration of the animation in milliseconds. Default's 2000.
          - _fps_ Frames per second for the animation. Default's 30.
          - _hideLabels_ Hide labels during the animation. Default's *true*.
          - _transition_ Transitions defined in the <Animation> class. Default's the default transition option of the 
          <RGraph>, <Hypertree> or <ST> instance created.
   
      Example:
      (start code js)
        var rg = new RGraph(canvas, config); //could be new ST or new Hypertree also.
        rg.op.removeNode('nodeid', {
          type: 'fade:seq',
          duration: 1000,
          hideLabels: false,
          transition: Trans.Quart.easeOut
        });
        //or also
        rg.op.removeNode(['someid', 'otherid'], {
          type: 'fade:con',
          duration: 1500
        });
      (end code)
    */
  
    removeNode: function(node, opt) {
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt);
        var n = $.splat(node);
        var i, that, nodeObj;
        switch(options.type) {
            case 'nothing':
                for(i=0; i<n.length; i++) viz.graph.removeNode(n[i]);
                break;
            
            case 'replot':
                this.removeNode(n, { type: 'nothing' });
                viz.labels.clearLabels();
                viz.refresh(true);
                break;
            
            case 'fade:seq': case 'fade':
                that = this;
                //set alpha to 0 for nodes to remove.
                for(i=0; i<n.length; i++) {
                    nodeObj = viz.graph.getNode(n[i]);
                    nodeObj.setData('alpha', 0, 'end');
                }
                viz.fx.animate($.merge(options, {
                    modes: ['node-property:alpha'],
                    onComplete: function() {
                        that.removeNode(n, { type: 'nothing' });
                        viz.labels.clearLabels();
                        viz.reposition();
                        viz.fx.animate($.merge(options, {
                            modes: ['linear']
                        }));
                    }
                }));
                break;
            
            case 'fade:con':
                that = this;
                //set alpha to 0 for nodes to remove. Tag them for being ignored on computing positions.
                for(i=0; i<n.length; i++) {
                    nodeObj = viz.graph.getNode(n[i]);
                    nodeObj.setData('alpha', 0, 'end');
                    nodeObj.ignore = true;
                }
                viz.reposition();
                viz.fx.animate($.merge(options, {
                    modes: ['node-property:alpha', 'linear'],
                    onComplete: function() {
                        that.removeNode(n, { type: 'nothing' });
                    }
                }));
                break;
            
            case 'iter':
                that = this;
                viz.fx.sequence({
                    condition: function() { return n.length != 0; },
                    step: function() { that.removeNode(n.shift(), { type: 'nothing' });  viz.labels.clearLabels(); },
                    onComplete: function() { options.onComplete(); },
                    duration: Math.ceil(options.duration / n.length)
                });
                break;
                
            default: this.doError();
        }
    },
    
    /*
       Method: removeEdge
    
       Removes one or more edges from the visualization. 
       It can also perform several animations like fading sequentially, fading concurrently, iterating or replotting.

       Parameters:
    
       vertex - An array having two strings which are the ids of the nodes connected by this edge (i.e ['id1', 'id2']). Can also be a two dimensional array holding many edges (i.e [['id1', 'id2'], ['id3', 'id4'], ...]).
          opt - Animation options. It's an object with optional properties
          
          - _type_ Type of the animation. Can be "nothing", "replot", "fade:seq",  "fade:con" or "iter". Default's "nothing".
          - _duration_ Duration of the animation in milliseconds. Default's 2000.
          - _fps_ Frames per second for the animation. Default's 30.
          - _hideLabels_ Hide labels during the animation. Default's *true*.
          - _transition_ Transitions defined in the <Animation> class. Default's the default transition option of the 
          <RGraph>, <Hypertree> or <ST> instance created.
   
      Example:
      (start code js)
        var rg = new RGraph(canvas, config); //could be new ST or new Hypertree also.
        rg.op.removeEdge(['nodeid', 'otherid'], {
          type: 'fade:seq',
          duration: 1000,
          hideLabels: false,
          transition: Trans.Quart.easeOut
        });
        //or also
        rg.op.removeEdge([['someid', 'otherid'], ['id3', 'id4']], {
          type: 'fade:con',
          duration: 1500
        });
      (end code)
    
    */
    removeEdge: function(vertex, opt) {
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt);
        var v = ($.type(vertex[0]) == 'string')? [vertex] : vertex;
        var i, that, adjs;
        switch(options.type) {
            case 'nothing':
                for(i=0; i<v.length; i++)   viz.graph.removeAdjacence(v[i][0], v[i][1]);
                break;
            
            case 'replot':
                this.removeEdge(v, { type: 'nothing' });
                viz.refresh(true);
                break;
            
            case 'fade:seq': case 'fade':
                that = this;
                //set alpha to 0 for edges to remove.
                for(i=0; i<v.length; i++) {
                    adjs = viz.graph.getAdjacence(v[i][0], v[i][1]);
                    if(adjs) {
                        adjs[0].setData('alpha', 0,'end');
                        adjs[1].setData('alpha', 0,'end');
                    }
                }
                viz.fx.animate($.merge(options, {
                    modes: ['edge-property:alpha'],
                    onComplete: function() {
                        that.removeEdge(v, { type: 'nothing' });
                        viz.reposition();
                        viz.fx.animate($.merge(options, {
                            modes: ['linear']
                        }));
                    }
                }));
                break;
            
            case 'fade:con':
                that = this;
                //set alpha to 0 for nodes to remove. Tag them for being ignored when computing positions.
                for(i=0; i<v.length; i++) {
                    adjs = viz.graph.getAdjacence(v[i][0], v[i][1]);
                    if(adjs) {
                        adjs[0].setData('alpha',0 ,'end');
                        adjs[0].ignore = true;
                        adjs[1].setData('alpha',0 ,'end');
                        adjs[1].ignore = true;
                    }
                }
                viz.reposition();
                viz.fx.animate($.merge(options, {
                    modes: ['edge-property:alpha', 'linear'],
                    onComplete: function() {
                        that.removeEdge(v, { type: 'nothing' });
                    }
                }));
                break;
            
            case 'iter':
                that = this;
                viz.fx.sequence({
                    condition: function() { return v.length != 0; },
                    step: function() { that.removeEdge(v.shift(), { type: 'nothing' }); viz.labels.clearLabels(); },
                    onComplete: function() { options.onComplete(); },
                    duration: Math.ceil(options.duration / v.length)
                });
                break;
                
            default: this.doError();
        }
    },
    
    /*
       Method: sum
    
       Adds a new graph to the visualization. 
       
       The json graph (or tree) must at least have a common node with the current graph plotted by the visualization. 
       
       The resulting graph can be defined as follows <http://mathworld.wolfram.com/GraphSum.html>

       Parameters:
    
          json - A json tree or graph structure. See also <Loader.loadJSON>.
           opt - Animation options. It's an object with optional properties
          
          - _type_ Type of the animation. Can be "nothing", "replot", "fade:seq" or "fade:con". Default's "nothing".
          - _duration_ Duration of the animation in milliseconds. Default's 2000.
          - _fps_ Frames per second for the animation. Default's 30.
          - _hideLabels_ Hide labels during the animation. Default's *true*.
          - _transition_ Transitions defined in the <Animation> class. Default's the default transition option of the 
          <RGraph>, <Hypertree> or <ST> instance created.
   
      Example:
      (start code js)
        //json contains a tree or graph structure.

        var rg = new RGraph(canvas, config); //could be new ST or new Hypertree also.
        rg.op.sum(json, {
          type: 'fade:seq',
          duration: 1000,
          hideLabels: false,
          transition: Trans.Quart.easeOut
        });
        //or also
        rg.op.sum(json, {
          type: 'fade:con',
          duration: 1500
        });
      (end code)
    
    */
    sum: function(json, opt) {
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt), root = viz.root;
        var GUtil, graph;
        viz.root = opt.id || viz.root;
        switch(options.type) {
            case 'nothing':
                graph = viz.construct(json);
                GUtil = Graph.Util;
                GUtil.eachNode(graph, function(elem) {
                    GUtil.eachAdjacency(elem, function(adj) {
                        viz.graph.addAdjacence(adj.nodeFrom, adj.nodeTo, adj.data);
                    });
                });
                break;
            
            case 'replot':
                viz.refresh(true);
                this.sum(json, { type: 'nothing' });
                viz.refresh(true);
                break;
            
            case 'fade:seq': case 'fade': case 'fade:con':
                GUtil = Graph.Util;
                that = this;
                graph = viz.construct(json);

                //set alpha to 0 for nodes to add.
                var fadeEdges = this.preprocessSum(graph);
                var modes = !fadeEdges? ['node-property:alpha'] : ['node-property:alpha', 'edge-property:alpha'];
                viz.reposition();
                if(options.type != 'fade:con') {
                    viz.fx.animate($.merge(options, {
                        modes: ['linear'],
                        onComplete: function() {
                            viz.fx.animate($.merge(options, {
                                modes: modes,
                                onComplete: function() {
                                    options.onComplete();
                                }
                            }));
                        }
                    }));
                } else {
                    GUtil.eachNode(viz.graph, function(elem) {
                        if (elem.id != root && elem.pos.getp().equals(Polar.KER)) {
                          elem.pos.set(elem.endPos); elem.startPos.set(elem.endPos);
                        }
                    });
                    viz.fx.animate($.merge(options, {
                        modes: ['linear'].concat(modes)
                    }));
                }
                break;

            default: this.doError();
        }
    },
    
    /*
       Method: morph
    
       This method will _morph_ the current visualized graph into the new _json_ representation passed in the method. 
       
       Can also perform multiple animations. The _json_ object must at least have the root node in common with the current visualized graph.

       Parameters:
    
           json - A json tree or graph structure. See also <Loader.loadJSON>.
           opt - Animation options. It's an object with optional properties
          
          - _type_ Type of the animation. Can be "nothing", "replot", or "fade". Default's "nothing".
          - _duration_ Duration of the animation in milliseconds. Default's 2000.
          - _fps_ Frames per second for the animation. Default's 30.
          - _hideLabels_ Hide labels during the animation. Default's *true*.
          - _transition_ Transitions defined in the <Animation> class. Default's the default transition option of the 
          <RGraph>, <Hypertree> or <ST> instance created.
   
      Example:
      (start code js)
        //json contains a tree or graph structure.

        var rg = new RGraph(canvas, config); //could be new ST or new Hypertree also.
        rg.op.morph(json, {
          type: 'fade',
          duration: 1000,
          hideLabels: false,
          transition: Trans.Quart.easeOut
        });
        //or also
        rg.op.morph(json, {
          type: 'fade',
          duration: 1500
        });
      (end code)
    
    */
    morph: function(json, opt) {
        var viz = this.viz;
        var options = $.merge(this.options, viz.controller, opt), root = viz.root;
        var GUtil, graph;
        viz.root = opt.id || viz.root;
        switch(options.type) {
            case 'nothing':
                graph = viz.construct(json);
                GUtil = Graph.Util;
                GUtil.eachNode(graph, function(elem) {
                    GUtil.eachAdjacency(elem, function(adj) {
                        viz.graph.addAdjacence(adj.nodeFrom, adj.nodeTo, adj.data);
                    });
                });
                GUtil.eachNode(viz.graph, function(elem) {
                    GUtil.eachAdjacency(elem, function(adj) {
                        if(!graph.getAdjacence(adj.nodeFrom.id, adj.nodeTo.id)) {
                            viz.graph.removeAdjacence(adj.nodeFrom.id, adj.nodeTo.id);
                        }
                    });
                    if(!graph.hasNode(elem.id)) viz.graph.removeNode(elem.id);
                });
                
                break;
            
            case 'replot':
                viz.labels.clearLabels(true);
                this.morph(json, { type: 'nothing' });
                viz.refresh(true);
                viz.refresh(true);
                break;
                
            case 'fade:seq': case 'fade': case 'fade:con':
                GUtil = Graph.Util;
                that = this;
                graph = viz.construct(json);
                //preprocessing for adding nodes.
                var fadeEdges = this.preprocessSum(graph);
                //preprocessing for nodes to delete.
                GUtil.eachNode(viz.graph, function(elem) {
                    if(!graph.hasNode(elem.id)) {
                      elem.setData('alpha', 1);
                      elem.setData('alpha', 1, 'start');
                      elem.setData('alpha', 0, 'end');
                      elem.ignore = true;
                    }
                }); 
                GUtil.eachNode(viz.graph, function(elem) {
                    if(elem.ignore) return;
                    GUtil.eachAdjacency(elem, function(adj) {
                        if(adj.nodeFrom.ignore || adj.nodeTo.ignore) return;
                        var nodeFrom = graph.getNode(adj.nodeFrom.id);
                        var nodeTo = graph.getNode(adj.nodeTo.id);
                        if(!nodeFrom.adjacentTo(nodeTo)) {
                            var adjs = viz.graph.getAdjacence(nodeFrom.id, nodeTo.id);
                            fadeEdges = true;
                            adjs[0].setData('alpha', 1);
                            adjs[0].setData('alpha', 1, 'start');
                            adjs[0].setData('alpha', 0, 'end');

                            adjs[1].setData('alpha', 1);
                            adjs[1].setData('alpha', 1, 'start');
                            adjs[1].setData('alpha', 0, 'end');
                        }
                    });
                }); 
                var modes = !fadeEdges? ['node-property:alpha'] : ['node-property:alpha', 'edge-property:alpha'];
                viz.reposition();
                GUtil.eachNode(viz.graph, function(elem) {
                    if (elem.id != root && elem.pos.getp().equals(Polar.KER)) {
                      elem.pos.set(elem.endPos); elem.startPos.set(elem.endPos);
                    }
                });
                viz.fx.animate($.merge(options, {
                    modes: ['polar'].concat(modes),
                    onComplete: function() {
                        GUtil.eachNode(viz.graph, function(elem) {
                            if(elem.ignore) viz.graph.removeNode(elem.id);
                        });
                        GUtil.eachNode(viz.graph, function(elem) {
                            GUtil.eachAdjacency(elem, function(adj) {
                                if(adj.ignore) viz.graph.removeAdjacence(adj.nodeFrom.id, adj.nodeTo.id);
                            });
                        });
                        options.onComplete();
                    }
                }));
                break;

            default: this.doError();
        }
    },

    
  /*
    Method: contract
 
    Contracts the subtree to the given node. The given node will have a _collapsed=true_ property.
    
    Parameters:
 
       node - A <Graph.Node>.
       opt - An object containing options like
       
       _type_ - Whether to 'replot' or 'animate' the contraction.
       
       There are also a number of Animation options. For more information see <Options.Animation>.

   Example:
   (start code js)
     var rg = new RGraph(canvas, config); //could be ST, Hypertree, Sunburst also.
     rg.op.contract(node, {
       type: 'animate',
       duration: 1000,
       hideLabels: true,
       transition: Trans.Quart.easeOut
     });
   (end code)
 
   */
    contract: function(node, opt) {
      var GUtil = Graph.Util;
      var viz = this.viz;
      if(node.collapsed || !GUtil.anySubnode(node, $.lambda(true))) return;
      opt = $.merge(this.options, viz.config, opt || {}, {
        'modes': ['node-property:alpha:span', 'linear']
      });
      node.collapsed = true;
      (function subn(n) {
        GUtil.eachSubnode(n, function(ch) {
          ch.ignore = true;
          ch.setData('alpha', 0, opt.type == 'animate'? 'end' : 'current');
          subn(ch);
        });
      })(node);
      if(opt.type == 'animate') {
        viz.compute('end');
        if(viz.rotated) {
          viz.rotate(viz.rotated, 'none', {
            'property':'end'
          });
        }
        (function subn(n) {
          GUtil.eachSubnode(n, function(ch) {
            ch.setPos(node.getPos('end'), 'end');
            subn(ch);
          });
        })(node);
        viz.fx.animate(opt);
      } else if(opt.type == 'replot'){
        viz.refresh();
      }
    },
    
    /*
    Method: expand
 
    Expands the previously contracted subtree. The given node must have the _collapsed=true_ property.
    
    Parameters:
 
       node - A <Graph.Node>.
       opt - An object containing options like
       
       _type_ - Whether to 'replot' or 'animate'.
       
       There are also a number of Animation options. For more information see <Options.Animation>.

   Example:
   (start code js)
     var rg = new RGraph(canvas, config); //could be ST, Hypertree, Sunburst also.
     rg.op.expand(node, {
       type: 'animate',
       duration: 1000,
       hideLabels: true,
       transition: Trans.Quart.easeOut
     });
   (end code)
 
   */
    expand: function(node, opt) {
      if(!('collapsed' in node)) return;
      var GUtil = Graph.Util;
      var viz = this.viz;
      opt = $.merge(this.options, viz.config, opt || {}, {
        'modes': ['node-property:alpha:span', 'linear']
      });
      delete node.collapsed;
      (function subn(n) {
        GUtil.eachSubnode(n, function(ch) {
          delete ch.ignore;
          ch.setData('alpha', 1, opt.type == 'animate'? 'end' : 'current');
          subn(ch);
        });
      })(node);
      if(opt.type == 'animate') {
        viz.compute('end');
        if(viz.rotated) {
          viz.rotate(viz.rotated, 'none', {
            'property':'end'
          });
        }
        viz.fx.animate(opt);
      } else if(opt.type == 'replot'){
        viz.refresh();
      }
    },

    preprocessSum: function(graph) {
        var viz = this.viz;
        var GUtil = Graph.Util;
        GUtil.eachNode(graph, function(elem) {
            if(!viz.graph.hasNode(elem.id)) {
                viz.graph.addNode(elem);
                var n = viz.graph.getNode(elem.id);
                n.setData('alpha', 0);
                n.setData('alpha', 0, 'start');
                n.setData('alpha', 1, 'end');
            }
        }); 
        var fadeEdges = false;
        GUtil.eachNode(graph, function(elem) {
            GUtil.eachAdjacency(elem, function(adj) {
                var nodeFrom = viz.graph.getNode(adj.nodeFrom.id);
                var nodeTo = viz.graph.getNode(adj.nodeTo.id);
                if(!nodeFrom.adjacentTo(nodeTo)) {
                    var adjs = viz.graph.addAdjacence(nodeFrom, nodeTo, adj.data);
                    if(nodeFrom.startAlpha == nodeFrom.endAlpha 
                    && nodeTo.startAlpha == nodeTo.endAlpha) {
                        fadeEdges = true;
                        adjs[0].setData('alpha', 0);
                        adjs[0].setData('alpha', 0, 'start');
                        adjs[0].setData('alpha', 1, 'end');

                        adjs[1].setData('alpha', 0);
                        adjs[1].setData('alpha', 0, 'start');
                        adjs[1].setData('alpha', 1, 'end');
                    } 
                }
            });
        }); 
        return fadeEdges;
    }
};



/*
 * File: Graph.Plot.js
 *
 * Defines an abstract classes for performing <Graph> rendering and animation.
 *
 */


/*
   Object: Graph.Plot

   Generic <Graph> rendering and animation methods.
   
   Description:

   An abstract class for plotting a generic graph structure.

   Implemented by:

   <Hypertree.Plot>, <RGraph.Plot>, <ST.Plot>.

   Access:

   The subclasses for this abstract class can be accessed by using the _fx_ property of the <Hypertree>, <RGraph>, or <ST> instances created.

   See also:

   <Hypertree.Plot>, <RGraph.Plot>, <ST.Plot>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
Graph.Plot = {
    
    Interpolator: {
        //Mapping property to parser
        'map': {
          'color': 'color',
          'width': 'number',
          'height': 'number',
          'lineWidth': 'number',
          'dim': 'number',
          'alpha': 'number',
          'angularWidth':'number',
          'span':'number'
        },
  
        //Number interpolator
        'compute': function(from, to, delta) {
          return from + (to - from) * delta;
        },
        
        //Position interpolators
        'moebius': function(elem, props, delta, vector) {
          var v = vector.scale(-delta);  
          if(v.norm() < 1) {
              var x = v.x, y = v.y;
              var ans = elem.startPos
                .getc().moebiusTransformation(v);
              elem.pos.setc(ans.x, ans.y);
              v.x = x; v.y = y;
            }           
        },

        'linear': function(elem, props, delta) {
            var from = elem.startPos.getc(true);
            var to = elem.endPos.getc(true);
            elem.pos.setc(this.compute(from.x, to.x, delta), 
                          this.compute(from.y, to.y, delta));
        },

        'polar': function(elem, props, delta) {
          var from = elem.startPos.getp(true);
          var to = elem.endPos.getp();
          var ans = to.interpolate(from, delta);
          elem.pos.setp(ans.theta, ans.rho);
        },
        
        //Graph's Node/Edge interpolators
        'number': function(elem, prop, delta) {
          var from = elem.getData(prop, 'start');
          var to = elem.getData(prop, 'end');
          elem.setData(prop, this.compute(from, to, delta));
        },

        'color': function(elem, prop, delta) {
          var from = $.hexToRgb(elem.getData(prop, 'start'));
          var to = $.hexToRgb(elem.getData(prop, 'end'));
          var comp = this.compute;
          var val = $.rgbToHex([parseInt(comp(from[0], to[0], delta)),
                                parseInt(comp(from[1], to[1], delta)),
                                parseInt(comp(from[2], to[2], delta))]);
          
          elem.setData(prop, val);
        },
        
        'node-property': function(elem, props, delta) {
            var map = this.map;
            if(props) {
              var len = props.length;
              for(var i=0; i<len; i++) {
                var pi = props[i];
                this[map[pi]](elem, pi, delta);
              }
            } else {
              for(var pi in map) {
                this[map[pi]](elem, pi, delta);
              }
            }
        },
        
        'edge-property': function(elem, props, delta) {
            var adjs = elem.adjacencies;
            for(var id in adjs) this['node-property'](adjs[id], props, delta);
        }
    },
    
  
    /*
       Method: sequence
    
       Iteratively performs an action while refreshing the state of the visualization.

       Parameters:

       options - Some sequence options like
      
       - _condition_ A function returning a boolean instance in order to stop iterations.
       - _step_ A function to execute on each step of the iteration.
       - _onComplete_ A function to execute when the sequence finishes.
       - _duration_ Duration (in milliseconds) of each step.

      Example:
       (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        var i = 0;
        rg.fx.sequence({
          condition: function() {
           return i == 10;
          },
          step: function() {
            alert(i++);
          },
          onComplete: function() {
           alert('done!');
          }
        });
       (end code)

    */
    sequence: function(options) {
        var that = this;
        options = $.merge({
          condition: $.lambda(false),
          step: $.empty,
          onComplete: $.empty,
          duration: 200
        }, options || {});

        var interval = setInterval(function() {
          if(options.condition()) {
            options.step();
          } else {
            clearInterval(interval);
            options.onComplete();
          }
          that.viz.refresh(true);
        }, options.duration);
    },
    
    /*
      Method: prepare
 
      Prepare graph position and other attribute values before performing an Animation. 
      This method is used internally by the Toolkit.
      
      See also:
       
       <Animation>, <Graph.Plot.animate>

    */
    prepare: function(modes) {
      var GUtil = Graph.Util, graph = this.viz.graph;

      //parse modes
      var m = {};
      for(var i=0, len=modes.length; i < len; i++) {
        var elems = modes[i].split(':');
        m[elems.shift()] = elems;
      }
      
      GUtil.eachNode(graph, function(node) { 
        node.startPos.set(node.pos);
        if('node-property' in m) {
          var prop = m['node-property'];
          for(var i=0, l=prop.length; i < l; i++) {
            node.setData(prop[i], node.getData(prop[i]), 'start');
          }
        }
        if('edge-property' in m) {
          var prop = m['edge-property'];
          GUtil.eachAdjacency(node, function(adj) {
            for(var i=0, l=prop.length; i < l; i++) {
              adj.setData(prop[i], adj.getData(prop[i]), 'start');
            }
          });
        }
      });
      
      return m;
    },
    
    /*
       Method: animate
    
       Animates a <Graph> by interpolating some <Graph.Nodes> properties.

       Parameters:

       opt - Animation options. This object contains as properties

       - _modes_ (required) An Array of animation types. Possible values are "linear", "polar", "moebius", "node-property" and "edge-property".

       "linear", "polar" and "moebius" animation options will interpolate <Graph.Nodes> "startPos" and "endPos" properties, storing the result in "pos". 
       This means interpolating either cartesian coordinates, either polar coordinates or interpolation via a moebius transformation <http://en.wikipedia.org/wiki/Moebius_transformation> 
       
       "node-property" interpolates nodes' properties like alpha, color, dim, width, height. For this to work <Options.Graph.Node.overridable> must be *true*. 
       Also, this mode is used with the specific node property you want to change. So for example if you'd wanted to change the nodes color and alpha you should write "node-property:alpha:color". 
       To know more about node specific properties check <Options.Node>.
       
        "edge-property" works just like "node-property". To know more about edge properties check <Options.Graph.Edge>
      

       - _duration_ Duration (in milliseconds) of the Animation.
       - _fps_ Frames per second.
       - _hideLabels_ hide labels or not during the animation.

       ...and other <Hypertree>, <RGraph> or <ST> controller methods.

       Example:
       (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        rg.fx.animate({
          modes: ['linear'],
          hideLabels: false
        }); 
       (end code)
       
       
    */
    animate: function(opt, versor) {
      opt = $.merge(this.viz.config, opt || {});
      var that = this,
      viz = this.viz,
      graph  = viz.graph,
      GUtil = Graph.Util,
      interp = this.Interpolator;
      
      //prepare graph values
      var m = this.prepare(opt.modes);
      
      //animate
      if(opt.hideLabels) this.labels.hideLabels(true);
      this.animation.setOptions($.merge(opt, {
        $animating: false,
        compute: function(delta) {
          GUtil.eachNode(graph, function(node) { 
            for(var p in m) {
              interp[p](node, m[p], delta, versor);
            }
          });
          that.plot(opt, this.$animating, delta);
          this.$animating = true;
        },
        complete: function() {
          if(opt.hideLabels) that.labels.hideLabels(false);
          that.plot(opt);
          opt.onComplete();
          opt.onAfterCompute();
        }       
      })).start();
    },
    
    /*
      Method: nodeFx
   
      Apply animation to node properties like color, width, height, dim, etc.
  
      Parameters:
  
      options - Animation options. This object contains as properties
      
      - _elements_ The Elements to be transformed. This is an object that has a properties
      
      (start code js)
      'elements': {
        //can also be an array of ids
        'id': 'id-of-node-to-transform',
        //properties to be modified. All properties are optional.
        'properties': {
          'color': '#ccc', //some color
          'width': 10, //some width
          'height': 10, //some height
          'dim': 20, //some dim
          'lineWidth': 10 //some line width
        } 
      }
      (end code)
      
      - _reposition_ Whether to recalculate positions and add a motion animation. 
      This might be used when changing _width_ or _height_ properties in a <Layouts.Tree> like layout. Default's *false*.
      
      - _onComplete_ A method that is called when the animation completes.
      
      ...and all other <Graph.Plot.animate> options like _duration_, _fps_, _transition_, etc.
  
      Example:
      (start code js)
       var rg = new RGraph(canvas, config); //can be also Hypertree or ST
       rg.fx.nodeFx({
         'elements': {
           'id':'mynodeid',
           'properties': {
             'color':'#ccf'
           },
           'transition': Trans.Quart.easeOut
         }
       });
      (end code)    
   */
   nodeFx: function(opt) {
     var viz = this.viz,
     graph  = viz.graph,
     GUtil = Graph.Util,
     options = $.merge(this.viz.config, {
       'elements': {
         'id': false,
         'properties': {}
       },
       'reposition': false
     });
     opt = $.merge(options, opt || {}, {
       onBeforeCompute: $.empty,
       onAfterCompute: $.empty
     });
     //check if an animation is running and exit
     //if it's not a nodefx one.
     var anim = this.animation;
     if(anim.timer) {
       if(anim.opt.type 
           && anim.opt.type == 'nodefx') {
         anim.stopTimer();
       } else {
         return;
       }
     }
     var props = opt.elements.properties;
     //set end values for nodes
     if(!opt.elements.id) {
       GUtil.eachNode(graph, function(n) {
         for(var prop in props) {
           n.setData(prop, props[prop], 'end');
         }
       });
     } else {
       var ids = $.splat(opt.elements.id);
       $.each(ids, function(id) {
         var n = graph.getNode(id);
         if(n) {
           for(var prop in props) {
             n.setData(prop, props[prop], 'end');
           }
         }
       });
     }
     //get keys
     var propnames = [];
     for(var prop in props) propnames.push(prop);
     //add node properties modes
     var modes = ['node-property:' + propnames.join(':')];
     //set new node positions
     if(opt.reposition) {
       modes.push('linear');
       viz.compute('end');
     }
     //animate
     this.animate($.merge(opt, {
       modes: modes,
       type:'nodefx'
     }));
   },

    
    /*
       Method: plot
    
       Plots a <Graph>.

       Parameters:

       opt - _optional_ Plotting options.

       Example:

       (start code js)
       var rg = new RGraph(canvas, config); //can be also Hypertree or ST
       rg.fx.plot(); 
       (end code)

    */
    plot: function(opt, animating) {
      var viz = this.viz, 
      aGraph = viz.graph, 
      canvas = viz.canvas, 
      id = viz.root, 
      that = this, 
      ctx = canvas.getCtx(), 
      min = Math.min,
      GUtil = Graph.Util;
      opt = opt || this.viz.controller;
      opt.clearCanvas && canvas.clear();
        
      var T = !!aGraph.getNode(id).visited;
      GUtil.eachNode(aGraph, function(node) {
        var nodeAlpha = node.getData('alpha');
        GUtil.eachAdjacency(node, function(adj) {
          var nodeTo = adj.nodeTo;
          if(!!nodeTo.visited === T && node.drawn && nodeTo.drawn) {
            !animating && opt.onBeforePlotLine(adj);
            ctx.save();
            ctx.globalAlpha = min(nodeAlpha, 
                nodeTo.getData('alpha'), 
                adj.getData('alpha'));
            that.plotLine(adj, canvas, animating);
            ctx.restore();
            !animating && opt.onAfterPlotLine(adj);
          }
        });
        ctx.save();
        if(node.drawn) {
          !animating && opt.onBeforePlotNode(node);
          that.plotNode(node, canvas, animating);
          !animating && opt.onAfterPlotNode(node);
        }
        if(!that.labelsHidden && opt.withLabels) {
          if(node.drawn && nodeAlpha >= 0.95) {
            that.labels.plotLabel(canvas, node, opt);
          } else {
            that.labels.hideLabel(node, false);
          }
        }
        ctx.restore();
        node.visited = !T;
      });
    },

  /*
      Plots a Subtree.
   */
   plotTree: function(node, opt, animating) {
       var that = this, 
       viz = this.viz, 
       canvas = viz.canvas,
       config = this.config,
       ctx = canvas.getCtx();
       var nodeAlpha = node.getData('alpha');
       Graph.Util.eachSubnode(node, function(elem) {
         if(opt.plotSubtree(node, elem) && elem.exist && elem.drawn) {
             var adj = node.getAdjacency(elem.id);
             !animating && opt.onBeforePlotLine(adj);
             ctx.globalAlpha = Math.min(nodeAlpha, elem.getData('alpha'));
             that.plotLine(adj, canvas, animating);
             !animating && opt.onAfterPlotLine(adj);
             that.plotTree(elem, opt, animating);
         }
       });
       if(node.drawn) {
           !animating && opt.onBeforePlotNode(node);
           this.plotNode(node, canvas, animating);
           !animating && opt.onAfterPlotNode(node);
           if(!opt.hideLabels && opt.withLabels && nodeAlpha >= 0.95) 
               this.labels.plotLabel(canvas, node, opt);
           else 
               this.labels.hideLabel(node, false);
       } else {
           this.labels.hideLabel(node, true);
       }
   },

  /*
       Method: plotNode
    
       Plots a <Graph.Node>.

       Parameters:
       
       node - A <Graph.Node>.
       canvas - A <Canvas> element.

    */
    plotNode: function(node, canvas, animating) {
        var f = node.getData('type');
        if(f != 'none') {
          var width = node.getData('lineWidth');
          var color = node.getData('color');
          var alpha = node.getData('alpha');
          var ctx = canvas.getCtx();
          
          ctx.lineWidth = width;
          ctx.fillStyle = color;
          ctx.strokeStyle = color; 
          ctx.globalAlpha = alpha;

          this.nodeTypes[f].render.call(this, node, canvas, animating);
        }
    },
    
    /*
       Method: plotLine
    
       Plots a line.

       Parameters:

       adj - A <Graph.Adjacence>.
       canvas - A <Canvas> instance.

    */
    plotLine: function(adj, canvas, animating) {
      var f = adj.getData('type');
      if(f != 'none') {
        var width = adj.getData('lineWidth');
        var color = adj.getData('color');
        var ctx = canvas.getCtx();
        
        ctx.lineWidth = width;
        ctx.fillStyle = color;
        ctx.strokeStyle = color; 

        this.edgeTypes[f].call(this, adj, canvas, animating);
      }
    }    
  
};

/*
   Object: Graph.Label

   Generic interface for plotting labels.

   Description:

   This is a generic interface for plotting/hiding/showing labels.
   The <Graph.Label> interface is implemented in multiple ways to provide 
   different label types.

   For example, the Graph.Label interface is implemented as Graph.Label.DOM to provide 
   DOM label elements. Also we provide the Graph.Label.SVG interface (currently not working in IE) 
   for providing SVG type labels. The Graph.Label.Native interface implements these methods with the 
   native Canvas text rendering functions (currently not working in Opera).

   Implemented by:

   <Hypertree.Label>, <RGraph.Label>, <ST.Label>.

   Access:

   The subclasses for this abstract class can be accessed by using the _labels_ property of the <Hypertree>, <RGraph>, or <ST> instances created.

   See also:

   <Hypertree.Plot>, <RGraph.Plot>, <ST.Plot>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/

Graph.Label = {};

/*
   Class: Graph.Label.Native

   Implements labels natively, using the Canvas text API.

   See also:

   <Hypertree.Label>, <RGraph.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
Graph.Label.Native = new Class({
     /*
       Method: plotLabel
    
       Plots a label for a given node.

       Parameters:

       canvas - A <Canvas> instance.
       node - A <Graph.Node>.
       controller - A configuration object. See also <Hypertree>, <RGraph>, <ST>.

    */
    plotLabel: function(canvas, node, controller) {
        var ctx = canvas.getCtx();
        var coord = node.pos.getc(true);
        ctx.fillText(node.name, coord.x, coord.y);
    },

    hideLabel: $.empty,
    hideLabels: $.empty
});

/*
   Class: Graph.Label.DOM

   Abstract Class implementing some DOM label methods.

   Implemented by:

   <Graph.Label.HTML>, <Graph.Label.SVG>.

   See also:

   <Hypertree.Label>, <RGraph.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
Graph.Label.DOM = new Class({
    //A flag value indicating if node labels are being displayed or not.
    labelsHidden: false,
    //Label container 
    labelContainer: false,
    //Label elements hash.
    labels: {},

    /*
       Method: getLabelContainer
    
       Lazy fetcher for the label container.

       Returns:

       The label container DOM element.

       Example:

      (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        var labelContainer = rg.fx.getLabelContainer();
        alert(labelContainer.innerHTML);
      (end code)
    */
    getLabelContainer: function() {
        return this.labelContainer? this.labelContainer 
        : this.labelContainer = document
          .getElementById(this.viz.config.labelContainer);
    },
    
    /*
       Method: getLabel
      
       Lazy fetcher for the label element.

       Parameters:

       id - The label id (which is also a <Graph.Node> id).

       Returns:

       The label element.

       Example:

      (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        var label = rg.fx.getLabel('someid');
        alert(label.innerHTML);
      (end code)
      
    */
    getLabel: function(id) {
        return (id in this.labels && this.labels[id] != null)? this.labels[id] 
          : this.labels[id] = document.getElementById(id);
    },
    
    /*
       Method: hideLabels
    
       Hides all labels (by hiding the label container).

       Parameters:

       hide - A boolean value indicating if the label container must be hidden or not.

       Example:
       (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        rg.fx.hideLabels(true);
       (end code)
       
    */
    hideLabels: function (hide) {
        var container = this.getLabelContainer();
        if(hide) container.style.display = 'none';
        else container.style.display = '';
        this.labelsHidden = hide;
    },
    
    /*
       Method: clearLabels
    
       Clears the label container.

       Useful when using a new visualization with the same canvas element/widget.

       Parameters:

       force - Forces deletion of all labels.

       Example:
       (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        rg.fx.clearLabels();
        (end code)
    */
    clearLabels: function(force) {
        for(var id in this.labels) {
            if (force || !this.viz.graph.hasNode(id)) {
                this.disposeLabel(id);
                delete this.labels[id];
            }
        }
    },
    /*
       Method: disposeLabel
    
       Removes a label.

       Parameters:

       id - A label id (which generally is also a <Graph.Node> id).

       Example:
       (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        rg.fx.disposeLabel('labelid');
       (end code)
    */
    disposeLabel: function(id) {
        var elem = this.getLabel(id);
        if(elem && elem.parentNode) {
          elem.parentNode.removeChild(elem);
        }  
    },

    /*
       Method: hideLabel
    
       Hides the corresponding <Graph.Node> label.
        
       Parameters:

       node - A <Graph.Node>. Can also be an array of <Graph.Nodes>.
       flag - If *true*, nodes will be shown. Otherwise nodes will be hidden.

       Example:
       (start code js)
        var rg = new RGraph(canvas, config); //can be also Hypertree or ST
        rg.fx.hideLabel(rg.graph.getNode('someid'), false);
       (end code)
    */
    hideLabel: function(node, flag) {
      node = $.splat(node);
      var st = flag? "" : "none", lab, that = this;
      $.each(node, function(n) {
        var lab = that.getLabel(n.id);
        if (lab) {
           lab.style.display = st;
        } 
      });
    },
    
    /*
      Method: attachExtras
   
      Called only when a label is created to attach <Extras> like <Tips> or <NodeStyles> to labels
      
      Parameters:
  
      node - A <Graph.Node>.
      tag - A DOM element.
      
   */
    attachExtras: function(node, tag) {
      var viz = this.viz, config = viz.config;
      var tips = config.Tips, nodeStyles = config.NodeStyles;
      if(tips && tips.allow && tips.attachToDOM) {
        viz.tips.attach(node, tag);
      }
      if(nodeStyles && nodeStyles.attachToDOM) {
        if(nodeStyles.stylesHover) {
          viz.nodeStyles.attachOnHover(node, tag);
        }
        if(nodeStyles.stylesClick) {
          viz.nodeStyles.attachOnClick(node, tag);
        }
      }
    },
  /*
       Method: fitsInCanvas
    
       Returns _true_ or _false_ if the label for the node is contained in the canvas dom element or not.

       Parameters:

       pos - A <Complex> instance (I'm doing duck typing here so any object with _x_ and _y_ parameters will do).
       canvas - A <Canvas> instance.
       
       Returns:

       A boolean value specifying if the label is contained in the <Canvas> DOM element or not.

    */
    fitsInCanvas: function(pos, canvas) {
        var size = canvas.getSize();
        if(pos.x >= size.width || pos.x < 0 
            || pos.y >= size.height || pos.y < 0) return false;
        return true;                    
    }
});

/*
   Class: Graph.Label.HTML

   Implements HTML labels.

   Extends:

   <Graph.Label.DOM>.

   See also:

   <Hypertree.Label>, <RGraph.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
Graph.Label.HTML = new Class({
    Implements: Graph.Label.DOM,
    
    /*
       Method: plotLabel
    
       Plots a label for a given node.

       Parameters:

       canvas - A <Canvas> instance.
       node - A <Graph.Node>.
       controller - A configuration object. See also <Hypertree>, <RGraph>, <ST>.

    */
    plotLabel: function(canvas, node, controller) {
        var id = node.id, tag = this.getLabel(id);
        if(!tag && !(tag = document.getElementById(id))) {
          tag = document.createElement('div');
          var container = this.getLabelContainer();
          tag.id = id;
          tag.className = 'node';
          tag.style.position = 'absolute';
          controller.onCreateLabel(tag, node);
          container.appendChild(tag);
          this.labels[node.id] = tag;
          this.attachExtras(node, tag);
        }
        this.placeLabel(tag, node, controller);
    }
});

/*
   Class: Graph.Label.SVG

   Implements SVG labels.

   Extends:

   <Graph.Label.DOM>.

   See also:

   <Hypertree.Label>, <RGraph.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
Graph.Label.SVG = new Class({
    Implements: Graph.Label.DOM,
    
    /*
       Method: plotLabel
    
       Plots a label for a given node.

       Parameters:

       canvas - A <Canvas> instance.
       node - A <Graph.Node>.
       controller - A configuration object. See also <Hypertree>, <RGraph>, <ST>.

    */
    plotLabel: function(canvas, node, controller) {
      var id = node.id, tag = this.getLabel(id);
      if(!tag && !(tag = document.getElementById(id))) {
        var ns = 'http://www.w3.org/2000/svg';
        tag = document.createElementNS(ns, 'svg:text');
        var tspan = document.createElementNS(ns, 'svg:tspan');
        tag.appendChild(tspan);
        var container = this.getLabelContainer();
        tag.setAttribute('id', id);
        tag.setAttribute('class', 'node');
        container.appendChild(tag);
        controller.onCreateLabel(tag, node);
        this.labels[node.id] = tag;
        this.attachExtras(node, tag);
      }
      this.placeLabel(tag, node, controller);
    }
});



/*
 * File: Loader.js
 * 
 * Provides methods for loading JSON data.
 *
 * Description:
 *
 * Provides the <Loader.loadJSON> method implemented by the main visualization classes to load JSON Trees and Graphs.
 * 
 * Implemented By: 
 * 
 * <ST>, <TM>, <Hypertree> and <RGraph> classes
 * 
 */

/*
   Object: Loader

   Provides static methods for loading JSON data.

   Description:
   
   This object is extended by the main Visualization classes (<ST>, <Hypertree>, <TM> and <RGraph>)
   in order to implement the <Loader.loadJSON> method. 
   
   The <Loader.loadJSON> method accepts JSON Trees and Graph objects. This will be explained in detail in the <Loader.loadJSON> method definition.
*/
var Loader = {
     construct: function(json) {
        var isGraph = ($.type(json) == 'array');
        var ans = new Graph(this.graphOptions, this.config.Node, this.config.Edge);
        if(!isGraph) 
            //make tree
            (function (ans, json) {
                ans.addNode(json);
                for(var i=0, ch = json.children; i<ch.length; i++) {
                    ans.addAdjacence(json, ch[i]);
                    arguments.callee(ans, ch[i]);
                }
            })(ans, json);
        else
            //make graph
            (function (ans, json) {
                var getNode = function(id) {
                    for(var w=0; w<json.length; w++) { 
                      if(json[w].id == id) {
                        return json[w];
                      }
                    }
                    return undefined;
                };

                for(var i=0; i<json.length; i++) {
                    ans.addNode(json[i]);
                    for(var j=0, adj = json[i].adjacencies; j<adj.length; j++) {
                        var node = adj[j], data;
                        if(typeof adj[j] != 'string') {
                            data = node.data;
                            node = node.nodeTo;
                        }
                        ans.addAdjacence(json[i], getNode(node), data);
                    }
                }
            })(ans, json);

        return ans;
    },

    /*
     Method: loadJSON
    
     Loads a JSON structure to the visualization. The JSON structure can be a JSON tree or graph structure.
     
        A JSON tree or graph structure consists of nodes, each having as properties
       - _id_ A unique identifier for the node
       - _name_ A node's name
       - _data_ The data property contains a hash (i.e {}) where you can store all 
       the information you want about this node.
        
        Hash keys prefixed with a dollar sign (i.e $) have special meaning. I will detail those properties below.
      
        For JSON tree structures, there's an extra property _children_ of type Array which contains the node's children.
      
      Example:

      (start code js)
        var json = {  
            "id": "aUniqueIdentifier",  
            "name": "usually a nodes name",  
            "data": {
                "some key": "some value",
                "some other key": "some other value"
             },  
            "children": [ 'other nodes or empty' ]  
        };  
      (end code)
        
        JSON Graph structures consist of an array of nodes, each specifying the nodes to which the current node is connected.
        
        For JSON Graph structures, the _children_ property is replaced by the _adjacencies_ property.
        
        There are two types of Graph structures, _simple_ and _extended_ graph structures.
        
        For _simple_ Graph structures, the adjacencies property contains an array of strings, each specifying the 
        id of the node connected to the main node.
        
        Example:
        
        (start code js)
        var json = [  
            {  
                "id": "aUniqueIdentifier",  
                "name": "usually a nodes name",  
                "data": {
                    "some key": "some value",
                    "some other key": "some other value"
                 },  
                "adjacencies": ["anotherUniqueIdentifier", "yetAnotherUniqueIdentifier", 'etc']  
            },

            'other nodes go here...' 
        ];          
        (end code)
        
        For _extended_ Graph structures, the adjacencies property contains an array of Adjacency objects that have as properties
        - nodeTo The other node connected by this adjacency.
        - data A data property, where we can store custom key/value information.
        
        Example:
        
        (start code js)
        var json = [  
            {  
                "id": "aUniqueIdentifier",  
                "name": "usually a nodes name",  
                "data": {
                    "some key": "some value",
                    "some other key": "some other value"
                 },  
                "adjacencies": [  
                {  
                    nodeTo:"aNodeId",  
                    data: {} //put whatever you want here  
                },
                'other adjacencies go here...'  
            },

            'other nodes go here...' 
        ];          
        (end code)
        
        Since all visualizations implement this method, this will be the entry point for JSON data for all visualizations. This method could be called like this
        
        Example:
        
        (start code js)
        var ht = new Hypertree(canvas, config);
        ht.loadJSON(json);
        
        var tm = new TM.Squarified(config);
        tm.loadJSON(json);
        
        var st = new ST(canvas, config);
        st.loadJSON(json);
        
        var rg = new RGraph(canvas, config);
        rg.loadJSON(json);
        
        (end code)
        
       Parameters:
    
          json - A JSON Tree or Graph structure.
          i - For Graph structures only. Sets the indexed node as root for the visualization.

    */
    loadJSON: function(json, i) {
      this.json = json;
      //if they're canvas labels erase them.
      if(this.labels && this.labels.clearLabels) {
        this.labels.clearLabels(true);
      }
      this.graph = this.construct(json);
      if($.type(json) != 'array'){
        this.root = json.id;
      } else {
        this.root = json[i? i : 0].id;
      }
    },
    
    /*
      Method: toJSON
   
      Returns a JSON tree/graph structure from the current graph state for this visualization. 
      See <Loader.loadJSON> for the graph formats available.
      
      See also:
      
      <Loader.loadJSON>
      
      Parameters:
      
      type - _(string)_ The type of the JSON structure to be returned. Possible options are "tree" or "graph". Default's "tree".
    */    
    toJSON: function(type) {
      type = type || "tree";
      if(type == 'tree') {
        var ans = {};
        var rootNode = this.graph.getNode(this.root);
        var ans = (function recTree(node) {
          var ans = {};
          ans.id = node.id;
          ans.name = node.name;
          ans.data = node.data;
          var ch =[];
          Graph.Util.eachSubnode(node, function(n) {
            ch.push(recTree(n));
          });
          ans.children = ch;
          return ans;
        })(rootNode);
        return ans;
      } else {
        var ans = [], GUtil = Graph.Util;
        var T = !!this.graph.getNode(this.root).visited;
        GUtil.eachNode(this.graph, function(node) {
          var ansNode = {};
          ansNode.id = node.id;
          ansNode.name = node.name;
          ansNode.data = node.data;
          var adjs = [];
          GUtil.eachAdjacency(node, function(adj) {
            var nodeTo = adj.nodeTo;
            if(!!nodeTo.visited === T) {
              var ansAdj = {};
              ansAdj.nodeTo = nodeTo.id;
              ansAdj.data = adj.data;
              adjs.push(ansAdj);
            }
          });
          ansNode.adjacencies = adjs;
          ans.push(ansNode);
          node.visited = !T;
        });
        return ans;
      }
    }
};



/*
 * File: Layouts.js
 * 
 * Implements base Tree and Graph layouts.
 *
 * Description:
 *
 * Implements base Tree and Graph layouts like Radial, Tree, etc.
 * 
 */

/*
 * Object: Layouts
 * 
 * Parent object for common layouts.
 *
 */
var Layouts = {};


//Some util shared layout functions are defined here.
var NodeDim = {
  label: null,
  
  compute: function(graph, prop, opt) {
    this.initializeLabel(opt);
    var label = this.label, style = label.style;
    Graph.Util.eachNode(graph, function(n) {
      var autoWidth  = n.getData('autoWidth'),
          autoHeight = n.getData('autoHeight');
      if(autoWidth || autoHeight) {
        //delete dimensions since these are
        //going to be overridden now.
        delete n.data.$width;
        delete n.data.$height;
        delete n.data.$dim;
        
        var width  = n.getData('width'),
            height = n.getData('height');
        //reset label dimensions
        style.width  = autoWidth? 'auto' : width + 'px';
        style.height = autoHeight? 'auto' : height + 'px';
        
        //TODO(nico) should let the user choose what to insert here.
        label.innerHTML = n.name;
        
        var offsetWidth  = label.offsetWidth,
            offsetHeight = label.offsetHeight;
        var type = n.getData('type');
        if(['circle', 'square', 'triangle', 'star'].indexOf(type) === -1) {
          n.setData('width', offsetWidth);
          n.setData('height', offsetHeight);
        } else {
          var dim = offsetWidth > offsetHeight? offsetWidth : offsetHeight;
          n.setData('width', dim);
          n.setData('height', dim);
          n.setData('dim', dim); 
        }
      }
    });
  },
  
  initializeLabel: function(opt) {
    if(!this.label) {
      this.label = document.createElement('div');
      document.body.appendChild(this.label);
    }
    this.setLabelStyles(opt);
  },
  
  setLabelStyles: function(opt) {
    $.extend(this.label.style, {
      'visibility': 'hidden',
      'position': 'absolute',
      'width': 'auto',
      'height': 'auto',
      'padding': opt.Node.labelPadding + 'px'
    });
    this.label.className = 'jit-autoadjust-label';
  }
};


/*
 * Class: Layouts.Radial
 * 
 * Implements a Radial Layout.
 * 
 * Implemented By:
 * 
 * <RGraph>, <Hypertree>
 * 
 */
Layouts.Radial = new Class({

  /*
   * Method: compute
   * 
   * Computes nodes' positions.
   * 
   * Parameters:
   * 
   * property - _optional_ A <Graph.Node> position property to store the new
   * positions. Possible values are 'pos', 'endPos' or 'startPos'.
   * 
   */
  compute : function(property) {
    var prop = $.splat(property || [ 'current', 'start', 'end' ]);
    NodeDim.compute(this.graph, prop, this.config);
    Graph.Util.computeLevels(this.graph, this.root, 0, "ignore");
    var lengthFunc = this.createLevelDistanceFunc(); 
    this.computeAngularWidths(prop);
    this.computePositions(prop, lengthFunc);
  },

  /*
   * computePositions
   * 
   * Performs the main algorithm for computing node positions.
   */
  computePositions : function(property, getLength) {
    var propArray = property;
    var GUtil = Graph.Util;
    var root = this.graph.getNode(this.root);
    var parent = this.parent;
    var config = this.config;

    for ( var i=0, l=propArray.length; i < l; i++) {
      var pi = propArray[i];
      root.setPos($P(0, 0), pi);
      root.setData('span', Math.PI * 2, pi);
    }

    root.angleSpan = {
      begin : 0,
      end : 2 * Math.PI
    };

    GUtil.eachBFS(this.graph, this.root, function(elem) {
      var angleSpan = elem.angleSpan.end - elem.angleSpan.begin;
      var angleInit = elem.angleSpan.begin;
      var len = getLength(elem);
      //Calculate the sum of all angular widths
      var totalAngularWidths = 0, subnodes = [], maxDim = {};
      GUtil.eachSubnode(elem, function(sib) {
        totalAngularWidths += sib._treeAngularWidth;
        //get max dim
        for ( var i=0, l=propArray.length; i < l; i++) {
          var pi = propArray[i], dim = sib.getData('dim', pi);
          maxDim[pi] = !!maxDim[pi]? (dim > maxDim[pi]? dim : maxDim[pi]) : dim;
        }
        subnodes.push(sib);
      }, "ignore");
      //Maintain children order
      //Second constraint for <http://bailando.sims.berkeley.edu/papers/infovis01.htm>
      if (parent && parent.id == elem.id && subnodes.length > 0
          && subnodes[0].dist) {
        subnodes.sort(function(a, b) {
          return (a.dist >= b.dist) - (a.dist <= b.dist);
        });
      }
      //Calculate nodes positions.
      for (var k = 0, ls=subnodes.length; k < ls; k++) {
        var child = subnodes[k];
        if (!child._flag) {
          var angleProportion = child._treeAngularWidth / totalAngularWidths * angleSpan;
          var theta = angleInit + angleProportion / 2;

          for ( var i=0, l=propArray.length; i < l; i++) {
            var pi = propArray[i];
            child.setPos($P(theta, len), pi);
            child.setData('span', angleProportion, pi);
            child.setData('dim-quotient', child.getData('dim', pi) / maxDim[pi], pi);
          }

          child.angleSpan = {
            begin : angleInit,
            end : angleInit + angleProportion
          };
          angleInit += angleProportion;
        }
      }
    }, "ignore");
  },

  /*
   * Method: setAngularWidthForNodes
   * 
   * Sets nodes angular widths.
   */
  setAngularWidthForNodes : function(prop) {
    Graph.Util.eachBFS(this.graph, this.root, function(elem, i) {
      var diamValue = elem.getData('angularWidth', prop[0]);
      elem._angularWidth = diamValue / i;
    }, "ignore");
  },

  /*
   * Method: setSubtreesAngularWidth
   * 
   * Sets subtrees angular widths.
   */
  setSubtreesAngularWidth : function() {
    var that = this;
    Graph.Util.eachNode(this.graph, function(elem) {
      that.setSubtreeAngularWidth(elem);
    }, "ignore");
  },

  /*
   * Method: setSubtreeAngularWidth
   * 
   * Sets the angular width for a subtree.
   */
  setSubtreeAngularWidth : function(elem) {
    var that = this, nodeAW = elem._angularWidth, sumAW = 0;
    Graph.Util.eachSubnode(elem, function(child) {
      that.setSubtreeAngularWidth(child);
      sumAW += child._treeAngularWidth;
    }, "ignore");
    elem._treeAngularWidth = Math.max(nodeAW, sumAW);
  },

  /*
   * Method: computeAngularWidths
   * 
   * Computes nodes and subtrees angular widths.
   */
  computeAngularWidths : function(prop) {
    this.setAngularWidthForNodes(prop);
    this.setSubtreesAngularWidth();
  }

});


/*
 * File: Hypertree.js
 * 
 * Implements the <Hypertree> class and other derived classes.
 *
 * Description:
 *
 * A Hyperbolic Tree (HT) is a focus+context information visualization technique used to display large amount of inter-related data. This technique was originally developed at Xerox PARC.
 *
 * The HT algorithm plots a tree in what's called the Poincare Disk model of Hyperbolic Geometry, a kind of non-Euclidean geometry. By doing this, the HT algorithm applies a moebius transformation to the tree in order to display it with a magnifying glass effect.
 *
 * Inspired by:
 *
 * A Focus+Context Technique Based on Hyperbolic Geometry for Visualizing Large Hierarchies (John Lamping, Ramana Rao, and Peter Pirolli).
 *
 * <http://www.cs.tau.ac.il/~asharf/shrek/Projects/HypBrowser/startree-chi95.pdf>
 *
 * Disclaimer:
 *
 * This visualization was built from scratch, taking only the paper as inspiration, and only shares some features with the Hypertree.
 *

*/

/* 
     Complex 
     
     A multi-purpose Complex Class with common methods. Extended for the Hypertree. 
 
*/
/* 
   moebiusTransformation 
 
   Calculates a moebius transformation for this point / complex. 
    For more information go to: 
        http://en.wikipedia.org/wiki/Moebius_transformation. 
 
   Parameters: 
 
      c - An initialized Complex instance representing a translation Vector. 
*/

Complex.prototype.moebiusTransformation = function(c) {
  var num = this.add(c);
  var den = c.$conjugate().$prod(this);
  den.x++;
  return num.$div(den);
};

/* 
   Method: getClosestNodeToOrigin 
 
   Extends <Graph.Util>. Returns the closest node to the center of canvas.

   Parameters:
  
    graph - A <Graph> instance.
    prop - _optional_ a <Graph.Node> position property. Possible properties are 'startPos', 'pos' or 'endPos'. Default's 'pos'.

   Returns:

    Closest node to origin. Returns *null* otherwise.
  
*/
Graph.Util.getClosestNodeToOrigin = function(graph, prop, flags) {
  return this.getClosestNodeToPos(graph, Polar.KER, prop, flags);
};

/* 
   Method: getClosestNodeToPos
 
   Extends <Graph.Util>. Returns the closest node to the given position.

   Parameters:
  
    graph - A <Graph> instance.
    pos - A <Complex> or <Polar> instance.
    prop - _optional_ a <Graph.Node> position property. Possible properties are 'startPos', 'pos' or 'endPos'. Default's 'pos'.

   Returns:

    Closest node to the given position. Returns *null* otherwise.
  
*/
Graph.Util.getClosestNodeToPos = function(graph, pos, prop, flags) {
  var node = null;
  prop = prop || 'pos';
  pos = pos && pos.getc(true) || Complex.KER;
  var distance = function(a, b) {
    var d1 = a.x - b.x, d2 = a.y - b.y;
    return d1 * d1 + d2 * d2;
  };
  this.eachNode(graph, function(elem) {
    node = (node == null || distance(elem[prop].getc(true), pos) < distance(
        node[prop].getc(true), pos)) ? elem : node;
  }, flags);
  return node;
};

/* 
    moebiusTransformation 
     
    Calculates a moebius transformation for the hyperbolic tree. 
     
    <http://en.wikipedia.org/wiki/Moebius_transformation> 
      
     Parameters: 
     
        graph - A <Graph> instance.
        pos - A <Complex>.
        prop - A property array.
        theta - Rotation angle. 
        startPos - _optional_ start position. 
*/
Graph.Util.moebiusTransformation = function(graph, pos, prop, startPos, flags) {
  this.eachNode(graph, function(elem) {
    for ( var i = 0; i < prop.length; i++) {
      var p = pos[i].scale(-1), property = startPos ? startPos : prop[i];
      elem[prop[i]].set(elem[property].getc().moebiusTransformation(p));
    }
  }, flags);
};

/* 
   Class: Hypertree 
      
     The main Hypertree class

     Extends:

     <Loader>, <Layouts.Radial>, <Tips>

     Parameters:

     canvas - A <Canvas> Class
     config - A configuration/controller object.

     Configuration:
    
     The configuration object can have the following properties (all properties are optional and have a default value)
      
     *General*
     
     - _withLabels_ Whether the visualization should use/create labels or not. Default's *true*.
     - _radius_ The radius length of the visualization. Default's "auto" which means that the radius will be calculated to 
     fit the canvas. You can change this value to any float value.
     
     *Node*
     
     Customize the visualization nodes' shape, color, and other style properties.

     Inherits options from <Options.Graph.Node>.

     *Edge*

     Customize the visualization edges' shape, color, and other style properties.

     Inherits from <Options.Graph.Edge>.
      
     *Animations*

     Inherits from <Options.Animation>.
     
    *Controller options*

     Inherits from <Options.Controller>.
     
    Instance Properties:

    - _graph_ Access a <Graph> instance.
    - _op_ Access a <Hypertree.Op> instance.
    - _fx_ Access a <Hypertree.Plot> instance.
    - _labels_ Access a <Hypertree.Label> instance.

    Example:

    Here goes a complete example. In most cases you won't be forced to implement all properties and methods. In fact, 
    all configuration properties  have the default value assigned.

    I won't be instantiating a <Canvas> class here. If you want to know more about instantiating a <Canvas> class 
    please take a look at the <Canvas> class documentation.

    (start code js)
      var ht = new Hypertree(canvas, {
        
        Node: {
          overridable: false,
          type: 'circle',
          color: '#ccb',
          lineWidth: 1,
          height: 5,
          width: 5,
          dim: 7,
          transform: true
        },
        Edge: {
          overridable: false,
          type: 'hyperline',
          color: '#ccb',
          lineWidth: 1
        },
        duration: 1500,
        fps: 40,
        transition: Trans.Quart.easeInOut,
        clearCanvas: true,
        withLabels: true,
        radius: "auto",
        
        onBeforeCompute: function(node) {
          //do something onBeforeCompute
        },
        onAfterCompute:  function () {
          //do something onAfterCompute
        },
        onCreateLabel:   function(domElement, node) {
          //do something onCreateLabel
        },
        onPlaceLabel:    function(domElement, node) {
          //do something onPlaceLabel
        },
        onBeforePlotNode:function(node) {
          //do something onBeforePlotNode
        },
        onAfterPlotNode: function(node) {
          //do something onAfterPlotNode
        },
        onBeforePlotLine:function(adj) {
          //do something onBeforePlotLine
        },
        onAfterPlotLine: function(adj) {
          //do something onAfterPlotLine
        }
      });
    (end code)

*/

$jit.Hypertree = new Class( {

  Implements: [ Loader, Extras, Layouts.Radial ],

  initialize: function(controller) {
    var $Hypertree = $jit.Hypertree;

    var config = {
      radius: "auto",
      Edge: {
        type: 'hyperline'
      },
      withLabels: true,
      duration: 1500,
      fps: 35
    };
    this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
        "Fx", "Tips", "NodeStyles", "Controller"), config, controller);

    var canvasConfig = this.config;
    if(canvasConfig.useCanvas) {
      this.canvas = canvasConfig.useCanvas;
      this.config.labelContainer = this.canvas.id + '-label';
    } else {
      this.canvas = new Canvas(canvasConfig);
      this.config.labelContainer = canvasConfig.injectInto + '-label';
    }

    this.graphOptions = {
      'complex': false,
      'Node': {
        'selected': false,
        'exist': true,
        'drawn': true
      }
    };
    this.graph = new Graph(this.graphOptions, this.config.Node,
        this.config.Edge);
    this.labels = new $Hypertree.Label[canvasConfig.labels](this);
    this.fx = new $Hypertree.Plot(this);
    this.op = new $Hypertree.Op(this);
    this.json = null;
    this.root = null;
    this.busy = false;
    // initialize extras
    this.initializeExtras();
  },

  /* 
  
  Method: createLevelDistanceFunc 

  Returns the levelDistance function used for calculating a node distance 
  to its origin. This function returns a function that is computed 
  per level and not per node, such that all nodes with the same depth will have the 
  same distance to the origin. The resulting function gets the 
  parent node as parameter and returns a float.

  */
  createLevelDistanceFunc: function() {
    // get max viz. length.
    var r = this.getRadius();
    // get max depth.
    var depth = 0, max = Math.max;
    Graph.Util.eachNode(this.graph, function(node) {
      depth = max(node._depth, depth);
    }, "ignore");
    depth++;
    // node distance generator
    var genDistFunc = function(a) {
      return function(node) {
        node.scale = r;
        var d = node._depth + 1;
        var acum = 0, pow = Math.pow;
        while (d) {
          acum += pow(a, d--);
        }
        return acum;
      };
    };
    // estimate better edge length.
    for ( var i = 0.51; i <= 1; i += 0.01) {
      var valSeries = (1 - Math.pow(i, depth)) / (1 - i);
      if (valSeries >= 2) { return genDistFunc(i - 0.01); }
    }
    return genDistFunc(0.75);
  },

  /* 
    Method: getRadius 
    
    Returns the current radius of the visualization. If *config.radius* is *auto* then it 
    calculates the radius by taking the smaller size of the <Canvas> widget.
    
    See also:
    
    <Canvas.getSize>
   
  */
  getRadius: function() {
    var rad = this.config.radius;
    if (rad !== "auto") { return rad; }
    var s = this.canvas.getSize();
    return Math.min(s.width, s.height) / 2;
  },

  /* 
      Method: refresh 
      
      Computes nodes' positions and replots the tree.

      Parameters:

      reposition - _optional_ Set this to *true* to force repositioning.

      See also:

      <Hypertree.reposition>
       
     */
  refresh: function(reposition) {
    if (reposition) {
      this.reposition();
      Graph.Util.eachNode(this.graph, function(node) {
        node.startPos.rho = node.pos.rho = node.endPos.rho;
        node.startPos.theta = node.pos.theta = node.endPos.theta;
      });
    } else {
      this.compute();
    }
    this.plot();
  },

  /* 
   Method: reposition 
   
   Computes nodes' positions and restores the tree to its previous position.

   For calculating nodes' positions the root must be placed on its origin. This method does this 
     and then attemps to restore the hypertree to its previous position.
    
  */
  reposition: function() {
    this.compute('end');
    var vector = this.graph.getNode(this.root).pos.getc().scale(-1);
    Graph.Util.moebiusTransformation(this.graph, [ vector ], [ 'endPos' ],
        'endPos', "ignore");
    Graph.Util.eachNode(this.graph, function(node) {
      if (node.ignore) {
        node.endPos.rho = node.pos.rho;
        node.endPos.theta = node.pos.theta;
      }
    });
  },

  /* 
   Method: plot 
   
   Plots the Hypertree 

  */
  plot: function() {
    this.fx.plot();
  },

  /* 
   Method: onClick 
   
   Performs all calculations and animations to center the node specified by _id_.

   Parameters:

   id - A <Graph.Node> id.
   opt - _optional_ An object containing some extra properties like

   - _hideLabels_ Hide labels when performing the animation. Default's *true*.

   Example:

   (start code js)
     ht.onClick('someid');
     //or also...
     ht.onClick('someid', {
      hideLabels: false
     });
    (end code)
    
  */
  onClick: function(id, opt) {
    var pos = this.graph.getNode(id).pos.getc(true);
    this.move(pos, opt);
  },

  /* 
   Method: move 

   Translates the tree to the given position. 

   Parameters:

   pos - A <Complex> number determining the position to move the tree to.
   opt - _optional_ An object containing some extra properties defined in <Hypertree.onClick>


  */
  move: function(pos, opt) {
    var versor = $C(pos.x, pos.y);
    if (this.busy === false && versor.norm() < 1) {
      var GUtil = Graph.Util;
      this.busy = true;
      var root = GUtil.getClosestNodeToPos(this.graph, versor), that = this;
      GUtil.computeLevels(this.graph, root.id, 0);
      this.controller.onBeforeCompute(root);
      opt = $.merge( {
        onComplete: $.empty
      }, opt || {});
      this.fx.animate($.merge( {
        modes: [ 'moebius' ],
        hideLabels: true
      }, opt, {
        onComplete: function() {
          that.busy = false;
          opt.onComplete();
        }
      }), versor);
    }
  }
});

$jit.Hypertree.$extend = true;

(function(Hypertree) {

  /* 
     Class: Hypertree.Op 
   
     Performs advanced operations on trees and graphs.

     Extends:

     All <Graph.Op> methods

     Access:

     This instance can be accessed with the _op_ parameter of the hypertree instance created.

     Example:

     (start code js)
      var ht = new Hypertree(canvas, config);
      ht.op.morph //or can also call any other <Graph.Op> method
     (end code)
      
  */
  Hypertree.Op = new Class( {

    Implements: Graph.Op,

    initialize: function(viz) {
      this.viz = viz;
    }
  });

  /* 
     Class: Hypertree.Plot 
   
     Performs plotting operations.

     Extends:

     All <Graph.Plot> methods

     Access:

     This instance can be accessed with the _fx_ parameter of the hypertree instance created.

     Example:

     (start code js)
      var ht = new Hypertree(canvas, config);
      ht.fx.animate //or can also call any other <Hypertree.Plot> method
     (end code)

  */
  Hypertree.Plot = new Class( {

    Implements: Graph.Plot,

    initialize: function(viz) {
      this.viz = viz;
      this.config = viz.config;
      this.node = this.config.Node;
      this.edge = this.config.Edge;
      this.animation = new Animation;
      this.nodeTypes = new Hypertree.Plot.NodeTypes;
      this.edgeTypes = new Hypertree.Plot.EdgeTypes;
      this.labels = viz.labels;
    }
  });

  /*
    Object: Hypertree.Label

    Label interface implementation for the Hypertree

    See Also:

    <Graph.Label>, <Hypertree.Label.HTML>, <RGraph.Label.SVG>

   */
  Hypertree.Label = {};

  /*
     Class: Hypertree.Label.Native

     Implements labels natively, using the Canvas text API.

     Extends:

     <Graph.Label.Native>

     See also:

     <Hypertree.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

  */
  Hypertree.Label.Native = new Class( {
    Extends: Graph.Label.Native,

    initialize: function(viz) {
      this.viz = viz;
    },

    /*
         Method: plotLabel
      
         Plots a label for a given node.

         Parameters:

         canvas - A <Canvas> instance.
         node - A <Graph.Node>.
         controller - A configuration object. See also <Hypertree>, <RGraph>, <ST>.

      */
    plotLabel: function(canvas, node, controller) {
      var ctx = canvas.getCtx();
      var coord = node.pos.getc(true);
      var s = this.viz.getRadius();
      ctx.fillText(node.name, coord.x * s, coord.y * s);
    }
  });

  /*
     Class: Hypertree.Label.SVG

     Implements labels using SVG (currently not supported in IE).

     Extends:

     <Graph.Label.SVG>

     See also:

     <Hypertree.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

  */
  Hypertree.Label.SVG = new Class( {
    Implements: Graph.Label.SVG,

    initialize: function(viz) {
      this.viz = viz;
    },

    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), canvas = this.viz.canvas;
      var radius = canvas.getSize(), r = this.viz.getRadius();
      var round = Math.round;
      var labelPos = {
        x: round(pos.x * r + radius.width / 2),
        y: round(pos.y * r + radius.height / 2)
      };
      tag.setAttribute('x', labelPos.x);
      tag.setAttribute('y', labelPos.y);
      controller.onPlaceLabel(tag, node);
    }
  });

  /*
     Class: Hypertree.Label.HTML

     Implements labels using plain old HTML.

     Extends:

     <Graph.Label.HTML>

     See also:

     <Hypertree.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

  */
  Hypertree.Label.HTML = new Class( {
    Implements: Graph.Label.HTML,

    initialize: function(viz) {
      this.viz = viz;
    },
    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), canvas = this.viz.canvas;
      var radius = canvas.getSize(), r = this.viz.getRadius();
      var round = Math.round;
      var labelPos = {
        x: round(pos.x * r + radius.width / 2),
        y: round(pos.y * r + radius.height / 2)
      };
      var style = tag.style;
      style.left = labelPos.x + 'px';
      style.top = labelPos.y + 'px';
      style.display = this.fitsInCanvas(labelPos, canvas) ? '' : 'none';

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
    Class: Hypertree.Plot.NodeTypes

    Here are implemented all kinds of node rendering functions. 
    Rendering functions implemented are 'none', 'circle', 'triangle', 'rectangle', 'star' and 'square'.

    You can add new Node types by implementing a new method in this class

    Example:

    (start code js)
      Hypertree.Plot.NodeTypes.implement({
        'newnodetypename': function(node, canvas) {
          //Render my node here.
        }
      });
    (end code)

  */
  Hypertree.Plot.NodeTypes = new Class( {
    'none': {
      'render': $.empty,
      'contains': $.lambda(false)
    },

    'circle': {
      'render': function(node, canvas) {
        var nconfig = this.node, data = node.data;
        var nodeDim = node.getData('dim') / 2;
        var p = node.pos.getc(), pos = p.scale(node.scale);
        var prod = nconfig.transform ? nodeDim * (1 - p.squaredNorm())
            : nodeDim;
        if (prod >= nodeDim / 4) {
          canvas.path('fill', function(context) {
            context.arc(pos.x, pos.y, prod, 0, Math.PI * 2, true);
          });
        }
      },
      'contains': $.lambda(false)
    },

    'ellipse': {
      'render': function(node, canvas) {
        var pos = node.pos.getc().$scale(node.scale);
        var width = node.getData('width') / 2;
        var height = node.getData('height') / 2;
        var ctx = canvas.getCtx();
        ctx.save();
        ctx.scale(width / height, height / width);
        canvas.path('fill', function(context) {
          context.arc(pos.x * (height / width), pos.y * (width / height),
              height, 0, Math.PI * 2, true);
        });
        ctx.restore();
      },
      'contains': $.lambda(false)
    },

    'square': {
      'render': function(node, canvas) {
        var nconfig = this.node;
        var nodeDim = node.getData('dim') / 2;
        var p = node.pos.getc(), pos = p.scale(node.scale);
        var prod = nconfig.transform ? nodeDim * (1 - p.squaredNorm())
            : nodeDim;
        var nodeDim2 = 2 * prod;
        if (prod >= nodeDim / 4) {
          canvas.getCtx().fillRect(pos.x - prod, pos.y - prod, nodeDim2,
              nodeDim2);
        }
      },
      'contains': $.lambda(false)
    },

    'rectangle': {
      'render': function(node, canvas) {
        var nconfig = this.node;
        var width = node.getData('width');
        var height = node.getData('height');
        var p = node.pos.getc(), pos = p.scale(node.scale);
        var prod = 1 - p.squaredNorm();
        width = nconfig.transform ? width * prod : width;
        height = nconfig.transform ? height * prod : height;
        if (prod >= 0.25) {
          canvas.getCtx().fillRect(pos.x - width / 2, pos.y - height / 2,
              width, height);
        }
      },
      'contains': $.lambda(false)
    },

    'triangle': {
      'render': function(node, canvas) {
        var nconfig = this.node;
        var nodeDim = node.getData('dim');
        var p = node.pos.getc(), pos = p.scale(node.scale);
        var prod = nconfig.transform ? nodeDim * (1 - p.squaredNorm())
            : nodeDim;
        if (prod >= nodeDim / 4) {
          var c1x = pos.x, c1y = pos.y - prod, c2x = c1x - prod, c2y = pos.y
              + prod, c3x = c1x + prod, c3y = c2y;
          canvas.path('fill', function(ctx) {
            ctx.moveTo(c1x, c1y);
            ctx.lineTo(c2x, c2y);
            ctx.lineTo(c3x, c3y);
          });
        }
      },
      'contains': $.lambda(false)
    },

    'star': {
      'render': function(node, canvas) {
        var nconfig = this.node;
        var nodeDim = node.getData('dim');
        var p = node.pos.getc(), pos = p.scale(node.scale);
        var prod = nconfig.transform ? nodeDim * (1 - p.squaredNorm())
            : nodeDim;
        if (prod >= nodeDim / 4) {
          var ctx = canvas.getCtx(), pi5 = Math.PI / 5;
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.beginPath();
          ctx.moveTo(nodeDim, 0);
          for ( var i = 0; i < 9; i++) {
            ctx.rotate(pi5);
            if (i % 2 == 0) {
              ctx.lineTo((prod / 0.525731) * 0.200811, 0);
            } else {
              ctx.lineTo(prod, 0);
            }
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      },
      'contains': $.lambda(false)
    }
  });

  /*
   Class: Hypertree.Plot.EdgeTypes

   Here are implemented all kinds of edge rendering functions. 
   Rendering functions implemented are 'none', 'line' and 'hyperline'.

   You can add new Edge types by implementing a new method in this class

   Example:

   (start code js)
     Hypertree.Plot.EdgeTypes.implement({
       'newedgetypename': function(adj, canvas) {
         //Render my edge here.
       }
     });
   (end code)

  */
  Hypertree.Plot.EdgeTypes = new Class({
        'none': $.empty,

        'line': function(adj, canvas) {
          var pos = adj.nodeFrom.pos.getc(true);
          var posChild = adj.nodeTo.pos.getc(true);
          var scale = adj.nodeFrom.scale;
          canvas.path('stroke', function(context) {
            context.moveTo(pos.x * scale, pos.y * scale);
            context.lineTo(posChild.x * scale, posChild.y * scale);
          });
        },

        /*
           Plots a hyperline between two nodes. A hyperline is an arc of a circle which is orthogonal to the main circle. 
        
           Parameters:
        
           adj - A <Graph.Adjacence> object.
           canvas - A <Canvas> instance.
        */
        'hyperline': function(adj, canvas) {
          var node = adj.nodeFrom, child = adj.nodeTo, data = adj.data;
          var pos = node.pos.getc(), posChild = child.pos.getc();
          var r = this.viz.getRadius();
          var centerOfCircle = computeArcThroughTwoPoints(pos, posChild);
          if (centerOfCircle.a > 1000 || centerOfCircle.b > 1000
              || centerOfCircle.ratio < 0) {
            canvas.path('stroke', function(ctx) {
              ctx.moveTo(pos.x * r, pos.y * r);
              ctx.lineTo(posChild.x * r, posChild.y * r);
            });
          } else {
            var angleBegin = Math.atan2(posChild.y - centerOfCircle.y,
                posChild.x - centerOfCircle.x);
            var angleEnd = Math.atan2(pos.y - centerOfCircle.y, pos.x
                - centerOfCircle.x);
            var sense = sense(angleBegin, angleEnd);
            canvas.path('stroke', function(ctx) {
              ctx.arc(centerOfCircle.x * r, centerOfCircle.y * r,
                  centerOfCircle.ratio * r, angleBegin, angleEnd, sense);
            });
          }

          /*      
            Calculates the arc parameters through two points.
            
            More information in <http://en.wikipedia.org/wiki/Poincar%C3%A9_disc_model#Analytic_geometry_constructions_in_the_hyperbolic_plane> 
          
            Parameters:
          
            p1 - A <Complex> instance.
            p2 - A <Complex> instance.
            scale - The Disk's diameter.
          
            Returns:
          
            An object containing some arc properties.
          */
          function computeArcThroughTwoPoints(p1, p2) {
            var aDen = (p1.x * p2.y - p1.y * p2.x), bDen = aDen;
            var sq1 = p1.squaredNorm(), sq2 = p2.squaredNorm();
            // Fall back to a straight line
            if (aDen == 0)
              return {
                x: 0,
                y: 0,
                ratio: -1
              };

            var a = (p1.y * sq2 - p2.y * sq1 + p1.y - p2.y) / aDen;
            var b = (p2.x * sq1 - p1.x * sq2 + p2.x - p1.x) / bDen;
            var x = -a / 2;
            var y = -b / 2;
            var squaredRatio = (a * a + b * b) / 4 - 1;
            // Fall back to a straight line
            if (squaredRatio < 0)
              return {
                x: 0,
                y: 0,
                ratio: -1
              };
            var ratio = Math.sqrt(squaredRatio);
            var out = {
              x: x,
              y: y,
              ratio: ratio > 1000 ? -1 : ratio,
              a: a,
              b: b
            };

            return out;
          }

          /*      
            Sets angle direction to clockwise (true) or counterclockwise (false). 
             
            Parameters: 
          
               angleBegin - Starting angle for drawing the arc. 
               angleEnd - The HyperLine will be drawn from angleBegin to angleEnd. 
          
            Returns: 
          
               A Boolean instance describing the sense for drawing the HyperLine. 
          */
          function sense(angleBegin, angleEnd) {
            return (angleBegin < angleEnd) ? ((angleBegin + Math.PI > angleEnd) ? false
                : true)
                : ((angleEnd + Math.PI > angleBegin) ? true : false);
          }
        }
      });

})($jit.Hypertree);


/*
 * File: RGraph.js
 * 
 * Implements the <RGraph> class and other derived classes.
 *
 * Description:
 *
 * A radial layout of a tree puts the root node on the center of the canvas, places its children on the first concentric ring away from the root node, its grandchildren on a second concentric ring, and so on...
 *
 * Ka-Ping Yee, Danyel Fisher, Rachna Dhamija and Marti Hearst introduced a very interesting paper called "Animated Exploration of Dynamic Graphs with Radial Layout". In this paper they describe a way to animate a radial layout of a tree with ease-in and ease-out transitions, which make transitions from a graph's state to another easier to understand for the viewer.
 *
 * Inspired by:
 *
 * Animated Exploration of Dynamic Graphs with Radial Layout (Ka-Ping Yee, Danyel Fisher, Rachna Dhamija, Marti Hearst)
 *
 * <http://bailando.sims.berkeley.edu/papers/infovis01.htm>
 *
 * Disclaimer:
 *
 * This visualization was built from scratch, taking only the paper as inspiration, and only shares some features with this paper.
 *
 * 
 */

/*
   Class: RGraph
      
     The main RGraph class

     Extends:

     <Loader>, <Layouts.Radial>

     Parameters:

     canvas - A <Canvas> Class
     config - A configuration/controller object.

     Configuration:
    
     The configuration object can have the following properties (all properties are optional and have a default value)
     
     *General*

     - _interpolation_ Interpolation type used for animations. Possible options are 'polar' and 'linear'. Default's 'linear'.
     - _levelDistance_ Distance between a parent node and its children. Default's 100.
     - _withLabels_ Whether the visualization should use/create labels or not. Default's *true*.

     *Node*
     
     Customize the visualization nodes' shape, color, and other style properties.

     Inherits options from <Options.Graph.Node>.

     *Edge*

     Customize the visualization edges' shape, color, and other style properties.

     Inherits Options from <Options.Graph.Edge>.
      
    *Animations*

    Inherits from <Options.Animation>.
     
    *Controller options*

    Inherits from <Options.Controller>.
    
    Instance Properties:

    - _graph_ Access a <Graph> instance.
    - _op_ Access a <RGraph.Op> instance.
    - _fx_ Access a <RGraph.Plot> instance.
    - _labels_ Access a <RGraph.Label> interface implementation.

    Example:

    Here goes a complete example. In most cases you won't be forced to implement all properties and methods. In fact, 
    all configuration properties  have the default value assigned.

    I won't be instantiating a <Canvas> class here. If you want to know more about instantiating a <Canvas> class 
    please take a look at the <Canvas> class documentation.

    (start code js)
      var rgraph = new RGraph(canvas, {
        interpolation: 'linear',
        levelDistance: 100,
        withLabels: true,
        Node: {
          overridable: false,
          type: 'circle',
          color: '#ccb',
          lineWidth: 1,
          height: 5,
          width: 5,
          dim: 3
        },
        Edge: {
          overridable: false,
          type: 'line',
          color: '#ccb',
          lineWidth: 1
        },
        duration: 2500,
        fps: 40,
        transition: Trans.Quart.easeInOut,
        clearCanvas: true,
        onBeforeCompute: function(node) {
          //do something onBeforeCompute
        },
        onAfterCompute:  function () {
          //do something onAfterCompute
        },
        onCreateLabel:   function(domElement, node) {
          //do something onCreateLabel
        },
        onPlaceLabel:    function(domElement, node) {
          //do something onPlaceLabel
        },
        onBeforePlotNode:function(node) {
          //do something onBeforePlotNode
        },
        onAfterPlotNode: function(node) {
          //do something onAfterPlotNode
        },
        onBeforePlotLine:function(adj) {
          //do something onBeforePlotLine
        },
        onAfterPlotLine: function(adj) {
          //do something onAfterPlotLine
        }
      });
    (end code)

*/

$jit.RGraph = new Class( {

  Implements: [
      Loader, Extras, Layouts.Radial
  ],

  initialize: function(controller){
    var $RGraph = $jit.RGraph;

    var config = {
      interpolation: 'linear',
      levelDistance: 100,
      withLabels: true
    };

    this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
        "Fx", "Controller", "Tips", "NodeStyles"), config, controller);

    var canvasConfig = this.config;
    if(canvasConfig.useCanvas) {
      this.canvas = canvasConfig.useCanvas;
      this.config.labelContainer = this.canvas.id + '-label';
    } else {
      this.canvas = new Canvas(canvasConfig);
      this.config.labelContainer = canvasConfig.injectInto + '-label';
    }

    this.graphOptions = {
      'complex': false,
      'Node': {
        'selected': false,
        'exist': true,
        'drawn': true
      }
    };
    this.graph = new Graph(this.graphOptions, this.config.Node,
        this.config.Edge);
    this.labels = new $RGraph.Label[canvasConfig.labels](this);
    this.fx = new $RGraph.Plot(this);
    this.op = new $RGraph.Op(this);
    this.json = null;
    this.root = null;
    this.busy = false;
    this.parent = false;
    // initialize extras
    this.initializeExtras();
  },

  /* 
  
    Method: createLevelDistanceFunc 
  
    Returns the levelDistance function used for calculating a node distance 
    to its origin. This function returns a function that is computed 
    per level and not per node, such that all nodes with the same depth will have the 
    same distance to the origin. The resulting function gets the 
    parent node as parameter and returns a float.

   */
  createLevelDistanceFunc: function(){
    var ld = this.config.levelDistance;
    return function(elem){
      return (elem._depth + 1) * ld;
    };
  },

  /* 
     Method: refresh 
     
     Computes nodes' positions and replots the tree.

   */
  refresh: function(){
    this.compute();
    this.plot();
  },

  /*
   Method: reposition
  
   An alias for computing new positions to _endPos_

   See also:

   <RGraph.compute>
   
  */
  reposition: function(){
    this.compute('end');
  },

  /*
   Method: plot
  
   Plots the RGraph
  */
  plot: function(){
    this.fx.plot();
  },
  /*
   getNodeAndParentAngle
  
   Returns the _parent_ of the given node, also calculating its angle span.
  */
  getNodeAndParentAngle: function(id){
    var theta = false;
    var n = this.graph.getNode(id);
    var ps = Graph.Util.getParents(n);
    var p = (ps.length > 0)? ps[0] : false;
    if (p) {
      var posParent = p.pos.getc(), posChild = n.pos.getc();
      var newPos = posParent.add(posChild.scale(-1));
      theta = Math.atan2(newPos.y, newPos.x);
      if (theta < 0)
        theta += 2 * Math.PI;
    }
    return {
      parent: p,
      theta: theta
    };
  },

  /*
   tagChildren
  
   Enumerates the children in order to mantain child ordering (second constraint of the paper).
  */
  tagChildren: function(par, id){
    if (par.angleSpan) {
      var adjs = [];
      Graph.Util.eachAdjacency(par, function(elem){
        adjs.push(elem.nodeTo);
      }, "ignore");
      var len = adjs.length;
      for ( var i = 0; i < len && id != adjs[i].id; i++)
        ;
      for ( var j = (i + 1) % len, k = 0; id != adjs[j].id; j = (j + 1) % len) {
        adjs[j].dist = k++;
      }
    }
  },

  /* 
  Method: onClick 
  
  Performs all calculations and animations to center the node specified by _id_.

  Parameters:

  id - A <Graph.Node> id.
  opt - _optional_ An object containing some extra properties like

  - _hideLabels_ Hide labels when performing the animation. Default's *true*.

  Example:

  (start code js)
    rgraph.onClick('someid');
    //or also...
    rgraph.onClick('someid', {
     hideLabels: false
    });
   (end code)
   
  */
  onClick: function(id, opt){
    if (this.root != id && !this.busy) {
      this.busy = true;
      this.root = id;
      that = this;
      this.controller.onBeforeCompute(this.graph.getNode(id));
      var obj = this.getNodeAndParentAngle(id);

      // second constraint
      this.tagChildren(obj.parent, id);
      this.parent = obj.parent;
      this.compute('end');

      // first constraint
      var thetaDiff = obj.theta - obj.parent.endPos.theta;
      Graph.Util.eachNode(this.graph, function(elem){
        elem.endPos.set(elem.endPos.getp().add($P(thetaDiff, 0)));
      });

      var mode = this.config.interpolation;
      opt = $.merge( {
        onComplete: $.empty
      }, opt || {});

      this.fx.animate($.merge( {
        hideLabels: true,
        modes: [
          mode
        ]
      }, opt, {
        onComplete: function(){
          that.busy = false;
          opt.onComplete();
        }
      }));
    }
  }
});

$jit.RGraph.$extend = true;

(function(RGraph){

  /*
     Class: RGraph.Op

     Performs advanced operations on trees and graphs.

     Extends:

     All <Graph.Op> methods

     Access:

     This instance can be accessed with the _op_ parameter of the <RGraph> instance created.

     Example:

     (start code js)
      var rgraph = new RGraph(canvas, config);
      rgraph.op.morph //or can also call any other <Graph.Op> method
     (end code)
     
  */
  RGraph.Op = new Class( {

    Implements: Graph.Op,

    initialize: function(viz){
      this.viz = viz;
    }
  });

  /*
     Class: RGraph.Plot

     Performs plotting operations.

     Extends:

     All <Graph.Plot> methods

     Access:

     This instance can be accessed with the _fx_ parameter of the <RGraph> instance created.

     Example:

     (start code js)
      var rgraph = new RGraph(canvas, config);
      rgraph.fx.placeLabel //or can also call any other <RGraph.Plot> method
     (end code)

  */
  RGraph.Plot = new Class( {

    Implements: Graph.Plot,

    initialize: function(viz){
      this.viz = viz;
      this.config = viz.config;
      this.node = viz.config.Node;
      this.edge = viz.config.Edge;
      this.animation = new Animation;
      this.nodeTypes = new RGraph.Plot.NodeTypes;
      this.edgeTypes = new RGraph.Plot.EdgeTypes;
      this.labels = viz.labels;
    }
  });

  /*
    Object: RGraph.Label

    Label interface implementation for the RGraph

    See Also:

    <Graph.Label>, <RGraph.Label.HTML>, <RGraph.Label.SVG>

   */
  RGraph.Label = {};

  /*
     Class: RGraph.Label.Native

     Implements labels natively, using the Canvas text API.

     Extends:

     <Graph.Label.Native>

     See also:

     <Hypertree.Label>, <RGraph.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

  */
  RGraph.Label.Native = new Class( {
    Implements: Graph.Label.Native
  });

  /*
     Class: RGraph.Label.SVG

     Implements labels using SVG (currently not supported in IE).

     Extends:

     <Graph.Label.SVG>

     See also:

     <Hypertree.Label>, <RGraph.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

  */
  RGraph.Label.SVG = new Class( {
    Implements: Graph.Label.SVG,

    initialize: function(viz){
      this.viz = viz;
    },

    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller){
      var pos = node.pos.getc(true), canvas = this.viz.canvas;
      var radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x + radius.width / 2),
        y: Math.round(pos.y + radius.height / 2)
      };
      tag.setAttribute('x', labelPos.x);
      tag.setAttribute('y', labelPos.y);

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
     Class: RGraph.Label.HTML

     Implements labels using plain old HTML.

     Extends:

     <Graph.Label.HTML>

     See also:

     <Hypertree.Label>, <RGraph.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

  */
  RGraph.Label.HTML = new Class( {
    Implements: Graph.Label.HTML,

    initialize: function(viz){
      this.viz = viz;
    },
    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller){
      var pos = node.pos.getc(true), canvas = this.viz.canvas;
      var radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x + radius.width / 2),
        y: Math.round(pos.y + radius.height / 2)
      };

      var style = tag.style;
      style.left = labelPos.x + 'px';
      style.top = labelPos.y + 'px';
      style.display = this.fitsInCanvas(labelPos, canvas)? '' : 'none';

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
    Class: RGraph.Plot.NodeTypes

    Here are implemented all kinds of node rendering functions. 
    Rendering functions implemented are 'none', 'circle', 'triangle', 'rectangle', 'star' and 'square'.

    You can add new Node types by implementing a new method in this class

    Example:

    (start code js)
      RGraph.Plot.NodeTypes.implement({
        'newnodetypename': function(node, canvas) {
          //Render my node here.
        }
      });
    (end code)

  */
  RGraph.Plot.NodeTypes = new Class(
      {
        'circle': {
          'render': function(node, canvas){
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim') / 2;
            canvas.path('fill', function(context){
              context.arc(pos.x, pos.y, nodeDim, 0, Math.PI * 2, true);
            });
          },
          'contains': $.lambda(false)
        },

        'ellipse': {
          'render': function(node, canvas){
            var pos = node.pos.getc(true);
            var width = node.getData('width') / 2;
            var height = node.getData('height') / 2;
            var ctx = canvas.getCtx();
            ctx.save();
            ctx.scale(width / height, height / width);
            canvas.path('fill', function(context){
              context.arc(pos.x * (height / width), pos.y * (width / height),
                  height, 0, Math.PI * 2, true);
            });
            ctx.restore();
          },
          'contains': $.lambda(false)
        },

        'square': {
          'render': function(node, canvas){
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim');
            var nodeDim2 = 2 * nodeDim;
            canvas.getCtx().fillRect(pos.x - nodeDim, pos.y - nodeDim,
                nodeDim2, nodeDim2);
          },
          'contains': $.lambda(false)
        },

        'rectangle': {
          'render': function(node, canvas){
            var pos = node.pos.getc(true);
            var width = node.getData('width');
            var height = node.getData('height');
            canvas.getCtx().fillRect(pos.x - width / 2, pos.y - height / 2,
                width, height);
          },
          'contains': $.lambda(false)
        },

        'triangle': {
          'render': function(node, canvas){
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim');
            var c1x = pos.x, c1y = pos.y - nodeDim, c2x = c1x - nodeDim, c2y = pos.y
                + nodeDim, c3x = c1x + nodeDim, c3y = c2y;
            canvas.path('fill', function(ctx){
              ctx.moveTo(c1x, c1y);
              ctx.lineTo(c2x, c2y);
              ctx.lineTo(c3x, c3y);
            });
          },
          'contains': $.lambda(false)
        },

        'star': {
          'render': function(node, canvas){
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim');
            var ctx = canvas.getCtx(), pi5 = Math.PI / 5;
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.beginPath();
            ctx.moveTo(nodeDim, 0);
            for ( var i = 0; i < 9; i++) {
              ctx.rotate(pi5);
              if (i % 2 == 0) {
                ctx.lineTo((nodeDim / 0.525731) * 0.200811, 0);
              } else {
                ctx.lineTo(nodeDim, 0);
              }
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          },
          'contains': $.lambda(false)
        }
      });

  /*
    Class: RGraph.Plot.EdgeTypes

    Here are implemented all kinds of edge rendering functions. 
    Rendering functions implemented are 'none', 'line' and 'arrow'.

    You can add new Edge types by implementing a new method in this class

    Example:

    (start code js)
      RGraph.Plot.EdgeTypes.implement({
        'newedgetypename': function(adj, canvas) {
          //Render my edge here.
        }
      });
    (end code)

  */
  RGraph.Plot.EdgeTypes = new Class( {
    'none': $.empty,

    'line': function(adj, canvas){
      var pos = adj.nodeFrom.pos.getc(true);
      var posChild = adj.nodeTo.pos.getc(true);
      canvas.path('stroke', function(context){
        context.moveTo(pos.x, pos.y);
        context.lineTo(posChild.x, posChild.y);
      });
    },

    'arrow': function(adj, canvas){
      var node = adj.nodeFrom, child = adj.nodeTo;
      var data = adj.data, econfig = this.edge;
      // get edge dim
    var cond = econfig.overridable;
    var edgeDim = adj.getData('dim');
    // get edge direction
    if (cond && data.$direction && data.$direction.length > 1) {
      var nodeHash = {};
      nodeHash[node.id] = node;
      nodeHash[child.id] = child;
      var sense = data.$direction;
      node = nodeHash[sense[0]];
      child = nodeHash[sense[1]];
    }
    var posFrom = node.pos.getc(true), posTo = child.pos.getc(true);
    var vect = new Complex(posTo.x - posFrom.x, posTo.y - posFrom.y);
    vect.$scale(edgeDim / vect.norm());
    var intermediatePoint = new Complex(posTo.x - vect.x, posTo.y - vect.y);
    var normal = new Complex(-vect.y / 2, vect.x / 2);
    var v1 = intermediatePoint.add(normal), v2 = intermediatePoint.$add(normal
        .$scale(-1));
    canvas.path('stroke', function(context){
      context.moveTo(posFrom.x, posFrom.y);
      context.lineTo(posTo.x, posTo.y);
    });
    canvas.path('fill', function(context){
      context.moveTo(v1.x, v1.y);
      context.lineTo(v2.x, v2.y);
      context.lineTo(posTo.x, posTo.y);
    });
  }
  });

})($jit.RGraph);


/*
 * Class: Layouts.ForceDirected
 * 
 * Implements a Force Directed Layout.
 * 
 * Implemented By:
 * 
 * <ForceDirected>
 * 
 * Credits:
 * 
 * Marcus Cobden <http://marcuscobden.co.uk>
 * 
 */
Layouts.ForceDirected = new Class({

  getOptions: function(random) {
    var s = this.canvas.getSize();
    var w = s.width, h = s.height;
    //count nodes
    var count = 0;
    Graph.Util.eachNode(this.graph, function(n) { 
      count++;
    });
    var k2 = w * h / count, k = Math.sqrt(k2);
    var l = this.config.levelDistance;
    
    return {
      width: w,
      height: h,
      tstart: w * 0.1,
      nodef: function(x) { return k2 / (x || 1); },
      edgef: function(x) { return /* x * x / k; */ k * (x - l); }
    };
  },
  
  compute: function(property, incremental) {
    var prop = $.splat(property || ['current', 'start', 'end']);
    var opt = this.getOptions();
    NodeDim.compute(this.graph, prop, this.config);
    Graph.Util.computeLevels(this.graph, this.root, 0, "ignore");
    Graph.Util.eachNode(this.graph, function(n) {
      $.each(prop, function(p) {
        var pos = n.getPos(p);
        if(pos.equals(Complex.KER)) {
          pos.x = opt.width/5 * (Math.random() - 0.5);
          pos.y = opt.height/5 * (Math.random() - 0.5);
        }
        //initialize disp vector
        n.disp = {};
        $.each(prop, function(p) {
          n.disp[p] = $C(0, 0);
        });
      });
    });
    this.computePositions(prop, opt, incremental);
  },
  
  computePositions: function(property, opt, incremental) {
    var times = this.config.iterations, i = 0, that = this;
    if(incremental) {
      (function iter() {
        for(var total=incremental.iter, j=0; j<total; j++) {
          opt.t = opt.tstart * (1 - i++/(times -1));
          that.computePositionStep(property, opt);
          if(i >= times) {
            incremental.onComplete();
            return;
          }
        }
        incremental.onStep(Math.round(i / (times -1) * 100));
        setTimeout(iter, 1);
      })();
    } else {
      for(; i < times; i++) {
        opt.t = opt.tstart * (1 - i/(times -1));
        this.computePositionStep(property, opt);
      }
    }
  },
  
  computePositionStep: function(property, opt) {
    var graph = this.graph, GUtil = Graph.Util;
    var min = Math.min, max = Math.max;
    var dpos = $C(0, 0);
    //calculate repulsive forces
    GUtil.eachNode(graph, function(v) {
      //initialize disp
      $.each(property, function(p) {
        v.disp[p].x = 0; v.disp[p].y = 0;
      });
      GUtil.eachNode(graph, function(u) {
        if(u.id != v.id) {
          $.each(property, function(p) {
            var vp = v.getPos(p), up = u.getPos(p);
            dpos.x = vp.x - up.x;
            dpos.y = vp.y - up.y;
            var norm = dpos.norm() || 1;
            v.disp[p].$add(dpos
                .$scale(opt.nodef(norm) / norm));
          });
        }
      });
    });
    //calculate attractive forces
    var T = !!graph.getNode(this.root).visited;
    GUtil.eachNode(graph, function(node) {
      GUtil.eachAdjacency(node, function(adj) {
        var nodeTo = adj.nodeTo;
        if(!!nodeTo.visited === T) {
          $.each(property, function(p) {
            var vp = node.getPos(p), up = nodeTo.getPos(p);
            dpos.x = vp.x - up.x;
            dpos.y = vp.y - up.y;
            var norm = dpos.norm() || 1;
            node.disp[p].$add(dpos.$scale(-opt.edgef(norm) / norm));
            nodeTo.disp[p].$add(dpos.$scale(-1));
          });
        }
      });
      node.visited = !T;
    });
    //arrange positions to fit the canvas
    var t = opt.t, w2 = opt.width / 2, h2 = opt.height / 2;
    GUtil.eachNode(graph, function(u) {
      $.each(property, function(p) {
        var disp = u.disp[p];
        var norm = disp.norm() || 1;
        var p = u.getPos(p);
        p.$add($C(disp.x * min(Math.abs(disp.x), t) / norm, 
            disp.y * min(Math.abs(disp.y), t) / norm));
        p.x = min(w2, max(-w2, p.x));
        p.y = min(h2, max(-h2, p.y));
      });
    });
  }
});

/*
 * File: ForceDirected.js
 * 
 * Implements the <ForceDirected> class and other derived classes.
 *
 * Description:
 *
 *
 * Inspired by:
 *
 * Disclaimer:
 *
 * This visualization was built from scratch, taking only the paper as inspiration, and only shares some features with this paper.
 *
 * 
 */

/*
   Class: ForceDirected
      
     The main ForceDirected class

     Extends:

     <Loader>, <Tips>, <NodeStyles>, <Layouts.ForceDirected>

     Parameters:

     canvas - A <Canvas> Class
     config - A configuration/controller object.

     Configuration:
    
     The configuration object can have the following properties (all properties are optional and have a default value)
     
     *General*

     - _naturalLength_ Natural Length
     - _restoringForce_ Restoring Force 
     - _withLabels_ Whether the visualization should use/create labels or not. Default's *true*.

     *Node*
     
     Customize the visualization nodes' shape, color, and other style properties.

     Inherits options from <Options.Graph.Node>.

     *Edge*

     Customize the visualization edges' shape, color, and other style properties.

     Inherits Options from <Options.Graph.Edge>.
      
    *Animations*

    Inherits from <Options.Animation>.
     
    *Controller options*

    Inherits from <Options.Controller>.
    
    Instance Properties:

    - _graph_ Access a <Graph> instance.
    - _op_ Access a <ForceDirected.Op> instance.
    - _fx_ Access a <ForceDirected.Plot> instance.
    - _labels_ Access a <ForceDirected.Label> interface implementation.

    Example:

    Here goes a complete example. In most cases you won't be forced to implement all properties and methods. In fact, 
    all configuration properties  have the default value assigned.

    I won't be instantiating a <Canvas> class here. If you want to know more about instantiating a <Canvas> class 
    please take a look at the <Canvas> class documentation.

    (start code js)
      var fd = new ForceDirected(canvas, {
        naturalLength: 75,
        restoringForce: 2,
        withLabels: true,
        Node: {
          overridable: false,
          type: 'circle',
          color: '#ccb',
          lineWidth: 1,
          height: 5,
          width: 5,
          dim: 3
        },
        Edge: {
          overridable: false,
          type: 'line',
          color: '#ccb',
          lineWidth: 1
        },
        duration: 2500,
        fps: 40,
        transition: Trans.Quart.easeInOut,
        clearCanvas: true,
        onBeforeCompute: function(node) {
          //do something onBeforeCompute
        },
        onAfterCompute:  function () {
          //do something onAfterCompute
        },
        onCreateLabel:   function(domElement, node) {
          //do something onCreateLabel
        },
        onPlaceLabel:    function(domElement, node) {
          //do something onPlaceLabel
        },
        onBeforePlotNode:function(node) {
          //do something onBeforePlotNode
        },
        onAfterPlotNode: function(node) {
          //do something onAfterPlotNode
        },
        onBeforePlotLine:function(adj) {
          //do something onBeforePlotLine
        },
        onAfterPlotLine: function(adj) {
          //do something onAfterPlotLine
        }
      });
    (end code)

*/

$jit.ForceDirected = new Class( {

  Implements: [ Loader, Extras, Layouts.ForceDirected ],

  initialize: function(controller) {
    var $ForceDirected = $jit.ForceDirected;

    var config = {
      withLabels: true,
      iterations: 50,
      levelDistance: 50
    };

    this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
        "Fx", "Tips", "NodeStyles", "Controller"), config, controller);

    var canvasConfig = this.config;
    if(canvasConfig.useCanvas) {
      this.canvas = canvasConfig.useCanvas;
      this.config.labelContainer = this.canvas.id + '-label';
    } else {
      this.canvas = new Canvas(canvasConfig);
      this.config.labelContainer = canvasConfig.injectInto + '-label';
    }

    this.graphOptions = {
      'complex': true,
      'Node': {
        'selected': false,
        'exist': true,
        'drawn': true
      }
    };
    this.graph = new Graph(this.graphOptions, this.config.Node,
        this.config.Edge);
    this.labels = new $ForceDirected.Label[canvasConfig.labels](this);
    this.fx = new $ForceDirected.Plot(this);
    this.op = new $ForceDirected.Op(this);
    this.json = null;
    this.busy = false;
    // initialize extras
    this.initializeExtras();
  },

  /* 
    Method: refresh 
    
    Computes nodes' positions and replots the tree.

  */
  refresh: function() {
    this.compute();
    this.plot();
  },

  /*
   Method: reposition
  
   An alias for computing new positions to _endPos_

   See also:

   <ForceDirected.compute>
   
  */
  reposition: function() {
    this.compute('end');
  },

  /*
  Method: computeIncremental
  
  Perform the <Layout.ForceDirected.compute> method incrementally.
  
  Description:
  
  ForceDirected algorithms can perform many computations and lead to JavaScript taking too much time to complete. 
  This method splits the algorithm into "small parts" allowing the user to track the evolution of the algorithm and 
  avoiding browser messages such as "This script is taking too long to complete".
  
  Parameters:
  
  opt - An Options object containing as properties
  
  _iter_ - Split the algorithm into pieces of _iter_ iterations. For example, if the _iterations_ configuration property 
  of your <ForceDirected> class is 100, then you could set _iter_ to 20 to split the main algorithm into 5 smaller pieces. 
  Default's 20. 
  
  _property_ - Possible values are 'end', 'start', 'current'. You can also set an array of these properties. if you'd like to 
  keep the current node positions but to perform these computations for final animation positions then you can just choose 'end'. 
  Default's 'end'.
  
  _onStep_ - A callback function called when each "small part" of the algorithm completed. This function gets as first formal 
  parameter a percentage value.
  
  _onComplete_ - A callback function called when the algorithm completed.
  
  Example:
  
  In this example I calculate the end positions and then animate the graph to those positions
  
  (start code js)
  var fd = new ForceDirected(...);
  fd.computeIncremental({
    iter: 20,
    property: 'end',
    onStep: function(perc) {
      Log.write("loading " + perc + "%");
    },
    onComplete: function() {
      Log.write("done");
      fd.animate();
    }
  });
  (end code)
  
  In this example I calculate all positions and (re)plot the graph
  
  (start code js)
  var fd = new ForceDirected(...);
  fd.computeIncremental({
    iter: 20,
    property: ['end', 'start', 'current'],
    onStep: function(perc) {
      Log.write("loading " + perc + "%");
    },
    onComplete: function() {
      Log.write("done");
      fd.plot();
    }
  });
  (end code)
  
  See also:

  <Layouts.ForceDirected.compute>
  
  */
  computeIncremental: function(opt) {
    opt = $.merge( {
      iter: 20,
      property: 'end',
      onStep: $.empty,
      onComplete: $.empty
    }, opt || {});

    this.config.onBeforeCompute(this.graph.getNode(this.root));
    this.compute(opt.property, opt);
  },

  /*
    Method: plot
   
    Plots the ForceDirected
   */
  plot: function() {
    this.fx.plot();
  },

  /*
     Method: animate
    
     Animates the graph to the end positions specified.
  */
  animate: function(opt) {
    this.fx.animate($.merge( {
      modes: [ 'linear' ]
    }, opt || {}));
  }
});

$jit.ForceDirected.$extend = true;

(function(ForceDirected) {

  /*
     Class: ForceDirected.Op

     Performs advanced operations on trees and graphs.

     Extends:

     All <Graph.Op> methods

     Access:

     This instance can be accessed with the _op_ parameter of the <ForceDirected> instance created.

     Example:

     (start code js)
      var fd = new ForceDirected(canvas, config);
      fd.op.morph //or can also call any other <Graph.Op> method
     (end code)
     
  */
  ForceDirected.Op = new Class( {

    Implements: Graph.Op,

    initialize: function(viz) {
      this.viz = viz;
    }
  });

  /*
     Class: ForceDirected.Plot

     Performs plotting operations.

     Extends:

     All <Graph.Plot> methods

     Access:

     This instance can be accessed with the _fx_ parameter of the <ForceDirected> instance created.

     Example:

     (start code js)
      var fd = new ForceDirected(canvas, config);
      fd.fx.plot //or can also call any other <ForceDirected.Plot> method
     (end code)

  */
  ForceDirected.Plot = new Class( {

    Implements: Graph.Plot,

    initialize: function(viz) {
      this.viz = viz;
      this.config = viz.config;
      this.node = viz.config.Node;
      this.edge = viz.config.Edge;
      this.animation = new Animation;
      this.nodeTypes = new ForceDirected.Plot.NodeTypes;
      this.edgeTypes = new ForceDirected.Plot.EdgeTypes;
      this.labels = viz.labels;
    }
  });

  /*
    Object: ForceDirected.Label

    Label interface implementation for the ForceDirected

    See Also:

    <Graph.Label>, <ForceDirected.Label.HTML>, <ForceDirected.Label.SVG>

   */
  ForceDirected.Label = {};

  /*
     Class: ForceDirected.Label.Native

     Implements labels natively, using the Canvas text API.

     Extends:

     <Graph.Label.Native>

     See also:

     <Hypertree.Label>, <ForceDirected.Label>, <ST.Label>, <Hypertree>, <ForceDirected>, <ST>, <Graph>.

  */
  ForceDirected.Label.Native = new Class( {
    Implements: Graph.Label.Native
  });

  /*
     Class: ForceDirected.Label.SVG

     Implements labels using SVG (currently not supported in IE).

     Extends:

     <Graph.Label.SVG>

     See also:

     <Hypertree.Label>, <ForceDirected.Label>, <ST.Label>, <Hypertree>, <ForceDirected>, <ST>, <Graph>.

  */
  ForceDirected.Label.SVG = new Class( {
    Implements: Graph.Label.SVG,

    initialize: function(viz) {
      this.viz = viz;
    },

    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), canvas = this.viz.canvas;
      var radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x + radius.width / 2),
        y: Math.round(pos.y + radius.height / 2)
      };
      tag.setAttribute('x', labelPos.x);
      tag.setAttribute('y', labelPos.y);

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
     Class: ForceDirected.Label.HTML

     Implements labels using plain old HTML.

     Extends:

     <Graph.Label.HTML>

     See also:

     <Hypertree.Label>, <ForceDirected.Label>, <ST.Label>, <Hypertree>, <ForceDirected>, <ST>, <Graph>.

  */
  ForceDirected.Label.HTML = new Class( {
    Implements: Graph.Label.HTML,

    initialize: function(viz) {
      this.viz = viz;
    },
    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), canvas = this.viz.canvas;
      var radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x + radius.width / 2),
        y: Math.round(pos.y + radius.height / 2)
      };

      var style = tag.style;
      style.left = labelPos.x + 'px';
      style.top = labelPos.y + 'px';
      style.display = this.fitsInCanvas(labelPos, canvas) ? '' : 'none';

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
    Class: ForceDirected.Plot.NodeTypes

    Here are implemented all kinds of node rendering functions. 
    Rendering functions implemented are 'none', 'circle', 'triangle', 'rectangle', 'star' and 'square'.

    You can add new Node types by implementing a new method in this class

    Example:

    (start code js)
      ForceDirected.Plot.NodeTypes.implement({
        'newnodetypename': function(node, canvas) {
          //Render my node here.
        }
      });
    (end code)

  */
  ForceDirected.Plot.NodeTypes = new Class(
      {
        'none': {
          'render': $.empty,
          'contains': $.lambda(false)
        },

        'circle': {
          'render': function(node, canvas) {
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim');
            canvas.path('fill', function(context) {
              context.arc(pos.x, pos.y, nodeDim, 0, Math.PI * 2, true);
            });
          },
          'contains': $.lambda(false)
        },

        'square': {
          'render': function(node, canvas) {
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim');
            var nodeDim2 = 2 * nodeDim;
            canvas.getCtx().fillRect(pos.x - nodeDim, pos.y - nodeDim,
                nodeDim2, nodeDim2);
          },
          'contains': $.lambda(false)
        },

        'rectangle': {
          'render': function(node, canvas) {
            var pos = node.pos.getc(true);
            var width = node.getData('width');
            var height = node.getData('height');
            canvas.getCtx().fillRect(pos.x - width / 2, pos.y - height / 2,
                width, height);
          },
          'contains': $.lambda(false)
        },

        'triangle': {
          'render': function(node, canvas) {
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim');
            var c1x = pos.x, c1y = pos.y - nodeDim, c2x = c1x - nodeDim, c2y = pos.y
                + nodeDim, c3x = c1x + nodeDim, c3y = c2y;
            canvas.path('fill', function(ctx) {
              ctx.moveTo(c1x, c1y);
              ctx.lineTo(c2x, c2y);
              ctx.lineTo(c3x, c3y);
            });
          },
          'contains': $.lambda(false)
        },

        'star': {
          'render': function(node, canvas) {
            var pos = node.pos.getc(true);
            var nodeDim = node.getData('dim');
            var ctx = canvas.getCtx(), pi5 = Math.PI / 5;
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.beginPath();
            ctx.moveTo(nodeDim, 0);
            for ( var i = 0; i < 9; i++) {
              ctx.rotate(pi5);
              if (i % 2 == 0) {
                ctx.lineTo((nodeDim / 0.525731) * 0.200811, 0);
              } else {
                ctx.lineTo(nodeDim, 0);
              }
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          },
          'contains': $.lambda(false)
        }
      });

  /*
    Class: ForceDirected.Plot.EdgeTypes

    Here are implemented all kinds of edge rendering functions. 
    Rendering functions implemented are 'none', 'line' and 'arrow'.

    You can add new Edge types by implementing a new method in this class

    Example:

    (start code js)
      ForceDirected.Plot.EdgeTypes.implement({
        'newedgetypename': function(adj, canvas) {
          //Render my edge here.
        }
      });
    (end code)

  */
  ForceDirected.Plot.EdgeTypes = new Class( {
    'none': $.empty,

    'line': function(adj, canvas) {
      var pos = adj.nodeFrom.pos.getc(true);
      var posChild = adj.nodeTo.pos.getc(true);
      canvas.path('stroke', function(context) {
        context.moveTo(pos.x, pos.y);
        context.lineTo(posChild.x, posChild.y);
      });
    },

    'arrow': function(adj, canvas) {
      var node = adj.nodeFrom, child = adj.nodeTo;
      var data = adj.data, econfig = this.edge;
      // get edge dim
      var cond = econfig.overridable;
      var edgeDim = adj.getData('dim');
      // get edge direction
      if (cond && data.$direction && data.$direction.length > 1) {
        var nodeHash = {};
        nodeHash[node.id] = node;
        nodeHash[child.id] = child;
        var sense = data.$direction;
        node = nodeHash[sense[0]];
        child = nodeHash[sense[1]];
      }
      var posFrom = node.pos.getc(true), posTo = child.pos.getc(true);
      var vect = new Complex(posTo.x - posFrom.x, posTo.y - posFrom.y);
      vect.$scale(edgeDim / vect.norm());
      var intermediatePoint = new Complex(posTo.x - vect.x, posTo.y - vect.y);
      var normal = new Complex(-vect.y / 2, vect.x / 2);
      var v1 = intermediatePoint.add(normal), v2 = intermediatePoint.
        $add(normal.$scale(-1));
      canvas.path('stroke', function(context) {
        context.moveTo(posFrom.x, posFrom.y);
        context.lineTo(posTo.x, posTo.y);
      });
      canvas.path('fill', function(context) {
        context.moveTo(v1.x, v1.y);
        context.lineTo(v2.x, v2.y);
        context.lineTo(posTo.x, posTo.y);
      });
    }
  });

})($jit.ForceDirected);


/*
  Object: Options.Tree
  
  Options related to (classic) Tree layout algorithms.
  
  Description:
  
  Options related to classic Tree layouts.
  
  Implemented by:
  
  <ST>
  
  
     - _subtreeOffset_ Separation offset between subtrees. Default's 8.
     - _siblingOffset_ Separation offset between siblings. Default's 5.
     - _orientation_ Sets the orientation layout. Implemented orientations are _left_ (the root node will be placed on the left side of the screen), _top_ (the root node will be placed on top of the screen), _bottom_ and _right_. Default's "left".
     - _align_ Whether the tree alignment is left, center or right.
     - _indent_ Used when _align_ is left or right and shows an indentation between parent and children. Default's 10.
     - _multitree_ Used with the a node $orn data property for creating multitrees.

*/
Options.Tree = {
    $extend: true,
    
    orientation: "left",
    subtreeOffset: 8,
    siblingOffset: 5,
    indent:10,
    multitree: false,
    align:"center"
};


/*
 * Class: Layouts.TM
 * 
 * Implements TreeMaps layouts (SliceAndDice, Squarified, Strip).
 * 
 * Implemented By:
 * 
 * <TM>
 * 
 */
Layouts.TM = {};

Layouts.TM.SliceAndDice = {
  compute: function(prop) {
    var root = this.graph.getNode(this.root);
    this.controller.onBeforeCompute(root);
    var size = this.canvas.getSize(),
        config = this.config,
        width = size.width,
        height = size.height;
    Graph.Util.computeLevels(this.graph, this.root, 0, "ignore");
    //set root position and dimensions
    root.getPos(prop).setc(-width/2, -height/2);
    root.setData('width', width, prop);
    root.setData('height', height + config.titleHeight, prop);
    this.computePositions(root, root, this.layout.orientation, prop, root.getData('area', prop));
    this.controller.onAfterCompute(root);
  },
  
  computePositions: function(par, ch, orn, prop, totalArea) {
    var config = this.config, GUtil = Graph.Util,
        offst = config.offset,
        width  = par.getData('width', prop),
        height = par.getData('height', prop) - config.titleHeight,
        fact = ch.getData('area', prop) / totalArea;
    
    //compute children areas
    totalArea = 0;
    GUtil.eachSubnode(ch, function(n) {
      totalArea += n.getData('area', prop);
    });
    
    var otherSize, size, dim, pos, pos2, posth, pos2th;
    var horizontal = (orn == "h");
    if(horizontal) {
      orn = 'v';    
      otherSize = height;
      size = width * fact;
      dim = 'height';
      pos = 'y';
      pos2 = 'x';
      posth = config.titleHeight;
      pos2th = 0;
    } else {
      orn = 'h';    
      otherSize = height * fact;
      size = width;
      dim = 'width';
      pos = 'x';
      pos2 = 'y';
      posth = 0;
      pos2th = config.titleHeight;
    }
    var cpos = ch.getPos(prop);
    ch.setData('width', size, prop);
    ch.setData('height', otherSize, prop);
    var offsetSize = 0, tm = this;
    GUtil.eachSubnode(ch, function(n) {
      var p = n.getPos(prop);
      p[pos] = offsetSize + cpos[pos] + posth;
      p[pos2] = cpos[pos2] + pos2th;
      tm.computePositions(ch, n, orn, prop, totalArea);
      offsetSize += n.getData(dim, prop);
    });
  }

};

Layouts.TM.Area = {
 /*
    Method: compute
 
   Called by loadJSON to calculate recursively all node positions and lay out the tree.
 
    Parameters:

       json - A JSON tree. See also <Loader.loadJSON>.
       coord - A coordinates object specifying width, height, left and top style properties.
 */
 compute: function(prop) {
    prop = prop || "current";
    var root = this.graph.getNode(this.root);
    this.controller.onBeforeCompute(root);
    var config = this.config,
        size = this.canvas.getSize(),
        width = size.width,
        height = size.height,
        offst = config.offset,
        offwdth = width - offst,
        offhght = height - offst;
    Graph.Util.computeLevels(this.graph, this.root, 0, "ignore");
    //set root position and dimensions
    root.getPos(prop).setc(-width/2, -height/2);
    root.setData('width', width, prop);
    root.setData('height', height, prop);
    //create a coordinates object
    var coord = {
        'top': -height/2 + config.titleHeight,
        'left': -width/2,
        'width': offwdth,
        'height': offhght - config.titleHeight
    };
    this.computePositions(root, coord, prop);
    this.controller.onAfterCompute(root);
 }, 
 
 /*
    Method: computeDim
 
   Computes dimensions and positions of a group of nodes
   according to a custom layout row condition. 
 
    Parameters:

       tail - An array of nodes.  
       initElem - An array of nodes (containing the initial node to be laid).
       w - A fixed dimension where nodes will be layed out.
       coord - A coordinates object specifying width, height, left and top style properties.
       comp - A custom comparison function
 */
 computeDim: function(tail, initElem, w, coord, comp, prop) {
   if(tail.length + initElem.length == 1) {
     var l = (tail.length == 1)? tail : initElem;
     this.layoutLast(l, w, coord, prop);
     return;
   }
   if(tail.length >= 2 && initElem.length == 0) {
     initElem = [tail.shift()];
   }
   if(tail.length == 0) {
     if(initElem.length > 0) this.layoutRow(initElem, w, coord, prop);
     return;
   }
   var c = tail[0];
   if(comp(initElem, w) >= comp([c].concat(initElem), w)) {
     this.computeDim(tail.slice(1), initElem.concat([c]), w, coord, comp, prop);
   } else {
     var newCoords = this.layoutRow(initElem, w, coord, prop);
     this.computeDim(tail, [], newCoords.dim, newCoords, comp, prop);
   }
 },

 
 /*
    Method: worstAspectRatio
 
   Calculates the worst aspect ratio of a group of rectangles. 
       
    See also:
       
       <http://en.wikipedia.org/wiki/Aspect_ratio>
   
    Parameters:

     ch - An array of nodes.  
     w  - The fixed dimension where rectangles are being laid out.

    Returns:
 
        The worst aspect ratio.


 */
 worstAspectRatio: function(ch, w) {
   if(!ch || ch.length == 0) return Number.MAX_VALUE;
   var areaSum = 0, maxArea = 0, minArea = Number.MAX_VALUE;
   for(var i=0, l=ch.length; i<l; i++) {
     var area = ch[i]._area;
     areaSum += area; 
     minArea = minArea < area? minArea : area;
     maxArea = maxArea > area? maxArea : area; 
   }
   var sqw = w * w, sqAreaSum = areaSum * areaSum;
   return Math.max(sqw * maxArea / sqAreaSum,
           sqAreaSum / (sqw * minArea));
 },
 
 /*
    Method: avgAspectRatio
 
   Calculates the average aspect ratio of a group of rectangles. 
       
       See also:
       
       <http://en.wikipedia.org/wiki/Aspect_ratio>
   
    Parameters:

     ch - An array of nodes.  
       w - The fixed dimension where rectangles are being laid out.

    Returns:
 
        The average aspect ratio.


 */
 avgAspectRatio: function(ch, w) {
   if(!ch || ch.length == 0) return Number.MAX_VALUE;
   var arSum = 0;
   for(var i=0, l=ch.length; i<l; i++) {
     var area = ch[i]._area;
     var h = area / w;
     arSum += w > h? w / h : h / w;
   }
   return arSum / l;
 },

 /*
    layoutLast
 
   Performs the layout of the last computed sibling.
 
    Parameters:

       ch - An array of nodes.  
       w - A fixed dimension where nodes will be layed out.
     coord - A coordinates object specifying width, height, left and top style properties.
 */
 layoutLast: function(ch, w, coord, prop) {
   var child = ch[0];
   child.getPos(prop).setc(coord.left, coord.top);
   child.setData('width', coord.width, prop);
   child.setData('height', coord.height, prop);
 }
};


Layouts.TM.Squarified = new Class({
 Implements: Layouts.TM.Area,
 
 computePositions: function(node, coord, prop) {
   var GUtil = Graph.Util, config = this.config;
   
   if (!(coord.width >= coord.height 
       && this.layout.horizontal())) 
     this.layout.change();
   
   var ch = GUtil.getSubnodes(node, [1, 1], "ignore");
   if(ch.length > 0) {
     this.processChildrenLayout(node, ch, coord, prop);
     for(var i=0, l=ch.length; i<l; i++) {
       var chi = ch[i]; 
       var offst = config.offset,
           height = chi.getData('height', prop) - offst - config.titleHeight,
           width = chi.getData('width', prop) - offst;
       var chipos = chi.getPos(prop);
       coord = {
         'width': width,
         'height': height,
         'top': chipos.y + config.titleHeight,
         'left': chipos.x
       };
       this.computePositions(chi, coord);
     }
   }
 },

 /*
    Method: processChildrenLayout
 
   Computes children real areas and other useful parameters for performing the Squarified algorithm.
 
    Parameters:

       par - The parent node of the json subtree.  
       ch - An Array of nodes
     coord - A coordinates object specifying width, height, left and top style properties.
 */
 processChildrenLayout: function(par, ch, coord, prop) {
   //compute children real areas
   var parentArea = coord.width * coord.height;
   var i, l=ch.length, totalChArea=0, chArea = [];
   for(i=0; i<l; i++) {
     chArea[i] = parseFloat(ch[i].getData('area', prop));
     totalChArea += chArea[i];
   }
   for(i=0; i<l; i++) {
     ch[i]._area = parentArea * chArea[i] / totalChArea;
   }
   var minimumSideValue = this.layout.horizontal()? coord.height : coord.width;
   ch.sort(function(a, b) { return (a._area <= b._area) - (a._area >= b._area); });
   var initElem = [ch[0]];
   var tail = ch.slice(1);
   this.squarify(tail, initElem, minimumSideValue, coord, prop);
 },

 /*
   Method: squarify
 
   Performs an heuristic method to calculate div elements sizes in order to have a good aspect ratio.
 
    Parameters:

       tail - An array of nodes.  
       initElem - An array of nodes, containing the initial node to be laid out.
       w - A fixed dimension where nodes will be laid out.
       coord - A coordinates object specifying width, height, left and top style properties.
 */
 squarify: function(tail, initElem, w, coord, prop) {
   this.computeDim(tail, initElem, w, coord, this.worstAspectRatio, prop);
 },
 
 /*
    Method: layoutRow
 
   Performs the layout of an array of nodes.
 
    Parameters:

       ch - An array of nodes.  
       w - A fixed dimension where nodes will be laid out.
       coord - A coordinates object specifying width, height, left and top style properties.
 */
 layoutRow: function(ch, w, coord, prop) {
   if(this.layout.horizontal()) {
     return this.layoutV(ch, w, coord, prop);
   } else {
     return this.layoutH(ch, w, coord, prop);
   }
 },
 
 layoutV: function(ch, w, coord, prop) {
   var totalArea = 0, rnd = function(x) { return x; }; 
   $.each(ch, function(elem) { totalArea += elem._area; });
   var width = rnd(totalArea / w), top =  0; 
   for(var i=0, l=ch.length; i<l; i++) {
     var h = rnd(ch[i]._area / width);
     var chi = ch[i];
     chi.getPos(prop).setc(coord.left, coord.top + top);
     chi.setData('width', width, prop);
     chi.setData('height', h, prop);
     top += h;
   }
   var ans = {
     'height': coord.height,
     'width': coord.width - width,
     'top': coord.top,
     'left': coord.left + width
   };
   //take minimum side value.
   ans.dim = Math.min(ans.width, ans.height);
   if(ans.dim != ans.height) this.layout.change();
   return ans;
 },
 
 layoutH: function(ch, w, coord, prop) {
   var totalArea = 0; 
   $.each(ch, function(elem) { totalArea += elem._area; });
   var height = totalArea / w,
       top = coord.top, 
       left = 0;
   
   for(var i=0, l=ch.length; i<l; i++) {
     var chi = ch[i];
     var w = chi._area / height;
     chi.getPos(prop).setc(coord.left + left, top);
     chi.setData('width', w, prop);
     chi.setData('height', height, prop);
     left += w;
   }
   var ans = {
     'height': coord.height - height,
     'width': coord.width,
     'top': coord.top + height,
     'left': coord.left
   };
   ans.dim = Math.min(ans.width, ans.height);
   if(ans.dim != ans.width) this.layout.change();
   return ans;
 }
});

Layouts.TM.Strip = new Class({
  Implements: Layouts.TM.Area,

    /*
      Method: compute
    
     Called by loadJSON to calculate recursively all node positions and lay out the tree.
    
      Parameters:
    
         json - A JSON subtree. See also <Loader.loadJSON>. 
       coord - A coordinates object specifying width, height, left and top style properties.
    */
    computePositions: function(node, coord, prop) {
     var ch = Graph.Util.getSubnodes(node, [1, 1], "ignore"), config = this.config;
     if(ch.length > 0) {
       this.processChildrenLayout(node, ch, coord, prop);
       for(var i=0, l=ch.length; i<l; i++) {
         var chi = ch[i];
         var offst = config.offset,
             height = chi.getData('height', prop) - offst - config.titleHeight,
             width  = chi.getData('width', prop)  - offst;
         var chipos = chi.getPos(prop);
         coord = {
           'width': width,
           'height': height,
           'top': chipos.y + config.titleHeight,
           'left': chipos.x
         };
         this.computePositions(chi, coord, prop);
       }
     }
    },
    
    /*
      Method: processChildrenLayout
    
     Computes children real areas and other useful parameters for performing the Strip algorithm.
    
      Parameters:
    
         par - The parent node of the json subtree.  
         ch - An Array of nodes
         coord - A coordinates object specifying width, height, left and top style properties.
    */
    processChildrenLayout: function(par, ch, coord, prop) {
     //compute children real areas
      var parentArea = coord.width * coord.height;
      var i, l=ch.length, totalChArea=0, chArea = [];
      for(i=0; i<l; i++) {
        chArea[i] = +ch[i].getData('area', prop);
        totalChArea += chArea[i];
      }
      for(i=0; i<l; i++) {
        ch[i]._area = parentArea * chArea[i] / totalChArea;
      }
     var side = this.layout.horizontal()? coord.width : coord.height;
     var initElem = [ch[0]];
     var tail = ch.slice(1);
     this.stripify(tail, initElem, side, coord, prop);
    },
    
    /*
      Method: stripify
    
     Performs an heuristic method to calculate div elements sizes in order to have 
     a good compromise between aspect ratio and order.
    
      Parameters:
    
         tail - An array of nodes.  
         initElem - An array of nodes.
         w - A fixed dimension where nodes will be layed out.
       coord - A coordinates object specifying width, height, left and top style properties.
    */
    stripify: function(tail, initElem, w, coord, prop) {
     this.computeDim(tail, initElem, w, coord, this.avgAspectRatio, prop);
    },
    
    /*
      Method: layoutRow
    
     Performs the layout of an array of nodes.
    
      Parameters:
    
         ch - An array of nodes.  
         w - A fixed dimension where nodes will be laid out.
         coord - A coordinates object specifying width, height, left and top style properties.
    */
    layoutRow: function(ch, w, coord, prop) {
     if(this.layout.horizontal()) {
       return this.layoutH(ch, w, coord, prop);
     } else {
       return this.layoutV(ch, w, coord, prop);
     }
    },
    
    layoutV: function(ch, w, coord, prop) {
     var totalArea = 0; 
     $.each(ch, function(elem) { totalArea += elem._area; });
     var width = totalArea / w, top =  0; 
     for(var i=0, l=ch.length; i<l; i++) {
       var chi = ch[i];
       var h = chi._area / width;
       chi.getPos(prop).setc(coord.left, 
           coord.top + (w - h - top));
       chi.setData('width', width, prop);
       chi.setData('height', h, prop);
       top += h;
     }
    
     return {
       'height': coord.height,
       'width': coord.width - width,
       'top': coord.top,
       'left': coord.left + width,
       'dim': w
     };
    },
    
    layoutH: function(ch, w, coord, prop) {
     var totalArea = 0; 
     $.each(ch, function(elem) { totalArea += elem._area; });
     var height = totalArea / w,
         top = coord.height - height, 
         left = 0;
     
     for(var i=0, l=ch.length; i<l; i++) {
       var chi = ch[i];
       var s = chi._area / height;
       chi.getPos(prop).setc(coord.left + left, coord.top + top);
       chi.setData('width', s, prop);
       chi.setData('height', height, prop);
       left += s;
     }
     return {
       'height': coord.height - height,
       'width': coord.width,
       'top': coord.top,
       'left': coord.left,
       'dim': w
     };
    }
 });

$jit.TM = {};

var TM = $jit.TM;

$jit.TM.$extend = true;

TM.Base = {
  layout: {
    orientation: "h",
    vertical: function(){
      return this.orientation == "v";
    },
    horizontal: function(){
      return this.orientation == "h";
    },
    change: function(){
      this.orientation = this.vertical()? "h" : "v";
    }
  },

  initialize: function(controller){
    var config = {
      orientation: "h",
      titleHeight: 13,
      offset: 2,
      levelsToShow: 3,
      constrained: false,
      addLeftClickHandler: false,
      addRightClickHandler: false,
      selectPathOnHover: false,
      withLabels: true,
      Node: {
        type: 'rectangle',
        overridable: true
      },
      Edge: {
        type: 'none'
      },
      duration: 700,
      fps: 25
    };

    this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
        "Fx", "Controller", "Tips", "NodeStyles"), config, controller);
    this.layout.orientation = this.config.orientation;

    var canvasConfig = this.config;
    if (canvasConfig.useCanvas) {
      this.canvas = canvasConfig.useCanvas;
      this.config.labelContainer = this.canvas.id + '-label';
    } else {
      this.canvas = new Canvas(canvasConfig);
      this.config.labelContainer = canvasConfig.injectInto + '-label';
    }

    this.graphOptions = {
      'complex': true,
      'Node': {
        'selected': false,
        'exist': true,
        'drawn': true
      }
    };
    this.graph = new Graph(this.graphOptions, this.config.Node,
        this.config.Edge);
    this.labels = new TM.Label[canvasConfig.labels](this);
    this.fx = new TM.Plot(this);
    this.op = new TM.Op(this);
    this.group = new TM.Group(this);
    this.clickedNode = null;
    // initialize extras
    this.initializeExtras();
  },

  refresh: function(){
    this.compute();
    this.plot();
  },

  plot: function(){
    this.fx.plot(this.config);
  },

  leaf: function(n){
    return Graph.Util.getSubnodes(n, [
        1, 1
    ], "ignore").length == 0;
  },

  enter: function(n){
    this.view(n.id);
  },

  onLeftClick: function(n){
    this.enter(n);
  },

  out: function(){
    var GUtil = Graph.Util, parents = GUtil.getParents(this.graph
        .getNode(this.root));
    if (parents.length > 0) {
      var parent = parents[0];
      if (this.controller.request)
        this.op.prune(parent, this.config.levelsToShow);
      this.view(parent.id);
    }
  },

  onRightClick: function(){
    this.out();
  },

  view: function(id){
    var config = this.config, that = this;
    var rootNode = this.graph.getNode(this.root);
    var clickedNode = this.graph.getNode(id);
    var post = {
      onComplete: function(){
        that.root = rootNode;
        that.clickedNode = clickedNode;
        that.plot();
      }
    };

    if (this.controller.request) {
      this.requestNodes(clickedNode, post);
    } else {
      post.onComplete();
    }
  },

  requestNodes: function(node, onComplete){
    var handler = $.merge(this.controller, onComplete), lev = this.config.levelsToShow, GUtil = Graph.Util;
    if (handler.request) {
      var leaves = [], d = node._depth;
      GUtil.eachLevel(node, 0, lev, function(n){
        if (n.drawn && !GUtil.anySubnode(n)) {
          leaves.push(n);
          n._level = lev - (n._depth - d);
        }
      });
      this.group.requestNodes(leaves, handler);
    } else {
      handler.onComplete();
    }
  },

  selectPath: function(node){
    var GUtil = Graph.Util, that = this;
    GUtil.eachNode(this.graph, function(n){
      n.selected = false;
    });
    function path(node){
      if (node == null || node.selected)
        return;
      node.selected = true;
      $.each(that.group.getSiblings( [
        node
      ])[node.id], function(n){
        n.exist = true;
        n.drawn = true;
      });
      var parents = GUtil.getParents(node);
      parents = (parents.length > 0)? parents[0] : null;
      path(parents);
    }
    path(node);
  }
};

TM.Op = new Class( {
  Implements: Graph.Op,

  initialize: function(viz){
    this.viz = viz;
  }
});

/*

Performs operations on group of nodes.

*/
TM.Group = new Class( {

  initialize: function(viz){
    this.viz = viz;
    this.canvas = viz.canvas;
    this.config = viz.config;
  },

  /*
  
    Calls the request method on the controller to request a subtree for each node. 
  */
  requestNodes: function(nodes, controller){
    var counter = 0, len = nodes.length, nodeSelected = {};
    var complete = function(){
      controller.onComplete();
    };
    var viz = this.viz;
    if (len == 0)
      complete();
    for ( var i = 0; i < len; i++) {
      nodeSelected[nodes[i].id] = nodes[i];
      controller.request(nodes[i].id, nodes[i]._level, {
        onComplete: function(nodeId, data){
          if (data && data.children) {
            data.id = nodeId;
            viz.op.sum(data, {
              type: 'nothing'
            });
          }
          if (++counter == len) {
            Graph.Util.computeLevels(viz.graph, viz.root, 0);
            complete();
          }
        }
      });
    }
  }
});

TM.Plot = new Class( {

  Implements: Graph.Plot,

  initialize: function(viz){
    this.viz = viz;
    this.config = viz.config;
    this.node = this.config.Node;
    this.edge = this.config.Edge;
    this.animation = new Animation;
    this.nodeTypes = new TM.Plot.NodeTypes;
    this.edgeTypes = new TM.Plot.EdgeTypes;
    this.labels = viz.labels;
  },

  plot: function(opt, animating){
    var viz = this.viz, graph = viz.graph;
    this.plotTree(graph.getNode(viz.root), $.merge(opt, {
      'withLabels': true,
      'hideLabels': !!animating,
      'plotSubtree': function(n, ch){
        return true;
      }
    }), animating);
  }
});

/*
Object: TM.Label

Label interface implementation for the ST

See Also:

<Graph.Label>, <ST.Label.HTML>, <RGraph.Label.SVG>

*/
TM.Label = {};

/*
 Class: ST.Label.Native

 Implements labels natively, using the Canvas text API.

 Extends:

 <Graph.Label.Native>

 See also:

 <ST.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
TM.Label.Native = new Class( {
  Implements: Graph.Label.Native,
  /*
     Method: plotLabel
  
     Plots a label for a given node.

     Parameters:

     canvas - A <Canvas> instance.
     node - A <Graph.Node>.
     controller - A configuration object. See also <Hypertree>, <RGraph>, <ST>.

  */
  plotLabel: function(canvas, node, controller){
    var ctx = canvas.getCtx();
    var coord = node.pos.getc(true);
    ctx.save();
    ctx.fillStyle = ctx.strokeStyle = '#000';
    ctx.fillText(node.name, coord.x, coord.y);
    ctx.restore();
  }
});

/*
 Class: ST.Label.SVG

 Implements labels using SVG (currently not supported in IE).

 Extends:

 <ST.Label.DOM>, <Graph.Label.SVG>

 See also:

 <ST.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
TM.Label.SVG = new Class( {
  Implements: Graph.Label.SVG,

  initialize: function(viz){
    this.viz = viz;
  },

  /* 
  Method: placeLabel

  Overrides abstract method placeLabel in <Graph.Plot>.

  Parameters:

  tag - A DOM label element.
  node - A <Graph.Node>.
  controller - A configuration/controller object passed to the visualization.
  
  */
  placeLabel: function(tag, node, controller){
    var pos = node.pos.getc(true), canvas = this.viz.canvas;
    var radius = canvas.getSize();
    var labelPos = {
      x: Math.round(pos.x + radius.width / 2),
      y: Math.round(pos.y + radius.height / 2)
    };
    tag.setAttribute('x', labelPos.x);
    tag.setAttribute('y', labelPos.y);

    controller.onPlaceLabel(tag, node);
  }
});

/*
 Class: ST.Label.HTML

 Implements labels using plain old HTML.

 Extends:

 <ST.Label.DOM>, <Graph.Label.HTML>

 See also:

 <ST.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
TM.Label.HTML = new Class( {
  Implements: Graph.Label.HTML,

  initialize: function(viz){
    this.viz = viz;
  },

  /* 
  Method: placeLabel

  Overrides abstract method placeLabel in <Graph.Plot>.

  Parameters:

  tag - A DOM label element.
  node - A <Graph.Node>.
  controller - A configuration/controller object passed to the visualization.
  
  */
  placeLabel: function(tag, node, controller){
    var pos = node.pos.getc(true), canvas = this.viz.canvas;
    var radius = canvas.getSize();
    var labelPos = {
      x: Math.round(pos.x + radius.width / 2),
      y: Math.round(pos.y + radius.height / 2)
    };

    var style = tag.style;
    style.left = labelPos.x + 'px';
    style.top = labelPos.y + 'px';
    style.display = '';

    controller.onPlaceLabel(tag, node);
  }
});

/*
Class: ST.Plot.NodeTypes

Here are implemented all kinds of node rendering functions. 
Rendering functions implemented are 'none', 'circle', 'ellipse', 'rectangle' and 'square'.

You can add new Node types by implementing a new method in this class

Example:

(start code js)
  ST.Plot.NodeTypes.implement({
    'newnodetypename': function(node, canvas) {
      //Render my node here.
    }
  });
(end code)

*/
TM.Plot.NodeTypes = new Class( {
  'none': {
    'render': $.empty
  },

  'rectangle': {
    'render': function(node, canvas){
      var leaf = this.viz.leaf(node);
      var config = this.viz.config;
      var offst = config.offset;
      var titleHeight = config.titleHeight;
      var pos = node.pos.getc(true);
      var width = node.getData('width');
      var height = node.getData('height');
      var ctx = canvas.getCtx();
      var posx = pos.x + offst / 2, posy = pos.y + offst / 2;
      if (leaf) {
        var lg = ctx.createLinearGradient(posx, posy, posx + width - offst,
            posy + height - offst);
        lg.addColorStop(0, '#555');
        lg.addColorStop(1, '#ccc');
        ctx.fillStyle = lg;
        ctx.fillRect(posx, posy, width - offst, height - offst);
      } else {
        var lg = ctx.createLinearGradient(posx, posy, posx + width - offst,
            posy + titleHeight);
        lg.addColorStop(0, '#111');
        lg.addColorStop(1, '#444');
        ctx.fillStyle = lg;
        ctx.fillRect(pos.x + offst / 2, pos.y + offst / 2, width - offst,
            titleHeight);
      }
    },
    'contains': $.lambda(false)
  }
});

TM.Plot.EdgeTypes = new Class( {
  'none': $.empty
});

TM.SliceAndDice = new Class( {
  Implements: [
      Loader, Extras, TM.Base, Layouts.TM.SliceAndDice
  ]
});

TM.Squarified = new Class( {
  Implements: [
      Loader, Extras, TM.Base, Layouts.TM.Squarified
  ]
});

TM.Strip = new Class( {
  Implements: [
      Loader, Extras, TM.Base, Layouts.TM.Strip
  ]
});


/*
 * Class: Layouts.Tree
 * 
 * Implements a Tree Layout.
 * 
 * Implemented By:
 * 
 * <ST>
 * 
 * Inspired by:
 * 
 * Drawing Trees (Andrew J. Kennedy) <http://research.microsoft.com/en-us/um/people/akenn/fun/drawingtrees.pdf>
 * 
 */
Layouts.Tree = (function() {
  //Layout functions
  var slice = Array.prototype.slice;

  /*
     Calculates the max width and height nodes for a tree level
  */  
  function getBoundaries(graph, config, level, orn, prop) {
    var dim = config.Node, GUtil = Graph.Util;
    var multitree = config.multitree;
    if (dim.overridable) {
      var w = -1, h = -1;
      GUtil.eachNode(graph, function(n) {
        if (n._depth == level
            && (!multitree || ('$orn' in n.data) && n.data.$orn == orn)) {
          var dw = n.getData('width', prop);
          var dh = n.getData('height', prop);
          w = (w < dw) ? dw : w;
          h = (h < dh) ? dh : h;
        }
      });
      return {
        'width' : w < 0 ? dim.width : w,
        'height' : h < 0 ? dim.height : h
      };
    } else {
      return dim;
    }
  }


  function movetree(node, prop, val, orn) {
    var p = (orn == "left" || orn == "right") ? "y" : "x";
    node.getPos(prop)[p] += val;
  }


  function moveextent(extent, val) {
    var ans = [];
    $.each(extent, function(elem) {
      elem = slice.call(elem);
      elem[0] += val;
      elem[1] += val;
      ans.push(elem);
    });
    return ans;
  }


  function merge(ps, qs) {
    if (ps.length == 0)
      return qs;
    if (qs.length == 0)
      return ps;
    var p = ps.shift(), q = qs.shift();
    return [ [ p[0], q[1] ] ].concat(merge(ps, qs));
  }


  function mergelist(ls, def) {
    def = def || [];
    if (ls.length == 0)
      return def;
    var ps = ls.pop();
    return mergelist(ls, merge(ps, def));
  }


  function fit(ext1, ext2, subtreeOffset, siblingOffset, i) {
    if (ext1.length <= i || ext2.length <= i)
      return 0;

    var p = ext1[i][1], q = ext2[i][0];
    return Math.max(fit(ext1, ext2, subtreeOffset, siblingOffset, ++i)
        + subtreeOffset, p - q + siblingOffset);
  }


  function fitlistl(es, subtreeOffset, siblingOffset) {
    function $fitlistl(acc, es, i) {
      if (es.length <= i)
        return [];
      var e = es[i], ans = fit(acc, e, subtreeOffset, siblingOffset, 0);
      return [ ans ].concat($fitlistl(merge(acc, moveextent(e, ans)), es, ++i));
    }
    ;
    return $fitlistl( [], es, 0);
  }


  function fitlistr(es, subtreeOffset, siblingOffset) {
    function $fitlistr(acc, es, i) {
      if (es.length <= i)
        return [];
      var e = es[i], ans = -fit(e, acc, subtreeOffset, siblingOffset, 0);
      return [ ans ].concat($fitlistr(merge(moveextent(e, ans), acc), es, ++i));
    }
    ;
    es = slice.call(es);
    var ans = $fitlistr( [], es.reverse(), 0);
    return ans.reverse();
  }


  function fitlist(es, subtreeOffset, siblingOffset, align) {
    var esl = fitlistl(es, subtreeOffset, siblingOffset), esr = fitlistr(es,
        subtreeOffset, siblingOffset);

    if (align == "left")
      esr = esl;
    else if (align == "right")
      esl = esr;

    for ( var i = 0, ans = []; i < esl.length; i++) {
      ans[i] = (esl[i] + esr[i]) / 2;
    }
    return ans;
  }


  function design(graph, node, prop, config, orn) {
    var multitree = config.multitree;
    var auxp = [ 'x', 'y' ], auxs = [ 'width', 'height' ];
    var ind = +(orn == "left" || orn == "right");
    var p = auxp[ind], notp = auxp[1 - ind];

    var cnode = config.Node;
    var s = auxs[ind], nots = auxs[1 - ind];

    var siblingOffset = config.siblingOffset;
    var subtreeOffset = config.subtreeOffset;
    var align = config.align;

    var GUtil = Graph.Util;

    function $design(node, maxsize, acum) {
      var sval = node.getData(s, prop);
      var notsval = maxsize
          || (node.getData(nots, prop));

      var trees = [], extents = [], chmaxsize = false;
      var chacum = notsval + config.levelDistance;
      GUtil.eachSubnode(node,
          function(n) {
            if (n.exist
                && (!multitree || ('$orn' in n.data) && n.data.$orn == orn)) {

              if (!chmaxsize)
                chmaxsize = getBoundaries(graph, config, n._depth, orn, prop);

              var s = $design(n, chmaxsize[nots], acum + chacum);
              trees.push(s.tree);
              extents.push(s.extent);
            }
          });
      var positions = fitlist(extents, subtreeOffset, siblingOffset, align);
      for ( var i = 0, ptrees = [], pextents = []; i < trees.length; i++) {
        movetree(trees[i], prop, positions[i], orn);
        pextents.push(moveextent(extents[i], positions[i]));
      }
      var resultextent = [ [ -sval / 2, sval / 2 ] ]
          .concat(mergelist(pextents));
      node.getPos(prop)[p] = 0;

      if (orn == "top" || orn == "left") {
        node.getPos(prop)[notp] = acum;
      } else {
        node.getPos(prop)[notp] = -acum;
      }

      return {
        tree : node,
        extent : resultextent
      };
    }

    $design(node, false, 0);
  }


  return new Class({
    /*
    Method: compute
    
    Computes nodes' positions.

     */
    compute : function(property, computeLevels) {
      var prop = property || 'start';
      var node = this.graph.getNode(this.root);
      $.extend(node, {
        'drawn' : true,
        'exist' : true,
        'selected' : true
      });
      NodeDim.compute(this.graph, prop, this.config);
      if (!!computeLevels || !("_depth" in node)) {
        Graph.Util.computeLevels(this.graph, this.root, 0, "ignore");
      }
      
      this.computePositions(node, prop);
    },

    computePositions : function(node, prop) {
      var config = this.config;
      var multitree = config.multitree;
      var align = config.align;
      var indent = align !== 'center' && config.indent;
      var orn = config.orientation;
      var orns = multitree ? [ 'top', 'right', 'bottom', 'left' ] : [ orn ];
      var that = this;
      $.each(orns, function(orn) {
        //calculate layout
          design(that.graph, node, prop, that.config, orn, prop);
          var i = [ 'x', 'y' ][+(orn == "left" || orn == "right")];
          //absolutize
          (function red(node) {
            Graph.Util.eachSubnode(node, function(n) {
              if (n.exist
                  && (!multitree || ('$orn' in n.data) && n.data.$orn == orn)) {

                n.getPos(prop)[i] += node.getPos(prop)[i];
                if (indent) {
                  n.getPos(prop)[i] += align == 'left' ? indent : -indent;
                }
                red(n);
              }
            });
          })(node);
        });
    }
  });
  
})();

/*
 * File: Spacetree.js
 * 
 * Implements the <ST> class and other derived classes.
 *
 * Description:
 *
 * The main idea of the spacetree algorithm is to take the most common tree layout, and to expand nodes that are "context-related" .i.e lying on the path between the root node and a selected node. Useful animations to contract and expand nodes are also included.
 *
 * Inspired by:
 *
 * SpaceTree: Supporting Exploration in Large Node Link Tree, Design Evolution and Empirical Evaluation (Catherine Plaisant, Jesse Grosjean, Benjamin B. Bederson)
 *
 * <http://hcil.cs.umd.edu/trs/2002-05/2002-05.pdf>
 *
 * Disclaimer:
 *
 * This visualization was built from scratch, taking only the paper as inspiration, and only shares some features with the Spacetree.
 *
 */

/*
     Class: ST
     
     The main ST class

     Extends:

     <Loader>, <Layouts.Tree>, <Tips>

     Parameters:

     canvas - A <Canvas> Class
     config - A configuration/controller object.

     Configuration:
    
     The configuration object can have the following properties (all properties are optional and have a default value)
      
     *General*

     Inherits all properties from <Options.Tree> and also
     
     - _levelsToShow_ Depth of the plotted tree. The plotted tree will be pruned in order to fit the specified depth if constrained=true. Default's 2.
     - _constrained_ If true, the algorithm will try to plot only the part of the tree that fits the Canvas.
     - _levelDistance_ Distance between levels. Default's 30.

     *Node*
     
     Customize the visualization nodes' shape, color, and other style properties.

     Inherits options from <Options.Graph.Node>.

     *Edge*

     Customize the visualization edges' shape, color, and other style properties.

     Inherits from <Options.Graph.Edge>.
      
     *Animations*

     Inherits from <Options.Animation>, although the following default values are changed.
     
     - _duration_ Duration of the animation in milliseconds. Default's 700.
     - _fps_ Frames per second. Default's 25.
     
    *Controller options*

     Inherits from <Options.Controller>.

    Example:

    Here goes a complete example. In most cases you won't be forced to implement all properties and methods. In fact, 
    all configuration properties  have the default value assigned.

    I won't be instanciating a <Canvas> class here. If you want to know more about instanciating a <Canvas> class 
    please take a look at the <Canvas> class documentation.

    (start code js)
      var st = new ST(canvas, {
        orientation: "left",
        levelsToShow: 2,
        subtreeOffset: 8,
        siblingOffset: 5,
        levelDistance: 30,
        withLabels: true,
        align: "center",
        multitree: false,
        indent: 10,
        Node: {
          overridable: false,
          type: 'rectangle',
          color: '#ccb',
          lineWidth: 1,
          height: 20,
          width: 90,
          dim: 15,
          align: "center"
        },
        Edge: {
          overridable: false,
          type: 'line',
          color: '#ccc',
          dim: 15,
          lineWidth: 1
        },
        duration: 700,
        fps: 25,
        transition: Trans.Quart.easeInOut,
        clearCanvas: true,
        
        onBeforeCompute: function(node) {
          //do something onBeforeCompute
        },
        onAfterCompute:  function () {
          //do something onAfterCompute
        },
        onCreateLabel:   function(domElement, node) {
          //do something onCreateLabel
        },
        onPlaceLabel:    function(domElement, node) {
          //do something onPlaceLabel
        },
        onBeforePlotNode:function(node) {
          //do something onBeforePlotNode
        },
        onAfterPlotNode: function(node) {
          //do something onAfterPlotNode
        },
        onBeforePlotLine:function(adj) {
          //do something onBeforePlotLine
        },
        onAfterPlotLine: function(adj) {
          //do something onAfterPlotLine
        },
        request:         false

      });
    (end code)

    Instance Properties:

    - _graph_ Access a <Graph> instance.
    - _op_ Access a <ST.Op> instance.
    - _fx_ Access a  <ST.Plot> instance.
    - _labels_ Access a <ST.Label> instance.
 */

$jit.ST= (function() {
    // Define some private methods first...
    // Nodes in path
    var nodesInPath = [];
    // Nodes to contract
    function getNodesToHide(node) {
      node = node || this.clickedNode;
      if(!this.config.constrained) {
        return [];
      }
      var Geom = this.geom, GUtil = Graph.Util;
      var graph = this.graph;
      var canvas = this.canvas;
      var level = node._depth, nodeArray = [];
  	  GUtil.eachNode(graph, function(n) {
          if(n.exist && !n.selected) {
              if(GUtil.isDescendantOf(n, node.id)) {
                if(n._depth <= level) nodeArray.push(n);
              } else {
                nodeArray.push(n);
              }
          }
  	  });
  	  var leafLevel = Geom.getRightLevelToShow(node, canvas);
  	  GUtil.eachLevel(node, leafLevel, leafLevel, function(n) {
          if(n.exist && !n.selected) nodeArray.push(n);
  	  });
  	    
  	  for (var i = 0; i < nodesInPath.length; i++) {
  	    var n = this.graph.getNode(nodesInPath[i]);
  	    if(!GUtil.isDescendantOf(n, node.id)) {
  	      nodeArray.push(n);
  	    }
  	  } 
  	  return nodeArray;       
    };
    // Nodes to expand
     function getNodesToShow(node) {
        var nodeArray= [], GUtil = Graph.Util, config = this.config;
        node = node || this.clickedNode;
        GUtil.eachLevel(this.clickedNode, 0, config.levelsToShow, function(n) {
            if(config.multitree && !('$orn' in n.data) 
            		&& GUtil.anySubnode(n, function(ch){ return ch.exist && !ch.drawn; })) {
            	nodeArray.push(n);
            } else if(n.drawn && !GUtil.anySubnode(n, "drawn")) {
              nodeArray.push(n);
            }
        });
        return nodeArray;
     };
    // Now define the actual class.
    return new Class({
    
        Implements: [Loader, Extras, Layouts.Tree],
        
        initialize: function(controller) {            
          var $ST = $jit.ST;
          
          var config= {
                levelsToShow: 2,
                levelDistance: 30,
                withLabels: true,
                constrained: true,                
                Node: {
                  type: 'rectangle'
                },
                duration: 700,
                fps: 25
            };
            
            this.controller = this.config = $.merge(
                Options("Canvas", "Fx", "Tree", "Node", "Edge", "Controller", 
                    "Tips", "NodeStyles"), config, controller);

            var canvasConfig = this.config;
            if(canvasConfig.useCanvas) {
              this.canvas = canvasConfig.useCanvas;
              this.config.labelContainer = this.canvas.id + '-label';
            } else {
              this.canvas = new Canvas(canvasConfig);
              this.config.labelContainer = canvasConfig.injectInto + '-label';
            }

            this.graphOptions = {
                'complex': true
            };
            this.graph = new Graph(this.graphOptions, this.config.Node, this.config.Edge);
            this.labels = new $ST.Label[canvasConfig.labels](this);
            this.fx = new $ST.Plot(this);
            this.op = new $ST.Op(this);
            this.group = new $ST.Group(this);
            this.geom = new $ST.Geom(this);
            this.clickedNode=  null;
            // initialize extras
            this.initializeExtras();
        },
    
        /*
         Method: plot
        
         Plots the tree. Usually this method is called right after computing nodes' positions.

        */  
        plot: function() { this.fx.plot(this.controller); },
    
      
        /*
         Method: switchPosition
        
         Switches the tree orientation.

         Parameters:

        pos - The new tree orientation. Possible values are "top", "left", "right" and "bottom".
        method - Set this to "animate" if you want to animate the tree when switching its position. You can also set this parameter to "replot" to just replot the subtree.
        onComplete - _optional_ This callback is called once the "switching" animation is complete.

         Example:

         (start code js)
           st.switchPosition("right", "animate", {
            onComplete: function() {
              alert('completed!');
            } 
           });
         (end code)
        */  
        switchPosition: function(pos, method, onComplete) {
          var Geom = this.geom, Plot = this.fx, that = this;
          if(!Plot.busy) {
              Plot.busy = true;
              this.contract({
                  onComplete: function() {
                      Geom.switchOrientation(pos);
                      that.compute('end', false);
                      Plot.busy = false;
                      if(method == 'animate') {
                    	  that.onClick(that.clickedNode.id, onComplete);  
                      } else if(method == 'replot') {
                    	  that.select(that.clickedNode.id, onComplete);
                      }
                  }
              }, pos);
          }
        },

        /*
        Method: switchAlignment
       
        Switches the tree alignment.

        Parameters:

       align - The new tree alignment. Possible values are "left", "center" and "right".
       method - Set this to "animate" if you want to animate the tree after aligning its position. You can also set this parameter to "replot" to just replot the subtree.
       onComplete - _optional_ This callback is called once the "switching" animation is complete.

        Example:

        (start code js)
          st.switchAlignment("right", "animate", {
           onComplete: function() {
             alert('completed!');
           } 
          });
        (end code)
       */  
       switchAlignment: function(align, method, onComplete) {
        this.config.align = align;
        if(method == 'animate') {
        	this.select(this.clickedNode.id, onComplete);
        } else if(method == 'replot') {
        	this.onClick(this.clickedNode.id, onComplete);	
        }
       },

       /*
        Method: addNodeInPath
       
        Adds a node to the current path as selected node. This node will be visible (as in non-collapsed) at all times.
        

        Parameters:

       id - A <Graph.Node> id.

        Example:

        (start code js)
          st.addNodeInPath("somenodeid");
        (end code)
       */  
       addNodeInPath: function(id) {
           nodesInPath.push(id);
           this.select((this.clickedNode && this.clickedNode.id) || this.root);
       },       

       /*
       Method: clearNodesInPath
      
       Removes all nodes tagged as selected by the <ST.addNodeInPath> method.
       
     See also:
     
     <ST.addNodeInPath>
     
       Example:

       (start code js)
         st.clearNodesInPath();
       (end code)
      */  
       clearNodesInPath: function(id) {
           nodesInPath.length = 0;
           this.select((this.clickedNode && this.clickedNode.id) || this.root);
       },
        
       /*
         Method: refresh
        
         Computes nodes' positions and replots the tree.
         
       */
       refresh: function() {
           this.reposition();
           this.select((this.clickedNode && this.clickedNode.id) || this.root);
       },    

       reposition: function() {
            Graph.Util.computeLevels(this.graph, this.root, 0, "ignore");
             this.geom.setRightLevelToShow(this.clickedNode, this.canvas);
            Graph.Util.eachNode(this.graph, function(n) {
                if(n.exist) n.drawn = true;
            });
            this.compute('end');
        },
        
          requestNodes: function(node, onComplete) {
            var handler = $.merge(this.controller, onComplete), 
            lev = this.config.levelsToShow, GUtil = Graph.Util;
            if(handler.request) {
                var leaves = [], d = node._depth;
                GUtil.eachLevel(node, 0, lev, function(n) {
                    if(n.drawn && 
                     !GUtil.anySubnode(n)) {
                     leaves.push(n);
                     n._level = lev - (n._depth - d);
                    }
                });
                this.group.requestNodes(leaves, handler);
            }
              else
                handler.onComplete();
          },
     
          contract: function(onComplete, switched) {
            var orn  = this.config.orientation;
            var Geom = this.geom, Group = this.group;
            if(switched) Geom.switchOrientation(switched);
            var nodes = getNodesToHide.call(this);
            if(switched) Geom.switchOrientation(orn);
            Group.contract(nodes, $.merge(this.controller, onComplete));
          },
      
         move: function(node, onComplete) {
            this.compute('end', false);
            var move = onComplete.Move, offset = {
                'x': move.offsetX,
                'y': move.offsetY 
            };
            if(move.enable) {
                this.geom.translate(node.endPos.add(offset).$scale(-1), "endPos");
            }
            this.fx.animate($.merge(this.controller, { modes: ['linear'] }, onComplete));
         },
      
      
        expand: function (node, onComplete) {
            var nodeArray = getNodesToShow.call(this, node);
            this.group.expand(nodeArray, $.merge(this.controller, onComplete));
        },
    
    
        selectPath: function(node) {
          var GUtil = Graph.Util, that = this;
          GUtil.eachNode(this.graph, function(n) { n.selected = false; }); 
          function path(node) {
              if(node == null || node.selected) return;
              node.selected = true;
              $.each(that.group.getSiblings([node])[node.id], 
              function(n) { 
                   n.exist = true; 
                   n.drawn = true; 
              });    
              var parents = GUtil.getParents(node);
              parents = (parents.length > 0)? parents[0] : null;
              path(parents);
          };
          for(var i=0, ns = [node.id].concat(nodesInPath); i < ns.length; i++) {
              path(this.graph.getNode(ns[i]));
          }
        },
      
        /*
        Method: setRoot
     
         Switches the current root node.
     
        Parameters:
           id - The id of the node to be set as root.
           method - Set this to "animate" if you want to animate the tree after adding the subtree. You can also set this parameter to "replot" to just replot the subtree.
           onComplete - _optional_ An action to perform after the animation (if any).
 
        Example:

        (start code js)
          st.setRoot('my_node_id', 'animate', {
             onComplete: function() {
               alert('complete!');
             }
          });
        (end code)
     */
     setRoot: function(id, method, onComplete) {
        	var that = this, canvas = this.canvas;
        	var rootNode = this.graph.getNode(this.root);
        	var clickedNode = this.graph.getNode(id);
        	function $setRoot() {
            	if(this.config.multitree && clickedNode.data.$orn) {
            		var orn = clickedNode.data.$orn;
            		var opp = {
            				'left': 'right',
            				'right': 'left',
            				'top': 'bottom',
            				'bottom': 'top'
            		}[orn];
            		rootNode.data.$orn = opp;
            		(function tag(rootNode) {
                		Graph.Util.eachSubnode(rootNode, function(n) {
                			if(n.id != id) {
                				n.data.$orn = opp;
                				tag(n);
                			}
                		});
            		})(rootNode);
            		delete clickedNode.data.$orn;
            	}
            	this.root = id;
            	this.clickedNode = clickedNode;
            	Graph.Util.computeLevels(this.graph, this.root, 0, "ignore");
        	}

        	// delete previous orientations (if any)
        	delete rootNode.data.$orns;

        	if(method == 'animate') {
        		this.onClick(id, {
        			onBeforeMove: function() {
        				$setRoot.call(that);
        				that.selectPath(clickedNode);
        			}
        		});
        	} else if(method == 'replot') {
        		$setRoot.call(this);
        		this.select(this.root);
        	}
     },

     /*
           Method: addSubtree
        
            Adds a subtree, performing optionally an animation.
        
           Parameters:
              subtree - A JSON Tree object. See also <Loader.loadJSON>.
              method - Set this to "animate" if you want to animate the tree after adding the subtree. You can also set this parameter to "replot" to just replot the subtree.
              onComplete - _optional_ An action to perform after the animation (if any).
    
           Example:

           (start code js)
             st.addSubtree(json, 'animate', {
                onComplete: function() {
                  alert('complete!');
                }
             });
           (end code)
        */
        addSubtree: function(subtree, method, onComplete) {
            if(method == 'replot') {
                this.op.sum(subtree, $.extend({ type: 'replot' }, onComplete || {}));
            } else if (method == 'animate') {
                this.op.sum(subtree, $.extend({ type: 'fade:seq' }, onComplete || {}));
            }
        },
    
        /*
           Method: removeSubtree
        
            Removes a subtree, performing optionally an animation.
        
           Parameters:
              id - The _id_ of the subtree to be removed.
              removeRoot - Remove the root of the subtree or only its subnodes.
              method - Set this to "animate" if you want to animate the tree after removing the subtree. You can also set this parameter to "replot" to just replot the subtree.
              onComplete - _optional_ An action to perform after the animation (if any).

          Example:

          (start code js)
            st.removeSubtree('idOfSubtreeToBeRemoved', false, 'animate', {
              onComplete: function() {
                alert('complete!');
              }
            });
          (end code)
    
        */
        removeSubtree: function(id, removeRoot, method, onComplete) {
            var node = this.graph.getNode(id), subids = [];
            Graph.Util.eachLevel(node, +!removeRoot, false, function(n) {
                subids.push(n.id);
            });
            if(method == 'replot') {
                this.op.removeNode(subids, $.extend({ type: 'replot' }, onComplete || {}));
            } else if (method == 'animate') {
                this.op.removeNode(subids, $.extend({ type: 'fade:seq'}, onComplete || {}));
            }
        },
    
        /*
           Method: select
        
            Selects a sepecific node in the Spacetree without performing an animation. Useful when selecting 
            nodes which are currently hidden or deep inside the tree.

          Parameters:
            id - The id of the node to select.
            onComplete - _optional_ onComplete callback.

          Example:
          (start code js)
            st.select('mynodeid', {
              onComplete: function() {
                alert('complete!');
              }
            });
          (end code)
        */
        select: function(id, onComplete) {
            var group = this.group, geom = this.geom;
            var node=  this.graph.getNode(id), canvas = this.canvas;
            var root  = this.graph.getNode(this.root);
            var complete = $.merge(this.controller, onComplete);
            var that = this;
    
            complete.onBeforeCompute(node);
            this.selectPath(node);
            this.clickedNode= node;
            this.requestNodes(node, {
                onComplete: function(){
                    group.hide(group.prepare(getNodesToHide.call(that)), complete);
                    geom.setRightLevelToShow(node, canvas);
                    that.compute("current");
                    Graph.Util.eachNode(that.graph, function(n) { 
                        var pos = n.pos.getc(true);
                        n.startPos.setc(pos.x, pos.y);
                        n.endPos.setc(pos.x, pos.y);
                        n.visited = false; 
                    });
                    that.geom.translate(node.endPos.scale(-1), ["pos", "startPos", "endPos"]);
                    group.show(getNodesToShow.call(that));              
                    that.plot();
                    complete.onAfterCompute(that.clickedNode);
                    complete.onComplete();
                }
            });     
        },
    
      /*
         Method: onClick
    
        This method is called when clicking on a tree node. It mainly performs all calculations and the animation of contracting, translating and expanding pertinent nodes.
        
            
         Parameters:
        
            id - A node id.
            options - A group of options and callbacks such as

            - _onComplete_ an object callback called when the animation finishes.
            - _Move_ an object that has as properties _offsetX_ or _offsetY_ for adding some offset position to the centered node.

        Example:

        (start code js)
          st.onClick('mynodeid', {
	          Move: {
	          	enable: true,
	            offsetX: 30,
	            offsetY: 5
	          },
	          onComplete: function() {
	              alert('yay!');
	          }
          });
        (end code)
    
        */    
      onClick: function (id, options) {
        var canvas = this.canvas, that = this, Fx = this.fx, Util = Graph.Util, Geom = this.geom;
        var innerController = {
            Move: {
        	  enable: true,
              offsetX: 0,
              offsetY: 0  
            },
            onBeforeRequest: $.empty,
            onBeforeContract: $.empty,
            onBeforeMove: $.empty,
            onBeforeExpand: $.empty
        };
        var complete = $.merge(this.controller, innerController, options);
        
        if(!this.busy) {
            this.busy= true;
            var node=  this.graph.getNode(id);
            this.selectPath(node, this.clickedNode);
            this.clickedNode= node;
            complete.onBeforeCompute(node);
            complete.onBeforeRequest(node);
            this.requestNodes(node, {
                onComplete: function() {
                    complete.onBeforeContract(node);
                    that.contract({
                        onComplete: function() {
                            Geom.setRightLevelToShow(node, canvas);
                            complete.onBeforeMove(node);
                            that.move(node, {
                                Move: complete.Move,
                                onComplete: function() {
                                    complete.onBeforeExpand(node);
                                    that.expand(node, {
                                        onComplete: function() {
                                            that.busy = false;
                                            complete.onAfterCompute(id);
                                            complete.onComplete();
                                        }
                                    }); // expand
                                }
                            }); // move
                        }
                    });// contract
                }
            });// request
        }
      }
    });

})();

$jit.ST.$extend = true;

/*
   Class: ST.Op
    
   Performs advanced operations on trees and graphs.

   Extends:

   All <Graph.Op> methods

   Access:

   This instance can be accessed with the _op_ parameter of the st instance created.

   Example:

   (start code js)
    var st = new ST(canvas, config);
    st.op.morph //or can also call any other <Graph.Op> method
   (end code)

*/
$jit.ST.Op = new Class({
    Implements: Graph.Op,
    
    initialize: function(viz) {
        this.viz = viz;
    }
});

/*
    
     Performs operations on group of nodes.

*/
$jit.ST.Group = new Class({
    
    initialize: function(viz) {
        this.viz = viz;
        this.canvas = viz.canvas;
        this.config = viz.config;
        this.animation = new Animation;
        this.nodes = null;
    },
    
    /*
    
       Calls the request method on the controller to request a subtree for each node. 
    */
    requestNodes: function(nodes, controller) {
        var counter = 0, len = nodes.length, nodeSelected = {};
        var complete = function() { controller.onComplete(); };
        var viz = this.viz;
        if(len == 0) complete();
        for(var i=0; i<len; i++) {
            nodeSelected[nodes[i].id] = nodes[i];
            controller.request(nodes[i].id, nodes[i]._level, {
                onComplete: function(nodeId, data) {
                    if(data && data.children) {
                        data.id = nodeId;
                        viz.op.sum(data, { type: 'nothing' });
                    }
                    if(++counter == len) {
                        Graph.Util.computeLevels(viz.graph, viz.root, 0);
                        complete();
                    }
                }
            });
        }
    },
    
    /*
    
       Collapses group of nodes. 
    */
    contract: function(nodes, controller) {
        var GUtil = Graph.Util;
        var viz = this.viz;
        var that = this;

        nodes = this.prepare(nodes);
        this.animation.setOptions($.merge(controller, {
            $animating: false,
            compute: function(delta) {
              if(delta == 1) delta = 0.99;
              that.plotStep(1 - delta, controller, this.$animating);
              this.$animating = 'contract';
            },
            
            complete: function() {
                that.hide(nodes, controller);
            }       
        })).start();
    },
    
    hide: function(nodes, controller) {
        var GUtil = Graph.Util, viz = this.viz;
        for(var i=0; i<nodes.length; i++) {
            // TODO nodes are requested on demand, but not
            // deleted when hidden. Would that be a good feature?
            // Currently that feature is buggy, so I'll turn it off
            // Actually this feature is buggy because trimming should take
            // place onAfterCompute and not right after collapsing nodes.
            if (true || !controller || !controller.request) {
                GUtil.eachLevel(nodes[i], 1, false, function(elem){
                    if (elem.exist) {
                        $.extend(elem, {
                            'drawn': false,
                            'exist': false
                        });
                    }
                });
            } else {
                var ids = [];
                GUtil.eachLevel(nodes[i], 1, false, function(n) {
                    ids.push(n.id);
                });
                viz.op.removeNode(ids, { 'type': 'nothing' });
                viz.labels.clearLabels();
            }
        }
        controller.onComplete();
    },    
    

    /*
    
       Expands group of nodes. 
    */
    expand: function(nodes, controller) {
        var that = this, GUtil = Graph.Util;
        this.show(nodes);
        this.animation.setOptions($.merge(controller, {
            $animating: false,
            compute: function(delta) {
                that.plotStep(delta, controller, this.$animating);
                this.$animating = 'expand';
            },
            
            complete: function() {
                that.plotStep(undefined, controller, false);
                controller.onComplete();
            }       
        })).start();
        
    },
    
    show: function(nodes) {
        var GUtil = Graph.Util, config = this.config;
        this.prepare(nodes);
        $.each(nodes, function(n) {
        	// check for root nodes if multitree
        	if(config.multitree && !('$orn' in n.data)) {
        		delete n.data.$orns;
        		var orns = ' ';
        		GUtil.eachSubnode(n, function(ch) {
        			if(('$orn' in ch.data) 
        					&& orns.indexOf(ch.data.$orn) < 0 
        					&& ch.exist && !ch.drawn) {
        				orns += ch.data.$orn + ' ';
        			}
        		});
        		n.data.$orns = orns;
        	}
            GUtil.eachLevel(n, 0, config.levelsToShow, function(n) {
            	if(n.exist) n.drawn = true;
            });     
        });
    },
    
    prepare: function(nodes) {
        this.nodes = this.getNodesWithChildren(nodes);
        return this.nodes;
    },
    
    /*
       Filters an array of nodes leaving only nodes with children.
    */
    getNodesWithChildren: function(nodes) {
        var ans = [], GUtil = Graph.Util, config = this.config, root = this.viz.root;
        nodes.sort(function(a, b) { return (a._depth <= b._depth) - (a._depth >= b._depth); });
        for(var i=0; i<nodes.length; i++) {
            if(GUtil.anySubnode(nodes[i], "exist")) {
            	for (var j = i+1, desc = false; !desc && j < nodes.length; j++) {
                    if(!config.multitree || '$orn' in nodes[j].data) {
                		desc = desc || GUtil.isDescendantOf(nodes[i], nodes[j].id);                    	
                    }
                }
                if(!desc) ans.push(nodes[i]);
            }
        }
        return ans;
    },
    
    plotStep: function(delta, controller, animating) {
        var viz = this.viz,
        config = this.config,
        canvas = viz.canvas, 
        ctx = canvas.getCtx(),
        nodes = this.nodes,
        GUtil = Graph.Util;
        var i, node;
        // hide nodes that are meant to be collapsed/expanded
        var nds = {};
        for(i=0; i<nodes.length; i++) {
          node = nodes[i];
          nds[node.id] = [];
          var root = config.multitree && !('$orn' in node.data);
          var orns = root && node.data.$orns;
          GUtil.eachSubgraph(node, function(n) { 
            // TODO(nico): Cleanup
        	  // special check for root node subnodes when
        	  // multitree is checked.
        	  if(root && orns && orns.indexOf(n.data.$orn) > 0 
        			  && n.drawn) {
        		  n.drawn = false;
                  nds[node.id].push(n);
              } else if((!root || !orns) && n.drawn) {
                n.drawn = false;
                nds[node.id].push(n);
              }
            });	
            node.drawn = true;
        }
        // plot the whole (non-scaled) tree
        if(nodes.length > 0) viz.fx.plot();
        // show nodes that were previously hidden
        for(i in nds) {
          $.each(nds[i], function(n) { n.drawn = true; });
        }
        // plot each scaled subtree
        for(i=0; i<nodes.length; i++) {
          node = nodes[i];
          ctx.save();
          viz.fx.plotSubtree(node, controller, delta, animating);                
          ctx.restore();
        }
      },

      getSiblings: function(nodes) {
        var siblings = {}, GUtil = Graph.Util;
        $.each(nodes, function(n) {
            var par = GUtil.getParents(n);
            if (par.length == 0) {
                siblings[n.id] = [n];
            } else {
                var ans = [];
                GUtil.eachSubnode(par[0], function(sn) {
                    ans.push(sn);
                });
                siblings[n.id] = ans;
            }
        });
        return siblings;
    }
});

/*
   Class: ST.Geom

    Performs low level geometrical computations.

   Access:

   This instance can be accessed with the _geom_ parameter of the st instance created.

   Example:

   (start code js)
    var st = new ST(canvas, config);
    st.geom.translate //or can also call any other <ST.Geom> method
   (end code)

*/

$jit.ST.Geom = new Class({
    
    initialize: function(viz) {
        this.viz = viz;
        this.config = viz.config;
        this.node = viz.config.Node;
        this.edge = viz.config.Edge;
    },
    
    /*
       Method: translate
       
       Applies a translation to the tree.

       Parameters:

       pos - A <Complex> number specifying translation vector.
       prop - A <Graph.Node> position property ('pos', 'startPos' or 'endPos').

       Example:

       (start code js)
         st.geom.translate(new Complex(300, 100), 'endPos');
       (end code)
    */  
    translate: function(pos, prop) {
        prop = $.splat(prop);
        Graph.Util.eachNode(this.viz.graph, function(elem) {
            $.each(prop, function(p) { elem[p].$add(pos); });
        });
    },

    /*
       Changes the tree current orientation to the one specified.

       You should usually use <ST.switchPosition> instead.
    */  
    switchOrientation: function(orn) {
    	this.config.orientation = orn;
    },

    /*
       Makes a value dispatch according to the current layout
       Works like a CSS property, either _top-right-bottom-left_ or _top|bottom - left|right_.
     */
    dispatch: function() {
    	  // TODO(nico) should store Array.prototype.slice.call somewhere.
        var args = Array.prototype.slice.call(arguments);
        var s = args.shift(), len = args.length;
        var val = function(a) { return typeof a == 'function'? a() : a; };
        if(len == 2) {
            return (s == "top" || s == "bottom")? val(args[0]) : val(args[1]);
        } else if(len == 4) {
            switch(s) {
                case "top": return val(args[0]);
                case "right": return val(args[1]);
                case "bottom": return val(args[2]);
                case "left": return val(args[3]);
            }
        }
        return undefined;
    },

    /*
       Returns label height or with, depending on the tree current orientation.
    */  
    getSize: function(n, invert) {
        var data = n.data, config = this.config;
        var siblingOffset = config.siblingOffset;
        var s = (config.multitree 
        		&& ('$orn' in data) 
        		&& data.$orn) || config.orientation;
        var w = n.getData('width') + siblingOffset;
        var h = n.getData('height') + siblingOffset;
        if(!invert)
            return this.dispatch(s, h, w);
        else
            return this.dispatch(s, w, h);
    },
    
    /*
       Calculates a subtree base size. This is an utility function used by _getBaseSize_
    */  
    getTreeBaseSize: function(node, level, leaf) {
        var size = this.getSize(node, true), baseHeight = 0, that = this;
        if(leaf(level, node)) return size;
        if(level === 0) return 0;
        Graph.Util.eachSubnode(node, function(elem) {
            baseHeight += that.getTreeBaseSize(elem, level -1, leaf);
        });
        return (size > baseHeight? size : baseHeight) + this.config.subtreeOffset;
    },


    /*
       Method: getEdge
       
       Returns a Complex instance with the begin or end position of the edge to be plotted.

       Parameters:

       node - A <Graph.Node> that is connected to this edge.
       type - Returns the begin or end edge position. Possible values are 'begin' or 'end'.

       Returns:

       A <Complex> number specifying the begin or end position.
    */  
    getEdge: function(node, type, s) {
    	var $C = function(a, b) { 
          return function(){
            return node.pos.add(new Complex(a, b));
          }; 
        };
        var dim = this.node;
        var w = node.getData('width');
        var h = node.getData('height');

        if(type == 'begin') {
            if(dim.align == "center") {
                return this.dispatch(s, $C(0, h/2), $C(-w/2, 0),
                                     $C(0, -h/2),$C(w/2, 0));
            } else if(dim.align == "left") {
                return this.dispatch(s, $C(0, h), $C(0, 0),
                                     $C(0, 0), $C(w, 0));
            } else if(dim.align == "right") {
                return this.dispatch(s, $C(0, 0), $C(-w, 0),
                                     $C(0, -h),$C(0, 0));
            } else throw "align: not implemented";
            
            
        } else if(type == 'end') {
            if(dim.align == "center") {
                return this.dispatch(s, $C(0, -h/2), $C(w/2, 0),
                                     $C(0, h/2),  $C(-w/2, 0));
            } else if(dim.align == "left") {
                return this.dispatch(s, $C(0, 0), $C(w, 0),
                                     $C(0, h), $C(0, 0));
            } else if(dim.align == "right") {
                return this.dispatch(s, $C(0, -h),$C(0, 0),
                                     $C(0, 0), $C(-w, 0));
            } else throw "align: not implemented";
        }
    },

    /*
       Adjusts the tree position due to canvas scaling or translation.
    */  
    getScaledTreePosition: function(node, scale) {
        var dim = this.node;
        var w = node.getData('width');
        var h = node.getData('height');
        var s = (this.config.multitree 
        		&& ('$orn' in node.data) 
        		&& node.data.$orn) || this.config.orientation;

        var $C = function(a, b) { 
          return function(){
            return node.pos.add(new Complex(a, b)).$scale(1 - scale);
          }; 
        };
        if(dim.align == "left") {
            return this.dispatch(s, $C(0, h), $C(0, 0),
                                 $C(0, 0), $C(w, 0));
        } else if(dim.align == "center") {
            return this.dispatch(s, $C(0, h / 2), $C(-w / 2, 0),
                                 $C(0, -h / 2),$C(w / 2, 0));
        } else if(dim.align == "right") {
            return this.dispatch(s, $C(0, 0), $C(-w, 0),
                                 $C(0, -h),$C(0, 0));
        } else throw "align: not implemented";
    },

    /*
       Method: treeFitsInCanvas
       
       Returns a Boolean if the current subtree fits in canvas.

       Parameters:

       node - A <Graph.Node> which is the current root of the subtree.
       canvas - The <Canvas> object.
       level - The depth of the subtree to be considered.
    */  
    treeFitsInCanvas: function(node, canvas, level) {
        var csize = canvas.getSize(node);
        var s = (this.config.multitree 
        		&& ('$orn' in node.data) 
        		&& node.data.$orn) || this.config.orientation;

        var size = this.dispatch(s, csize.width, csize.height);
        var baseSize = this.getTreeBaseSize(node, level, function(level, node) { 
          return level === 0 || !Graph.Util.anySubnode(node);
        });
        return (baseSize < size);
    },
    
    /*
       Hides levels of the tree until it properly fits in canvas.
    */  
    setRightLevelToShow: function(node, canvas) {
        var level = this.getRightLevelToShow(node, canvas), fx = this.viz.labels;
        Graph.Util.eachLevel(node, 0, this.config.levelsToShow, function(n) {
            var d = n._depth - node._depth;
            if(d > level) {
                n.drawn = false; 
                n.exist = false; 
                fx.hideLabel(n, false);
            } else {
                n.exist = true;
            }
        });
        node.drawn= true;
    },
    
    /*
       Returns the right level to show for the current tree in order to fit in canvas.
    */  
    getRightLevelToShow: function(node, canvas) {
        var config = this.config;
    	var level = config.levelsToShow;
    	var constrained = config.constrained;
        if(!constrained) return level;
        while(!this.treeFitsInCanvas(node, canvas, level) && level > 1) { level-- ; }
        return level;
    }

});

/*
   Object: ST.Plot
    
   Performs plotting operations.

   Extends:

   All <Graph.Plot> methods

   Access:

   This instance can be accessed with the _fx_ parameter of the st instance created.

   Example:

   (start code js)
    var st = new ST(canvas, config);
    st.fx.animate //or can also call any other <ST.Plot> method
   (end code)


*/
$jit.ST.Plot = new Class({
    
    Implements: Graph.Plot,
    
    initialize: function(viz) {
        this.viz = viz;
        this.config = viz.config;
        this.node = this.config.Node;
        this.edge = this.config.Edge;
        this.animation = new Animation;
        this.nodeTypes = new $jit.ST.Plot.NodeTypes;
        this.edgeTypes = new $jit.ST.Plot.EdgeTypes;        
        this.labels = viz.labels;
    },
    
    /*
       Plots a subtree from the spacetree.
    */
    plotSubtree: function(node, opt, scale, animating) {
        var viz = this.viz, canvas = viz.canvas, config = viz.config;
        scale = Math.min(Math.max(0.001, scale), 1);
        if(scale >= 0) {
            node.drawn = false;     
            var ctx = canvas.getCtx();
            var diff = viz.geom.getScaledTreePosition(node, scale);
            ctx.translate(diff.x, diff.y);
            ctx.scale(scale, scale);
        }
        this.plotTree(node, $.merge(opt, {
          'withLabels': true,
          'hideLabels': !!scale,
          'plotSubtree': function(n, ch) {
            var root = config.multitree && !('$orn' in node.data);
            var orns = root && node.getData('orns');
            return !root || orns.indexOf(elem.getData('orn')) > -1;
          }
        }), animating);
        if(scale >= 0) node.drawn = true;
    },   
   
    getAlignedPos: function(pos, width, height) {
        var nconfig = this.node;
        var square, orn;
        if(nconfig.align == "center") {
            square = {
                x: pos.x - width / 2,
                y: pos.y - height / 2
            };
        } else if (nconfig.align == "left") {
            orn = this.config.orientation;
            if(orn == "bottom" || orn == "top") {
                square = {
                    x: pos.x - width / 2,
                    y: pos.y
                };
            } else {
                square = {
                    x: pos.x,
                    y: pos.y - height / 2
                };
            }
        } else if(nconfig.align == "right") {
            orn = this.config.orientation;
            if(orn == "bottom" || orn == "top") {
                square = {
                    x: pos.x - width / 2,
                    y: pos.y - height
                };
            } else {
                square = {
                    x: pos.x - width,
                    y: pos.y - height / 2
                };
            }
        } else throw "align: not implemented";
        
        return square;
    },
    
    getOrientation: function(adj) {
    	var config = this.config;
    	var orn = config.orientation;

    	if(config.multitree) {
        	var nodeFrom = adj.nodeFrom;
        	var nodeTo = adj.nodeTo;
    		orn = (('$orn' in nodeFrom.data) 
        		&& nodeFrom.data.$orn) 
        		|| (('$orn' in nodeTo.data) 
        		&& nodeTo.data.$orn);
    	}

    	return orn; 
    }
});

/*
  Object: ST.Label

  Label interface implementation for the ST

  See Also:

  <Graph.Label>, <ST.Label.HTML>, <RGraph.Label.SVG>

 */ 
$jit.ST.Label = {};

/*
   Class: ST.Label.Native

   Implements labels natively, using the Canvas text API.

   Extends:

   <Graph.Label.Native>

   See also:

   <ST.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
$jit.ST.Label.Native = new Class({
  Extends: Graph.Label.Native,
  /*
       Method: plotLabel
    
       Plots a label for a given node.

       Parameters:

       canvas - A <Canvas> instance.
       node - A <Graph.Node>.
       controller - A configuration object. See also <Hypertree>, <RGraph>, <ST>.

    */
    plotLabel: function(canvas, node, controller) {
        var ctx = canvas.getCtx();
        var coord = node.pos.getc(true);
        ctx.save();
        ctx.fillStyle = ctx.strokeStyle = '#000';
        ctx.fillText(node.name, coord.x, coord.y);
        ctx.restore();
    }
});

$jit.ST.Label.DOM = new Class({
  Implements: Graph.Label.DOM,

  /* 
      Method: placeLabel

      Overrides abstract method placeLabel in <Graph.Plot>.

      Parameters:

      tag - A DOM label element.
      node - A <Graph.Node>.
      controller - A configuration/controller object passed to the visualization.
     
    */
    placeLabel: function(tag, node, controller) {
        var pos = node.pos.getc(true), config = this.viz.config, 
        dim = config.Node, canvas = this.viz.canvas;
        var w = node.getData('width');
        var h = node.getData('height');
        var radius = canvas.getSize();
        var labelPos, orn;
        if(dim.align == "center") {
            labelPos= {
                x: Math.round(pos.x - w / 2 + radius.width/2),
                y: Math.round(pos.y - h / 2 + radius.height/2)
            };
        } else if (dim.align == "left") {
            orn = config.orientation;
            if(orn == "bottom" || orn == "top") {
                labelPos= {
                    x: Math.round(pos.x - w / 2 + radius.width/2),
                    y: Math.round(pos.y + radius.height/2)
                };
            } else {
                labelPos= {
                    x: Math.round(pos.x + radius.width/2),
                    y: Math.round(pos.y - h / 2 + radius.height/2)
                };
            }
        } else if(dim.align == "right") {
            orn = config.orientation;
            if(orn == "bottom" || orn == "top") {
                labelPos= {
                    x: Math.round(pos.x - w / 2 + radius.width/2),
                    y: Math.round(pos.y - h + radius.height/2)
                };
            } else {
                labelPos= {
                    x: Math.round(pos.x - w + radius.width/2),
                    y: Math.round(pos.y - h / 2 + radius.height/2)
                };
            }
        } else throw "align: not implemented";

        var style = tag.style;
        style.left = labelPos.x + 'px';
        style.top  = labelPos.y + 'px';
        style.display = this.fitsInCanvas(labelPos, canvas)? '' : 'none';
        controller.onPlaceLabel(tag, node);
    }
});

/*
   Class: ST.Label.SVG

   Implements labels using SVG (currently not supported in IE).

   Extends:

   <ST.Label.DOM>, <Graph.Label.SVG>

   See also:

   <ST.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
$jit.ST.Label.SVG = new Class({
  Implements: [$jit.ST.Label.DOM, Graph.Label.SVG],

  initialize: function(viz) {
    this.viz = viz;
  }
});

/*
   Class: ST.Label.HTML

   Implements labels using plain old HTML.

   Extends:

   <ST.Label.DOM>, <Graph.Label.HTML>

   See also:

   <ST.Label>, <Hypertree.Label>, <ST.Label>, <Hypertree>, <RGraph>, <ST>, <Graph>.

*/
$jit.ST.Label.HTML = new Class({
  Implements: [$jit.ST.Label.DOM, Graph.Label.HTML],

  initialize: function(viz) {
    this.viz = viz;
  }
});


/*
  Class: ST.Plot.NodeTypes

  Here are implemented all kinds of node rendering functions. 
  Rendering functions implemented are 'none', 'circle', 'ellipse', 'rectangle' and 'square'.

  You can add new Node types by implementing a new method in this class

  Example:

  (start code js)
    ST.Plot.NodeTypes.implement({
      'newnodetypename': function(node, canvas) {
        //Render my node here.
      }
    });
  (end code)

*/
$jit.ST.Plot.NodeTypes = new Class({
  'circle': {
    'render': function(node, canvas) {
      var pos = node.pos.getc(true);
      var dim  = node.getData('dim');
      var algnPos = this.getAlignedPos(pos, dim, dim);
      canvas.path('fill', function(context) {
          context.arc(algnPos.x + dim/2, algnPos.y + dim/2, dim/2, 0, Math.PI * 2, true);            
      });
    },
    'contains': $.lambda(false)
  },

  'square': {
    'render': function(node, canvas) {
      var pos = node.pos.getc(true);
      var dim  = node.getData('dim');
      var algnPos = this.getAlignedPos(pos, dim, dim);
      canvas.getCtx().fillRect(algnPos.x, algnPos.y, dim, dim);
    },
    'contains': $.lambda(false)
  },

  'ellipse': {
    'render': function(node, canvas) {
      var pos = node.pos.getc(true);
      var width  = node.getData('width') / 2;
      var height = node.getData('height') / 2;
      var algnPos = this.getAlignedPos(pos, width * 2, height * 2);
      var ctx = canvas.getCtx();
      ctx.save();
      ctx.scale(width / height, height / width);
      canvas.path('fill', function(context) {
          context.arc((algnPos.x + width) * (height / width), 
              (algnPos.y + height) * (width / height), height, 0, Math.PI * 2, true);            
      });
      ctx.restore();
    },
    'contains': $.lambda(false)
  },

  'rectangle': {
    'render': function(node, canvas) {
      var pos = node.pos.getc(true);
      var width  = node.getData('width');
      var height = node.getData('height');
      var algnPos = this.getAlignedPos(pos, width, height);
      canvas.getCtx().fillRect(algnPos.x, algnPos.y, width, height);
    },
    'contains': $.lambda(false)
  }
});

/*
  Class: ST.Plot.EdgeTypes

  Here are implemented all kinds of edge rendering functions. 
  Rendering functions implemented are 'none', 'line', 'quadratic:begin', 'quadratic:end', 'bezier' and 'arrow'.

  You can add new Edge types by implementing a new method in this class

  Example:

  (start code js)
    ST.Plot.EdgeTypes.implement({
      'newedgetypename': function(adj, canvas) {
        //Render my edge here.
      }
    });
  (end code)

*/
$jit.ST.Plot.EdgeTypes = new Class({
    'none': function() {},
    
    'line': function(adj, canvas) {
    	var orn = this.getOrientation(adj);
    	var nodeFrom = adj.nodeFrom, nodeTo = adj.nodeTo;
        var begin = this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeFrom:nodeTo, 'begin', orn);
        var end =  this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeTo:nodeFrom, 'end', orn);
        canvas.path('stroke', function(ctx) {
            ctx.moveTo(begin.x, begin.y);
            ctx.lineTo(end.x, end.y);
        });
    },
    
    'quadratic:begin': function(adj, canvas) {
    	var orn = this.getOrientation(adj);
        var data = adj.data, econfig = this.edge;
    	var nodeFrom = adj.nodeFrom, nodeTo = adj.nodeTo;
        var begin = this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeFrom:nodeTo, 'begin', orn);
        var end =  this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeTo:nodeFrom, 'end', orn);
        var dim = adj.getData('dim');
        switch(orn) {
            case "left":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(begin.x + dim, begin.y, end.x, end.y);
                });
                break;
            case "right":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(begin.x - dim, begin.y, end.x, end.y);
                });
                break;
            case "top":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(begin.x, begin.y + dim, end.x, end.y);
                });
                break;
            case "bottom":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(begin.x, begin.y - dim, end.x, end.y);
                });
                break;
        }
    },

    'quadratic:end': function(adj, canvas) {
    	var orn = this.getOrientation(adj);
        var data = adj.data, econfig = this.edge;
    	var nodeFrom = adj.nodeFrom, nodeTo = adj.nodeTo;
        var begin = this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeFrom:nodeTo, 'begin', orn);
        var end =  this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeTo:nodeFrom, 'end', orn);
        var dim = adj.getData('dim');
        switch(orn) {
            case "left":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(end.x - dim, end.y, end.x, end.y);
                });
                break;
            case "right":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(end.x + dim, end.y, end.x, end.y);
                });
                break;
            case "top":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(end.x, end.y - dim, end.x, end.y);
                });
                break;
            case "bottom":
                canvas.path('stroke', function(ctx){
                    ctx.moveTo(begin.x, begin.y);
                    ctx.quadraticCurveTo(end.x, end.y + dim, end.x, end.y);
                });
                break;
        }
    },

    'bezier': function(adj, canvas) {
        var data = adj.data, econfig = this.edge;
    	var orn = this.getOrientation(adj);
    	var nodeFrom = adj.nodeFrom, nodeTo = adj.nodeTo;
        var begin = this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeFrom:nodeTo, 'begin', orn);
        var end =  this.viz.geom.getEdge(nodeFrom._depth < nodeTo._depth? nodeTo:nodeFrom, 'end', orn);
        var dim = adj.getData('dim');
        switch(orn) {
            case "left":
                canvas.path('stroke', function(ctx) {
                    ctx.moveTo(begin.x, begin.y);
                    ctx.bezierCurveTo(begin.x + dim, begin.y, end.x - dim, end.y, end.x, end.y);
                });
                break;
            case "right":
                canvas.path('stroke', function(ctx) {
                    ctx.moveTo(begin.x, begin.y);
                    ctx.bezierCurveTo(begin.x - dim, begin.y, end.x + dim, end.y, end.x, end.y);
                });
                break;
            case "top":
                canvas.path('stroke', function(ctx) {
                    ctx.moveTo(begin.x, begin.y);
                    ctx.bezierCurveTo(begin.x, begin.y + dim, end.x, end.y - dim, end.x, end.y);
                });
                break;
            case "bottom":
                canvas.path('stroke', function(ctx) {
                    ctx.moveTo(begin.x, begin.y);
                    ctx.bezierCurveTo(begin.x, begin.y - dim, end.x, end.y + dim, end.x, end.y);
                });
                break;
        }
    },

    'arrow': function(adj, canvas) {
    	var orn = this.getOrientation(adj);
    	var node = adj.nodeFrom, child = adj.nodeTo;
      var data = adj.data, econfig = this.edge;
      // get edge dim
      var cond = econfig.overridable;
      var edgeDim = adj.getData('dim');
      // get edge direction
      if(cond && data.$direction && data.$direction.length > 1) {
          var nodeHash = {};
          nodeHash[node.id] = node;
          nodeHash[child.id] = child;
          var sense = data.$direction;
          node = nodeHash[sense[0]];
          child = nodeHash[sense[1]];
      }
      var posFrom = this.viz.geom.getEdge(node, 'begin', orn);
      var posTo =  this.viz.geom.getEdge(child, 'end', orn);
      var vect = new Complex(posTo.x - posFrom.x, posTo.y - posFrom.y);
      vect.$scale(edgeDim / vect.norm());
      var intermediatePoint = new Complex(posTo.x - vect.x, posTo.y - vect.y);
      var normal = new Complex(-vect.y / 2, vect.x / 2);
      var v1 = intermediatePoint.add(normal), v2 = intermediatePoint.$add(normal.$scale(-1));
      canvas.path('stroke', function(context) {
          context.moveTo(posFrom.x, posFrom.y);
          context.lineTo(posTo.x, posTo.y);
      });
      canvas.path('fill', function(context) {
          context.moveTo(v1.x, v1.y);
          context.lineTo(v2.x, v2.y);
          context.lineTo(posTo.x, posTo.y);
      });
    }
});



/*
 * File: Sunburst.js
 * 
 * Implements the <Sunburst> class and other derived classes.
 *
 * Description:
 *
 * A radial layout of a tree puts the root node on the center of the canvas, places its children on the first concentric ring away from the root node, its grandchildren on a second concentric ring, and so on...
 *
 * Ka-Ping Yee, Danyel Fisher, Rachna Dhamija and Marti Hearst introduced a very interesting paper called "Animated Exploration of Dynamic Graphs with Radial Layout". In this paper they describe a way to animate a radial layout of a tree with ease-in and ease-out transitions, which make transitions from a graph's state to another easier to understand for the viewer.
 *
 * Inspired by:
 *
 * Animated Exploration of Dynamic Graphs with Radial Layout (Ka-Ping Yee, Danyel Fisher, Rachna Dhamija, Marti Hearst)
 *
 * <http://bailando.sims.berkeley.edu/papers/infovis01.htm>
 *
 * Disclaimer:
 *
 * This visualization was built from scratch, taking only the paper as inspiration, and only shares some features with this paper.
 *
 * 
 */

/*
   Class: Sunburst
      
     The main Sunburst class

     Extends:

     <Loader>, <Tips>, <NodeStyles>, <Layouts.Radial>

     Parameters:

     canvas - A <Canvas> Class
     config - A configuration/controller object.

     Configuration:
    
     The configuration object can have the following properties (all properties are optional and have a default value)
     
     *General*

     - _interpolation_ Interpolation type used for animations. Possible options are 'polar' and 'linear'. Default's 'linear'.
     - _levelDistance_ Distance between a parent node and its children. Default's 100.
     - _withLabels_ Whether the visualization should use/create labels or not. Default's *true*.

     *Node*
     
     Customize the visualization nodes' shape, color, and other style properties.

     Inherits options from <Options.Graph.Node>.

     *Edge*

     Customize the visualization edges' shape, color, and other style properties.

     Inherits Options from <Options.Graph.Edge>.
      
    *Animations*

    Inherits from <Options.Animation>.
     
    *Controller options*

    Inherits from <Options.Controller>.
    
    Instance Properties:

    - _graph_ Access a <Graph> instance.
    - _op_ Access a <Sunburst.Op> instance.
    - _fx_ Access a <Sunburst.Plot> instance.
    - _labels_ Access a <Sunburst.Label> interface implementation.

    Example:

    Here goes a complete example. In most cases you won't be forced to implement all properties and methods. In fact, 
    all configuration properties  have the default value assigned.

    I won't be instantiating a <Canvas> class here. If you want to know more about instantiating a <Canvas> class 
    please take a look at the <Canvas> class documentation.

    (start code js)
      var sunburst = new Sunburst(canvas, {
        interpolation: 'linear',
        levelDistance: 100,
        withLabels: true,
        Node: {
          overridable: false,
          type: 'circle',
          color: '#ccb',
          lineWidth: 1,
          height: 5,
          width: 5,
          dim: 3
        },
        Edge: {
          overridable: false,
          type: 'line',
          color: '#ccb',
          lineWidth: 1
        },
        duration: 2500,
        fps: 40,
        transition: Trans.Quart.easeInOut,
        clearCanvas: true,
        onBeforeCompute: function(node) {
          //do something onBeforeCompute
        },
        onAfterCompute:  function () {
          //do something onAfterCompute
        },
        onCreateLabel:   function(domElement, node) {
          //do something onCreateLabel
        },
        onPlaceLabel:    function(domElement, node) {
          //do something onPlaceLabel
        },
        onBeforePlotNode:function(node) {
          //do something onBeforePlotNode
        },
        onAfterPlotNode: function(node) {
          //do something onAfterPlotNode
        },
        onBeforePlotLine:function(adj) {
          //do something onBeforePlotLine
        },
        onAfterPlotLine: function(adj) {
          //do something onAfterPlotLine
        }
      });
    (end code)

*/

$jit.Sunburst = new Class({

  Implements: [ Loader, Extras, Layouts.Radial ],

  initialize: function(controller) {
    var $Sunburst = $jit.Sunburst;

    var config = {
      interpolation: 'linear',
      levelDistance: 100,
      withLabels: true,
      Node: {
        'type': 'multipie'
      },
      Edge: {
        'type': 'none'
      }
    };

    this.controller = this.config = $.merge(Options("Canvas", "Node", "Edge",
        "Fx", "Tips", "NodeStyles", "Controller"), config, controller);

    var canvasConfig = this.config;
    if(canvasConfig.useCanvas) {
      this.canvas = canvasConfig.useCanvas;
      this.config.labelContainer = this.canvas.id + '-label';
    } else {
      this.canvas = new Canvas(canvasConfig);
      this.config.labelContainer = canvasConfig.injectInto + '-label';
    }

    this.graphOptions = {
      'complex': false,
      'Node': {
        'selected': false,
        'exist': true,
        'drawn': true
      }
    };
    this.graph = new Graph(this.graphOptions, this.config.Node,
        this.config.Edge);
    this.labels = new $Sunburst.Label[canvasConfig.labels](this);
    this.fx = new $Sunburst.Plot(this);
    this.op = new $Sunburst.Op(this);
    this.json = null;
    this.root = null;
    this.rotated = null;
    this.busy = false;
    // initialize extras
    this.initializeExtras();
  },

  /* 
  
    Method: createLevelDistanceFunc 
  
    Returns the levelDistance function used for calculating a node distance 
    to its origin. This function returns a function that is computed 
    per level and not per node, such that all nodes with the same depth will have the 
    same distance to the origin. The resulting function gets the 
    parent node as parameter and returns a float.

   */
  createLevelDistanceFunc: function() {
    var ld = this.config.levelDistance;
    return function(elem) {
      return (elem._depth + 1) * ld;
    };
  },

  /* 
     Method: refresh 
     
     Computes nodes' positions and replots the tree.

   */
  refresh: function() {
    this.compute();
    this.plot();
  },

  /*
   Method: reposition
  
   An alias for computing new positions to _endPos_

   See also:

   <Sunburst.compute>
   
  */
  reposition: function() {
    this.compute('end');
  },

  /*
  Method: rotate
  
  Rotates the graph so that the selected node is horizontal on the right.

  Parameters:
  
  node - A <Graph.Node>.
  method - _(string)_ Whether to perform an animation or just replot the graph. Possible values are "replot" or "animate".
  opt - _(object)_ Configuration options merged with this visualization configuration options.
  
  See also:

  <Sunburst.rotateAngle>
  
  */
  rotate: function(node, method, opt) {
    var theta = node.getPos(opt.property || 'current').getp(true).theta;
    this.rotated = node;
    this.rotateAngle(-theta, method, opt);
  },

  /*
  Method: rotateAngle
  
  Rotates the graph with an angle theta.
  
   Parameters:
   
   node - A <Graph.Node>.
   method - _(string)_ Whether to perform an animation or just replot the graph. Possible values are "replot" or "animate".
   opt - _(object)_ Configuration options merged with this visualization configuration options.
   
   See also:

   <Sunburst.rotate>
  
  */
  rotateAngle: function(theta, method, opt) {
    opt = $.merge(this.config, opt || {}, {
      modes: [ 'polar' ]
    });
    var prop = opt.property || (method === "animate" ? 'end' : 'current');
    Graph.Util.eachNode(this.graph, function(n) {
      var p = n.getPos(prop);
      p.theta += theta;
      if (p.theta < 0) {
        p.theta += Math.PI * 2;
      }
    });
    if (method === "animate") {
      this.fx.animate(opt);
    } else if (method === "replot") {
      this.fx.plot();
    }
  },

  /*
   Method: plot
  
   Plots the Sunburst
  */
  plot: function() {
    this.fx.plot();
  }
});

$jit.Sunburst.$extend = true;

(function(Sunburst) {

  /*
     Class: Sunburst.Op

     Performs advanced operations on trees and graphs.

     Extends:

     All <Graph.Op> methods

     Access:

     This instance can be accessed with the _op_ parameter of the <Sunburst> instance created.

     Example:

     (start code js)
      var sunburst = new Sunburst(canvas, config);
      sunburst.op.morph //or can also call any other <Graph.Op> method
     (end code)
     
  */
  Sunburst.Op = new Class( {

    Implements: Graph.Op,

    initialize: function(viz) {
      this.viz = viz;
    }
  });

  /*
     Class: Sunburst.Plot

     Performs plotting operations.

     Extends:

     All <Graph.Plot> methods

     Access:

     This instance can be accessed with the _fx_ parameter of the <Sunburst> instance created.

     Example:

     (start code js)
      var sunburst = new Sunburst(canvas, config);
      sunburst.fx.placeLabel //or can also call any other <Sunburst.Plot> method
     (end code)

  */
  Sunburst.Plot = new Class( {

    Implements: Graph.Plot,

    initialize: function(viz) {
      this.viz = viz;
      this.config = viz.config;
      this.node = viz.config.Node;
      this.edge = viz.config.Edge;
      this.animation = new Animation;
      this.nodeTypes = new Sunburst.Plot.NodeTypes;
      this.edgeTypes = new Sunburst.Plot.EdgeTypes;
      this.labels = viz.labels;
    }
  });

  /*
    Object: Sunburst.Label

    Label interface implementation for the Sunburst

    See Also:

    <Graph.Label>, <Sunburst.Label.HTML>, <Sunburst.Label.SVG>

   */
  Sunburst.Label = {};

  /*
     Class: Sunburst.Label.Native

     Implements labels natively, using the Canvas text API.

     Extends:

     <Graph.Label.Native>

     See also:

     <Hypertree.Label>, <Sunburst.Label>, <ST.Label>, <Hypertree>, <Sunburst>, <ST>, <Graph>.

  */
  Sunburst.Label.Native = new Class( {
    Implements: Graph.Label.Native,

    initialize: function(viz) {
      this.viz = viz;
    },

    plotLabel: function(canvas, node, controller) {
      var ctx = canvas.getCtx();
      var measure = ctx.measureText(node.name);
      if (node.id == this.viz.root) {
        var x = -measure.width / 2, y = 0, thetap = 0;
        var ld = 0;
      } else {
        var indent = 5;
        var ld = controller.levelDistance - indent;
        var clone = node.pos.clone();
        clone.rho += indent;
        var p = clone.getp(true);
        var ct = clone.getc(true);
        var x = ct.x, y = ct.y;
        // get angle in degrees
    var pi = Math.PI;
    var cond = (p.theta > pi / 2 && p.theta < 3 * pi / 2);
    var thetap = cond ? p.theta + pi : p.theta;
    if (cond) {
      x -= Math.abs(Math.cos(p.theta) * measure.width);
      y += Math.sin(p.theta) * measure.width;
    } else if (node.id == this.viz.root) {
      x -= measure.width / 2;
    }
  }
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.translate(x, y);
  ctx.rotate(thetap);
  ctx.fillText(node.name, 0, 0, ld);
  ctx.restore();
}
  });

  /*
     Class: Sunburst.Label.SVG

     Implements labels using SVG (currently not supported in IE).

     Extends:

     <Graph.Label.SVG>

     See also:

     <Hypertree.Label>, <Sunburst.Label>, <ST.Label>, <Hypertree>, <Sunburst>, <ST>, <Graph>.

  */
  Sunburst.Label.SVG = new Class( {
    Implements: Graph.Label.SVG,

    initialize: function(viz) {
      this.viz = viz;
    },

    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), viz = this.viz, canvas = this.viz.canvas;
      var radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x + radius.width / 2),
        y: Math.round(pos.y + radius.height / 2)
      };
      tag.setAttribute('x', labelPos.x);
      tag.setAttribute('y', labelPos.y);

      var bb = tag.getBBox();
      if (bb) {
        // center the label
    var x = tag.getAttribute('x');
    var y = tag.getAttribute('y');
    // get polar coordinates
    var p = node.pos.getp(true);
    // get angle in degrees
    var pi = Math.PI;
    var cond = (p.theta > pi / 2 && p.theta < 3 * pi / 2);
    if (cond) {
      tag.setAttribute('x', x - bb.width);
      tag.setAttribute('y', y - bb.height);
    } else if (node.id == viz.root) {
      tag.setAttribute('x', x - bb.width / 2);
    }

    var thetap = cond ? p.theta + pi : p.theta;
    tag.setAttribute('transform', 'rotate(' + thetap * 360 / (2 * pi) + ' ' + x
        + ' ' + y + ')');
  }

  controller.onPlaceLabel(tag, node);
}
  });

  /*
     Class: Sunburst.Label.HTML

     Implements labels using plain old HTML.

     Extends:

     <Graph.Label.HTML>

     See also:

     <Hypertree.Label>, <Sunburst.Label>, <ST.Label>, <Hypertree>, <Sunburst>, <ST>, <Graph>.

  */
  Sunburst.Label.HTML = new Class( {
    Implements: Graph.Label.HTML,

    initialize: function(viz) {
      this.viz = viz;
    },
    /* 
       Method: placeLabel

       Overrides abstract method placeLabel in <Graph.Plot>.

       Parameters:

       tag - A DOM label element.
       node - A <Graph.Node>.
       controller - A configuration/controller object passed to the visualization.
      
     */
    placeLabel: function(tag, node, controller) {
      var pos = node.pos.getc(true), canvas = this.viz.canvas;
      var radius = canvas.getSize();
      var labelPos = {
        x: Math.round(pos.x + radius.width / 2),
        y: Math.round(pos.y + radius.height / 2)
      };

      var style = tag.style;
      style.left = labelPos.x + 'px';
      style.top = labelPos.y + 'px';
      style.display = this.fitsInCanvas(labelPos, canvas) ? '' : 'none';

      controller.onPlaceLabel(tag, node);
    }
  });

  /*
    Class: Sunburst.Plot.NodeTypes

    Here are implemented all kinds of node rendering functions. 
    Rendering functions implemented are 'none', 'circle', 'triangle', 'rectangle', 'star' and 'square'.

    You can add new Node types by implementing a new method in this class

    Example:

    (start code js)
      Sunburst.Plot.NodeTypes.implement({
        'newnodetypename': {
          'plot': function(node, canvas) {
            //render my node here
          },
          'contains': function(node, pos) {
            //Optional
            //return if the position is in the node definition
            //return false otherwise.
          }
        }
      });
    (end code)

  */
  Sunburst.Plot.NodeTypes = new Class( {
    'none': {
      'render': $.empty,
      'contains': $.lambda(false),
      'anglecontains': function(node, pos) {
        var span = node.getData('span') / 2, theta = node.pos.theta;
        var begin = theta - span, end = theta + span;
        if (begin < 0)
          begin += Math.PI * 2;
        var atan = Math.atan2(pos.y, pos.x);
        if (atan < 0)
          atan += Math.PI * 2;
        if (begin > end) {
          return (atan > begin && atan <= Math.PI * 2) || atan < end;
        } else {
          return atan > begin && atan < end;
        }
      }
    },

    'pie': {
      'render': function(node, canvas) {
        var span = node.getData('span') / 2, theta = node.pos.theta;
        var begin = theta - span, end = theta + span;
        var polarNode = node.pos.getp(true);
        var polar = new Polar(polarNode.rho, begin);
        var p1coord = polar.getc(true);
        polar.theta = end;
        var p2coord = polar.getc(true);

        var ctx = canvas.getCtx();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(p1coord.x, p1coord.y);
        ctx.moveTo(0, 0);
        ctx.lineTo(p2coord.x, p2coord.y);
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, polarNode.rho * node.getData('dim-quotient'), begin, end,
            false);
        ctx.fill();
      },
      'contains': function(node, pos) {
        if (this.nodeTypes['none'].anglecontains.call(this, node, pos)) {
          var rho = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
          var ld = this.config.levelDistance, d = node._depth;
          return (rho <= ld * d);
        }
        return false;
      }
    },
    'multipie': {
      'render': function(node, canvas) {
        var ldist = this.config.levelDistance;
        var span = node.getData('span') / 2, theta = node.pos.theta;
        var begin = theta - span, end = theta + span;
        var polarNode = node.pos.getp(true);

        var polar = new Polar(polarNode.rho, begin);
        var p1coord = polar.getc(true);

        polar.theta = end;
        var p2coord = polar.getc(true);

        polar.rho += ldist;
        var p3coord = polar.getc(true);

        polar.theta = begin;
        var p4coord = polar.getc(true);

        var ctx = canvas.getCtx();
        ctx.moveTo(0, 0);
        ctx.beginPath();
        ctx.arc(0, 0, polarNode.rho, begin, end, false);
        ctx.arc(0, 0, polarNode.rho + ldist, end, begin, true);
        ctx.moveTo(p1coord.x, p1coord.y);
        ctx.lineTo(p4coord.x, p4coord.y);
        ctx.moveTo(p2coord.x, p2coord.y);
        ctx.lineTo(p3coord.x, p3coord.y);
        ctx.fill();

        if (node.collapsed) {
          ctx.save();
          ctx.lineWidth = 2;
          ctx.moveTo(0, 0);
          ctx.beginPath();
          ctx.arc(0, 0, polarNode.rho + ldist + 5, end - 0.01, begin + 0.01,
              true);
          ctx.stroke();
          ctx.restore();
        }
      },
      'contains': function(node, pos) {
        if (this.nodeTypes['none'].anglecontains.call(this, node, pos)) {
          var rho = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
          var ld = this.config.levelDistance, d = node._depth;
          return (rho >= ld * d) && (rho <= ld * (d + 1));
        }
        return false;
      }
    },

    'gradient-multipie': {
      'render': function(node, canvas) {
        var ctx = canvas.getCtx();
        var radialGradient = ctx.createRadialGradient(0, 0, node.getPos().rho,
            0, 0, node.getPos().rho + this.config.levelDistance);

        var colorArray = $.hexToRgb(node.getData('color')), ans = [];
        $.each(colorArray, function(i) {
          ans.push(parseInt(i * 0.5, 10));
        });
        var endColor = $.rgbToHex(ans);
        radialGradient.addColorStop(0, endColor);
        radialGradient.addColorStop(1, node.getData('color'));
        ctx.fillStyle = radialGradient;
        this.nodeTypes['multipie'].render.call(this, node, canvas);
      },
      'contains': function(node, pos) {
        return this.nodeTypes['multipie'].contains.call(this, node, pos);
      }
    },

    'gradient-pie': {
      'render': function(node, canvas) {
        var ctx = canvas.getCtx();
        var radialGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, node
            .getPos().rho);

        var colorArray = $.hexToRgb(node.getData('color')), ans = [];
        $.each(colorArray, function(i) {
          ans.push(parseInt(i * 0.5, 10));
        });
        var endColor = $.rgbToHex(ans);
        radialGradient.addColorStop(1, endColor);
        radialGradient.addColorStop(0, node.getData('color'));
        ctx.fillStyle = radialGradient;
        this.nodeTypes['pie'].render.call(this, node, canvas);
      },
      'contains': function(node, pos) {
        return this.nodeTypes['pie'].contains.call(this, node, pos);
      }
    }
  });

  /*
    Class: Sunburst.Plot.EdgeTypes

    Here are implemented all kinds of edge rendering functions. 
    Rendering functions implemented are 'none', 'line' and 'arrow'.

    You can add new Edge types by implementing a new method in this class

    Example:

    (start code js)
      Sunburst.Plot.EdgeTypes.implement({
        'newedgetypename': function(adj, canvas) {
          //Render my edge here.
        }
      });
    (end code)

  */
  Sunburst.Plot.EdgeTypes = new Class({
        'none': $.empty,

        'line': function(adj, canvas) {
          var pos = adj.nodeFrom.pos.getc(true);
          var posChild = adj.nodeTo.pos.getc(true);
          canvas.path('stroke', function(context) {
            context.moveTo(pos.x, pos.y);
            context.lineTo(posChild.x, posChild.y);
          });
        },

        'arrow': function(adj, canvas) {
          var node = adj.nodeFrom, child = adj.nodeTo;
          var data = adj.data, econfig = this.edge;
          // get edge dim
          var cond = econfig.overridable;
          var edgeDim = adj.getData('dim');
          // get edge direction
          if (cond && data.$direction && data.$direction.length > 1) {
            var nodeHash = {};
            nodeHash[node.id] = node;
            nodeHash[child.id] = child;
            var sense = data.$direction;
            node = nodeHash[sense[0]];
            child = nodeHash[sense[1]];
          }
          var posFrom = node.pos.getc(true), posTo = child.pos.getc(true);
          var vect = new Complex(posTo.x - posFrom.x, posTo.y - posFrom.y);
          vect.$scale(edgeDim / vect.norm());
          var intermediatePoint = new Complex(posTo.x - vect.x, posTo.y
              - vect.y);
          var normal = new Complex(-vect.y / 2, vect.x / 2);
          var v1 = intermediatePoint.add(normal), v2 = intermediatePoint
              .$add(normal.$scale(-1));
          canvas.path('stroke', function(context) {
            context.moveTo(posFrom.x, posFrom.y);
            context.lineTo(posTo.x, posTo.y);
          });
          canvas.path('fill', function(context) {
            context.moveTo(v1.x, v1.y);
            context.lineTo(v2.x, v2.y);
            context.lineTo(posTo.x, posTo.y);
          });
        },

        /*
        Plots a hyperline between two nodes. A hyperline is an arc of a circle which is orthogonal to the main circle. 

        Parameters:

        adj - A <Graph.Adjacence> object.
        canvas - A <Canvas> instance.
        */
        'hyperline': function(adj, canvas) {
          var node = adj.nodeFrom, child = adj.nodeTo, data = adj.data;
          var pos = node.pos.getc(), posChild = child.pos.getc();
          var r = node._depth > child._depth ? pos.norm() : posChild.norm(), rinv = 1 / r;
          pos.$scale(rinv);
          posChild.$scale(rinv);
          var centerOfCircle = computeArcThroughTwoPoints(pos, posChild);
          if (centerOfCircle.a > 1000 || centerOfCircle.b > 1000
              || centerOfCircle.ratio < 0) {
            canvas.path('stroke', function(ctx) {
              ctx.moveTo(pos.x * r, pos.y * r);
              ctx.lineTo(posChild.x * r, posChild.y * r);
            });
          } else {
            var angleBegin = Math.atan2(posChild.y - centerOfCircle.y,
                posChild.x - centerOfCircle.x);
            var angleEnd = Math.atan2(pos.y - centerOfCircle.y, pos.x
                - centerOfCircle.x);
            var sense = sense(angleBegin, angleEnd);
            canvas.path('stroke', function(ctx) {
              ctx.arc(centerOfCircle.x * r, centerOfCircle.y * r,
                  centerOfCircle.ratio * r, angleBegin, angleEnd, sense);
            });
          }

          /*      
            Calculates the arc parameters through two points.
            
            More information in <http://en.wikipedia.org/wiki/Poincar%C3%A9_disc_model#Analytic_geometry_constructions_in_the_hyperbolic_plane> 

            Parameters:

            p1 - A <Complex> instance.
            p2 - A <Complex> instance.
            scale - The Disk's diameter.

            Returns:

            An object containing some arc properties.
          */
          function computeArcThroughTwoPoints(p1, p2) {
            var aDen = (p1.x * p2.y - p1.y * p2.x), bDen = aDen;
            var sq1 = p1.squaredNorm(), sq2 = p2.squaredNorm();
            // Fall back to a straight line
            if (aDen == 0)
              return {
                x: 0,
                y: 0,
                ratio: -1
              };

            var a = (p1.y * sq2 - p2.y * sq1 + p1.y - p2.y) / aDen;
            var b = (p2.x * sq1 - p1.x * sq2 + p2.x - p1.x) / bDen;
            var x = -a / 2;
            var y = -b / 2;
            var squaredRatio = (a * a + b * b) / 4 - 1;
            // Fall back to a straight line
            if (squaredRatio < 0)
              return {
                x: 0,
                y: 0,
                ratio: -1
              };
            var ratio = Math.sqrt(squaredRatio);
            var out = {
              x: x,
              y: y,
              ratio: ratio > 1000 ? -1 : ratio,
              a: a,
              b: b
            };

            return out;
          }

          /*      
            Sets angle direction to clockwise (true) or counterclockwise (false). 
             
            Parameters: 
          
               angleBegin - Starting angle for drawing the arc. 
               angleEnd - The HyperLine will be drawn from angleBegin to angleEnd. 
          
            Returns: 
          
               A Boolean instance describing the sense for drawing the HyperLine. 
          */
          function sense(angleBegin, angleEnd) {
            return (angleBegin < angleEnd) ? ((angleBegin + Math.PI > angleEnd) ? false
                : true)
                : ((angleEnd + Math.PI > angleBegin) ? true : false);
          }
        }
      });

})($jit.Sunburst);




 })();
