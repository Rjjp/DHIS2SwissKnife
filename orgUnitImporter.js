var parentUIDs;
var firstColumnNo, lastColumnNo;
var currentColumn;
var excelHeaders = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ", "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH"];

var OUTemplate;
var firstColumn, lastColumn, firstRow, refColumn, latitudeColumn, longitudeColumn, numberOfMetadata;

var poolOfIds = [];
var nextQuantityOfIDS = 0;
var metadata = [];


function generateNewsIDS(){
    console.log ("generateNewsIDS request. Available in pool" + poolOfIds.length + ". Qty asked:" + nextQuantityOfIDS);
    
    return $.when( getArrayOfIDs(nextQuantityOfIDS))
    .done(function(returnData){
        nextQuantityOfIDS = 10;
        poolOfIds = poolOfIds.concat(returnData.codes);
        return poolOfIds;
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
                return returnData;
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
    numberOfMetadata = $("#numberOfMetadata").val();
    refColumn = $("#refColumn").val();
    longitudeColumn= $("#longitudeColumn").val();
    latitudeColumn = $("#latitudeColumn").val();
}


function prepareForProcessingNextSheet(workbook, counter, length){
    if(counter < length){
        $.when(processSheet(workbook[counter], counter)).done(function(returnData){
          counter++;
          prepareForProcessingNextSheet(workbook, counter, length);
        });
     }
}

// gets the metadta name of the first row in the first sheet
function fillMetadata(workbook){
    for (var i = 0; i < numberOfMetadata; i++){
        metadata.push(getCellData(workbook[0], excelHeaders[i]+"1"));
    }
}

function resetOUTemplate(){
    OUTemplate = new Object();
    OUTemplate.id=""; 
    //OUTemplate.name="";
    //OUTemplate.shortName="";
    OUTemplate.parent= new Object();
    OUTemplate.parent.id ="";
   // OUTemplate.openingDate="1932-01-28T23:00:00.000";
}

function processWorkbook(workbook){
    console.log("Workbook processing");
    parentUIDs = [];
    resetOUTemplate();

    fillMetadata(workbook);

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
    nextQuantityOfIDS = precisionRound(lastRowForColumn(array, lastColumn) * 2, 0);
    generateNewsIDS();
    // It adds 1 at the beggining
    return processNextRow(array, firstRow-1);

}

function processNextRow(array, row){    
    row++;
    console.log("processNextRow row" + row );
    
    if(getCellData(array, refColumn+row) != ""){
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
    return getCellData(array, thisLetter(colNo-numberOfMetadata)+row).localeCompare(getCellData(array, thisLetter(colNo-numberOfMetadata)+(row-1))) == 0 ;
}

function getParentFromRef(array, colNo, row){
    console.log("getParentFromRef parent is"+thisLetter(colNo-numberOfMetadata)+row);
    var id = getCellData(array, thisLetter(colNo-numberOfMetadata)+row);
    return getByID(ORG_UNITS, id);
}


function getParentFromPreviousRow(array, colNo, row){
    console.log("getParentFromPreviousRow "+thisLetter(colNo)+row);
    
    if (colNo > numberOfMetadata - 1){
        var returnObject = new Object();
        console.log("Getting parent From Previous Row below 0. Getting from array.")
        console.log(parentUIDs[colNo - numberOfMetadata]);
        returnObject.id = parentUIDs[colNo - numberOfMetadata];
        return returnObject;
    } else {
        console.log("Getting parent From Previous Row below 0. Getting from ref.")
        return getParentFromRef(colNo);
    }
    
    
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
    console.log("work... done!")
    return start;
  }
  //return sleep(1000);


function addOU(array, getParentFunction, colNo, row){
    console.log("addOU "+thisLetter(colNo)+row);
    
    
    return $.when( getParentFunction(array, colNo, row))
            .done(function(returnData){
                parentUIDs[colNo - numberOfMetadata] = returnData.id;
                
                resetOUTemplate();
                OUTemplate.id = getCellData(array, thisLetter(colNo) + row);
                parentUIDs[colNo] = OUTemplate.id;
                
                OUTemplate.parent.id = parentUIDs[colNo - numberOfMetadata];
                                        
                if(lastColumnNo == colNo) {
                    lat = getCellData(array, latitudeColumn + row);
                    long = getCellData(array, longitudeColumn + row);
                    if( lat.length != 0 && long.length != 0){
                        OUTemplate.coordinates = "["+long+","+lat+"]";
                    }
                }
                
                if (OUTemplate.id.length != 0){
                    //Patch then
                    var tempData;
                    for (var i = 1; i<metadata.length; i++ ){
                        tempData =  getCellData(array, thisLetter(colNo+i) + row);
                        if (tempData.length != 0){
                            OUTemplate[metadata[i]] = getCellData(array, thisLetter(colNo+i) + row);                            
                        }
                    }
                    console.log("Patch OU [" + thisLetter(colNo) + row + "] : " + OUTemplate.name + " " + OUTemplate.id + " parent = " + parentUIDs[colNo - numberOfMetadata]);
                    console.log(OUTemplate);
                    return sendObjectTo(ORG_UNITS+parameters, OUTemplate, PATCH);
                    
                } else {
                    //create

                    return $.when(getNewID())
                    .done(function(returnData){
                        if (typeof returnData === 'string') {
                            OUTemplate.id= returnData; 
                        } else {
                            OUTemplate.id= returnData.codes[0];
                        }

                        for (var i = 1; i<metadata.length; i++ ){
                            OUTemplate[metadata[i]] = getCellData(array, thisLetter(colNo+i) + row);
                        }
                        OUTemplate.openingDate="1932-01-28T23:00:00.000";

                        console.log("add OU [" + thisLetter(colNo) + row + "] : " + OUTemplate.name + " " + OUTemplate.id + " parent = " + parentUIDs[colNo - numberOfMetadata]);
                        console.log(OUTemplate);
                        //return;
                        return sendObjectTo(ORG_UNITS+parameters, OUTemplate, POST);
                        
                    });

                }
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
    // ((colNo / numberOfMetadata) >> 0) * numberOfMetadata; // gets the colNo of the id of its group
    return (((colNo / numberOfMetadata) >> 0) - 1) * numberOfMetadata == letterNo(refColumn);
    //return colNo
    //return previousLetter(colNo).localeCompare(refColumn) < 0;
}


function addOU_InRow(array, colNo, row) {
    console.log("addOU_InRow "+thisLetter(colNo)+row);
    
    if (parentEqualPrevious(array, colNo, row)){
        console.log("addOU_InRow parentEqualPrevious "+colNo+row);
        
        return addOU(array, getParentFromPreviousRow, colNo, row);
    } else if (parentIsRef(colNo)){
        console.log("addOU_InRow parentIsRef "+colNo+row);
        
        return  $.when(addOU(array, getParentFromRef, colNo, row))
            .done(function(returnData){
                return returnData;
            });
    } else {
        console.log("addOU_InRow else "+colNo+row);
        
        return $.when( addOU_InRow(array, colNo - numberOfMetadata, row))
        .done(function(returnData){
            console.log("finish addOU_InRow  "+colNo+row);
            console.log(returnData);
        })
        .fail(function(returnError){
                console.log("Error inside addOU_InRow");
                console.log(returnError);
        })
        .then(function(returnData){
            return addOU(array, getParentFromPreviousRow, colNo, row);
           
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
        val = "";
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


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
/*

 $.when(
        getReferencesUID()
        )
    .done(function(programsRes){
    
    
    });

*/