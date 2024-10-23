<?php
	
	/*
		Fill definitions with your database access parameters
		and Pageflip Keys generated with the online key generator:
		http://pageflip-books.com/keygen.php
		
		rename this file to settings.php
	*/
	
	// Database Access 
	define("__SERVER__",			"localhost" ); 
	define("__USERNAME__",			"username" ); 
	define("__PASSWORD__",			"password" ); 
	define("__DATABASE__",			"database" ); 
	
	// Default Copyright/Key used for generated books 
	// (can be overwritten in Export Settings while using PDF converter)
	define("__DEFAULTCOPYRIGHT__",	"©2015 pageflip-books.com" ); 
	define("__DEFAULTKEY__",		"dO20Et6TkmJwsHtrlX9tXid" ); 
	
	// Copyright/Key used for previewing books
	define("__PREVIEWCOPYRIGHT__",	"©2015 pageflip-books.com" ); 
	define("__PREVIEWKEY__",		"tO489t80O3Xm18ZSgb" ); 

	// CPU Threads used simultaneously for conversion
	// (for maximum performance do not exceed the number of available CPU threads) 
	define("__THREADS__",			4 ); 

?>