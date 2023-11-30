<?php
if ($_POST['data']) {
    $file = fopen("chemlist_completion.database", "w");
    $text = $_POST['data'];
    fwrite($file, $text);
    fclose($file);
}
?>