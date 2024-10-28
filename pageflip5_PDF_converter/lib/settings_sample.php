<?php
	
	/*
		1 - Fill definitions with your database access parameters
		2 - save this file as settings.php (will be ignored by git)
	*/
	
	// Database Access 
	define("__SERVER__",			"localhost" ); 
	define("__USERNAME__",			"username" ); 
	define("__PASSWORD__",			"password" ); 
	define("__DATABASE__",			"database" ); 
	
	// Default Copyright text used for generated books 
	// (can be overwritten in Export Settings while using PDF converter)
	define("__DEFAULTCOPYRIGHT__",	"©2024 pageflip-books.com" ); 
	
	// Copyright text used for previewing books
	define("__PREVIEWCOPYRIGHT__",	"©2024 pageflip-books.com" ); 

	// CPU Threads used simultaneously for conversion
	// (for maximum performance do not exceed the number of available CPU threads) 
	define("__THREADS__",			8 ); 

?>