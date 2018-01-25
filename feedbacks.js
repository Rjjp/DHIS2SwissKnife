
/* Example format in HTML 

    <div id="theElementId" class="">
        <i class="fa "></i>
        <div></div>
    </div>

*/

    var FEEDBACK_HIDE  = 0;
    var FEEDBACK_SUCCESS  = 1;
    var FEEDBACK_WARNING  = 2;
    var FEEDBACK_ERROR  = 3;
    var FEEDBACK_INFO  = 4;
    
    var LOGO_CLASS_SUCCESS = "fa fa-check";
    var LOGO_CLASS_WARNING = "fa fa-warning";
    var LOGO_CLASS_ERROR = "fa fa-times-circle";
    var LOGO_CLASS_OTHER = "fa fa-info-circle";
    
    var COLOR_CLASS_SUCCESS = "isa_success";
    var COLOR_CLASS_WARNING = "isa_warning";
    var COLOR_CLASS_ERROR = "isa_error";
    var COLOR_CLASS_OTHER = "isa_info";
    
    function updateFeedback(condition, elt, text){
        $("#" + elt + " > i:first-of-type").removeClass(); 
        $("#" + elt ).removeClass();       
        switch (condition){
            case FEEDBACK_SUCCESS:
                $("#" + elt + " > i:first-of-type").addClass(LOGO_CLASS_SUCCESS);
                $("#" + elt ).addClass(COLOR_CLASS_SUCCESS);
        
                break;
            case FEEDBACK_WARNING:
                $("#" + elt + " > i:first-of-type").addClass(LOGO_CLASS_WARNING);
                $("#" + elt ).addClass(COLOR_CLASS_WARNING);
 
                break;
            case FEEDBACK_ERROR:
                $("#" + elt + " > i:first-of-type").addClass(LOGO_CLASS_ERROR);
                $("#" + elt ).addClass(COLOR_CLASS_ERROR);
  
                break;
            case FEEDBACK_INFO:
                $("#" + elt + " > i:first-of-type").addClass(LOGO_CLASS_OTHER);
                $("#" + elt ).addClass(COLOR_CLASS_OTHER);

                break;
        }

        if (condition == FEEDBACK_HIDE) {
            $("#" + elt).hide();
        } else {
            $("#" + elt + " > div:first-of-type").html(text);
            $("#" + elt).show();
        }
    }