<?php

	session_start();
	
	if( !$_SESSION["initialized"] ) {
		exit();
	}
	if( $_SESSION["validpreview"] == false || !$_SESSION["ok"] ) {
		$_SESSION["ok"] = true;
		?><!DOCTYPE><head><title>Pageflip5</title><meta http-equiv="refresh" content="1;URL=preview.php"></head><body></body></html><?php
		exit();
	}

	$_SESSION["ok"] = false;
	$dir = $_SESSION["userDirectory"]."/";
	$data = file_get_contents($dir."preview.html");
	echo $data;

?>