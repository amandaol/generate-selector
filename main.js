// append styles to head
var oneLineCSS = '<style id="pathOptimizer-styles" type="text/css">#overlay-initial {display: none; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10000; } #overlay-primary {display: none; font-family: arial, sans-serif; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 100; cursor: pointer; overflow-y: auto; background-image: -moz-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -o-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 255, 255, .85)), to(rgba(255, 255, 255, .85))); background-image: linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); } #overlay-primary.active {display: block; } .optimizer-container {position: absolute; width: 600px; left: 50%; margin-left: -300px; top: 50px; overflow: hidden; opacity: 0; transition: opacity .5s; border: 2px solid #999; background-color: #eee; border-radius: 6px; padding: 25px; cursor: auto; margin-bottom: 100px; } .optimizer-container.stat-show {opacity: 1; } .optimizer-container .content {font-size: 14px; } #optimizer-close {position: absolute; right: 6px; top: 5px; color: #999; cursor: pointer; font-size: 20px; padding: 4px; z-index: 1; font-style: normal; } .optimizer-container textarea {font-weight: bold; background-color: transparent; border: 0px; width: 100%; height: 100%; resize: none; outline: none; font-size: 14px; padding: 0px; padding-top: 10px; line-height: 1; overflow: hidden; box-shadow: none; } .optimizer-container p.secondary {margin-top: 0px; margin-bottom: 10px; outline: 0; } .optimizer-container p.secondary span {font-weight: bold; color: red; font-size: 14px; } .optimizer-container p.secondary span.once {color: green; } .optimizer-container p.msg {color: #666; font-size: 12px; } .optimizer-container section {margin-top: 20px; } .extraSelectors {/*display: none;*/ margin-top: 10px; padding-top: 8px; } .extraSelectors div {/*background-color: #AE849F;*/ padding: 5px 10px 5px 10px; border-radius: 10px; margin-bottom: 10px; } .extraSelectors .uneditable {/*background-color: #5E6F56;*/ background-color: #AE849F; color: #F4F1F2; background-repeat: no-repeat; background-position: 99%; } .extraSelectors .editable {background-color: #E8C7EA; cursor: pointer; transition: background-color 0.5s ease; } .extraSelectors .editable:last-child {background-color: #E8C7EA; } .extraSelectors .editable.added:last-child {background-color: #AE849F; } .extraSelectors .editable.added {background-color: #AE849F; color: #F4F1F2; } .extraSelectors .editable:hover {background-color: #AE849F; } .extraSelectors .editable:last-child:hover {background-color: #E8C7EA; }</style>';
$("head").append(oneLineCSS);

// overlay-initial: not visible but which will, when display:block, block all user events not associated with this script
// overlay-primary: visible to the user
var markup = $('<div id="overlay-initial"></div>\
	<div id="overlay-primary"><div class="optimizer-container">\
	<i id="optimizer-close">X</i>\
	<div class="content"></div>\
	</div></div>');
$("body").append(markup);

var path, selector, middleElement, lastElement;
var extraSelectorsData = []; // helps build the vertical list
var internalElements = []; // helps build the path 

// load middleElement selector into array for future use
var loadME = function() {
	var middleElementgroup = {};
	middleElementgroup.index = extraSelectorsData.length;
	middleElementgroup.content = middleElement;
	internalElements.push(middleElementgroup);
}

var getCountText = function(path) {
  	// count number of times this element is called
  	var count = eval(path).length;
	var countText = "<span class='once'>Occurs: once</span>";
  	if (count > 1) {
  		countText = "<span>Occurs: " + count + " times</span>";
  	}
  	return countText;
}

var copyPath = function(firstTime) {
	var copyTextarea = document.querySelector('.js-copytextarea'); 
	copyTextarea.select(); 
	var successful = document.execCommand('copy'); // copy path to clipboard
	var msg = successful ? 'Path copied to your clipboard.' : 'Unfortunately, path was not copied to your clipboard. Please try again.';
	if (firstTime) {
		$("#overlay-primary").find(".optimizer-container .secondary").after('<p class="msg">'+msg+'</p>');
	} else {
		$("#overlay-primary").find(".optimizer-container .msg")
			.fadeOut('100').fadeIn('100');
	}
	copyTextarea.selectionStart = copyTextarea.selectionEnd = -1; // deselect path // un-highlights text in input field
	$("#overlay-primary").find("p.secondary").focus(); // pulls cursor out of textarea
}

// open overlay, build some content, display content
var main = function(e) {
  	$(document).off("click", main); // allows user to immediately close the overlay // otherwise the main function would fire first 
    $("#overlay-initial").hide(); // remove invisible overlay so that the "element" variable actualy gets the right element 

	// get mouse position, so can get element user clicked on located directly beneath the overlay-initial
	var x = e.clientX;
	var y = e.clientY;
    var element = document.elementFromPoint(x, y);

  	var id = $(element).closest('[id]');
  	path = "";

  	// position overlay correctly
  	$("body, html").css("overflow", "hidden");

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
	lastElement = lastElementTag;
	// if class(es), add those
	if ($(element).attr("class") != undefined) {
		var lastElementClass = $(element).attr("class");
		lastElementClass = multipleClasses(lastElementClass);
		lastElement = lastElementTag +'.'+ lastElementClass;
	} 

	var extraSelectors = '';

  	// contstruct element path which goes before the last element
  	if (id.length > 0) { // if ID exists, start with that
  		var idName = id.attr("id");
  		selector = '$("#'+idName+'")';
  		if ($(element).is(id)) { // if ID is from current element
  			path = selector;
  		} else { // if ID is from a parent
			if ($(element).parent().is(id)) { // 2 elements
				path = selector + '.find("'+lastElement+'")';
			} else { // 3+ elements
				middleElement = getMiddleElement(element);
				path = selector + '.find("'+middleElement+ ' ' +lastElement+'")';

				if (!$(element).parent().parent().is(id)) { // 4+ elemenets // must contruct internal elements
					// get count of elements in between 
					extraSelectors += '<div class="uneditable">#' + idName + '</div>';
					var parents = eval(path).eq(0).parentsUntil("#" + idName);
					var parentIndex = 0
					var parent = [];
					parents.each(function(index) {
						parentIndex++; 
						// if class(es), add those
						if ($(this).attr("class") === undefined) { // also need to factor for if class is empty // attribute exists but no value
							// var element = (this.nodeName).toLowerCase();
							var element = {};
							element.index = parentIndex;
							element.class = (this.nodeName).toLowerCase();
							parent.push(element);
							console.log(element);
						} else {
							var classes = "." + (this.className).trim().replace(/ +/g, " .");
							if (classes.indexOf(".", 1) > 0) { // if classes contains more than one "."
								var elementSplit = classes.split("."); // array of all classes
								$(elementSplit).each(function(index){
									if (index !== 0) {
										var element = {};
										element.index = parentIndex;
										element.class = "." + elementSplit[index].trim();
										parent.push(element);
										console.log(element);
									}
								})
							} else {
								var element = {};
								element.index = parentIndex;
								element.class = "." + (this.className).trim();
								parent.push(element);
								console.log(element);
							}
						}
						// extraSelectorsData.push(element);
					})
					// console.log(parent);

					extraSelectorsData.reverse();
					$(extraSelectorsData).each(function(index) {
						if ((index+1) == extraSelectorsData.length) { // last one // this one requires an extra class
							extraSelectors += '<div class="editable added" data-index='+(index+1)+'>'+extraSelectorsData[index]+'</div>';
						} else { // all others
							extraSelectors += '<div class="editable" data-index='+(index+1)+'>'+extraSelectorsData[index]+'</div>';
						}
					})
					extraSelectors += '<div class="uneditable">'+lastElement+'</div>';
				}
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
  	
  	var countText = getCountText(path);

  	// build/display message
  	var message = '<textarea class="js-copytextarea">'+path+'</textarea><p class="secondary" tabindex="0">'+countText+'</p>';
  	message += '<section><button class="edit">Edit Selector Path</button> <button class="revert">Revert</button>';
  	message += '<div class="extraSelectors">'+extraSelectors+'</div></section>';
  	// message += '<img src="chrome-extension://ilhdahgielkcaoodgjapamnkldjcbpla/lock.png">';
  	$("#overlay-primary")
  		.show()
  		.find(".content").html(message);
  	$('.optimizer-container').addClass('stat-show');

  	var lockUrl = chrome.extension.getURL('lock.png');
  	$(".uneditable").css("background-image", "url("+lockUrl+")");

  	copyPath(true);
}

var mainOverlay = $("#overlay-primary");

var closeOverlay = function() {
	$("#overlay-primary").hide();
	// style page now that overlay is gone
	$("body, html").css("overflow", "auto");
	// empty extraSelectorsData array
	var arrayCount = extraSelectorsData.length;
	extraSelectorsData.splice(0,arrayCount);
	// empty internalElements array
	var arrayCount1 = internalElements.length;
	internalElements.splice(0,arrayCount1);
}

// user action // triggers main function
$(document)
	.on("keydown", function(e) {
		if (e.altKey) { // shift key pressed
			$("#overlay-initial").show(); // overlay page so that click does not trigger any event other than the one below
	        $(document).on("click", main); // run main function
	        setTimeout(function() { // later...
	        	$("#overlay-initial").hide();
		        $(document).off("click", main); // unattach this function so user can click without triggering the overlay
	        }, 1000) // gives the user 1 second after alt to click
	    }
	})
	.on("click", ".edit", function() {
		$(this).siblings('.extraSelectors').show();
	})
	.on("click", ".editable", function() {
		// if this element has not been added, add it to the array
		var thisIndex = $(this).attr("data-index");
		var internalElementsOutput = "";

		if (!$(this).hasClass('added')) {
			$(this).addClass('added');
			var group = {};
			group.index = thisIndex;
			group.content = $(this).text();
			internalElements.push(group);
		} else {
			$(this).removeClass('added');
			// get index of item I need to remove 
			var indexInArray = $.map(internalElements, function(obj, index) {
			    if(obj.index == thisIndex) {
			        return index;
			    }
			})
			internalElements.splice(indexInArray,1);
		}

        // sort elements in correct order // this is based off their index
        internalElements.sort(function(a,b) {
            return parseFloat(a.index) - parseFloat(b.index);
        });
        // stringify
		$(internalElements).each(function() {
			internalElementsOutput += this.content + " ";
		})

		var newPath = selector + '.find("' +internalElementsOutput + lastElement+ '")';
		// display new path
		$(".js-copytextarea").val(newPath);
		// update count and copy path
		var countText = getCountText(path);
		mainOverlay.find(".secondary").html(countText);
		copyPath();
	})
	// revert path to original path
	.on("click", ".revert", function() {
		$(".js-copytextarea").val(path);
		// empty internalElements array
		var arrayCount = internalElements.length;
		internalElements.splice(0,arrayCount);
		// load middleElement into internalElements because it's a default
		loadME();
		// revert selectors to default classes
		mainOverlay
			.find("div.editable").removeClass('added')
			.end() 
			.find("div.editable").eq(extraSelectorsData.length-1).addClass('added'); // middleElement
		copyPath();
	})
	// user closes the lightbox
	.on("click", "#overlay-primary", function(event) {
		var target = $(event.target);
		if (target.is($("#overlay-primary")) || target.is($("#optimizer-close"))) {
			closeOverlay();
		}
	}) 
	// user closes lightbox by hitting escape key
	.keyup(function(e) {
	    if (e.keyCode == 27) { // escape key maps to keycode `27`
	    	closeOverlay();
	    }
	});