<?php
	/*
		Session updater for PDF to Pageflip5 Converter3
		Written by Abel Vincze

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
		
		Released 24.10.28

	*/
	session_start();
	
	if ( isset($_SESSION["initialized"]) ) {
		$_SESSION["initialized"] = $_SESSION["initialized"];
		echo "0,session updated";
	} else {
		echo "-1,0,Session Expired";
	}
?>