
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
        Called when a click event occurs
    */
    onClick: function( e ){
        var coords = Namer.getMouseClickCoordinates( e );
        console.log("coords:", coords.x, coords.y );
        var rgba = Namer.getRGBA( coords.x, coords.y );
        console.log("rgba", rgba.r, rgba.g, rgba.b, rgba.a);
    },

    
    /**
        Initialises the color namer
    */
    init: function(){
        canvas = document.getElementById("mainCanvas");
        context = canvas.getContext("2d");
        canvas.width = document.width;
        canvas.height = document.height;
        canvas.addEventListener("click", Namer.onClick, false);
        Namer.drawImage("img.png");
    }

};

$(function() {
	Namer.init();
});














