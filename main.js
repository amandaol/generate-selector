// append styles to head
var oneLineCSS = '<style id="pathOptimizer-styles" type="text/css">#overlay-initial {display: none; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10000; } #overlay-primary {display: none; font-family: arial, sans-serif; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 100; cursor: pointer; background-image: -moz-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -o-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 255, 255, .85)), to(rgba(255, 255, 255, .85))); background-image: linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); } #overlay-primary.active {display: block; } .optimizer-container {position: absolute; width: 600px; left: 50%; margin-left: -300px; top: 150px; overflow: hidden; opacity: 0; transition: opacity .5s; border: 2px solid #999; background-color: #eee; border-radius: 6px; padding: 25px; cursor: auto; } .optimizer-container.stat-show {opacity: 1; } .optimizer-container .content {font-size: 14px; } #optimizer-close {position: absolute; right: 6px; top: 5px; color: #999; cursor: pointer; font-size: 20px; padding: 4px; z-index: 1; font-style: normal; } .optimizer-container textarea {font-weight: bold; background-color: transparent; border: 0px; width: 100%; height: 100%; resize: none; outline: none; font-size: 14px; padding: 0px; padding-top: 10px; line-height: 1; overflow: hidden; box-shadow: none; } .optimizer-container p.secondary {margin-top:0px; margin-bottom: 10px; outline: 0; } .optimizer-container p.secondary span {font-weight: bold; color: red; font-size: 14px; } .optimizer-container p.secondary span.once {color: green; } .optimizer-container p.msg {color: #666; font-size: 12px; }</style>';
$("head").append(oneLineCSS);

// overlay-initial: not visible but which will, when display:block, block all user events not associated with this script
// overlay-primary: visible to the user
var markup = $('<div id="overlay-initial"></div>\
	<div id="overlay-primary"><div class="optimizer-container">\
	<i id="optimizer-close">X</i>\
	<div class="content"></div>\
	</div></div>');
$("body").append(markup);

// user closes the lightbox
$(document).on("click", "#overlay-primary", function(event) {
	var target = $(event.target);
	if (target.is($("#overlay-primary")) || target.is($("#optimizer-close"))) {
		$("#overlay-primary").hide();
	}
}) 

// user closes lightbox by hitting escape key
$(document).keyup(function(e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
	    $("#overlay-primary").hide();
    }
});

var main = function(e) {
  	$(document).off("click", main); // allows user to immediately close the overlay // otherwise the main function would fire first 
    $("#overlay-initial").hide(); // remove invisible overlay so that the "element" variable actualy gets the right element 

	// get mouse position, so can get element user clicked on located directly beneath the overlay-initial
	var x = e.clientX;
	var y = e.clientY;
    var element = document.elementFromPoint(x, y);

  	var id = $(element).closest('[id]');
  	var path = "";

  	var multipleClasses = function(classes) {
  		if (classes.indexOf(" ") > -1) {
  			classes = classes.trim().split(' ').join('.');
  		}
  		return classes;
  	}
  	
  	var getMiddleElement = function(elementPath, includeTag) {
		var middleElement = $(elementPath).parent().attr("class");
		if (middleElement === undefined || $.trim(middleElement).length === 0) { // if no class or class is empty
			middleElement = $(elementPath).parent().prop("tagName").toLowerCase();
		} else {
			middleElement = multipleClasses(middleElement);
			middleElement = "." + multipleClasses(middleElement);
			if (includeTag == true) {
				middleElement = $(elementPath).prop("tagName").toLowerCase() + middleElement;
			}
		}
		return middleElement;
  	}

	// get last element
	var lastElementTag = $(element).prop("tagName").toLowerCase();
	var lastElement = lastElementTag;
	// if class(es), add those
	if ($(element).attr("class") != undefined) {
		var lastElementClass = $(element).attr("class");
		lastElementClass = multipleClasses(lastElementClass);
		lastElement = lastElementTag +'.'+ lastElementClass;
	} 

  	// construct selector
  	if (id.length > 0) {
  		var idName = id.attr("id");
  		var selector = '$("#'+idName+'")';
  		if ($(element).is(id)) { // if ID is from current element
  			var path = selector;
  		} else { // if ID is from a parent
			if ($(element).parent().is(id)) { // 2 elements
				path = selector + '.find("'+lastElement+'")';
			} else { // 3 elements
				middleElement = getMiddleElement(element);
				path = selector + '.find("'+middleElement+ ' ' +lastElement+'")';
			}
  		}
  	} else {
  		// get middle element + class
  		if ($(element).parent().length > 0) { 
  			middleElement = getMiddleElement(element, true);
			path = '$("' + middleElement + ' ' + lastElement +'")'; // 2 elements
      		// get "grandparent" element + class
      		if ($(element).parent().parent().length > 0) {
      			var firstElement = getMiddleElement($(element).parent(), true);
				path = '$("' + firstElement + ' ' + middleElement + ' ' + lastElement +'")'; // 3 elements
      		}
  		} else {
			path = '$("' + lastElement + '")'; // 1 element
  		}
  	}
  	
  	// count number of times this element is called
  	var count = eval(path).length;
	var countText = "<span class='once'>Occurs: once</span>";
  	if (count > 1) {
  		countText = "<span>Occurs: " + count + " times</span>";
  	}

  	// build/display message
  	var message = '<textarea class="js-copytextarea">'+path+'</textarea><p class="secondary" tabindex="0">'+countText+'</p>';
  	$("#overlay-primary")
  		.show()
  		.find(".content").html(message);
  	$('.optimizer-container').addClass('stat-show');

  	// copy path to clipboard
  	var copyTextarea = document.querySelector('.js-copytextarea');
  	copyTextarea.select();
    var successful = document.execCommand('copy');
    var msg = successful ? 'Path copied to your clipboard.' : 'Unfortunately, path was not copied to your clipboard. Please try again.';
	    $("#overlay-primary").find(".optimizer-container .content").append('<p class="msg">'+msg+'</p>');
  	copyTextarea.selectionStart = copyTextarea.selectionEnd = -1; // deselect path
  	$("#overlay-primary").find("p.secondary").focus(); // pulls cursor out of textarea
}

// user action // triggers main function
$(document).on("keydown", function(e) {
	if (e.altKey) { // shift key pressed
		$("#overlay-initial").show(); // overlay page so that click does not trigger any event other than the one below
        $(document).on("click", main); // run main function
        setTimeout(function() { // later...
        	$("#overlay-initial").hide();
	        $(document).off("click", main); // unattach this function so user can click without triggering the overly
        }, 1000) // gives the user 1 second after alt to click
    }
})