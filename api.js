


/***********
 * 
 * This file contains function to interact with the api
 * 
 * @author Ramón José Jiménez Pomareta
 * @version 1
 * @date 25.01.2018
 * 
 * 
 */       

var BASE_URL = "../../..";
var API_URL = BASE_URL + "/api/";
var ORG_UNITS = "organisationUnits";
var EVENTS = "events";
var RESOURCES = "resources";
var ME = "me";
var SHARING = "sharing";
var USERS = "users";


    
    /****************************************************************************************************
 	 **********                    	    FUNCTIONS CALLING THE API         	           	       **********
	 ****************************************************************************************************/
    function mergeButKeepFirst(priorityArray, secondArray){
        
        if (typeof secondArray !== 'undefined' && secondArray !==null){
            for (var i=0;i<secondArray.length;i++){
                var exists = false;
                for (var j=0;j<priorityArray.length;j++){
                    if (secondArray[i].id.localeCompare(priorityArray[j].id)==0){
                        exists = true;
                        j = priorityArray.length;
                    }
                }
                if (!exists){
                    priorityArray.push(secondArray[i]);
                }
            }
        }
        return priorityArray;
    }

    function updateSharingStatus(type, id, payload){
        (function (_type, _id, _payload) {
            $.when(getSharingStatus(_type, _id))
            .done(function(answer){
                _payload.object.userGroupAccesses = mergeButKeepFirst(_payload.object.userGroupAccesses, answer.userGroupAccesses);
                _payload.object.userAccesses = mergeButKeepFirst(_payload.object.userAccesses, answer.userAccesses);
                setSharingStatus(_type, _id, _payload);
            });
        })(type, id, payload);
    }

    function setSharingStatus(type, id, object){
        var params = {
			type: type,
            id: id
		}
        var builtUrl = buildAPIUrl(SHARING, params);
        console.log ("POST: "+builtUrl);
        console.log (object);
        return $.ajax({
            url: builtUrl,
            type: 'POST',
            dataType: 'json',
            //   processData: false,
            contentType: 'application/json',
            data: JSON.stringify(object)
            
        }).done(function(data) {
            console.log("done");
            console.log(data);
            return data;
        }).fail(function(data) {
            console.log(data);
            return data;
        });
    }

    function getSharingStatus(type, id){
        var params = {
			type: type,
            id: id
		}
        var builtUrl = buildAPIUrl(SHARING, params);
        return $.ajax({
            url: builtUrl,
            type: 'GET'
            
        }).then(function(data) {
            return data.object;
        });
    }

    function getObjectWithDependencies(type,id){

        var builtUrl = buildAPIUrl(type+"/"+id+"/metadata.json");

        return $.ajax({
            url: builtUrl,
            type: 'GET'
            
        }).then(function(data) {
            return data;
        });
    }
    function updateByID(resource, id, payload, callback){
        var builtUrl = buildAPIUrl(resource);
        builtUrl += "/"+id;
        $.ajax({
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            url: builtUrl,
            type: 'PUT',
            dataType: 'json',            
            data: payload
            
        }).then(function(data) {
            callback(data);
        });
    }

    function deleteEvent(id, callback){
        var builtUrl = buildAPIUrl(EVENTS);
        builtUrl += "/"+id;
        return $.ajax({
            url: builtUrl,
            type: 'DELETE'
            
        }).then(function(data) {
            callback();
            return data;
        });
    }

    function getEventsByProgram(program, orgUnit, extraParams){
        var params = {
			program: program,
            orgUnit: orgUnit,
            skipPaging : true
		}
        
        var builtUrl = buildAPIUrl(EVENTS, params);
        builtUrl += extraParams;
        return $.ajax({
            url: builtUrl,
            type: 'GET'
            
        }).then(function(data) {
            return data;
        });

    }    
    
    function getByID(resource, id){

      
        var builtUrl = buildAPIUrl(resource);
        builtUrl += "/"+id;
        return $.ajax({
            url: builtUrl,
            type: 'GET'
            
        }).then(function(data) {
            return data;
        });
    }


    function get(resource, fields){

        var params = {
			fields: fields,
            paging: "false"
		}
        var builtUrl = buildAPIUrl(resource, params);

        return $.ajax({
            url: builtUrl,
            type: 'GET'
            
        }).then(function(data) {
            return data;
        });
    }

    function getArrayOfIDs(quantity){

        var builtUrl = buildAPIUrl("system/id?limit="+quantity);
        
        return $.ajax({
            url: builtUrl,
            type: 'GET'
            
        }).then(function(data) {
            return data;
        });
    }

    function createNewElement(endpoint, object) {

        var builtUrl = buildAPIUrl(endpoint);
        console.log ("POST: "+builtUrl);
        console.log (object);
        return $.ajax({
            url: builtUrl,
            type: 'POST',
            dataType: 'json',
            //   processData: false,
            contentType: 'application/json',
            data: JSON.stringify(object)
            
        }).done(function(data) {
            console.log("createNewElement OK");
            return data;
        }).fail(function(data) {
            console.log("createNewElement ERROR");
            console.log(data);
            return data;
        });
    }


    function updateUser(userId, details, roles, dcmOU, doaOU, userGroups, restrictions, mode, callback) {
        $.when(getByID(USERS, userId))
        .done(function(userRes){
            if (mode == MODE_UPDATE){

                userRes.organisationUnits = userRes.organisationUnits.concat(dcmOU);
                userRes.dataViewOrganisationUnits = userRes.dataViewOrganisationUnits.concat(doaOU);
                userRes.userGroups = userRes.userGroups.concat(userGroups);
                userRes.userCredentials.userRoles = userRes.userCredentials.userRoles.concat(roles);

            } else if (mode == MODE_SET) {
                userRes.organisationUnits = dcmOU;
                userRes.dataViewOrganisationUnits = doaOU;
                userRes.userGroups = userGroups;
                userRes.userCredentials.userRoles = roles;
            } else if (mode == MODE_DELETE){

            }

            updateByID(USERS, userId, JSON.stringify(userRes), callback);
        
        });
    }



    /***************************** AUXILIARY FUNCTIONS ********************* */
    function buildAPIUrl(page, params){
        if(params!== null && params !=undefined){
		    return API_URL+page+"?"+$.param(params, true);
        } else {
		    return API_URL+page;
        }
	}