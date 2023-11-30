<?php
if (!empty($_POST['data'])) {
    $data = $_POST['data'];
    $fname = "chemlist_completion.database1";
	$file = fopen("/lib/plugins/chemcompletion/" .$fname, "a");
    fwrite($file, $data);
    fclose($file);
}
?>