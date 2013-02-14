(function() {
    var inpLetters = document.getElementById("letters"),
        inpSpaces = document.getElementById("spaces"),
        btnExecute = document.getElementById("execute"),
        ul = document.getElementById("possibleWordList"),
        letters,
        spaces,
        possibleLetters = [];

    // Loading (...) animation for the 'Generate' button.
    function btnLoad (obj, action) {
        if ( action == "start" ) {
            // Remember what the old innerHTML was so we can restore it when the animation is complete.
            var restoreHTML = obj.innerHTML;

            // Set the 'data-status' attribute to 'inprogress' because we've just started the animation.
            obj.setAttribute("data-status", "inprogress");

            obj.setAttribute("disabled", true);

            obj.innerHTML = "&middot;";

            // Set up a 400ms timer that deals with the middot changes and checks the state of the animation.
            var timer = setInterval(function () {
                if ( obj.getAttribute("data-status") == "inprogress" ) {
                    // If the animation is still in progress add more middots.
                    if ( obj.innerHTML.length < 4 ) {
                        obj.innerHTML += "&middot;"
                    }
                    else {
                        obj.innerHTML = "&middot;";
                    }
                }
                // The animation has ended so stop the timer and restore the old innerHTML of the button.
                else {
                    clearInterval(timer);
                    obj.innerHTML = restoreHTML;
                    obj.removeAttribute("disabled");
                    obj.removeAttribute("data-status");
                }
            }, 400);        
        }
        else if ( action == "complete" ) {
            // Signify that the animation has completed so the timer will detect it on its next tick.
            obj.setAttribute("data-status", "complete");
        }
    }


    btnExecute.addEventListener("click", function () {
        // Clear out any spaces on the 'letters' input.
        letters = inpLetters.value.replace(/\s/g, "");
        spaces = inpSpaces.value;

        // Flush out the array that stores the possible letters so that old letters are removed if the user generates more words.
        possibleLetters = [];

        // Check that the user has filled out both text inputs and that the number of spaces isn't larger than the number of letters specified.
        if ( letters.length < 1 ) {
            inpLetters.focus();
            return;
        }
        else if ( spaces.length < 1 || spaces > letters.length ) {
            inpSpaces.focus();      
            return;
        }

        var timeout = false;

        // Disable the text inputs and start the loading animation.
        inpLetters.setAttribute("disabled", true);
        inpSpaces.setAttribute("disabled", true);
        btnLoad(this, "start");

        // Populate the 'letters' array with the letters from the text input.
        for ( var i = 0; i < letters.length; i++ ) {
            possibleLetters.push(letters.charAt(i));
        }

        // Check that the browser has support for web workers.
        if ( window.Worker ) {
            // The web worker that will do the word generation.
            var worker = new Worker("generate.js");

            // Start the worker and hand it the dictionary, possible letters and the number of spaces.
            worker.postMessage({
                "dict" : dict,
                "letters" : possibleLetters,
                "spaces" : spaces
            });

            // Clear out the <ul> of any previously generated words
            ul.innerHTML = "";
            
            // Listener for any messages sent back by the worker.
            worker.addEventListener("message", function (e) {
                // Get the data.
                var response = e.data;
                
                // If the last word generation timed out, re-enable the text inputs and stop the loading animation.
                if ( response.timeout == true ) {
                    inpLetters.removeAttribute("disabled");
                    inpSpaces.removeAttribute("disabled");
                    btnLoad(btnExecute, "complete");
                }
                // Or else, create a new <li> for the generated word and append it to the <ul>.
                else {
                    var li = document.createElement("li");
                    li.innerHTML = response.word;
                    ul.appendChild(li);
                }
            }, false);
        }
        // If not (IE <= 9) then show an error message.
        else {
            var li = document.createElement("li");
            li.setAttribute("class", "no-support");
            li.innerHTML = "Your browser doesn't support <a href=\"http://en.wikipedia.org/wiki/Web_worker\">Web Workers</a> so unfortunately you are unable to run this program. Please consider upgrading to a <a href=\"http://browsehappy.com/\">modern browser.</a>";
            ul.appendChild(li);
            
            inpLetters.removeAttribute("disabled");
            inpSpaces.removeAttribute("disabled");
            btnLoad(btnExecute, "complete");
        }  
    });
})();
