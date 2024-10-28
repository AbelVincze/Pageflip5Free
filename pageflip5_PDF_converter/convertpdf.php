<?php 

	/*
		Converter API for PDF to Pageflip5 Converter3
		Written by Abel Vincze

		PDF to Pageflip5 Converter3 - Module description
		Copyright (c) Abel Vincze. All rights reserved.
		Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
		See LICENSE file in the project root for more details.
		
		Released 24.10.28

		
		input:
			- pdf URL or location
			- importoptions
			- configoptions
			- output folder
			- generator preferences
			
		returns:
			- jobID, output pageflip folder (subfolder of output folder)
		
		workflow:
		
			- create output folder
			- copy PF files,
			- generate scripts
			- then convert page files into the right folder.
			
	*/

	// Load needed external classes ------------------------------------------------------------
	require_once( 'lib/PDFParser.php' );	
	require_once( 'lib/DBConnection.php' );	
	require_once( 'lib/Tracer.php' );


	// Default options
	$default_importoptions = Array(
		"spreads"	=>	"Auto",
		"rotation"	=>	"Auto",
		"scale"		=>	"Fit"
	);
	$default_configoptions = Array(
		"dropshadow"			=>	"true",
		"dropshadowopacity"		=>	"0.25",		// 0-1;

		"pageshadow"			=>	"true",
		"pageshadowopacity"		=>	"0.25",		// 0-1;

		"backgroundcolor"		=>	"#444",
		"backgroundenabled"		=>	"true",
		"pagebackgroundcolor"	=>	"#888",
		"controlscolor"			=>	"rgba(255,255,255,0.5)",
		"controlshoveredcolor"	=>	"#FA0",
		"controlbarbackcolor"	=>	"rgba(68,68,68,0.35)",
		"controlbarbackenabled"	=>	"true",

		"RTL"					=>	"false",	// Right to Left flipping mode
		"vertical"				=>	"false",	// Vertical mode
		"singlepagemode"		=>	"false",	// Single Page mode 

		"hardcover"				=>	"true",		// Hard covered book
		"hardpages"				=>	"false",	// Hard inside pages
		"centersinglepage"		=>	"true",		// Center book if only a single page is visible (front and back covers)
		"roundedcorners"		=>	"false",	// Rounded corners
		"alwaysopened"			=>	"false",	// Book can't be closed

		"controlbar"			=>	"true",		// Control bar enabled
		"controlbartop"			=>	"true",		// Control bar over the book
		"mousecontrol"			=>	"true",		// Control with mouse
		"controlbarbtn"			=>	"true",		// Navigation using control bar buttons
		"pagerenabled"			=>	"true",		// Pange number display
		"hotkeys"				=>	"true",		// Navigation using keyboard
		"thumbenabled"			=>	"true",		// Thumbnails enabled
		"thumbautohide"			=>	"true",		// Auto hide Thumbnails
		"thumbtop"				=>	"true",		// Thumbnails over the book
		"fullscreenenabled"		=>	"true",		// Enable Fullscreen view
		"autoflipenabled"		=>	"true",		// Auto flipping enabled
		"startautoflip"			=>	"false",	// Start autoflipping book at start

		"shareprinterest"		=>	"true",		// Pinterest button enabled
		"sharefacebook"			=>	"true",		// Facebook button enabled
		"sharetwitter"			=>	"true",		// Twitter button enabled
		"sharegoogle"			=>	"true",		// Google+ button enabled
		"sharemsg"				=>	"PDF to flipbook converter http://pageflip-books.com",		// Share message less then 160 characters
		"sharevia"				=>	"@MaccPageFlip",
		"sharepageimage"		=>	"1",		// page number which' image is to be used

		"showcopyright"			=>	"false",	// Show copyright message

		"copyright"				=>	"",			// Copyright text

		"datafolder"			=>	"pageflipdata/"	// Used ONLY if embedded = false, always ends with "/"
	);

	// Processing POST variables ----------------------------------------------------------------
	
	// output: output directory	-> default "output" in the same dir as the script...
	$output_dir		= getPOST( "output",		"output" );
	$log			= getPOST( "log",			false );

	// Source file: URL or file
	$file			= getPOST( "file",			false );
	$url			= getPOST( "url",			false );
	
	// maxwidth/maxheight	-> default 600x600
	$maxwidth		= getPOST( "maxwidth",		600 );
	$maxheight		= getPOST( "maxheight",		600 );

	// thumbheight	-> default 100
	$thumbheight	= getPOST( "thumbheight",	100 );

	// Generator preferences
	$threads		= getPOST( "threads",		8 );	
	$quality		= getPOST( "quality",		2 );	
	$jpgquality		= getPOST( "jpgquality",	90 );

	$embedded		= getPOST( "embedded",		true );
	$bookid			= getPOST( "bookid",		"mypageflip" );
	$bookname		= getPOST( "bookname",		"My Pageflip" );
	
	$importoptions	= getPOSTArray( "importoptions", $default_importoptions );
	$configoptions	= getPOSTArray( "configoptions", $default_configoptions );

	// Process options --------------------------------------------------------------------------
	if ( !file_exists( $output_dir )) { mkdir( $output_dir, 0777, true ); }
	else { deleteDirContent( $output_dir ); }
	if ( !file_exists( "$output_dir/log" ) && $log ) { mkdir( "$output_dir/log" , 0777, true ); }

	if( $url !== false ) {
		Tracer::trace( "Getting PDF file from URL: $url\n" );
		if( !is_200( $url ) ) {
			Tracer::trace( "File not found: $url\n" );
			errorExit( "File not found on the specified URL" );
		} 
		$file = "$output_dir/source.pdf";
		file_put_contents( $file, fopen( $url , 'r'));
	} else if( $file !== false ) {
		Tracer::trace( "Using PDF file: $file\n" );
		if( !file_exists( $file ) ) {
			Tracer::trace( "File not found: $file\n" );
			errorExit( "File not found on the specified location" );
		}
	} else {
		Tracer::trace( "No input file was specified\n" );
		errorExit( "No input file was specified" );
	}
	// now we have the file in $file

	// Start PDF parsing ------------------------------------------------------------------------
	$PDFp = new PDFParser();
	if( $PDFp->parsePDF( $file ) === false ) {
		//Parsing was unsuccessfull
		Tracer::trace( "Parsing PDF failed\n" );
		errorExit( "Parsing PDF failed" );
	}	

	// PDF page size @ 72dpi
	$pdfInfo = $PDFp->getInfo();
	$pdfSize = $PDFp->getRectSize( $pdfInfo["mediabox"] );
	$pdfSize["width"] = floor( $pdfSize["width"]/2 )*2;
	$pdfSize["height"] = floor( $pdfSize["height"]/2 )*2;
	$baseW = $pdfSize["width"];
	$baseH = $pdfSize["height"];

	// Get PF page size
	$targetResolution = getRenderResolution( $pdfSize, $maxwidth, $maxheight, 0 ); 
	$width = $targetResolution["width"];
	$height = $targetResolution["height"];
	$dpi = $targetResolution["dpi"];
	Tracer::trace( "PF page size $width x $height\n" );
	$targetResolution = getRenderResolution( $pdfSize, 10000, $thumbheight, 0 ); 
	$thumbwidth = $targetResolution["width"];
	$thumbheight = $targetResolution["height"];
	Tracer::trace( "PF page size $width x $height\n" );

	generateScriptsAndRender( $output_dir );
	
	// Save log if logging is enabled.
	if( $log ) { file_put_contents ( $output_dir."/log/convert.log" , str_replace( "    ", "\t", Tracer::getlog() ) ); }
	exit();
	// --------------------------------------------------------------------------------------------------------
	
	
	// FUNCTIONS ---------------------------------------------------------------------------------
	function getPOST( $var, $def ) {
		return isset( $_POST[$var] )? $_POST[$var]: $def;
	}
	function getPOSTArray( $var, $def ) {
		
		if( !isset( $_POST[$var] ) ) {
			$arr = $def;
		} else {
			$arr = $_POST[$var];
			foreach ( $def as $key => $value) {
				if( !isset( $arr[$key]) ) {
					$arr[$key] = $value;
				}
			}
		}
		
		return $arr;
	}
	
		function is_200($url) {
			$options['http'] = array(
				'method' => "HEAD",
				'ignore_errors' => 1,
				'max_redirects' => 0
			);
			$body = file_get_contents($url, NULL, stream_context_create($options));
			sscanf($http_response_header[0], 'HTTP/%*d.%*d %d', $code);
			return $code === 200;
		}
		
	function generateScriptsAndRender( $output_dir ) {
			global	$log, $threads, $configoptions, $importoptions, $embedded, $bookid, $bookname,
					$file, $quality, $jpgquality, $bookid,
					$PDFp, $pdfInfo, $pdfSize, $baseW, $baseH,
					$width, $height, $thumbwidth, $thumbheight, $dpi;

			$filecopy		= true;
			setlocale(LC_ALL, 'en_US.utf8');
			$bookid			= safeName( iconv('utf-8', 'us-ascii//TRANSLIT', $bookid ) );
			
			$fname = $bookid;
			$base_dir = $output_dir;
			$cnt = 0;
			do {
				
				$pageflip_dir	= "pageflip_$bookid".($cnt?"_$cnt":"")."/";
				$output_dir			= "$base_dir/$pageflip_dir";
				$cnt++;
				
			} while( file_exists( $output_dir ) );
			
			mkdir( $output_dir, 0777, true );
			
			$datafolder		= $configoptions["datafolder"];
			$htmlfilepath	= $datafolder;	//($datafolder==""?"":"../".$datafolder);
			$cssfilepath	= "css/";
			$jsfilepath		= "js/";
				
			$output_css_dir		= $output_dir.$cssfilepath;
			$output_js_dir		= $output_dir.$jsfilepath;
			$output_pages_dir	= $output_dir.$htmlfilepath;

			// Create directories
			mkdir( $output_css_dir, 0777, true );
			mkdir( $output_js_dir, 0777, true );
			mkdir( $output_pages_dir, 0777, true );
			if( $log ) mkdir( $output_pages_dir."log/", 0777, true );

			$copyright		= $configoptions["copyright"];

			$havecover		= $configoptions["hardcover"] || $configoptions["largecover"];
			$alwaysopened	= $configoptions["alwaysopened"];

					$spreads 		= $importoptions['spreads'];
					$rotation		= $importoptions['rotation'];
					$scale			= $importoptions['scale'];

					$PDFPages		= makePDFPagesArray( $PDFp->getPDFPages() );
					$PFPages		= makePFPagesArray( $PDFPages, $spreads, $rotation, $scale );
					$RenderQueue	= makeRenderQueueArray( $PFPages, $PDFPages );
					// save RenderQueue for the background processes...
					file_put_contents ( $output_dir."renderqueue" , serialize( $RenderQueue ) );

					$DBConn		= new DBConnection();
					$jobID		= $DBConn->newRenderJob( $output_pages_dir, count( $RenderQueue ), $width, $height, $thumbwidth, $thumbheight, $dpi );
					echo( "0,$jobID,$output_dir" );
					
					$links = makeLinksArray( $PFPages, $PDFPages, $width, $height, $dpi, $scale );
			
			$content = "";
			$config = "";
			
			$mp = count($PFPages);
			
			$dif = $alwaysopened? 1: 2;
			$mep = $mp + ($mp%2) -1 -$dif;
			for( $i=0; $i<$mp; $i++ ) {
				$class = "page";
				$pagelinkshtml = generatePageLinkHtml( $links, $i );
				if( ( $i<$dif || $i>$mep ) && $havecover ) $class = "cover";

				$content .= "<div class='$class' data-background-file='".$htmlfilepath."page".$i.".jpg'";
				if( $configoptions["thumbenabled"]=="true" /*&& $PFPages[$i]["thumb"]=="true"*/ )
					$content .= " data-thumbnail-image='".$htmlfilepath."page".$i."_th.jpg'";
				$content .= " data-page-label='t".$links[ $i ][ "pdfpage" ]."'>$pagelinkshtml</div>";
				if( $i < $mp-1 ) $content .= "\n\t\t\t";
			}

			$nl = "\n\t\t\t\t";
			
			$data = file_get_contents("files/pageflip5_for_pdf/index-tpl.html");
			$controlbardata = "\n".file_get_contents("files/pageflip5_for_pdf/common/controlbar_svg.html");
			
			$controls = ($configoptions["controlbar"]=="true");
			$marginbottom = ($controls? ($configoptions["showcopyright"]=="true"?88: 64): 32);
			
			$hardcover = $configoptions["hardcover"];
			$pa = $hardcover=="false"? "true": "false";
			
			$config .= "PageWidth: ".$width.",$nl";
			$config .= "PageHeight: ".$height.",$nl";
			$config .= "Margin: 32,$nl";
			$config .= "MarginBottom: $marginbottom,$nl";
			$config .= "PerformanceAware: $pa,$nl";
			$config .= "AutoScale: true,$nl";
			$config .= "FullScale: true,$nl";
			$config .= "HardCover: $hardcover,$nl";
			$config .= "HardPages: ".$configoptions["hardpages"].",$nl";
			$config .= "RightToLeft: ".$configoptions["RTL"].",$nl";
			$config .= "VerticalMode: ".$configoptions["vertical"].",$nl";
			$config .= "AlwaysOpened: $alwaysopened,$nl";
			
			$config .= "AutoFlipEnabled: ".$configoptions["autoflipenabled"].",$nl";
			$config .= "StartAutoFlip: ".$configoptions["startautoflip"].",$nl";
			$config .= "AutoFlipLoop: -1,$nl";

				$fs = $configoptions["pageshadow"]=="true"?"false":"true";
			$config .= "DropShadow: ".$configoptions["dropshadow"].",$nl";
			$config .= "NoFlipShadow: $fs,$nl";
			$config .= "Emboss: ".$configoptions["pageshadow"].",$nl";

			$config .= "DropShadowOpacity: ".$configoptions["dropshadowopacity"].",$nl";
			$config .= "FlipTopShadowOpacity: ".$configoptions["pageshadowopacity"].",$nl";
			$config .= "FlipShadowOpacity: ".$configoptions["pageshadowopacity"].",$nl";
			$config .= "HardFlipOpacity: ".$configoptions["pageshadowopacity"].",$nl";
			$config .= "EmbossOpacity: ".$configoptions["pageshadowopacity"].",$nl";

			$config .= "HashControl: true,$nl";
			$config .= "PageCache: 5,$nl";
			$config .= "MouseControl: ".$configoptions["mousecontrol"].",$nl";
			$config .= "HotKeys: ".$configoptions["hotkeys"].",$nl";
			$config .= "ControlbarToFront: ".$configoptions["controlbartop"].",$nl";
			$config .= "FullScreenEnabled: ".$configoptions["fullscreenenabled"].",$nl";
			
			if( $configoptions["thumbenabled"]=="true" ) {
				$config .= "Thumbnails: true,$nl";
				$config .= "ThumbnailsHidden: true,$nl";
				$config .= "ThumbnailWidth: $thumbwidth,$nl";
				$config .= "ThumbnailHeight: $thumbheight,$nl";
				$config .= "ThumbnailsToFront: ".$configoptions["thumbtop"].",$nl";
				if( $configoptions["thumbtop"] == "false" ) $config .= "MarginTop: ".(32+$thumbheight).",$nl";
				if( $configoptions["thumbautohide"]=="true" ) $config .= "ThumbnailsAutoHide: 5000,$nl";
			}
			
			$config .= "ShareLink: window.location.href,$nl";
			$config .= "ShareText: '".$configoptions["sharemsg"]."',$nl";
			$config .= "ShareVia: '".$configoptions["sharevia"]."',$nl";
			$config .= "ShareImageURL: '".$htmlfilepath."page".$configoptions["sharepageimage"].".jpg',$nl";
			
			if( !$embedded ) {
				$config .= "PageDataFile: '".$htmlfilepath."pageorder.html',$nl";
				if( $controls ) $config .= "ControlbarFile: '".$datafolder."controlbar_svg.html',$nl";
			}
			
			$config .= "DisableSelection: true,$nl";
			$config .= "CenterSinglePage: ".$configoptions["centersinglepage"].",$nl";
			$config .= "SinglePageMode: ".$configoptions["singlepagemode"].",$nl";
			$config .= "ShowCopyright: ".$configoptions["showcopyright"].",$nl";
			$config .= "Copyright: '$copyright',$nl";

	if( !$embedded ) file_put_contents( $output_pages_dir."pageorder.html", $content );

			// do tag replacements or whatever you want
			
			$data = str_replace("### BOOK NAME ###",				$bookname, 							$data);
			$data = str_replace("### CUSTOM CSS LINK ###",			$cssfilepath."pageflip-custom.css", $data);
			$data = str_replace("### EMBEDDED CONTENT ###",			$embedded? $content: "",			$data);
			$data = str_replace("### EMBEDDED CONTROLBAR ###",		(($controls && $embedded)? "<div class='controlbar'>$controlbardata\t\t\t</div>": ""), $data);
			$data = str_replace("### EMBEDDED CONFIG OPTIONS ###",	$config,							$data);
			$data = str_replace("### BOOK ID ###", 					$bookid, 							$data);
			
			//save it back:
	file_put_contents( $output_dir."index.html", $data);
				
				$css = "body {\n\tmargin: 0;\n}\n.pageflip-container {\n\tpadding-top: 1px;\n}\n";
				
				$nones = array();
				if( $configoptions["shareprinterest"]=="false" ) array_push($nones, "#b-pinterest");
				if( $configoptions["sharefacebook"]=="false" ) array_push($nones, "#b-facebook");
				if( $configoptions["sharetwitter"]=="false" ) array_push($nones, "#b-twitter");
				if( $configoptions["sharegoogle"]=="false" ) array_push($nones, "#b-google");
				if( $configoptions["thumbenabled"]=="false" ) array_push($nones, "#b-thumbs");
				if( $configoptions["fullscreenenabled"]=="false" ) array_push($nones, "#b-fullscreen");
				if( $configoptions["autoflipenabled"]=="false" ) array_push($nones, "#b-play");
				if( count($nones)>0 ) $css .= implode( ",\n", $nones)." {\n\tdisplay: none;\n}\n";
				
				if( $configoptions["roundedcorners"]=="true" ) {
					if( $configoptions["vertical"]=="true") {
						$css .= ".pf-page-container.pf-left-side {\n\tborder-radius: 10px 10px 0 0;\n}\n";
						$css .= ".pf-page-container.pf-right-side {\n\tborder-radius: 0 0 10px 10px;\n}\n";
					} else {
						$css .= ".pf-page-container.pf-left-side {\n\tborder-radius: 10px 0 0 10px;\n}\n";
						$css .= ".pf-page-container.pf-right-side {\n\tborder-radius: 0 10px 10px 0;\n}\n";
					}
					$css .= "#pf-dropshadow {\n\tborder-radius: 20px;\n}\n";
				}
				if( $configoptions["backgroundenabled"]=="true" ) {
					$css .= "#pf-stage {\n\tbackground: ".$configoptions["backgroundcolor"].";\n}\n";
				}
				$css .= ".pf-left-side,\n.pf-right-side,\n.pf-thumbnail-spread,\n.pf-thumbnail-page {\n\tbackground: ".$configoptions["pagebackgroundcolor"].";\n}\n";
				$css .= "#pageflip-controls,\n#pf-pagerin {\n\tcolor: ".$configoptions["controlscolor"].";\n}\n";
				$css .= ".pf-control-bar-button g,\n.pf-control-bar-pager g {\n\tfill: ".$configoptions["controlscolor"].";\n}\n";
				$css .= ".pf-control-bar-button:not(.pf-disabled):hover g {\n\tfill: ".$configoptions["controlshoveredcolor"].";\n}\n";
				
				if( $configoptions["controlbarbackenabled"]=="true" ) {
					$css .= "#pageflip-controls {\n\tbackground: ".$configoptions["controlbarbackcolor"].";\n}\n";
				}
				
				$css .= ".pf-hotspot {\n\tposition: absolute;\n\toverflow: hidden;\n\tcursor: pointer;\n}\n";
	file_put_contents( $output_css_dir."pageflip-custom.css", $css );
				
	copy( "files/pageflip5_for_pdf/js/pageflip5-min.js", $output_js_dir."pageflip5-min.js" );
	copy( "files/pageflip5_for_pdf/js/jquery-1.11.1.min.js", $output_js_dir."jquery-1.11.1.min.js" );
	copy( "files/pageflip5_for_pdf/css/pageflip.css", $output_css_dir."pageflip.css" );
	if( !$embedded ) copy( "files/pageflip5_for_pdf/common/controlbar_svg.html", $output_pages_dir."controlbar_svg.html" );
			
		$retina		= 0;
		for( $i = 0; $i < $threads; $i++ ) {
			$command =	"/usr/bin/php5 -f background.php ".
						"$file $jobID $i $threads ".$output_dir."renderqueue $retina 0 $quality 0 0 $jpgquality";
			exec( "$command > /dev/null &", $arrOutput );
		}
			
	}	
	
	function errorExit( $msg ) {
		echo( "-1,".$msg);
		exit();
	}
	function deleteDirContent( $userdir ) {
		$files = glob( "$userdir/*" );
		foreach( $files as $file ){
			if( is_file( $file ) ) unlink($file);
		}
	}
	function safeName( $name ) {
		$name = str_replace( " ", "_", $name );
		$name = str_replace( "..", ".", $name );
		$name = strtolower( $name );
		preg_match_all( "/[^0-9^a-z^_^.]/", $name, $matches );
		foreach( $matches[0] as $value) { $name = str_replace( $value, "", $name ); }
		return $name;
	}
	
	// PAGE ARRAY GENERATOR CODE ----------------------------------------------------------------
	function makePDFPagesArray( $pdfpages ) {
		$PDFPages = Array();
		for( $i = 0; $i < count( $pdfpages ); $i ++ ) {
			
			$PDFPages[ $i ] = Array( "pdfpage" => $i );
			$PDFPages[ $i ]["mediabox"] = $pdfpages[ $i ]["mediabox"];
			$PDFPages[ $i ]["rotated"] = isset($pdfpages[ $i ]["rotated"])? $pdfpages[ $i ]["rotated"]: false;
			$PDFPages[ $i ]["spread"] = isset($pdfpages[ $i ]["spread"])? $pdfpages[ $i ]["spread"]: false;
			$PDFPages[ $i ]["mdpi"] = $pdfpages[ $i ]["mdpi"];
			$PDFPages[ $i ]["links"] = isset($pdfpages[ $i ]["links"])? $pdfpages[ $i ]["links"]: false;
			
		}
		
		return $PDFPages;
	}
	function makePFPagesArray( $pdfpages, $spreads, $rotation, $scale ) {	// for preview, all pages from PDFPages!
		$PFPages = Array();
		$page = 0;

		for( $i = 0; $i < count( $pdfpages ); $i ++ ) {
		
			$pdfpage = $pdfpages[ $i ][ "pdfpage" ];
			$mediabox = $pdfpages[ $i ][ "mediabox" ];
			$links = $pdfpages[ $i ][ "links" ];
		
			if( ( $spreads=="Auto" && $pdfpages[ $i ][ "spread" ] ) ||
				  $spreads=="Vertical" || $spreads=="Horizontal" ) {
				
				$spread = ($spreads=="Auto")?$pdfpages[ $i ][ "spread" ]:(($spreads=="Vertical")?"v":"h");

				$PFPages[ $page++ ] = PFPagesData( $page, $pdfpage, $spread, "a", false, true, 1, $mediabox, $links );
				$PFPages[ $page++ ] = PFPagesData( $page, $pdfpage, $spread, "b", false, true, 1, $mediabox, $links );
				
			} else {
				$rot = $pdfpages[ $i ][ "rotated" ];
				$mdpi = $pdfpages[ $i ][ "mdpi" ][ "$scale" ];
				switch( $rotation ) {
					case "Auto":
						if( $rot ) $mdpi = 1;
						break;
					case "Off":
						$rot = false;
						break;
					case "All":
						$rot = !$rot;
						$mdpi = 1;
						break;
				}
				$PFPages[ $page++ ] = PFPagesData( $page, $pdfpage, false, false, $rot, true, $mdpi, $mediabox, $links );
			}
		}
		return $PFPages;
	}
	function PFPagesData( $page, $pdfpage, $spread, $part, $rot, $thumb, $mdpi, $mediabox, $links ) {
		$data = Array();
		$data[ "pfpage" ]	= $page;
		$data[ "pdfpage" ]	= $pdfpage;
		$data[ "spread" ]	= $spread;
		$data[ "part" ]		= $part;
		$data[ "rotated" ]	= $rot;
		$data[ "thumb" ]	= $thumb;
		$data[ "mdpi" ]		= $mdpi;
		$data[ "mediabox" ]	= $mediabox;
		$data[ "links" ]	= $links;
		return $data;
	}
	function makeOrderedPFPagesArray( $pfpages, $orderArray ) {
		$orderedPFPages = Array();
		for( $i = 0; $i < count( $orderArray ); $i++ ) {
			$orderedPFPages[ $i ] = $pfpages[ $orderArray[ $i ]["page"] ];
			$orderedPFPages[ $i ]["thumb"] = ($orderArray[ $i ]["thumbnail"]=="true");
		}
		return $orderedPFPages;
	}
	function makeRenderQueueArray( $pfpages, $pdfpages ) {
		$RQtemp = Array();

		for( $i = 0; $i < count( $pfpages ); $i++ ) {
			$op = $pfpages[ $i ][ "pdfpage" ];
			if( !isset( $RQtemp[ $op ] ) ) {
				$RQtemp[ $op ] = Array();
				$RQtemp[ $op ][ "pdfpage" ] = $op;
				$RQtemp[ $op ][ "spread" ] = $pfpages[ $i ][ "spread" ];
				$RQtemp[ $op ][ "rotated" ] = $pfpages[ $i ][ "rotated" ];
			}
			if( !$pfpages[ $i ][ "spread" ] ) $part = "a";
			else { 
				$part = $pfpages[ $i ][ "part" ];
			}
			$RQtemp[ $op ][ "file$part" ] = $i;
			$RQtemp[ $op ][ "thumb$part" ] = $pfpages[ $i ][ "thumb" ];
			$RQtemp[ $op ][ "mdpi" ] = $pfpages[ $i ][ "mdpi" ];
		}
		
		$RenderQueue = Array();
		
		for( $i = 0; $i < count( $pdfpages ); $i++ ) {
			if( isset( $RQtemp[ $i ] ) ) {
				$RenderQueue[] = $RQtemp[ $i ];
			}	
		}
		
		return $RenderQueue;
	}	
	
	function makeLinksArray( $pfpages, $pdfpages, $pageW, $pageH, $dpi, $scale ) {
		$links = Array();
		for( $i = 0; $i < count( $pfpages ); $i++ ) {
			$size = getRectSize( $pfpages[ $i ][ "mediabox" ] );
			$rotated = $pfpages[ $i ][ "rotated" ];
			$W = $rotated? $size[ "height" ] : $size[ "width" ];
			$H = $rotated? $size[ "width" ] : $size[ "height" ];
			$OX = $rotated? $size[ "bottom" ] : $size[ "left" ];
			$OY = $rotated? $size[ "left" ] : $size[ "bottom" ];
			$lscale = ( $dpi * $pfpages[ $i ][ "mdpi" ] ) / 72;
			$RW = $W * $lscale;
			$RH = $H * $lscale;
			$ROX = $OX * $lscale;
			$ROY = $OY * $lscale;
			$spread = $pfpages[ $i ][ "spread" ];
			$part = $pfpages[ $i ][ "part" ];
			$offsx = ceil( ( $pageW-$RW)/2 );
			$offsy = ceil( ( $pageH-$RH)/2 );
			if( $spread=="h" ) {
				if( $part=="a" ) $offsx = 0;
				else $offsx = floor( $pageW-$RW );
			}
			if( $spread=="v" ) {
				if( $part=="a" ) $offsy = 0;
				else $offsy = floor( $pageH-$RH );
			}
			$links[ $i ] = Array(	"pdfpage"=>		$pfpages[ $i ][ "pdfpage" ],
									"links"=>		Array() );
									
			if( $pfpages[ $i ][ "links" ] !== false ) {
				$pagelinks = $pfpages[ $i ][ "links" ];
				
				for( $l = 0; $l < count( $pagelinks ); $l++ ) {
					$templink = Array();

					$templink["page"] = isset( $pagelinks[ $l ][ "page" ] )? $pagelinks[ $l ][ "page" ]: false;
					$templink["url"] = isset( $pagelinks[ $l ][ "url" ] )? $pagelinks[ $l ][ "url" ]: false;
					
					$linkrect = getRectSize( $pagelinks[ $l ][ "rect" ] );
					
					if( $rotated ) {
						$nbottom = $linkrect[ "left" ];
						$linkrect[ "left" ] =  $W - $linkrect[ "bottom" ] - $linkrect[ "height" ];
						$linkrect[ "bottom" ] = $nbottom;
						
						$nw = $linkrect[ "height" ];
						$linkrect[ "height" ] = $linkrect[ "width" ];
						$linkrect[ "width" ] = $nw;
					}
					
					$lW = ceil( $linkrect[ "width" ] * $lscale );
					$lH = ceil( $linkrect[ "height" ] * $lscale );
					
					$lX = floor( $offsx + $linkrect[ "left" ] * $lscale - $ROX );
					$lY = floor( $offsy + ( $H - $linkrect[ "bottom" ] - $linkrect[ "height" ] ) * $lscale + $ROY );
					
					$templink["top"] = $lY;
					$templink["left"] = $lX;
					$templink["width"] = $lW;
					$templink["height"] = $lH;
					

					$links[ $i ][ "links" ][] = $templink;
				}
				
			} 
		}
		return $links;
	}
	function generatePageLinkHtml( $links, $page ) {
		$out = "";
		$ldata = $links[ $page ][ "links" ];
		
		for( $i=0; $i<count( $ldata ); $i++ ) {
			
			$out .= "<div class='hotspot' style='top:".$ldata[$i]["top"]."px;left:".$ldata[$i]["left"]."px;width:".$ldata[$i]["width"]."px;height:".$ldata[$i]["height"]."px;' ";
			if( $ldata[$i]["page"] !== false ) $out .= "onclick='p(".$ldata[$i]["page"].")'";
			if( $ldata[$i]["url"] !== false ) $out .= "onclick='u(\"".$ldata[$i]["url"]."\")'";
			$out .= "></div>";
			
		}
		return $out;
	}
	function getRectSize( $rect ) {
			$size =	 Array(	"left"=>	$rect[0],
							"bottom"=>	$rect[1],
							"width"=>	$rect[2]-$rect[0],
							"height"=>	$rect[3]-$rect[1] );
			// fix in case the dimensitons are exchanged...
			if( $size["height"]<0 ) {
				$size["bottom"] = $size["bottom"] + $size["height"];
				$size["height"] = -$size["height"];
			}
			if( $size["width"]<0 ) {
				$size["left"] = $size["left"] + $size["width"];
				$size["width"] = -$size["width"];
			}
								
			return $size;
	}

	// PAGE SIZE DETERMINATION ------------------------------------------------------------------
	function getRenderResolution( $originalbox, $maxwidth, $maxheight, $crop=0 ) {
		$ow = $originalbox["width"];
		$oh = $originalbox["height"];
		
		$mw = $maxwidth + $crop*2;
		$mh = $maxheight + $crop*2;
		
		if( $maxwidth/$ow < $maxheight/$oh ) {
			
			$m = $maxwidth/$ow;
			$w = floor( $maxwidth - $crop*2 );
			$h = floor( $oh*$m - $crop*2 );
			
		} else {
			
			$m = $maxheight/$oh;
			$w = floor( $ow*$m - $crop*2 );
			$h = floor( $maxheight - $crop*2 );
			
		}
		$w -= $w%2;
		$h -= $h%2;
		
		$dpi = 72*$m;
		
		return Array( "width"=>$w, "height"=>$h, "dpi"=>$dpi );
	}
	

?>