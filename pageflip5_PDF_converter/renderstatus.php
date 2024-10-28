<?php
	/*
		Render status for PDF to Pageflip5 Converter3
		Written by Abel Vincze

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
		
		Released 24.10.28


		This script returns the progress of a render job.	
		
	*/
	error_reporting(0);
	ini_set("display_errors", 0);
	
	require_once( 'lib/DBConnection.php' );	

	session_start();
	
	if( !$_SESSION["initialized"] ) {
		echo("-1,Session is not initialized");
		exit();
	}

	$jobID = $_POST['jobid'];	
	$cancel = $_POST['cancel'];	
	$DBConn = new DBConnection();
	
	if( $cancel=="true" ) {
		$DBConn->endRenderJob( $jobID, 1 );
		echo( "-1,Cancelled" );
	} else {
		$targetdir 	= $DBConn->getRenderJobUserDir( $jobID );
		$RenderedPages = file_get_contents( $targetdir."log/renderedpages$jobID.log" );
		echo( substr( "0,$RenderedPages" , 0, -1 ) );
	}
	
?>