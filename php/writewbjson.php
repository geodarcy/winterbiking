<?php
	$f = fopen("../data/winterbiking.geojson", 'w');
	if(flock($f, LOCK_EX)) {
		$data = $_POST['data'];
		fwrite($f, $data, 10000000);
	} else {
		echo "Could not lock file!";
	}
	fclose($f);
?>