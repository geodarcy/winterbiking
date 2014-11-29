<?php
$data = $_POST['data'];
echo $data;
file_put_contents("./data/out.geojson", 'foo');
?>