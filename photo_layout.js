/*
TODO:
- solve extra gap on right
- add to luggage
*/


//drag and drop re-arrangement
function get_placeholder(el) {
  var $el = $(el);
  var $placeholder = $('<div natural-height="' + el.naturalHeight + '" natural-width="' + el.naturalWidth + '" class="photo-placeholder"></div>');
  $placeholder.insertBefore($el);
  $el.detach();
  $placeholder.css({
    width: $el.outerWidth(),
    height: $el.outerHeight()
  });

  return $placeholder;
}

move_photo = _.throttle(function ($moveEl, x, y) {
  var width = $moveEl.outerWidth();
  var height = $moveEl.outerHeight();
  var $el = $moveEl;
  var offset = $el.position();
  var before = true;

  console.log(x, y);
  console.log(x, '>', offset.left + (width / 4));
  console.log(x, '<', offset.left - (width / 4));

  var search = true;
  while ($el.length && search) {

    console.log('loop');
    offset = $el.position();
    if (y > offset.top + (height / 2)) {
      console.log('y next');
      $el.next();
      before = false;
    }
    else if ( y < offset.top - (height / 2)) {
      console.log('y prev');
      $el.prev();
      before = true;
    }
    else if (x > offset.left + (width / 2)) {
      console.log('x next');
      $el.next();
      before = false;
    }
    else if ( x < offset.left - (width / 2)) {
      console.log('x prev');
      $el.prev();
      before = true;
    }
    else {
      console.log('break');
      search = false;
    }

  }

  console.log('found a match');

  if (before) {
    $moveEl.insertBefore($el);
  }
  else {
    $moveEl.insertAfter($el);
  }


}, 100);


//Layouts
function set_image_height(els, rowHeight) {
  _.each(els, function (el) {
    var $el = $(el);
    if (el.naturalHeight) {
      $el.css({
        'width': rowHeight / el.naturalHeight * el.naturalWidth,
        'height': rowHeight
      });
    }
    else {
      $el.css({
        'width': rowHeight / $el.attr('natural-height') * $el.attr('natural-width'),
        'height': rowHeight
      });
    }
  });
}

function layout_tiles($container, targetHeight, rowWidth) {
  console.time('layout_tiles');
  var currentWidth = 0;
  var rowImgs = [];

  $container.children().each(function (idx, el) {
    var scaledWidth;
    if (el.naturalHeight) {
      //We have an image
      scaledWidth = (targetHeight / el.naturalHeight * el.naturalWidth);
    }
    else {
      //We have some other markup
      scaledWidth = (targetHeight / $(el).attr('natural-height') * $(el).attr('natural-width'));
    }

    if (currentWidth + scaledWidth < rowWidth) {
      currentWidth += scaledWidth;
      rowImgs.push(el);
    }
    else {

      var scale_up = (rowWidth - currentWidth < (currentWidth + scaledWidth) - rowWidth);

      if (!scale_up) {
        //scale images down by adding the next image to the row
        rowImgs.push(el);
        currentWidth += scaledWidth;
      }

      var rowHeight = rowWidth / currentWidth * targetHeight;

      //update heights
      set_image_height(rowImgs, rowHeight);

      rowImgs = [];
      currentWidth = 0;

      if (scale_up) {
        rowImgs.push(el);
        currentWidth = scaledWidth;
      }

    }
  });

  if (rowImgs.length) {
    set_image_height(rowImgs, targetHeight);
  }
  console.timeEnd('layout_tiles');
}

$(document).ready(function () {
  layout_tiles($('#canvas'), 250, $('body').width() - 16);

  $(window).on('resize', function () {
    layout_tiles($('#canvas'), 250, $('body').width() - 16);
  });

  $('img').on('mousedown', function (event) {
    var $placeholder = get_placeholder(event.currentTarget);
    console.log('start');
    $('body').on('mousemove.photodnd', function (event) {
      move_photo($placeholder, event.pageX, event.pageY);
    });

    $('body').on('mouseup.photodnd', function () {
      $('body').off('.photodnd');
      console.log('end');
    });
  });
});
