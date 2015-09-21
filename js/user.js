var KEY,
    USER = false,
    FILE,
    FILENAME,
    TK = 'kECwtbFB',
    CONTENT;

window.onload = function(){

    // TESTE BEGIN

    FILE = new lib.upload();
    FILE.set.statusElement(_('fileList'));




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