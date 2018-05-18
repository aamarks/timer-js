# timer-js

A simple to use, one line, single function call to time either your comparable functions with similar arguments or a single function. Easy to call from your browser's developer tools console. Results displayed in table form in your console (and given in the timeFunction return value.)

Pass in function(s) in an array, [foo,bar,...] with their common arguments. 

The simplest case is: ` timer.timeFunction(myFunction); ` (Don't use parentheses `myFunction()` or you will be passing the result of the function rather than the function definition.)

timer.timeFunction([foo,bar,...], ['arg1', arg2,...]);	 //whatever sequence of arguments (strings, booleans, etc) just as they would be in your normal function call--all arguments are applied to each function.
```
timer.timeFunction([reverse16, reverse32], 'abcdefg');
```

## Timing Code Snippets
You can test a bit of code by just defining a function directly (though it may be simpler to use console.time). For example getting the 10th character from a 26 character string using the spread operator:
```
timer.timeFunction(function () {return [..."abcdefghijklmnopqrstuvwxyz"][10];})
```
Compare Snippets:
```
timer.timeFunction( [ function A() {return [...s][10];},
                      function B() {return s[10];} 
                    ], "abcdefghijklmnopqrstuvwxyz")
```

## Notes
This compares well with timing the function directly. The overhead is minimal. You could even run it blank and then subtract out the overhead. However even a fast reverse16 function with a short 6 char string is more than a hundred times slower than a blank function so the overhead is insignificant. There is definitely some extra time in js when a function is first called so I'm guessing it's keeping the function ready to be reused quickly.

Since this is running from your browser's console, it could slow things down slightly (the console is doing all kinds of things documenting your code) but the results seem relatively consistant with jsperf. Jsperf uses Benchmark.js which you may also be able to use, however I find this much simpler and convenient to use. This can also lag jsperf for very fast code because usually there you aren't getting function returns. Timing intervals could be shorter so that op system is less likely to interupt with other tasks. You could repeat brief tests and sum up for longer total and possibly throw out aberant values that indicate background tasks. But this does a good job at comparing times as is.

## this Keyword
There is an optional third argument of timeFunction `aThis, [this1, this2,...]` which allows for setting *this* if any of your timed functions invoke this. 
```timer.timeFunction([ obj1.A, obj2.B ], s, [ ,obj2 ]); // function A doesn't invoke *this* so you can leave *this* undefined in the array, but B does```

## ToDo
- might want to be able to get results formatted in an html snippet/page
- When anonymous function is used no name is given in formatted results. Don't think there is a way to get this in js other than using .toSource() which is only supported in Firefox.

## Author
Arthur Marks, copyright 2018.

## License
MIT
