<?php
if ($_GET) {
    $text = $_GET['text'];
} else {
    $text = $argv[1];
}
$command = "echo \"" . $text . "\" | awk -f /volume1/web/chemlist_completion/chemlist_completion.awk";
echo exec($command);
?>