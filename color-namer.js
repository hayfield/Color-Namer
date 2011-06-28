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
        The set of colors currently being used for naming
    */
    colors: null,
	
	/**
		Specifies whether the mouse has been pressed
	*/
	mousePressed: false,
	
	/**
		The area that has been selected by dragging the mouse
	*/
	mouseDownCoordinates: null,
    
    /**
        Loads and draws an image with the specified file path in the top-left corner
    */
    loadAndDrawImage: function( filePath ){
        img = new Image();
        img.onload = function(){
            Namer.drawImage( img );
        };
        img.onerror = function(e){
            e.stopPropagation();
            e.preventDefault();
        };
        img.src = filePath;
    },
	
	/**
		Draw an image in the top-left corner of the canvas
	*/
	drawImage: function( image ){
		// scale the canvas to fit the image
        var width = image.width > $(window).width() ? image.width : $(window).width();
        var height = image.height > $(window).height() ? image.height : $(window).height();
        canvas.width = width;
        canvas.height = height;
        // console.log( image.width, image.height, document.width, document.height, width, height, $(window).width(), $(window).height() );
        // draw the image
        context.drawImage(image, 0, 0);
        Namer.storeImagePath(image.src);
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
            } catch(e) { 
                netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                var imgData = context.getImageData(x, y, 1, 1);
            } 						 
        } catch (e) {
            throw new Error("unable to access image data: " + e);
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
        Returns the x, y coordinate on a canvas that a click was made
        Passed a click event as a parameter
        
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
		Returns the distance between two coordinates
	*/
	distanceBetweenCoordinates: function( first, second ){
		var xLower = first.x < second.x ? first.x : second.x;
		var xHigher = first.x > second.x ? first.x : second.x;
		var yLower = first.y < second.y ? first.y : second.y;
		var yHigher = first.y > second.y ? first.y : second.y;
		
		var coords = {};
		coords.x = xHigher - xLower;
		coords.y = yHigher - yLower;
		
		return coords;
	},
	
	/**
		Returns the absolute distance between two coordinates
	*/
	absoluteDistanceBetweenCoordinates: function( start, end ){
		var coords = {};
		coords.x = end.x - start.x;
		coords.y = end.y - start.y;
		
		return coords;
	},
    
    /**
        Converts a 0-255 value (RGBA) into the correct integer pixel width to display in the visual box.
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
        // update the RGB bars
        $('#redBarVal').width( Namer.convertToPX( rgba.r ) + 'px' );
        $('#greenBarVal').width( Namer.convertToPX( rgba.g ) + 'px' );
        $('#blueBarVal').width( Namer.convertToPX( rgba.b ) + 'px' );
        $('#redValue').text( rgba.r );
        $('#greenValue').text( rgba.g );
        $('#blueValue').text( rgba.b );
        // update the color name and display the actual / calculated colors
        var colorHex = Namer.determineNamedColorHex( rgba );
        $('#colorName').text( Namer.getNameOfColor( colorHex ) );
        $('#actualColor').css( 'background-color', '#' + Namer.RGBToHex( rgba.r, rgba.g, rgba.b ) );
        $('#calculatedColor').css( 'background-color', '#' + colorHex );
    },
        
    /**
        Works out the nearest hex value that has been named
        Imagines the rgb values in a 3D space and finds the named color that is nearest
    */
    determineNamedColorHex: function( rgba ){
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
        Returns the name of the color which has the specified hex value
        Assumes that a check has already been made to ensure it is a valid value
    */
    getNameOfColor: function( hex ){
        return colors[hex].name;
    },
    
    /**
        Finds the distance between two points in (r, g, b) space rather than (x, y, z)
        Uses 3D pythagorus
    */
    distanceBetweenPoints: function( pt1, pt2 ){
        return Math.sqrt( (pt1.r-pt2.r)*(pt1.r-pt2.r) + (pt1.g-pt2.g)*(pt1.g-pt2.g) + (pt1.b-pt2.b)*(pt1.b-pt2.b) );
    },
    
    /**
        Updates color info based on the position of the mouse
        Takes a mouse event as a parameter
    */
    updateColorInfo: function( e ){
        var coords = Namer.getMouseClickCoordinates( e );
        var rgba = Namer.getRGBA( coords.x, coords.y );
        // console.log("rgba", rgba.r, rgba.g, rgba.b, rgba.a);
        Namer.displayRGB( rgba );
    },
    
    /**
        Switches to the color set that is selected in the dropdown
    */
    updateColorSet: function(){
        var selected = $('#colorSet').val();
        switch( selected ){
            case "xkcdtop949":
                colors = xkcdtop949;
                break;
            case "x11colors":
                colors = x11colors;
                break;
            default:
                colors = xkcdtop949;
        }
    },
    
    /**
        Initialises the color namer
    */
    init: function(){
        $('#rgbBox').draggable();
        canvas = document.getElementById("mainCanvas");
        context = canvas.getContext("2d");
        Namer.updateColorSet();
        
        canvas.addEventListener("mousemove", Namer.mouseMove, false);
        canvas.addEventListener("dragenter", Namer.dragEnter, false);
        canvas.addEventListener("dragover", Namer.dragOver, false);
        canvas.addEventListener("drop", Namer.drop, false);
		
		canvas.addEventListener("mousedown", Namer.mouseDown, false);
		window.addEventListener("mouseup", Namer.mouseUp, false);

        if( !Namer.loadImageFromStorage() ){
            Namer.loadAndDrawImage("img.png");
        }
        
        // allow the set of colors being used to be changed
        $('#colorSet').change(function(){
            Namer.updateColorSet();
        });
        
        // allow a web-based URL to be used to specify the image
        $('#webImageURLInput').keyup(function(e){
            // http://stackoverflow.com/questions/169625/regex-to-check-if-valid-url-that-ends-in-jpg-png-or-gif
            var regex = new RegExp("^https?://(?:[a-z\-]+\.)+[a-z]{2,6}(?:/[^/#?]+)+\.(?:jpg|gif|png)$");
            //var regex = new RegExp("(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*\.(?:jpg|gif|png))(?:\?([^#]*))?(?:#(.*))?");
            try {
                if( e.keyCode === 13 || $(this).val().match(regex) ){ //if user pressed enter or regex match
                    Namer.loadAndDrawImage( $(this).val() ); //attempt to load and draw the image with the given URL
                }					 
            } catch (e) {
                // allow it to pass if hitting enter and the issue's related to a FF4 issue regarding regexps
                if(e instanceof InternalError && e.message.indexOf("regular expression too complex") !== -1 && e.keyCode === 13 ){
                    Namer.loadAndDrawImage( $(this).val() );                  
                } else {
                    throw new Error("Unable to load image from URL");
                }                
            }
             
        }).focus(function() {
            // highlight the URL when it's box gets focus
            // in Chrome / Safari, you need to drag the mouse slightly when you click for it to highlight
			$(this).select();
		});
    },
	
	/**
		Specify that the mouse has been pressed
	*/
	mouseDown: function(e){
		console.log('down');
		Namer.mouseDownCoordinates = Namer.getMouseClickCoordinates( e );
		console.log( Namer.mouseDownCoordinates );
		Namer.mousePressed = true;
	},
	/**
		Specify that the mouse has been raised again
	*/
	mouseUp: function(e){
		console.log('up');
		Namer.mousePressed = false;
	},
	/**
		Do something when the mouse is moved over the canvas
	*/
	mouseMove: function(e){
		if( !Namer.mousePressed ){
			Namer.updateColorInfo(e);
		} else {
			var mouseCoords = Namer.getMouseClickCoordinates( e );
			var distBetweenCoords = Namer.absoluteDistanceBetweenCoordinates( Namer.mouseDownCoordinates, mouseCoords );
			Namer.drawImage( img );
			context.strokeRect( Namer.mouseDownCoordinates.x, Namer.mouseDownCoordinates.y,
								distBetweenCoords.x, distBetweenCoords.y );
		}
	},
    
    /**
        Stop the action from occuring
        
        https://developer.mozilla.org/en/using_files_from_web_applications
    */
    dragEnter: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    /**
        Stop the action from occuring
    */
    dragOver: function(e){
        e.stopPropagation();
        e.preventDefault();
    },
    /**
        Load an image into the canvas when it is dropped onto it
    */
    drop: function(e){
        e.stopPropagation();
        e.preventDefault();

        var dt = e.dataTransfer;
        var files = dt.files;

        Namer.handleFiles(files);
    },
    
    /**
        Handles files when a file is selected using the file select input
        
        https://developer.mozilla.org/en/using_files_from_web_applications
        https://developer.mozilla.org/en/DOM/FileReader
    */
    handleFiles: function(files){
        for(var i = 0; i < files.length; i++){
            var file = files[i];
            var imageType = /image.*/;
            
            if (!file.type.match(imageType)) {
              continue;
            }
          
            var reader = new FileReader();
            reader.onload = function(e){
                Namer.loadAndDrawImage( e.target.result );
            };
            reader.readAsDataURL(file);
          }
    },
    
    /**
        Checks to see whether localStorage is supported
        
        http://diveintohtml5.org/storage.html
    */
    supportsLocalStorage: function(){
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    },
    
    /**
        Stores the path to the current image in localStorage so it'll be displayed as the default later
    */
    storeImagePath: function( filePath ){
        if( Namer.supportsLocalStorage ){
            localStorage.setItem( 'imagePath', filePath );
        }
    },
    
    /**
        Reads the path to the image stored in localStorage and displays it on the canvas
    */
    loadImageFromStorage: function(){
        if( Namer.supportsLocalStorage ){
            var filePath = localStorage.getItem( 'imagePath' );
            if( filePath ){
                Namer.loadAndDrawImage( filePath );
                return true;
            }
        }
        
        return false;
    }

};

$(function() {
	Namer.init();
});











