#Selectify

##Overview

On alt+click of the desired element, this Chrome extension generates the optimum jquery selector (logic listed below). If needed, you can easily edit the generated jquery selector by clicking on a generated chart of all selector possibilities.

###Why build such a tool?
If you are writing jQuery, you frequently decide and write the optimum jquery selector for your need. However, the rules for optimizing a jQuery selector are relatively easy and can be automated. That's what this extension is for. Instead of having to step through the DOM, find the ID which could be anywhere, and try to remember again exactly what the rules are for optimizing the jQuery selector, this tool builds the selector and copies it to your clipboard. Done! Voila! Additionally, the tool tells you how many elements on the page that selector calls so you instantly know whether the selector is unique (calls only one element) or not (calls many elements).

##The Logic

1. If the desired element has an ID, or if a parent has an ID, that (closest) ID becomes the first part of the selector. 
2. Directly after the ID, ".find" is used to chain the rest of the selector. 
3. The selector will not contain more than 3 elements.
4. Other than the ID, specificty goes from right to left (i.e. the last element is more specific than the one listed directly before).
5. In a typical chain of 3 selectors, the first will be an ID, the last will be the desired element, and the middle will be the direct parent of the desired element. 

While there is more logic, at a high level this is all that happens. Feel free to step through main.js to see more.

For more reading: [https://learn.jquery.com/performance/optimize-selectors/](https://learn.jquery.com/performance/optimize-selectors/)

##How to Install

Install from the [Chrome web store](https://chrome.google.com/webstore/search/selectify).

## How To Use
1.  Hit the alt key.
1.  Click the element you're interested in. (You have one second to do so).  
	1.  The path now is copied to your clipboard.  

## Icon
Icon made by [Freepik](http://www.flaticon.com) and licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/).

## Change Log
v.1.1 - Generate the path on alt+click. Auto copies to clipboard.

v.2.1 - Added the ability to edit the selector path. This may be needed in cases where the HTML is unusually deep or complex, or simply poorly built.