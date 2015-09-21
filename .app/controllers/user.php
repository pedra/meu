<?php

$rq = trim(Q::rqst(0));
if($rq == '') Q::go('');

$rq = strtolower(substr($rq, 0, 100));

Q::db()->query('SELECT  article.ID aid,
                        article.TITLE title,
                        article.ACCESS access,
                        user.NAME uname,
                        user.ID uid,
                        article_tag.TITLE cat,
                        (SELECT IDATE
                            FROM article_audit,
                                 article
                            WHERE article_audit.EVENT = 3
                            AND article_audit.ARTICLE = article.ID) data
                    FROM article,
                         article_tag,
                         user
                    WHERE LOWER(article.TITLE) LIKE :tl
                    AND article.STATUS = 2
                    AND article.TAG = article_tag.ID
                    AND article.USER = user.ID
                    ORDER BY article_tag.ID',[':tl'=>'%'.$rq.'%']);
$r = Q::db()->result();

//Listagem de artigos
$c = count($r);
$p = ($c > 1 ? 's' : '');
if($r !== false && $c > 1){
    $a = '<table>';
    $cat = '';
    $cat_n = 0;
    foreach($r as $v){
        if($cat != $v->cat) {
            $a .= '<tr><th colspan="3"><h2>'.$v->cat.'</h2></th></tr>';
            $cat = $v->cat;
            $cat_nu ++;
            $a .= '<tr><th>Artigo</th><th>Autor</th><th>Lido</th></tr>';
        }
        $a .= '<tr><td><a href="'.URL.'article/'.$v->aid.'">'.$v->title.'</a></td><td><a href="'.URL.'user/'.$v->uid.'">'.$v->uname.'</a></td><td>'.$v->access.'</td</tr>';
    }
    $a .= '</table>';

    $title = 'Resultado de pesquisa';
    $autor = 'Encontrado'.$p.' '.$c.' artigo'.$p.' em '.$cat_nu.' categoria'.($cat_nu > 1 ? 's' : '');
}






$d = new Lib\Doc('user');

/* Envia o cache da renderização (anterior) - não renderizando novamente.
 *   -- Além disso o script para nesta linha [ usa exit() ].
 *      Então, descomente a linha a seguir para que o Doc produza o documento HTML.
 */
//$d->sendCache();

/* Força (ou não) a compressão dos arquivos mesmo
 *    que já exista a versão comprimida (ex.: xxx_all.js).
 */
$d->forceCompress();

//Variables
$d->val('title', 'meuJornal : '.$title)
    ->val('titulo', $title)
    ->val('autor', $autor)
    ->val('article', $a)
    ->jsvar('upURL', URL.'upfile/')

//Css & js file list (array or single string).
    ->insertStyles(['reset','style'])
    ->insertScripts(['lib/lib','lib/aes','lib/jszip','user'])

/* Html file for BODY
 *   -- Não é necessário indicar o caminho e extensão: assumirá
 *      o path padrão e '.html' como extensão.
 *
 *   -- Existem as funções Doc->header() & Doc->footer().
 *      O default é 'header.html' & 'footer.html', respectivamente.
 */
    ->body('user')

// Renderiza ou produz o documento HTML final.
    ->render()

// Envia o 'DOC' para o navegador e termina a execução do PHP (exit()).
    ->send();