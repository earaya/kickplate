
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var slice            = ArrayProto.slice,
        unshift          = ArrayProto.unshift,
        toString         = ObjProto.toString,
        hasOwnProperty   = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
        nativeForEach      = ArrayProto.forEach,
        nativeMap          = ArrayProto.map,
        nativeReduce       = ArrayProto.reduce,
        nativeReduceRight  = ArrayProto.reduceRight,
        nativeFilter       = ArrayProto.filter,
        nativeEvery        = ArrayProto.every,
        nativeSome         = ArrayProto.some,
        nativeIndexOf      = ArrayProto.indexOf,
        nativeLastIndexOf  = ArrayProto.lastIndexOf,
        nativeIsArray      = Array.isArray,
        nativeKeys         = Object.keys,
        nativeBind         = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) { return new wrapper(obj); };

    // Export the Underscore object for **Node.js** and **"CommonJS"**, with
    // backwards-compatibility for the old `require()` API. If we're not in
    // CommonJS, add `_` to the global object via a string identifier for
    // the Closure Compiler "advanced" mode. Registration as an AMD module
    // via define() happens at the end of this file.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root['_'] = _;
    }

    // Current version.
    _.VERSION = '1.3.3';

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (_.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };

    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
        each(obj, function(value, index, list) {
            results[results.length] = iterator.call(context, value, index, list);
        });
        if (obj.length === +obj.length) results.length = obj.length;
        return results;
    };

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function(value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) throw new TypeError('Reduce of empty array with no initial value');
        return memo;
    };

    // The right-associative version of reduce, also known as `foldr`.
    // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) iterator = _.bind(iterator, context);
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var reversed = _.toArray(obj).reverse();
        if (context && !initial) iterator = _.bind(iterator, context);
        return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
    };

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function(obj, iterator, context) {
        var result;
        any(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };

    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    _.filter = _.select = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) results[results.length] = value;
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    _.reject = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        each(obj, function(value, index, list) {
            if (!iterator.call(context, value, index, list)) results[results.length] = value;
        });
        return results;
    };

    // Determine whether all of the elements match a truth test.
    // Delegates to **ECMAScript 5**'s native `every` if available.
    // Aliased as `all`.
    _.every = _.all = function(obj, iterator, context) {
        var result = true;
        if (obj == null) return result;
        if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
        each(obj, function(value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function(obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = false;
        if (obj == null) return result;
        if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
        each(obj, function(value, index, list) {
            if (result || (result = iterator.call(context, value, index, list))) return breaker;
        });
        return !!result;
    };

    // Determine if a given value is included in the array or object using `===`.
    // Aliased as `contains`.
    _.include = _.contains = function(obj, target) {
        var found = false;
        if (obj == null) return found;
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
        found = any(obj, function(value) {
            return value === target;
        });
        return found;
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        return _.map(obj, function(value) {
            return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function(obj, key) {
        return _.map(obj, function(value){ return value[key]; });
    };

    // Return the maximum element or (element-based computation).
    _.max = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
        if (!iterator && _.isEmpty(obj)) return -Infinity;
        var result = {computed : -Infinity};
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {value : value, computed : computed});
        });
        return result.value;
    };

    // Return the minimum element (or element-based computation).
    _.min = function(obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
        if (!iterator && _.isEmpty(obj)) return Infinity;
        var result = {computed : Infinity};
        each(obj, function(value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {value : value, computed : computed});
        });
        return result.value;
    };

    // Shuffle an array.
    _.shuffle = function(obj) {
        var shuffled = [], rand;
        each(obj, function(value, index, list) {
            rand = Math.floor(Math.random() * (index + 1));
            shuffled[index] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    };

    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function(obj, val, context) {
        var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value : value,
                criteria : iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
                var a = left.criteria, b = right.criteria;
                if (a === void 0) return 1;
                if (b === void 0) return -1;
                return a < b ? -1 : a > b ? 1 : 0;
            }), 'value');
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = function(obj, val) {
        var result = {};
        var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
        each(obj, function(value, index) {
            var key = iterator(value, index);
            (result[key] || (result[key] = [])).push(value);
        });
        return result;
    };

    // Use a comparator function to figure out at what index an object should
    // be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function(array, obj, iterator) {
        iterator || (iterator = _.identity);
        var low = 0, high = array.length;
        while (low < high) {
            var mid = (low + high) >> 1;
            iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
        }
        return low;
    };

    // Safely convert anything iterable into a real, live array.
    _.toArray = function(obj) {
        if (!obj)                                     return [];
        if (_.isArray(obj))                           return slice.call(obj);
        if (_.isArguments(obj))                       return slice.call(obj);
        if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function(obj) {
        return _.isArray(obj) ? obj.length : _.keys(obj).length;
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function(array, n, guard) {
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    };

    // Returns everything but the last entry of the array. Especcialy useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N. The **guard** check allows it to work with
    // `_.map`.
    _.initial = function(array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array. The **guard** check allows it to work with `_.map`.
    _.last = function(array, n, guard) {
        if ((n != null) && !guard) {
            return slice.call(array, Math.max(array.length - n, 0));
        } else {
            return array[array.length - 1];
        }
    };

    // Returns everything but the first entry of the array. Aliased as `tail`.
    // Especially useful on the arguments object. Passing an **index** will return
    // the rest of the values in the array from that index onward. The **guard**
    // check allows it to work with `_.map`.
    _.rest = _.tail = function(array, index, guard) {
        return slice.call(array, (index == null) || guard ? 1 : index);
    };

    // Trim out all falsy values from an array.
    _.compact = function(array) {
        return _.filter(array, function(value){ return !!value; });
    };

    // Return a completely flattened version of an array.
    _.flatten = function(array, shallow) {
        return _.reduce(array, function(memo, value) {
            if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
            memo[memo.length] = value;
            return memo;
        }, []);
    };

    // Return a version of the array that does not contain the specified value(s).
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function(array, isSorted, iterator) {
        var initial = iterator ? _.map(array, iterator) : array;
        var results = [];
        // The `isSorted` flag is irrelevant if the array only contains two elements.
        if (array.length < 3) isSorted = true;
        _.reduce(initial, function (memo, value, index) {
            if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
                memo.push(value);
                results.push(array[index]);
            }
            return memo;
        }, []);
        return results;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function() {
        return _.uniq(_.flatten(arguments, true));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays. (Aliased as "intersect" for back-compat.)
    _.intersection = _.intersect = function(array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function(item) {
            return _.every(rest, function(other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function(array) {
        var rest = _.flatten(slice.call(arguments, 1), true);
        return _.filter(array, function(value){ return !_.include(rest, value); });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = function() {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, 'length'));
        var results = new Array(length);
        for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
        return results;
    };

    // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
    // we need this function. Return the position of the first occurrence of an
    // item in an array, or -1 if the item is not included in the array.
    // Delegates to **ECMAScript 5**'s native `indexOf` if available.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = function(array, item, isSorted) {
        if (array == null) return -1;
        var i, l;
        if (isSorted) {
            i = _.sortedIndex(array, item);
            return array[i] === item ? i : -1;
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
        for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
        return -1;
    };

    // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
    _.lastIndexOf = function(array, item) {
        if (array == null) return -1;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
        var i = array.length;
        while (i--) if (i in array && array[i] === item) return i;
        return -1;
    };

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;

        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);

        while(idx < len) {
            range[idx++] = start;
            start += step;
        }

        return range;
    };

    // Function (ahem) Functions
    // ------------------

    // Reusable constructor function for prototype setting.
    var ctor = function(){};

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Binding with arguments is also known as `curry`.
    // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
    // We check for `func.bind` first, to fail fast when `func` is undefined.
    _.bind = function bind(func, context) {
        var bound, args;
        if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError;
        args = slice.call(arguments, 2);
        return bound = function() {
            if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
            ctor.prototype = func.prototype;
            var self = new ctor;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) return result;
            return self;
        };
    };

    // Bind all of an object's methods to that object. Useful for ensuring that
    // all callbacks defined on an object belong to it.
    _.bindAll = function(obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length == 0) funcs = _.functions(obj);
        each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
        return obj;
    };

    // Memoize an expensive function by storing its results.
    _.memoize = function(func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function() {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function(){ return func.apply(null, args); }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = function(func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time.
    _.throttle = function(func, wait) {
        var context, args, timeout, throttling, more, result;
        var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
        return function() {
            context = this; args = arguments;
            var later = function() {
                timeout = null;
                if (more) func.apply(context, args);
                whenDone();
            };
            if (!timeout) timeout = setTimeout(later, wait);
            if (throttling) {
                more = true;
            } else {
                result = func.apply(context, args);
            }
            whenDone();
            throttling = true;
            return result;
        };
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            if (immediate && !timeout) func.apply(context, args);
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function(func) {
        var ran = false, memo;
        return function() {
            if (ran) return memo;
            ran = true;
            return memo = func.apply(this, arguments);
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function(func, wrapper) {
        return function() {
            var args = [func].concat(slice.call(arguments, 0));
            return wrapper.apply(this, args);
        };
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    _.compose = function() {
        var funcs = arguments;
        return function() {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            return args[0];
        };
    };

    // Returns a function that will only be executed after being called N times.
    _.after = function(times, func) {
        if (times <= 0) return func();
        return function() {
            if (--times < 1) { return func.apply(this, arguments); }
        };
    };

    // Object Functions
    // ----------------

    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
        return keys;
    };

    // Retrieve the values of an object's properties.
    _.values = function(obj) {
        return _.map(obj, _.identity);
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        });
        return obj;
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function(obj) {
        var result = {};
        each(_.flatten(slice.call(arguments, 1)), function(key) {
            if (key in obj) result[key] = obj[key];
        });
        return result;
    };

    // Fill in a given object with default properties.
    _.defaults = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            for (var prop in source) {
                if (obj[prop] == null) obj[prop] = source[prop];
            }
        });
        return obj;
    };

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Internal recursive comparison function.
    function eq(a, b, stack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
        if (a === b) return a !== 0 || 1 / a == 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a._chain) a = a._wrapped;
        if (b._chain) b = b._wrapped;
        // Invoke a custom `isEqual` method if one is provided.
        if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
        if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return a == String(b);
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                // other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;
            // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                    a.global == b.global &&
                    a.multiline == b.multiline &&
                    a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') return false;
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = stack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (stack[length] == a) return true;
        }
        // Add the first object to the stack of traversed objects.
        stack.push(a);
        var size = 0, result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
            // Compare array lengths to determine if a deep comparison is necessary.
            size = a.length;
            result = size == b.length;
            if (result) {
                // Deep compare the contents, ignoring non-numeric properties.
                while (size--) {
                    // Ensure commutative equality for sparse arrays.
                    if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
                }
            }
        } else {
            // Objects with different constructors are not equivalent.
            if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
            // Deep compare objects.
            for (var key in a) {
                if (_.has(a, key)) {
                    // Count the expected number of properties.
                    size++;
                    // Deep compare each member.
                    if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
                }
            }
            // Ensure that both objects contain the same number of properties.
            if (result) {
                for (key in b) {
                    if (_.has(b, key) && !(size--)) break;
                }
                result = !size;
            }
        }
        // Remove the first object from the stack of traversed objects.
        stack.pop();
        return result;
    }

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function(a, b) {
        return eq(a, b, []);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function(obj) {
        if (obj == null) return true;
        if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
        for (var key in obj) if (_.has(obj, key)) return false;
        return true;
    };

    // Is a given value a DOM element?
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType == 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) == '[object Array]';
    };

    // Is a given variable an object?
    _.isObject = function(obj) {
        return obj === Object(obj);
    };

    // Is a given variable an arguments object?
    _.isArguments = function(obj) {
        return toString.call(obj) == '[object Arguments]';
    };
    if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
            return !!(obj && _.has(obj, 'callee'));
        };
    }

    // Is a given value a function?
    _.isFunction = function(obj) {
        return toString.call(obj) == '[object Function]';
    };

    // Is a given value a string?
    _.isString = function(obj) {
        return toString.call(obj) == '[object String]';
    };

    // Is a given value a number?
    _.isNumber = function(obj) {
        return toString.call(obj) == '[object Number]';
    };

    // Is a given object a finite number?
    _.isFinite = function(obj) {
        return _.isNumber(obj) && isFinite(obj);
    };

    // Is the given value `NaN`?
    _.isNaN = function(obj) {
        // `NaN` is the only value for which `===` is not reflexive.
        return obj !== obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };

    // Is a given value a date?
    _.isDate = function(obj) {
        return toString.call(obj) == '[object Date]';
    };

    // Is the given value a regular expression?
    _.isRegExp = function(obj) {
        return toString.call(obj) == '[object RegExp]';
    };

    // Is a given value equal to null?
    _.isNull = function(obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function(obj) {
        return obj === void 0;
    };

    // Has own property?
    _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iterators.
    _.identity = function(value) {
        return value;
    };

    // Run a function **n** times.
    _.times = function (n, iterator, context) {
        for (var i = 0; i < n; i++) iterator.call(context, i);
    };

    // Escape a string for HTML interpolation.
    _.escape = function(string) {
        return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
    };

    // If the value of the named property is a function then invoke it;
    // otherwise, return it.
    _.result = function(object, property) {
        if (object == null) return null;
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
    };

    // Add your own custom functions to the Underscore object, ensuring that
    // they're correctly added to the OOP wrapper as well.
    _.mixin = function(obj) {
        each(_.functions(obj), function(name){
            addToWrapper(name, _[name] = obj[name]);
        });
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = idCounter++;
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate    : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g,
        escape      : /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /.^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        '\\': '\\',
        "'": "'",
        'r': '\r',
        'n': '\n',
        't': '\t',
        'u2028': '\u2028',
        'u2029': '\u2029'
    };

    for (var p in escapes) escapes[escapes[p]] = p;
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

    // Within an interpolation, evaluation, or escaping, remove HTML escaping
    // that had been previously added.
    var unescape = function(code) {
        return code.replace(unescaper, function(match, escape) {
            return escapes[escape];
        });
    };

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    _.template = function(text, data, settings) {
        settings = _.defaults(settings || {}, _.templateSettings);

        // Compile the template source, taking care to escape characters that
        // cannot be included in a string literal and then unescape them in code
        // blocks.
        var source = "__p+='" + text
            .replace(escaper, function(match) {
                return '\\' + escapes[match];
            })
            .replace(settings.escape || noMatch, function(match, code) {
                return "'+\n_.escape(" + unescape(code) + ")+\n'";
            })
            .replace(settings.interpolate || noMatch, function(match, code) {
                return "'+\n(" + unescape(code) + ")+\n'";
            })
            .replace(settings.evaluate || noMatch, function(match, code) {
                return "';\n" + unescape(code) + "\n;__p+='";
            }) + "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __p='';" +
            "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
            source + "return __p;\n";

        var render = new Function(settings.variable || 'obj', '_', source);
        if (data) return render(data, _);
        var template = function(data) {
            return render.call(this, data, _);
        };

        // Provide the compiled function source as a convenience for build time
        // precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
            source + '}';

        return template;
    };

    // Add a "chain" function, which will delegate to the wrapper.
    _.chain = function(obj) {
        return _(obj).chain();
    };

    // The OOP Wrapper
    // ---------------

    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.
    var wrapper = function(obj) { this._wrapped = obj; };

    // Expose `wrapper.prototype` as `_.prototype`
    _.prototype = wrapper.prototype;

    // Helper function to continue chaining intermediate results.
    var result = function(obj, chain) {
        return chain ? _(obj).chain() : obj;
    };

    // A method to easily add functions to the OOP wrapper.
    var addToWrapper = function(name, func) {
        wrapper.prototype[name] = function() {
            var args = slice.call(arguments);
            unshift.call(args, this._wrapped);
            return result(func.apply(_, args), this._chain);
        };
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        var method = ArrayProto[name];
        wrapper.prototype[name] = function() {
            var wrapped = this._wrapped;
            method.apply(wrapped, arguments);
            var length = wrapped.length;
            if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
            return result(wrapped, this._chain);
        };
    });

    // Add all accessor Array functions to the wrapper.
    each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        wrapper.prototype[name] = function() {
            return result(method.apply(this._wrapped, arguments), this._chain);
        };
    });

    // Start chaining a wrapped Underscore object.
    wrapper.prototype.chain = function() {
        this._chain = true;
        return this;
    };

    // Extracts the result from a wrapped and chained object.
    wrapper.prototype.value = function() {
        return this._wrapped;
    };

    // AMD define happens at the end for compatibility with AMD loaders
    // that don't enforce next-turn semantics on modules.
    if (typeof define === 'function' && define.amd) {
        define('underscore',[], function() {
            return _;
        });
    }

}).call(this);

//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {
    // Set up Backbone appropriately for the environment.
    if (typeof exports !== 'undefined') {
        // Node/CommonJS, no need for jQuery in that case.
        factory(root, exports, require('underscore'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define('backbone',['underscore', 'jquery', 'exports'], function(_, $, exports) {
            // Export global even in AMD case in case this script is loaded with
            // others that may still expect a global Backbone.
            root.Backbone = factory(root, exports, _, $);
        });
    } else {
        // Browser globals
        root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender));
    }
}(this, function(root, Backbone, _, $) {

    // Initial Setup
    // -------------

    // Save the previous value of the `Backbone` variable, so that it can be
    // restored later on, if `noConflict` is used.
    var previousBackbone = root.Backbone;

    // Create a local reference to slice/splice.
    var slice = Array.prototype.slice;
    var splice = Array.prototype.splice;

    // Current version of the library. Keep in sync with `package.json`.
    Backbone.VERSION = '0.9.2';

    // Set the JavaScript library that will be used for DOM manipulation and
    // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
    // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
    // alternate JavaScript library (or a mock library for testing your views
    // outside of a browser).
    Backbone.setDomLibrary = function(lib) {
        $ = lib;
    };

    // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
    // to its previous owner. Returns a reference to this Backbone object.
    Backbone.noConflict = function() {
        root.Backbone = previousBackbone;
        return Backbone;
    };

    // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
    // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
    // set a `X-Http-Method-Override` header.
    Backbone.emulateHTTP = false;

    // Turn on `emulateJSON` to support legacy servers that can't deal with direct
    // `application/json` requests ... will encode the body as
    // `application/x-www-form-urlencoded` instead and will send the model in a
    // form param named `model`.
    Backbone.emulateJSON = false;

    // Backbone.Events
    // -----------------

    // Regular expression used to split event strings
    var eventSplitter = /\s+/;

    // A module that can be mixed in to *any object* in order to provide it with
    // custom events. You may bind with `on` or remove with `off` callback functions
    // to an event; trigger`-ing an event fires all callbacks in succession.
    //
    //     var object = {};
    //     _.extend(object, Backbone.Events);
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    var Events = Backbone.Events = {

        // Bind one or more space separated events, `events`, to a `callback`
        // function. Passing `"all"` will bind the callback to all events fired.
        on: function(events, callback, context) {

            var calls, event, node, tail, list;
            if (!callback) return this;
            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});

            // Create an immutable callback list, allowing traversal during
            // modification.  The tail is an empty object that will always be used
            // as the next node.
            while (event = events.shift()) {
                list = calls[event];
                node = list ? list.tail : {};
                node.next = tail = {};
                node.context = context;
                node.callback = callback;
                calls[event] = {tail: tail, next: list ? list.next : node};
            }

            return this;
        },

        // Remove one or many callbacks. If `context` is null, removes all callbacks
        // with that function. If `callback` is null, removes all callbacks for the
        // event. If `events` is null, removes all bound callbacks for all events.
        off: function(events, callback, context) {
            var event, calls, node, tail, cb, ctx;

            // No events, or removing *all* events.
            if (!(calls = this._callbacks)) return;
            if (!(events || callback || context)) {
                delete this._callbacks;
                return this;
            }

            // Loop through the listed events and contexts, splicing them out of the
            // linked list of callbacks if appropriate.
            events = events ? events.split(eventSplitter) : _.keys(calls);
            while (event = events.shift()) {
                node = calls[event];
                delete calls[event];
                if (!node || !(callback || context)) continue;
                // Create a new list, omitting the indicated callbacks.
                tail = node.tail;
                while ((node = node.next) !== tail) {
                    cb = node.callback;
                    ctx = node.context;
                    if ((callback && cb !== callback) || (context && ctx !== context)) {
                        this.on(event, cb, ctx);
                    }
                }
            }

            return this;
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger: function(events) {
            var event, node, calls, tail, args, all, rest;
            if (!(calls = this._callbacks)) return this;
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);

            // For each event, walk through the linked list of callbacks twice,
            // first to trigger the event, then to trigger any `"all"` callbacks.
            while (event = events.shift()) {
                if (node = calls[event]) {
                    tail = node.tail;
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, rest);
                    }
                }
                if (node = all) {
                    tail = node.tail;
                    args = [event].concat(rest);
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
            }

            return this;
        }

    };

    // Aliases for backwards compatibility.
    Events.bind   = Events.on;
    Events.unbind = Events.off;

    // Backbone.Model
    // --------------

    // Create a new model, with defined attributes. A client id (`cid`)
    // is automatically generated and assigned for you.
    var Model = Backbone.Model = function(attributes, options) {
        var defaults;
        attributes || (attributes = {});
        if (options && options.parse) attributes = this.parse(attributes);
        if (defaults = getValue(this, 'defaults')) {
            attributes = _.extend({}, defaults, attributes);
        }
        if (options && options.collection) this.collection = options.collection;
        this.attributes = {};
        this._escapedAttributes = {};
        this.cid = _.uniqueId('c');
        this.changed = {};
        this._silent = {};
        this._pending = {};
        this.set(attributes, {silent: true});
        // Reset change tracking.
        this.changed = {};
        this._silent = {};
        this._pending = {};
        this._previousAttributes = _.clone(this.attributes);
        this.initialize.apply(this, arguments);
    };

    // Attach all inheritable methods to the Model prototype.
    _.extend(Model.prototype, Events, {

        // A hash of attributes whose current and previous value differ.
        changed: null,

        // A hash of attributes that have silently changed since the last time
        // `change` was called.  Will become pending attributes on the next call.
        _silent: null,

        // A hash of attributes that have changed since the last `'change'` event
        // began.
        _pending: null,

        // The default name for the JSON `id` attribute is `"id"`. MongoDB and
        // CouchDB users may want to set this to `"_id"`.
        idAttribute: 'id',

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function(){},

        // Return a copy of the model's `attributes` object.
        toJSON: function(options) {
            return _.clone(this.attributes);
        },

        // Get the value of an attribute.
        get: function(attr) {
            return this.attributes[attr];
        },

        // Get the HTML-escaped value of an attribute.
        escape: function(attr) {
            var html;
            if (html = this._escapedAttributes[attr]) return html;
            var val = this.get(attr);
            return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
        },

        // Returns `true` if the attribute contains a value that is not null
        // or undefined.
        has: function(attr) {
            return this.get(attr) != null;
        },

        // Set a hash of model attributes on the object, firing `"change"` unless
        // you choose to silence it.
        set: function(key, value, options) {
            var attrs, attr, val;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (_.isObject(key) || key == null) {
                attrs = key;
                options = value;
            } else {
                attrs = {};
                attrs[key] = value;
            }

            // Extract attributes and options.
            options || (options = {});
            if (!attrs) return this;
            if (attrs instanceof Model) attrs = attrs.attributes;
            if (options.unset) for (attr in attrs) attrs[attr] = void 0;

            // Run validation.
            if (!this._validate(attrs, options)) return false;

            // Check for changes of `id`.
            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            var changes = options.changes = {};
            var now = this.attributes;
            var escaped = this._escapedAttributes;
            var prev = this._previousAttributes || {};

            // For each `set` attribute...
            for (attr in attrs) {
                val = attrs[attr];

                // If the new and current value differ, record the change.
                if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
                    delete escaped[attr];
                    (options.silent ? this._silent : changes)[attr] = true;
                }

                // Update or delete the current value.
                options.unset ? delete now[attr] : now[attr] = val;

                // If the new and previous value differ, record the change.  If not,
                // then remove changes for this attribute.
                if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
                    this.changed[attr] = val;
                    if (!options.silent) this._pending[attr] = true;
                } else {
                    delete this.changed[attr];
                    delete this._pending[attr];
                }
            }

            // Fire the `"change"` events.
            if (!options.silent) this.change(options);
            return this;
        },

        // Remove an attribute from the model, firing `"change"` unless you choose
        // to silence it. `unset` is a noop if the attribute doesn't exist.
        unset: function(attr, options) {
            (options || (options = {})).unset = true;
            return this.set(attr, null, options);
        },

        // Clear all attributes on the model, firing `"change"` unless you choose
        // to silence it.
        clear: function(options) {
            (options || (options = {})).unset = true;
            return this.set(_.clone(this.attributes), options);
        },

        // Fetch the model from the server. If the server's representation of the
        // model differs from its current attributes, they will be overriden,
        // triggering a `"change"` event.
        fetch: function(options) {
            options = options ? _.clone(options) : {};
            var model = this;
            var success = options.success;
            options.success = function(resp, status, xhr) {
                if (!model.set(model.parse(resp, xhr), options)) return false;
                if (success) success(model, resp);
            };
            options.error = Backbone.wrapError(options.error, model, options);
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },

        // Set a hash of model attributes, and sync the model to the server.
        // If the server returns an attributes hash that differs, the model's
        // state will be `set` again.
        save: function(key, value, options) {
            var attrs, current;

            // Handle both `("key", value)` and `({key: value})` -style calls.
            if (_.isObject(key) || key == null) {
                attrs = key;
                options = value;
            } else {
                attrs = {};
                attrs[key] = value;
            }
            options = options ? _.clone(options) : {};

            // If we're "wait"-ing to set changed attributes, validate early.
            if (options.wait) {
                if (!this._validate(attrs, options)) return false;
                current = _.clone(this.attributes);
            }

            // Regular saves `set` attributes before persisting to the server.
            var silentOptions = _.extend({}, options, {silent: true});
            if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
                return false;
            }

            // After a successful server-side save, the client is (optionally)
            // updated with the server-side state.
            var model = this;
            var success = options.success;
            options.success = function(resp, status, xhr) {
                var serverAttrs = model.parse(resp, xhr);
                if (options.wait) {
                    delete options.wait;
                    serverAttrs = _.extend(attrs || {}, serverAttrs);
                }
                if (!model.set(serverAttrs, options)) return false;
                if (success) {
                    success(model, resp);
                } else {
                    model.trigger('sync', model, resp, options);
                }
            };

            // Finish configuring and sending the Ajax request.
            options.error = Backbone.wrapError(options.error, model, options);
            var method = this.isNew() ? 'create' : 'update';
            var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
            if (options.wait) this.set(current, silentOptions);
            return xhr;
        },

        // Destroy this model on the server if it was already persisted.
        // Optimistically removes the model from its collection, if it has one.
        // If `wait: true` is passed, waits for the server to respond before removal.
        destroy: function(options) {
            options = options ? _.clone(options) : {};
            var model = this;
            var success = options.success;

            var triggerDestroy = function() {
                model.trigger('destroy', model, model.collection, options);
            };

            if (this.isNew()) {
                triggerDestroy();
                return false;
            }

            options.success = function(resp) {
                if (options.wait) triggerDestroy();
                if (success) {
                    success(model, resp);
                } else {
                    model.trigger('sync', model, resp, options);
                }
            };

            options.error = Backbone.wrapError(options.error, model, options);
            var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
            if (!options.wait) triggerDestroy();
            return xhr;
        },

        // Default URL for the model's representation on the server -- if you're
        // using Backbone's restful methods, override this to change the endpoint
        // that will be called.
        url: function() {
            var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
            if (this.isNew()) return base;
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
        },

        // **parse** converts a response into the hash of attributes to be `set` on
        // the model. The default implementation is just to pass the response along.
        parse: function(resp, xhr) {
            return resp;
        },

        // Create a new model with identical attributes to this one.
        clone: function() {
            return new this.constructor(this.attributes);
        },

        // A model is new if it has never been saved to the server, and lacks an id.
        isNew: function() {
            return this.id == null;
        },

        // Call this method to manually fire a `"change"` event for this model and
        // a `"change:attribute"` event for each changed attribute.
        // Calling this will cause all objects observing the model to update.
        change: function(options) {
            options || (options = {});
            var changing = this._changing;
            this._changing = true;

            // Silent changes become pending changes.
            for (var attr in this._silent) this._pending[attr] = true;

            // Silent changes are triggered.
            var changes = _.extend({}, options.changes, this._silent);
            this._silent = {};
            for (var attr in changes) {
                this.trigger('change:' + attr, this, this.get(attr), options);
            }
            if (changing) return this;

            // Continue firing `"change"` events while there are pending changes.
            while (!_.isEmpty(this._pending)) {
                this._pending = {};
                this.trigger('change', this, options);
                // Pending and silent changes still remain.
                for (var attr in this.changed) {
                    if (this._pending[attr] || this._silent[attr]) continue;
                    delete this.changed[attr];
                }
                this._previousAttributes = _.clone(this.attributes);
            }

            this._changing = false;
            return this;
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that attribute has changed.
        hasChanged: function(attr) {
            if (!arguments.length) return !_.isEmpty(this.changed);
            return _.has(this.changed, attr);
        },

        // Return an object containing all the attributes that have changed, or
        // false if there are no changed attributes. Useful for determining what
        // parts of a view need to be updated and/or what attributes need to be
        // persisted to the server. Unset attributes will be set to undefined.
        // You can also pass an attributes object to diff against the model,
        // determining if there *would be* a change.
        changedAttributes: function(diff) {
            if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
            var val, changed = false, old = this._previousAttributes;
            for (var attr in diff) {
                if (_.isEqual(old[attr], (val = diff[attr]))) continue;
                (changed || (changed = {}))[attr] = val;
            }
            return changed;
        },

        // Get the previous value of an attribute, recorded at the time the last
        // `"change"` event was fired.
        previous: function(attr) {
            if (!arguments.length || !this._previousAttributes) return null;
            return this._previousAttributes[attr];
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event.
        previousAttributes: function() {
            return _.clone(this._previousAttributes);
        },

        // Check if the model is currently in a valid state. It's only possible to
        // get into an *invalid* state if you're using silent changes.
        isValid: function() {
            return !this.validate(this.attributes);
        },

        // Run validation against the next complete set of model attributes,
        // returning `true` if all is well. If a specific `error` callback has
        // been passed, call that instead of firing the general `"error"` event.
        _validate: function(attrs, options) {
            if (options.silent || !this.validate) return true;
            attrs = _.extend({}, this.attributes, attrs);
            var error = this.validate(attrs, options);
            if (!error) return true;
            if (options && options.error) {
                options.error(this, error, options);
            } else {
                this.trigger('error', this, error, options);
            }
            return false;
        }

    });

    // Backbone.Collection
    // -------------------

    // Provides a standard collection class for our sets of models, ordered
    // or unordered. If a `comparator` is specified, the Collection will maintain
    // its models in sort order, as they're added and removed.
    var Collection = Backbone.Collection = function(models, options) {
        options || (options = {});
        if (options.model) this.model = options.model;
        if (options.comparator) this.comparator = options.comparator;
        this._reset();
        this.initialize.apply(this, arguments);
        if (models) this.reset(models, {silent: true, parse: options.parse});
    };

    // Define the Collection's inheritable methods.
    _.extend(Collection.prototype, Events, {

        // The default model for a collection is just a **Backbone.Model**.
        // This should be overridden in most cases.
        model: Model,

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function(){},

        // The JSON representation of a Collection is an array of the
        // models' attributes.
        toJSON: function(options) {
            return this.map(function(model){ return model.toJSON(options); });
        },

        // Add a model, or list of models to the set. Pass **silent** to avoid
        // firing the `add` event for every new model.
        add: function(models, options) {
            var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
            options || (options = {});
            models = _.isArray(models) ? models.slice() : [models];

            // Begin by turning bare objects into model references, and preventing
            // invalid models or duplicate models from being added.
            for (i = 0, length = models.length; i < length; i++) {
                if (!(model = models[i] = this._prepareModel(models[i], options))) {
                    throw new Error("Can't add an invalid model to a collection");
                }
                cid = model.cid;
                id = model.id;
                if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
                    dups.push(i);
                    continue;
                }
                cids[cid] = ids[id] = model;
            }

            // Remove duplicates.
            i = dups.length;
            while (i--) {
                models.splice(dups[i], 1);
            }

            // Listen to added models' events, and index models for lookup by
            // `id` and by `cid`.
            for (i = 0, length = models.length; i < length; i++) {
                (model = models[i]).on('all', this._onModelEvent, this);
                this._byCid[model.cid] = model;
                if (model.id != null) this._byId[model.id] = model;
            }

            // Insert models into the collection, re-sorting if needed, and triggering
            // `add` events unless silenced.
            this.length += length;
            index = options.at != null ? options.at : this.models.length;
            splice.apply(this.models, [index, 0].concat(models));
            if (this.comparator) this.sort({silent: true});
            if (options.silent) return this;
            for (i = 0, length = this.models.length; i < length; i++) {
                if (!cids[(model = this.models[i]).cid]) continue;
                options.index = i;
                model.trigger('add', model, this, options);
            }
            return this;
        },

        // Remove a model, or a list of models from the set. Pass silent to avoid
        // firing the `remove` event for every model removed.
        remove: function(models, options) {
            var i, l, index, model;
            options || (options = {});
            models = _.isArray(models) ? models.slice() : [models];
            for (i = 0, l = models.length; i < l; i++) {
                model = this.getByCid(models[i]) || this.get(models[i]);
                if (!model) continue;
                delete this._byId[model.id];
                delete this._byCid[model.cid];
                index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;
                if (!options.silent) {
                    options.index = index;
                    model.trigger('remove', model, this, options);
                }
                this._removeReference(model);
            }
            return this;
        },

        // Add a model to the end of the collection.
        push: function(model, options) {
            model = this._prepareModel(model, options);
            this.add(model, options);
            return model;
        },

        // Remove a model from the end of the collection.
        pop: function(options) {
            var model = this.at(this.length - 1);
            this.remove(model, options);
            return model;
        },

        // Add a model to the beginning of the collection.
        unshift: function(model, options) {
            model = this._prepareModel(model, options);
            this.add(model, _.extend({at: 0}, options));
            return model;
        },

        // Remove a model from the beginning of the collection.
        shift: function(options) {
            var model = this.at(0);
            this.remove(model, options);
            return model;
        },

        // Get a model from the set by id.
        get: function(id) {
            if (id == null) return void 0;
            return this._byId[id.id != null ? id.id : id];
        },

        // Get a model from the set by client id.
        getByCid: function(cid) {
            return cid && this._byCid[cid.cid || cid];
        },

        // Get the model at the given index.
        at: function(index) {
            return this.models[index];
        },

        // Return models with matching attributes. Useful for simple cases of `filter`.
        where: function(attrs) {
            if (_.isEmpty(attrs)) return [];
            return this.filter(function(model) {
                for (var key in attrs) {
                    if (attrs[key] !== model.get(key)) return false;
                }
                return true;
            });
        },

        // Force the collection to re-sort itself. You don't need to call this under
        // normal circumstances, as the set will maintain sort order as each item
        // is added.
        sort: function(options) {
            options || (options = {});
            if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
            var boundComparator = _.bind(this.comparator, this);
            if (this.comparator.length == 1) {
                this.models = this.sortBy(boundComparator);
            } else {
                this.models.sort(boundComparator);
            }
            if (!options.silent) this.trigger('reset', this, options);
            return this;
        },

        // Pluck an attribute from each model in the collection.
        pluck: function(attr) {
            return _.map(this.models, function(model){ return model.get(attr); });
        },

        // When you have more items than you want to add or remove individually,
        // you can reset the entire set with a new list of models, without firing
        // any `add` or `remove` events. Fires `reset` when finished.
        reset: function(models, options) {
            models  || (models = []);
            options || (options = {});
            for (var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            this._reset();
            this.add(models, _.extend({silent: true}, options));
            if (!options.silent) this.trigger('reset', this, options);
            return this;
        },

        // Fetch the default set of models for this collection, resetting the
        // collection when they arrive. If `add: true` is passed, appends the
        // models to the collection instead of resetting.
        fetch: function(options) {
            options = options ? _.clone(options) : {};
            if (options.parse === undefined) options.parse = true;
            var collection = this;
            var success = options.success;
            options.success = function(resp, status, xhr) {
                collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
                if (success) success(collection, resp);
            };
            options.error = Backbone.wrapError(options.error, collection, options);
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },

        // Create a new instance of a model in this collection. Add the model to the
        // collection immediately, unless `wait: true` is passed, in which case we
        // wait for the server to agree.
        create: function(model, options) {
            var coll = this;
            options = options ? _.clone(options) : {};
            model = this._prepareModel(model, options);
            if (!model) return false;
            if (!options.wait) coll.add(model, options);
            var success = options.success;
            options.success = function(nextModel, resp, xhr) {
                if (options.wait) coll.add(nextModel, options);
                if (success) {
                    success(nextModel, resp);
                } else {
                    nextModel.trigger('sync', model, resp, options);
                }
            };
            model.save(null, options);
            return model;
        },

        // **parse** converts a response into a list of models to be added to the
        // collection. The default implementation is just to pass it through.
        parse: function(resp, xhr) {
            return resp;
        },

        // Proxy to _'s chain. Can't be proxied the same way the rest of the
        // underscore methods are proxied because it relies on the underscore
        // constructor.
        chain: function () {
            return _(this.models).chain();
        },

        // Reset all internal state. Called when the collection is reset.
        _reset: function(options) {
            this.length = 0;
            this.models = [];
            this._byId  = {};
            this._byCid = {};
        },

        // Prepare a model or hash of attributes to be added to this collection.
        _prepareModel: function(model, options) {
            options || (options = {});
            if (!(model instanceof Model)) {
                var attrs = model;
                options.collection = this;
                model = new this.model(attrs, options);
                if (!model._validate(model.attributes, options)) model = false;
            } else if (!model.collection) {
                model.collection = this;
            }
            return model;
        },

        // Internal method to remove a model's ties to a collection.
        _removeReference: function(model) {
            if (this == model.collection) {
                delete model.collection;
            }
            model.off('all', this._onModelEvent, this);
        },

        // Internal method called every time a model in the set fires an event.
        // Sets need to update their indexes when models change ids. All other
        // events simply proxy through. "add" and "remove" events that originate
        // in other collections are ignored.
        _onModelEvent: function(event, model, collection, options) {
            if ((event == 'add' || event == 'remove') && collection != this) return;
            if (event == 'destroy') {
                this.remove(model, options);
            }
            if (model && event === 'change:' + model.idAttribute) {
                delete this._byId[model.previous(model.idAttribute)];
                this._byId[model.id] = model;
            }
            this.trigger.apply(this, arguments);
        }

    });

    // Underscore methods that we want to implement on the Collection.
    var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
        'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
        'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
        'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
        'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

    // Mix in each Underscore method as a proxy to `Collection#models`.
    _.each(methods, function(method) {
        Collection.prototype[method] = function() {
            return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
        };
    });

    // Backbone.Router
    // -------------------

    // Routers map faux-URLs to actions, and fire events when routes are
    // matched. Creating a new one sets its `routes` hash, if not set statically.
    var Router = Backbone.Router = function(options) {
        options || (options = {});
        if (options.routes) this.routes = options.routes;
        this._bindRoutes();
        this.initialize.apply(this, arguments);
    };

    // Cached regular expressions for matching named param parts and splatted
    // parts of route strings.
    var namedParam    = /:\w+/g;
    var splatParam    = /\*\w+/g;
    var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

    // Set up all inheritable **Backbone.Router** properties and methods.
    _.extend(Router.prototype, Events, {

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function(){},

        // Manually bind a single named route to a callback. For example:
        //
        //     this.route('search/:query/p:num', 'search', function(query, num) {
        //       ...
        //     });
        //
        route: function(route, name, callback) {
            Backbone.history || (Backbone.history = new History);
            if (!_.isRegExp(route)) route = this._routeToRegExp(route);
            if (!callback) callback = this[name];
            Backbone.history.route(route, _.bind(function(fragment) {
                var args = this._extractParameters(route, fragment);
                callback && callback.apply(this, args);
                this.trigger.apply(this, ['route:' + name].concat(args));
                Backbone.history.trigger('route', this, name, args);
            }, this));
            return this;
        },

        // Simple proxy to `Backbone.history` to save a fragment into the history.
        navigate: function(fragment, options) {
            Backbone.history.navigate(fragment, options);
        },

        // Bind all defined routes to `Backbone.history`. We have to reverse the
        // order of the routes here to support behavior where the most general
        // routes can be defined at the bottom of the route map.
        _bindRoutes: function() {
            if (!this.routes) return;
            var routes = [];
            for (var route in this.routes) {
                routes.unshift([route, this.routes[route]]);
            }
            for (var i = 0, l = routes.length; i < l; i++) {
                this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
            }
        },

        // Convert a route string into a regular expression, suitable for matching
        // against the current location hash.
        _routeToRegExp: function(route) {
            route = route.replace(escapeRegExp, '\\$&')
                .replace(namedParam, '([^\/]+)')
                .replace(splatParam, '(.*?)');
            return new RegExp('^' + route + '$');
        },

        // Given a route, and a URL fragment that it matches, return the array of
        // extracted parameters.
        _extractParameters: function(route, fragment) {
            return route.exec(fragment).slice(1);
        }

    });

    // Backbone.History
    // ----------------

    // Handles cross-browser history management, based on URL fragments. If the
    // browser does not support `onhashchange`, falls back to polling.
    var History = Backbone.History = function() {
        this.handlers = [];
        _.bindAll(this, 'checkUrl');
    };

    // Cached regex for cleaning leading hashes and slashes .
    var routeStripper = /^[#\/]/;

    // Cached regex for detecting MSIE.
    var isExplorer = /msie [\w.]+/;

    // Has the history handling already been started?
    History.started = false;

    // Set up all inheritable **Backbone.History** properties and methods.
    _.extend(History.prototype, Events, {

        // The default interval to poll for hash changes, if necessary, is
        // twenty times a second.
        interval: 50,

        // Gets the true hash value. Cannot use location.hash directly due to bug
        // in Firefox where location.hash will always be decoded.
        getHash: function(windowOverride) {
            var loc = windowOverride ? windowOverride.location : window.location;
            var match = loc.href.match(/#(.*)$/);
            return match ? match[1] : '';
        },

        // Get the cross-browser normalized URL fragment, either from the URL,
        // the hash, or the override.
        getFragment: function(fragment, forcePushState) {
            if (fragment == null) {
                if (this._hasPushState || forcePushState) {
                    fragment = window.location.pathname;
                    var search = window.location.search;
                    if (search) fragment += search;
                } else {
                    fragment = this.getHash();
                }
            }
            if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
            return fragment.replace(routeStripper, '');
        },

        // Start the hash change handling, returning `true` if the current URL matches
        // an existing route, and `false` otherwise.
        start: function(options) {
            if (History.started) throw new Error("Backbone.history has already been started");
            History.started = true;

            // Figure out the initial configuration. Do we need an iframe?
            // Is pushState desired ... is it available?
            this.options          = _.extend({}, {root: '/'}, this.options, options);
            this._wantsHashChange = this.options.hashChange !== false;
            this._wantsPushState  = !!this.options.pushState;
            this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
            var fragment          = this.getFragment();
            var docMode           = document.documentMode;
            var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

            if (oldIE) {
                this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
                this.navigate(fragment);
            }

            // Depending on whether we're using pushState or hashes, and whether
            // 'onhashchange' is supported, determine how we check the URL state.
            if (this._hasPushState) {
                $(window).bind('popstate', this.checkUrl);
            } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
                $(window).bind('hashchange', this.checkUrl);
            } else if (this._wantsHashChange) {
                this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
            }

            // Determine if we need to change the base url, for a pushState link
            // opened by a non-pushState browser.
            this.fragment = fragment;
            var loc = window.location;
            var atRoot  = loc.pathname == this.options.root;

            // If we've started off with a route from a `pushState`-enabled browser,
            // but we're currently in a browser that doesn't support it...
            if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
                this.fragment = this.getFragment(null, true);
                window.location.replace(this.options.root + '#' + this.fragment);
                // Return immediately as browser will do redirect to new url
                return true;

                // Or if we've started out with a hash-based route, but we're currently
                // in a browser where it could be `pushState`-based instead...
            } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
                this.fragment = this.getHash().replace(routeStripper, '');
                window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
            }

            if (!this.options.silent) {
                return this.loadUrl();
            }
        },

        // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
        // but possibly useful for unit testing Routers.
        stop: function() {
            $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
            clearInterval(this._checkUrlInterval);
            History.started = false;
        },

        // Add a route to be tested when the fragment changes. Routes added later
        // may override previous routes.
        route: function(route, callback) {
            this.handlers.unshift({route: route, callback: callback});
        },

        // Checks the current URL to see if it has changed, and if it has,
        // calls `loadUrl`, normalizing across the hidden iframe.
        checkUrl: function(e) {
            var current = this.getFragment();
            if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
            if (current == this.fragment) return false;
            if (this.iframe) this.navigate(current);
            this.loadUrl() || this.loadUrl(this.getHash());
        },

        // Attempt to load the current URL fragment. If a route succeeds with a
        // match, returns `true`. If no defined routes matches the fragment,
        // returns `false`.
        loadUrl: function(fragmentOverride) {
            var fragment = this.fragment = this.getFragment(fragmentOverride);
            var matched = _.any(this.handlers, function(handler) {
                if (handler.route.test(fragment)) {
                    handler.callback(fragment);
                    return true;
                }
            });
            return matched;
        },

        // Save a fragment into the hash history, or replace the URL state if the
        // 'replace' option is passed. You are responsible for properly URL-encoding
        // the fragment in advance.
        //
        // The options object can contain `trigger: true` if you wish to have the
        // route callback be fired (not usually desirable), or `replace: true`, if
        // you wish to modify the current URL without adding an entry to the history.
        navigate: function(fragment, options) {
            if (!History.started) return false;
            if (!options || options === true) options = {trigger: options};
            var frag = (fragment || '').replace(routeStripper, '');
            if (this.fragment == frag) return;

            // If pushState is available, we use it to set the fragment as a real URL.
            if (this._hasPushState) {
                if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
                this.fragment = frag;
                window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

                // If hash changes haven't been explicitly disabled, update the hash
                // fragment to store history.
            } else if (this._wantsHashChange) {
                this.fragment = frag;
                this._updateHash(window.location, frag, options.replace);
                if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
                    // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
                    // When replace is true, we don't want this.
                    if(!options.replace) this.iframe.document.open().close();
                    this._updateHash(this.iframe.location, frag, options.replace);
                }

                // If you've told us that you explicitly don't want fallback hashchange-
                // based history, then `navigate` becomes a page refresh.
            } else {
                window.location.assign(this.options.root + fragment);
            }
            if (options.trigger) this.loadUrl(fragment);
        },

        // Update the hash location, either replacing the current entry, or adding
        // a new one to the browser history.
        _updateHash: function(location, fragment, replace) {
            if (replace) {
                location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
            } else {
                location.hash = fragment;
            }
        }
    });

    // Backbone.View
    // -------------

    // Creating a Backbone.View creates its initial element outside of the DOM,
    // if an existing element is not provided...
    var View = Backbone.View = function(options) {
        this.cid = _.uniqueId('view');
        this._configure(options || {});
        this._ensureElement();
        this.initialize.apply(this, arguments);
        this.delegateEvents();
    };

    // Cached regex to split keys for `delegate`.
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    // List of view options to be merged as properties.
    var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

    // Set up all inheritable **Backbone.View** properties and methods.
    _.extend(View.prototype, Events, {

        // The default `tagName` of a View's element is `"div"`.
        tagName: 'div',

        // jQuery delegate for element lookup, scoped to DOM elements within the
        // current view. This should be prefered to global lookups where possible.
        $: function(selector) {
            return this.$el.find(selector);
        },

        // Initialize is an empty function by default. Override it with your own
        // initialization logic.
        initialize: function(){},

        // **render** is the core function that your view should override, in order
        // to populate its element (`this.el`), with the appropriate HTML. The
        // convention is for **render** to always return `this`.
        render: function() {
            return this;
        },

        // Remove this view from the DOM. Note that the view isn't present in the
        // DOM by default, so calling this method may be a no-op.
        remove: function() {
            this.$el.remove();
            return this;
        },

        // For small amounts of DOM Elements, where a full-blown template isn't
        // needed, use **make** to manufacture elements, one at a time.
        //
        //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
        //
        make: function(tagName, attributes, content) {
            var el = document.createElement(tagName);
            if (attributes) $(el).attr(attributes);
            if (content != null) $(el).html(content);
            return el;
        },

        // Change the view's element (`this.el` property), including event
        // re-delegation.
        setElement: function(element, delegate) {
            if (this.$el) this.undelegateEvents();
            this.$el = (element instanceof $) ? element : $(element);
            this.el = this.$el[0];
            if (delegate !== false) this.delegateEvents();
            return this;
        },

        // Set callbacks, where `this.events` is a hash of
        //
        // *{"event selector": "callback"}*
        //
        //     {
        //       'mousedown .title':  'edit',
        //       'click .button':     'save'
        //       'click .open':       function(e) { ... }
        //     }
        //
        // pairs. Callbacks will be bound to the view, with `this` set properly.
        // Uses event delegation for efficiency.
        // Omitting the selector binds the event to `this.el`.
        // This only works for delegate-able events: not `focus`, `blur`, and
        // not `change`, `submit`, and `reset` in Internet Explorer.
        delegateEvents: function(events) {
            if (!(events || (events = getValue(this, 'events')))) return;
            this.undelegateEvents();
            for (var key in events) {
                var method = events[key];
                if (!_.isFunction(method)) method = this[events[key]];
                if (!method) throw new Error('Method "' + events[key] + '" does not exist');
                var match = key.match(delegateEventSplitter);
                var eventName = match[1], selector = match[2];
                method = _.bind(method, this);
                eventName += '.delegateEvents' + this.cid;
                if (selector === '') {
                    this.$el.bind(eventName, method);
                } else {
                    this.$el.delegate(selector, eventName, method);
                }
            }
        },

        // Clears all callbacks previously bound to the view with `delegateEvents`.
        // You usually don't need to use this, but may wish to if you have multiple
        // Backbone views attached to the same DOM element.
        undelegateEvents: function() {
            this.$el.unbind('.delegateEvents' + this.cid);
        },

        // Performs the initial configuration of a View with a set of options.
        // Keys with special meaning *(model, collection, id, className)*, are
        // attached directly to the view.
        _configure: function(options) {
            if (this.options) options = _.extend({}, this.options, options);
            for (var i = 0, l = viewOptions.length; i < l; i++) {
                var attr = viewOptions[i];
                if (options[attr]) this[attr] = options[attr];
            }
            this.options = options;
        },

        // Ensure that the View has a DOM element to render into.
        // If `this.el` is a string, pass it through `$()`, take the first
        // matching element, and re-assign it to `el`. Otherwise, create
        // an element from the `id`, `className` and `tagName` properties.
        _ensureElement: function() {
            if (!this.el) {
                var attrs = getValue(this, 'attributes') || {};
                if (this.id) attrs.id = this.id;
                if (this.className) attrs['class'] = this.className;
                this.setElement(this.make(this.tagName, attrs), false);
            } else {
                this.setElement(this.el, false);
            }
        }

    });

    // The self-propagating extend function that Backbone classes use.
    var extend = function (protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };

    // Set up inheritance for the model, collection, and view.
    Model.extend = Collection.extend = Router.extend = View.extend = extend;

    // Backbone.sync
    // -------------

    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read':   'GET'
    };

    // Override this function to change the manner in which Backbone persists
    // models to the server. You will be passed the type of request, and the
    // model in question. By default, makes a RESTful Ajax request
    // to the model's `url()`. Some possible customizations could be:
    //
    // * Use `setTimeout` to batch rapid-fire updates into a single request.
    // * Send up the models as XML instead of JSON.
    // * Persist models via WebSockets instead of Ajax.
    //
    // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
    // as `POST`, with a `_method` parameter containing the true HTTP method,
    // as well as all requests with the body as `application/x-www-form-urlencoded`
    // instead of `application/json` with the model in a param named `model`.
    // Useful when interfacing with server-side languages like **PHP** that make
    // it difficult to read the body of `PUT` requests.
    Backbone.sync = function(method, model, options) {
        var type = methodMap[method];

        // Default options, unless specified.
        options || (options = {});

        // Default JSON-request options.
        var params = {type: type, dataType: 'json'};

        // Ensure that we have a URL.
        if (!options.url) {
            params.url = getValue(model, 'url') || urlError();
        }

        // Ensure that we have the appropriate request data.
        if (!options.data && model && (method == 'create' || method == 'update')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.toJSON());
        }

        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (Backbone.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? {model: params.data} : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (Backbone.emulateHTTP) {
            if (type === 'PUT' || type === 'DELETE') {
                if (Backbone.emulateJSON) params.data._method = type;
                params.type = 'POST';
                params.beforeSend = function(xhr) {
                    xhr.setRequestHeader('X-HTTP-Method-Override', type);
                };
            }
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !Backbone.emulateJSON) {
            params.processData = false;
        }

        // Make the request, allowing the user to override any Ajax options.
        return $.ajax(_.extend(params, options));
    };

    // Wrap an optional error callback with a fallback error event.
    Backbone.wrapError = function(onError, originalModel, options) {
        return function(model, resp) {
            resp = model === originalModel ? resp : model;
            if (onError) {
                onError(originalModel, resp, options);
            } else {
                originalModel.trigger('error', originalModel, resp, options);
            }
        };
    };

    // Helpers
    // -------

    // Shared empty constructor function to aid in prototype-chain creation.
    var ctor = function(){};

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var inherits = function(parent, protoProps, staticProps) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) _.extend(child.prototype, protoProps);

        // Add static properties to the constructor function, if supplied.
        if (staticProps) _.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    // Helper function to get a value from a Backbone object as a property
    // or as a function.
    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };

    // Throw an error when a URL is needed, and none is supplied.
    var urlError = function() {
        throw new Error('A "url" property or function must be specified');
    };

    return Backbone;
}));

// Backbone.Marionette v0.8.4
//
// Copyright (C)2012 Derick Bailey, Muted Solutions, LLC
// Distributed Under MIT License
//
// Documentation and Full License Available at:
// http://github.com/derickbailey/backbone.marionette
(function (root, factory) {
    if (typeof exports === 'object') {

        var jquery = require('jquery');
        var underscore = require('underscore');
        var backbone = require('backbone');

        module.exports = factory(jquery, underscore, backbone);

    } else if (typeof define === 'function' && define.amd) {

        define('marionette',['jquery', 'underscore', 'backbone'], factory);

    }
}(this, function ($, _, Backbone) {

    Backbone.Marionette = (function(Backbone, _, $){
        var Marionette = {};

        Marionette.version = "0.8.4";

        // Marionette.View
        // ---------------

        // The core view type that other Marionette views extend from.
        Marionette.View = Backbone.View.extend({
            // Get the template or template id/selector for this view
            // instance. You can set a `template` attribute in the view
            // definition or pass a `template: "whatever"` parameter in
            // to the constructor options. The `template` can also be
            // a function that returns a selector string.
            getTemplateSelector: function(){
                var template;

                // Get the template from `this.options.template` or
                // `this.template`. The `options` takes precedence.
                if (this.options && this.options.template){
                    template = this.options.template;
                } else {
                    template = this.template;
                }

                // check if it's a function and execute it, if it is
                if (_.isFunction(template)){
                    template  = template.call(this);
                }

                return template;
            },

            // Serialize the model or collection for the view. If a model is
            // found, `.toJSON()` is called. If a collection is found, `.toJSON()`
            // is also called, but is used to populate an `items` array in the
            // resulting data. If both are found, defaults to the model.
            // You can override the `serializeData` method in your own view
            // definition, to provide custom serialization for your view's data.
            serializeData: function(){
                var data;

                if (this.model) {
                    data = this.model.toJSON();
                }
                else if (this.collection) {
                    data = { items: this.collection.toJSON() };
                }

                data = this.mixinTemplateHelpers(data);

                return data;
            },

            // Mix in template helper methods. Looks for a
            // `templateHelpers` attribute, which can either be an
            // object literal, or a function that returns an object
            // literal. All methods and attributes from this object
            // are copies to the object passed in.
            mixinTemplateHelpers: function(target){
                target = target || {};
                var templateHelpers = this.templateHelpers;
                if (_.isFunction(templateHelpers)){
                    templateHelpers = templateHelpers.call(this);
                }
                return _.extend(target, templateHelpers);
            },

            // Configure `triggers` to forward DOM events to view
            // events. `triggers: {"click .foo": "do:foo"}`
            configureTriggers: function(){
                if (!this.triggers) { return; }

                var triggers = this.triggers;
                var that = this;
                var triggerEvents = {};

                // Allow `triggers` to be configured as a function
                if (_.isFunction(triggers)){ triggers = triggers.call(this); }

                // Configure the triggers, prevent default
                // action and stop propagation of DOM events
                _.each(triggers, function(value, key){

                    triggerEvents[key] = function(e){
                        if (e && e.preventDefault){ e.preventDefault(); }
                        if (e && e.stopPropagation){ e.stopPropagation(); }
                        that.trigger(value);
                    }

                });

                return triggerEvents;
            },

            delegateEvents: function(events){
                events = events || this.events;
                if (_.isFunction(events)){ events = events.call(this)}

                var combinedEvents = {};
                var triggers = this.configureTriggers();
                _.extend(combinedEvents, events, triggers);

                Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
            },

            // Default `close` implementation, for removing a view from the
            // DOM and unbinding it. Regions will call this method
            // for you. You can specify an `onClose` method in your view to
            // add custom code that is called after the view is closed.
            close: function(){
                if (this.beforeClose) { this.beforeClose(); }

                this.unbindAll();
                this.remove();

                if (this.onClose) { this.onClose(); }
                this.trigger('close');
                this.unbind();
            }
        });

        // Item View
        // ---------

        // A single item view implementation that contains code for rendering
        // with underscore.js templates, serializing the view's model or collection,
        // and calling several methods on extended views, such as `onRender`.
        Marionette.ItemView = Marionette.View.extend({
            constructor: function(){
                var args = slice.call(arguments);
                Marionette.View.prototype.constructor.apply(this, args);

                _.bindAll(this, "render");

                this.initialEvents();
            },

            // Configured the initial events that the item view
            // binds to. Override this method to prevent the initial
            // events, or to add your own initial events.
            initialEvents: function(){
                if (this.collection){
                    this.bindTo(this.collection, "reset", this.render, this);
                }
            },

            // Render the view, defaulting to underscore.js templates.
            // You can override this in your view definition.
            render: function(){
                var that = this;

                var deferredRender = $.Deferred();

                var beforeRenderDone = function() {
                    that.trigger("before:render", that);
                    that.trigger("item:before:render", that);

                    var deferredData = that.serializeData();
                    $.when(deferredData).then(dataSerialized);
                }

                var dataSerialized = function(data){
                    var asyncRender = that.renderHtml(data);
                    $.when(asyncRender).then(templateRendered);
                }

                var templateRendered = function(html){
                    that.$el.html(html);
                    callDeferredMethod(that.onRender, onRenderDone, that);
                }

                var onRenderDone = function(){
                    that.trigger("render", that);
                    that.trigger("item:rendered", that);

                    deferredRender.resolve();
                }

                callDeferredMethod(this.beforeRender, beforeRenderDone, this);

                return deferredRender.promise();
            },

            // Render the data for this item view in to some HTML.
            // Override this method to replace the specific way in
            // which an item view has it's data rendered in to html.
            renderHtml: function(data) {
                var template = this.getTemplateSelector();
                return Marionette.Renderer.render(template, data);
            },

            // Override the default close event to add a few
            // more events that are triggered.
            close: function(){
                this.trigger('item:before:close');
                Marionette.View.prototype.close.apply(this, arguments);
                this.trigger('item:closed');
            }
        });

        // Collection View
        // ---------------

        // A view that iterates over a Backbone.Collection
        // and renders an individual ItemView for each model.
        Marionette.CollectionView = Marionette.View.extend({
            constructor: function(){
                Marionette.View.prototype.constructor.apply(this, arguments);

                _.bindAll(this, "addItemView", "render");
                this.initialEvents();
            },

            // Configured the initial events that the collection view
            // binds to. Override this method to prevent the initial
            // events, or to add your own initial events.
            initialEvents: function(){
                if (this.collection){
                    this.bindTo(this.collection, "add", this.addChildView, this);
                    this.bindTo(this.collection, "remove", this.removeItemView, this);
                    this.bindTo(this.collection, "reset", this.render, this);
                }
            },

            // Handle a child item added to the collection
            addChildView: function(item){
                var ItemView = this.getItemView();
                return this.addItemView(item, ItemView);
            },

            // Loop through all of the items and render
            // each of them with the specified `itemView`.
            render: function(){
                var that = this;
                var deferredRender = $.Deferred();
                var promises = [];
                var ItemView = this.getItemView();

                if (this.beforeRender) { this.beforeRender(); }
                this.trigger("collection:before:render", this);

                this.closeChildren();

                if (this.collection) {
                    this.collection.each(function(item){
                        var promise = that.addItemView(item, ItemView);
                        promises.push(promise);
                    });
                }

                deferredRender.done(function(){
                    if (this.onRender) { this.onRender(); }
                    this.trigger("collection:rendered", this);
                });

                $.when.apply(this, promises).then(function(){
                    deferredRender.resolveWith(that);
                });

                return deferredRender.promise();
            },

            // Retrieve the itemView type, either from `this.options.itemView`
            // or from the `itemView` in the object definition. The "options"
            // takes precedence.
            getItemView: function(){
                var itemView = this.options.itemView || this.itemView;

                if (!itemView){
                    var err = new Error("An `itemView` must be specified");
                    err.name = "NoItemViewError";
                    throw err;
                }

                return itemView;
            },

            // Render the child item's view and add it to the
            // HTML for the collection view.
            addItemView: function(item, ItemView){
                var that = this;

                var view = this.buildItemView(item, ItemView);
                this.bindTo(view, "all", function(){

                    // get the args, prepend the event name
                    // with "itemview:" and insert the child view
                    // as the first event arg (after the event name)
                    var args = slice.call(arguments);
                    args[0] = "itemview:" + args[0];
                    args.splice(1, 0, view);

                    that.trigger.apply(that, args);
                });

                this.storeChild(view);
                this.trigger("item:added", view);

                var viewRendered = view.render();
                $.when(viewRendered).then(function(){
                    that.appendHtml(that, view);
                });

                return viewRendered;
            },

            // Build an `itemView` for every model in the collection.
            buildItemView: function(item, ItemView){
                var view = new ItemView({
                    model: item
                });
                return view;
            },

            // Remove the child view and close it
            removeItemView: function(item){
                var view = this.children[item.cid];
                if (view){
                    view.close();
                    delete this.children[item.cid];
                }
                this.trigger("item:removed", view);
            },

            // Append the HTML to the collection's `el`.
            // Override this method to do something other
            // then `.append`.
            appendHtml: function(collectionView, itemView){
                collectionView.$el.append(itemView.el);
            },

            // Store references to all of the child `itemView`
            // instances so they can be managed and cleaned up, later.
            storeChild: function(view){
                if (!this.children){
                    this.children = {};
                }
                this.children[view.model.cid] = view;
            },

            // Handle cleanup and other closing needs for
            // the collection of views.
            close: function(){
                this.trigger("collection:before:close");
                this.closeChildren();
                Marionette.View.prototype.close.apply(this, arguments);
                this.trigger("collection:closed");
            },

            closeChildren: function(){
                if (this.children){
                    _.each(this.children, function(childView){
                        childView.close();
                    });
                }
            }
        });

        // Composite View
        // --------------

        // Used for rendering a branch-leaf, hierarchical structure.
        // Extends directly from CollectionView and also renders an
        // an item view as `modelView`, for the top leaf
        Marionette.CompositeView = Marionette.CollectionView.extend({
            constructor: function(options){
                Marionette.CollectionView.apply(this, arguments);
                this.itemView = this.getItemView();
            },

            // Retrieve the `itemView` to be used when rendering each of
            // the items in the collection. The default is to return
            // `this.itemView` or Marionette.CompositeView if no `itemView`
            // has been defined
            getItemView: function(){
                return this.itemView || this.constructor;
            },

            // Renders the model once, and the collection once. Calling
            // this again will tell the model's view to re-render itself
            // but the collection will not re-render.
            render: function(){
                var that = this;
                var compositeRendered = $.Deferred();

                var modelIsRendered = this.renderModel();
                $.when(modelIsRendered).then(function(html){
                    that.$el.html(html);
                    that.trigger("composite:model:rendered");
                    that.trigger("render");

                    var collectionIsRendered = that.renderCollection();
                    $.when(collectionIsRendered).then(function(){
                        compositeRendered.resolve();
                    });
                });

                compositeRendered.done(function(){
                    that.trigger("composite:rendered");
                });

                return compositeRendered.promise();
            },

            // Render the collection for the composite view
            renderCollection: function(){
                var collectionDeferred = Marionette.CollectionView.prototype.render.apply(this, arguments);
                collectionDeferred.done(function(){
                    this.trigger("composite:collection:rendered");
                });
                return collectionDeferred.promise();
            },

            // Render an individual model, if we have one, as
            // part of a composite view (branch / leaf). For example:
            // a treeview.
            renderModel: function(){
                var data = {};
                data = this.serializeData();

                var template = this.getTemplateSelector();
                return Marionette.Renderer.render(template, data);
            }
        });

        // Region
        // ------

        // Manage the visual regions of your composite application. See
        // http://lostechies.com/derickbailey/2011/12/12/composite-js-apps-regions-and-region-managers/
        Marionette.Region = function(options){
            this.options = options || {};

            _.extend(this, options);

            if (!this.el){
                var err = new Error("An 'el' must be specified");
                err.name = "NoElError";
                throw err;
            }

            if (this.initialize){
                this.initialize.apply(this, arguments);
            }
        };

        _.extend(Marionette.Region.prototype, Backbone.Events, {

            // Displays a backbone view instance inside of the region.
            // Handles calling the `render` method for you. Reads content
            // directly from the `el` attribute. Also calls an optional
            // `onShow` and `close` method on your view, just after showing
            // or just before closing the view, respectively.
            show: function(view, appendMethod){
                this.ensureEl();

                this.close();
                this.open(view, appendMethod);

                this.currentView = view;
            },

            ensureEl: function(){
                if (!this.$el || this.$el.length === 0){
                    this.$el = this.getEl(this.el);
                }
            },

            // Override this method to change how the region finds the
            // DOM element that it manages. Return a jQuery selector object.
            getEl: function(selector){
                return $(selector);
            },

            // Internal method to render and display a view. Not meant
            // to be called from any external code.
            open: function(view, appendMethod){
                var that = this;
                appendMethod = appendMethod || "html";

                $.when(view.render()).then(function () {
                    that.$el[appendMethod](view.el);
                    if (view.onShow) { view.onShow(); }
                    if (that.onShow) { that.onShow(view); }
                    view.trigger("show");
                    that.trigger("view:show", view);
                });
            },

            // Close the current view, if there is one. If there is no
            // current view, it does nothing and returns immediately.
            close: function(){
                var view = this.currentView;
                if (!view){ return; }

                if (view.close) { view.close(); }
                this.trigger("view:closed", view);

                delete this.currentView;
            },

            // Attach an existing view to the region. This
            // will not call `render` or `onShow` for the new view,
            // and will not replace the current HTML for the `el`
            // of the region.
            attachView: function(view){
                this.currentView = view;
            }
        });

        // Layout
        // ------

        // Formerly known as Composite Region.
        //
        // Used for managing application layouts, nested layouts and
        // multiple regions within an application or sub-application.
        //
        // A specialized view type that renders an area of HTML and then
        // attaches `Region` instances to the specified `regions`.
        // Used for composite view management and sub-application areas.
        Marionette.Layout = Marionette.ItemView.extend({
            constructor: function () {
                this.vent = new Backbone.Marionette.EventAggregator();
                Backbone.Marionette.ItemView.apply(this, arguments);
                this.regionManagers = {};
            },

            render: function () {
                this.initializeRegions();
                return Backbone.Marionette.ItemView.prototype.render.call(this, arguments);
            },

            close: function () {
                this.closeRegions();
                Backbone.Marionette.ItemView.prototype.close.call(this, arguments);
            },

            // Initialize the regions that have been defined in a
            // `regions` attribute on this layout. The key of the
            // hash becomes an attribute on the layout object directly.
            // For example: `regions: { menu: ".menu-container" }`
            // will product a `layout.menu` object which is a region
            // that controls the `.menu-container` DOM element.
            initializeRegions: function () {
                var that = this;
                _.each(this.regions, function (selector, name) {
                    var regionManager = new Backbone.Marionette.Region({
                        el: selector,

                        getEl: function(selector){
                            return that.$(selector);
                        }
                    });
                    that.regionManagers[name] = regionManager;
                    that[name] = regionManager;
                });
            },

            // Close all of the regions that have been opened by
            // this layout. This method is called when the layout
            // itself is closed.
            closeRegions: function () {
                var that = this;
                _.each(this.regionManagers, function (manager, name) {
                    manager.close();
                    delete that[name];
                });
                this.regionManagers = {};
            }
        });

        // AppRouter
        // ---------

        // Reduce the boilerplate code of handling route events
        // and then calling a single method on another object.
        // Have your routers configured to call the method on
        // your object, directly.
        //
        // Configure an AppRouter with `appRoutes`.
        //
        // App routers can only take one `controller` object.
        // It is recommended that you divide your controller
        // objects in to smaller peices of related functionality
        // and have multiple routers / controllers, instead of
        // just one giant router and controller.
        //
        // You can also add standard routes to an AppRouter.

        Marionette.AppRouter = Backbone.Router.extend({

            constructor: function(options){
                Backbone.Router.prototype.constructor.call(this, options);

                if (this.appRoutes){
                    var controller = this.controller;
                    if (options && options.controller) {
                        controller = options.controller;
                    }
                    this.processAppRoutes(controller, this.appRoutes);
                }
            },

            processAppRoutes: function(controller, appRoutes){
                var method, methodName;
                var route, routesLength, i;
                var routes = [];
                var router = this;

                for(route in appRoutes){
                    if (appRoutes.hasOwnProperty(route)){
                        routes.unshift([route, appRoutes[route]]);
                    }
                }

                routesLength = routes.length;
                for (i = 0; i < routesLength; i++){
                    route = routes[i][0];
                    methodName = routes[i][1];
                    method = controller[methodName];

                    if (!method){
                        var msg = "Method '" + methodName + "' was not found on the controller";
                        var err = new Error(msg);
                        err.name = "NoMethodError";
                        throw err;
                    }

                    method = _.bind(method, controller);
                    router.route(route, methodName, method);
                }
            }
        });

        // Composite Application
        // ---------------------

        // Contain and manage the composite application as a whole.
        // Stores and starts up `Region` objects, includes an
        // event aggregator as `app.vent`
        Marionette.Application = function(options){
            this.initCallbacks = new Marionette.Callbacks();
            this.vent = new Marionette.EventAggregator();
            _.extend(this, options);
        };

        _.extend(Marionette.Application.prototype, Backbone.Events, {
            // Add an initializer that is either run at when the `start`
            // method is called, or run immediately if added after `start`
            // has already been called.
            addInitializer: function(initializer){
                this.initCallbacks.add(initializer);
            },

            // kick off all of the application's processes.
            // initializes all of the regions that have been added
            // to the app, and runs all of the initializer functions
            start: function(options){
                this.trigger("initialize:before", options);
                this.initCallbacks.run(this, options);
                this.trigger("initialize:after", options);

                this.trigger("start", options);
            },

            // Add regions to your app.
            // Accepts a hash of named strings or Region objects
            // addRegions({something: "#someRegion"})
            // addRegions{{something: Region.extend({el: "#someRegion"}) });
            addRegions: function(regions){
                var regionValue, regionObj, region;

                for(region in regions){
                    if (regions.hasOwnProperty(region)){
                        regionValue = regions[region];

                        if (typeof regionValue === "string"){
                            regionObj = new Marionette.Region({
                                el: regionValue
                            });
                        } else {
                            regionObj = new regionValue();
                        }

                        this[region] = regionObj;
                    }
                }
            }
        });

        // BindTo: Event Binding
        // ---------------------

        // BindTo facilitates the binding and unbinding of events
        // from objects that extend `Backbone.Events`. It makes
        // unbinding events, even with anonymous callback functions,
        // easy.
        //
        // Thanks to Johnny Oshika for this code.
        // http://stackoverflow.com/questions/7567404/backbone-js-repopulate-or-recreate-the-view/7607853#7607853
        Marionette.BindTo = {
            // Store the event binding in array so it can be unbound
            // easily, at a later point in time.
            bindTo: function (obj, eventName, callback, context) {
                context = context || this;
                obj.on(eventName, callback, context);

                if (!this.bindings) { this.bindings = []; }

                var binding = {
                    obj: obj,
                    eventName: eventName,
                    callback: callback,
                    context: context
                }

                this.bindings.push(binding);

                return binding;
            },

            // Unbind from a single binding object. Binding objects are
            // returned from the `bindTo` method call.
            unbindFrom: function(binding){
                binding.obj.off(binding.eventName, binding.callback);
                this.bindings = _.reject(this.bindings, function(bind){return bind === binding});
            },

            // Unbind all of the events that we have stored.
            unbindAll: function () {
                var that = this;

                // The `unbindFrom` call removes elements from the array
                // while it is being iterated, so clone it first.
                var bindings = _.map(this.bindings, _.identity);
                _.each(bindings, function (binding, index) {
                    that.unbindFrom(binding);
                });
            }
        };

        // Callbacks
        // ---------

        // A simple way of managing a collection of callbacks
        // and executing them at a later point in time, using jQuery's
        // `Deferred` object.
        Marionette.Callbacks = function(){
            this.deferred = $.Deferred();
            this.promise = this.deferred.promise();
        };

        _.extend(Marionette.Callbacks.prototype, {

            // Add a callback to be executed. Callbacks added here are
            // guaranteed to execute, even if they are added after the
            // `run` method is called.
            add: function(callback){
                this.promise.done(function(context, options){
                    callback.call(context, options);
                });
            },

            // Run all registered callbacks with the context specified.
            // Additional callbacks can be added after this has been run
            // and they will still be executed.
            run: function(context, options){
                this.deferred.resolve(context, options);
            }
        });

        // Event Aggregator
        // ----------------

        // A pub-sub object that can be used to decouple various parts
        // of an application through event-driven architecture.
        Marionette.EventAggregator = function(options){
            _.extend(this, options);
        };

        _.extend(Marionette.EventAggregator.prototype, Backbone.Events, Marionette.BindTo, {
            // Assumes the event aggregator itself is the
            // object being bound to.
            bindTo: function(eventName, callback, context){
                return Marionette.BindTo.bindTo.call(this, this, eventName, callback, context);
            }
        });

        // Template Cache
        // --------------

        // Manage templates stored in `<script>` blocks,
        // caching them for faster access.
        Marionette.TemplateCache = {
            templates: {},
            loaders: {},

            // Get the specified template by id. Either
            // retrieves the cached version, or loads it
            // from the DOM.
            get: function(templateId){
                var that = this;
                var templateRetrieval = $.Deferred();
                var cachedTemplate = this.templates[templateId];

                if (cachedTemplate){
                    templateRetrieval.resolve(cachedTemplate);
                } else {
                    var loader = this.loaders[templateId];
                    if(loader) {
                        templateRetrieval = loader;
                    } else {
                        this.loaders[templateId] = templateRetrieval;

                        this.loadTemplate(templateId, function(template){
                            delete that.loaders[templateId];
                            that.templates[templateId] = template;
                            templateRetrieval.resolve(template);
                        });
                    }

                }

                return templateRetrieval.promise();
            },

            // Load a template from the DOM, by default. Override
            // this method to provide your own template retrieval,
            // such as asynchronous loading from a server.
            loadTemplate: function(templateId, callback){
                var template = $(templateId).html();

                // Make sure we have a template before trying to compile it
                if (!template || template.length === 0){
                    var msg = "Could not find template: '" + templateId + "'";
                    var err = new Error(msg);
                    err.name = "NoTemplateError";
                    throw err;
                }

                template = this.compileTemplate(template);

                callback.call(this, template);
            },

            // Pre-compile the template before caching it. Override
            // this method if you do not need to pre-compile a template
            // (JST / RequireJS for example) or if you want to change
            // the template engine used (Handebars, etc).
            compileTemplate: function(rawTemplate){
                return _.template(rawTemplate);
            },

            // Clear templates from the cache. If no arguments
            // are specified, clears all templates:
            // `clear()`
            //
            // If arguments are specified, clears each of the
            // specified templates from the cache:
            // `clear("#t1", "#t2", "...")`
            clear: function(){
                var i;
                var length = arguments.length;

                if (length > 0){
                    for(i=0; i<length; i++){
                        delete this.templates[arguments[i]];
                    }
                } else {
                    this.templates = {};
                }
            }
        };

        // Renderer
        // --------

        // Render a template with data by passing in the template
        // selector and the data to render.
        Marionette.Renderer = {

            // Render a template with data. The `template` parameter is
            // passed to the `TemplateCache` object to retrieve the
            // actual template. Override this method to provide your own
            // custom rendering and template handling for all of Marionette.
            render: function(template, data){
                var that = this;
                var asyncRender = $.Deferred();

                var templateRetrieval = Marionette.TemplateCache.get(template);

                $.when(templateRetrieval).then(function(template){
                    var html = that.renderTemplate(template, data);
                    asyncRender.resolve(html);
                });

                return asyncRender.promise();
            },

            // Default implementation uses underscore.js templates. Override
            // this method to use your own templating engine.
            renderTemplate: function(template, data){
                var html = template(data);
                return html;
            }

        };

        // Modules
        // -------

        // The "Modules" object builds modules on an
        // object that it is attached to. It should not be
        // used on it's own, but should be attached to
        // another object that will define modules.
        Marionette.Modules = {

            // Add modules to the application, providing direct
            // access to your applicaiton object, Backbone,
            // Marionette, jQuery and Underscore as parameters
            // to a callback function.
            module: function(moduleNames, moduleDefinition){
                var moduleName, module, moduleOverride;
                var parentModule = this;
                var parentApp = this;
                var moduleNames = moduleNames.split(".");

                // Loop through all the parts of the module definition
                var length = moduleNames.length;
                for(var i = 0; i < length; i++){
                    var isLastModuleInChain = (i === length-1);

                    // Get the module name, and check if it exists on
                    // the current parent already
                    moduleName = moduleNames[i];
                    module = parentModule[moduleName];

                    // Create a new module if we don't have one already
                    if (!module){
                        module = new Marionette.Application();
                    }

                    // Check to see if we need to run the definition
                    // for the module. Only run the definition if one
                    // is supplied, and if we're at the last segment
                    // of the "Module.Name" chain.
                    if (isLastModuleInChain && moduleDefinition){
                        moduleOverride = moduleDefinition(module, parentApp, Backbone, Marionette, jQuery, _);
                        // If we have a module override, use it instead.
                        if (moduleOverride){
                            module = moduleOverride;
                        }
                    }

                    // If the defined module is not what we are
                    // currently storing as the module, replace it
                    if (parentModule[moduleName] !== module){
                        parentModule[moduleName] = module;
                    }

                    // Reset the parent module so that the next child
                    // in the list will be added to the correct parent
                    parentModule = module;
                }

                // Return the last module in the definition chain
                return module;
            }
        };

        // Helpers
        // -------

        // For slicing `arguments` in functions
        var slice = Array.prototype.slice;

        // Copy the `extend` function used by Backbone's classes
        var extend = Marionette.View.extend;
        Marionette.Region.extend = extend;
        Marionette.Application.extend = extend;

        // Copy the `modules` feature on to the `Application` object
        Marionette.Application.prototype.module = Marionette.Modules.module;

        // Copy the features of `BindTo` on to these objects
        _.extend(Marionette.View.prototype, Marionette.BindTo);
        _.extend(Marionette.Application.prototype, Marionette.BindTo);
        _.extend(Marionette.Region.prototype, Marionette.BindTo);

        // A simple wrapper method for deferring a callback until
        // after another method has been called, passing the
        // results of the first method to the second. Uses jQuery's
        // deferred / promise objects, and $.when/then to make it
        // work.
        var callDeferredMethod = function(fn, callback, context){
            var promise;
            if (fn) { promise = fn.call(context); }
            $.when(promise).then(callback);
        }


        return Marionette;
    })(Backbone, _, window.jQuery || window.Zepto || window.ender);

    return Backbone.Marionette;

}));

(function () {
// lib/handlebars/base.js
    var Handlebars = {};

    Handlebars.VERSION = "1.0.beta.6";

    Handlebars.helpers  = {};
    Handlebars.partials = {};

    Handlebars.registerHelper = function(name, fn, inverse) {
        if(inverse) { fn.not = inverse; }
        this.helpers[name] = fn;
    };

    Handlebars.registerPartial = function(name, str) {
        this.partials[name] = str;
    };

    Handlebars.registerHelper('helperMissing', function(arg) {
        if(arguments.length === 2) {
            return undefined;
        } else {
            throw new Error("Could not find property '" + arg + "'");
        }
    });

    var toString = Object.prototype.toString, functionType = "[object Function]";

    Handlebars.registerHelper('blockHelperMissing', function(context, options) {
        var inverse = options.inverse || function() {}, fn = options.fn;


        var ret = "";
        var type = toString.call(context);

        if(type === functionType) { context = context.call(this); }

        if(context === true) {
            return fn(this);
        } else if(context === false || context == null) {
            return inverse(this);
        } else if(type === "[object Array]") {
            if(context.length > 0) {
                for(var i=0, j=context.length; i<j; i++) {
                    ret = ret + fn(context[i]);
                }
            } else {
                ret = inverse(this);
            }
            return ret;
        } else {
            return fn(context);
        }
    });

    Handlebars.registerHelper('each', function(context, options) {
        var fn = options.fn, inverse = options.inverse;
        var ret = "";

        if(context && context.length > 0) {
            for(var i=0, j=context.length; i<j; i++) {
                ret = ret + fn(context[i]);
            }
        } else {
            ret = inverse(this);
        }
        return ret;
    });

    Handlebars.registerHelper('if', function(context, options) {
        var type = toString.call(context);
        if(type === functionType) { context = context.call(this); }

        if(!context || Handlebars.Utils.isEmpty(context)) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper('unless', function(context, options) {
        var fn = options.fn, inverse = options.inverse;
        options.fn = inverse;
        options.inverse = fn;

        return Handlebars.helpers['if'].call(this, context, options);
    });

    Handlebars.registerHelper('with', function(context, options) {
        return options.fn(context);
    });

    Handlebars.registerHelper('log', function(context) {
        Handlebars.log(context);
    });
    ;
// lib/handlebars/compiler/parser.js
    /* Jison generated parser */
    var handlebars = (function(){

        var parser = {trace: function trace() { },
            yy: {},
            symbols_: {"error":2,"root":3,"program":4,"EOF":5,"statements":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"inMustache":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"OPEN_PARTIAL":24,"params":25,"hash":26,"param":27,"STRING":28,"INTEGER":29,"BOOLEAN":30,"hashSegments":31,"hashSegment":32,"ID":33,"EQUALS":34,"pathSegments":35,"SEP":36,"$accept":0,"$end":1},
            terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"OPEN_PARTIAL",28:"STRING",29:"INTEGER",30:"BOOLEAN",33:"ID",34:"EQUALS",36:"SEP"},
            productions_: [0,[3,2],[4,3],[4,1],[4,0],[6,1],[6,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[7,2],[17,3],[17,2],[17,2],[17,1],[25,2],[25,1],[27,1],[27,1],[27,1],[27,1],[26,1],[31,2],[31,1],[32,3],[32,3],[32,3],[32,3],[21,1],[35,3],[35,1]],
            performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

                var $0 = $$.length - 1;
                switch (yystate) {
                    case 1: return $$[$0-1]
                        break;
                    case 2: this.$ = new yy.ProgramNode($$[$0-2], $$[$0])
                        break;
                    case 3: this.$ = new yy.ProgramNode($$[$0])
                        break;
                    case 4: this.$ = new yy.ProgramNode([])
                        break;
                    case 5: this.$ = [$$[$0]]
                        break;
                    case 6: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]
                        break;
                    case 7: this.$ = new yy.InverseNode($$[$0-2], $$[$0-1], $$[$0])
                        break;
                    case 8: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0])
                        break;
                    case 9: this.$ = $$[$0]
                        break;
                    case 10: this.$ = $$[$0]
                        break;
                    case 11: this.$ = new yy.ContentNode($$[$0])
                        break;
                    case 12: this.$ = new yy.CommentNode($$[$0])
                        break;
                    case 13: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1])
                        break;
                    case 14: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1])
                        break;
                    case 15: this.$ = $$[$0-1]
                        break;
                    case 16: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1])
                        break;
                    case 17: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], true)
                        break;
                    case 18: this.$ = new yy.PartialNode($$[$0-1])
                        break;
                    case 19: this.$ = new yy.PartialNode($$[$0-2], $$[$0-1])
                        break;
                    case 20:
                        break;
                    case 21: this.$ = [[$$[$0-2]].concat($$[$0-1]), $$[$0]]
                        break;
                    case 22: this.$ = [[$$[$0-1]].concat($$[$0]), null]
                        break;
                    case 23: this.$ = [[$$[$0-1]], $$[$0]]
                        break;
                    case 24: this.$ = [[$$[$0]], null]
                        break;
                    case 25: $$[$0-1].push($$[$0]); this.$ = $$[$0-1];
                        break;
                    case 26: this.$ = [$$[$0]]
                        break;
                    case 27: this.$ = $$[$0]
                        break;
                    case 28: this.$ = new yy.StringNode($$[$0])
                        break;
                    case 29: this.$ = new yy.IntegerNode($$[$0])
                        break;
                    case 30: this.$ = new yy.BooleanNode($$[$0])
                        break;
                    case 31: this.$ = new yy.HashNode($$[$0])
                        break;
                    case 32: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]
                        break;
                    case 33: this.$ = [$$[$0]]
                        break;
                    case 34: this.$ = [$$[$0-2], $$[$0]]
                        break;
                    case 35: this.$ = [$$[$0-2], new yy.StringNode($$[$0])]
                        break;
                    case 36: this.$ = [$$[$0-2], new yy.IntegerNode($$[$0])]
                        break;
                    case 37: this.$ = [$$[$0-2], new yy.BooleanNode($$[$0])]
                        break;
                    case 38: this.$ = new yy.IdNode($$[$0])
                        break;
                    case 39: $$[$0-2].push($$[$0]); this.$ = $$[$0-2];
                        break;
                    case 40: this.$ = [$$[$0]]
                        break;
                }
            },
            table: [{3:1,4:2,5:[2,4],6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],24:[1,15]},{1:[3]},{5:[1,16]},{5:[2,3],7:17,8:18,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,19],20:[2,3],22:[1,13],23:[1,14],24:[1,15]},{5:[2,5],14:[2,5],15:[2,5],16:[2,5],19:[2,5],20:[2,5],22:[2,5],23:[2,5],24:[2,5]},{4:20,6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],24:[1,15]},{4:21,6:3,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],24:[1,15]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{17:22,21:23,33:[1,25],35:24},{17:26,21:23,33:[1,25],35:24},{17:27,21:23,33:[1,25],35:24},{17:28,21:23,33:[1,25],35:24},{21:29,33:[1,25],35:24},{1:[2,1]},{6:30,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],24:[1,15]},{5:[2,6],14:[2,6],15:[2,6],16:[2,6],19:[2,6],20:[2,6],22:[2,6],23:[2,6],24:[2,6]},{17:22,18:[1,31],21:23,33:[1,25],35:24},{10:32,20:[1,33]},{10:34,20:[1,33]},{18:[1,35]},{18:[2,24],21:40,25:36,26:37,27:38,28:[1,41],29:[1,42],30:[1,43],31:39,32:44,33:[1,45],35:24},{18:[2,38],28:[2,38],29:[2,38],30:[2,38],33:[2,38],36:[1,46]},{18:[2,40],28:[2,40],29:[2,40],30:[2,40],33:[2,40],36:[2,40]},{18:[1,47]},{18:[1,48]},{18:[1,49]},{18:[1,50],21:51,33:[1,25],35:24},{5:[2,2],8:18,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,2],22:[1,13],23:[1,14],24:[1,15]},{14:[2,20],15:[2,20],16:[2,20],19:[2,20],22:[2,20],23:[2,20],24:[2,20]},{5:[2,7],14:[2,7],15:[2,7],16:[2,7],19:[2,7],20:[2,7],22:[2,7],23:[2,7],24:[2,7]},{21:52,33:[1,25],35:24},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14]},{18:[2,22],21:40,26:53,27:54,28:[1,41],29:[1,42],30:[1,43],31:39,32:44,33:[1,45],35:24},{18:[2,23]},{18:[2,26],28:[2,26],29:[2,26],30:[2,26],33:[2,26]},{18:[2,31],32:55,33:[1,56]},{18:[2,27],28:[2,27],29:[2,27],30:[2,27],33:[2,27]},{18:[2,28],28:[2,28],29:[2,28],30:[2,28],33:[2,28]},{18:[2,29],28:[2,29],29:[2,29],30:[2,29],33:[2,29]},{18:[2,30],28:[2,30],29:[2,30],30:[2,30],33:[2,30]},{18:[2,33],33:[2,33]},{18:[2,40],28:[2,40],29:[2,40],30:[2,40],33:[2,40],34:[1,57],36:[2,40]},{33:[1,58]},{14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16]},{5:[2,17],14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18]},{18:[1,59]},{18:[1,60]},{18:[2,21]},{18:[2,25],28:[2,25],29:[2,25],30:[2,25],33:[2,25]},{18:[2,32],33:[2,32]},{34:[1,57]},{21:61,28:[1,62],29:[1,63],30:[1,64],33:[1,25],35:24},{18:[2,39],28:[2,39],29:[2,39],30:[2,39],33:[2,39],36:[2,39]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15]},{18:[2,34],33:[2,34]},{18:[2,35],33:[2,35]},{18:[2,36],33:[2,36]},{18:[2,37],33:[2,37]}],
            defaultActions: {16:[2,1],37:[2,23],53:[2,21]},
            parseError: function parseError(str, hash) {
                throw new Error(str);
            },
            parse: function parse(input) {
                var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
                this.lexer.setInput(input);
                this.lexer.yy = this.yy;
                this.yy.lexer = this.lexer;
                if (typeof this.lexer.yylloc == "undefined")
                    this.lexer.yylloc = {};
                var yyloc = this.lexer.yylloc;
                lstack.push(yyloc);
                if (typeof this.yy.parseError === "function")
                    this.parseError = this.yy.parseError;
                function popStack(n) {
                    stack.length = stack.length - 2 * n;
                    vstack.length = vstack.length - n;
                    lstack.length = lstack.length - n;
                }
                function lex() {
                    var token;
                    token = self.lexer.lex() || 1;
                    if (typeof token !== "number") {
                        token = self.symbols_[token] || token;
                    }
                    return token;
                }
                var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
                while (true) {
                    state = stack[stack.length - 1];
                    if (this.defaultActions[state]) {
                        action = this.defaultActions[state];
                    } else {
                        if (symbol == null)
                            symbol = lex();
                        action = table[state] && table[state][symbol];
                    }
                    if (typeof action === "undefined" || !action.length || !action[0]) {
                        if (!recovering) {
                            expected = [];
                            for (p in table[state])
                                if (this.terminals_[p] && p > 2) {
                                    expected.push("'" + this.terminals_[p] + "'");
                                }
                            var errStr = "";
                            if (this.lexer.showPosition) {
                                errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + this.terminals_[symbol] + "'";
                            } else {
                                errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                            }
                            this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
                        }
                    }
                    if (action[0] instanceof Array && action.length > 1) {
                        throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                    }
                    switch (action[0]) {
                        case 1:
                            stack.push(symbol);
                            vstack.push(this.lexer.yytext);
                            lstack.push(this.lexer.yylloc);
                            stack.push(action[1]);
                            symbol = null;
                            if (!preErrorSymbol) {
                                yyleng = this.lexer.yyleng;
                                yytext = this.lexer.yytext;
                                yylineno = this.lexer.yylineno;
                                yyloc = this.lexer.yylloc;
                                if (recovering > 0)
                                    recovering--;
                            } else {
                                symbol = preErrorSymbol;
                                preErrorSymbol = null;
                            }
                            break;
                        case 2:
                            len = this.productions_[action[1]][1];
                            yyval.$ = vstack[vstack.length - len];
                            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
                            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                            if (typeof r !== "undefined") {
                                return r;
                            }
                            if (len) {
                                stack = stack.slice(0, -1 * len * 2);
                                vstack = vstack.slice(0, -1 * len);
                                lstack = lstack.slice(0, -1 * len);
                            }
                            stack.push(this.productions_[action[1]][0]);
                            vstack.push(yyval.$);
                            lstack.push(yyval._$);
                            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                            stack.push(newState);
                            break;
                        case 3:
                            return true;
                    }
                }
                return true;
            }
        };/* Jison generated lexer */
        var lexer = (function(){

            var lexer = ({EOF:1,
                parseError:function parseError(str, hash) {
                    if (this.yy.parseError) {
                        this.yy.parseError(str, hash);
                    } else {
                        throw new Error(str);
                    }
                },
                setInput:function (input) {
                    this._input = input;
                    this._more = this._less = this.done = false;
                    this.yylineno = this.yyleng = 0;
                    this.yytext = this.matched = this.match = '';
                    this.conditionStack = ['INITIAL'];
                    this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
                    return this;
                },
                input:function () {
                    var ch = this._input[0];
                    this.yytext+=ch;
                    this.yyleng++;
                    this.match+=ch;
                    this.matched+=ch;
                    var lines = ch.match(/\n/);
                    if (lines) this.yylineno++;
                    this._input = this._input.slice(1);
                    return ch;
                },
                unput:function (ch) {
                    this._input = ch + this._input;
                    return this;
                },
                more:function () {
                    this._more = true;
                    return this;
                },
                pastInput:function () {
                    var past = this.matched.substr(0, this.matched.length - this.match.length);
                    return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
                },
                upcomingInput:function () {
                    var next = this.match;
                    if (next.length < 20) {
                        next += this._input.substr(0, 20-next.length);
                    }
                    return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
                },
                showPosition:function () {
                    var pre = this.pastInput();
                    var c = new Array(pre.length + 1).join("-");
                    return pre + this.upcomingInput() + "\n" + c+"^";
                },
                next:function () {
                    if (this.done) {
                        return this.EOF;
                    }
                    if (!this._input) this.done = true;

                    var token,
                        match,
                        col,
                        lines;
                    if (!this._more) {
                        this.yytext = '';
                        this.match = '';
                    }
                    var rules = this._currentRules();
                    for (var i=0;i < rules.length; i++) {
                        match = this._input.match(this.rules[rules[i]]);
                        if (match) {
                            lines = match[0].match(/\n.*/g);
                            if (lines) this.yylineno += lines.length;
                            this.yylloc = {first_line: this.yylloc.last_line,
                                last_line: this.yylineno+1,
                                first_column: this.yylloc.last_column,
                                last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
                            this.yytext += match[0];
                            this.match += match[0];
                            this.matches = match;
                            this.yyleng = this.yytext.length;
                            this._more = false;
                            this._input = this._input.slice(match[0].length);
                            this.matched += match[0];
                            token = this.performAction.call(this, this.yy, this, rules[i],this.conditionStack[this.conditionStack.length-1]);
                            if (token) return token;
                            else return;
                        }
                    }
                    if (this._input === "") {
                        return this.EOF;
                    } else {
                        this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                            {text: "", token: null, line: this.yylineno});
                    }
                },
                lex:function lex() {
                    var r = this.next();
                    if (typeof r !== 'undefined') {
                        return r;
                    } else {
                        return this.lex();
                    }
                },
                begin:function begin(condition) {
                    this.conditionStack.push(condition);
                },
                popState:function popState() {
                    return this.conditionStack.pop();
                },
                _currentRules:function _currentRules() {
                    return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
                },
                topState:function () {
                    return this.conditionStack[this.conditionStack.length-2];
                },
                pushState:function begin(condition) {
                    this.begin(condition);
                }});
            lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

                var YYSTATE=YY_START
                switch($avoiding_name_collisions) {
                    case 0:
                        if(yy_.yytext.slice(-1) !== "\\") this.begin("mu");
                        if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1), this.begin("emu");
                        if(yy_.yytext) return 14;

                        break;
                    case 1: return 14;
                        break;
                    case 2: this.popState(); return 14;
                        break;
                    case 3: return 24;
                        break;
                    case 4: return 16;
                        break;
                    case 5: return 20;
                        break;
                    case 6: return 19;
                        break;
                    case 7: return 19;
                        break;
                    case 8: return 23;
                        break;
                    case 9: return 23;
                        break;
                    case 10: yy_.yytext = yy_.yytext.substr(3,yy_.yyleng-5); this.popState(); return 15;
                        break;
                    case 11: return 22;
                        break;
                    case 12: return 34;
                        break;
                    case 13: return 33;
                        break;
                    case 14: return 33;
                        break;
                    case 15: return 36;
                        break;
                    case 16: /*ignore whitespace*/
                        break;
                    case 17: this.popState(); return 18;
                        break;
                    case 18: this.popState(); return 18;
                        break;
                    case 19: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\"/g,'"'); return 28;
                        break;
                    case 20: return 30;
                        break;
                    case 21: return 30;
                        break;
                    case 22: return 29;
                        break;
                    case 23: return 33;
                        break;
                    case 24: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 33;
                        break;
                    case 25: return 'INVALID';
                        break;
                    case 26: return 5;
                        break;
                }
            };
            lexer.rules = [/^[^\x00]*?(?=(\{\{))/,/^[^\x00]+/,/^[^\x00]{2,}?(?=(\{\{))/,/^\{\{>/,/^\{\{#/,/^\{\{\//,/^\{\{\^/,/^\{\{\s*else\b/,/^\{\{\{/,/^\{\{&/,/^\{\{![\s\S]*?\}\}/,/^\{\{/,/^=/,/^\.(?=[} ])/,/^\.\./,/^[\/.]/,/^\s+/,/^\}\}\}/,/^\}\}/,/^"(\\["]|[^"])*"/,/^true(?=[}\s])/,/^false(?=[}\s])/,/^[0-9]+(?=[}\s])/,/^[a-zA-Z0-9_$-]+(?=[=}\s\/.])/,/^\[[^\]]*\]/,/^./,/^$/];
            lexer.conditions = {"mu":{"rules":[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"INITIAL":{"rules":[0,1,26],"inclusive":true}};return lexer;})()
        parser.lexer = lexer;
        return parser;
    })();

// lib/handlebars/compiler/base.js
    Handlebars.Parser = handlebars;

    Handlebars.parse = function(string) {
        Handlebars.Parser.yy = Handlebars.AST;
        return Handlebars.Parser.parse(string);
    };

    Handlebars.print = function(ast) {
        return new Handlebars.PrintVisitor().accept(ast);
    };

    Handlebars.logger = {
        DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

        // override in the host environment
        log: function(level, str) {}
    };

    Handlebars.log = function(level, str) { Handlebars.logger.log(level, str); };
    ;
// lib/handlebars/compiler/ast.js
    (function() {

        Handlebars.AST = {};

        Handlebars.AST.ProgramNode = function(statements, inverse) {
            this.type = "program";
            this.statements = statements;
            if(inverse) { this.inverse = new Handlebars.AST.ProgramNode(inverse); }
        };

        Handlebars.AST.MustacheNode = function(params, hash, unescaped) {
            this.type = "mustache";
            this.id = params[0];
            this.params = params.slice(1);
            this.hash = hash;
            this.escaped = !unescaped;
        };

        Handlebars.AST.PartialNode = function(id, context) {
            this.type    = "partial";

            // TODO: disallow complex IDs

            this.id      = id;
            this.context = context;
        };

        var verifyMatch = function(open, close) {
            if(open.original !== close.original) {
                throw new Handlebars.Exception(open.original + " doesn't match " + close.original);
            }
        };

        Handlebars.AST.BlockNode = function(mustache, program, close) {
            verifyMatch(mustache.id, close);
            this.type = "block";
            this.mustache = mustache;
            this.program  = program;
        };

        Handlebars.AST.InverseNode = function(mustache, program, close) {
            verifyMatch(mustache.id, close);
            this.type = "inverse";
            this.mustache = mustache;
            this.program  = program;
        };

        Handlebars.AST.ContentNode = function(string) {
            this.type = "content";
            this.string = string;
        };

        Handlebars.AST.HashNode = function(pairs) {
            this.type = "hash";
            this.pairs = pairs;
        };

        Handlebars.AST.IdNode = function(parts) {
            this.type = "ID";
            this.original = parts.join(".");

            var dig = [], depth = 0;

            for(var i=0,l=parts.length; i<l; i++) {
                var part = parts[i];

                if(part === "..") { depth++; }
                else if(part === "." || part === "this") { this.isScoped = true; }
                else { dig.push(part); }
            }

            this.parts    = dig;
            this.string   = dig.join('.');
            this.depth    = depth;
            this.isSimple = (dig.length === 1) && (depth === 0);
        };

        Handlebars.AST.StringNode = function(string) {
            this.type = "STRING";
            this.string = string;
        };

        Handlebars.AST.IntegerNode = function(integer) {
            this.type = "INTEGER";
            this.integer = integer;
        };

        Handlebars.AST.BooleanNode = function(bool) {
            this.type = "BOOLEAN";
            this.bool = bool;
        };

        Handlebars.AST.CommentNode = function(comment) {
            this.type = "comment";
            this.comment = comment;
        };

    })();;
// lib/handlebars/utils.js
    Handlebars.Exception = function(message) {
        var tmp = Error.prototype.constructor.apply(this, arguments);

        for (var p in tmp) {
            if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
        }

        this.message = tmp.message;
    };
    Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
    Handlebars.SafeString = function(string) {
        this.string = string;
    };
    Handlebars.SafeString.prototype.toString = function() {
        return this.string.toString();
    };

    (function() {
        var escape = {
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        };

        var badChars = /&(?!\w+;)|[<>"'`]/g;
        var possible = /[&<>"'`]/;

        var escapeChar = function(chr) {
            return escape[chr] || "&amp;";
        };

        Handlebars.Utils = {
            escapeExpression: function(string) {
                // don't escape SafeStrings, since they're already safe
                if (string instanceof Handlebars.SafeString) {
                    return string.toString();
                } else if (string == null || string === false) {
                    return "";
                }

                if(!possible.test(string)) { return string; }
                return string.replace(badChars, escapeChar);
            },

            isEmpty: function(value) {
                if (typeof value === "undefined") {
                    return true;
                } else if (value === null) {
                    return true;
                } else if (value === false) {
                    return true;
                } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
                    return true;
                } else {
                    return false;
                }
            }
        };
    })();;
// lib/handlebars/compiler/compiler.js
    Handlebars.Compiler = function() {};
    Handlebars.JavaScriptCompiler = function() {};

    (function(Compiler, JavaScriptCompiler) {
        Compiler.OPCODE_MAP = {
            appendContent: 1,
            getContext: 2,
            lookupWithHelpers: 3,
            lookup: 4,
            append: 5,
            invokeMustache: 6,
            appendEscaped: 7,
            pushString: 8,
            truthyOrFallback: 9,
            functionOrFallback: 10,
            invokeProgram: 11,
            invokePartial: 12,
            push: 13,
            assignToHash: 15,
            pushStringParam: 16
        };

        Compiler.MULTI_PARAM_OPCODES = {
            appendContent: 1,
            getContext: 1,
            lookupWithHelpers: 2,
            lookup: 1,
            invokeMustache: 3,
            pushString: 1,
            truthyOrFallback: 1,
            functionOrFallback: 1,
            invokeProgram: 3,
            invokePartial: 1,
            push: 1,
            assignToHash: 1,
            pushStringParam: 1
        };

        Compiler.DISASSEMBLE_MAP = {};

        for(var prop in Compiler.OPCODE_MAP) {
            var value = Compiler.OPCODE_MAP[prop];
            Compiler.DISASSEMBLE_MAP[value] = prop;
        }

        Compiler.multiParamSize = function(code) {
            return Compiler.MULTI_PARAM_OPCODES[Compiler.DISASSEMBLE_MAP[code]];
        };

        Compiler.prototype = {
            compiler: Compiler,

            disassemble: function() {
                var opcodes = this.opcodes, opcode, nextCode;
                var out = [], str, name, value;

                for(var i=0, l=opcodes.length; i<l; i++) {
                    opcode = opcodes[i];

                    if(opcode === 'DECLARE') {
                        name = opcodes[++i];
                        value = opcodes[++i];
                        out.push("DECLARE " + name + " = " + value);
                    } else {
                        str = Compiler.DISASSEMBLE_MAP[opcode];

                        var extraParams = Compiler.multiParamSize(opcode);
                        var codes = [];

                        for(var j=0; j<extraParams; j++) {
                            nextCode = opcodes[++i];

                            if(typeof nextCode === "string") {
                                nextCode = "\"" + nextCode.replace("\n", "\\n") + "\"";
                            }

                            codes.push(nextCode);
                        }

                        str = str + " " + codes.join(" ");

                        out.push(str);
                    }
                }

                return out.join("\n");
            },

            guid: 0,

            compile: function(program, options) {
                this.children = [];
                this.depths = {list: []};
                this.options = options;

                // These changes will propagate to the other compiler components
                var knownHelpers = this.options.knownHelpers;
                this.options.knownHelpers = {
                    'helperMissing': true,
                    'blockHelperMissing': true,
                    'each': true,
                    'if': true,
                    'unless': true,
                    'with': true,
                    'log': true
                };
                if (knownHelpers) {
                    for (var name in knownHelpers) {
                        this.options.knownHelpers[name] = knownHelpers[name];
                    }
                }

                return this.program(program);
            },

            accept: function(node) {
                return this[node.type](node);
            },

            program: function(program) {
                var statements = program.statements, statement;
                this.opcodes = [];

                for(var i=0, l=statements.length; i<l; i++) {
                    statement = statements[i];
                    this[statement.type](statement);
                }
                this.isSimple = l === 1;

                this.depths.list = this.depths.list.sort(function(a, b) {
                    return a - b;
                });

                return this;
            },

            compileProgram: function(program) {
                var result = new this.compiler().compile(program, this.options);
                var guid = this.guid++;

                this.usePartial = this.usePartial || result.usePartial;

                this.children[guid] = result;

                for(var i=0, l=result.depths.list.length; i<l; i++) {
                    depth = result.depths.list[i];

                    if(depth < 2) { continue; }
                    else { this.addDepth(depth - 1); }
                }

                return guid;
            },

            block: function(block) {
                var mustache = block.mustache;
                var depth, child, inverse, inverseGuid;

                var params = this.setupStackForMustache(mustache);

                var programGuid = this.compileProgram(block.program);

                if(block.program.inverse) {
                    inverseGuid = this.compileProgram(block.program.inverse);
                    this.declare('inverse', inverseGuid);
                }

                this.opcode('invokeProgram', programGuid, params.length, !!mustache.hash);
                this.declare('inverse', null);
                this.opcode('append');
            },

            inverse: function(block) {
                var params = this.setupStackForMustache(block.mustache);

                var programGuid = this.compileProgram(block.program);

                this.declare('inverse', programGuid);

                this.opcode('invokeProgram', null, params.length, !!block.mustache.hash);
                this.declare('inverse', null);
                this.opcode('append');
            },

            hash: function(hash) {
                var pairs = hash.pairs, pair, val;

                this.opcode('push', '{}');

                for(var i=0, l=pairs.length; i<l; i++) {
                    pair = pairs[i];
                    val  = pair[1];

                    this.accept(val);
                    this.opcode('assignToHash', pair[0]);
                }
            },

            partial: function(partial) {
                var id = partial.id;
                this.usePartial = true;

                if(partial.context) {
                    this.ID(partial.context);
                } else {
                    this.opcode('push', 'depth0');
                }

                this.opcode('invokePartial', id.original);
                this.opcode('append');
            },

            content: function(content) {
                this.opcode('appendContent', content.string);
            },

            mustache: function(mustache) {
                var params = this.setupStackForMustache(mustache);

                this.opcode('invokeMustache', params.length, mustache.id.original, !!mustache.hash);

                if(mustache.escaped && !this.options.noEscape) {
                    this.opcode('appendEscaped');
                } else {
                    this.opcode('append');
                }
            },

            ID: function(id) {
                this.addDepth(id.depth);

                this.opcode('getContext', id.depth);

                this.opcode('lookupWithHelpers', id.parts[0] || null, id.isScoped || false);

                for(var i=1, l=id.parts.length; i<l; i++) {
                    this.opcode('lookup', id.parts[i]);
                }
            },

            STRING: function(string) {
                this.opcode('pushString', string.string);
            },

            INTEGER: function(integer) {
                this.opcode('push', integer.integer);
            },

            BOOLEAN: function(bool) {
                this.opcode('push', bool.bool);
            },

            comment: function() {},

            // HELPERS
            pushParams: function(params) {
                var i = params.length, param;

                while(i--) {
                    param = params[i];

                    if(this.options.stringParams) {
                        if(param.depth) {
                            this.addDepth(param.depth);
                        }

                        this.opcode('getContext', param.depth || 0);
                        this.opcode('pushStringParam', param.string);
                    } else {
                        this[param.type](param);
                    }
                }
            },

            opcode: function(name, val1, val2, val3) {
                this.opcodes.push(Compiler.OPCODE_MAP[name]);
                if(val1 !== undefined) { this.opcodes.push(val1); }
                if(val2 !== undefined) { this.opcodes.push(val2); }
                if(val3 !== undefined) { this.opcodes.push(val3); }
            },

            declare: function(name, value) {
                this.opcodes.push('DECLARE');
                this.opcodes.push(name);
                this.opcodes.push(value);
            },

            addDepth: function(depth) {
                if(depth === 0) { return; }

                if(!this.depths[depth]) {
                    this.depths[depth] = true;
                    this.depths.list.push(depth);
                }
            },

            setupStackForMustache: function(mustache) {
                var params = mustache.params;

                this.pushParams(params);

                if(mustache.hash) {
                    this.hash(mustache.hash);
                }

                this.ID(mustache.id);

                return params;
            }
        };

        JavaScriptCompiler.prototype = {
            // PUBLIC API: You can override these methods in a subclass to provide
            // alternative compiled forms for name lookup and buffering semantics
            nameLookup: function(parent, name, type) {
                if (/^[0-9]+$/.test(name)) {
                    return parent + "[" + name + "]";
                } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
                    return parent + "." + name;
                }
                else {
                    return parent + "['" + name + "']";
                }
            },

            appendToBuffer: function(string) {
                if (this.environment.isSimple) {
                    return "return " + string + ";";
                } else {
                    return "buffer += " + string + ";";
                }
            },

            initializeBuffer: function() {
                return this.quotedString("");
            },

            namespace: "Handlebars",
            // END PUBLIC API

            compile: function(environment, options, context, asObject) {
                this.environment = environment;
                this.options = options || {};

                this.name = this.environment.name;
                this.isChild = !!context;
                this.context = context || {
                    programs: [],
                    aliases: { self: 'this' },
                    registers: {list: []}
                };

                this.preamble();

                this.stackSlot = 0;
                this.stackVars = [];

                this.compileChildren(environment, options);

                var opcodes = environment.opcodes, opcode;

                this.i = 0;

                for(l=opcodes.length; this.i<l; this.i++) {
                    opcode = this.nextOpcode(0);

                    if(opcode[0] === 'DECLARE') {
                        this.i = this.i + 2;
                        this[opcode[1]] = opcode[2];
                    } else {
                        this.i = this.i + opcode[1].length;
                        this[opcode[0]].apply(this, opcode[1]);
                    }
                }

                return this.createFunctionContext(asObject);
            },

            nextOpcode: function(n) {
                var opcodes = this.environment.opcodes, opcode = opcodes[this.i + n], name, val;
                var extraParams, codes;

                if(opcode === 'DECLARE') {
                    name = opcodes[this.i + 1];
                    val  = opcodes[this.i + 2];
                    return ['DECLARE', name, val];
                } else {
                    name = Compiler.DISASSEMBLE_MAP[opcode];

                    extraParams = Compiler.multiParamSize(opcode);
                    codes = [];

                    for(var j=0; j<extraParams; j++) {
                        codes.push(opcodes[this.i + j + 1 + n]);
                    }

                    return [name, codes];
                }
            },

            eat: function(opcode) {
                this.i = this.i + opcode.length;
            },

            preamble: function() {
                var out = [];

                // this register will disambiguate helper lookup from finding a function in
                // a context. This is necessary for mustache compatibility, which requires
                // that context functions in blocks are evaluated by blockHelperMissing, and
                // then proceed as if the resulting value was provided to blockHelperMissing.
                this.useRegister('foundHelper');

                if (!this.isChild) {
                    var namespace = this.namespace;
                    var copies = "helpers = helpers || " + namespace + ".helpers;";
                    if(this.environment.usePartial) { copies = copies + " partials = partials || " + namespace + ".partials;"; }
                    out.push(copies);
                } else {
                    out.push('');
                }

                if (!this.environment.isSimple) {
                    out.push(", buffer = " + this.initializeBuffer());
                } else {
                    out.push("");
                }

                // track the last context pushed into place to allow skipping the
                // getContext opcode when it would be a noop
                this.lastContext = 0;
                this.source = out;
            },

            createFunctionContext: function(asObject) {
                var locals = this.stackVars;
                if (!this.isChild) {
                    locals = locals.concat(this.context.registers.list);
                }

                if(locals.length > 0) {
                    this.source[1] = this.source[1] + ", " + locals.join(", ");
                }

                // Generate minimizer alias mappings
                if (!this.isChild) {
                    var aliases = []
                    for (var alias in this.context.aliases) {
                        this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
                    }
                }

                if (this.source[1]) {
                    this.source[1] = "var " + this.source[1].substring(2) + ";";
                }

                // Merge children
                if (!this.isChild) {
                    this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
                }

                if (!this.environment.isSimple) {
                    this.source.push("return buffer;");
                }

                var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

                for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
                    params.push("depth" + this.environment.depths.list[i]);
                }

                if (asObject) {
                    params.push(this.source.join("\n  "));

                    return Function.apply(this, params);
                } else {
                    var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + this.source.join("\n  ") + '}';
                    Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
                    return functionSource;
                }
            },

            appendContent: function(content) {
                this.source.push(this.appendToBuffer(this.quotedString(content)));
            },

            append: function() {
                var local = this.popStack();
                this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
                if (this.environment.isSimple) {
                    this.source.push("else { " + this.appendToBuffer("''") + " }");
                }
            },

            appendEscaped: function() {
                var opcode = this.nextOpcode(1), extra = "";
                this.context.aliases.escapeExpression = 'this.escapeExpression';

                if(opcode[0] === 'appendContent') {
                    extra = " + " + this.quotedString(opcode[1][0]);
                    this.eat(opcode);
                }

                this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")" + extra));
            },

            getContext: function(depth) {
                if(this.lastContext !== depth) {
                    this.lastContext = depth;
                }
            },

            lookupWithHelpers: function(name, isScoped) {
                if(name) {
                    var topStack = this.nextStack();

                    this.usingKnownHelper = false;

                    var toPush;
                    if (!isScoped && this.options.knownHelpers[name]) {
                        toPush = topStack + " = " + this.nameLookup('helpers', name, 'helper');
                        this.usingKnownHelper = true;
                    } else if (isScoped || this.options.knownHelpersOnly) {
                        toPush = topStack + " = " + this.nameLookup('depth' + this.lastContext, name, 'context');
                    } else {
                        this.register('foundHelper', this.nameLookup('helpers', name, 'helper'));
                        toPush = topStack + " = foundHelper || " + this.nameLookup('depth' + this.lastContext, name, 'context');
                    }

                    toPush += ';';
                    this.source.push(toPush);
                } else {
                    this.pushStack('depth' + this.lastContext);
                }
            },

            lookup: function(name) {
                var topStack = this.topStack();
                this.source.push(topStack + " = (" + topStack + " === null || " + topStack + " === undefined || " + topStack + " === false ? " +
                    topStack + " : " + this.nameLookup(topStack, name, 'context') + ");");
            },

            pushStringParam: function(string) {
                this.pushStack('depth' + this.lastContext);
                this.pushString(string);
            },

            pushString: function(string) {
                this.pushStack(this.quotedString(string));
            },

            push: function(name) {
                this.pushStack(name);
            },

            invokeMustache: function(paramSize, original, hasHash) {
                this.populateParams(paramSize, this.quotedString(original), "{}", null, hasHash, function(nextStack, helperMissingString, id) {
                    if (!this.usingKnownHelper) {
                        this.context.aliases.helperMissing = 'helpers.helperMissing';
                        this.context.aliases.undef = 'void 0';
                        this.source.push("else if(" + id + "=== undef) { " + nextStack + " = helperMissing.call(" + helperMissingString + "); }");
                        if (nextStack !== id) {
                            this.source.push("else { " + nextStack + " = " + id + "; }");
                        }
                    }
                });
            },

            invokeProgram: function(guid, paramSize, hasHash) {
                var inverse = this.programExpression(this.inverse);
                var mainProgram = this.programExpression(guid);

                this.populateParams(paramSize, null, mainProgram, inverse, hasHash, function(nextStack, helperMissingString, id) {
                    if (!this.usingKnownHelper) {
                        this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';
                        this.source.push("else { " + nextStack + " = blockHelperMissing.call(" + helperMissingString + "); }");
                    }
                });
            },

            populateParams: function(paramSize, helperId, program, inverse, hasHash, fn) {
                var needsRegister = hasHash || this.options.stringParams || inverse || this.options.data;
                var id = this.popStack(), nextStack;
                var params = [], param, stringParam, stringOptions;

                if (needsRegister) {
                    this.register('tmp1', program);
                    stringOptions = 'tmp1';
                } else {
                    stringOptions = '{ hash: {} }';
                }

                if (needsRegister) {
                    var hash = (hasHash ? this.popStack() : '{}');
                    this.source.push('tmp1.hash = ' + hash + ';');
                }

                if(this.options.stringParams) {
                    this.source.push('tmp1.contexts = [];');
                }

                for(var i=0; i<paramSize; i++) {
                    param = this.popStack();
                    params.push(param);

                    if(this.options.stringParams) {
                        this.source.push('tmp1.contexts.push(' + this.popStack() + ');');
                    }
                }

                if(inverse) {
                    this.source.push('tmp1.fn = tmp1;');
                    this.source.push('tmp1.inverse = ' + inverse + ';');
                }

                if(this.options.data) {
                    this.source.push('tmp1.data = data;');
                }

                params.push(stringOptions);

                this.populateCall(params, id, helperId || id, fn, program !== '{}');
            },

            populateCall: function(params, id, helperId, fn, program) {
                var paramString = ["depth0"].concat(params).join(", ");
                var helperMissingString = ["depth0"].concat(helperId).concat(params).join(", ");

                var nextStack = this.nextStack();

                if (this.usingKnownHelper) {
                    this.source.push(nextStack + " = " + id + ".call(" + paramString + ");");
                } else {
                    this.context.aliases.functionType = '"function"';
                    var condition = program ? "foundHelper && " : ""
                    this.source.push("if(" + condition + "typeof " + id + " === functionType) { " + nextStack + " = " + id + ".call(" + paramString + "); }");
                }
                fn.call(this, nextStack, helperMissingString, id);
                this.usingKnownHelper = false;
            },

            invokePartial: function(context) {
                params = [this.nameLookup('partials', context, 'partial'), "'" + context + "'", this.popStack(), "helpers", "partials"];

                if (this.options.data) {
                    params.push("data");
                }

                this.pushStack("self.invokePartial(" + params.join(", ") + ");");
            },

            assignToHash: function(key) {
                var value = this.popStack();
                var hash = this.topStack();

                this.source.push(hash + "['" + key + "'] = " + value + ";");
            },

            // HELPERS

            compiler: JavaScriptCompiler,

            compileChildren: function(environment, options) {
                var children = environment.children, child, compiler;

                for(var i=0, l=children.length; i<l; i++) {
                    child = children[i];
                    compiler = new this.compiler();

                    this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
                    var index = this.context.programs.length;
                    child.index = index;
                    child.name = 'program' + index;
                    this.context.programs[index] = compiler.compile(child, options, this.context);
                }
            },

            programExpression: function(guid) {
                if(guid == null) { return "self.noop"; }

                var child = this.environment.children[guid],
                    depths = child.depths.list;
                var programParams = [child.index, child.name, "data"];

                for(var i=0, l = depths.length; i<l; i++) {
                    depth = depths[i];

                    if(depth === 1) { programParams.push("depth0"); }
                    else { programParams.push("depth" + (depth - 1)); }
                }

                if(depths.length === 0) {
                    return "self.program(" + programParams.join(", ") + ")";
                } else {
                    programParams.shift();
                    return "self.programWithDepth(" + programParams.join(", ") + ")";
                }
            },

            register: function(name, val) {
                this.useRegister(name);
                this.source.push(name + " = " + val + ";");
            },

            useRegister: function(name) {
                if(!this.context.registers[name]) {
                    this.context.registers[name] = true;
                    this.context.registers.list.push(name);
                }
            },

            pushStack: function(item) {
                this.source.push(this.nextStack() + " = " + item + ";");
                return "stack" + this.stackSlot;
            },

            nextStack: function() {
                this.stackSlot++;
                if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
                return "stack" + this.stackSlot;
            },

            popStack: function() {
                return "stack" + this.stackSlot--;
            },

            topStack: function() {
                return "stack" + this.stackSlot;
            },

            quotedString: function(str) {
                return '"' + str
                    .replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r') + '"';
            }
        };

        var reservedWords = (
            "break else new var" +
                " case finally return void" +
                " catch for switch while" +
                " continue function this with" +
                " default if throw" +
                " delete in try" +
                " do instanceof typeof" +
                " abstract enum int short" +
                " boolean export interface static" +
                " byte extends long super" +
                " char final native synchronized" +
                " class float package throws" +
                " const goto private transient" +
                " debugger implements protected volatile" +
                " double import public let yield"
            ).split(" ");

        var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

        for(var i=0, l=reservedWords.length; i<l; i++) {
            compilerWords[reservedWords[i]] = true;
        }

        JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
            if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
                return true;
            }
            return false;
        }

    })(Handlebars.Compiler, Handlebars.JavaScriptCompiler);
    Handlebars.precompile = function(string, options) {
        options = options || {};

        var ast = Handlebars.parse(string);
        var environment = new Handlebars.Compiler().compile(ast, options);
        return new Handlebars.JavaScriptCompiler().compile(environment, options);
    };

    Handlebars.compile = function(string, options) {
        options = options || {};

        var compiled;
        function compile() {
            var ast = Handlebars.parse(string);
            var environment = new Handlebars.Compiler().compile(ast, options);
            var templateSpec = new Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);
            return Handlebars.template(templateSpec);
        }

        // Template is only compiled on first use and cached after that point.
        return function(context, options) {
            if (!compiled) {
                compiled = compile();
            }
            return compiled.call(this, context, options);
        };
    };
    ;
// lib/handlebars/runtime.js
    Handlebars.VM = {
        template: function(templateSpec) {
            // Just add water
            var container = {
                escapeExpression: Handlebars.Utils.escapeExpression,
                invokePartial: Handlebars.VM.invokePartial,
                programs: [],
                program: function(i, fn, data) {
                    var programWrapper = this.programs[i];
                    if(data) {
                        return Handlebars.VM.program(fn, data);
                    } else if(programWrapper) {
                        return programWrapper;
                    } else {
                        programWrapper = this.programs[i] = Handlebars.VM.program(fn);
                        return programWrapper;
                    }
                },
                programWithDepth: Handlebars.VM.programWithDepth,
                noop: Handlebars.VM.noop
            };

            return function(context, options) {
                options = options || {};
                return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
            };
        },

        programWithDepth: function(fn, data, $depth) {
            var args = Array.prototype.slice.call(arguments, 2);

            return function(context, options) {
                options = options || {};

                return fn.apply(this, [context, options.data || data].concat(args));
            };
        },
        program: function(fn, data) {
            return function(context, options) {
                options = options || {};

                return fn(context, options.data || data);
            };
        },
        noop: function() { return ""; },
        invokePartial: function(partial, name, context, helpers, partials, data) {
            options = { helpers: helpers, partials: partials, data: data };

            if(partial === undefined) {
                throw new Handlebars.Exception("The partial " + name + " could not be found");
            } else if(partial instanceof Function) {
                return partial(context, options);
            } else if (!Handlebars.compile) {
                throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
            } else {
                partials[name] = Handlebars.compile(partial);
                return partials[name](context, options);
            }
        }
    };

    Handlebars.template = Handlebars.VM.template;
    ;

// AMD Define
    define('handlebars',[],function(){
        return Handlebars;
    });

})();
define('vent/controller.vent',['marionette'], function (Marionette) {
    return new Marionette.EventAggregator();
});

define('model/home.model',['backbone'], function(Backbone) {
   return Backbone.Model.extend({
       defaults: {
           title: 'Hello World!'
       }
   });
});

/**
 * @license RequireJS text 1.0.8 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint regexp: true, plusplus: true, sloppy: true */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
 define: false, window: false, process: false, Packages: false,
 java: false, location: false */

(function () {
    var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = [];

    define('text',[],function () {
        var text, fs;

        text = {
            version: '1.0.8',

            strip: function (content) {
                //Strips <?xml ...?> declarations so that external SVG and XML
                //documents can be added to a document without worry. Also, if the string
                //is an HTML document, only the part inside the body tag is returned.
                if (content) {
                    content = content.replace(xmlRegExp, "");
                    var matches = content.match(bodyRegExp);
                    if (matches) {
                        content = matches[1];
                    }
                } else {
                    content = "";
                }
                return content;
            },

            jsEscape: function (content) {
                return content.replace(/(['\\])/g, '\\$1')
                    .replace(/[\f]/g, "\\f")
                    .replace(/[\b]/g, "\\b")
                    .replace(/[\n]/g, "\\n")
                    .replace(/[\t]/g, "\\t")
                    .replace(/[\r]/g, "\\r");
            },

            createXhr: function () {
                //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
                var xhr, i, progId;
                if (typeof XMLHttpRequest !== "undefined") {
                    return new XMLHttpRequest();
                } else if (typeof ActiveXObject !== "undefined") {
                    for (i = 0; i < 3; i++) {
                        progId = progIds[i];
                        try {
                            xhr = new ActiveXObject(progId);
                        } catch (e) {}

                        if (xhr) {
                            progIds = [progId];  // so faster next time
                            break;
                        }
                    }
                }

                return xhr;
            },

            /**
             * Parses a resource name into its component parts. Resource names
             * look like: module/name.ext!strip, where the !strip part is
             * optional.
             * @param {String} name the resource name
             * @returns {Object} with properties "moduleName", "ext" and "strip"
             * where strip is a boolean.
             */
            parseName: function (name) {
                var strip = false, index = name.indexOf("."),
                    modName = name.substring(0, index),
                    ext = name.substring(index + 1, name.length);

                index = ext.indexOf("!");
                if (index !== -1) {
                    //Pull off the strip arg.
                    strip = ext.substring(index + 1, ext.length);
                    strip = strip === "strip";
                    ext = ext.substring(0, index);
                }

                return {
                    moduleName: modName,
                    ext: ext,
                    strip: strip
                };
            },

            xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

            /**
             * Is an URL on another domain. Only works for browser use, returns
             * false in non-browser environments. Only used to know if an
             * optimized .js version of a text resource should be loaded
             * instead.
             * @param {String} url
             * @returns Boolean
             */
            useXhr: function (url, protocol, hostname, port) {
                var match = text.xdRegExp.exec(url),
                    uProtocol, uHostName, uPort;
                if (!match) {
                    return true;
                }
                uProtocol = match[2];
                uHostName = match[3];

                uHostName = uHostName.split(':');
                uPort = uHostName[1];
                uHostName = uHostName[0];

                return (!uProtocol || uProtocol === protocol) &&
                    (!uHostName || uHostName === hostname) &&
                    ((!uPort && !uHostName) || uPort === port);
            },

            finishLoad: function (name, strip, content, onLoad, config) {
                content = strip ? text.strip(content) : content;
                if (config.isBuild) {
                    buildMap[name] = content;
                }
                onLoad(content);
            },

            load: function (name, req, onLoad, config) {
                //Name has format: some.module.filext!strip
                //The strip part is optional.
                //if strip is present, then that means only get the string contents
                //inside a body tag in an HTML string. For XML/SVG content it means
                //removing the <?xml ...?> declarations so the content can be inserted
                //into the current doc without problems.

                // Do not bother with the work if a build and text will
                // not be inlined.
                if (config.isBuild && !config.inlineText) {
                    onLoad();
                    return;
                }

                var parsed = text.parseName(name),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                    url = req.toUrl(nonStripName),
                    useXhr = (config && config.text && config.text.useXhr) ||
                        text.useXhr;

                //Load the text. Use XHR if possible and in a browser.
                if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                    text.get(url, function (content) {
                        text.finishLoad(name, parsed.strip, content, onLoad, config);
                    });
                } else {
                    //Need to fetch the resource across domains. Assume
                    //the resource has been optimized into a JS module. Fetch
                    //by the module name + extension, but do not include the
                    //!strip part to avoid file system issues.
                    req([nonStripName], function (content) {
                        text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                            parsed.strip, content, onLoad, config);
                    });
                }
            },

            write: function (pluginName, moduleName, write, config) {
                if (buildMap.hasOwnProperty(moduleName)) {
                    var content = text.jsEscape(buildMap[moduleName]);
                    write.asModule(pluginName + "!" + moduleName,
                        "define(function () { return '" +
                            content +
                            "';});\n");
                }
            },

            writeFile: function (pluginName, moduleName, req, write, config) {
                var parsed = text.parseName(moduleName),
                    nonStripName = parsed.moduleName + '.' + parsed.ext,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                    fileName = req.toUrl(parsed.moduleName + '.' +
                        parsed.ext) + '.js';

                //Leverage own load() method to load plugin value, but only
                //write out values that do not have the strip argument,
                //to avoid any potential issues with ! in file names.
                text.load(nonStripName, req, function (value) {
                    //Use own write() method to construct full module value.
                    //But need to create shell that translates writeFile's
                    //write() to the right interface.
                    var textWrite = function (contents) {
                        return write(fileName, contents);
                    };
                    textWrite.asModule = function (moduleName, contents) {
                        return write.asModule(moduleName, fileName, contents);
                    };

                    text.write(pluginName, nonStripName, textWrite, config);
                }, config);
            }
        };

        if (text.createXhr()) {
            text.get = function (url, callback) {
                var xhr = text.createXhr();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function (evt) {
                    //Do not explicitly handle errors, those should be
                    //visible via console output in the browser.
                    if (xhr.readyState === 4) {
                        callback(xhr.responseText);
                    }
                };
                xhr.send(null);
            };
        } else if (typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node) {
            //Using special require.nodeRequire, something added by r.js.
            fs = require.nodeRequire('fs');

            text.get = function (url, callback) {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            };
        } else if (typeof Packages !== 'undefined') {
            //Why Java, why is this so awkward?
            text.get = function (url, callback) {
                var encoding = "utf-8",
                    file = new java.io.File(url),
                    lineSeparator = java.lang.System.getProperty("line.separator"),
                    input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                    stringBuffer, line,
                    content = '';
                try {
                    stringBuffer = new java.lang.StringBuffer();
                    line = input.readLine();

                    // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                    // http://www.unicode.org/faq/utf_bom.html

                    // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                    // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                    if (line && line.length() && line.charAt(0) === 0xfeff) {
                        // Eat the BOM, since we've already found the encoding on this file,
                        // and we plan to concatenating this buffer with others; the BOM should
                        // only appear at the top of a file.
                        line = line.substring(1);
                    }

                    stringBuffer.append(line);

                    while ((line = input.readLine()) !== null) {
                        stringBuffer.append(lineSeparator);
                        stringBuffer.append(line);
                    }
                    //Make sure we return a JavaScript string and not a Java string.
                    content = String(stringBuffer.toString()); //String
                } finally {
                    input.close();
                }
                callback(content);
            };
        }

        return text;
    });
}());
define('text!tmpl/home.handlebars',[],function () { return '<h1>{{title}}</h1>';});

define('view/home.view',['marionette', 'text!tmpl/home.handlebars'], function(Marionette, homeTmpl) {
    return Marionette.ItemView.extend({
        template: {
            type: 'handlebars',
            template: homeTmpl
        },
        triggers: {
            'click h1': 'h1:click'
        }
    });
});

define('controller/home.controller',['vent/controller.vent', 'model/home.model', 'view/home.view'], function (controllerVent, HomeModel, HomeView) {
    return {
        index:function () {
            var homeView = new HomeView({ model: new HomeModel() });
            console.dir(homeView);
            homeView.on("h1:click", function () {
                alert("Hello!");
            });
            controllerVent.trigger('view', homeView);
        },
        notfound:function () {
            alert('not found triggered.');
        }
    };
});
define('controller/home.router',['marionette', 'controller/home.controller'], function(Marionette, homeController) {
    return Marionette.AppRouter.extend({
        controller: homeController,
        appRoutes: {
            '': 'index',
            '*actions': 'notfound'
        }
    });
});

define('app',[
    'backbone',
    'marionette',
    'handlebars',
    'vent/controller.vent',
    'controller/home.router'
], function(Backbone, Marionette, Handlebars, controllerVent, HomeRouter) {
    var app = new Marionette.Application();

    app.addRegions({
        mainRegion: '#main'
    });

    app.addInitializer(function() {
        controllerVent.bind('view', function(view) {
            app.mainRegion.show(view);
        });
    });

    // Instantiate all routers.
    app.addInitializer(function() {
        app.Routers = new Array();
        app.Routers.push(new HomeRouter());
        Backbone.history.start();
    });

    // Change templating to Handlebars.
    app.bind("initialize:before", function(options) {
        Marionette.TemplateCache.loadTemplate = function(template, callback) {
            var compiledTemplate = Handlebars.compile(template.template);
            callback.call(this, compiledTemplate);
        };

        Marionette.Renderer.renderTemplate = function (template, data) {
            return template(data);
        };
    });

    return app;
});
// require.js entry point.

require.config({
	paths: {
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
        backbone: 'lib/backbone',
        underscore: 'lib/underscore',
        handlebars: 'lib/handlebars',
        marionette: 'lib/backbone.marionette',
        text: 'lib/text'
    }
});

require(['jquery', 'app'], function($, application) {
    $(application.start());
});
define("main", function(){});
