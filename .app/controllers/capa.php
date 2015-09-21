<?php

$rq = trim(Q::rqst(1));
//if($rq == '') Q::go('');

$rq = strtolower(substr($rq, 0, 100));

Q::db()->query('SELECT  article.ID aid,
                        article.TITLE title,
                        article.SUBTITLE subtitle,
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
                    WHERE article.STATUS = 2
                    AND article.TAG = article_tag.ID
                    AND article.USER = user.ID
                    ORDER BY cat, data
                    LIMIT 20');
$r = Q::db()->result();

if($r === false){
    $title = 'Publicações';
    $a = '<h2>Nenhum artigo publicado!</h2>';
    $autor = '';
    goto cont;
}

//Listagem de artigos
$c = count($r);
$p = ($c > 1 ? 's' : '');

$a = '<table>';
$cat = '';
$cat_nu = 0;
foreach($r as $v){
    if($cat != $v->cat) {
        $a .= '<tr><th colspan="3"><h2>'.$v->cat.'</h2></th></tr>';
        $cat = $v->cat;
        $cat_nu ++;
        //$a .= '<tr><th colspan="2">Título da publicação</th><th width="20%">Autor</th></tr>';
    }
    $a .= '<tr class="top">
            <td colspan="2"><a href="'.URL.'pub/'.$v->aid.'">'.$v->title.'</a></td>
            <td width="20%"><a href="'.URL.'user/'.$v->uid.'">'.$v->uname.'</a></td>
        </tr>
        <tr class="desc">
            <td>'.$v->subtitle.'</td>
            <td>'.number_format($v->access, 0, '', '.').'</td>
            <td>'.date('d/m/Y', strtotime($v->data)).'</td>
        </tr>';
}
$a .= '</table>';

$title = 'Publicações';
$autor = '';


cont:

$d = new Lib\Doc('capa');

/* Envia o cache da renderização (anterior) - não renderizando novamente.
 *   -- Além disso o script para nesta linha [ usa exit() ].
 *      Então, descomente a linha a seguir para que o Doc produza o documento HTML.
 */
#$d->sendCache();

/* Força (ou não) a compressão dos arquivos mesmo
 *    que já exista a versão comprimida (ex.: xxx_all.js).
 */
$d->forceCompress()

//Variables
    ->val('title', 'meuJornal : '.$title)
    ->val('titulo', $title)
    ->val('autor', $autor)
    ->val('article', $a)

//Css & js file list (array or single string).
    ->insertStyles(['reset','style'])
    ->insertScripts(['main'])

/* Html file for BODY
 *   -- Não é necessário indicar o caminho e extensão: assumirá
 *      o path padrão e '.html' como extensão.
 *
 *   -- Existem as funções Doc->header() & Doc->footer().
 *      O default é 'header.html' & 'footer.html', respectivamente.
 */
    ->body('capa')

// Renderiza ou produz o documento HTML final.
    ->render()

// Envia o 'DOC' para o navegador e termina a execução do PHP (exit()).
    ->send();