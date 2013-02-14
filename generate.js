self.addEventListener("message", function (e) {
    // Get the data that was sent to the worker (dictionary, possible letters and number of spaces).
    var dictionary = e.data.dict,
        possibleLetters = e.data.letters,
        spaces = e.data.spaces,
        timeout = false,
        lib = [];

    // Keep generating more words until it times out (i.e. it runs out of combinations).
    while ( timeout === false ) {
        var word = generateWord();

        // Check if the last word generated timed out.
        if ( word.timeout == true ) timeout = true;

        // Send the word and timeout status back to the main script.
        self.postMessage({
            "timeout" : timeout,
            "word" : word.word
        });
    }

    function generateWord () {
        // By default it is assumed that the word generated is invalid (not in the dictionary).
        var valid = false,
            // Var to log the number of attempts at word generation which is used to timeout the script.
            attempts = 0,
            ret = {};

        // Keep looping until we find a valid word and haven't timed out.
        while ( valid === false && attempts <= 10000 ) {
            // We need a temporary version of the 'letters' arrary, but arrays are passed by reference by default so we can slice the original as a work-around. 
            var tempPossibleLetters = possibleLetters.slice(0),
                word = "",
                rand;

            // Grab some letters from the temporary letters array to make a word of the correct length (defined by number of spaces).
            for ( var i = 0; i < spaces; i++ ) {
                rand = Math.floor(Math.random() * tempPossibleLetters.length);
                word += tempPossibleLetters[rand];
                // Now that we've used that letter we can't use it again and so remove it from the array.
                tempPossibleLetters.splice(tempPossibleLetters.indexOf(tempPossibleLetters[rand]), 1);
            }

            // If the same word hasn't already been generated and is in the dictionary...
            if ( lib.indexOf(word) == -1 && dictionary.indexOf(word) >= 0 ) {
                // Put the newly generated word into our library of other generated words.
                lib.push(word);

                // Yay it's a valid word!
                valid = true;

                // Data to return to main script.
                ret = {
                    "timeout" : false,
                    "word" : word
                };
                return ret;
            }
            attempts++;
        }
        // If we get to here, that means that either the word wasn't valid or we timed out.
        ret = {
            "timeout" : true,
            "word" : null
        }
        return ret;
    }
});
