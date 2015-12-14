// append styles to head
var oneLineCSS = '<style id="pathOptimizer-styles" type="text/css">#overlay-initial {display: none; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 10000; } #overlay-primary {display: none; font-family: arial, sans-serif; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 100; cursor: pointer; background-image: -moz-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -o-linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(255, 255, 255, .85)), to(rgba(255, 255, 255, .85))); background-image: linear-gradient(rgba(255, 255, 255, .85), rgba(255, 255, 255, .85)); } #overlay-primary.active {display: block; } .optimizer-container {position: absolute; width: 600px; left: 50%; margin-left: -300px; top: 150px; overflow: hidden; opacity: 0; transition: opacity .5s; border: 2px solid #999; background-color: #eee; border-radius: 6px; padding: 25px; cursor: auto; } .optimizer-container.stat-show {opacity: 1;} .optimizer-container .content {font-size: 14px; } #optimizer-close {position: absolute; right: 6px; top: 5px; color: #999; cursor: pointer; font-size: 20px; padding: 4px; z-index: 1; font-style: normal; } .optimizer-container textarea {font-weight: bold; background-color: transparent; border: 0px; width: 100%; height: 100%; resize: none; outline: none; font-size: 14px; padding: 0px; padding-top: 10px; line-height: 1; overflow: hidden; box-shadow: none; } .optimizer-container p.secondary {margin-top:0px; margin-bottom: 10px; outline: 0; } .optimizer-container p.secondary span {font-weight: bold; color: red; font-size: 14px; } .optimizer-container p.secondary span.once {color: green; } .optimizer-container p.msg {color: #666; font-size: 12px; } .extraSelectors {margin-top:10px; padding-top:8px;} .extraSelectors div {background-color: #AE849F; padding: 5px 10px 5px 10px; border-radius:10px; margin-bottom:10px;} .extraSelectors .editable {background-color:#E8C7EA; cursor:pointer; transition:background-color 0.5s ease;} .extraSelectors .middleElement {background-color:#E8C7EA;} .extraSelectors .editable.middleElement.added {background-color: #AE849F;} .extraSelectors .editable.added, .extraSelectors .editable:hover {background-color:#AE849F;} .extraSelectors .editable.added.middleElement:hover {background-color:#E8C7EA;} </style>';
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

var path, selector, middleElement, lastElement;
var internalElements = [];

var main = function(e) {
  	$(document).off("click", main); // allows user to immediately close the overlay // otherwise the main function would fire first 
    $("#overlay-initial").hide(); // remove invisible overlay so that the "element" variable actualy gets the right element 

	// get mouse position, so can get element user clicked on located directly beneath the overlay-initial
	var x = e.clientX;
	var y = e.clientY;
    var element = document.elementFromPoint(x, y);

  	var id = $(element).closest('[id]');
  	path = "";

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

  	// get elements before last element
  	if (id.length > 0) {
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
					extraSelectors += '<div>'+lastElement+'</div>';
					extraSelectors += '<div class="middleElement editable data-index=0 added">'+middleElement+'</div>';
					var parents = eval(path).parentsUntil("#" + idName);
					parents = parents.slice(1) // select all parts of element except the first one
					var parentsNames = parents.each(function(index) {
						// if class(es), add those
						if ($(this).attr("class") === undefined) {
							var element = $(this.nodeName).toLowerCase();
						} else {
							var element = "." + (this.className).trim().split(' ').join('.');
						}
						extraSelectors += '<div class="editable" data-index='+(index+1)+'>'+element+'</div>';
					})
					extraSelectors += '<div>#' + idName + '</div>';
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
  	
  	// count number of times this element is called
  	var count = eval(path).length;
	var countText = "<span class='once'>Occurs: once</span>";
  	if (count > 1) {
  		countText = "<span>Occurs: " + count + " times</span>";
  	}

  	// build/display message
  	var message = '<textarea class="js-copytextarea">'+path+'</textarea><p class="secondary" tabindex="0">'+countText+'</p>';
  	message += '<button>Edit Selector Path</button>';
  	message += '<div class="extraSelectors">'+extraSelectors+'</div>';
  	$("#overlay-primary")
  		.show()
  		.find(".content").html(message);
  	$('.optimizer-container').addClass('stat-show');

  	// copy path to clipboard
  	var copyTextarea = document.querySelector('.js-copytextarea');
  	copyTextarea.select();
    var successful = document.execCommand('copy');
    var msg = successful ? 'Path copied to your clipboard.' : 'Unfortunately, path was not copied to your clipboard. Please try again.';
    $("#overlay-primary").find(".optimizer-container .secondary").after('<p class="msg">'+msg+'</p>');
  	copyTextarea.selectionStart = copyTextarea.selectionEnd = -1; // deselect path // un-highlights text in input field
  	$("#overlay-primary").find("p.secondary").focus(); // pulls cursor out of textarea
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
	.on("click", ".editable", function() {
		// if this element has not been added, add it to the array
		var thisIndex = $(this).attr("data-index");
		var internalElementsOutput = "";

		var sortAndStringify = function(x) {
			// sort from largest index to smallest index
	        x.sort(function(a,b) {
	            return parseFloat(b.index) - parseFloat(a.index);
	        });
	        // stringify
			$(x).each(function() {
				internalElementsOutput += this.content + " ";
			})
			console.log(internalElementsOutput);
		}

		if (!$(this).hasClass('added')) {
			console.log("add a selector");
			$(this).addClass('added');
			var group = {};
			group.index = thisIndex;
			group.content = $(this).text();
			internalElements.push(group);
			sortAndStringify(internalElements);
		} else {
			console.log("remove a selector");
			$(this).removeClass('added');
			var internalElements1 = internalElements.filter(function(element) {
				return element.index != thisIndex;
			})
			sortAndStringify(internalElements1);
		}

		// include middleElement as needed
		if (!$(this).hasClass('middleElement')) {
			var finalElement = middleElement + ' ' +lastElement;
		} else {
			var finalElement = lastElement;
		}
		// console.log(internalElementsOutput);
		var newPath = selector + '.find("' +internalElementsOutput + finalElement+ '")';
		// console.log(newPath);
	})