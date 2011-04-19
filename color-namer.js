
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
        Draws an image with the specified fiel path in the top-left corner
    */
    drawImage: function( filePath ){
        var img = new Image();
        img.src = filePath;
        img.onload = function() {
            context.drawImage(img, 0, 0);
        };
    },
    
    /**
        Initialises the color namer
    */
    init: function(){
        canvas = document.getElementById("mainCanvas");
        context = canvas.getContext("2d");
        canvas.width = document.width;
        canvas.height = document.height;
        Namer.drawImage("img.png");
    }

};

$(function() {
	Namer.init();
});














