<?php
	session_start();
	
	if ( isset($_SESSION["initialized"]) ) {
		$_SESSION["initialized"] = $_SESSION["initialized"];
		echo "0,session updated";
	} else {
		echo "-1,0,Session Expired";
	}
?>