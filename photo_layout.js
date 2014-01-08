/*
TODO:
- margins around images
- solve extra gap on right
- add to luggage
*/
/* globals _ */
var rowWidth = 800;
var targetHeight = 200;

function set_image_height(imgs, rowHeight) {
  _.each(imgs, function (img) {
    $(img).css({
      'width': rowHeight / img.naturalHeight * img.naturalWidth,
      'height': rowHeight
    });
  });
}

function update_layout(targetHeight, rowWidth) {
  var currentWidth = 0;
  var rowImgs = [];

  $('img').each(function (idx, el) {
    var scaledWidth =(targetHeight / el.naturalHeight * el.naturalWidth);

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
}

$(document).ready(function () {
  update_layout(250, $('body').width() - 16);
  $(window).on('resize', function () {
    update_layout(250, $('body').width() - 16);
  });
});
