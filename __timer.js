/**
 * An easy to use javascript code timer for timing one or more functions and displaying result comparison in the console
 * @author Arthur Marks, copyright 2018
 * @license MIT
 */

//	A simple to use, one line, single function call to time either your comparable functions with similar arguments or
//	a single function. Easy to call from your browser's developer tools console. Results displayed in formatted table
//	form in your console (and given in the timeFunction return value.)
//
//	Pass in function(s) in an array, [foo,bar,...] with their common arguments as you would in a normal call to the
//	function This compares well with timing the function directly, the overhead here is minimal. You could even run it
//	blank and then subtract out the overhead. However even a fast reverse16 function with a short 6 char string is more
//	than a hundred times slower than a blank function so the overhead is insignificant. There is definitely some extra
//	time in js when a function is first called so I'm guessing it's keeping the function ready to be reused quickly.
//
//	Since this is running from your browser's console, it could slow things down slightly (the console is doing all
//	kinds of things documenting your code) but the results seem relatively consistant with jsperf. Jsperf uses
//	Benchmark.js which you may also be able to use, however I find this much simpler and convenient to use. This can
//	also lag jsperf for very fast code because usually there you aren't getting function returns. Timing intervals
//	could be shorter so that op system is less likely to interupt with other tasks. You could repeat brief tests and
//	sum up for longer total and possibly throw out aberant values that indicate background tasks. But this does a good
//	job at comparing times as is.
//
//	timeFunction([foo,bar,...], 'arg1', arg2,...);	 //whatever sequence of arguments (strings, booleans, etc) just as
//	they would be in your normal function call--all arguments are applied to each function.
//
//	timeFunction(myFunction); //simplest: single function no args 
//
//	You can test a bit of code by just defining a function directly (though it may be simpler to use console.time):
//	timeFunction(function () {return [..."kashglgkjahserliahsdlkjhaldkjghaiksdghalksdjgalsk"][10];})  //time code
//	timeFunction( [ function A() {return [..."kashglgkjahserliahsdlkjhaldkjghaiksdghalksdjgalsk"][10];},
//					function B() {return "kashglgkjahserliahsdlkjhaldkjghaiksdghalksdjgalsk"[10];} ] )
//
//	example: timeFunction([reverse16, reverse32], 'abcdefg');
//
//	example: timeFunction([ obj1.A, obj2.B ], s, [ ,obj2 ]); // function A doesn't invoke *this* so you can leave *this* undefined in the array, but B does

var timer = (function () { 
	"use strict";

	/**
	 * @param {function or [array of functions]} fArray one or more functions wrapped as Array
	 * @param {any or [any1, any2,...]} args single any or argument list wrapped as Array used by each of the functions tested. Passing multiple args uses .apply which needs array (and is slower)
	 * @returns {Array} if needed, but results are formatted in the console for review
	 */
	function timeFunction(fArray, args, aThis) {
		var start = 0,
			dur = 0,       //ms in loop converted to seconds for results
			L = 1000,      //desired test length in ms
			i2 = 10,       //iterations before checking elapsed time for exit
			iMin = i2,
			iMax = 1000000,//anything bigger than iMin for now
			i = 0, 
			j = 0,
			r = '',
			results = [],
			maxOpsSec = 0,
			minOpsSec = Infinity,
			f;
			
		if (typeof fArray === "function") { fArray = [fArray]; } // pass single function as array to iterator
		// switched to indexed loop instead of `for (f of fArray)` to at least include function number when no name exists for anonymous functions
		fArray.forEach((f, j) => { //simple function iteration, optimization doesn't matter for this for loop
			//todo: f.name doesn't work with constructors or some anonymous module stuff. I can't find a way to get those names.
			//      You could just wrap those calls in standard function declarations with whatever names you want in the results if that matters to you
			if (!Array.isArray(args)) { // for single or undefined argument can just use the function with arg otherwise f.apply(this, [args])
				r = f(args);
				r = r.toString().substring(0, 200); //show result for verification but limit length
				console.log((j + 1) + '. ' + f.name + ' begun:       ' + r); //give result to make sure f is working AND place first to get the function cached? then start timer

				// test adjusting iMax to approximate L milliseconds
				var start = window.performance.now();
				for (i = 0, iMin = i2; i < iMax; i++) {  //lowered min to 100 for long functions. Only comes through time setter performance.now 4-5 times even for fast functions
					f(args);
					if (i === iMin) {                    //time set: enter here once after sample to calculate total iterations that will approximate test length L, repeat for fast f
						dur = window.performance.now() - start;
						if (dur < 35) {                  //just in case duration is freakishly small (hard to make equal to L) or zero (stuck in loop)
							iMin *= 10;                  //return to set duration of iteration after 10x loops
							if (iMin >= iMax) { iMax *= 10; }
						} else {
							iMax = i * L / dur;          //set iterations to approximately reach test length (comes up short because first iteration(s) must be slower)
						}
					}
				} 
			} else {
				r = f.apply(undefined, args); // f.apply is several times slower, but that's insignificant for all but the fastest functions
				r = r.toString().substring(0, 200);
				console.log((j + 1) + '. ' + f.name + ' begun:       ' + r); 

				var start = window.performance.now();
				for (i = 0, iMin = i2; i < iMax; i++) {
					f.apply(undefined, args);
					if (i === iMin) {
						dur = window.performance.now() - start;
						if (dur < 35) {
							iMin *= 10;
							if (iMin >= iMax) { iMax *= 10; }
						} else {
							iMax = i * L / dur;
						}
					}
				}
			}

			dur = (window.performance.now() - start) / 1000;
			//console.log('   ' + Number((i / dur).toFixed(1)).toLocaleString() + ' ops/sec  (test time: ' + dur.toPrecision(3) + ' s)');

			results.push([f.name, (i / dur), dur.toPrecision(3) + ' sec' ]);
			maxOpsSec = Math.max(maxOpsSec, (i / dur));
			minOpsSec = Math.min(minOpsSec, (i / dur));
		});

		//format result values and view as table in the console
		results.forEach(function (i) {
			//calc speed comparison and append to each line
			if (results.length > 1) {
			i.push((maxOpsSec == i[1]) ? 'Fastest' : ((maxOpsSec - i[1]) / maxOpsSec * 100).toFixed(1) + '% slower'); // ? Conditional(ternary) Operator 
			i.push((minOpsSec == i[1]) ? 'Slowest' : ((i[1] - minOpsSec) / minOpsSec * 100).toFixed() + '% faster'); 
			}
			//then format speeds
			i[1] = Number(i[1].toFixed(1)).toLocaleString() + ' ops/sec'; 
		});
		//prepend table header (at index zero: makes the actual results 1-based in the array)
		results.unshift((results.length > 1) ? ['FUNCTION', 'SPEED', 'TEST LENGTH', 'COMPARE TO FASTEST', 'COMPARE TO SLOWEST'] : ['FUNCTION', 'SPEED', 'TEST LENGTH']);
		console.table(results);
		console.log(('arguments: ' + args).substring(0,200));
		return results; //just in case results are wanted apart from what's shown in the console
	}




	//timeFunction([timeBlankFunction],'abcdefg') to get an idea of the overhead of the timer function (326 million ops/sec)
	//timeFunction([timeBlankFunction],['abcdefg']) to get an idea of the overhead of the timer function (63 million ops/sec)
	// seems using apply with args in array is slower than call, but then I don't think I can have different number of arguments
	function timeBlankFunction(s) {
		return s;
	}

	//timeFunction([timePerformanceNow],'abcdefg') shows significant time so not good to use every iteration in timeFunction (3 million ops/sec)
	function timePerformanceNow(s) {
		return window.performance.now();
	}

	//test different for loop types
	function timeForIterateString(s0) {
		if (!s0) s0 = 'AbcdefghijkLMNOP'; 

		function forI(s) {
			var s2 = '',
				i = 0;
			for (; i < s.length; i++) {
				s2 += s[i];
			}
			return s2;
		}

		function forILCached(s) { //all pretty identical in Chrome, but caching the length is 1% faster. FF favors i over of by 10%, with not much diff cached
			var s2 = '',
				L = s.length,
				i = 0;
			for (; i < L; i++) {
				s2 += s[i];
			}
			return s2;
		}

		function forOf(s) {
			var s2 = '';
			for (let c of s) {
				s2 += c;
			}
			return s2;
		}

		function forOfConst(s) { //chrome is a little faster with these but Edge is ridiculously slow (tho extremely fast with the former)
			var s2 = '';
			for (const c of s) {
				s2 += c;
			}
			return s2;
		}

		function forEach(s) {
			var s2 = '';
			s.split('').forEach(el => {
				s2 += el;
			});
			return s2;
		}

		timeFunction([forI, forILCached, forOf, forOfConst, forEach], [s0]);
	}

	//test string character iteration (spreading with dashes shows problems handling wide characters with traditional methods)
	function timeStringParse(s0) {
		if (!s0) s0 = 'foo 𝌆 bar 𝟙𝟚𝟛😎 mañana mañana 🏳️‍🌈'; 

		s0 = s0.normalize();
		
		function forILCached(s) { 
			var s2 = '',
			L = s.length,
			i = 0;
			for (; i < L; i++) {
				s2 += s[i] + '-';
			}
			return s2;
		}
		
		function splitString(s) { //splitting and altering high unicode characters ruins them //splitting is slow //unless only altering some chars and then joining maybe...
			var s2 = '',
			a = s.split(''),
			L = a.length,
			i = 0;
			for (; i < L; i++) {
				s2 += a[i] + '-';
			}
			return s2;
		}
		
		function forFromCodePoint(s) { 
			var s2 = '',
			c = '',
			L = s.length,
			i = 0;
			for (; i < L; i += c.length) {
				c = String.fromCodePoint(s.codePointAt(i));
				s2 += c + '-';
			}
			return s2;
		}
		
		function spreadString(s) { 
			var s2 = '',
			a = [...s], //leaving this in the loop is horribly slow for longer strings as it's spread into array form each time
			L = a.length,
			i = 0;
			for (; i < L; i++) {
				s2 += a[i] + '-';
			}
			return s2;
		}
		
		timeFunction([forILCached, splitString, forFromCodePoint, spreadString], [s0]);
	}

	function timeBadCode(s0) {
		if (!s0) s0 = 'foo 𝌆 bar 𝟙𝟚𝟛😎 mañana mañana 🏳️‍🌈'; 

		function spreadString(s) {
			var s2 = '',
				a = [...s], //leaving this in the loop is horribly slow for longer strings as it's spread into array form each time
				L = a.length,
				i = 0;
			for (; i < L; i++) {
				s2 += a[i];
			}
			return s2;
		}
		function spreadStringNotCached(s) {
			var s2 = '',
			//a = [...s], //leaving this in the loop is horribly slow for longer strings as it's spread into array form each time
			//L = a.length,
			i = 0;
			for (; i < [...s].length; s2 += [...s][i++]) {}
			return s2;
		}
		timeFunction([spreadString, spreadStringNotCached], [s0]);

		function splitString(s) {
			var s2 = '',
				a = s.split(''), //leaving this in the loop is horribly slow for longer strings as it's spread into array form each time
				L = a.length,
				i = 0;
			for (; i < L; i++) {
				s2 += a[i];
			}
			return s2;
		}
		function splitStringNotCached(s) {
			var s2 = '',
			//a = [...s], //leaving this in the loop is horribly slow for longer strings as it's split into array form each time
			//L = a.length,
			i = 0;
			for (; i < s.length; s2 += s.split('')[i++]) {}
			return s2;
		}
		timeFunction([splitString, splitStringNotCached], [s0]);
	}

	return {
		timeFunction: timeFunction, // benchmark functions you pass to it in array form. Single functions can be passed without array but will be wrapped as array
		overhead: function () {return timeFunction(timeBlankFunction, 'abcdefg');}, // testing blank function to test the overhead of this timing process
		overheadArgArray: function () {return timeFunction(timeBlankFunction, ['abcdefg']);}, // testing blank function to test the overhead of this timing process using .apply()
		tests:{ // premade test examples, common use cases. optionally pass in string or let default string be used 
			badCodeExamples: timeBadCode,
			forMethods: timeForIterateString,
			stringCharParsing: timeStringParse
		}
	};

})();
