# Selectify

## What's Going On

On alt+click of the desired element, generate the optimum jquery selector. The logic is listed below. Should you need to, you can easily edit the generated jquery selector by clicking on a generated chart of all selector possibilities.

1. If the desired element has an ID, or if a parent has an ID, that (closest) ID becomes the first part of the selector. 
2. Directly after the ID, ".find" is used to chain the rest of the selector. 
3. The selector will not contain more than 3 elements.
4. Other than the ID, specificty goes from right to left (i.e. the last element is more specific than the one listed directly before).
5. In a typical chain of 3 selectors, the first will be an ID, the last will be the desired element, and the middle will be the direct parent of the desired element. 

While there is more logic, at a high level this is all that happens. Feel free to step through main.js to see more.

For more reading: [https://learn.jquery.com/performance/optimize-selectors/](https://learn.jquery.com/performance/optimize-selectors/)

## How To Use It
1.  Hit the alt key.
1.  Click the element you're interested in. (You have one second to do so).  
	1.  The path now is copied to your clipboard.  

## Icon
Icon made by [Freepik](http://www.flaticon.com) and licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/).

## Change log
v.1.1 - Generate the path on alt+click. Auto copies to clipboard.
v.1.2 - Added the ability to edit the selector path. This may be needed in cases where the HTML is unusually deep or complex, or simply poorly built.