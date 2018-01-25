(function () {
	var opts = {
		"version": "v2",
		"apiEndpoint": "https://hka-tech.freshdesk.com/api"
	};
	var deferred,
	isFunction,
	isReady,
	ready,
	waitUntil,
	wrapper,
	slice = [].slice;
	
	wrapper = function (window, jQuery, opts) {  //a=window, e= jQuery, b=opts
		let readStorage, writeStorage;
		let { key, token, apiEndpoint, version } = opts;

		var baseURL = apiEndpoint + "/" + version + "/";
		//r = window.location;
		var Freshdesk = {
			version: function () { return version },
			
			key: function () { return key },
			setKey: function (newKey) {
				key = newKey
			},
      
      apiEndpoint: function () { return apiEndpoint },
      setEndpoint: function (newEndpoint) {
        apiEndpoint = newEndpoint;
      },
      
      status: function(id) {
        var statuses = {
          2: 'Open',
          3: 'Pending',
          4: 'Resolved',
          5: 'Closed',
          6: 'Testing',
          10: 'On Hold',
          11: 'Waiting For Response',
          12: 'Responded',
          12: 'Awaiting Client Review'
        }
        return statuses[id];
      },
			
			rest: function (method, ...args) {
				const [path, params, localCache, success, error] = Array.from(parseRestArgs(args));
				
				var opts = {
					url: "" + baseURL + path,
					type: method,
					data: {},
					//dataType: "json",
          headers: {
            "Authorization": "Basic " + btoa(key + ":X")
          },
          //cache: true,
					localCache: localCache,
          cacheTTL:1,
          isCacheValid: function () {  // optional.
              return true;
          },
          success: success,
					error: error
				};
        
        if (method === 'POST') {
          opts["processData"] = false;
          opts["contentType"] = false; 
        }
				//jQuery.support.cors ||
				//(opts.dataType = "jsonp", "GET" !== method && (opts.type = "GET", jQuery.extend(opts.data, {
				//			_method: method
				//		})));
				//key && (opts.data.key = key);
				if( null != params ) opts.data = params; // && jQuery.extend(opts.data, params);
        //console.dir(opts);
				return jQuery.ajax(opts)
			}
		};
    //https://github.com/SaneMethod/jquery-ajax-localstorage-cache
    var genCacheKey = function(options) {
        var url;

        // If cacheKey is specified, and a function, return the result of calling that function
        // as the cacheKey. Otherwise, just return the specified cacheKey as-is.
        if (options.cacheKey){
            return (typeof options.cacheKey === 'function') ?
                options.cacheKey(options) : options.cacheKey;
        }

        url = options.url.replace(/jQuery.*/, '');

        // Strip _={timestamp}, if cache is set to false
        if (options.cache === false) {
            url = url.replace(/([?&])_=[^&]*/, '');
        }

        return url + options.type + (options.data || '');
    };
    var getStorage = function(storage){
        if (!storage) return false;
        if (storage === true) return window.localStorage;
        if (typeof storage === "object" && 'getItem' in storage &&
            'removeItem' in storage && 'setItem' in storage)
        {
            return storage;
        }
        throw new TypeError("localCache must either be a boolean value, " +
            "or an object which implements the Storage interface.");
    };
    var removeFromStorage = function(storage, cacheKey){
        storage.removeItem(cacheKey);
        storage.removeItem(cacheKey + 'cachettl');
        storage.removeItem(cacheKey + 'dataType');
    };
    jQuery.ajaxPrefilter(function (options, originalOptions, jqXHR) {  //localCache : true to cache, cacheTTL: 1 in hours (time to live), cachedKey: 'post' options, isCacheValid: function (return true for valie cache

      var storage = getStorage(options.localCache),
            hourstl = options.cacheTTL || 5,
            cacheKey = options.cacheKey = genCacheKey(options),
            cacheValid = options.isCacheValid,
            responseValid = options.isResponseValid,
            thenResponse = options.thenResponse || null,
            ttl,
            value;

        if (!storage) return;
        ttl = storage.getItem(cacheKey + 'cachettl');

        if (cacheValid && typeof cacheValid === 'function' && !cacheValid()){
            removeFromStorage(storage, cacheKey);
            ttl = 0;
        }

        if (ttl && ttl < +new Date()){
            removeFromStorage(storage, cacheKey);
            ttl = 0;
        }

        value = storage.getItem(cacheKey);
        if (!value){
            // If value not in the cache, add a then block to request to store the results on success.
            jqXHR.then(thenResponse).then(function(data, status, jqXHR){
                var strdata = data,
                    dataType = options.dataType || jqXHR.getResponseHeader('Content-Type') || 'text/plain';

                if (!(responseValid && typeof responseValid === 'function' && !responseValid(data, status, jqXHR))) {

                    if (dataType.toLowerCase().indexOf('json') !== -1) strdata = JSON.stringify(data);

                    // Save the data to storage catching exceptions (possibly QUOTA_EXCEEDED_ERR)
                    try {
                        storage.setItem(cacheKey, strdata);
                        // Store timestamp and dataType
                        storage.setItem(cacheKey + 'cachettl', +new Date() + 1000 * 60 * 60 * hourstl);
                        storage.setItem(cacheKey + 'dataType', dataType);
                    } catch (e) {
                        // Remove any incomplete data that may have been saved before the exception was caught
                        removeFromStorage(storage, cacheKey);
                        console.log('Cache Error:'+e, cacheKey, strdata);
                    }
                }
            });
        }
    });
    jQuery.ajaxTransport("+*", function(options, originalOptions, jqXHR){  
      if (options.localCache)
        {
            var cacheKey = options.cacheKey,
                storage = getStorage(options.localCache),
                dataType = options.dataType || storage.getItem(cacheKey + 'dataType') || 'text',
                value = (storage) ? storage.getItem(cacheKey) : false;
            if (value){
                // In the cache? Get it, parse it to json if the dataType is JSON,
                // and call the completeCallback with the fetched value.
                console.log("Using local cache for Freshdesk ticket data.");
                if (dataType.toLowerCase().indexOf('json') !== -1) value = JSON.parse(value);
                return {
                    send: function(headers, completeCallback) {
                        var response = {};
                        response[dataType] = value;
                        completeCallback(200, 'success', response, '');
                    },
                    abort: function() {
                        console.log("Aborted ajax transport for json cache.");
                    }
                };
            }
        }
    });
		var types = ["GET", "PUT", "POST", "DELETE"];
		var parseTypes = function (type) {
			return Freshdesk[type.toLowerCase()] = function () {
				return this.rest.apply(this, [type].concat(slice.call(arguments)))
			}
		};
		var m = 0;
		for (var q = types.length; m < q; m++){
			var u = types[m];
      parseTypes(u);
    }
		
		// Provide another alias for Freshdesk.delete, since delete is a keyword in javascript
		Freshdesk.del = Freshdesk["delete"];
		
		var collections = "tickets conversations contacts agents roles groups companies discussions discussions settings".split(" ");
		var parseCollections = function (collection) {
			return Freshdesk[collection] = {
				get: function (id, params, success, error) {
					return Freshdesk.get(collection + "/" + id, params, success, error)
				}
			}
		};
		var q = 0;
		for ( var s = collections.length; q < s; q++) {
			var f = collections[q];
      parseCollections(f);
    }
		window.Freshdesk = Freshdesk;
		
		var parseRestArgs = function (...args) {
			let [path,params,success,error] = Array.from(args[0]);
			
			isFunction(params) && (error = success, success = params, params = {});
			path = path.replace(/^\/*/, "");
			return [path, params, success, error]
		};
		var localStorage = window.localStorage;
		null != localStorage ? (readStorage = function (key) {
			return localStorage["freshdesk_" + key]
		}, writeStorage = function (key, value) {
			return null === value ? delete localStorage["freshdesk_" + key] : localStorage["freshdesk_" + key] = value
		}) : readStorage = writeStorage = function () {}
	};
	deferred = {};
	ready = {};
	waitUntil = function (name, fx) {
		if (ready[name] != null) {
			return fx(ready[name]);
		  } else {
			return (deferred[name] != null ? deferred[name] : (deferred[name] = [])).push(fx);
		  }
	};
	isReady = function (name, value) {
		ready[name] = value;
		  if (deferred[name]) {
			const fxs = deferred[name];
			delete deferred[name];
			for (let fx of Array.from(fxs)) { fx(value); }
		  }
	};
	isFunction = function (val) {
		return "function" === typeof val
	};
	wrapper(window, jQuery, opts);
})()
