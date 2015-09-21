var KEY,
    USER = false,
    FILE,
    FILENAME,
    TK = 'kECwtbFB',
    CONTENT,
    x;

window.onload = function(){

    //refView();

    // TESTE BEGIN

    FILE = new lib.upload();
    FILE.set.statusElement(_('fileList'));

    _('txtarea').onkeyup = function(e){ refView() }


    function refView(){

        formate();
        formTable();


        return;

        _('cView').innerHTML = _('txtarea').value.replace(/(\n)/ig, '').replace(/( <p>)/ig, '<p>');
        _('txtarea').value = _('txtarea').value.replace(/( <p>)/ig, '<p>');
    }




     /*   if(e.which == 13){

            setTimeout(function(){
            _('cText').innerHTML = _('cText').innerHTML.replace(/(<div>)/ig, '<p>')
                                    .replace(/(<\/div>)/ig, '</p>')
                                    .replace(/(<p><\/p>)/ig,'')
                                    .replace(/(<p><br><\/p>)/ig,'<p></p>')
                                    .replace(/(<p>&nbsp;<\/p>)/ig,'<p></p>')
                                    //.replace(/(<p><h1>)/ig, '<h1>')
                                    //.replace(/(<\/h1><\/p>)/ig, '</h1>');
                               }, 3000);
        }
    }*/

/*
    function setRange(tag){
        if("undefined" === typeof tag) tag = 'b';
        var a = document.getSelection();
        if(a.rangeCount > 0){
            var b = a.getRangeAt('text');
            if(b.endOffset > b.startOffset){
                var start = b.startOffset;
                var end = b.endOffset;

                x = b;

                //pegando conteúdo
                var content = b.commonAncestorContainer.textContent;

                var a1 = content.substring(0, start);

                var a2 = "<"+tag+">"+content.substring(start, end)+"</"+tag+">";
                var a3 = content.substring(end);

                console.log(a1+a2+a3);

                b.endContainer.parentElement.innerHTML = a1+a2+a3;
            }
        }
    }


    window.oncontextmenu = function(e){
        e.stopPropagation();

        CONTENT = e;console.log(e)
        var e = e.target;

        var a = document.getSelection();
        if(a.rangeCount > 0){
            var b = a.getRangeAt('text');
            if(b.endOffset > b.startOffset){
                var start = b.startOffset;
                var end = b.endOffset;

                x = b;

                //pegando conteúdo
                var content = b.commonAncestorContainer.textContent;

                var a1 = content.substring(0, start);

                var a2 = "<h1>"+content.substring(start, end)+"</h1>";
                var a3 = content.substring(end);

                console.log(a1+a2+a3);

                e.innerHTML = a1+a2+a3;


                //PARA SUBSTITUIR - RETIRAR FORMATAÇÃO
                e.innerHTML = e.innerHTML.replace(/(<h1>)/ig, '<b>(').replace(/(<\/h1>)/ig, ')</b>')

                //pegando i1
                //var eh = e.innerHTML;
                //var old = '<b>'+b.extractContents().textContent+'</b> ';

                //b.extractContents().textContent = "<b>FUDEU!</b>";

                //console.log(old+' | start: '+start+' | end: '+end);

                //var i1 = eh.substring(0, start);
                //var i2 = eh.substring(end);

                //e.innerHTML = i1+old+i2;

                return false;
            }
        }
    } */

    /*setInterval(function(){
        var a = document.getSelection();
        if(a.rangeCount > 0){
            var b = a.getRangeAt('text');
            if(b.endOffset > b.startOffset){
                var c = b.endContainer.textContent;
                console.log(c)

                b.endContainer.textContent = 'Fudeu!'

            }
        }


    }, 100);

*/




    _('files').onchange = function(e){
        //nenhum arquivo selecionado ?!
        if("undefined" === typeof e.target.files[0]) {
            return alert('Selecione pelo menos um arquivo.');
        }
        var l = FILE.fileList(e.target.files);
        if(l === false) l = 'Excedeu o tamanho! Escolha um arquivo menor.';
        _('fileList').innerHTML = l;
    }

    _('btSend').onclick = function(){
        if(KEY == null || KEY == '') return _msg('Você não está <b>logado</b>!');
        _('fileList').innerHTML = 'Enviando ...';

        FILE.set.password(KEY);

        FILE.send(TK, _('files'), function(data){
                _('fileList').innerHTML = '';
                _('files').files = [];

                if("string" === typeof data) return _msg(data, 10000);
                if("object" !== typeof data) return _msg('Servidor não encontrado.')
                if("undefined" === typeof data.name) return _msg('O servidor recusou o arquivo!');

                _msg('Arquivo ('+data.name+') enviado com sucesso!');
                FILENAME = data.name;
            }
        );
    }

    _('btAddFile').onclick = function(){
        _('files').files = [];
        _eclick(_('files'));
    }

    _('download').onclick = function(){
        if(FILENAME == null) return _msg('Não sei o nome do arquivo!');
        _('fileList').innerHTML = 'Carregando e decriptando.<br>Aguarde...';
        var tmp = new lib.download(TK, FILENAME, KEY, function(m){_('fileList').innerHTML = m;});
    }



    // TESTE END


    _('cadastro').onclick = function(){
        var email = _('email').value.trim();
        var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        if(!re.test(email)) return _msg('Por favor, digite um <b>e-mail</b> válido.');

        //enviando email
        AJAX = new lib.ajax();
        AJAX.set.url(URL+'sendmail');

        AJAX.set.data({mail:email});

        AJAX.set.complete(function(data){
            switch(data.ok){
                case "ok":
                    _('cad').innerHTML = '<p class="success">Enviamos um link para <b>ativação</b> de sua conta segura - verifique!</p><p class="small quiet">Veja se o nosso e-mail caiu na caixa de <b>span</b> de seu provedor de e-mail!</p>';
                    break;
                case "exist":
                    _msg('Este e-mail já está cadastrado!');
                    break;
                default:
                    _('cad').innerHTML = '<p class="error">Ocoreu um <b>erro</b> inesperado quando tentáva-mos enviar para o <b>seu e-mail!</b>.<br>Tente mais tarde, por favor.</p>';
            }
        })
        AJAX.send();
    }

    _('go').onclick = function(){

        var k = _('key').value;
        if(k == '' || k.length < 20) return _msg('A chave não foi informada!');

        var k = k.split('+');
        if("undefined" === typeof k[1]) return _msg('Chave inválida!');

        var tk = k[0];
        KEY = k[1];
        vk = AES.enc(KEY, KEY);

        AJAX = new lib.ajax();
        AJAX.set.url(URL+'login');

        AJAX.set.data({tk:tk, key:vk});

        AJAX.set.complete(function(data){
            USER = JSON.parse(AES.dec(data, KEY));

            if(USER == false) return _msg('A chave é inválida!');
            _msg('Bem vindo, '+USER.NAME+'!');
            _('cad').style.display = 'none';
        })
        AJAX.send();
    }



}


    function getImg(){
        var t1 = _('txtarea').value;
        var t2 = _('txtarea1');

        var a = [];
        var b = '';
        a = t1.match(/(\[img\]).+(\[img\])/ig);

        if(a.length != 0){

            for(var i in a){
                b += '<img src="'+a[i].replace(/(\[img\])/ig, '')+'">';
            }
        }

        console.log(b);


    }

function formate(){
    var t = _('txtarea').value
    var o = _('cView')
    var t1 = _('txtarea1')

    //retirando tags HTML
    t = t = t.replace(/(<)/g, '&lt;').replace(/(>)/g, '&gt;');

    //image ( [img] -> <img src=" "> )
    t = t.replace(/\[img\](.+)\|\|(.+)\n/ig, '<figure><img src="$1"><legend>$2</legend></figure>' )
    t = t.replace(/\[img\](.+)\n/ig, '<figure><img src="$1"></figure>' )

    //subtitulo ( # -> <h2> )
    t = t.replace(/##(.+)\n/g, '<h3>$1</h3>')

    //subtitulo ( ## -> <h3> )
    t = t.replace(/#(.+)\n/g, '<h2>$1</h2>')

    //paragrafo ( +x\n -> <p>x</p>)
    t = t.replace(/\+(.+)\n/g, '<p>$1</p>')

    //paragrafo ( ""x"" -> <blockquote>x</blockquote>)
    t = t.replace(/""(.+)\n/g, '<blockquote>$1</blockquote>')

    //subtitulo ( *x* -> <b>x</b> )
    t = t.replace(/\*\((.[^\)\*]+)\)\*/g,'<b>$1</b>'); //Funciona com "*(texto)*"
    //t = t.replace(/ \*(.[^\*]+)\*/g,' <b>$1</b>'); //Funciona com "...este *texto* aqui..."


    //subtitulo ( _x_ -> <i>x</i> )
    t = t.replace(/_\((.[^\)_]+)\)_/g,'<i>$1</i>'); //Funciona com "_(texto)_"
    //t = t.replace(/ _(.[^_]+)_/g,' <i>$1</i>'); //Funciona com "...este _texto_ aqui..."


    //subtitulo ( -x- -> <s>x</s> )
    t = t.replace(/\-\((.[^\)\-]+)\)\-/g,'<s>$1</s>'); //Funciona com "-(texto)-"
    //t = t.replace(/ \-(.[^\-]+)\-/g,' <s>$1</s>'); //Funciona com "...este -texto- aqui..."


    o.innerHTML = t;
    t1.value = t;
}

function formTable(){

    t = _('cView').innerHTML;

    var inicio = t.search(/table\(/g);
    var final = t.search(/\)table/g);

    if(inicio == -1 || final == -1) return;

    var tb = t.substring(inicio+7, final);
    if(tb.trim() == '') return;

    var l = tb.split(/\n\n/g);
    var linha = '<table>';
    var c = (l.length > 0) ? 0 : 1;
    for(var i in l){
        if(c == 0) linha += '<tr>'+l[i].replace(/(.+)/g, '<th>$1</th>')+'</tr>';
        else linha += '<tr>'+l[i].replace(/(.+)/g, '<td>$1</td>')+'</tr>';
        c++;
    }

    linha += '</table>';

    _('txtarea1').value = t.substr(0, inicio) + linha + t.substr(final+7);
    _('cView').innerHTML = t.substr(0, inicio) + linha + t.substr(final+7);
}