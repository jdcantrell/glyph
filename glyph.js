var data = [
  {type: "heading", content: 'Christmas and Cookies'},
  {
    type: 'text',
    content: 'Here is some text about these set of photos. We had a good time and did many things together. I think we\'ll do it all over again someday.'
  },
  {type: 'img', src: 'images/P1000795.JPG', width: 689, height: 517},
  {
    type: 'photo-row',
    content: [
      {type: 'scaled-img', src: 'images/P1000796.JPG', width: 689, height: 517},
      {type: 'scaled-img', src: 'images/P1000800.JPG', width: 689, height: 517},
      {type: 'scaled-img', src: 'images/P1000801.JPG', width: 689, height: 517},
      {type: 'scaled-img', src: 'images/P1000801.JPG', width: 689, height: 517, modifiers: ['highlight']}
    ]
  },
  {
    type: 'photo-row',
    content: [
      {type: 'scaled-img', src: 'images/P1000802.JPG', width: 689, height: 517},
      {type: 'scaled-img', src: 'images/P1000803.JPG', width: 689, height: 517},
      {type: 'scaled-img', src: 'images/P1000804.JPG', width: 517, height: 689},
      {type: 'scaled-img', src: 'images/P1000805.JPG', width: 689, height: 517}
    ]
  },
  {
    type: 'photo-row',
    content: [
      {type: 'scaled-img', src: 'images/P1000806.JPG', width: 517, height: 689},
      {type: 'scaled-img', src: 'images/P1000807.JPG', width: 517, height: 689}
    ]
  },
  {type: 'text', content: 'We also did some other things that were neat. You can see more about them below'},
  {type: 'img', src: 'images/P1000808.JPG', width: 517, height: 689},
  {type: 'img', src: 'images/P1000809.JPG', width: 517, height: 689}
];

var modifiers = {
  'highlight': function (data, el) {
    el.classList.add('highlight');
    return el;
  }
};

var renderers = {
  'heading': function (data) {
    var h1 = document.createElement('h1');
    h1.textContent = data.content;
    return h1;
  },
  'scaled-img': function (data) {
    var img = document.createElement('img');
    img.setAttribute('src', data.src);
    img.style.width = data.width + 'px';
    img.style.height = data.height + 'px';
    return img;
  },
  'img': function (data) {
    var img = document.createElement('img');
    img.setAttribute('src', data.src);
    return img;
  },
  'text': function (data) {
    var p = document.createElement('p');
    p.textContent = data.content;
    return p;
  },
  'placeholder': function (data) {
    var div = document.createElement('div');
    div.style.height = data.height + 'px';
    div.style.width = data.width + 'px';
    div.classList.add('placeholder');
    return div;
  },
  'photo-row': function (data) {
    var max_y = 0;
    data.content.forEach(function (item) {
      max_y = Math.max(item.height, max_y);
    });

    var full_width = 0;
    data.content.forEach(function (item) {
      full_width += (max_y / item.height) * item.width;
    });

    var scaling = (800 / full_width);

    var total_width = 0;
    var html = data.content.map(function (item) {
      item.parent = data;
      var y_scale = (max_y / item.height);
      var scale = scaling * y_scale;

      var width = Math.round(item.width * scale);
      total_width += width;

      //make sure rounding keeps us in safe spot
      if (total_width > 800) {
        width = width - (total_width - 800);
      }

      item.height = item.height * scale;
      item.width = width;
      return render_item(item);
    });

    var div = document.createElement('div');
    div.classList.add('photo-row');
    html.forEach(function (el) { div.appendChild(el); });

    return div;
  }
};


var render_map = {};
var key = 0;

function render_item(item) {
  if (!item.key) {
    item.key = key;
    render_map[key] = item;

    key += 1;
  }

  var el = renderers[item.type](item);
  el.setAttribute('data-key', item.key);
  if (item.modifiers) {
    item.modifiers.forEach(function (modifier) {
      modifiers[modifier](item, el);
    });
  }
  return el;
}

function render_content(data) {
  window.requestAnimationFrame(function () {
    var html = data.map(function (item) {
      return render_item(item);
    });

    var container = document.querySelector('.glyph-content');
    container.innerHTML = '';
    html.forEach(function (el) { container.appendChild(el); });
  });
}

function move_after(item, after) {
  var items = after.parent ? after.parent.content : data;
  var idx = items.indexOf(after);
  items = items.splice(idx, 0, item);
  item.parent = after.parent;
}

function remove(item) {
  var items = item.parent ? item.parent.content : data;
  var idx = items.indexOf(item);
  items = items.splice(idx, 1);
}

function find(data, attrs) {
  console.log('find', data, attrs);
  return data.find(function (item) {
    return Object.keys(attrs).every(function (key) {
      if (item[key]) {
        return (attrs[key] === item[key] || item[key].indexOf(attrs[key]) !== -1);
      }
      return false;
    }) || (item.content && item.content.find? typeof find(item.content, attrs) !== 'undefined' : false);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  render_content(data);
});

var state = {
  mode: 'select',
  selected: null,
  get_selected: function () {
    if (this.selected === null) {
      this.selected = find(data, {modifiers: 'highlight'});
    }
    return this.selected;
  }
};

var modes = {
  select: {
    up: function (data) {
      var item = state.get_selected();
      if (item.parent) {
        item = item.parent;
      }

      //no nesting so everything is on the top level
      var idx = data.indexOf(item);

      if (idx > 1) {
        var new_selection = data[idx - 1];
        if (Array.isArray(new_selection.content)) {
          new_selection = new_selection.content[0];
        }
        state.selected.modifiers = [];
        new_selection.modifiers = ['highlight'];
        state.selected = new_selection;
        render_content(data);
      }
    },
    down: function (data) {
      var item = state.get_selected();
      if (item.parent) {
        item = item.parent;
      }

      //no nesting so everything is on the top level
      var idx = data.indexOf(item);

      if (idx < data.length - 1) {
        var new_selection = data[idx + 1];
        if (Array.isArray(new_selection.content)) {
          new_selection = new_selection.content[0];
        }

        state.selected.modifiers = [];
        new_selection.modifiers = ['highlight'];
        state.selected = new_selection;
        render_content(data);
      }
    },
    right: function (data) {
      var item = state.get_selected();
      if (item.parent) {
        var row_data = item.parent.content;
        var idx = row_data.indexOf(item);
        if (idx < row_data.length - 1) {
          var new_selection = row_data[idx + 1];
          state.selected.modifiers = [];
          new_selection.modifiers = ['highlight'];
          state.selected = new_selection;
          render_content(data);
        }
      }
    },
    left: function (data) {
      var item = state.get_selected();
      if (item.parent) {
        var row_data = item.parent.content;
        var idx = row_data.indexOf(item);
        if (idx > 1) {
          var new_selection = row_data[idx - 1];
          state.selected.modifiers = [];
          new_selection.modifiers = ['highlight'];
          state.selected = new_selection;
          render_content(data);
        }
      }
    }
  }
};

document.addEventListener('keyup', function (event) {
  switch (event.keyCode) {
    case 38:
      modes[state.mode].up(data);
      break;
    case 40:
      modes[state.mode].down(data);
      break;
    case 37:
      modes[state.mode].left(data);
      break;
    case 39:
      modes[state.mode].right(data);
      break;
  }
});
