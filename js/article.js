var tmp;

window.onload = function(){

    var img = _qa('figure');
    for(var i = 0; i < img.length; i++){
        img[i].onclick = function(e){

            if(e.target.nodeName == 'FIGURE') var el = e.target;
            else if (e.target.parentElement.nodeName == 'FIGURE') var el = e.target.parentElement;

            if(el.className == 'view') el.className = ' ';
            else el.className = 'view';

            tmp = el;

            console.log(el)
        }
    }


    _('search').onkeyup = function(e){
        if(e.which == 13) return search();
    }


}

//Pula para pesquisar
function search(){
    var txt = _('search').value;
    document.location.href = URL+'pub/'+txt;
}