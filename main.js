// CWSE-overlay-initial: not visible but which will, when display:block, block all user events not associated with this script
// CWSE-overlay-primary: visible to the user
var markup = $('<div id="CWSE-overlay-initial"></div>\
	<div id="CWSE-overlay-primary"><div class="optimizer-container">\
	<i id="optimizer-close">X</i>\
	<div class="content"></div>\
	</div></div>');
$("body").append(markup);

var path, selector, middleElement, lastElement;
var potentialSelectors = []; // all available selectors, grouped by level // excludes root and element clicked-on
var chosenSelectors = []; // selectors chosen from the potentialSelectors array
var numberOfDOMLevels = ''; // if there is more than 1 DOM level between the element clicked and the root, this is the total number (including the element clicked)
var root = $("#CWSE-overlay-primary"); // root element which all other elements are inside of

// load middleElement selector(s) into chosenSelectors array because they are default values
var loadME = function() {
	// find elements within potentialSelectors with one of the last two indexes // add to chosenSelectors
	var last = '';
	var almostLast = '';
	if (potentialSelectors[potentialSelectors.length-1] !== undefined) {
		last = potentialSelectors[potentialSelectors.length-1].index;
		almostLast = last - 1;
	}
	for(var i=0; i < potentialSelectors.length; i++){
		if (potentialSelectors[i].index == last || potentialSelectors[i].index == almostLast) {
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
		root.find(".optimizer-container .secondary").after('<p class="msg">'+msg+'</p>');
	} else {
		root
			.find(".optimizer-container .msg")
				.fadeOut('100').fadeIn('100')
			.siblings('.secondary')
				.fadeOut('100').fadeIn('100');
	}
	copyTextarea.selectionStart = copyTextarea.selectionEnd = -1; // deselect path // un-highlights text in input field
	root.find("p.secondary").focus(); // pulls cursor out of textarea
	// remove text from textarea and move to div that overlays the textarea
	root.find('.js-copytextarea').val("");
	root.find('.textAreaDisplayed').text(path); //applies the first time only
}

// open overlay, build content, display content
var main = function(e) {
  	$(document).off("click", main); // allows user to immediately close the overlay // otherwise the main function would fire first 
    $("#CWSE-overlay-initial").hide(); // remove invisible overlay so that the "element" variable actualy gets the right element 

	// get mouse position, so can get element user clicked on located directly beneath the CWSE-overlay-initialal
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
  	var endPoint = ""; // end element in selector path // typically, this is the ID
  	root.find(".optimizer-container").removeClass('show');
  	if (id.length > 0) { // if ID exists, start with that
  		var idName = endPoint = id.attr("id"); // setting both variables equal to this value
  		selector = '$("#'+idName+'")';

  		var buildElementChart = function() {
  			root.find(".optimizer-container").addClass('show');
  			// set buttons to be clickable
  			disabled = "";
  			extraSelectors += '<div class="parent"><div class="uneditable root">#' + idName + '</div></div>';
  			var parentIndex = 0
  			// get all parents // include self
  			var parents = eval(selector + '.find("'+lastElement+'[data-selected=\''+ elementMarker + '\']")').parentsUntil("#" + idName).addBack();
  			numberOfDOMLevels = parents.length;

  			// from parents, construct list of all classes (or tags), per DOM level, in order
  			parents.each(function(index) {
  				parentIndex++; 
  				var classes = $(this).attr("class");
  				// if no class(es), add tag to potentialSelectors array, along with its DOM level
  				if (classes === undefined || $(this).attr("class").trim().length === 0) { 
  					var element = {};
  					element.index = parentIndex;
  					element.class = (this.nodeName).toLowerCase();
  					potentialSelectors.push(element);
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
  							}
  						})
  					} else { // if only one class, add to potentialSelectors array
  						var element = {};
  						element.index = parentIndex;
  						element.class = "." + (this.className).trim();
  						potentialSelectors.push(element);
  					}
  				}
  			})

  			// if last element has class(es), add tag into appropriate spot in array
  			var lastInParents = parents.slice(-1);
  			if (lastInParents[0] !== undefined) {
  				if (lastInParents[0].className !== undefined && lastInParents[0].className) {
  					var element = {};
  					element.index = parents.length;
  					element.class = lastInParents[0].nodeName.toLowerCase();

  					// get index of first object which has an internal index of parents.length (i.e. it's the last group or DOM level)	 
  					var indexOfFirst = $.map(potentialSelectors, function(obj, index) {
  					    if(obj.index == parents.length) {
  					        return index;
  					    }
  					})
  					// insert tag into this spot						
  					potentialSelectors.splice(indexOfFirst[0], 0, element);
  				}
  			}

  			var prevIndex = 0; // max index in the array
  			// build markup // populate extraSelectors with all classes/tags from potentialSelectors
  			var first = true; // first object in the last set of objects
  			$(potentialSelectors).each(function(index) {
  				var last = ""; // class needed only for the last group of elements
  				if (this.index == (parents.length) || this.index == (parents.length - 1)) { 
  					last = "added";
  				}
  				// add "uneditable" class to tag // only occurs once
  				var primaryClass = 'editable';
  				if (this.index == (parents.length) && first) { // last set of objects in array, first object inside // marked uneditable
  					first = false;
  					primaryClass = 'uneditable';
  				}
  				if (prevIndex !== this.index) { // start new group 
  					var closeDiv = '</div>';
  					if (index == 0) {
  						closeDiv = '';
  					} 
  					extraSelectors += closeDiv + '<div class="parent"><div class="'+primaryClass + ' ' +last+'" data-index='+ this.index +'>'+this.class+'</div>';
  				} else { // continue with previous group
  					extraSelectors += '<div class="'+primaryClass + ' ' +last+'" data-index='+ this.index +'>'+this.class+'</div>';
  				}
  				prevIndex = this.index;
  			})
  			extraSelectors += '</div>';
  		}

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
					// buildElementChart();
				}
			} 
			buildElementChart();
  		}
  	} else {
  		// get middle element + class
  		// add "end" element here // set in each if 
  		if ($(element).parent().length > 0) { 
  			middleElement = getMiddleElement(element, true);
			path = '$("' + middleElement + ' ' + lastElement +'")'; // 2 elements
      		// endPoint = '$("' + middleElement + ')';
      		// get "grandparent" element + class
      		if ($(element).parent().parent().length > 0) {
      			var firstElement = getMiddleElement($(element).parent(), true);
				path = '$("' + firstElement + ' ' + middleElement + ' ' + lastElement +'")'; // 3 elements
				// endPoint = '$("' + firstElement + ')';
      		}
  		} else {
			path = '$("' + lastElement + '")'; // 1 element
			// endPoint = '$("' + lastElement + ')';
  		}
  		// buildElementChart();
  	}
  	
  	var countText = getCountText(path);

  	// build/display message
  	var message = '<section class="viewPath"><textarea class="js-copytextarea">'+path+'</textarea>'; // hidden
  	message += '<div class="textAreaDisplayed">path will go here path will go here</div>'; // displayed 
  	message += '<p class="secondary" tabindex="0">'+countText+'</p></section>';
  	message += '<section class="editPath"><h1>Edit Path</h1>';
  	message += '<button class="revert" '+disabled+' title="This button is available when the Edit button is available.">Clear Changes</button>';
  	message += '<div class="extraSelectors">'+extraSelectors+'</div></section>';
  	root
  		.show()
  		.find(".content").html(message);
  	$('.optimizer-container').addClass('stat-show');

  	var lockUrl = chrome.extension.getURL('images/lock.png'); // image used in first and last displayed selectors
  	$(".uneditable").css("background-image", "url("+lockUrl+")");

  	copyPath(true);

  	// add default selectors to "potentialSelectors" array, because they are default 
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
			$("#CWSE-overlay-initial").show(); // overlay page so that click does not trigger any event other than the one below
	        $(document).on("click", main); // run main function
	        setTimeout(function() { // later...
	        	$("#CWSE-overlay-initial").hide();
		        $(document).off("click", main); // unattach this function so user can click without triggering the overlay
	        }, 1000) // gives the user 1 second after alt to click
	    }
	})
	// user closes the lightbox
	.on("click", "#CWSE-overlay-primary", function(event) {
		var target = $(event.target);
		if (target.is($("#CWSE-overlay-primary")) || target.is($("#optimizer-close"))) {
			closeOverlay();
		}
	}) 
	// user closes lightbox by hitting escape key
	.keyup(function(e) {
	    if (e.keyCode == 27) { // escape key maps to keycode `27`
	    	closeOverlay();
	    }
	})
	// revert path to original path
	.on("click", ".revert", function() {
		$(".js-copytextarea").val(path);
		// empty chosenSelectors array
		var arrayCount = chosenSelectors.length;
		chosenSelectors.splice(0,arrayCount);
		// load default selectors into chosenSelectors because they're default
		loadME();
		// revert visible selectors to default classes
		root
			.find("div.editable").removeClass('added')
			.end() 
			.find("div.parent").eq(numberOfDOMLevels).children().addClass('added') // last DOM level
		root.find("div.parent").eq(numberOfDOMLevels-1).children().addClass('added'); // second to last DOM level
		// update count and copy path
		var countText = getCountText(path);
		root.find(".secondary").html(countText);
		copyPath();
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
            return parseFloat(a.index) - parseFloat(b.index);
        });

        // stringify, i.e. construct the string which will display as part of the path
		var prevIndex = "";

		$(chosenSelectors).each(function(index) {
			if (prevIndex == this.index) { // same group, no space
				chosenSelectorsOutput += this.content;
			} else { // new group
				// I honestly don't know why the below works, but 1) it does and 2) I knew at one time
				// if it's the highest data-index, i.e. it's visually furthest on the left, remove the space
				var maxIndex = chosenSelectors[0].index; // lowest index in the array, closest to root element
				if (this.index == maxIndex) {
					chosenSelectorsOutput += this.content;
				} else {
					chosenSelectorsOutput += " " + this.content;
				}
			}
			prevIndex = this.index;
		})

		var newPath = selector + '.find("' +chosenSelectorsOutput + '")';
		// display new path
		$(".js-copytextarea").val(newPath); // update hidden element // used in copyPath() function
		// update count and copy path
		var countText = getCountText(newPath);
		root.find(".secondary").html(countText);
		copyPath();
		$(".textAreaDisplayed").text(newPath); // update visible element for user to see
	})