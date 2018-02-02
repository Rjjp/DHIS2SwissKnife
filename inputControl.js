/***********
 * 
 * This file contains function that controls the input of the user
 * 
 * @author Ramón José Jiménez Pomareta
 * @version 2
 * @date 25.01.2018
 * @requires jQuery-UI
 * 
 * last changes autocompleteSearcher delay
 */

var excelHeaders = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ", "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH"];
var ASC = 1;
var DESC = 2;

/**
* Generates a list of number from next year until 1900 and stores in generatedYears
*/
function generateNumbers(from, to, asc){
    var numbers = [];
    var number;

    if(ASC == asc){
        for (i = from; i <= to; i++)
        {
            number = new Object();
            number.value = i;
            number.label = i;
            numbers.push(number);
        }
    } else {
        for (i = to; i >= from; i--)
        {
            number = new Object();
            number.value = i;
            number.label = i;
            numbers.push(number);
        }
    }

    return numbers;
}

/*
Returns the position of the letter.
Attention ! Max supported : last letter on excelHeaders
*/
function letterNo(letter){
    if (letter.length == 1) {
        return letter.charCodeAt(0) - 65;
    } else {
        var pos = "Z".charCodeAt(0) - 65 + 1;
        while (pos <= excelHeaders.length && letter.toLowerCase().localeCompare(excelHeaders[pos].toLowerCase()) != 0 ){
            pos++;
        } 
        return pos;
    }
}

function distanceBetween(letter1, letter2){
	var count = 0;

	while (letter1.toLowerCase().localeCompare(letter2.toLowerCase()) < 0 || letter1.length < letter2.length){
		letter1 = nextLetter(letter1);
		count ++;
	}
	return count;
}

/**
 * Return next letter. A->B, AB->AC, Z->AA
 * @param {string} key a string [a-zA-Z]+
 */

function nextLetter (key) {
  if (key === 'Z' || key === 'z') {
    return String.fromCharCode(key.charCodeAt() - 25) + String.fromCharCode(key.charCodeAt() - 25); // AA or aa
  } else {
    var lastChar = key.slice(-1);
    var sub = key.slice(0, -1);
    if (lastChar === 'Z' || lastChar === 'z') {
      // If a string of length > 1 ends in Z/z,
      // increment the string (excluding the last Z/z) recursively,
      // and append A/a (depending on casing) to it
      return nextLetter(sub) + String.fromCharCode(lastChar.charCodeAt() - 25);
    } else {
      // (take till last char) append with (increment last char)
      return sub + String.fromCharCode(lastChar.charCodeAt() + 1);
    }
  }
  return key;
};

function autocompleteSearcher(elementId, dataSource, callbackFunction, minLength, delay){
    $( "#"+elementId ).autocomplete({
        source: dataSource,
        select: function(event, ui) {
            event.preventDefault();
            $("#"+elementId).val(ui.item.label);
            $("#"+elementId).text(ui.item.value);
            callbackFunction(ui.item);
        },
        focus: function(event, ui) {
            event.preventDefault();
            $("#"+elementId).val(ui.item.label);
            $("#"+elementId).text(ui.item.value);

        },
        change: function (event, ui) {
            if(!ui.item){
                //http://api.jqueryui.com/autocomplete/#event-change -
                // The item selected from the menu, if any. Otherwise the property is null
                //so clear the item for force selection
                $("#"+elementId).val("");
                $("#"+elementId).text("");
            }

        },
        delay: delay,
        minLength: minLength
    });
}




    // Modifies the autocomplete filter in order to match also other fields than label
$.ui.autocomplete.filter = function (array, term) {
    var matcher = new RegExp('(^| )' + $.ui.autocomplete.escapeRegex(term), 'i');
    return $.grep(array, function (value) {
        return matcher.test(value.label) || matcher.test(value.value) || matcher.test(value.code) || matcher.test(value.name) || matcher.test(value);
    });
};


function getArrayOfLetters(letter1, letter2){
    var array = [];
    
    if (letter1.match(/[a-z]/i) && letter2.match(/[a-z]/i)) {
        // alphabet letters found
        while (letter1.toLowerCase().localeCompare(letter2.toLowerCase()) < 0 || letter1.length < letter2.length){
            array.push(letter1);
            letter1 = nextLetter(letter1);
        }
        array.push(letter1);
    }


    
    return array;
}


