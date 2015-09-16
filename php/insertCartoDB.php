<?php
$url = "https://geodarcy.cartodb.com/api/v2/sql?q=INSERT INTO winterbiking (comment) VALUES ('foo')&api_key=cad54ea0c580a0c554b9e9562157e7c9bd9f37b0";
$response = file_get_contents($url);
//print_r($response);
//print_r($info);

print "I'm here.";
?>