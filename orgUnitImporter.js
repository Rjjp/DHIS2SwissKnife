var parentUIDs;
var firstColumnNo, lastColumnNo;
var currentColumn;
var excelHeaders = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ", "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH"];

var OUTemplate;
var firstColumn, lastColumn, firstRow, refColumn;

var poolOfIds = [];
var nextQuantityOfIDS = 0;


function generateNewsIDS(){
    console.log ("generateNewsIDS request. Available in pool" + poolOfIds.length + ". Qty asked:" + nextQuantityOfIDS);
    
    return $.when( getArrayOfIDs(nextQuantityOfIDS))
    .done(function(returnData){
        nextQuantityOfIDS = 10;
        poolOfIds = poolOfIds.concat(returnData.codes);
    });
}

function getNewID(){
    console.log ("New id request. Available in pool" + poolOfIds.length);
    if (poolOfIds.length > 0){
        return poolOfIds.pop();
    } else {
        return $.when( generateNewsIDS())
        .done(function(returnData){

            return $.when( getNewID())
            .done(function(returnData){
                return;
            });
        });
    }
}

// TODO: securize that
function setFirstAndLastColumnNumbers(firstColumn, lastColumn){
    var last1 = excelHeaders.length;
    var last2 = excelHeaders.length;
    for (var i = 0; i<last1; i++){
        if(excelHeaders[i].localeCompare(firstColumn)==0){
            firstColumnNo = i;
            last1 = i; 
        }
    }

    for (i = last1; i<last2; i++){
        parentUIDs[i] = "";
        if(excelHeaders[i].localeCompare(lastColumn)==0){
            lastColumnNo = i;
            last2 = i; 
        }
    }

}

function setValuesOfOUImporterFields(){
    firstColumn = $("#firstColumn").val();
    lastColumn = $("#lastColumn").val();
    firstRow = $("#firstRow").val();
    refColumn = $("#refColumn").val();
}


function prepareForProcessingNextSheet(workbook, counter, length){
    if(counter < length){
        $.when(processSheet(workbook[counter], counter)).done(function(returnData){
          counter++;
          prepareForProcessingNextSheet(workbook, counter, length);
        });
     }
}

function processWorkbook(workbook){
    console.log("Workbook processing");
    parentUIDs = [];
    OUTemplate = new Object();
    OUTemplate.id=""; 
    OUTemplate.name="";
    OUTemplate.shortName="";
    OUTemplate.parent= new Object();
    OUTemplate.parent.id ="";
    OUTemplate.openingDate="1932-01-28T23:00:00.000";


    setFirstAndLastColumnNumbers(firstColumn, lastColumn);

    var length = Object.keys(workbook).length;
    var counter = 0;

    prepareForProcessingNextSheet(workbook, counter, length);
    
    /*var chain = $q.when();
    for(var i = 0; i < Object.keys(output).length; i++) {
        chain = chain.then(function() {
            return processSheet(output[i], i);
        });
    }*/
}

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

function processSheet(array, sheetNo){
    console.log(" --- *** --- processSheet " + sheetNo + " --- *** ---");
    parentUIDs = [];
    nextQuantityOfIDS = precisionRound(lastRowForColumn(array, lastColumn) * 1.5, 0);
    generateNewsIDS();
    // It adds 1 at the beggining
    return processNextRow(array, firstRow-1);

}

function processNextRow(array, row){    
    row++;
    console.log("processNextRow row" + row );
    
    if(getCellData(array, refColumn+row) != null){
       /* return $.when(
            getReferencesUID()
            )
        .done(function(reference){
            addRefToArray();*/
            return $.when( addOU_InRow(array, lastColumnNo, row))
            .done(function(returnData){
                return processNextRow(array, row);
            })
            .fail(function(returnError){
                console.log("Error when addOU_InRow");
                console.log(returnError);
                // Create dialog and let user continue or stop here
                return processNextRow(array, row);
            });
        
       /* })
        .fail(function(returnError){
            console.log("Error on getReference");
            console.log(returnError);
            // Create dialog and let user continue or stop here
            return processNextRow(array, uidArray, row);
        });*/
    } else {
        return;
    }

}

function parentEqualPrevious(array, colNo, row){
    return getCellData(array, previousLetter(colNo)+row).localeCompare(getCellData(array, previousLetter(colNo)+(row-1))) == 0 ;
}

function getParentFromRef(array, colNo, row){
    console.log("getParentFromRef parent is"+thisLetter(colNo-1)+row);
    var id = getCellData(array, thisLetter(colNo-1)+row);
    return getByID(ORG_UNITS, id);
}


function getParentFromPreviousRow(array, colNo, row){
    console.log("getParentFromPreviousRow "+thisLetter(colNo)+row);
    
    if (colNo > 0){
        var returnObject = new Object();
        console.log("Getting parent From Previous Row below 0. Getting from array.")
        console.log(parentUIDs[colNo-1]);
        returnObject.id = parentUIDs[colNo-1];
        return returnObject;
    } else {
        console.log("Getting parent From Previous Row below 0. Getting from ref.")
        return getParentFromRef(colNo);
    }
    
    
}

function addOU(array, getParentFunction, colNo, row){
    console.log("addOU "+thisLetter(colNo)+row);
    return $.when( getParentFunction(array, colNo, row))
        .done(function(returnData){
            parentUIDs[colNo - 1] = returnData.id;
            return $.when(getNewID())
            .done(function(returnData){
                OUTemplate.id= returnData; 
                OUTemplate.name= getCellData(array, thisLetter(colNo) + row);
                OUTemplate.shortName= OUTemplate.name;
                OUTemplate.parent= new Object();
                OUTemplate.parent.id = parentUIDs[colNo-1];
                OUTemplate.openingDate="1932-01-28T23:00:00.000";
                parentUIDs[colNo] = OUTemplate.id;
                console.log("add OU [" + thisLetter(colNo) + row + "] : " + OUTemplate.name + " " + OUTemplate.id + " parent = " + parentUIDs[colNo-1]);
                console.log(OUTemplate);
                return $.when(createNewElement(ORG_UNITS, OUTemplate))
                .done(function(returnData){
                    return returnData;
                });
            });
        });
}

function thisLetter(colNo){
    if (colNo > -1) {
        return excelHeaders[colNo];
    } else {
        console.log ("::::ERROR:::: in thisLetter. colNo " + colNo);
        return "";
    }
}

function previousLetter(colNo){
    if (colNo > 0) {
        return excelHeaders[colNo-1];
    } else {
        console.log ("::::ERROR:::: in previousLetter. colNo " + colNo);
        return "";
    }
}

function parentIsRef(colNo){
    return previousLetter(colNo).localeCompare(refColumn) == 0;
}


function addOU_InRow(array, colNo, row) {
    console.log("addOU_InRow "+thisLetter(colNo)+row);
    
    if (parentEqualPrevious(array, colNo, row)){
        console.log("addOU_InRow parentEqualPrevious "+colNo+row);
        
        return addOU(array, getParentFromPreviousRow, colNo, row);
    } else if (parentIsRef(colNo)){
        console.log("addOU_InRow parentIsRef "+colNo+row);
        
        return addOU(array, getParentFromRef, colNo, row);
    } else {
        console.log("addOU_InRow else "+colNo+row);
        
        return $.when( addOU_InRow(array, colNo - 1, row))
        .done(function(returnData){
            addOU(array, getParentFromPreviousRow, colNo, row);
        })
        .fail(function(returnError){
                console.log("Error inside addOU_InRow");
                console.log(returnError);
        });
    }
}

/* Returns the data in the cell address of the target sheet
sheetNum : the sheet number of the woorkbook (starting at 1)
address : the cell number in text. i.e. A12
*/
function getCellData( array, address )
{
    var val = "";
    address = address.toUpperCase(); //making addresses with simple letters into capital

    try
    {
        // It gets the text value
        var data = array[address].w;
        
        if( typeof data != undefined ){
            if (typeof data === 'string') {
                val = $.trim(data);
            } else {
                val = data;
            }
        } else {
            val = "";
        }
            
    }
    catch(ex)
    {
        val = null;
    }

    return(val);
}

// TODO: Move to a tools js

/**
 * Gets the object with only the keys starting with some string.
 * It removes this part of the string in the new object
*/
function getObjectWithKeys(object, theString, parseFunctionKeys, parseFunctionValues) {
	var theMatchingString = String(theString);
	var z = Object.keys(object).filter(function(k) {
		// If starting with the search string and next is a number (when searching letter) OR
		// if it's a number AND there's nothing after the string AND the previous character is not a number 
		return (k.indexOf(theMatchingString) == 0 && !isNaN(k.charAt(theMatchingString.length))) ||
				(!isNaN(theMatchingString) && 
				k.indexOf(theMatchingString) == Math.abs(k.length - theMatchingString.length) && 
				isNaN(k.charAt(Math.abs(k.length - theMatchingString.length-1))));
	}).reduce(function(newData, k) {
		newData[parseFunctionKeys(k.replace(new RegExp(theMatchingString, "g"), ''))] = parseFunctionValues(object[k]);
		return newData;
	}, {});

	return z;
}


function lastRowForColumn(data, column){
	var z = getObjectWithKeys(data, column, parseInt, parseInt);
	var valuesArray = Object.keys(z);
	return Math.max.apply(null,valuesArray);
}

/*

 $.when(
        getReferencesUID()
        )
    .done(function(programsRes){
    
    
    });

*/