<?php

	/*
		DBConnection() Class for PDF to Pageflip5 Converter3
		Written by Abel Vincze

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
		
		Released 24.10.28
	*/

	require_once( 'settings.php' );	
	require_once( 'Tracer.php' );	
	

	class DBConnection {

		private $conn;

		function __construct() {
			$this->db_connect();
		}
		function __destruct() {
			$this->db_close();
		}


		private function db_connect() {
			try {
				$this->conn = new PDO ( "mysql:host=".__SERVER__.";dbname=".__DATABASE__,
										__USERNAME__, __PASSWORD__ );
			} catch( PDOExeption $e ) {
				//die( "Cannot connect to server!" );
				print( "Cannot connect to server\n" );
				print( "Error code: ".$e->getCode()."\n" );
				print( "Error message: ".$e->getMessage()."\n" );
				exit(1);
			}
			
			
			$this->conn->setAttribute( PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_NUM );
	
			$sql = "CREATE TABLE IF NOT EXISTS PDFCRenderJob (
					jobID INT NOT NULL AUTO_INCREMENT, 
					PRIMARY KEY(jobID),
					
					UserDir VARCHAR(256),
					rendered SMALLINT,
					PageCount SMALLINT,
					Width SMALLINT,
					Height SMALLINT,
					thWidth SMALLINT,
					thHeight SMALLINT,
					DPI FLOAT,
					Threads TINYINT,
					finished TINYINT,
					error TINYINT,
					
					starttime DATETIME,
					endtime DATETIME
					);";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't create table PDFCRenderJob");
			}
	
			$sql = "CREATE TABLE IF NOT EXISTS pdfConverter (
					ID SMALLINT NOT NULL AUTO_INCREMENT, 
					PRIMARY KEY(ID),
					licensekey VARCHAR(20),
					serial VARCHAR(20),
					IP VARCHAR(20),
					logins SMALLINT,
					downloads SMALLINT,
					totalpages INT,
					lastaccess DATETIME
					);";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't create table pdfConverter");
			}
			
		}
		private function db_close() {
			$this->conn = NULL;
		}
		
		public function newRenderJob( $userdir, $pagecount, $width=300, $height=400, $thumbwidth=300, $thumbheight=400, $dpi=72 ) {
			Tracer::trace("New renderJob \n");
			$sql = "INSERT INTO PDFCRenderJob (
					UserDir, 
					rendered, 
					PageCount,
					Width,
					Height,
					thWidth,
					thHeight,
					DPI,
					Threads, 
					finished,
					error,
					starttime ) 
					VALUES ('$userdir', 0, $pagecount, $width, $height, $thumbwidth, $thumbheight, $dpi, 0, 0, 0, NOW() ); ";
			try {
				$this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't insert into table PDFCRenderJob");
			}
			return $this->conn->lastInsertId();
		}
		public function getRenderJobInfo( $jobID ) {
			$sql = "SELECT * FROM PDFCRenderJob WHERE jobID=$jobID;";
			try {
				$result = $this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't select from table PDFCRenderJob");
			}
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) { 
				return Array(	"jobID"				=>	$row[0],
								"UserDir"			=>	$row[1],
								"rendered"			=>	$row[2],
								"PageCount"			=>	$row[3],
								"Width"				=>	$row[4],
								"Height"			=>	$row[5],
								"thWidth"			=>	$row[6],
								"thHeight"			=>	$row[7],
								"DPI"				=>	$row[8],
								"Threads"			=>	$row[9],
								"finished"			=>	$row[10],
								"error"				=>	$row[11],
								"starttime"			=>	$row[12],
								"endttime"			=>	$row[13]	);
			}
			return false;
		}
		public function endRenderJob( $jobID, $threads=1 ) {
			
			$sql = "UPDATE PDFCRenderJob SET finished=$threads, endtime=NOW() WHERE jobID=$jobID";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't update table PDFCRenderJob");
			}

		}
		public function isEndedRenderJob( $jobID ) {
			
			$sql = "SELECT finished FROM PDFCRenderJob WHERE jobID=$jobID;";
			try {
				$result = $this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't select from table PDFCRenderJob");
			}
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) { 
				return $row[0];
			} else return 1;

		}
		public function addToRendered( $jobID ) {
			$sql = "UPDATE PDFCRenderJob SET rendered=rendered+1 WHERE jobID=$jobID;";
			$this->conn->exec( $sql ) or die("Can't update");
		}
		public function getRendered( $jobID ) {
			$sql = "SELECT rendered,PageCount FROM PDFCRenderJob WHERE jobID=$jobID;";
			try {
				$result = $this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't select from table PDFCRenderJob");
			}
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) { 
				return Array( "rendered"=>$row[0], "PageCount"=>$row[1] );
			}
			return false;
		}
		public function addThreadToRenderJob( $jobID ) {
			$sql = "UPDATE PDFCRenderJob SET Threads=Threads+1 WHERE jobID=$jobID";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't update table PDFCRenderJob");
			}
			return $this->getRenderJobThreads( $jobID );
		}
		public function removeThreadFromRenderJob( $jobID ) {
			$sql = "UPDATE PDFCRenderJob SET Threads=Threads-1 WHERE jobID=$jobID;";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't update table PDFCRenderJob");
			}
			return $this->getRenderJobThreads( $jobID );
		}
		public function getRenderJobThreads( $jobID ) {
			$sql = "SELECT Threads FROM PDFCRenderJob WHERE jobID=$jobID;";
			try {
				$result = $this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't select from table PDFCRenderJob");
			}
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) { 
				return $row[0];
			}
			return false;
		}
		public function getRenderJobPageCount( $jobID ) {
			$sql = "SELECT PageCount FROM PDFCRenderJob WHERE jobID=$jobID;";
			try {
				$result = $this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't select from table PDFCRenderJob");
			}
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) { 
				return $row[0];
			}
			return false;
		}
		public function getRenderJobUserDir( $jobID ) {
			$sql = "SELECT UserDir FROM PDFCRenderJob WHERE jobID=$jobID;";
			try {
				$result = $this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't select from table PDFCRenderJob");
			}
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) { 
				return $row[0];
			}
			return false;
		}
		private function returnSingleValueFromResult( $result ) {
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) { 
				return $row[0];
			}
			return false;
		}


		public function addLogin( $licensekey, $serial ) {
			//$licensekey = str_replace("-", "", $licensekey );
			if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
			    $ip = $_SERVER['HTTP_CLIENT_IP'];
			} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
			} else {
			    $ip = $_SERVER['REMOTE_ADDR'];
			}
			$sql = "SELECT licensekey FROM pdfConverter WHERE licensekey = '$licensekey';";
			try {
				$result = $this->conn->query( $sql );
			} catch( PDOExeption $e ) {
				die("Can't select from table pdfConverter");
			}
			if( $row = $result->fetch( PDO::FETCH_NUM ) ) {
				$sql = "UPDATE pdfConverter SET logins = logins + 1, IP = '$ip' WHERE licensekey = '$licensekey';";
				try {
					$this->conn->exec( $sql );
				} catch( PDOExeption $e ) {
					die("Can't update table pdfConverter");
				}
				$this->setAccessTime( $licensekey );
			} else {
				$sql = "INSERT INTO pdfConverter ( licensekey, serial, IP, logins, downloads, totalpages, lastaccess ) VALUES ('$licensekey', '$serial', '$ip', 1, 0, 0, NOW()  );";
				try {
					$this->conn->exec( $sql );
				} catch( PDOExeption $e ) {
					die("Can't insert into table pdfConverter");
				}
			}
		}
		public function addDownload( $licensekey ) {
			$sql = "UPDATE pdfConverter SET downloads = downloads + 1 WHERE licensekey = '$licensekey';";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't update table pdfConverter");
			}
		}
		public function addTotalPages( $licensekey, $pages ) {
			$pages = intval( $pages );
			$sql = "UPDATE pdfConverter SET totalpages = totalpages + $pages WHERE licensekey = '$licensekey';";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't update table pdfConverter");
			}
		}
		private function setAccessTime( $licensekey ) {
			$sql = "UPDATE pdfConverter SET lastaccess = NOW() WHERE licensekey = '$licensekey';";
			try {
				$this->conn->exec( $sql );
			} catch( PDOExeption $e ) {
				die("Can't update table pdfConverter");
			}
		}

	}



?>