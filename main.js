// append styles to head
var oneLineCSS = '<style id="pathOptimizer-styles" type="text/css">#overlay-initial {display: none; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10000; } #overlay-primary {display: none; font-family: arial, sans-serif; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 100; cursor: pointer; overflow-y: auto; background-image: -moz-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -o-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 255, 255, .85)), to(rgba(255, 255, 255, .85))); background-image: linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); } #overlay-primary.active {display: block; } .optimizer-container {position: absolute; width: 600px; left: 50%; margin-left: -300px; top: 50px; overflow: hidden; opacity: 0; transition: opacity .5s; border: 2px solid #999; background-color: #eee; border-radius: 6px; padding: 25px; cursor: auto; margin-bottom: 100px; } .optimizer-container.stat-show {opacity: 1; } .optimizer-container .content {font-size: 14px; } #optimizer-close {position: absolute; right: 6px; top: 5px; color: #999; cursor: pointer; font-size: 20px; padding: 4px; z-index: 1; font-style: normal; } .optimizer-container textarea {font-weight: bold; background-color: transparent; border: 0px; width: 100%; height: 100%; resize: none; outline: none; font-size: 14px; padding: 0px; padding-top: 10px; line-height: 1; overflow: hidden; box-shadow: none; } .optimizer-container p.secondary {margin-top: 0px; margin-bottom: 10px; outline: 0; } .optimizer-container p.secondary span {font-weight: bold; color: red; font-size: 14px; } .optimizer-container p.secondary span.once {color: green; } .optimizer-container p.msg {color: #666; font-size: 12px; } .optimizer-container section {margin-top: 20px; } .optimizer-container section button {padding: 5px 10px; color: #080808; border: 1px solid #080808; background-color: #F4F1F2; font-size: 14px; } .optimizer-container section button:hover {text-shadow:none; } .extraSelectors {display: none; margin-top: 10px; padding-top: 8px; } .extraSelectors div {/*background-color: #AE849F;*/ padding: 5px 10px 5px 10px; border-radius: 10px; /*margin-bottom: 10px;*/ } .extraSelectors .uneditable {/*background-color: #5E6F56;*/ background-color: #AE849F; color: #F4F1F2; background-repeat: no-repeat; background-position: 99%; } .extraSelectors .editable {background-color: #E8C7EA; cursor: pointer; display: inline-block; margin-right: 10px; transition: background-color 0.5s ease; } .extraSelectors .editable:last-child {background-color: #E8C7EA; } .extraSelectors .added .editable {background-color: #AE849F; } .extraSelectors .added.editable {background-color: #AE849F; color: #F4F1F2; } .extraSelectors .editable:hover {background-color: #AE849F; } .extraSelectors .editable:last-child:hover {background-color: #E8C7EA; }</style>';
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
var potentialSelectors = []; // all available selectors, grouped by level // excludes root and element clicked-on
var chosenSelectors = []; // selectors chosen from the potentialSelectors array
var root = $("#overlay-primary");

// load middleElement selector(s) into chosenSelectors array because they are default values
var loadME = function() {
	// find elements within potentialSelectors with an index of 1 // add to chosenSelectors
	for(var i=0; i < potentialSelectors.length; i++){
		if (potentialSelectors[i].index == 1) {
			var newEntry = {};
			newEntry.index = potentialSelectors[i].index;
			newEntry.content = potentialSelectors[i].class;
			chosenSelectors.push(newEntry);
		}	    
	}
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
		$("#overlay-primary")
			.find(".optimizer-container .msg")
				.fadeOut('100').fadeIn('100')
			.siblings('.secondary')
				.fadeOut('100').fadeIn('100');
	}
	copyTextarea.selectionStart = copyTextarea.selectionEnd = -1; // deselect path // un-highlights text in input field
	$("#overlay-primary").find("p.secondary").focus(); // pulls cursor out of textarea
}

// open overlay, build content, display content
var main = function(e) {
  	$(document).off("click", main); // allows user to immediately close the overlay // otherwise the main function would fire first 
    $("#overlay-initial").hide(); // remove invisible overlay so that the "element" variable actualy gets the right element 

	// get mouse position, so can get element user clicked on located directly beneath the overlay-initial
	var x = e.clientX;
	var y = e.clientY;
    var element = document.elementFromPoint(x, y);
    // mark element for future use
    var elementMarker = Date.now();
    $(element).attr("data-selected", elementMarker);

  	var id = $(element).closest('[id]');
  	path = "";

  	// position overlay correctly // followed Pinterest example
  	$("body, html").css("overflow", "hidden");

  	// takes string of classes, returns string where each class is joined by a "." (if there are multiple classes)
  	var multipleClasses = function(classes) {
  		if (classes.indexOf(" ") > -1) {
  			classes = classes.trim().split(' ').join('.');
  		}
  		return classes;
  	}
  	
  	// in path, in the .find() section, this is the second element from the right 
  	var getMiddleElement = function(elementPath, includeTag) {
		var middleElement = $(elementPath).parent().attr("class");
		if (middleElement === undefined || $.trim(middleElement).length === 0) { // if no class or class is empty
			middleElement = $(elementPath).parent().prop("tagName").toLowerCase();
		} else { // if has classes
			middleElement = "." + multipleClasses(middleElement);
			if (includeTag == true) {
				middleElement = $(elementPath).prop("tagName").toLowerCase() + middleElement;
			}
		}
		return middleElement;
  	}

	// get last element
	var lastElementTag = $(element).prop("tagName").toLowerCase(); // start with the tag name
	lastElement = lastElementTag;
	// if class(es), add those to the tag name
	if ($(element).attr("class") !== undefined && $.trim($(element).attr("class")).length > 0) {
		var lastElementClass = $(element).attr("class");
		lastElementClass = multipleClasses(lastElementClass);
		lastElement = lastElementTag +'.'+ lastElementClass;
	} 

  	// contstruct path 
	var extraSelectors = ''; // contains markup for extra selectors
	var disabled = "disabled";
  	if (id.length > 0) { // if ID exists, start with that
  		var idName = id.attr("id");
  		selector = '$("#'+idName+'")';
  		if ($(element).is(id)) { // if ID is from current element
  			path = selector;
  		} else { // if ID is from a parent, grandparent, etc.
			if ($(element).parent().is(id)) { // 2 elements
				path = selector + '.find("'+lastElement+'")';
			} else { // 3+ elements
				middleElement = getMiddleElement(element);
				path = selector + '.find("'+middleElement+ ' ' +lastElement+'")';
				// 4+ elemenets  // so, if there is more than one DOM level between the selected element and the root (or ID), make a list for user to select from
				if (!$(element).parent().parent().is(id)) { 
					// set buttons to be clickable
					disabled = "";
					extraSelectors += '<div class="parent"><div class="uneditable">#' + idName + '</div></div>';
					var parentIndex = 0
					// populate potentialSelectors with clicked element
						// cycle through - could have multiple classes
						// mark tag specially - it can not be edited
						// make sure index is 0 - this is a special DOM level 
					// get all parents
					var parents = eval(selector + '.find("'+lastElement+'[data-selected=\''+ elementMarker + '\']")').parentsUntil("#" + idName).addBack();
					// var parents = eval(selector + '.find("'+lastElement+'[data-selected=\''+ elementMarker + '\']")').parentsUntil("#" + idName).addBack("[data-selected="+elementMarker+"]");
					// add lastElement to parents array... so it's not really just parents now!
					// parents.splice(0, 0, $(lastElement).eq(0));
					console.log("parents updated, a different way");
					console.log(parents);

					// from parents, construct list of all classes (or tags), per DOM level, in order
					parents.each(function(index) {
						// if (index != (parents.length -1)) {
							parentIndex++; 
						// }
						var classes = $(this).attr("class");
						console.log(classes);
						// if no class(es), add tag to potentialSelectors array, along with its DOM level
						if (classes === undefined || $(this).attr("class").trim().length === 0) { 
							var element = {};
							element.index = parentIndex;
							element.class = (this.nodeName).toLowerCase();
							potentialSelectors.push(element);
							console.log(element);
						} else { // if class(es), add class(es)
							var classes = "." + (this.className).trim().replace(/ +/g, " .");
							if (classes.indexOf(".", 1) > 0) { // if classes contains more than one "."
								var elementSplit = classes.split("."); // array of all classes
								// add each class to potentialSelectors array, along with its DOM level
								$(elementSplit).each(function(index){
									if (index !== 0) {
										var element = {};
										element.index = parentIndex;
										element.class = "." + elementSplit[index].trim();
										potentialSelectors.push(element);
										console.log(element);
									}
								})
							} else { // only one class, add to potentialSelectors array
								var element = {};
								element.index = parentIndex;
								element.class = "." + (this.className).trim();
								potentialSelectors.push(element);
								console.log(element);
							}
						}
					})

					// potentialSelectors.reverse(); // visually, we want the highest number index displayed first
					// var prevIndex = potentialSelectors[0].index; // max index in the array
					// var prevIndex = parents.length; // max index in the array
					var prevIndex = 0; // max index in the array
					// extraSelectors += '<div class="parent">';
					// build markup // populate extraSelectors with all classes/tags from potentialSelectors
					$(potentialSelectors).each(function(index) {
						var last = ""; // class needed only for the last group of elements
						if ((this.index) == parents.length) { 
							last = "added";
						}
						if (prevIndex !== this.index) { // first in loop // start new group 
							var closeDiv = '</div>';
							console.log(index);
							if (index == 0) {
								closeDiv = '';
							} 
							extraSelectors += closeDiv + '<div class="parent"><div class="editable '+last+'" data-index='+ this.index +'>'+this.class+'</div>';
						} else { // all which don't start a new group
							extraSelectors += '<div class="editable '+last+'" data-index='+ this.index +'>'+this.class+'</div>';
							// extraSelectors += '<div class="editable '+last+'" data-index='+ this.index +'>'+this.class+'</div>';
						}
						prevIndex = this.index;
					})
					// extraSelectors += '</div><div class="parent"><div class="uneditable">'+lastElement+'</div></div>';
					extraSelectors += '</div>';
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
  	message += '<section><button class="edit" '+disabled+' title="You can edit the selector path only when there are more selectors to choose from than what\'s already in the selector path.">Edit Selector Path</button> <button class="revert" '+disabled+' title="This button is available when the Edit button is available.">Revert</button>';
  	message += '<div class="extraSelectors">'+extraSelectors+'</div></section>';
  	// message += '<img src="chrome-extension://ilhdahgielkcaoodgjapamnkldjcbpla/lock.png">';
  	root
  		.show()
  		.find(".content").html(message);
  	$('.optimizer-container').addClass('stat-show');

  	var lockUrl = chrome.extension.getURL('lock.png'); // image used in first and last displayed selectors
  	$(".uneditable").css("background-image", "url("+lockUrl+")");

  	copyPath(true);

  	// add middle selectors to path, because they are default value(s)
  	loadME();
}

var closeOverlay = function() {
	root.hide();
	// style page now that overlay is gone
	$("body, html").css("overflow", "auto");
	// empty potentialSelectors and chosenSelectors arrays
	potentialSelectors.splice(0,potentialSelectors.length);
	chosenSelectors.splice(0,chosenSelectors.length);
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
		var thisContent = $(this).text();
		var chosenSelectorsOutput = "";

		if (!$(this).hasClass('added')) {
			$(this).addClass('added');
			var group = {};
			group.index = thisIndex;
			group.content = $(this).text();
			chosenSelectors.push(group);
		} else {
			$(this).removeClass('added');
			// get index of item I need to remove 
			var indexInArray = $.map(chosenSelectors, function(obj, index) {
			    if(obj.content == thisContent) {
			        return index;
			    }
			})
			// remove from array
			chosenSelectors.splice(indexInArray,1);
		}

        // sort elements in correct order // this is based off their data-index
        chosenSelectors.sort(function(a,b) {
            return parseFloat(b.index) - parseFloat(a.index);
        });

        // stringify, i.e. construct the string which will display as part of the path
		var prevIndex = "";

		// if chosenSelectors contains the middleElement, set prevIndex to 1
		for (var i=0; i < chosenSelectors.length; i++) {
			if (chosenSelectors[i].index == 1) {
				prevIndex = 1;
			}
		}

		$(chosenSelectors).each(function(index) {
			if (prevIndex == this.index) { // same group, no space
				chosenSelectorsOutput += this.content;
			} else { // new group
				// if it's the highest data-index, i.e. it's visually furthest on the left, remove the space
				var maxIndex = chosenSelectors[0].index; // max index in the array
				if (this.index == maxIndex) {
					chosenSelectorsOutput += this.content;
				} else {
					chosenSelectorsOutput += " " + this.content;
				}
			}
			prevIndex = this.index;
		})

		// add space before lastElement, if needed
		var space = "";
		if (chosenSelectorsOutput.length > 0) {
			space = " ";
		}

		var newPath = selector + '.find("' +chosenSelectorsOutput + space + lastElement+ '")';
		// display new path
		$(".js-copytextarea").val(newPath);
		// update count and copy path
		var countText = getCountText(newPath);
		root.find(".secondary").html(countText);
		copyPath();
	})
	// revert path to original path
	.on("click", ".revert", function() {
		$(".js-copytextarea").val(path);
		// empty chosenSelectors array
		var arrayCount = chosenSelectors.length;
		chosenSelectors.splice(0,arrayCount);
		// load middleElement into chosenSelectors because it's a default
		loadME();
		// revert selectors to default classes
		root
			.find("div.editable").removeClass('added')
			.end() 
			.find("div.editable").eq(potentialSelectors.length-1).parent().children().addClass('added'); // middleElement(s)
		var countText = getCountText(path);
		root.find(".secondary").html(countText);
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