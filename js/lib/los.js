"use strict";
define([], function () {
    var LOS = {};

    var canSee = function (level, start, end) {
        //handle orthoginal directions first
        if (start.x == end.x) {
            var min = Math.min(start.y, end.y);
            var max = Math.max(start.y, end.y);
            for (var i = min; i <= max; i++) {
                if (level.isSolid(start.x, i)) return false;
            }
            return true;
        }
        if (start.y == end.y) {
            var min = Math.min(start.x, end.x);
            var max = Math.max(start.x, end.x);
            for (var i = min; i <= max; i++) {
                if (level.isSolid(i, start.y)) return false;
            }
            return true;
        }

        //OK, it's a diagonal. Both x and y are different.

        //Trace a line from start to end.
        //sweep along the line horizontally, for every x position
        //we check each vertical strip - which may be one cell, or more

        //A special case when peering through the crack between corners
        //aO     Ob         a is looking at b
        //Ob     aO         if both Os are occupied, the view is blocked.

        //swap so X is always increasing.
        if (end.x < start.x) {
            var temp = end;
            end = start;
            start = temp;
        }

        var dX = (end.x - start.x); //always positive
        var dY = (end.y - start.y);
        var yRate = dY / dX; //when we add 1 to x, we must add yRate * 1 to y.

        var backwards = dY < 0;

        var x = start.x + 0.5;
        var y = start.y + 0.5;
        var firstHalf = null; //the value of the first half of the half-check. We need either side to be true to continue.

        while (x <= end.x) { //for each vertical strip of squares that the LOS passes through

            var xCell = Math.floor(x);
            var top1 = Math.floor(y);
            var topIsCorner1 = (y===Math.floor(y));

            //the first and last step are half-cells, because the start and end are in the centre of a cell
            var xDist = (x < start.x + 1 || x == end.x) ? 0.5 : 1.0;
            y += yRate * xDist;

            var bottom1 = Math.floor(y);
            var bottomIsCorner1 = (y===Math.floor(y));

            //for simplicity, we swap so each strip is always done y-low to y-high
            var top = backwards ? bottom1 : top1;
            var bottom = backwards ? top1 : bottom1;
            var topIsCorner = backwards ? bottomIsCorner1 : topIsCorner1;
            var bottomIsCorner = backwards ? topIsCorner1 : bottomIsCorner1;

            if (topIsCorner) {
                var thisHalf = (!level.isSolid(xCell, top-1));
                if (firstHalf === null) {
                    firstHalf = thisHalf;
                } else {
                    if (!firstHalf && !thisHalf) return false; //if both corners blocked our view
                    firstHalf = null; //we saw past this pair of corners
                }
            }

            if (bottomIsCorner) bottom--;

            for (var yCell = top; yCell <= bottom; yCell++) {
                if (level.isSolid(xCell, yCell)) return false;
            }

            if (bottomIsCorner) {
                var thisHalf = (!level.isSolid(xCell, bottom+1));
                if (firstHalf === null) {
                    firstHalf = thisHalf;
                } else {
                    if (!firstHalf && !thisHalf) return false; //if both corners blocked our view
                    firstHalf = null; //we saw past this pair of corners
                }
            }
            x += xDist;
        }
        return true;
    }
    LOS.canSee = canSee;
   return LOS;
});