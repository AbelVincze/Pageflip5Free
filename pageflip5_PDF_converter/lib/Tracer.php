<?php
	
	/*
		Tracer() Class for PDF to Pageflip5 Converter3
		Written by Abel Vincze

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
		
		Released 24.10.28
	*/

	// LOGGING CLASS -------------------------
	
	class Tracer {
		
		private static $log = "";
		
		public static function trace( $str ) {
			self::$log .= $str;
		}
		public static function trace_r( $arg ) {
			self::trace( print_r($arg, true) );
		}
		public static function trace_arr( $title, $arr ) {
			self::trace( "$title: [ ".join( ", ", $arr )." ]\n" );
		}
		public static function trace_date( $title="time: " ) {
			self::trace( $title . date( "Y-M-d H:i:s" ) . "\n" );
		}
		public static function clear() {
			self::$log = "";
		}		
		public static function saveToFile( $file ) {
			file_put_contents ( $file , str_replace( "    ", "\t", self::$log ) );
		}
		public static function getLog() {
			return self::$log;
		}
		
	}
	
	
	// LOGGING CLASS END ---------------------
	
?>