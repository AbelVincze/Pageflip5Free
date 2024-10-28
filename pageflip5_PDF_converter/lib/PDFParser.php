<?php
	
	/*
		PDFParser() Class for PDF to Pageflip5 Converter3
		Written by Abel Vincze 2014/11/05

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
	
		2015.10.02
		- fixed crop-box rendering
		- page size round
		- fixed upper case links...
		
		2016.05.05
		- fixed something which caused the page link not to recognized:
			strtolower($prop)!!! line 825!

		2024.10.26
		- fixed handling annotations not stored correctly in an array
		- removed license handling as this sowftware became free
		
	*/
	
	// the tracing module
	require_once( 'Tracer.php' );

	// PDFPARSER CLASS ------------------------------------------------------------------------------
	
	class PDFParser {
		
		private $log = "";				// log text
		private $showObjs = true;		// show objects array in the log
		//private $echolog = false;
		private $logtofile;				// log to file?
		private $logfile;				// the log file path/name
		private $tempArr;				
		
		// ez tartalmazza a feldolgozott adatokat!
		private $pdfData;
		
		function __construct( $logfile=null ) {
			if( $logfile ) {
				$this->logtofile = true;
				$this->logfile = $logfile;
			}
		}
		function __destruct() {
		}
		
		// PDF PARSING CODE -------------------------------------------------------------------------
		
		// THE PARSE CODE -> $objArray
		private function getPDFobjects( $file ) {
			// parse pdf (collect obj data only) and put it in an array!!!
			ini_set("auto_detect_line_endings", true);
	
			if( !file_exists($file) ) return null;
			if( !$fp = @fopen($file,"r") ) return null;
	
			$isStream = false;
			$isObj = false;
			$isProp = false;
			$isRoot = false;
			$bl = 4096;
			$isArray = false;
			#$isObjStm = false;
			$objCode = "";
			$data = "";
			$objArray = Array();
			$objStmArray = Array();

			// start parsing the pdf document for objects/stmobj/and text contents...
			while( !feof($fp) ) {
				#if( !$isObjStm ) $line = fgets($fp,$bl);
				#else $isObjStm = false;
				$lines = explode( "\r", fgets($fp,$bl) );
				
				for( $subline = 0; $subline<count( $lines ); $subline++ ) {
					$line = $lines[ $subline ];
				
					$full = (strlen($line)==$bl-1);
					$line = trim($line);
					$nl = false;
					$isRoot = false;
					
					if( $isStream==false ) {
										Tracer::trace("--LINE--$line--ENDLINE--\n");
						if( !$isObj ) {
							$pos = strpos( $line, "obj" );
							if( $pos !== false ) {								// obj kezdodik...
								$isObj = true;
								
								$objCode = trim( substr( $line, 0, $pos ) );
								$data = "";
										Tracer::trace( "  OBJ [$objCode]\n" );
								$line = trim( substr( $line , $pos+3 ) );
							}
						}
						if( substr( $line, 0, 2 ) == "<<" ) {					// azert van itt kint mert nem biztos hogy obj-ben van
							$isProp = true;
							if( !$isObj ) $isRoot = true;
							$line = trim( substr( $line, 2 ) );
						}
						if( $isObj ) {
							$pos = strpos( $line, "stream" );
							if( $pos === 0 || substr( $line, -6 ) == "stream" ) {				// ha stream, akkor figyelmen kivul hagyjuk....
							//if( substr( $line, -6 ) == "stream" ) {				// ha stream, akkor figyelmen kivul hagyjuk....
								$isStream = true;
								$line = trim( substr( $line, 0, $pos ) );
								//$line = trim( substr( $line, 0, -6 ) );
							//*			
								// itt kell figyelni az objstm -et, mert akkor kell a steam data!!!
								//if( strpos( $line, "ObjStm" ) !== false ) {		// Kiveve ha ObjStm, mert az fontos nekunk!!!!
									//$isObjStm = true;
									
									// /Filter/FlateDecode/First 87/Length 514/N 11/Type/ObjStm
									//$pos = strpos( $line, "ObjStm" )
								if( strpos( $line, "ObjStm" ) !== false ) {		// Kiveve ha ObjStm, mert az fontos nekunk!!!!
									
									$osl = $this->getV( $line, "/length" );		// length of the object stream
									$osf = $this->getNV( $line, "/filter" );	// Filter
									$oss = $this->getV( $line, "/first" );		// first object start
									$osn = $this->getV( $line, "/n" );			// Number of embedded objects.
										Tracer::trace( "\n!!!OBJSTM!!!");
									
										Tracer::trace( "\nLength: $osl");
										Tracer::trace( "\nFilter: $osf\n");
										Tracer::trace( "\nN:      $osn");
										Tracer::trace( "\nFirst:  $oss");
									
									
									$objstm = substr( fread($fp, $osl+1), 1 );
									//$objStmArray[] = $objstm;
									
									if( $osf == "FlateDecode" ) {
										$dobjstm = @gzuncompress($objstm);
										Tracer::trace( "\nDECODED: $dobjstm\nEND DECODED DATA\n");
									}
										
								//if( strpos( $line, "ObjStm" ) !== false ) {		// Kiveve ha ObjStm, mert az fontos nekunk!!!!
									$osl = strlen( $dobjstm );
									//	Tracer::trace( "\n****$objstm**** ".strlen( $objstm )."\n\n" );
										//Tracer::trace( "\n****\n$dobjstm\n ".strlen( $dobjstm )."****\n\n" );
									
									// Now parse the objstm
									
									$osdata = substr( $dobjstm, 0, $oss );
										//Tracer::trace( "\nObjStm data: $osdata\n");
										
									$osdata = $this->dataexplode( $osdata );
										//Tracer::trace_r( $osdata );
									
									for( $i=0; $i<count( $osdata ); $i+=2 ) {
										$osobj = $osdata[$i]." 0";
										$osobjlength = isset( $osdata[$i+3] )? $osdata[$i+3]-$osdata[$i+1]: $osl-$osdata[$i+1];
										//$oss += $osdata[$i+1];
										$ossp = $oss + $osdata[$i+1];
										//	Tracer::trace( "Length ".$osobjlength."\n" );
										//	Tracer::trace( "Counter ".$ossp."\n" );
										$osobjdata = substr( $dobjstm, $ossp, $osobjlength );
										//	Tracer::trace( "OBJ [$osobj]\n$osobjdata\n" );
										
										
										$osobjdata = trim( $osobjdata );
										if( substr( $osobjdata, 0, 2 ) == "<<" ) {
											$objArray[ $osobj ] = substr( $osobjdata, 2, strlen( $osobjdata )-4 );
										} else {
											$objArray[ $osobj ] = $osobjdata;
										}
	
									}
									
							//	} else {
							//			Tracer::trace( "\nTRY DECODING AS TEXT\n");
								}
							//*/		
							}
							if( substr( $line, -6 ) == "endobj" ) {				// ha vege az obj-nak akkor vege a streamnek is:)
								$isProp = $isObj = false;
								$line = trim( substr( $line, 0, -6 ) );
								$nl = true;
							}
	
							if( !$isArray && substr( $line, 0, 1 )=="[" ) {		// Array
								$isArray = true;
							}
							if( $isArray && substr( $line, -1 )=="]" ) {		// Array vege...
								$isArray = false;
							}
	
							if( substr( $line, -2 ) == ">>" ) {					// vege a properties-nek, obj-n belul
								$isProp = false;
								$line = trim( substr( $line, 0, -2 ) );
							}
										if( $line ) { Tracer::trace( "  $line\n" ); }
							$data .= $line." ";
							/*if( $isArray ) {	//&& !$full ) { 
								$data .= " ";
								//Tracer::trace( " " );
							}*/
						} else {
							
							if( $isProp ) {
		
								if( substr( $line, -2 ) == ">>" ) {
									$isProp = false;
									//$isPropEnd = true;
									$line = trim( substr( $line, 0, -2 ) );
									$nl = true;
								}
								if( $isRoot ) {
										Tracer::trace( "  ROOT: ");
									$objCode = "root";
									$data = "";
								}
										Tracer::trace( $line );
								$data .= $line." ";
							}
						}
						if( $nl ) {
							//$finaldata = strtolower( trim( $data ) );
							$finaldata = trim( $data );
							$objArray[ $objCode ] = $finaldata;
										Tracer::trace( "--FINALDATA--$finaldata--ENDFINALDATA--\n" );
										Tracer::trace( "------------------------------------------------------------------------------------------\n" );
						}
					}
					if( substr( $line, -9 ) == "endstream" ) $isStream = false;
				}
			}
			fclose($fp);
			return $objArray;
		}
		private function getPDFtexts( $file, $pObjArray, $contentObjects ) {
			// parse pdf (collect obj data only) and put it in an array!!!
			//return false;
			
			ini_set("auto_detect_line_endings", true);
	
			if( !file_exists($file) ) return null;
			if( !$fp = @fopen($file,"r") ) return null;
	
			$isStream = false;
			$isObj = false;
			$isProp = false;
			$isRoot = false;
			$bl = 4096;
			$isArray = false;
			#$isObjStm = false;
			$objCode = "";
			$data = "";
			$objArray = Array();
			$objStmArray = Array();

			// start parsing the pdf document for objects/stmobj/and text contents...
			while( !feof($fp) ) {
				#if( !$isObjStm ) $line = fgets($fp,$bl);
				#else $isObjStm = false;
				$lines = explode( "\r", fgets($fp,$bl) );
				
				for( $subline = 0; $subline<count( $lines ); $subline++ ) {
					$line = $lines[ $subline ];
				
					$full = (strlen($line)==$bl-1);
					$line = trim($line);
					$nl = false;
					$isRoot = false;
					
					if( $isStream==false ) {
										//Tracer::trace("--LINE--$line--ENDLINE--\n");
						if( !$isObj ) {
							$pos = strpos( $line, "obj" );
							if( $pos !== false ) {								// obj kezdodik...
								$isObj = true;
								
								$objCode = trim( substr( $line, 0, $pos ) );
								$data = "";
								//		Tracer::trace( "  OBJ [$objCode]\n" );	// ******
								$line = trim( substr( $line , $pos+3 ) );
																
							}
						}
						/*if( substr( $line, 0, 2 ) == "<<" ) {					// azert van itt kint mert nem biztos hogy obj-ben van
							$isProp = true;
							if( !$isObj ) $isRoot = true;
							$line = trim( substr( $line, 2 ) );
						} */
						if( $isObj ) {
							// akkor itt nezzuk meg hogy az oldalunkrol van-e szo!
							
							$found = false;
							$foundPageNumber;
							for( $i=0; $i<count($contentObjects); $i++ ) {
								if( $objCode == $contentObjects[$i]) {
									$found = true;
									$foundPageNumber = $i;
									break;
								}
							}

							$pos = strpos( $line, "stream" );
							if( $pos === 0 || substr( $line, -6 ) == "stream" ) {	// ha stream es oldal, akkor nezzuk a content-et!
								$isStream = true;
								$line = trim( substr( $line, 0, $pos ) );
								//$line = trim( substr( $line, 0, -6 ) );
						//*			
								// itt kell figyelni az objstm -et, mert akkor kell a steam data!!!
						//		if( strpos( $line, "ObjStm" ) !== false ) {		// Kiveve ha ObjStm, mert az fontos nekunk!!!!
									//$isObjStm = true;
									
									// /Filter/FlateDecode/First 87/Length 514/N 11/Type/ObjStm
									//$pos = strpos( $line, "ObjStm" )
								//if( strpos( $line, "ObjStm" ) !== false ) {		// Kiveve ha ObjStm, mert az fontos nekunk!!!!
								if( $found ) {
									
									$oline = $pObjArray[ $objCode ];
									
									$osl = $this->getR( $oline, "/length" );
									if( $osl===false ) $osl = $this->getV( $oline, "/length" );		// length of the object stream
									else $osl = $pObjArray[ $osl ];//*/
								//	$osl = $this->getV( $line, "/length" );
									$osf = $this->getNV( $oline, "/filter" );	// Filter
								//	$oss = $this->getV( $line, "/first" );		// first object start
								//	$osn = $this->getV( $line, "/n" );			// Number of embedded objects.
										Tracer::trace( "\n!!!Content Stream for page $foundPageNumber!!!");
									
										Tracer::trace( "\nline [$objCode]: $line");
										Tracer::trace( "\nLength: $osl");
										Tracer::trace( "\nFilter: $osf\n");
										//Tracer::trace( "\nN:      $osn");
										//Tracer::trace( "\nFirst:  $oss");
									
									
									$objstm = substr( fread($fp, $osl+1), 1 );
									//$objStmArray[] = $objstm;
									
									if( $osf == "FlateDecode" ) {
										$dobjstm = @gzuncompress($objstm);
										//Tracer::trace( "\nDECODED: $dobjstm\nEND DECODED DATA\n");
									}
									
									if( $dobjstm ) {
										if (preg_match_all("#BT(.*)ET#ismU", $dobjstm, $textContainers)) {
											$textContainers = @$textContainers[1];
											//getDirtyTexts($texts, $textContainers);
											Tracer::trace_arr( "dirty text",	$textContainers );
										}
										Tracer::trace( "------------------------------------------------------------------------------------------\n" );
									}
									
								//if( strpos( $line, "ObjStm" ) !== false ) {		// Kiveve ha ObjStm, mert az fontos nekunk!!!!
									//$osl = strlen( $dobjstm );
									//	Tracer::trace( "\n****$objstm**** ".strlen( $objstm )."\n\n" );
										//Tracer::trace( "\n****\n$dobjstm\n ".strlen( $dobjstm )."****\n\n" );
									
									// Now parse the objstm
									
								/*	$osdata = substr( $dobjstm, 0, $oss );
										//Tracer::trace( "\nObjStm data: $osdata\n");
										
									$osdata = $this->dataexplode( $osdata );
										//Tracer::trace_r( $osdata );
									
									for( $i=0; $i<count( $osdata ); $i+=2 ) {
										$osobj = $osdata[$i]." 0";
										$osobjlength = isset( $osdata[$i+3] )? $osdata[$i+3]-$osdata[$i+1]: $osl-$osdata[$i+1];
										//$oss += $osdata[$i+1];
										$ossp = $oss + $osdata[$i+1];
										//	Tracer::trace( "Length ".$osobjlength."\n" );
										//	Tracer::trace( "Counter ".$ossp."\n" );
										$osobjdata = substr( $dobjstm, $ossp, $osobjlength );
										//	Tracer::trace( "OBJ [$osobj]\n$osobjdata\n" );
										
										
										$osobjdata = strtolower( trim( $osobjdata ) );
										if( substr( $osobjdata, 0, 2 ) == "<<" ) {
											$objArray[ $osobj ] = substr( $osobjdata, 2, strlen( $osobjdata )-4 );
										} else {
											$objArray[ $osobj ] = $osobjdata;
										}
	
									}
								*/
									
							//	} else {
							//			Tracer::trace( "\nTRY DECODING AS TEXT\n");
								}
							//*/		
							}
							if( substr( $line, -6 ) == "endobj" ) {				// ha vege az obj-nak akkor vege a streamnek is:)
								$isProp = $isObj = false;
								$line = trim( substr( $line, 0, -6 ) );
								$nl = true;
							}
	
							if( !$isArray && substr( $line, 0, 1 )=="[" ) {		// Array
								$isArray = true;
							}
							if( $isArray && substr( $line, -1 )=="]" ) {		// Array vege...
								$isArray = false;
							}
	
							if( substr( $line, -2 ) == ">>" ) {					// vege a properties-nek, obj-n belul
								$isProp = false;
								$line = trim( substr( $line, 0, -2 ) );
							}
							//			if( $line ) { Tracer::trace( "  $line\n" ); }
							$data .= $line." ";
							if( $isArray ) {	//&& !$full ) { 
								$data .= " ";
								//Tracer::trace( " " );
							}
						} else {
							
							if( $isProp ) {
		
								if( substr( $line, -2 ) == ">>" ) {
									$isProp = false;
									//$isPropEnd = true;
									$line = trim( substr( $line, 0, -2 ) );
									$nl = true;
								}
								if( $isRoot ) {
									//	Tracer::trace( "  ROOT: ");
									$objCode = "root";
									$data = "";
								}
									//	Tracer::trace( $line );
								$data .= $line." ";
							}
						}
						if( $nl ) {
							//$finaldata = strtolower( trim( $data ) );
							//$finaldata = trim( $data );
							//$objArray[ $objCode ] = $finaldata;
							//			Tracer::trace( "--FINALDATA--$finaldata--ENDFINALDATA--\n" );
							//			Tracer::trace( "------------------------------------------------------------------------------------------\n" );// ******
						}
					}
					if( substr( $line, -9 ) == "endstream" ) $isStream = false;
				}
			}
			fclose($fp);
			return $objArray;
		}
		// GET all needed information from the $objArray
		public function parsePDF( $pdfFile ) {
			$this->pdfData = $this->PDFparser( $pdfFile );
			if( $this->pdfData === false ) Tracer::trace( "\nParse error" );
			Tracer::trace( "\n\nTHE END");
			//if( $this->echolog ) echo( $this->log );
			if( $this->logtofile ) 	Tracer::saveToFile( $this->logfile );
			
			//print_r( $this->pdfData );
			return $this->pdfData;
		}
		private function PDFparser( $pdfFile ) {
									Tracer::trace( "Parse PDF\n\n" );
			$maxlinks = 0;
			$pagelinks = 0;
			$urllinks = 0;
			$spreads = 0;
			$rotatedpages = 0;
			
			$pageOrder = Array();
			// First parse the PDF to retrieve all obj inside it...
			$objArray = $this->getPDFobjects( $pdfFile );					// Parse the PDF file
			
									//Tracer::trace_r( $objArray );
			
			// $objArray is a named array with all the objects, referenced by the obj Code (ex: 1423 0)
			if( count( $objArray )==0 ) return false;			// Exits if no content...
									if( $this->showObjs ) Tracer::trace_r( $objArray );
									//Tracer::trace( "\n\nParse root object: ");
			//$catalog = $this->getR( $objArray["root"], "root" );		// find the catalog
			//findfirstObjWithAttr( $objArray, "root" );
			//if( $catalog === false ) {							// if not present in root, just search for it.
									//Tracer::trace("\nroot doesn't contains reference to pages, try to find catalog ");
				$catalog = $this->findfirstObjWithAttr( $objArray, "type/catalog" );
				if( $catalog === false ) $catalog = $this->findfirstObjWithAttr( $objArray, "type /catalog" );
				if( $catalog === false ) {							// not found then nothing to do... sorry
									Tracer::trace( "\nCatalog not found, is it a PDF?" );
					return false;
				}
			//}
									Tracer::trace( ">$catalog<\n" );
									Tracer::trace( $objArray[ $catalog ]."\n" );
									Tracer::trace( "\nPages root: ");
			$pagesRoot = $this->getR( $objArray[ $catalog ], "pages" );		
									if( $pagesRoot !== false ) Tracer::trace( ">$pagesRoot<" );
			if( $objArray[ $pagesRoot ] ) {
									Tracer::trace( "\n".$objArray[ $pagesRoot ]."\n" );
									//Tracer::trace( "\n".$this->getRArray( $objArray[ $pagesRoot ], "kids" ) );
									//Tracer::trace_r( $this->getRArray( $objArray[ $pagesRoot ], "kids" ) );
				$maxpage = $this->getV( $objArray[ $pagesRoot ], "count" );
				/*
					MediaBox
					ArtBox
					BleedBox
					CropBox
					TrimBox
				*/
				$defmediabox =	$this->getVArray( $objArray[ $pagesRoot ], "mediabox" );
			//	$defartbox =	$this->getVArray( $objArray[ $pagesRoot ], "artbox" );
			//	$defbleedbox =	$this->getVArray( $objArray[ $pagesRoot ], "bleedbox" );
				$defcropbox =	$this->getVArray( $objArray[ $pagesRoot ], "cropbox" );
			//	$deftrimbox =	$this->getVArray( $objArray[ $pagesRoot ], "trimbox" );
			//					if( isset($defmediabox) )	Tracer::trace_arr( "default mediabox",	$defmediabox );
			//					if( isset($defartbox) )		Tracer::trace_arr( "default artbox",	$defartbox );
			//					if( isset($defbleedbox) )	Tracer::trace_arr( "default bleedbox",	$defbleedbox );
			//					if( isset($defcropbox) )	Tracer::trace_arr( "default cropbox",	$defcropbox );
			//					if( isset($deftrimbox) )	Tracer::trace_arr( "default trimbox",	$deftrimbox );
				// itt rekurziv felsorakoztatni a lapokat...
				$pageOrder = $this->getPageOrderFromPagesRoot( $objArray, $pagesRoot );
				if( $pageOrder === false ) {
									Tracer::trace( "\nPage Order can't be retrived from Pages root (Catalog)...\n");
					return false;
				} else {
									Tracer::trace_r( $pageOrder );
				}
				if( count( $pageOrder ) != $maxpage ) {
									Tracer::trace( "\nPage number in the catalogue doesn't match with Page count -> Fix Count\n");
					$maxpage = count( $pageOrder );
				} else {
									Tracer::trace( "\nEverything is perfect!\n" );
				}
			} else {
									Tracer::trace( "\nPages root doesn't exists, we try to build pages order from scratches...\n");
									//Tracer::trace_r( $this->findAllPage( $objArray ) );
				$pages = $this->findAllPage( $objArray );
				$maxpage = count( $pages );
				//Tracer::trace_r( $pages );
				foreach ($pages as $objCode ) {
					//Tracer::trace( " structparents: ".$this->getV( $objArray[ $objCode ], "structparents" ) );
					$i = $this->getV( $objArray[ $objCode ], "structparents" );
					if( $i===false ) break;
					$pageOrder[ intval( $i ) ] = $objCode;
				}
				if( count( $pageOrder ) != $maxpage ) {
									Tracer::trace( "Couldn't get the right page order, sorry...\n");
					return false;
				} else {	
									Tracer::trace( "Page Order resolved! \n" );
									Tracer::trace_r( $pageOrder );
				}
			}
									Tracer::trace( "\n\nNumber of pages: ".$maxpage );		
			// --------------------------------------------------------------------------------------
									Tracer::trace( "\n\nTime to get all the links..." );
			/*
				Page data:
				- obj -				original obj	
				- width, height -	media box size
				- splitH/splitV -	ha spread, akkor hogyan vagjunk
				- rotate -			elforgatott oldal?
				- links -
					- target (page number/obj code)
					- targetURL
					- box size/position
				
				- split aware!!!!
			*/
			// build quick search array for retrieving real page numbers.
			$realPageNumbers = Array();
			$contentObjects = Array();
			for( $i = 0; $i<count( $pageOrder ); $i++ ) {
				$realPageNumbers[ $pageOrder[$i] ] = $i;
				
				$page = $objArray[ $pageOrder[$i] ];
			//	if( $this-isArray ( $this->getV( $objArray[ $page ], "contents" )) ) {
					//$contentObjects[ $i ] = Array();
					//$contentObjects[ $i ] = $this->getRArray( $objArray[ $page ], "contents" );
			//	} else {
					$contentObjects[ $i ] = $this->getR( $page, "contents" );
					//Tracer::trace( "\nsearch for contents in: ".$page );		
			//	}	
			}
									Tracer::trace_r( $realPageNumbers );
									Tracer::trace_r( $contentObjects );
			//$textArray = $this->getPDFtexts( $pdfFile, $objArray, $contentObjects );			// Parse the PDF file for texts
			//*/
			// and now check each pages...

			$pdfData = Array();
			$pdfData["pages"] = Array();
			
			$constpagesize = 1;
			$usecropbox = 0;
			
			for( $i = 0; $i<count( $pageOrder ); $i++ ) {
				$pageData = Array();
				if( isset( $objArray[ $pageOrder[$i] ] ) ) {
					$prop = $objArray[ $pageOrder[$i] ];
										Tracer::trace("\nPage $i - [".$pageOrder[$i]."] ---------\n");	//$prop\n" );
					$mediabox = $this->getVArray( $prop, "mediabox" );
				//	$artbox = $this->getVArray( $prop, "artbox" );
				//	$bleedbox = $this->getVArray( $prop, "bleedbox" );
					$cropbox = $this->getVArray( $prop, "cropbox" );
				//	$trimbox = $this->getVArray( $prop, "trimbox" );
									/*	if( $mediabox )	Tracer::trace_arr( "\tmediabox", $mediabox );
										if( $artbox )	Tracer::trace_arr( "\tartbox__", $artbox );
										if( $bleedbox )	Tracer::trace_arr( "\tbleedbox", $bleedbox );
										if( $cropbox )	Tracer::trace_arr( "\tcropbox_", $cropbox );
										if( $trimbox )	Tracer::trace_arr( "\ttrimbox_", $trimbox ); */
										// rect: lower-left x,y , uppert-right x,y
					//Ezt itt majd javitani kellene, hogy akar minden oldal mas meretu lehessen!!!
					
					if( $i==0 ) {
						if( $mediabox ) $defmediabox = $mediabox;
						if( $cropbox ) $defcropbox = $cropbox;
						
						if( $defcropbox ) {
							// itt meg ellenorizhetnenk, hogy egyformak-e, mert akkor minek...
										Tracer::trace_arr( "Auto use crop box: ", $defcropbox );
							$usecropbox = 1;
						} else {
										Tracer::trace_arr( "Auto use media box: ", $defmediabox );
						}
					}
										
					if( !$defmediabox && $mediabox ) $defmediabox = $mediabox;
				//	if( !$defbleedbox && $bleedbox ) $defbleedbox = $bleedbox;
					if( !$defcropbox && $cropbox ) $defcropbox = $cropbox;
				//	if( !$deftrimbox && $trimbox ) $deftrimbox = $trimbox;
					if( !$mediabox && $defmediabox ) $mediabox = $defmediabox;
				//	if( !$bleedbox && $defbleedbox ) $bleedbox = $defbleedbox;
					if( !$cropbox && $defcropbox ) $cropbox = $defcropbox;
				//	if( !$bleedbox && $deftrimbox ) $bleedbox = $deftrimbox;
					
					$pdfrot =  $this->getV( $prop, "rotate" );
										if( $pdfrot ) Tracer::trace("\trotate $pdfrot\n");	//$prop\n" );

					$usedbox = $usecropbox? $cropbox: $mediabox;
					$useddefbox = $usecropbox? $defcropbox: $defmediabox;

					if( $pdfrot == "90" || $pdfrot == "270" ) {
						$usedbox = $this->getRotatedBox( $usedbox, true );
						$pdfrot = true;
					} else {
						$pdfrot = false;
					}
		
					if( $usedbox ) {
						$pageData["mediabox"] = $usedbox;
						//$pageData["mediasize"] = $this->getRectSize( $mediabox );
						if( $this->isRotated( $useddefbox, $usedbox ) || $pdfrot ) {
							$pageData["rotated"] = true;
							$rotatedpages++;
						} else if( $spreadType = $this->isSpread( $useddefbox, $usedbox ) ) {
							$pageData["spread"] = $spreadType;
							$spreads++;
						} //else {
						$pageData["mdpi"] = $this->getDpiMultiplier( $useddefbox, $usedbox );					// mdpi-t nem itt kellene, eleg tudni, hogy rot/spread... ************
						//}
						if( !$this->isAlmostSameSize( $useddefbox, $usedbox ) ) { $constpagesize = 0; }
						
					}	
					
					$annots = $this->getV( $prop, "annots" );
					if( $annots !== false ) {
										//Tracer::trace( $objArray[ $annots ] );
						if( !$this->isArray( $annots ) ) $annots = $this->getArrayFromRArray( $objArray[ trim( substr( $annots, 0, -1 ) ) ] );
						else $annots =  $this->getArrayFromRArray( $annots );

										//Tracer::trace("\tannots: (".count( $annots ).")\n" );
										//Tracer::trace_r( $annots );
						$pageLinks = Array();
						if( $annots !== false ) {
							for( $a = 0; $a<count( $annots ); $a++ ) {
											Tracer::trace( "[".$objArray[ $annots[ $a ]]."] ".$annots[ $a ]."\n" );
								$annot = $objArray[ $annots[ $a ] ];
								if( strpos( strtolower($annot), "subtype" ) !== false && (strpos( strtolower($annot), "link" ) !== false || strpos( strtolower($annot), "widget" ) !== false  )) {
									// Ok this is a real link!
											Tracer::trace( "\tLink $a. " );
									// Check first the rect...
									$rect = $this->getVArray( $annot, "/rect" );
											if( $rect ) Tracer::trace_arr( "rect", $rect );
									if( $rect===false ) continue;
									// Check dest
									$dest = $this->getDestination( $objArray, $annot );	
									if( $dest ) {
										//Tracer::trace_r( $dest );
										//if( $dest[page] ) Tracer::trace("Linked page: ".$dest[page]."\n" );
										if( isset( $dest["page"] ) && isset( $realPageNumbers[ $dest["page"] ] )  ) {
											Tracer::trace("\t\tLinked page: ".$realPageNumbers[ $dest["page"] ]."\n" );
											$dest["page"] = $realPageNumbers[ $dest["page"] ];
											$pagelinks++;
										}
										if( isset( $dest["url"] ) ) {
											Tracer::trace("\t\tLinked URL: ".$dest["url"]."\n" );
											$urllinks++;
										}
										$dest["rect"] = $rect;
										$pageLinks[] = $dest;
										
										$maxlinks++;
									}
											Tracer::trace( "\n\n" );						
								}				
							}
						}
						$pageData["links"] = $pageLinks;		
					}
				}
				$pdfData["pages"][] = $pageData;		
			}
			
			$maxpage = intval($maxpage);
			$pdfData["info"] = Array(	"pagecount"=> 			$maxpage,
										"pagelinkcount"=>		$pagelinks,
										"urllinkcount"=>		$urllinks,
										"totallinkcount"=>		$maxlinks,
										"rotatedpagecount"=>	$rotatedpages,
										"spreadcount"=>			$spreads,
										"singlepagecount"=>		( $maxpage-$spreads ) + $spreads*2,
										"constpagesize"=>		$constpagesize );
			$pdfData["info"]["mediabox"] = $usecropbox? $defcropbox: $defmediabox;
			//if( $defbleedbox ) $pdfData["info"]["bleedbox"] = $defbleedbox;
			//if( $defcropbox ) $pdfData["info"]["cropbox"] = $defcropbox;
			//if( $deftrimbox ) $pdfData["info"]["trimbox"] = $deftrimbox;

									Tracer::trace_r( $pdfData );
									Tracer::trace( "\nData size: " . strlen( serialize($pdfData) ) . " bytes\n" );
			
			return $pdfData;
		}
		private function getRotatedBox( $box, $isRotated ) {
			if( $isRotated ) {
			
				$X = $box[ 0 ];
				$Y = $box[ 1 ];
				$W = $box[ 2 ];
				$H = $box[ 3 ];
				$box[ 0 ] = $Y;
				$box[ 1 ] = $X;
				$box[ 2 ] = $H;
				$box[ 3 ] = $W;
				
			}
			return $box;
		}
	
		private function getDestination( $objArray, $prop ) {
			// rekurziv fuggveny a link celjanak felderitesehez
									Tracer::trace("\n####$prop\n");
	
			if( $this->isArray( $prop ) ) {
				$dest = $this->getArrayFromRArray( $prop )[0]; // get the first please....
									Tracer::trace( "Linked: page ($dest)\n" );
				return Array( "page" => $dest );		// return page number
			}
			
			// first check for dest
			$dest = $this->getVAsArray( $prop, "dest" );
			if( $dest !== false ) return $this->getDestination( $objArray, $dest );
			
			// no dest, check for object A:
			$destObj = $this->getAttrObjectValue( $prop, "a" );
									//Tracer::trace( "getAttrObjectValue( prop, 'a' ): $destObj");

			if( $destObj === false  && isset($objArray[$this->getR( $prop, "a " )]) ) $destObj = $objArray[ $this->getR( $prop, "a " ) ];
									Tracer::trace( "Link object: $destObj\n" );
			if( $destObj !== false ) {
				// is it reference?
								
				// check for D as title;
				$title = $this->getAttrStringValue( $destObj, "d" );	// nem biztos hogy csak stringre kene ellenorizni...
									//Tracer::trace("Destination: $title\n");
				if( $title ) {
					$tempDest = $this->findObjWithTitle( $objArray, $title );		// keresunk tovabb title alapjan...
					if( $tempDest ) {			
									//Tracer::trace( "Object with title ($tempDest): ".$objArray[ $tempDest ]."\n" );
						return $this->getDestination( $objArray, $objArray[ $tempDest ] );
						
					} 
					// ha nincsen title()-ben, akkor keressuk a names-ben...	
					$destObj = $this->findObjWithName( $objArray, $title );
									//Tracer::trace( "findObjWithName ($destObj)\n" );
					$tempDest = $this->getR( $destObj, "d[" );
									//Tracer::trace( "tempdest obj ($tempDest)\n" );
					if($tempDest===false) $tempDest = $this->getR( $destObj, "d [" );	//csuuunya
									//Tracer::trace( "tempdest obj ($tempDest)\n" );			
					if($tempDest===false) return $this->getDestination( $objArray, $destObj );
					// es az eredmenyt visszakuldjuk, mert ha nem talat, akkor tobb otletunk nincsen.
					return Array( "page" => $tempDest );
					
				}
				$tempDest = $this->getR( $destObj, "d " );
				if( $tempDest === false ) $tempDest = $this->getR( $destObj, "d[" );
									Tracer::trace("Tempdest: $tempDest\n");
				if( $tempDest ) {
								//Tracer::trace( "Link: page ($tempDest)\n" );
					$tempProp = $objArray[ $tempDest ];
					if( $tempProp ) {
						// meg kell nezni hogy amire mutatunk az valoban oldal, vagy csak egy ujabb link...
						if( strpos( strtolower($tempProp), "page" ) !== false ) {
							return Array( "page" => $tempDest );
						}
					}
					return $this->getDestination( $objArray, $objArray[ $tempDest ] );
				}

				$url = $this->getAttrStringValue( $destObj, "uri" );	// nem biztos hogy csak stringre kene ellenorizni...
				if( $url ) {
								//Tracer::trace( "Link URL: $url\n");
					return Array( "url" => $url );
				}
			}
			
			return false;
		}
		private function isArray( $prop ) {
			if( substr( $prop, 0, 1 ) == "[" ) return true;
			return false;
		}
		private function getAttrObjectValue( $prop, $attr ) {
			$s = $attr."<<";
			$pos = strpos( strtolower($prop), $s );
			if( $pos === false ) {
				$s = $attr." <<";
				$pos = strpos( strtolower($prop), $s );
			}
			if( $pos !== false ) {							// van...		
				$prop = trim( substr( $prop, $pos+strlen($s) ) );
				$pos = strpos( $prop, ">>" );				// megkeressuk a veget...
				if( $pos !== false ) {
					$prop = trim( substr( $prop, 0, $pos ) );
				}
				return $prop;
			}
			return false;
		}
		private function getAttrStringValue( $prop, $attr ) {
			$s = $attr."(";
			$pos = strpos( strtolower($prop), $s );
			if( $pos === false ) {
				$s = $attr." (";
				$pos = strpos( strtolower($prop), $s );
			}
			if( $pos !== false ) {							// van...		
				$prop = trim( substr( $prop, $pos+strlen($s) ) );
				$pos = strpos( $prop, ")" );				// megkeressuk a veget...
				if( $pos !== false ) {
					$prop = trim( substr( $prop, 0, $pos ) );
				}
				return $prop;
			}
			return false;
		}
	
		private function getR( $prop, $attr ) {		// get reference
			$pos = strpos( strtolower($prop), $attr );
			if( $pos !== false ) {							// van...		
				$prop = trim( substr( $prop, $pos+strlen($attr) ) );
				$pos = strpos( $prop, "/" );				// megkeressuk a veget...
				if( $pos !== false ) {
					$prop = trim( substr( $prop, 0, $pos ) );
				}
				if( substr( strtolower($prop), -1 )=="r" ) {			// biztos hogy ref?
					return trim( substr( $prop, 0, -1 ) );
				}
				return false;
			}
			return false;
		}
		private function getV( $prop, $attr ) {		// get value...
			$pos = strpos( strtolower($prop), $attr );
			if( $pos !== false ) {							// van...		
				$prop = trim( substr( $prop, $pos+strlen($attr) ) );
				$pos = strpos( $prop, "/" );				// megkeressuk a veget...
				if( $pos === false ) {
					$pos = strpos( $prop, ">>" );
				}
				if( $pos !== false ) {
					$prop = trim( substr( $prop, 0, $pos ) );
				}
				return $prop;
			}
			return false;
		}
		private function getNV( $prop, $attr ) {		// get value...
			$pos = strpos( strtolower($prop), $attr );
			if( $pos !== false ) {							// van...		
				$prop = trim( substr( $prop, $pos+strlen($attr) ) );
				$pos = strpos( $prop, "/" );				// megkeressuk az elejet...
				if( $pos !== false ) {
					$prop = trim( substr( $prop, $pos+1 ) );
					$pos = strpos( $prop, "/" );				// megkeressuk a veget...
					if( $pos !== false ) {
						$prop = trim( substr( $prop, 0, $pos ) );
					}
					return $prop;
				}
				
			}
			return false;
		}
			private function dataexplode( $str ) {
				$str = trim( $str )." ";
				//split string by varying length of spaces...
				$out = Array();
				$sep = false;
				$tmp = "";
				
				for( $p = 0; $p<strlen( $str ); $p++ ) {
					$c = substr( $str, $p, 1 );
					if( $c == " " ) {
						if( !$sep ) {
							$out[] = $tmp;
							$sep = true;
							$tmp = "";
						}
					} else {
						$sep = false;
						$tmp .= $c;
					}
				}
				return $out;
			}
		private function getVArray( $prop, $attr ) {
			$pos = strpos( strtolower($prop), $attr );
			if( $pos !== false ) {							// van...		
				$prop = trim( substr( $prop, $pos+strlen($attr) ) );
				if( substr( $prop, 0, 1 )=="[" ) {				// ugye array?
					$pos = strpos( $prop, "]" );				// megkeressuk a veget...
					if( $pos !== false ) {
						$values = $this->dataexplode( substr( $prop, 1, $pos-1 ) );
						foreach ($values as &$val ) {
							$val = trim($val);
						}
						return $values;
					}
				}
			}
			return false;
		}
		private function getVAsArray( $prop, $attr ) {
			$pos = strpos( strtolower($prop), $attr );
			if( $pos !== false ) {							// van...		
				$prop = trim( substr( $prop, $pos+strlen($attr) ) );
				if( substr( $prop, 0, 1 )=="[" ) {				// ugye array?
					$pos = strpos( $prop, "]" );				// megkeressuk a veget...
					if( $pos !== false ) {
						return trim( substr( $prop, 0, $pos+1 ) );
					}
				}
			}
			return false;
		}
		private function getRArray( $prop, $attr ) {
			$pos = strpos( strtolower($prop), $attr );
			if( $pos !== false ) {							// van...		
				$prop = substr( $prop, $pos+strlen($attr) );
				return $this->getArrayFromRArray( $prop );
			}
			return false;
		}
		private function getArrayFromRArray( $rarr ) {
			// returns an array from native R array ex:[1 0 R 2 0 R 3 0 R]
			
			$rarr = trim( $rarr );
			if( substr( $rarr, 0, 1 )=="[" ) {				// ugye array?
				$pos = strpos( $rarr, "]" );				// megkeressuk a veget...
				if( $pos !== false ) {
					$refs = explode( "r", trim( strtolower(substr( $rarr, 1, $pos-1 )) ), -1 );
					foreach ($refs as &$val ) {
						$val = trim($val);
					}
					return $refs;
				}
			}
			return false;
		}
		
		private function findfirstObjWithAttr( $objArray, $attr ) {
			foreach ($objArray as $objCode=>$prop) {
				$pos = strpos( strtolower($prop), $attr );
				if( $pos !== false ) {
					return $objCode;
				}
			}
			return false;
		}
		private function findAllPage( $objArray ) {
			$found = Array();
			foreach ($objArray as $objCode=>$prop) {
				$pos = strpos( strtolower($prop), "type" );
				if( $pos !== false ) {
					$pos = strpos( strtolower($prop), "page" );
					if( $pos !== false ) {
						if( strpos( strtolower($prop), "pages" )===false ) $found[] = $objCode;		// Nehogy Pages legyen kozben...
					}
				}
			}
			return $found;
			
		}
		private function findObjWithTitle( $objArray, $title ) {
			$title = strtolower($title);
			foreach ($objArray as $objCode=>$prop) {
				$prop = strtolower($prop);
				$pos = strpos( $prop, "title($title)" );
				$pos2 = strpos( $prop, "title ($title)" );
				// ez igy nem eleg, mert a title utan ref is lehet!!!, tehat azt is rekurzive vegig kell futtatni
				if( $pos !== false || $pos2 !== false ) {
					return $objCode;
				}
			}
			return false;
		}
		private function findObjWithName( $objArray, $title ) {
			$title = strtolower($title);
			foreach ($objArray as $objCode=>$prop) {
				$pos = strpos( strtolower($prop), "names" );
				if( $pos !== false ) {
				//if( strpos( $prop, "names" ) !== false || strpos( $prop, "limits" ) !== false ) {
					$prop = trim( substr( $prop, $pos+5 ) );
					$s = "($title)";
					$pos = strpos( strtolower($prop), $s );
					if( $pos !== false ) {
						$prop = trim( substr( $prop, $pos+strlen( $s ) ) );
						$pos = strpos( strtolower($prop), "r" );
						// na fasza, megtalalja a masik fajta celt, csak kozvetlen lapra mutat...
						if( $pos !== false ) {
							if( substr( $prop, 0, 1 ) == "[" ) {
								$dest = trim( substr( $prop, 1, $pos-1 ) );
								return "d[$dest r/]";
							} else {
								$dest = trim( substr( $prop, 0, $pos ) );
							}
							//Tracer::trace( "Linked: page ($dest)\n" );
							if( isset($objArray[ $dest ]) ) return $objArray[ $dest ];
							return false;
						}

					}
				}
			}
			return false;
		}
		
		private function getPageOrderFromPagesRoot( $objArray, $objCode ) {
			$this->tempArr = Array();
			
			// read kids from pages root
			// - kid can be a ref to another kids array
			// - kid can be the page
			$refs = $this->getRArray( $objArray[ $objCode ], "kids" );
			$this->getPageObjCodesFromRArray( $objArray, $refs );
			return $this->tempArr;
		}
		private function getPageObjCodesFromRArray( $objArray, $refs ) {
			// input an RArray, a list of references, decode it to return the page's $objCode
			for( $i = 0; $i<count( $refs ); $i++ ) {
				$prop = $objArray[ $refs[ $i ] ];
				
				$pos = strpos( strtolower($prop), "/type" );
				if( $pos !== false ) {					// Type OK
					$pos = strpos( strtolower($prop), "/pages" );
					if( $pos !== false ) {				// Pages, this will be another list of pages...
						//if( strpos( $prop, "page" )===false ) $found[] = $objCode;		// Nehogy Pages legyen kozben...
						// get the new Array, and check it agaian Recursively
						//$pos = strpos( $prop, "kids" );	// does it have kids?
						$subRefs = $this->getRArray( $prop, "/kids" );
						if(  $subRefs !== false  ) {
							$this->getPageObjCodesFromRArray( $objArray, $subRefs );
						}
					} else {
						$pos = strpos( strtolower($prop), "/page" );
						if( $pos !== false ) {
							// This is a Page, so the code can be added to the page order	
							$this->tempArr[] = $refs[ $i ];
						}
					}
				}			
			}
				
			
		}
	
		private function areAlmostEquals( $A, $B ) {
			$limit = ( $A + $B )/200;	// 1% tolerance
			return ( abs( $A - $B ) < $limit );
		}
		private function isAlmostDouble( $A, $B ) {
			$limit = $A / 100;	// 1% tolerance
			return ( abs( $A - $B/2 ) < $limit );
		}
		
		private function isRotated( $defrect, $rect ) {
			$defsize = $this->getRectSize( $defrect );
			$size = $this->getRectSize( $rect );
			return ( 	!$this->areAlmostEquals( $defsize["width"], $defsize["height"] ) &&
						$this->areAlmostEquals( $defsize["width"], $size["height"] ) &&
						$this->areAlmostEquals( $defsize["height"], $size["width"] ) 		);
		}
		private function isSpread( $defrect, $rect ) {
			$defsize = $this->getRectSize( $defrect );
			$size = $this->getRectSize( $rect );
			$spread = false;
			
			if( 		$this->isAlmostDouble( $defsize["width"], $size["width"] ) &&
						$this->areAlmostEquals( $defsize["height"], $size["height"] ) ) {
				$spread = "h";
			} else if (	$this->isAlmostDouble( $defsize["height"], $size["height"] ) &&
						$this->areAlmostEquals( $defsize["width"], $size["width"] ) ) {
				$spread = "v";
			}
			return $spread;
		}
		private function isAlmostSameSize( $defrect, $rect ) {
			$defsize = $this->getRectSize( $defrect );
			$size = $this->getRectSize( $rect );
			$same = false;
			if( $this->areAlmostEquals( $defsize["width"], $size["width"] ) &&
				$this->areAlmostEquals( $defsize["height"], $size["height"] ) ) {
				$same = true;
			} 
			return $same;
		}
		private function getDpiMultiplier( $defrect, $rect ) {
			$defsize = $this->getRectSize( $defrect );
			$size = $this->getRectSize( $rect );
			//$M = 1;
			/*$defsize["width"] = ceil( $defsize["width"] );
			$defsize["height"] = ceil( $defsize["height"] );
			$size["width"] = floor( $size["width"]/2 )*2;
			$size["height"] = floor( $size["height"]/2 )*2;*/
			
			$Wm = $defsize["width"]/$size["width"];
			$Hm = $defsize["height"]/$size["height"];
			/*switch( $scale ) {
				case "Fit":
					$mi = 0;
					break;
				case "Fill":
					$mi = 1;
					break;
				case "No":
					$mi = 2;
					break;
			}*/

			$M = Array();	// "Fit"=> 
			$M["Fit"] = ( $Wm<$Hm )? $Wm: $Hm;
			$M["Fill"] = ( $Wm>$Hm )? $Wm: $Hm;
			$M["Noscale"] = 1;
			
			return $M;
		}
		
		
		// PAGEDATA HANDLING CODE -------------------------------------------------------------------
	
		public function getInfo() {
			return $this->pdfData["info"];
		}
		public function getPageCount() {
			return $this->pdfData["info"]["pagecount"];
		}
		public function getPageMediabox( $page ) {
			return $this->pdfData["pages"][ $page ]["mediabox"];
		}
		public function getPageBleedbox( $page ) {
			return $this->pdfData["pages"][ $page ]["bleedbox"];
		}
		public function getPDFPages() {
			return $this->pdfData["pages"];
		}
		public function getPageLinks( $page ) {
			return $this->pdfData["pages"][ $page ]["links"];
		}
		public function getPDFData() {
			return $this->pdfData;
		}
		public function setPDFData( $pdfData ) {
			$this->pdfData = $pdfData;
		}
		public function getRectSize( $rect ) {
			$size =	 Array(	"left"=>	$rect[0],
							"bottom"=>	$rect[1],
							"width"=>	$rect[2]-$rect[0],
							"height"=>	$rect[3]-$rect[1] );
			return $size;
		}
		
	}
	
	// END OF CLASS ---------------------------------------------------------------------------------
?>