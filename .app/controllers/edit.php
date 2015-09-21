<?php

$rq = trim(Q::rqst(1));
$rq = strtolower(substr($rq, 0, 100));


$d = new Lib\Doc('edit');
//$d->forceCompress()

//Variables
$d->val('title', 'meuJornal : Editor')
    ->val('titulo', 'Editor')

//Css & js file list (array or single string).
    ->insertStyles(['reset','style'])
    ->insertScripts(['lib/lib','lib/aes','lib/jszip','edit'])

    ->body('edit')
    ->render()
    ->send();