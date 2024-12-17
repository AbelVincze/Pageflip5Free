<?php
	/*
		Testing the environement for PDF to Pageflip5 Converter3
		Written by Abel Vincze

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
		
		Released 24.10.28

	*/
	error_reporting(1);
	ini_set("display_errors", 0);
	
	require_once( 'lib/settings.php' );	

	// Testing 
	$upload_max_filesize =		ini_get("upload_max_filesize");
	$post_max_size =			ini_get("post_max_size");
	$max_execution_time =		ini_get("max_execution_time");
	$max_input_time =			ini_get("max_input_time");
	$max_input_vars =			ini_get("max_input_vars");

	echo ( "Checking environment for running PDF to Pageflip5 converter and API<br><br>" );
	echo ( "php.ini settings (needed):<br>" );
	
	echo ( "upload_max_filesize =	$upload_max_filesize (128M only for converter)<br>" );
	echo ( "post_max_size =			$post_max_size (128M only for converter)<br>" );
	echo ( "max_execution_time =	$max_execution_time (0)<br>" );
	echo ( "max_input_time =		$max_input_time (1000)<br>" );
	echo ( "max_input_vars =		$max_input_vars (300000 only for converter)<br><br>" );
	
	echo( "ImageMagick test:<br>" );
	
	exec("magick -version", $out, $rcode); //Try to get ImageMagick "convert" program version number.
	
	if ($rcode==0) {
		echo("convert -version output:<br><pre>");
		print_r(implode("\n", $out));
		echo("</pre><br>");

		if(class_exists('Imagick')) {
			echo "Imagick class is available.<br>";

			try {
				$img = new imagick();
				echo( "imagick installed.<br>" );
			}
			catch( Exception $e ) {
				echo( "imagick ERROR<br>" );
			}
			try {
				$ver = imagick::getVersion();
				echo( "imagick version: ".$ver["versionString"]."<br>" );
				echo( "(needed version 6.7 or newer)<br><br>" );
			}
			catch( Exception $e ) {
				echo( "imagick version ERROR<br><br>" );
			}
		} else {
			echo( "ImageMagick Class not found, imagick.so extension is not installed<br><br>" );	
		}
	} else {
		echo( "ImageMagick not found<br><br>" );
	}
	
	echo( "Database test:<br>" );

	try {
		$conn = new PDO ( "mysql:host=".__SERVER__.";dbname=".__DATABASE__, __USERNAME__, __PASSWORD__ );
	} catch( PDOExeption $e ) {
		print( "Cannot connect to server\n" );
		print( "Error code: ".$e->getCode()."\n" );
		print( "Error message: ".$e->getMessage()."\n" );
		exit(1);
	}
			
	echo( "OK." );
	
?>