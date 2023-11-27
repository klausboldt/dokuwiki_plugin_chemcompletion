<?php
if ($_GET) {
    $text = $_GET['text'];
} else {
    $text = $argv[1];
}
$command = "echo \"" . $text . "\" | awk -f /volume1/web/lib/plugins/chemcompletion/chemlist_completion.awk";
echo exec($command);
?>
