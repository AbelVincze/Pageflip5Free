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
	echo ( "<strong>php.ini settings (needed):</strong><br>" );
	
	echo ( "upload_max_filesize =	$upload_max_filesize (128M only for converter)<br>" );
	echo ( "post_max_size =			$post_max_size (128M only for converter)<br>" );
	echo ( "max_execution_time =	$max_execution_time (0)<br>" );
	echo ( "max_input_time =		$max_input_time (1000)<br>" );
	echo ( "max_input_vars =		$max_input_vars (300000 only for converter)<br><br>" );

/* ============================================================
   PHP PATH TEST
   ============================================================ */
	echo("<strong>PHP binary test:</strong><br>");

	$detectedPhp = null;
	$fallbackCandidates = [
		PHP_BINARY,
		PHP_BINDIR . DIRECTORY_SEPARATOR . 'php',
		'/opt/homebrew/bin/php',   // macOS Apple Silicon default
		'/usr/local/bin/php',      // macOS Intel or Linux Homebrew
		'/usr/bin/php',            // typical Linux
		'/bin/php',                // fallback
	];

	// 1) Start with the configured constant if available
	if (defined('__PHPPATH__')) {
		$phpPath = __PHPPATH__;
		echo("Configured __PHPPATH__: <code>$phpPath</code><br>");
	} else {
		$phpPath = null;
		echo("⚠️ __PHPPATH__ not defined in settings.php<br>");
	}

	// 2) Check if the configured path exists and works
	$validPhpPath = null;
	if ($phpPath && file_exists($phpPath) && is_executable($phpPath)) {
		$validPhpPath = $phpPath;
		echo("✅ Found PHP executable at <code>$phpPath</code><br>");
	} else {
		echo("❌ Configured PHP path not valid or not executable.<br>");
		echo("Searching for fallback candidates...<br>");
	}

	// 3) Try fallback candidates if needed
	if (!$validPhpPath) {
		foreach ($fallbackCandidates as $candidate) {
			if (!$candidate || !file_exists($candidate)) continue;
			if (is_executable($candidate)) {
					$validPhpPath = $candidate;
					echo("✅ Found working fallback: <code>$validPhpPath</code><br>");
					break;
			}
		}

		if (!$validPhpPath) {
			$which = @trim(shell_exec('command -v php 2>/dev/null'));
			if ($which) {
					$validPhpPath = $which;
					echo("✅ Found PHP using PATH: <code>$validPhpPath</code><br>");
			}
		}
	}

	// 4) Final result
	if ($validPhpPath) {
		echo("Set PHP binary in settings.php to: <code>$validPhpPath</code><br>");
		$out = [];
		$rcode = 0;
		exec(escapeshellarg($validPhpPath) . ' -v 2>&1', $out, $rcode);
		if ($rcode === 0) {
			echo("Output of <code>php -v</code>:<br><pre>" . implode("\n", $out) . "</pre><br>");
		} else {
			echo("⚠️ PHP binary found but failed to execute (return code $rcode)<br>");
		}
	} else {
		echo("❌ No working PHP binary found on this system.<br>");
		echo("Please update <code>__PHPPATH__</code> in settings.php to a valid PHP CLI path.<br>");
	}

	echo("<br>");

	
	echo( "<strong>ImageMagick test</strong>:<br>" );
	
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
	
	echo( "<strong>Database test:</strong><br>" );

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