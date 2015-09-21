<?php

$rq = trim(Q::rqst(1));
$rq = strtolower(substr($rq, 0, 100));

Q::db()->query('SELECT  article.ID aid,
                        article.TITLE title,
                        article.SUBTITLE subtitle,
                        article.LOCAL local,
                        article.ACCESS access,
                        user.NAME uname,
                        user.ID uid,
                        article_tag.TITLE cat,
                        (SELECT IDATE
                            FROM article_audit,
                                 article
                            WHERE article_audit.EVENT = 3
                            AND article_audit.ARTICLE = article.ID
                            AND article_audit.ARTICLE = aid) data
                    FROM article,
                         article_tag,
                         user
                    WHERE (LOWER(article.TITLE) LIKE :tl OR article.ID = :aid)
                    AND article.STATUS = 2
                    AND article.TAG = article_tag.ID
                    AND article.USER = user.ID
                    ORDER BY cat, data
                    LIMIT 20',[':tl'=>'%'.$rq.'%', ':aid'=>$rq]);
$r = Q::db()->result();

$d = new Lib\Doc('article');

if($r === false){
    $result = '<h2>Nenhum resultado encontrado para a pesquisa!</h2>
    <p class="quiet">Tente de novo!</p>
    <input type="text" id="search" placeholder="search ... " size="40"/><button id="btSearch" onclick="search()">></button>
    <p>Para ver uma listagem de <b>todas</b> as publicações clique em "Publicações" no menu superior.</p>';

    //Variables
    $d->val('title', 'meuJornal : Publicações')
      ->val('titulo', 'Publicações')
      ->val('result', $result)
      ->insertStyles(['reset','style'])
      ->insertScripts(['lib','article'])
      ->body('search')
      ->render()
      ->send();
}

//Listagem de artigos
$c = count($r);

if($c > 1){
    $p = ($c > 1 ? 's' : '');
    $result = '<div class="result">';
    $cat = '';
    $cat_nu = 0;
    foreach($r as $v){
        if($cat != $v->cat) {
            $result .= '<h2>'.$v->cat.'</h2>';
            $cat = $v->cat;
            $cat_nu ++;
        }
        $date = strtotime($v->data);
        $result .= '<a href="'.URL.'pub/'.$v->aid.'"><div>'.$v->title.'<span>'.$v->subtitle.'<br><b>::</b> '.$v->uname.' em '.date('j/m/Y\&\n\b\s\p\;H\hi', $date).'</span></div></a>
        ';
    }
    $result .= '</div>';
    $resumo = 'Encontrado'.$p.' '.$c.' artigo'.$p.' em '.$cat_nu.' categoria'.($cat_nu > 1 ? 's' : '');

    //Variables
    $d->val('title', 'meuJornal : Publicações')
      ->val('titulo', 'Publicações')
      ->val('result', $result)
      ->val('resumo', $resumo)
      ->insertStyles(['reset','style'])
      ->insertScripts(['lib','article'])
      ->body('search')
      ->render()
      ->send();

} else {

    $r = $r[0];

    Q::db()->query('SELECT CONTENT FROM article_content WHERE ID = :aid',[':aid'=>$r->aid]);
    $c = Q::db()->result();

    Q::db()->query('SELECT LINK, TITLE
                            FROM article_fonte
                            WHERE ARTICLE = :aid',[':aid'=>$r->aid]);
    $ref = Q::db()->result();

    $title = $r->title;
    $subtitle = '<blockquote>'.$r->subtitle.'</blockquote>';
    $date = strtotime($r->data);
    $autor = '<a href="'.URL.'user/'.$r->uid.'">'.$r->uname.'</a><span class="local">'.$r->local.'</span><span>'
                ._dia(date('w', $date)).', '.date('j', $date).' de '._mes(date('n', $date)).' de '.date('Y', $date).' às '.date('H\hi', $date).'</span>';

    $fonte = '<ul>';
    if($ref !== false){
        foreach($ref as $k=>$rf){
            $fonte .= '<li>'.'Fonte ['.($k+1).']: <a href="'.$rf->LINK.'">'.$rf->TITLE.'</a></li>';
        }
    }
    $fonte .= '</ul>';

    $page1 = str_replace('<x:url/>', URL, $c[0]->CONTENT);
    $page2 = str_replace('<x:url/>', URL, $c[1]->CONTENT);

    $d->val('title', 'meuJornal : Publicações')
      ->val('titulo', 'Publicações')
      ->val('subtitle', $subtitle)
      ->val('autor', $autor)
      ->val('fonte', $fonte)
      ->val('page1', $page1)
      ->val('page2', $page2);

    $d->forceCompress();

    //Variables
    $d->val('title', 'meuJornal : '.$title)
      ->val('titulo', $title)

    //Css & js file list (array or single string).
      ->insertStyles(['reset','style'])
      ->insertScripts(['lib/lib','article'])

    // Html file for BODY
      ->body('article')

    // Renderiza ou produz o documento HTML final.
      ->render()

    // Envia o 'DOC' para o navegador e termina a execução do PHP (exit()).
      ->send();
}