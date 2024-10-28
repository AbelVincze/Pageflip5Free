<?php
	/*
		Worker for PDF to Pageflip5 Converter3
		Written by Abel Vincze

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
		
		Released 24.10.28

		2015.10.03
		- fixed crop (white line on the spread's right)
	*/
	error_reporting(0);
	ini_set("display_errors", 0);

	require_once( 'lib/Tracer.php' );
	require_once( 'lib/DBConnection.php' );	

	$pdfFile		= $argv[1];
	if( !$pdfFile ) exit();			// Exit if called without args...
	
	$jobID			= $argv[2];
	$thread			= $argv[3];
	$pagetorender	= $thread;
	$pageadd		= $argv[4];
	$RQfile			= $argv[5];
	$retina			= $argv[6]? 2: 1;
	$crop			= $argv[7];
	$ss				= $argv[8];
	$preview		= $argv[9];
	$trial			= $argv[10];
	$jpgquality		= $argv[11];
	
	$threads = $pageadd;
	
	$FNB = $preview? "preview_page": "page";

	// get render queue from file	
	$RenderQueue = unserialize( file_get_contents( $RQfile ) );

	$filter = imagick::FILTER_LANCZOS;;//FILTER_HAMMING;// FILTER_CATROM;//
	
	// connect to database
	$DBConn = new DBConnection();
	$DBConn->addThreadToRenderJob( $jobID );
	
	$RJData 	= $DBConn->getRenderJobInfo( $jobID );	// Render Job DATA
	$pagecount 	= $DBConn->getRenderJobPageCount( $jobID );
	$targetdir 	= $DBConn->getRenderJobUserDir( $jobID );

	$renderDPI = $RJData["DPI"]*$ss*$retina;

						Tracer::trace( "-----------------------------------------------------------------------------\n" );
						Tracer::trace( "jobID: $jobID / " );
						Tracer::trace( "RQfile: $RQfile / " );
						Tracer::trace( "Thread: ".($thread+1)."/".$threads." / " );
						Tracer::trace( "PageCount: $pagecount\n" );
						Tracer::trace_r( $RJData );
						Tracer::trace( "Target size: " . $RJData["Width"] . "x" . $RJData["Height"] . " / " );
						Tracer::trace( "Render DPI: $renderDPI\n" );
						Tracer::trace( "JPG quality: $jpgquality\n" );
						Tracer::trace( "Trial: $trial\n" );
						Tracer::trace_date( "Start time: " );
	
	$TW = $RJData["Width"];
	$TH = $RJData["Height"];
	$thW = $RJData["thWidth"];
	$thH = $RJData["thHeight"];

	$logFile = $targetdir."log/renderedpages$jobID.log";
	
	if ( !file_exists( $logFile )) {
		$o = fopen( $logFile, 'w+');
		chmod($logFile, 0777);
		fclose($o);
	}
	
	while( $pagetorender < $pagecount ) {

		if( $DBConn->isEndedRenderJob( $jobID ) ) {
						Tracer::trace( "\nRENDER JOB CANCELED\n" );
			break;
		}

		$RQp = $RenderQueue[ $pagetorender ];
		$page = $RQp["pdfpage"];
		$mdpi = $RQp["mdpi"];

						Tracer::trace( "$pagetorender - PDFPage: $page / Rotated: " . $RQp["rotated"] . " / " );
						Tracer::trace( "Spread: " . $RQp["spread"] . " / " );
						Tracer::trace( "mDPI: $mdpi / " );

		$img = new imagick();
		$img->setResolution( $renderDPI*$mdpi, $renderDPI*$mdpi );
		$img->setOption('pdf:use-cropbox', 'true');
		
		try { $img->readImage("{$pdfFile}[$page]"); }
		catch( Exception $e ) {
						Tracer::trace( "imagick ERROR\n" );
			// On error, add pages as Error page!
			if( $RQp["spread"] ) file_put_contents ( $logFile , "Err"+$RQp["filea"]+",Err"+$RQp["fileb"]+",", FILE_APPEND );
			else file_put_contents ( $logFile , "Err"+$RQp["filea"]+",", FILE_APPEND );
			
			$pagetorender += $pageadd;
			continue;
		}
		
		$W = $img->getImageWidth();
		$H = $img->getImageHeight();
						Tracer::trace( "#Rendered: $W x $H / " );
		
		$img->setImageBackgroundColor('white');
		$img = $img->flattenImages(); 
		
		fix_color( $img );
		$img->stripImage();

		if( $ss>1 ) {
			$W = ceil( $W/$ss );
			$H = ceil( $H/$ss );
			$img->resizeImage($W,$H, $filter, 1);

						Tracer::trace( "Rensampled: $W x $H / " );
		}
		if( $RQp["rotated"] ) {
			$img->rotateImage(new ImagickPixel(), -90);
						Tracer::trace( "Rotated! / " );
		}
		
		if( $RQp["spread"] ) {
			if( isset($RQp["filea"]) ) {
						Tracer::trace( "Crop Spread A / " );
				
				$cimg = clone $img;
							// do side A
				if( $RQp["spread"]=="h" ) {
					$cimg->cropImage( floor($W/2), $H, 0, 0 );
				} else {
					$cimg->cropImage( $W, floor($H/2), 0, 0 );
				}
				$cimg->setImagePage(0, 0, 0, 0);
				renderAndSave( $cimg, $RQp["filea"], $RQp["thumba"] );
				
						Tracer::trace( "*FileA: page" . $RQp["filea"] . ".jpg / " );
				file_put_contents ( $logFile , $RQp["filea"].",", FILE_APPEND );
			}
			if( isset($RQp["fileb"]) ) {
						Tracer::trace( "Crop Spread B / " );
				
				if( $RQp["spread"]=="h" ) {
					$img->cropImage( floor($W/2), $H, $W- ceil($W/2), 0 );
				} else {
					$img->cropImage( $W, floor($H/2), 0, $H- ceil($H/2) );
				}
				$img->setImagePage(0, 0, 0, 0);
				renderAndSave( $img, $RQp["fileb"], $RQp["thumbb"] );
				
						Tracer::trace( "*FileB: page" . $RQp["fileb"] . ".jpg / " );
				file_put_contents ( $logFile ,  $RQp["fileb"].",", FILE_APPEND );
			}
		} else {
			$W = $img->getImageWidth();
			$H = $img->getImageHeight();
						Tracer::trace( "#Finaly: $W x $H / " );
			renderAndSave( $img, $RQp["filea"], $RQp["thumba"] );
						Tracer::trace( "File: page" . $RQp["filea"] . ".jpg / " );
			file_put_contents ( $logFile ,  $RQp["filea"].",", FILE_APPEND );
		}
		
		Tracer::trace_date();	
	
		// END OF PDF PAGE RENDER...
		$pagetorender += $pageadd;
		$DBConn->addToRendered( $jobID );
	}
	
	Tracer::trace( "Background Process ($thread) finished\n" );
	if( $thread > 0 ) {
		$threadsleft = $DBConn->removeThreadFromRenderJob( $jobID );
						Tracer::trace( "Threads left: $threadsleft\n" );
	} else {
		$countdown = 120;
		while( $countdown-- > 0 ) {
			$threadsleft = $DBConn->getRenderJobThreads( $jobID );
			if( $threadsleft<=1 ) {
				$DBConn->removeThreadFromRenderJob( $jobID );
						Tracer::trace( "\n*** All Background Process finished\n" );
				$DBConn->endRenderJob( $jobID, $threads );
				break;
			}
						Tracer::trace( "." );
			usleep( 1000000 );
		}
	}
	Tracer::trace_date( "End time: " );
	file_put_contents ( $targetdir."log/background$jobID.log" , str_replace( "    ", "\t", Tracer::getlog() ), FILE_APPEND );
	
	
	// FUNCTIONS ----------------------------------------------------------------
	function renderAndSave( $img, $page, $thumb=false ) {
		global $targetdir, $FNB, $retina, $TW, $TH, $thH, $jpgquality, $filter;
		
		if( $retina>1 ) {
			processImage( $img, $TW*2, $TH*2, $jpgquality );
			
			// SAVE RETINA IMAGE
			$img->writeImages( $targetdir.$FNB.$page."@2x.jpg", false);
			
			// SAVE NON RETINA
			$img->resizeImage( $TW, $TH, $filter, 1 );
			$img->stripImage();
			$img->writeImages( $targetdir.$FNB.$page.".jpg", false);
			
		} else {
			processImage( $img, $TW, $TH, $jpgquality );
			
			// SAVE IMAGE
			$img->writeImages( $targetdir.$FNB.$page.".jpg", false);
		}
		if( $thumb ) {
			// SAVE THUMBNAIL IMAGE
			$img->thumbnailImage( 0, $thH, false );
			$img->writeImages( $targetdir.$FNB.$page."_th.jpg", false );
		}
	}
	function processImage( $img, $RW, $RH, $jpgquality ) {
		global $trial;
		$W = $img->getImageWidth();
		$H = $img->getImageHeight();

		$img->cropImage( $RW, $RH, ceil(($W-$RW)/2), ceil(($H-$RH)/2) );
		$img->setImagePage(0, 0, 0, 0);
		$W = $img->getImageWidth();
		$H = $img->getImageHeight();
		Tracer::trace( "#Cropped: $W x $H / " );
		if( $W<$RW || $H<$RH ) {
			$img->extentImage( $RW, $RH, floor( ($W-$RW)/2 ), floor( ($H-$RH)/2 ) );
			Tracer::trace( "#Extent to: $RW x $RH ( ".floor( ($RW-$W)/2 ).", ".floor( ($RH-$H)/2 )." ) / " );
		}
		if( $trial ) addWatermark( $img );
		
		$img->setImageCompression(Imagick::COMPRESSION_JPEG); 
		$img->setImageCompressionQuality( $jpgquality );
		$img->stripImage();
	}
	function fix_color( $img ) {
		if( $img->getImageColorspace() == 12 ) {
			$profiles = $img->getImageProfiles('*', false); 
			// we're only interested if ICC profile(s) exist 
			$has_icc_profile = (array_search('icc', $profiles) !== false); 
			// if it doesnt have a CMYK ICC profile, we add one 
			if ($has_icc_profile === false) { 
				$icc_cmyk = file_get_contents('colorprofiles/Photoshop4DefaultCMYK.icc');
				$img->profileImage('icc', $icc_cmyk); 
				unset($icc_cmyk); 
			}
			// then we add an RGB profile 
			$icc_rgb = file_get_contents('colorprofiles/AdobeRGB1998.icc');
			try { $img->profileImage('icc', $icc_rgb); }
			catch( Exception $e ) {
				error_log("not CMYK?");
			}
			unset($icc_rgb);
		}
	}
	function getRectSize( $rect ) {
		return Array(	"left"=>	$rect[0],
						"bottom"=>	$rect[1],
						"width"=>	$rect[2]-$rect[0],
						"height"=>	$rect[3]-$rect[1] );
	}
	function addWatermark( $img ) {
		$W = $img->getImageWidth();
		$H = $img->getImageHeight();
		$watermark = new Imagick();
		$watermark->readImage("images/watermark.png");
		$wWidth = $watermark->getImageWidth();
		$wHeight = $watermark->getImageHeight();
		$x = floor(($W - $wWidth) / 2);
		$y = floor(($H - $wHeight) / 2);
		$img->compositeImage($watermark, imagick::COMPOSITE_OVER, $x, $y);
	}
?>