# Generate the Optimum jQuery Selector

## What's Going On

This extension generates the optimum jquery selector on alt+click of the desired element. It follows these rules:
1. If the desired element has an ID, or if a parent has an ID, that (closest) ID becomes the first part of the selector. 
2. Directly after the ID, ".find" is used to chain the rest of the selector. 
3. The selector will not contain more than 3 elements.
4. Other than the ID, specificty goes from right to left (i.e. the last element is more specific than the one listed directly before).
5. In a typical chain of 3 selectors, the first will be an ID, the last will be the desired element, and the middle will be the direct parent of the desired element. 

While there is more logic, at a high level this is all that happens. Feel free to step through main.js to see more.  

For more reading: [https://learn.jquery.com/performance/optimize-selectors/](https://learn.jquery.com/performance/optimize-selectors/)

## How To Use It
1.  Hit the alt key.
2.  Click the element you're interested in (you have one second to do so).  
3.  The path now is copied to your clipboard.  

## Icon
Icon made by [Freepik](http://www.flaticon.com) and licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/).