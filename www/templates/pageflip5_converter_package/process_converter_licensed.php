<?php 

	//error_reporting(E_ALL);
	//ini_set("display_errors", 1);

	session_start();
	$func = $_POST['func'];	

	if( !$_SESSION["initialized"] ) {
		echo("-1,0,Session is not initialized");
		exit();
	}

	require_once( 'lib/settings.php' );	
	require_once( 'lib/PDFParser.php' );	
	require_once( 'lib/DBConnection.php' );	
	require_once( 'lib/Tracer.php' );	

	switch( $func ) {
		
		case 0:
			// if no function, then start the editor...
?><!DOCTYPE html>
<head>
	<title>Pageflip5 - Licensed PDF to Pageflip Converter 3</title>
	<meta name="description" content="Pageflip5" />
	<meta name="author" content="Abel Vincze" />
	<meta http-equiv="refresh" content="0;URL=pdf-converter-licensed.php">
</head>
<body>
</body>
</html><?php
			exit();
			break;
		case 2: processUpload(); break;
		case 3: processPreviewRequest(); break;
		case 5: processRenderRequest(); break;
		case 6: processGenerateScripts(); break;
		case 7: processDownload(); break;
		case 9: processExit(); break;
		case 10: processPDFURL(); break;
	}
	
	// FUNCTIONS
		function processFile( $file, $filesize, $filetype, $output_dir ) {
			$_SESSION["validpreview"] = false;
			$PDFp = new PDFParser( "$output_dir/log/parse.log" );
			
			if( $PDFp->parsePDF( $output_dir."source.pdf" ) === false ) {
				errorExit( "Parsing PDF failed" );
			}	
			$_SESSION["pdfData"] = $PDFp->getPDFData();
			$pdfInfo = $PDFp->getInfo();
			$pdfSize = $PDFp->getRectSize( $pdfInfo["mediabox"] );
			$pdfSize["width"] = floor( $pdfSize["width"]/2 )*2;
			$pdfSize["height"] = floor( $pdfSize["height"]/2 )*2;
			$_SESSION["basew"] = $baseW = $pdfSize["width"];
			$_SESSION["baseh"] = $baseH = $pdfSize["height"];
			$crop = 0;
			$targetResolution = getRenderResolution( $pdfSize, 146, 146, $crop ); 
			$previewwidth = $targetResolution["width"];
			$previewheight = $targetResolution["height"];
			echo( 	"0,".
					$file.",".								// A feltoltott file neve
					$filesize.",".							// Merete Byte-ban
					$filetype.",".							// megallapitott tipusa, erre szarunk...
					$pdfInfo["pagecount"].",".				// PDF oldalak szama
					$pdfInfo["spreadcount"].",".			// abban a spreadek szama
					$pdfInfo["singlepagecount"].",".		// PF konyv oldalainak szama (spread fixed)
					$pdfInfo["totallinkcount"].",".			// Linkek szama a PDF-ben
					$pdfInfo["pagelinkcount"].",".			// Ebbol az oldalra mutato linkek szama
					$pdfInfo["urllinkcount"].",".			// Ebbol URL link
					$pdfInfo["rotatedpagecount"].",".		// elforgatott oldalak szama
					$pdfSize["width"].",".					// PDF meret 72DPI-n
					$pdfSize["height"].",$previewwidth,$previewheight,$output_dir,". //    ^ $jobID,
					$pdfInfo["constpagesize"]				// PDF constant page size...
				);
			if( isset($pdfInfo["bleedbox"]) ) {
				$bleedboxSize = $PDFp->getRectSize( $pdfInfo["bleedbox"] );
				$bleedboxW =  $bleedboxSize["width"];
				$bleedboxH =  $bleedboxSize["height"];
				echo( ",$bleedboxW,$bleedboxH" );
			} else {
				echo( ",0,0" );
			}
			if( isset($pdfInfo["cropbox"]) ) {
				$cropboxSize = $PDFp->getRectSize( $pdfInfo["cropbox"] );
				$cropboxW =  $cropboxSize["width"];
				$cropboxH =  $cropboxSize["height"];
				echo( ",$cropboxW,$cropboxH" );
			} else {
				echo( ",0,0" );
			}
			if( isset($pdfInfo["trimbox"]) ) {
				$trimboxSize = $PDFp->getRectSize( $pdfInfo["trimbox"] );
				$trimboxW =  $trimboxSize["width"];
				$trimboxH =  $trimboxSize["height"];
				echo( ",$trimboxW,$trimboxH" );
			} else {
				echo( ",0,0" );
			}
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

	function processUpload() {
			$output_dir = $_SESSION["userDirectory"]."/";
			if( isset($_FILES["userfile"]) ) {
				
				if ($_FILES["userfile"]["error"] > 0) {
					errorExit( $_FILES["file"]["error"] );
				} else {
					move_uploaded_file($_FILES["userfile"]["tmp_name"],$output_dir."source.pdf");
					$uf = str_replace( ",", ".", $_FILES["userfile"]["name"]);
					processFile( $uf, $_FILES["userfile"]["size"],$_FILES["userfile"]["type"] , $output_dir );
				}
			} else { errorExit( "No file!" ); }
			exit();
	}
	function processPDFURL() {
			$url = $_POST['url'];
			$output_dir = $_SESSION["userDirectory"]."/";

			if( isset( $url ) && $url != "" ) {
				if( !is_200( $url ) ) { errorExit( "File not found!" ); } 
				file_put_contents( $output_dir."source.pdf", fopen( $url , 'r'));
				processFile( basename( $url ), filesize( $output_dir."source.pdf" ), "application/pdf" , $output_dir );
			} else { errorExit( "No URL specified!" ); }
			exit();
	}
	function processPreviewRequest() {
			$output_dir = $_SESSION["userDirectory"]."/";
			$PDFp = new PDFParser();
			$PDFp->setPDFData( $_SESSION["pdfData"] );

			$pdfInfo = $PDFp->getInfo();
			$options  = $_POST['options'];
			$_SESSION["options"] = $options;
			
			$sizing  = $options['sizing'];
			$spreads  = $options['spreads'];
			$rotation = $options['rotation'];
			$scale    = $options['scale'];

			$pdfSize = $PDFp->getRectSize( $pdfInfo["mediabox"] );
			$pdfSize["width"] = floor( $pdfSize["width"]/2 )*2;
			$pdfSize["height"] = floor( $pdfSize["height"]/2 )*2;
			$rotall = ($rotation=="All");
			$baseW = $rotall?$pdfSize["height"]:$pdfSize["width"];
			$baseH = $rotall?$pdfSize["width"]:$pdfSize["height"];
			if( $spreads=="Horizontal" ) $baseW = $baseW/2;
			if( $spreads=="Vertical" ) $baseH = $baseH/2;
			$_SESSION["basew"] = $baseW;
			$_SESSION["baseh"] = $baseH;

			$PDFPages = makePDFPagesArray( $PDFp->getPDFPages() );
			$PFPages = makePFPagesArray( $PDFPages, $spreads, $rotation, $scale );
			$RenderQueue = makeRenderQueueArray( $PFPages, $PDFPages );
			file_put_contents ( $output_dir."renderqueue" , serialize( $RenderQueue ) );
			$crop = 0;	
			$targetResolution = getRenderResolution( Array("width"=>$baseW, "height"=>$baseH), 146, 146, $crop ); 
			$previewwidth = $targetResolution["width"];
			$previewheight = $targetResolution["height"];
			$dpi = $targetResolution["dpi"];			// az a felbontas, aminel a generalt pdf meretezes nelkul akkora lesz mint a lap.
			
			$DBConn = new DBConnection();
			$jobID = $DBConn->newRenderJob( $output_dir, count( $RenderQueue ), $previewwidth, $previewheight, $previewwidth, $previewheight, $dpi );
			
			$threads = 4;
			$retina = 1;
			$supersample = 2;
			$preview = 1;
			$trial = 0;
			
			for( $i = 0; $i < $threads; $i++ ) {
				$command =	"/usr/bin/php5 -f background.php ".
							$output_dir."source.pdf $jobID $i $threads ".$output_dir."renderqueue $retina $crop $supersample $preview $trial 90";
				exec( "$command > /dev/null &", $arrOutput );
				
			}
			
			echo( "0,$jobID,$previewwidth,$previewheight" );
			exit();
	}
	function processRenderRequest() {
			$_SESSION["validpreview"] = false;
			$trial = 0;
			$output_dir = $_SESSION["userDirectory"]."/";
			$width = $_POST['width'];
			$height = $_POST['height'];
			$jpgquality = $_POST['jpgquality'];
			$quality = $_POST['quality'];
			$thumbheight = $_POST['thumbheight'];
			$pageorder = $_POST['pageorder'];
			$options  = $_SESSION["options"];
			$sizing   = $options['sizing'];
			$spreads  = $options['spreads'];
			$rotation = $options['rotation'];
			$scale    = $options['scale'];
			$baseW	  = $_SESSION["basew"];
			$baseH	  = $_SESSION["baseh"];

			$PDFp = new PDFParser();
			$PDFp->setPDFData( $_SESSION["pdfData"] );

			$pdfInfo = $PDFp->getInfo();

			$PDFPages = makePDFPagesArray( $PDFp->getPDFPages() );
			$PFPages = makePFPagesArray( $PDFPages, $spreads, $rotation, $scale );
			$orderedPFPages = makeOrderedPFPagesArray( $PFPages, $pageorder );
			$RenderQueue = makeRenderQueueArray( $orderedPFPages, $PDFPages );
		
			// save RenderQueue for the background processes...
			file_put_contents ( $output_dir."renderqueue" , serialize( $RenderQueue ) );
				
			$crop = 0;	
			$targetResolution = getRenderResolution( Array("width"=>$baseW, "height"=>$baseH), $width, $height, $crop ); 
			$renderwidth = $targetResolution["width"];
			$renderheight = $targetResolution["height"];
			$dpi = $targetResolution["dpi"];

			$thumbResolution = getRenderResolution( Array("width"=>$baseW, "height"=>$baseH), 10000, $thumbheight, $crop ); 
			$thumbwidth = $thumbResolution["width"];
			$thumbheight = $thumbResolution["height"];
			
			$DBConn = new DBConnection();
			$jobID = $DBConn->newRenderJob( $output_dir, count( $RenderQueue ), $renderwidth, $renderheight, $thumbwidth, $thumbheight, $dpi );
			$threads = __THREADS__;
			$retina = 0;
			$supersample = $quality;
			$preview = 0;

			for( $i = 0; $i < $threads; $i++ ) {
				$command =	"/usr/bin/php5 -f background.php ".
							$output_dir."source.pdf $jobID $i $threads ".$output_dir."renderqueue $retina $crop $supersample $preview $trial $jpgquality";
				exec( "$command > /dev/null &", $arrOutput );
			}
							
			$_SESSION["renderdpi"] = $dpi;
			echo( "0,$jobID" );
			$links = makeLinksArray( $orderedPFPages, $PDFPages, $renderwidth, $renderheight, $dpi, $scale );
			file_put_contents ( $output_dir."links.txt" , str_replace( "    ", "\t", print_r( $links, true) ) );
			$_SESSION["links"] = $links;
			exit();
	}
	function processGenerateScripts() {
			
			$_SESSION["validpreview"] = false;
			
			$output_dir = $_SESSION["userDirectory"]."/";		// WORK directory
			$copyright = $_POST['copyright'];
			$key = $_POST['key'];
			if( $key == "" ) {
				$key = __DEFAULTKEY__;
				$copyright = __DEFAULTCOPYRIGHT__;
			}

			$configoptions = $_POST['configoptions'];
			$embedded = ($_POST['embedded']=="true");
			$preview = $_POST['preview'];
			$bookid = $_POST['bookid'];
			$bookname = $_POST['bookname'];
			$_SESSION["bookid"] = $bookid;
			$datafolder = $configoptions["datafolder"];
			$pageorder = $_POST['pageorder'];

			echo("0,preview generated, ");
			
			if( $preview > 0 ) { 
				$embedded = true;
				$filecopy = false;	// do not copy any of the files...
				$cssfilepath = $htmlfilepath = "file.php?name=";
				
				$copyright = __PREVIEWCOPYRIGHT__;
				$key = __PREVIEWKEY__;
				
			} else {
				$filecopy = true;
				$htmlfilepath = $datafolder;
				$cssfilepath = "css/";
				$jsfilepath = "js/";
			}

			$havecover = $configoptions["hardcover"] || $configoptions["largecover"];
			$alwaysopened = $configoptions["alwaysopened"];
			
			$links = $_SESSION["links"];
			
			$content = "";
			$config = "";
			$mp = count($pageorder);
			$dif = $alwaysopened? 1: 2;
			$mep = $mp + ($mp%2) -1 -$dif;
			for( $i=0; $i<$mp; $i++ ) {
				$class = "page";
				$pagelinkshtml = generatePageLinkHtml( $links, $i );
				if( ( $i<$dif || $i>$mep ) && $havecover ) $class = "cover";
				$content .= "<div class='$class' data-background-file='".$htmlfilepath."page".$i.".jpg'";
				if( $configoptions["thumbenabled"]=="true" && $pageorder[$i]["thumbnail"]=="true" )
					$content .= " data-thumbnail-image='".$htmlfilepath."page".$i."_th.jpg'";
				$content .= " data-page-label='t".$links[ $i ][ "pdfpage" ]."'>$pagelinkshtml</div>";
				if( $i < $mp-1 ) $content .= "\n\t\t\t";
			}

			$nl = "\n\t\t\t\t";
			
			$data = file_get_contents("files/pageflip5_for_pdf/index-tpl.html");
			$controlbardata = "\n".file_get_contents("files/pageflip5_for_pdf/common/controlbar_svg.html");
			
			$w = $configoptions["pagewidth"];
			$h = $configoptions["pageheight"];
			$crop = 0;
			
			$baseW = $_SESSION["basew"];
			$baseH = $_SESSION["baseh"];
			$targetResolution = getRenderResolution( Array("width"=>$baseW, "height"=>$baseH ), $w, $h, $crop ); 
			$w = $targetResolution["width"];
			$h = $targetResolution["height"];

			$controls = ($configoptions["controlbar"]=="true");
			$marginbottom = ($controls? ($configoptions["showcopyright"]=="true"?88: 64): 32);
			
			$hardcover = $configoptions["hardcover"];
			$pa = $hardcover=="false"? "true": "false";
			
			$config .= "PageWidth: ".$w.",$nl";
			$config .= "PageHeight: ".$h.",$nl";
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
				$th = $configoptions["thumbnailheight"];
				$tw = floor( $baseW*($th/$baseH) );
			
				$config .= "Thumbnails: true,$nl";
				$config .= "ThumbnailsHidden: true,$nl";
				$config .= "ThumbnailWidth: $tw,$nl";
				$config .= "ThumbnailHeight: $th,$nl";
				$config .= "ThumbnailsToFront: ".$configoptions["thumbtop"].",$nl";
				if( $configoptions["thumbtop"] == "false" ) $config .= "MarginTop: ".(32+$th).",$nl";
				if( $configoptions["thumbautohide"]=="true" ) $config .= "ThumbnailsAutoHide: 5000,$nl";
			}
			
			$config .= "ShareLink: window.location.href,$nl";
			$config .= "ShareText: '".$configoptions["sharemsg"]."',$nl";
			$config .= "ShareVia: '".$configoptions["sharevia"]."',$nl";
			$config .= "ShareImageURL: '".$datafolder."page".$configoptions["sharepageimage"].".jpg',$nl";
			
			if( $preview > 0 ) {
				//$config .= "FullScale: true,$nl";
			}
			if( !$embedded ) {
				$config .= "PageDataFile: '".$datafolder."pageorder.html',$nl";
				if( $controls ) $config .= "ControlbarFile: '".$datafolder."controlbar_svg.html',$nl";
			}
			
			$config .= "DisableSelection: true,$nl";
			$config .= "CenterSinglePage: ".$configoptions["centersinglepage"].",$nl";
			$config .= "SinglePageMode: ".$configoptions["singlepagemode"].",$nl";
			$config .= "ShowCopyright: ".$configoptions["showcopyright"].",$nl";
			//$config .= "StartPage: 1,$nl";
			$config .= "Copyright: '$copyright',$nl";
			$config .= "Key: '$key'";

			if( !$embedded ) file_put_contents( $output_dir."pageorder.html", $content );

			// do tag replacements or whatever you want
			
			$data = str_replace("### BOOK NAME ###",				$bookname, 							$data);
			$data = str_replace("### CUSTOM CSS LINK ###",			$cssfilepath."pageflip-custom.css", $data);
			$data = str_replace("### EMBEDDED CONTENT ###",			$embedded? $content: "",			$data);
			$data = str_replace("### EMBEDDED CONTROLBAR ###",		(($controls && $embedded)? "<div class='controlbar'>$controlbardata\t\t\t</div>": ""), $data);
			$data = str_replace("### EMBEDDED CONFIG OPTIONS ###",	$config,							$data);
			$data = str_replace("### BOOK ID ###", 					$bookid, 							$data);
			
			//save it back:
			file_put_contents($output_dir."preview.html", $data);

			$_SESSION["validpreview"] = true;
			
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
				file_put_contents($output_dir."pageflip-custom.css", $css);
				
			
			if( $preview==0 ) {
				$zname = "pageflip5_package_($bookid)";
				$zipfile = $output_dir.$zname.".zip";
				if( file_exists( $zipfile ) ) unlink($zipfile);
				$zip = new ZipArchive;
				$zip->open($zipfile, ZipArchive::CREATE);

				
				$datapath = "$zname/$datafolder";
				
				$zip->addFile( $output_dir."pageflip-custom.css", "$zname/css/pageflip-custom.css");
				$zip->addFile( "files/pageflip5_for_pdf/css/pageflip.css", "$zname/css/pageflip.css");
				$zip->addFile( "files/pageflip5_for_pdf/js/pageflip5-min.js", "$zname/js/pageflip5-min.js");
				$zip->addFile( "files/pageflip5_for_pdf/js/jquery-1.11.1.min.js", "$zname/js/jquery-1.11.1.min.js");
				
				if( !$embedded ) { 
					$zip->addFile( $output_dir."pageorder.html", $datapath."pageorder.html");
					$zip->addFile( "files/pageflip5_for_pdf/common/controlbar_svg.html", $datapath."controlbar_svg.html");
				}
				
				for( $i=0; $i<$mp; $i++ ) {

					$zip->addFile( $output_dir."page$i.jpg", $datapath."page$i.jpg"  );
					if( $configoptions["thumbenabled"]=="true" && $pageorder[$i]["thumbnail"]=="true" ) $zip->addFile( $output_dir."page".$i."_th.jpg", $datapath."page".$i."_th.jpg"  );
					
				}
				
				$zip->addFile( $output_dir."preview.html", "$zname/index.html"  );
				$zip->close();
			}
			
			echo("0,generation done,$preview");			
			
			exit();
	}	
	function processDownload() {
			
			$output_dir = $_SESSION["userDirectory"]."/";		// WORK directory

			$bookid = $_SESSION["bookid"];
			$zipfile = $output_dir."pageflip5_package_($bookid).zip";
			
			if (file_exists($zipfile)) {

				header('Content-Description: File Transfer');
				header('Content-Type: application/x-unknown');
				header("Content-Disposition: attachment; filename=pageflip5_package_($bookid).zip");	//.basename($zipfile));
				header('Content-Transfer-Encoding: binary');
				header('Expires: 0');
				header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
				header('Pragma: public');
				header('Content-Length: ' . filesize($zipfile));
				ob_clean();
				flush();
				readfile($zipfile);
				exit;
			}
		
			exitclose();
	}	
	function processExit() {
			$userdir = $_SESSION["userDirectory"];
			if ( file_exists( $userdir ) ) {
				deleteDirContent( $userdir );
			}
			session_destroy();
			echo( "0,exit successfull");
	}
	function getTime() {
		return microtime(true);
	}
	
	function errorExit( $msg ) {
		echo( "-1,".$msg);
		exit();
	}
	
	function deleteDirContent( $userdir ) {
		$files = glob( "$userdir/*" ); // get all file names
		foreach( $files as $file ){ // iterate files
			if( is_file( $file ) ) unlink($file); // delete file
		}
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
		$data[ "part" ]		= $part;	//? nem biztos hogy kell...
		$data[ "rotated" ]	= $rot;
		$data[ "thumb" ]	= $thumb;
		$data[ "mdpi" ]		= $mdpi;	//$pdfpages[ $i ][ "mdpi" ][ $scale ];
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