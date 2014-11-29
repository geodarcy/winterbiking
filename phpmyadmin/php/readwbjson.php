<?php
$jsontext = fopen("./data/winterbiking.geojson", "r") or die("Unable to open file!);
bikeEvents =  fread($jsontext,filesize("./data/winterbiking.geojson"));
fclose($jsontext);
?>