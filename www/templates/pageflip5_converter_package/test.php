<?php
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
	
	exec("convert -version", $out, $rcode); //Try to get ImageMagick "convert" program version number.
	
	if( $rcode==0 ) {
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
			echo( "ImageMagick not found<br><br>" );
	}
	
	echo( "Database test:<br>" );
	$conn = mysql_connect( __SERVER__, __USERNAME__, __PASSWORD__ ) or die('Could not connect: ' . mysql_error());
			mysql_select_db( __DATABASE__ ) or die("OK, just can't select database: " . mysql_error());
			
	echo( "OK." );
	
?>