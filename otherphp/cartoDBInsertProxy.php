<?php
session_cache_limiter('nocache');
$cache_limiter = session_cache_limiter();
function goProxy($dataURL)
{
	$baseURL = 'http://geodarcy.cartodb.com/api/v2/sql?';
	$api = '&api_key=cad54ea0c580a0c554b9e9562157e7c9bd9f37b0';
	$url = $baseURL.'q='.urlencode($dataURL).$api;
	$result = file_get_contents ($url);
	return $result;
}
?>