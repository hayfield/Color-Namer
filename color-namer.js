
var Namer = {

    /**
        The main canvas
    */
    canvas: null,
    
    /**
        Initialises the color namer
    */
    init: function(){
        canvas = document.getElementById("mainCanvas");
        canvas.width = document.width;
        canvas.height = document.height;
        Namer.gobble();
    }

};

$(function() {
	Namer.init();
});