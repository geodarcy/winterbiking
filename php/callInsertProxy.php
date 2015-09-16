<?php
include './cartoDBInsertProxy.php';
$queryURL = $_POST['qurl'];
$return = goProxy($queryURL);
echo $return;
?>