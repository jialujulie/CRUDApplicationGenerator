define(["./persistenceManager","./persistenceUtils","./fetchStrategies","./cacheStrategies","./persistenceStoreManager","./impl/defaultCacheHandler","./impl/logger"],function(a,b,c,d,e,f,g){"use strict";function h(a){a=a||{},null==a.fetchStrategy&&(a.fetchStrategy=c.getCacheIfOfflineStrategy()),null==a.cacheStrategy&&(a.cacheStrategy=d.getHttpCacheHeaderStrategy()),a.requestHandlerOverride=a.requestHandlerOverride||{},null==a.requestHandlerOverride.handleGet&&(a.requestHandlerOverride.handleGet=this.handleGet),null==a.requestHandlerOverride.handlePost&&(a.requestHandlerOverride.handlePost=this.handlePost),null==a.requestHandlerOverride.handlePut&&(a.requestHandlerOverride.handlePut=this.handlePut),null==a.requestHandlerOverride.handlePatch&&(a.requestHandlerOverride.handlePatch=this.handlePatch),null==a.requestHandlerOverride.handleDelete&&(a.requestHandlerOverride.handleDelete=this.handleDelete),null==a.requestHandlerOverride.handleHead&&(a.requestHandlerOverride.handleHead=this.handleHead),null==a.requestHandlerOverride.handleOptions&&(a.requestHandlerOverride.handleOptions=this.handleOptions),Object.defineProperty(this,"_options",{value:a})}function i(a){return new h(a)}function j(a,b){var c=a,d=c._options,e=null;return"POST"===b.method?e=d.requestHandlerOverride.handlePost:"GET"===b.method?e=d.requestHandlerOverride.handleGet:"PUT"===b.method?e=d.requestHandlerOverride.handlePut:"PATCH"===b.method?e=d.requestHandlerOverride.handlePatch:"DELETE"===b.method?e=d.requestHandlerOverride.handleDelete:"HEAD"===b.method?e=d.requestHandlerOverride.handleHead:"OPTIONS"===b.method&&(e=d.requestHandlerOverride.handleOptions),e}function k(b){if(a.isOnline())return a.browserFetch(b);var c={status:503,statusText:"Must provide handlePost override for offline"};return Promise.resolve(new Response(null,c))}function l(a,b){var c=a;return(0,c._options.fetchStrategy)(b,c._options)}function m(b,c){var d=b;return a.isOnline()?a.browserFetch(c.clone()).then(function(a){return a.ok?(g.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for default PUT Handler"),a):q(d,c,a,n)},function(a){return n(d,c)}):n(d,c)}function n(a,c){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing offline logic for default PUT Handler"),b.requestToJSON(c).then(function(a){a.status=200,a.statusText="OK",a.headers["content-type"]="application/json",a.headers["x-oracle-jscpt-cache-expiration-date"]="";var c=a.headers["if-match"],d=a.headers["if-none-match"];if(c||d){g.log("Offline Persistence Toolkit DefaultResponseProxy: Generating ETag for offline Response for default PUT Handler");var e=Math.floor(1e6*Math.random());a.headers.etag=(Date.now()+e).toString(),a.headers["x-oracle-jscpt-etag-generated"]=a.headers.etag,delete a.headers["if-match"],delete a.headers["if-none-match"]}return b.responseFromJSON(a)})}function o(b,c){var d=b;return a.isOnline()?a.browserFetch(c.clone()).then(function(a){return a.ok?(g.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for default DELETE Handler"),a):q(d,c,a,p)},function(a){return p(d,c)}):p(d,c)}function p(a,c){var d=a;return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing offline logic for default DELETE Handler"),b.requestToJSON(c).then(function(a){return a.status=200,a.statusText="OK",a.headers["content-type"]="application/json",a.headers["x-oracle-jscpt-cache-expiration-date"]="",b.responseFromJSON(a).then(function(f){var g=r(c),h=null;return d._options&&d._options.jsonProcessor&&d._options.jsonProcessor.shredder&&(h=d._options.jsonProcessor.shredder),h?h(f).then(function(c){if(c){var d=c[0].name;return e.openStore(d).then(function(c){return c.findByKey(g).then(function(c){return c?b.responseFromJSON(a).then(function(a){return b.setResponsePayload(a,c).then(function(a){return a})}):f})})}return f}):f})})}function q(a,b,c,d){var e=a;return c.status<500?Promise.resolve(c):d(e,b)}function r(a){var b=a.url.split("/");return b[b.length-1]}function s(a,b,c){var d=a;if("GET"===b.method||"HEAD"===b.method){return(0,d._options.cacheStrategy)(b,c,d._options)}return Promise.resolve(c)}function t(b,c,d){return!a.isOnline()||d?a.getSyncManager().insertRequest(b,{undoRedoDataArray:c}):Promise.resolve()}function u(b,c){return"GET"==b.method||"HEAD"==b.method?a.getCache().hasMatch(b,{ignoreSearch:!0}).then(function(a){return a?v(b,c):Promise.resolve()}):v(b,c)}function v(a,b){return f.constructShreddedData(a,b).then(function(b){return b?w(a,b):Promise.resolve()})}function w(a,b){var c=[];return b.forEach(function(b){var d=Object.keys(b)[0];c.push(x(a,d,b[d]))}),Promise.all(c)}function x(a,b,c){return y(a,b,c).then(function(d){return"DELETE"===a.method?A(b,c,d):z(b,c,d)})}function y(a,b,c){var d,f,g=[],h=function(c,i){return c<i.length&&"GET"!==a.method&&"HEAD"!==a.method?(d=i[c].key.toString(),f="DELETE"!==a.method?i[c].value:null,e.openStore(b).then(function(a){return a.findByKey(d).then(function(a){return g.push({key:d,undo:a,redo:f}),h(++c,i)},function(a){return g.push({key:d,undo:null,redo:f}),h(++c,i)})})):Promise.resolve(g)};return h(0,c)}function z(a,b,c){return e.openStore(a).then(function(a){return a.upsertAll(b)}).then(function(){return c.length>0?{storeName:a,operation:"upsert",undoRedoData:c}:null})}function A(a,b,c){return e.openStore(a).then(function(a){return a.removeByKey(b[0].key)}).then(function(){return c.length>0?{storeName:a,operation:"remove",undoRedoData:c}:null})}return h.prototype.getFetchEventListener=function(){var a=this;return function(b){b.respondWith(a.processRequest(b.request))}},h.prototype.processRequest=function(a){var c=this,d=b.buildEndpointKey(a);return new Promise(function(e,h){f.registerEndpointOptions(d,c._options);var i=j(c,a),k={},l=a.clone();g.log("Offline Persistence Toolkit DefaultResponseProxy: Calling requestHandler for request with enpointKey: "+d),i.call(c,a).then(function(e){return b.isCachedResponse(e)&&(g.log("Offline Persistence Toolkit DefaultResponseProxy: Response is cached for request with enpointKey: "+d),k.isCachedResponse=!0),e.ok?(g.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for request with enpointKey: "+d),s(c,a,e)):(g.log("Offline Persistence Toolkit DefaultResponseProxy: Response is not ok for request with enpointKey: "+d),e)}).then(function(b){return k.response=b,b.ok?(g.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok after cacheStrategy for request with enpointKey: "+d),u(a,b)):(g.log("Offline Persistence Toolkit DefaultResponseProxy: Response is not ok after cacheStrategy for request with enpointKey: "+d),null)}).then(function(b){return t(a,b,k.isCachedResponse)}).then(function(){f.unregisterEndpointOptions(d),e(k.response)}).catch(function(a){g.log("Offline Persistence Toolkit DefaultResponseProxy: Insert Response in syncManager after error for request with enpointKey: "+d),t(l,null,!0).then(function(){f.unregisterEndpointOptions(d),h(a)},function(){f.unregisterEndpointOptions(d),h(a)})})})},h.prototype.handlePost=function(a){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default POST Handler"),k(a)},h.prototype.handleGet=function(a){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default GET Handler"),l(this,a)},h.prototype.handleHead=function(a){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default HEAD Handler"),l(this,a)},h.prototype.handleOptions=function(a){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default OPTIONS Handler"),k(a)},h.prototype.handlePut=function(a){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default PUT Handler"),m(this,a)},h.prototype.handlePatch=function(a){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default PATCH Handler"),k(a)},h.prototype.handleDelete=function(a){return g.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default DELETE Handler"),o(this,a)},{getResponseProxy:i}});
//# sourceMappingURL=defaultResponseProxy.js.map