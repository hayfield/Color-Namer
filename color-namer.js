var Namer = {

    /**
        The main canvas
    */
    canvas: null,
    
    /**
        The canvas context
    */
    context: null,
    
    /**
        The set of colours currently being used for naming
    */
    colors: null,
    
    /**
        Draws an image with the specified file path in the top-left corner
    */
    drawImage: function( filePath ){
        var img = new Image();
        img.src = filePath;
        img.onload = function() {
            context.drawImage(img, 0, 0);
        };
    },
    
    /**
        Returns the rgba value at a specified coordinate on the canvas
        
        http://dev.opera.com/articles/view/html-5-canvas-the-basics/#pixelbasedmanipulation
        https://developer.mozilla.org/En/HTML/Canvas/Pixel_manipulation_with_canvas
    */
    getRGBA: function( x, y ){
        var r, g, b, a;
        var rgba = {};
        // http://blog.project-sierra.de/archives/1577
        // http://stackoverflow.com/questions/4121142/javascript-getimagedata-for-canvas-html5
        try {
            try { 
                var imgData = context.getImageData(x, y, 1, 1); 
            } catch( e ) { 
                netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                var imgData = context.getImageData(x, y, 1, 1);
            } 						 
        } catch (e) {
          throw new Error("unable to access image data: " + e)
        }
        
        var pixel = imgData.data;
        if( pixel.length === 4 ){
            rgba.r = pixel[0];
            rgba.g = pixel[1];
            rgba.b = pixel[2];
            rgba.a = pixel[3];
        }
        
        return rgba;
    },
    
    /**
        Returns the x, y coordinate on a canvas that a click was made.
        Passed a click event as a parameter.
        
        http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
        http://answers.oreilly.com/topic/1929-how-to-use-the-canvas-and-draw-elements-in-html5/
    */
    getMouseClickCoordinates: function( e ){
        var x, y;
        var coords = {};
        if(e.pageX || e.pageY){ 
          x = e.pageX;
          y = e.pageY;
        } else { 
          x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
          y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
        } 
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        
        coords.x = x;
        coords.y = y;
        return coords;
    },
    
    /**
        Converts a 0-255 value (RGBA) into the correct integer pixel width to display in the visual box
    */
    convertToPX: function( val ){
        var maxWidth = $('#redBar').width(); //all of the bars are the same, so just choose one of them
        return Math.ceil( (val / 255) * maxWidth );
    },
    
    /**
        Converts an integer to hex
    */
    toHex: function( val ){
        var str = val.toString(16);
        if( str.length === 1 ){
            str = '0' + str;
        }
        return str;
    },
    
    /**
        Converts a rgb triplet to hex
    */
    RGBToHex: function( r, g, b ){
        return Namer.toHex( r ) + Namer.toHex( g ) + Namer.toHex( b );
    },
    
    /**
        Visually displays the RGB values provided
    */
    displayRGB: function( rgba ){
        //update the RGB bars
        $('#redBarVal').width( Namer.convertToPX( rgba.r ) + 'px' );
        $('#greenBarVal').width( Namer.convertToPX( rgba.g ) + 'px' );
        $('#blueBarVal').width( Namer.convertToPX( rgba.b ) + 'px' );
        $('#redValue').text( rgba.r );
        $('#greenValue').text( rgba.g );
        $('#blueValue').text( rgba.b );
        //update the colour name and display the actual / calculated colours
        var colorHex = Namer.determineNamedColourHex( rgba );
        $('#colorName').text( Namer.getNameOfColour( colorHex ) );
        $('#actualColor').css( 'background-color', '#' + Namer.RGBToHex( rgba.r, rgba.g, rgba.b ) );
        $('#calculatedColor').css( 'background-color', '#' + colorHex );
    },
        
    /**
        Works out the nearest hex value that has been named
        
        Imagines the rgb values in a 3D space and finds the named colour that is nearest
    */
    determineNamedColourHex: function( rgba ){
        var actualPoint = rgba;
        var nearestDistance = 33554432;
        var comparisonPoint = {};
        var distance = 33554432;
        var nearestHex = "";
        $.each(colors, function(key, val) {
            comparisonPoint.r = val.r;
            comparisonPoint.g = val.g;
            comparisonPoint.b = val.b;
            distance = Namer.distanceBetweenPoints( actualPoint, comparisonPoint );
            if( distance < nearestDistance ){
                nearestDistance = distance;
                nearestHex = key;
            }
        });
        return nearestHex;
    },
    
    /**
        Returns the name of the colour which has the specified hex value.
        
        Assumes that a check has already been made to ensure it is a valid value.
    */
    getNameOfColour: function( hex ){
        return colors[hex].name;
    },
    
    /**
        Finds the distance between two points in (r, g, b) space rather than (x, y, z)
        Used 3D pythagorus
    */
    distanceBetweenPoints: function( pt1, pt2 ){
        return Math.sqrt( (pt1.r-pt2.r)*(pt1.r-pt2.r) + (pt1.g-pt2.g)*(pt1.g-pt2.g) + (pt1.b-pt2.b)*(pt1.b-pt2.b) );
    },
    
    /**
        Updates colour info based on the position of the mouse
        Takes a mouse event as a parameter
    */
    updateColorInfo: function( e ){
        var coords = Namer.getMouseClickCoordinates( e );
        var rgba = Namer.getRGBA( coords.x, coords.y );
        // console.log("rgba", rgba.r, rgba.g, rgba.b, rgba.a);
        Namer.displayRGB( rgba );
    },
    
    /**
        Initialises the color namer
    */
    init: function(){
        $('#rgbBox').draggable();
        canvas = document.getElementById("mainCanvas");
        context = canvas.getContext("2d");
        canvas.width = document.width;
        canvas.height = document.height;
        colors = xkcdtop949;
        canvas.addEventListener("mousemove", Namer.updateColorInfo, false);
        Namer.drawImage("img.png");
    }

};

$(function() {
	Namer.init();
});














