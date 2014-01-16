"use strict";

(function () {
/* First I load a Promises polyfill file.
Then I use promises to load all of the scripts requested.
Then I call the callback.
*/
    var polyfillFileName = "js/lib/promise-0.1.1.min.js";
    var scriptFileNames = ["bridge.js", "game.js", "keyboard.js", "util.js"];
    var loadAllCallback = function () {
        initGame();
    };

    //http://stackoverflow.com/a/8278513/439948
    function loadScriptRaw(url, callback){

        var script = document.createElement("script")
        script.type = "text/javascript";

        if (script.readyState){  //IE
            script.onreadystatechange = function(){
                if (script.readyState == "loaded" ||
                        script.readyState == "complete"){
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            script.onload = function(){
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    var startLoading = function () {
        console.log("Loading promises polyfill.");
        loadScriptRaw(polyfillFileName, function() {
            var loadScript = function (url) {
                return new Promise(function(resolve, reject) {
                    loadScriptRaw(url, function () {
                        resolve();
                    })
                })
            }

            var allLoads = [];

            scriptFileNames.forEach(function (scriptFileName) {
                allLoads.push(loadScript("js/" + scriptFileName));
                console.log("Loading " + scriptFileName + "...");
            });

            Promise.all(allLoads).then(function () {
                console.log("All scripts have loaded.");
                loadAllCallback();
            });
        });
    }

    window.addEventListener ?
        window.addEventListener("load",startLoading,false) : window.attachEvent && window.attachEvent("onload", startLoading);

})();