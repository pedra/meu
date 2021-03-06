/* AJAX class
 * author http://google.com/+BillRocha
 * date:  2015/06/18
 *
 * namespace AJAX
 */

var lib = (function(){
    var a = function(Url, Method, Data){
        var url =       Url     || window.location.href,
            method =    Method  || 'POST',
            data =      Data    || {},
            response =  '',
            formdata =  new FormData(),
            node,

            onprogress = function(e){console.log(e)},
            oncomplete = function(e){console.log(e)},
            status = function(e){console.log(e)};

        //Progresss
        function progressHandler (event) {
            onprogress(Math.round((event.loaded / event.total) * 100) + "%");
        }

        //Complete
        function completeHandler (event) {
            try{
                response = JSON.parse(event.target.responseText)
            }catch(e){
                response = event.target.responseText;
            };
            formdata = new FormData();
            oncomplete(response);
        }

        //Error
        function errorHandler (event) {
            status('Failed');
        }

        //Abort
        function abortHandler (event) {
            status("Aborted");
        }

        //Public methods
        return {
            //Add File(s)
            file: function (files){
                for(var i =0; i < files.length; i++){
                    formdata.append(i, files[i]);
                }
            },

            set: {
                url: function(u){url = u},
                data: function(d){
                        data = d;
                        formdata.append('data', JSON.stringify(data));
                    },
                method: function(m){method = m},
                progress: function(f){
                    if("function" === typeof f){
                        onprogress = f;
                        return this;
                    }
                    else return false;
                },

                complete: function(f){
                    if("function" === typeof f){
                        oncomplete = f;
                        return this;
                    }
                    else return false;
                },

                status: function(f){
                    if("function" === typeof f){
                        status = f;
                        return this;
                    }
                    else return false;
                }
            },

            get: {
                url: function(){return url},
                data: function(){return data},
                method: function(){return method},
                response: function(){return response}
            },

            //Send
            send: function () {
                node = new XMLHttpRequest();
                node.upload.addEventListener("progress", progressHandler, false);
                node.addEventListener("load", completeHandler, false);
                node.addEventListener("error", errorHandler, false);
                node.addEventListener("abort", abortHandler, false);
                node.open(method, url);
                node.send(formdata);
            }
        }
    }

    var s = function(){

        var active = true,
            node = new Array(),
            sounds = {
                            'click':   1,
                            'final':   4,
                            'msgin':   3,
                            'error':   2,
                        };

        for (i in sounds) {
            node[i] = document.createElement('audio');
            node[i].setAttribute('id', 'sound_' + i);

            //check support for HTML5 audio
            if (node[i].canPlayType) {
                var sourceel = document.createElement('source');

                //attributes
                sourceel.setAttribute('src', URL+'sound/'+sounds[i]+'.mp3');
                sourceel.setAttribute('type', "audio/mpeg");
                node[i].appendChild(sourceel);

                //inserting audio in Html body
                document.body.appendChild(node[i]);

                //loading audio file
                node[i].load();
            } else {
                error("Your browser doesn't support HTML5 audio unfortunately.");
            }
        };

        function play(sound, volume) {
            if (!volume || volume > 100) volume = 1;
            else {
                volume = volume / 100;
            }

            if (!active) return false;
            if (node[sound]) {
                node[sound].volume = volume;
                node[sound].ended = true;
                node[sound].play();
            }
        }

        //mute sounds
        function mute () {
            active = false;
            stop();
        }

        //enable sounds
        function enable () {
            active = true;
        }

        //mute the sounds
        function stop () {
            for (i in node) {
                node[i].stop();
            }
        }

        return {
            play: play
        }

    }

    var uf = function(){

        var fileMaxSize = 2000000,
            reader = [],
            frls = -1,
            ZIP,
            AJAX,
            password,
            debug = false;

        function listFiles(node){
            var tm = 0,
                tb = '<table>';
            for(var i = 0; i < node.length; i++){
                tm += node[i].size;
                tb += '<tr><td>'+node[i].name+'</td><td>'+node[i].size.toLocaleString()+'</td></tr>';
            }
            if(tm > fileMaxSize) return false;
            return tb+'<tr><th>Tamanho total: </th><th>'+tm.toLocaleString()+'</th></tr>';
        }

        function sendFiles(tk, node, callback){
            //zerando contador
            frls = 0;

            for(var i = 0; i < node.files.length; i ++){
                reader[i] = new FileReader();

                //reader.readAsBinaryString(files[0]);
                reader[i].readAsArrayBuffer(node.files[i]);

                reader[i].onprogress = function(e){}
                reader[i].onloadend = function(e){
                    frls ++;
                    if(frls >= node.files.length) readerOnloadFinish(tk, node, callback);
                }
            }
        }

        //Processando cada arquivo
        function readerOnloadFinish(tk, node, callback){

            ZIP = new JSZip();

            for(var i = 0; i < node.files.length; i++){
                ZIP.file(node.files[i].name, reader[i].result);
            }
            //Zipando ...
            content = ZIP.generate({type:"base64", compression:"DEFLATE"});
            if(content.length > 2092068) return callback('O arquivo, mesmo depois de ZIPADO, ficou muito grande e não será suportado para DOWNLOAD em navegador!<br><b>Não foi enviado.</b> Tente enviar menos arquivos ou um arquivo menor.');

            content = AES.enc(content, password);

            AJAX = new lib.ajax();
            AJAX.set.url(upURL);

            AJAX.set.data({
                tk: tk,
                name: 'encripted.zip',
                type: 'send',
                size: content.length,
                file: content
            });

            AJAX.set.complete(function(data){callback(data)});
            AJAX.send();

            ZIP = null;
            reader = [];
            content = null;
        }

        return {
            fileList: function(f){return listFiles(f)},
            send: function(tk, n, callback){return sendFiles(tk, n, callback)},

            set: {
                fileMaxSize: function(v){fileMaxSize = v},
                statusElement: function(v){statusElement=v},
                password: function(v){password=v}
            },

            get: {
                fileMaxSize: function(){return fileMaxSize},
                statusElement: function(){return statusElement},
                password: function(){return password}
            }
        }

    }

    var df = function(tk, file, password, callback){

        if("string" !== typeof file) return null;

        AJAX = new lib.ajax();
        AJAX.set.url(upURL);

        AJAX.set.data({
            tk:   tk,
            name: file,
            type: 'get'
        });

        AJAX.set.complete(function(d){receiveComplete(d, callback)});
        AJAX.send();

        function receiveComplete(data, callback){
            if("object" !== typeof data) return callback('Erro no carregamento do pacote!<br>Verifique a conexão de rede.');

            content = AES.dec(data.file, password);
            if(content === false) return callback('O pacote "'+data.name+'" não pode ser desembrulhado!<br>Verifique a chave.');

            if("function" === typeof navigator.msSaveOrOpenBlob){
               navigator.msSaveOrOpenBlob(JSZip.utils.string2Blob(JSZip.base64.decode(content)), data.name+'.zip');
            } else {
                doc = window.document;
                var a = document.createElement('A');
                a.href = 'data:application/x-zip;base64,'+content;
                a.download = data.name+'.zip';
                doc.body.appendChild(a);

                _eclick(a);
            }

            callback('Arquivo carregado com sucesso!');

            ZIP = null;
            AJAX = null;
            content = null;
        }
    }


    //Public method
    return {
        ajax: a,
        sound: s,
        upload: uf,
        download: df
    }
})();


//Criando os elementos para exibir MENSAGENS
_('container').innerHTML = '<div id="msg" class="alert"></div>' + _('container').innerHTML;

//Exibe mensagens
function _msg(t, tempo){
    _('msg').innerHTML = t;
    _('msg').className = 'alert on';
    if("undefined" === typeof tempo) tempo = 2000;
    setTimeout(function(){_('msg').className = 'alert';}, tempo);
}

function _(e) {
    return document.getElementById(e);
}
function _qa(e){
    return document.querySelectorAll(e);
}

/* _GFORMAT */
function _formatTxt(txt){

    //.replace(/(<)/g, "&lt;").replace(/(>)/g, "&gt;")
    var txt = txt.trim().replace(/(<div>)/g,"").replace(/(<\/div>)/g,"").replace(/(<br>)/g,"\n").replace(/(\n)/g, "<br/>");
    //txt = txt;
    txt = _gformat(txt, "#", ['<h1>', '</h1>']);
    txt = _gformat(txt, "*", Array("<b>", "</b>"));
    txt = _gformat(txt, "-", Array("<s>", "</s>"));
    return _gformat(txt, "_", Array("<i>", "</i>"));
}
function _gformat(txt, searc, subst) {

    var init = -1;
    var fim = 0;
    var cursor = 0;
    var result = '';

    for (var i = 0; i < txt.length; i++) {
        if (txt[i] === searc && init === -1 && fim === 0)
            init = i;
        if (txt[i] === searc && init !== -1 && init < i) {
            fim = i;
            var temp = subst[0] + txt.substr((1 + init), (fim - init) - 1) + subst[1];
            result += txt.substr(cursor, (init - cursor)) + temp;

            cursor = (1 + fim);
            init = -1;
            fim = 0;
        }
    }
    if (txt.length > cursor)
        result += txt.substr(cursor, (txt.length - cursor));
    return result;
}

function _eclick(i){
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
    );
    i.dispatchEvent(e);
    i.focus();
}