<?php

	session_start();
	
	if( !$_SESSION["initialized"] ) {
		exit();
	} else {
		$dir = $_SESSION["userDirectory"]."/";
		$file = $_GET["name"];
		$ext = pathinfo($file, PATHINFO_EXTENSION);
		switch( $ext ) {
			case "css": header('Content-type: text/css'); break;
			case "jpg": header('Content-Type: image/jpeg'); break;
			case "png": header('Content-Type: image/png'); break;
			case "gif": header('Content-Type: image/gif'); break;
		}
		
		readfile( $dir.$file );
		exit();
	}

?>