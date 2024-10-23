<?php

	require_once( 'lib/DBConnection.php' );	

	$jobID = $_POST['jobid'];	

	// connect to database
	$DBConn = new DBConnection();
	$data 	= $DBConn->getRendered( $jobID );
	$progress = floor( ( $data["rendered"]/$data["PageCount"] )*100 );
	echo( "0,$progress" );
	
?>