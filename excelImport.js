/***********
 * 
 * This file contains function to import Excel content
 * 
 * @author Ramón José Jiménez Pomareta
 * @version 1
 * @date 19.01.2018
 * 
 * 
 * @requires 
 *  xlsx/0.11.3/xlsx.full.min.js
 *              on main 
 *          function processWorkbook(array)
 *          function notReadyToProcessWorkbook()
 */       



    
            /*jshint browser:true */
        /* eslint-env browser */
        /* eslint no-use-before-define:0 */
        /*global Uint8Array, Uint16Array, ArrayBuffer */
        /*global XLSX */
        var X = XLSX;
        var XW = {
            /* worker message */
            msg: 'xlsx',
            /* worker scripts */
            worker: './xlsxworker.js'
        };
        
        var readyToProcessWorkbook = false;

        var process_wb = (function() {

            
            var get_format = (function() {
                var radios = document.getElementsByName( "format" );
                return function() {
                    for(var i = 0; i < radios.length; ++i) if(radios[i].checked || radios.length === 1) return radios[i].value;
                };
            })();
        
            var to_array = function to_array(workbook) {
                var result = {};
                var i = 0;
                workbook.SheetNames.forEach(function(sheetName) {
                    var roa = workbook.Sheets[sheetName];
                    if(typeof roa !== 'undefined') result[i] = roa;
                    i++;
                });
                return result;
            };
        
            return function process_wb(wb) {
                if (readyToProcessWorkbook){
                    var output = to_array(wb);
                    processWorkbook(output);
                } else {
                    notReadyToProcessWorkbook();
                }

               /* for (var i = 0; i<Object.keys(output).length; i++){
                    processSheet(output[i], i);
                }*/

            };
        })();
        
        
      
       
       var do_file = (function() {
            var rABS = typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString;
            var domrabs = document.getElementsByName("userabs")[0];
            if(!rABS) domrabs.disabled = !(domrabs.checked = false);
        
            //var use_worker = typeof Worker !== 'undefined';
            var domwork = document.getElementsByName("useworker")[0];
            //if(!use_worker) domwork.disabled = !(domwork.checked = false);
        
            var xw = function xw(data, cb) {
                var worker = new Worker(XW.worker);
                worker.onmessage = function(e) {
                    switch(e.data.t) {
                        case 'ready': break;
                        case 'e': console.error(e.data.d); break;
                        case XW.msg: cb(JSON.parse(e.data.d)); break;
                    }
                };
                worker.postMessage({d:data,b:rABS?'binary':'array'});
            };
        
            return function do_file(files) {
                //use_worker = domwork.checked;
                var f = files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
                    if(typeof console !== 'undefined') console.log("onload", new Date(), rABS);
                    var data = e.target.result;
                    if(!rABS) data = new Uint8Array(data);     
                    process_wb(X.read(data, {type: rABS ? 'binary' : 'array'}));
                };
                if(rABS) reader.readAsBinaryString(f);
                else reader.readAsArrayBuffer(f);
            };
        })();
        
        function prepareExcelImport(){
            // prepares behaviour for dropping files
            (function() {
                $(".drop")
                .on("drop", function(e) {
                    e.preventDefault();
                    $(".drop").switchClass( "dropInverse", "drop");
                    if (e.currentTarget.id == "drop"){
                        do_file(e.originalEvent.dataTransfer.files);
                    }/* else if (e.currentTarget.id == "drop6"){
                        prepareFile("fileResources", e.originalEvent.dataTransfer.files[0], sendFile, associateNewFile, updateAvailableFiles);
                    }*/

                })
                .on("dragenter", function (e) {
                    e.preventDefault();
                    $(".drop").switchClass( "drop", "dropInverse");
                    e.originalEvent.dataTransfer.dropEffect = 'copy';
                })
                .on("dragleave", function (e) {
                    $(".drop").switchClass( "dropInverse", "drop");
                })            
                .on('dragover',function(e){
                    e.preventDefault();
                });
            })();
            
            // prepares behaviour for importing files
            (function() {
                var xlf = document.getElementById('import_end');
                if(!xlf.addEventListener) return;
                function handleFile(e) { 
                    do_file(e.target.files); 
                  //  $("#uploadFilesForm")[0].reset();
                }
                xlf.addEventListener('change', handleFile, false);
                
            })();
        }
