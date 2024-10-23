<?php
	
	/*
		
		This script returns the progress of a render job.	
		
	*/

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