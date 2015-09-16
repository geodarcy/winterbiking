<?php
include '../otherphp/cartoDBInsertProxy.php';
$queryURL = $_POST['qurl'];
$return = goProxy($queryURL);
echo $return;
?>