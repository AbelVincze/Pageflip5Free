/*
to do:
- low resolution preview
- download page
	- download link
	- alert: - offline compatibility
			 - domain restriction
- restore session after login.
- page order ( delete page, set thumbnails)

- disable preview only if really made changes...

- fixed:
	* file size check - caused large file to be uploaded then rejected by the server, and app stalling.
	* post var size in php ini - caused books with mor than 300 page to not generated sucessfully
	

	todo v2:
	- side bar tips
		- generate utan preview, majd barmit modositunk ujra
		- new opload keep settings!
		- advanced options to fine tune
		- subscribe for 4x speed
		- Ten Pack and upper 2x speed
		- try faster (1 time for everyone)
		
	- side bar quality check
	
	pageorder:
	- set/reset all thumbs
	- reset page order to default.
	- thumbs title (PDFpage, page, spread, part, rotated, pdfsize)

2015/10/01
- added regex URL fix
- removed added mediabox/bleedbox/croptbox/trimbox support
- added crop-box rendering all the time...

*/
var licenseid,
	trial,
	licensekey,
	
	pdfinfo = {},		// nehany info a pdf-rol (nev, oldalszam, pixelmeret @72 dpi)
	forcemore = true,	// ellenorizze hogy van e plusz lap a kiszamolthoz kepest
	forced,
	
	pagenum,			// saved when working with multiple pages online
	pagecnt,
	rawpage,
	basepageorder,
	pageorder,
	
	gen = 0,			// frissitesek, hogy a kepek is frissuljenek.
	unsavedform = false,
	view = 0,			// authenticate, 1 - Upload, 2 - settings, 3 - download
	canswitch = false,
	switching = false,
	previewgenerated = false,
	bookgenerated = false,
	maxgeneratedpage = 0,
	procbtns = [ "", "#pupload", "#psettings", "#pdownload" ],
	
	presets = [ { pagewidth: 480, pageheight: 600, thumbnailheight: 120 },
				{ pagewidth: 680, pageheight: 800, thumbnailheight: 140 },
				{ pagewidth: 930, pageheight: 980, thumbnailheight: 160 },
				{ pagewidth: 2048, pageheight: 2048, thumbnailheight: 160 }	],
	qualities = [ 1, 2, 3, 4 ],
	jpgquality = 75,

	lastdatafolder = "pages/",
	
	preset = 2,
	quality = 2,
	
	importoptions,
	lastimportoptions,
	previewsgentimer,
	configoption,
	bookid,
	bookname,
	embedded,
	previewmode,
	backgroundcolor,
	pagebackgroundcolor,
	controlscolor,
	controlshoveredcolor,
	controlbarbackcolor,
	copyright,
	defcopyright = "©2015 pageflip-books.com",
	urllist,
	key,
	
	pageorder,
	previewgenerated,
	downloading = false,
	startTime, showTime, sec, min, hour, lastcheck,
	
	selectedsetting = -1,
	canselect = true,
	settingspanels = [ "#settings-book", "#settings-controls", "#settings-sharing", "#settings-export", "#settings-colours", "#settings-info" ],
	settingsbuttons = [ "#sbook", "#scontrols", "#ssharing", "#sexport", "#scolours", "#sinfo" ],
	shadowopacities = [ 0.1, 0.15, 0.2, 0.3, 0.5 ],
	advancedmode,
	startadvancedmode = false,
	canceljob = false,
	licensed = licensed || false,
	processor = licensed?"process_converter_licensed.php":"process_converter.php",
	maxuploadsize = 128;	// in MB
	

$(document).ready(function() {
	console.log("processor: "+processor);

	if( licensed ) {
		
		//licenseid = 0;
		trial = false;
		
		$("#login").css( { display: "none" } );
		switchtoupload();
		showProcessorder();
		
	}
	/*
	Ezen a ponton minden inicializalatlan, tehat most fogunk belepni es utana ami tortenik mind kesobb fog, az oldal ujratoltese nelkul.
	Es itt kellene megoldani azt is, hogy sima oldalfrissitesnel belepve maradjunk...
	*/
	$thelist = $("#pageorderlist");
	$thelist.sortable();
	$thelist.disableSelection();
	$thelist.on( "sortchange", function( e, ui ) {
		bookgen(false);
	});
	
	enableswitch( false );
	// License key SUBMIT
	$('#validator').submit(function() {
		process_license();
		return false;
	} );
	
	// Upload SUBMIT
	var uploadoptions = {
	    beforeSend: function() {
			//clear everything
			resetProgressBar("#uplprogress");
			resetRemainingTime();
			enableswitch( false );
			$('#userfile').attr('disabled',true);
			enableUploadButton( false );
			enableGetPDFButton( false );
			$("#uplprogress").css( { opacity: 0, display: "block" } );
			setTimeout( function() {
				$("#uplprogress").css( { opacity: 1 } );
				//fix_info_panel_height();
			} , 20 );
		},
		uploadProgress: function( event, position, total, percentComplete) {
			updateProgressBar( "#uplprogress", (position/total)*100 );
			updateProgressMessage( "#uplprogress", "Uploading PDF file", calculateRemainingTime( position , total ) );
		},
		complete: function( response ) {
			console.log( response.responseText );
			updateProgressBar( "#uplprogress", 100 );
			//processUpload( response.responseText );
			resp = response.responseText.split(",");
			if( resp[0] == 0 ) {
				processUpload( resp );
			} else {
				reupload( "<font color='red'>ERROR: "+resp[1]+"</font>" );
			}
		},
		success: function() {
			//console.log( "success "+uploadSuccess );
		},
		error: function() {
			reupload( "<font color='red'> ERROR: unable to upload file</font>" )
		},
		data: { func: 2 }
	 
	};
	
	// UPLOADING
	$("#userfile").change( function() {
		//alert(this.files[0].size);
		var fs = this.files[0].size;
		if( fs >= (maxuploadsize*1024*1024) ) {
			alert("Your file is too big ("+fileSize(fs)+")\nThe maximum allowed file size is "+maxuploadsize+" MB.");
		} else {
			$("#uploadform").ajaxSubmit( uploadoptions );
		}
		return false;
	} );

	// Exit Warning
	$(window).on('beforeunload', function(e) {
    	writeCookies();
    	if (unsavedform && !downloading) return "Your current editing will be lost!";
    	downloading = false;
	});
	$("#hiddenclick").on( "click", function() { previewClick(); } );
	
    backgroundcolor			= "#444444";
    pagebackgroundcolor		= "#888";
    controlscolor			= "rgba(255,255,255,0.5)";
    controlshoveredcolor	= "#FFAA00";
    controlbarbackcolor		= "rgba(68,68,68,0.35)";

	$("#backgroundcolor").spectrum({
	    color: backgroundcolor,
	    showInput: true, showButtons: false, change: function(color) { backgroundcolor = color.toHexString(); }
	});
	$("#pagebackgroundcolor").spectrum({
	    color: pagebackgroundcolor,
	    showInput: true, showButtons: false, change: function(color) { pagebackgroundcolor = color.toRgbString(); }
	});
	$("#controlscolor").spectrum({
	    color: controlscolor, showAlpha: true,
	    showInput: true, showButtons: false, change: function(color) { controlscolor = color.toRgbString(); }
	});
	$("#controlshoveredcolor").spectrum({
	    color: controlshoveredcolor, showAlpha: true,
	    showInput: true, showButtons: false, change: function(color) { controlshoveredcolor = color.toRgbString(); }
	});
	$("#controlbarbackcolor").spectrum({
	    color: controlbarbackcolor, showAlpha: true,
	    showInput: true, showButtons: false, change: function(color) { controlbarbackcolor = color.toRgbString(); }
	});
		
	readCookies();
	settings_resetHandlers();
	keep_alive_session();
} );

// VIEW SWITCH ---------------------------------------------------------------------------------------


function switchtoupload() {
	$("#pdfupload").css( { display: "block" } );
	setTimeout( function() {
		$("#pdfupload").css( { opacity: 1 } );
		} , 20 );
	enableUploadButton( true );
	enableGetPDFButton( true );
	$('#userfile').attr('disabled',false);
	$('.comment').remove();
	view = 1;
	enableprocbtn( view );
	switching = false;
}
function hideupload( callback ) {
	//console.log("HIDE UPLOAD");
	switching = true;
	updateProgressMessage( "#uplprogress", "" );
	$("#uplprogress").css( { opacity: 0 } );

	$("#pdfupload").css( { opacity: 0 } );
	setTimeout( function() {
		updateProgressBar( "#uplprogress", 0 );
		$("#pdfupload").css( { display: "none" } );
		$("#uplprogress").css( { display: "none" } );
		disbleprocbtn( view );
		callback();
	} , 520 );
}
function showexit() {
	if( licensed ) return;
	$("#exitpanel").css( { display: "block" } );
	setTimeout( function() { $("#exitpanel").css( { opacity: 1 } ); } , 20 );

}
function reupload( msg ) {
	enableUploadButton( true );
	enableGetPDFButton( true );
	updateProgressMessage( "#uplprogress", msg );
	updateProgressBar( "#uplprogress", 0 );
	$('#userfile').attr('disabled',false);
	$('.comment').remove();
}

function switchtosettings() {
	enableswitch( false );
	$("#pdfsettings").css( { display: "block" } );
	setTimeout( function() { $("#pdfsettings").css( { opacity: 1 } ); } , 20 );
	view = 2;
	enableprocbtn( view );

	advancedMode( advancedmode!==undefined? advancedmode: startadvancedmode );
	if( !previewgenerated ) {
		enableGenerateDownload( false );
	} else {
		enableGenerateDownload( true );
		enableswitch( true );
	}
	switching = false;
}
function hidesettings( callback ) {
	//console.log("HIDE SETTINGS");
	switching = true;
	$("#pdfsettings").css( { opacity: 0 } );
	setTimeout( function() {
		$("#pdfsettings").css( { display: "none" } );
		disbleprocbtn( view );
		callback();
	} , 520 );
}

function switchtodownload() {
	enableswitch( false );
	$("#pdfdownload").css( { display: "block" } );
	setTimeout( function() { $("#pdfdownload").css( { opacity: 1 } ); } , 20 );
	view = 3;
	enableprocbtn( view );
	
	if( $("input[name='domain']:checked").val() == "Offline" ) {
		$(".offlineonly").css( { display: "block" } );
		if( $("input[name='htmlstorage']:checked").val()=="Embedded" ) {
			$(".externalstorage").css( { display: "none" } );
		} else { $(".externalstorage").css( { display: "block" } ); }
	} else { $(".offlineonly").css( { display: "none" } ); }
	
	if( !bookgenerated ) generate_pagefilesINIT();	// A download-ra valtas utan, ha kell konvertalunk!!!
	else enableswitch( true );

	switching = false;
}
function hidedownload( callback ) {
	//console.log("HIDE DOWNLOAD");
	switching = true;
	$("#pdfdownload").css( { opacity: 0 } );
	setTimeout( function() {
		$("#pdfdownload").css( { display: "none" } );
		disbleprocbtn( view );
		callback();
	} , 520 );
}

function switchto( pview ) {
	if( !canswitch || switching ) return;
	switch( pview ) {
		case 1: 
			if( view == 2 || view == 3 ) hidethenswitch( switchtoupload );
			break;
		case 2:
			if( view == 1 || view == 3 ) hidethenswitch( switchtosettings );
			break;
		case 3:
			if( view == 2 || (previewgenerated && view==1) ) generate();
			break;
	}
}
function hidethenswitch( callback ) {
	switch( view ) {
		case 1: hideupload( callback ); break;
		case 2: hidesettings( callback ); break;
		case 3: hidedownload( callback ); break;
	}
}

function enableprocbtn( view ) {
	$(procbtns[view]).addClass("selected");
}
function disbleprocbtn( view ) {
	$(procbtns[view]).removeClass("selected");
}
// PDF Info...
function process_license(){
	licensekey = $('#licensekey').val();
	$('#licsubmit').attr('disabled',true);
	//writeCookies();
	$('.error').remove();
	$('.comment').remove();
		$.ajax({	type: "POST",
					url: processor,
					data: { licensekey:licensekey, func:1 }
				}).done( function( result ) {
					//$("#output").val( "" );
					console.log( "result: "+result );
					
					var resp = result.split(",");
					if( resp[0]==-1 ) {
						$("#licensekey").after("<br><span class='error'>"+resp[1]+"</div>");
						$('#licsubmit').attr('disabled',false);
					} else {
						//$("#licensekey").css("display", "none" ).after("<span class='comment'>"+resp[1]+" ("+resp[2]+")</div>");
						licenseid = resp[2];
						if( resp[3] ) {
							trial = resp[3];
						}
						// Licenc kulcs ok -> upload
						writeCookies();
						
						$("#login").css( { opacity: 0 } );
						setTimeout( function() {
							$("#login").css( { display: "none" } );
							switchtoupload();
							showProcessorder();
						} , 520 );
						
						
					}
				});
	//*/
}
function update_pdf_infotext() {
	var pinfo = "";
	if( pdfinfo.rotated || pdfinfo.spreads ) {
		pinfo = " (";
		if( pdfinfo.rotated ) pinfo += pdfinfo.rotated+" rotated"+(pdfinfo.spreads?", ":"");
		if( pdfinfo.spreads ) pinfo += pdfinfo.spreads+" spead"+(pdfinfo.spreads>1?"s":"");
		pinfo += ")";
	}
	if( pdfinfo.constantpagesize==0 ) {
		pinfo += " various sizes";
	}
	var info =	"<p><span>"+pdfinfo.name+"</span><br>"+
				fileSize( pdfinfo.filesize )+"<br>"+
				pdfinfo.pages+" pages"+pinfo+"<br>"+
				Math.round(pdfinfo.width)+"x"+Math.round(pdfinfo.height)+" px @ 72 dpi</p>"+
				"<p>Total number of pages to generate: "+pdfinfo.maxpages;
	if( pdfinfo.links ) {
		info +=	"<br>"+pdfinfo.links+" links:<br>"+
				+pdfinfo.pagelinks+" page links<br>"+
				+pdfinfo.urllinks+" URL links";
	}
	info += "</p>";
	
	$("#uploadresult").html( info );
	fix_info_panel_height();
}
function showProcessorder() {
	$("#processorder").css( { display: "block" } );
	setTimeout( function() { $("#processorder").css( { opacity: 1 } ); } , 20 );

}

function fix_info_panel_height() {
	if( selectedsetting==5 ) $("#settingspanels").css( { height: $( settingspanels[selectedsetting] ).height() } );
}

// enable disable things
function enablePreview( enabled ) {
	if( enabled ) {
		$("#ppreview").removeClass("disabled");
		
		
	} else {
		$("#ppreview").addClass("disabled");
		
		
	}
}
function enableGenerateDownload( enabled ) {
	if( enabled ) {
		$("#generatebutton").removeClass("disabled");
	} else {
		$("#generatebutton").addClass("disabled");
	}
}
function enableUploadButton( enabled ) {
	if( enabled ) {
		$("#uploadbutton").removeClass("disabled");
	} else {
		$("#uploadbutton").addClass("disabled");
	}
}
var pdfurlbtnenabled = false;
function enableGetPDFButton( enabled ) {
	pdfurlbtnenabled = $("#onlinefile").val().length > 0;
	if( enabled ) {
		$("#onlinefile").removeAttr( "disabled" )
	} else {
		$("#onlinefile").attr( "disabled", "disabled" );
	}
	if( pdfurlbtnenabled && enabled ) {
		$("#pdfurlbutton").removeClass("disabled");
	} else {
		$("#pdfurlbutton").addClass("disabled");
	}
	//pdfurlbtnenabled = enabled;
}
function bookgen( isit ) {
	bookgenerated = isit;
	enablePreview( isit );
}
function enableswitch( enabled ) {
	canswitch = enabled;
	if( enabled ) {
		$("#processorder").removeClass("disabled");
	} else {
		$("#processorder").addClass("disabled");
	}
}

// UPLOADED FILE -------------------------------------------------------------------------------------
function get_pdf_button() {
	$('.error').remove();
	//$('.comment').remove();
	if( !pdfurlbtnenabled ) return;
	
	url = $("#onlinefile").val();
		//bookgen(false);
	if( url.length>0 ) use_online_file( url );
	// pdfurlbutton
}
function use_online_file( url ) {
	enableGetPDFButton( false );
	enableUploadButton( false );
	
	$("#onlinefile").after("<span class='comment'>Downloading PDF from online source</div>");
	
	$.ajax({	type: "POST", url: processor,
				data: {	url: url, func: 10 }
			}).done( function( result ) {
				console.log( result );
				$('.comment').remove();

				resp = result.split(",");
				if( resp[0] == 0 ) {
					processUpload( resp );
				} else {
					$("#onlinefile").after("<br><span class='error'>"+resp[1]+"</div>");
					enableUploadButton( true );
					enableGetPDFButton( true );
				}

			});
}
function processUpload( resp ) {
	//resp = result.split(",");
	//if( resp[0] == 0 ) {
		
		pdfinfo.name			= resp[1];				// A feltoltott file neve
		pdfinfo.filesize		= Number( resp[2] );	// Merete Byte-ban
		pdfinfo.pages			= Number( resp[4] );	// PDF oldalak szama
		pdfinfo.spreads			= Number( resp[5] );	// abban a spreadek szama
		pdfinfo.pfpages			= Number( resp[6] );	// PF konyv oldalainak szama (spread fixed)
		pdfinfo.links			= Number( resp[7] );	// Linkek szama a PDF-ben
		pdfinfo.pagelinks		= Number( resp[8] );	// Ebbol az oldalra mutato linkek szama
		pdfinfo.urllinks		= Number( resp[9] );	// Ebbol URL link
		pdfinfo.rotated			= Number( resp[10] );	// elforgatott oldalak szama
		pdfinfo.mediawidth		= Number( resp[11] );	// PDF MediaBox meret 72DPI-n
		pdfinfo.mediaheight		= Number( resp[12] );
		pdfinfo.previewwidth	= Number( resp[13] );	// preview merete
		pdfinfo.previewheight	= Number( resp[14] );
		pdfinfo.targeddir		= resp[15];				// Work Directory
		pdfinfo.constantpagesize = Number( resp[16] );	// Work Directory
		pdfinfo.bleedwidth		= Number( resp[17] );	// PDF BleedBox meret 72DPI-n
		pdfinfo.bleedheight		= Number( resp[18] );
		pdfinfo.cropwidth		= Number( resp[19] );	// PDF CropBox meret 72DPI-n
		pdfinfo.cropheight		= Number( resp[20] );
		pdfinfo.trimwidth		= Number( resp[21] );	// PDF TrimBox meret 72DPI-n
		pdfinfo.trimheight		= Number( resp[22] );


		pdfinfo.width			= pdfinfo.mediawidth;	// PDF MediaBox meret 72DPI-n
		pdfinfo.height			= pdfinfo.mediaheight;
		
		import_settings_reset();
		//console.log(" jobID: "+	pdfinfo.jobID );
		
									
		unsavedform = true;
		enableswitch( true );
		previewgenerated = false;
		
		
		
		bookgen(false);
		hideupload( switchtosettings );
		settingselect( 5 );	//info
		fix_info_panel_height();
		showexit();
		
		// regen igy indult a preview gen, de most mar fut a hatterben... valami figyelo kellene nekunk...
		// es egy halom kep placeholder..., uh a meret is kell!!!
		settings_resetBookName();
		//get_pdf_informations();		// es innen indul majd a preview generalas
		generate_previews();
	//} else {
	//	reupload( "<font color='red'>ERROR: "+resp[1]+"</font>" );
	//}
}


// GENERATE PREVIEW ----------------------------------------------------------------------------------
function getimportsettings() {
	importoptions = {};
	importoptions.sizing				= $( "input[name='pagesizing']:checked" ).val();
	importoptions.spreads				= $( "input[name='spreadhandling']:checked" ).val();
	importoptions.rotation				= $( "input[name='rotatehandling']:checked" ).val();
	importoptions.scale					= $( "input[name='pagesizehandling']:checked" ).val();
}
function generate_previews() {
	getimportsettings();
	lastimportoptions = $.extend({}, importoptions );

	enableswitch( false );
	previewgenerated = false;
	enableGenerateDownload( false );
	bookgen(false);
	gen++;

	//watch_previews( pdfinfo.pfpages );
	//var maxpages;	// = pdfinfo.pfpages;
	
	switch( importoptions.spreads ) {
		case "Auto":
			pdfinfo.maxpages = pdfinfo.pfpages;
			break;
		case "Off":
			pdfinfo.maxpages = pdfinfo.pages;
			break;
		case "Horizontal":
		case "Vertical":
			pdfinfo.maxpages = pdfinfo.pages*2;
			break;
	}
	console.log(" generate previews: "+pdfinfo.maxpages );
	
	update_pdf_infotext();

	resetProgressBar("#genprogress");
	resetRemainingTime();
	$("#genprogress").css( { display: "block", opacity: 0 } );
	setTimeout( function() {
		$("#genprogress").css( { opacity: 1 } );
		fix_info_panel_height();
	} , 20 );
	$("#pdfpreview").html("&nbsp;");
	$("#pageorderlist").empty();
	
	pdfinfo.rendercount = 0;
	basepageorder = [];
	canceljob = false;


		$.ajax({	type: "POST",
					url: processor,
					data: { func: 3,
							options: importoptions }
				}).done( function( result ) {
					console.log( "generate_previews result: "+result );
					var resp = result.split(",");
						//resp = mresp[0].split(",");
						//console.log("gen_preview result "+resp[0]);
					if( resp[0]=="0" ) {
						//callback( result );
						pdfinfo.jobID = Number( resp[1] );
						pdfinfo.previewwidth = Number( resp[2] );
						pdfinfo.previewheight = Number( resp[3] );
						for( var i=0; i<pdfinfo.maxpages; i++ ) add_preview_image_placeholder( i );
						watch_previews();
					} else {
						if( resp[1] == 0 ) session_expired_alert();
					}
				});
}

	function request_previews_gen() {
		console.log( "-request Render!!" );
		enableswitch( false );
		enableGenerateDownload( false );
		if( previewsgentimer ) clearTimeout( previewsgentimer );
		previewsgentimer = setTimeout( function() {
			console.log( "Start Render!!" );
			getimportsettings();
			//console.log( importoptions );
			//console.log( lastimportoptions );
		
			if( lastimportoptions &&
				importoptions.sizing == lastimportoptions.sizing &&
				importoptions.spreads == lastimportoptions.spreads &&
				importoptions.rotation == lastimportoptions.rotation &&
				importoptions.scale == lastimportoptions.scale ) {
				console.log("No changes, do not generate previews! " );
				enableswitch( previewgenerated );
				enableGenerateDownload( previewgenerated );
				return;		
			}
			previewsgentimer = undefined;
			canceljob = true;
			
			/*if( previewgenerated ){
				
			} else {
			//	updateProgressMessage(  "#genprogress", "Preview generating cancelled." );
			//	updateProgressBar( "#genprogress", 0 );
			}*/

			setTimeout( function() { generate_previews() }, 1000 );
			
		}, 2000 );
	}

// Watch background process progress
function watch_previews() {
	//pdfinfo.renderpages = pdfinfo.pfpages;
	watch_render( pdfinfo.jobID, watch_preview_callback );
}
function watch_render( jobID, callback ) {
		$.ajax({	type: "POST",
					url: "renderstatus.php",
					data: { jobid: jobID, cancel: canceljob }
				}).done( function( result ) {
					//console.log( "watch result: "+result );
					var resp = result.split(",");
						//resp = mresp[0].split(",");
						//console.log("gen_preview result "+resp[0]);
					if( resp[0]=="0" ) {
						callback( result );
					} else {
						// Cancel
						callback( -1 );
						
						
						
					}
				});
}
function watch_preview_callback( loaded ) {
	if( loaded == -1 ) {
		//cancel
		console.log(" CALLBACK: CANCELLED ");
		return;
	}
	
	
	var pages = loaded.split(","),
		count = pages.length-1;
	
	if( count>pdfinfo.rendercount ) {
		// vannak uj lapok, amiket most hozzaadunk a listahoz
		for( var i=pdfinfo.rendercount; i<count; i++ ) {
			add_preview_image( pages[i+1] );
			basepageorder.push( {
				//pdfpage: pdfpage,
				page: i,
				thumbnail: true,
				render: true//,
				//mode: mode	
			});
	
		}
		pdfinfo.rendercount = count;
		var percent = (count/pdfinfo.maxpages)*100;
		updateProgressBar( "#genprogress", percent );
		updateProgressMessage(  "#genprogress", "Previews generated: "+count+"/"+pdfinfo.maxpages, calculateRemainingTime(count, pdfinfo.maxpages) );
	}
	
	
	
	if( count >= pdfinfo.maxpages ) {
		//All pages was rendered successfully...
		// vegeztunk a preview-k generalasaval.
		updateProgressMessage(  "#genprogress", "Preview generating done." );
		$("#genprogress").css( { opacity: 0 } );
		enableswitch( true );
		previewgenerated = true;
		gen++;
		enableGenerateDownload( true );
		resetSharePageSelector();
		setTimeout( function() {
			updateProgressBar( "#genprogress", 0 );
			$("#genprogress").css( { display: "none" } );
			if( advancedmode ) fix_info_panel_height();
		}, 500 );
		if( !advancedmode ) settingselect( 3 );
		return;
	} else {
		//updateProgressMessage(  "#genprogress", "Previews generated: "+count+"/"+pdfinfo.maxpages, calculateRemainingTime(count, pdfinfo.maxpages) );
	}
	// not finished, keep looking...
	setTimeout( function() { watch_render( pdfinfo.jobID, watch_preview_callback ); }, 500 );
}
// Add new page images to the page order list.
function add_preview_image_placeholder( rawpage ) {
	//if(pdfpage==0) { $("#pdfpreview").html("<img src='"+filename+"?gen="+gen+"' width='"+width+"' height='"+height+"'>"); }
	
	
	var modestr = ["", " Rotated", "A Split", "B Split"],
		mode = 0,
		width = pdfinfo.previewwidth,
		height = pdfinfo.previewheight;
		
	
	$("#pageorderlist").append(
	
		"<div class='previewimage rendered thumbnailed' id='preview"+rawpage+
		"' style='width: "+width+"px; height: "+height+"px;' "+
		"data-page='"+rawpage+"' title='Page "+(rawpage+1)+"'>"+
		"<div class='previewosd' id='previewosd"+rawpage+"'>"+
			"<div class='render' onclick='toggleRender("+rawpage+")'></div>"+
		"</div>"+
		"<div class='thumbnail' id='"+rawpage+"' onclick='toggleThumbnail("+rawpage+")'></div>"+
		"</div>"
	
	);	
}
function add_preview_image( newpage ) {
	var width = pdfinfo.previewwidth,
		height = pdfinfo.previewheight;

	// ez itt randa!! nem ide kell!!!
	if( newpage==0 ) {
		$("#pdfpreview").html("<img src='"+pdfinfo.targeddir+"preview_page"+newpage+".jpg?gen="+gen+"' width='"+width+"' height='"+height+"'>");
		fix_info_panel_height();
	}
	$("#preview"+newpage).prepend( "<img src='"+pdfinfo.targeddir+"preview_page"+newpage+".jpg?gen="+gen+"' width='"+width+"' height='"+height+"'>" );
}

function toggleThumbnail( p ) {
	//console.log( "toggle thumbnail page "+p );
	basepageorder[p].thumbnail = !basepageorder[p].thumbnail;
	set_preview_classes( p );
	bookgen(false);
}
function toggleRender( p ) {
	//console.log( "toggle render page "+p );
	basepageorder[p].render = !basepageorder[p].render;
	set_preview_classes( p );
	bookgen(false);
}
function set_preview_classes( p ) {
	var prv = $("#preview"+p);
	if( basepageorder[p].thumbnail ) prv.addClass("thumbnailed");
	else prv.removeClass("thumbnailed");
	if( basepageorder[p].render ) prv.addClass("rendered");
	else prv.removeClass("rendered");
	//console.log( prv );
}

// GENERATE BOOK -------------------------------------------------------------------------------------
function getsettings() {
	
	preset								= $( "select[name='resolution'] option:selected" ).val();
	quality								= qualities[ $( "select[name='quality'] option:selected" ).val() ];
	embedded							= $("input[name='htmlstorage']:checked").val()=="Embedded";
	bookid								= $("#bookid").val();
	bookname							= $("#bookname").val();
	jpgquality							= $( "select[name='jpgquality'] option:selected" ).val();
	configoption = {};
	
	configoption.dropshadow				= $("#dropshadowenabled").is(':checked');
	configoption.dropshadowopacity		= shadowopacities[ $( "select[name='dropshadow'] option:selected" ).val() ];
	configoption.pageshadow				= $("#pageshadowenabled").is(':checked');
	configoption.pageshadowopacity		= shadowopacities[ $( "select[name='pageshadow'] option:selected" ).val() ];

	configoption.backgroundcolor		= backgroundcolor;
	configoption.backgroundenabled		= $("#backgroundenabled").is(':checked');
	configoption.pagebackgroundcolor	= pagebackgroundcolor;
	configoption.controlscolor			= controlscolor;
	configoption.controlshoveredcolor	= controlshoveredcolor;
	configoption.controlbarbackcolor	= controlbarbackcolor;
	configoption.controlbarbackenabled	= $("#controlbarbackenabled").is(':checked');
	//console.log("controlbarbackenabled: "+$("#controlbarbackenabled").is(':checked'));
	//console.log("backgroundenabled: "+$("#backgroundenabled").is(':checked'));

	configoption.RTL					= $("input[name='flipdir']:checked").val()=="rtl";
	configoption.vertical				= $("input[name='flipdir']:checked").val()=="vertical";
	
	configoption.hardcover				= $("#fliptype-hcover").is(':checked');
	configoption.hardpages				= $("#fliptype-hpages").is(':checked');
	configoption.singlepagemode			= $("#bookextraopts-singlepagemode").is(':checked');
	configoption.centersinglepage		= configoption.singlepagemode? false: $("#bookextraopts-centersinglepage").is(':checked');
	configoption.largecover				= $("#bookextraopts-lcover").is(':checked');
	configoption.roundedcorners			= $("#bookextraopts-rcorners").is(':checked');
	configoption.alwaysopened			= $("#bookextraopts-alwaysopened").is(':checked');
	
	configoption.controlbar				= $("#controlbar-enabled").is(':checked');
	configoption.controlbartop			= $("#controlbar-ontop").is(':checked');
	configoption.mousecontrol			= $("#flipcontrol-mouse").is(':checked');
	configoption.controlbarbtn			= $("#flipcontrol-buttons").is(':checked');
	configoption.pagerenabled			= $("#flipcontrol-input").is(':checked');
	configoption.hotkeys				= $("#flipcontrol-key").is(':checked');
	configoption.thumbenabled			= $("#thumbnails-enabled").is(':checked');
	configoption.thumbautohide			= $("#thumbnails-autohide").is(':checked');
	configoption.thumbtop				= $("#thumbnails-ontop").is(':checked');
	configoption.fullscreenenabled		= $("#controlbarextra-fullscreen").is(':checked');
	configoption.autoflipenabled		= $("#controlbarextra-autoflip").is(':checked');
	configoption.startautoflip			= $("#controlbarextra-startautoflip").is(':checked');

	configoption.shareprinterest		= $("#sharing-printerest").is(':checked');
	configoption.sharefacebook			= $("#sharing-facebook").is(':checked');
	configoption.sharetwitter			= $("#sharing-twitter").is(':checked');
	configoption.sharegoogle			= $("#sharing-googleplus").is(':checked');
	configoption.sharemsg				= $("#sharemsg").val();
	configoption.sharevia				= $("#sharevia").val();
	configoption.sharepageimage			= $( "select[name='shareimage'] option:selected" ).val();
	
	configoption.showcopyright			= $("#copyrightdisplay").is(':checked');

	configoption.pagewidth				= presets[preset].pagewidth;
	configoption.pageheight				= presets[preset].pageheight;									
	configoption.thumbnailheight		= presets[preset].thumbnailheight;

	var r = $("input[name='datastorage']:checked").val(),
		d = "";
	switch( r ) {
		case "same": break;
		case "subfolder": d="pageflipdata/"; break;
		case "custom": d=$("#datastoragefolder").val();
	}
	configoption.datafolder				= d;

	if( $("input[name='domain']:checked").val() == "Offline" ) {
		d = "offline";
	} else d = escape( $("#domain").val() );
	configoption.targetdomain			= d;

	//console.log( configoption );
}
function generate_pageorder() {

	var $pages = $("#pageorderlist").children(),
		l = $pages.length,
		pageorder = [];
		
	console.log( "number of pages: "+l );
	
	for( var i=0, data; i<l; i++ ) {
		data = $($pages[i]).data().page;
		//console.log( "pages: "+i+" data: "+data );

		if( basepageorder[data].render ) {
			pageorder.push( {
				//pdfpage: basepageorder[data].pdfpage,
				page: basepageorder[data].page,
				thumbnail: basepageorder[data].thumbnail//, 
				//mode: basepageorder[data].mode, 
			} );
		}
		
	}
	console.log( "Pageorder length: "+(pageorder.length) );


	return pageorder;
}
// ezzel inditjuk a rendert, ha van mit...
function generate() {
	if( !canswitch ) return;
	pageorder = generate_pageorder();
	if( pageorder.length>0 ) hidethenswitch( switchtodownload );
	else {
		if( !previewgenerated ) console.log("Previews first...");
		if( pageorder.length<1 ) console.log("No pages to render...");
	}
}

function generate_pagefilesINIT() {
	resetProgressBar("#higenprogress");
	resetRemainingTime();
	$("#higenprogress").css( { display: "block" } );
	$("#higenprogress").css( { opacity: 1 } );
	//$("#pagefiles").empty();
	$("#downloadcontent").css( { display: "none" } );
	gen++;
	getsettings();
	//generate_pagefile( pagecnt );		// Fallback... + return, mert a folytatas mar a custom rutin.
	
	// itt szepen elkuldjuk a konvertalashoz kello adatokat
	pdfinfo.rendercount = 0;
	$.ajax({	type: "POST", url: processor,
				timeout: 60000,
				data: {	width: presets[preset].pagewidth,
						height: presets[preset].pageheight,
						jpgquality: jpgquality,
						quality: quality,
						pageorder: pageorder,
						//thumbheight: (thumb?presets[preset].thumbnailheight:0),
						thumbheight: presets[preset].thumbnailheight,
						func: 5 }
			}).done( function( result ) {
				console.log( result );
				resp = result.split(",");
				
				if( resp[0] == 0 ) {
					
					pdfinfo.jobID  = Number( resp[1] );
					if( isNaN( pdfinfo.jobID ) ) {
						// megint baj van... (ha van)
						return;
					}
					
					// Ha minden oke, akkor itt indutjuk a figyelest!!!
					
					pdfinfo.rendercount = 0;
					//pdfinfo.renderpages = pdfinfo.pfpages;
					watch_render( pdfinfo.jobID, watch_render_callback );
					
					
					/*var filename = resp[2],
						width = resp[3],
						height = resp[4];
						$("#pagefiles").append(	"<img src='"+filename+"?gen="+gen+"' width='"+width+"' height='"+height+"'>");
					*/
					//generate_pagefilesCALLBACK(1);
				} else {//generate_pagefilesCALLBACK(0);
					
					// valami hiba tortenhetett...
					if( resp[1] == 0 ) session_expired_alert();
					
				}
			});
}
function watch_render_callback( loaded ) {
	var pages = loaded.split(","),
		count = pages.length-1;
	
	if( count>pdfinfo.rendercount ) {
		// vannak uj lapok, amiket most hozzaadunk a listahoz
		pdfinfo.rendercount = count;
		var percent = (count/pageorder.length)*100;
		updateProgressBar( "#higenprogress", percent );
		updateProgressMessage(  "#higenprogress", "Generating page files "+count+"/"+pageorder.length, calculateRemainingTime(count, pageorder.length) );
	}
	
	
	
	if( count == pageorder.length ) {
		//All pages was rendered successfully...
		// vegeztunk a preview-k generalasaval.
		updateProgressMessage(  "#higenprogress", "Page files generating done." );
		$("#higenprogress").css( { opacity: 0 } );
		
		enableswitch( true );
		bookgen(true);
		
		setTimeout( function() {
			$("#higenprogress").css( { display: "none" } );
			$("#downloadcontent").css( { display: "block" } );
			setTimeout( function() {
				$("#downloadcontent").css( { opacity: 1 } );
			}, 20 );
		}, 500 );
		return;

	} else {
		//updateProgressMessage(  "#higenprogress", "Generating page files "+count+"/"+pageorder.length, calculateRemainingTime(count, pageorder.length) );
	}
	// not finished, keep looking...
	setTimeout( function() { watch_render( pdfinfo.jobID, watch_render_callback ); }, 500 );
	
}

// GENERATE SCRIPTS ----------------------------------------------------------------------------------
function generate_scripts( preview ) {
	//console.log("generate scripts");
	getsettings();
	copyright =  $("#copyright").val();
	if( licensed ) {
		key =  $("#usedkey").val();
		if( key=="" ) copyright = "";
		urllist = "";
	} else {
		key = "";
		urllist = ( preview? "pageflip-world.com,185.51.65.142": configoption.targetdomain );
	}
	//generate_KeyAJAX( copyright, urls );
	generate_sciptsAJAX();
}
function generate_sciptsAJAX(  ) {
		$.ajax({	type: "POST", url: processor,
					data: {	func: 6,
							copyright: copyright,
							esccopy: escape(copyright),
							url: urllist,
							pageorder: pageorder,
							embedded: embedded,
							configoptions: configoption,
							bookid: bookid,
							bookname: bookname,
							preview: previewmode }
				}).done( function( result ) {
					console.log( result );
					resp = result.split(",");
					
					if( resp[0] == 0 ) {
						generate_scriptsCALLBACK();
					} else {
						if( resp[1] == 0 ) session_expired_alert();
					}
				});
}
function generate_scriptsCALLBACK() {
	if( previewmode==0 ) { 
		downloading = true;
		$("#downloadsubmit").submit();
		return;	// ez lesz a download funkcio
	}
	previewgenerated = true;
	//console.log("triggering link");
	//$("#hiddenclick").trigger( "click" );
}

// Progressbar routines ------------------------------------------------------------------------------
function resetProgressBar( pb ) {
	updateProgressMessage( pb, "" )
	updateProgressBar( pb, 0 )
	//$(pb).css( { opacity: 1 } );
}
function updateProgressBar( pb, percent ) {
	$(pb+" .bar").width(percent+'%');
	$(pb+" .percent").html(Math.floor(percent)+'%');
}
function updateProgressMessage( pb, msg, rt ) {
	if( rt ) {
		msg = (msg? msg+" - ": "" )+("Estimated remaining time: "+(rt.hour?"more than "+rt.hour+" hours":(rt.min?"more than "+rt.min+" minute"+(rt.min>1?"s":""):rt.sec+" second"+(rt.sec>1?"s":""))));
	}
	$(pb+" .progressmsg").html( msg );
	
}

function resetRemainingTime() {
	startTime = getNow().getTime();
	showTime = false;
	lastcheck = sec = min = hour = 0;
}
function calculateRemainingTime( item, maxitem ) {
	if( item*maxitem == 0 ) return;
	var now = getNow().getTime();
	
	if ( now-lastcheck>999 ) {
		lastcheck = now;
		var elapsed = now-startTime,
		remaining = (elapsed/item)*(maxitem-item),
		secs = Math.floor( remaining/1000 ),
		mins = Math.floor( secs/60 );
		hour = Math.floor( mins/60 );
	
		sec = Math.floor( secs%60 );
		min = Math.floor( mins%60 );
		hour = Math.floor( mins/60 );
	}
	
	if( sec>29 || min>0 || hour>0 ) showTime = true;
	if( showTime ) return { hour: hour, min: min, sec: sec };
	else return null;
		
}
function getNow() { return new Date(); }

// Display user friendly File size... ----------------------------------------------------------------
function fileSize( bytes ) {
	var size;
	if( bytes<1024 ) size = bytes+" Bytes";
	else if( bytes<1048576 ) size = (Math.ceil(bytes/10.24)/100)+" KB";
	else if( bytes<1073741824 ) size = (Math.ceil(bytes/10485.76)/100)+" MB";
	return size;
}

// Cookies
function writeCookies() {
	$.cookie("licensekey", $('#licensekey').val(), { expires: 1 } );
	$.cookie("domain", $('#domain').val());
	$.cookie("copyright", $('#copyright').val());
	$.cookie("datastoragefolder", $('#datastoragefolder').val());
	$.cookie("advancedmode", advancedmode );
	
	//$.cookie("ur", $('#urllist').val());
}
function readCookies() {
	$('#licensekey').val($.cookie("licensekey"));
	$('#domain').val($.cookie("domain")||"pageflip-books.com");
	$('#copyright').val($.cookie("copyright")||defcopyright);
	$('#datastoragefolder').val($.cookie("datastoragefolder")||"pages/");
	startadvancedmode = $.cookie("advancedmode")=="true";
	console.log( "ADV mode cookie: "+startadvancedmode );
	//$('#urllist').val($.cookie("ur"));
	
}
function validateDomain() {
	var domains = $('#domain').val(),
		validDomains = domains.replace( /(https?:\/\/|www\.|\/[^\/,]*)/gi, "" );
	$('#domain').val(validDomains||"pageflip-books.com");
}
// Main features
function preview() {
	if( bookgenerated ) {
		window.open("preview.php", "Preview", "height=768, width=1024, resizable=1, scrollbars=0, status=1, location=0, menubar=0, toolbar=0");
		previewmode = 2;
		generate_scripts( previewmode );
	} 
}
function download() {
	if( bookgenerated && canswitch ) {
		previewmode = 0;
		generate_scripts( previewmode );
	}
}

// ----------------------------------------------------------- SETTING FORMs HANDLERS -----------------------------------------------------------------
function advancedMode( enabled ) {
	//console.log(" Advanced mode: "+enabled+" - nowc: "+nowritecookies );
	if( enabled == advancedmode ) return;
	advancedmode = enabled;
	writeCookies();
	$("#oadvanced").css( { display: (advancedmode?"none": "block") } );
	var stat = (advancedmode?"block": "none");
	$("#oeasy").css( { display: stat } );
	$(".adv").css( { display: stat } );
	if( advancedmode ) {
		$(".advancedexport").css({ display: "block" });	//hide( slow );
		if( selectedsetting==3 ) $("#settingspanels").css( { height: $( settingspanels[selectedsetting] ).height() } );
		if( selectedsetting==5 ) fix_info_panel_height();
	} else {
		$(".advancedexport").css({ display: "none" });	//hide( slow );
		if( selectedsetting==3 ) $("#settingspanels").css( { height: $( settingspanels[selectedsetting] ).height() } );
		if( selectedsetting==5 ) fix_info_panel_height();
		if( selectedsetting<3 ) {
			settingselect( 3 );
		}
	}
}		
function settingselect( btn ) {
	//console.log( "Process #"+btn );
	if( !canselect ) return;
	if( btn == 6 ) {
		// switch to easy mode;
		advancedMode( false );
		return;
	}
	if ( btn == 7 ) {
		// switch to advanced mode
		advancedMode( true );
		return;
	}
	if( btn == selectedsetting ) return false;
	
	canselect = false;
	var delay = 20;
	if( selectedsetting >= 0 ) {
		// elozoleg kivalasztott menut toroljuk
		delay = 270;
		$( settingspanels[selectedsetting] ).css( { opacity: 0 } );
		$( settingsbuttons[selectedsetting] ).removeClass("selected");
		setTimeout( function() { $( settingspanels[selectedsetting] ).css( { display: "none" } ); }, 250 );
	}
	$("#settingspanels").css( { height: $( settingspanels[btn] ).height() } );
	$( settingsbuttons[btn] ).addClass("selected");
	$( settingspanels[btn] ).css( { display: "block" } );
	setTimeout( function() { $( settingspanels[btn] ).css( { opacity: 1 } ); }, delay );
	setTimeout( function() { selectedsetting = btn; canselect = true; }, 600 );
	
}

function validateSettings( reset ) {
	reset = reset || false;
	
	if( reset ) {
		settings_resetBookName();
	}
	
}
function settings_resetBookName() {
	var name = pdfinfo.name;
	if( name.substr( -4 ) == ".pdf" ) name = name.substr(0, name.length-4 );
	$("#bookname").val( name );
	$("#bookid").val( settings_validName( name.toLowerCase() ) );
}
function settings_validName( str, file ) {
	file = file || false;
	var validIDChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-",
		out = "";
		
	for( i = 0; i<str.length; i++ ) {
		var s = str.substr( i, 1 );
		if( s==" " ) s="-";
		var	n = validIDChars.lastIndexOf( s );
		if( n<0 ) continue;
		if( out.length==0 && n<10 && !file ) out += "_";
		out += s;
	}
	return out;
}
function settings_resetHandlers() {
	// change rules for export settings
	$("input[name='datastorage']").change( function() {
		//console.log("datastoragefolder change "+$(this).val() );
		if( $(this).val()=="custom" )	$("#datastoragefolder").removeAttr( "disabled" ).focus();
		else $("#datastoragefolder").attr( "disabled", "disabled" );
	});
	$("#datastoragefolder").blur( function() {
		var test =  $(this).val().split("/"),
			out = "";
		for( var i=0; i<test.length; i++ ) {
			if(test[i]) out += settings_validName( test[i], true )+"/";
		}
		if( out=="" ) out = lastdatafolder;
		lastdatafolder = out;
		$(this).val( out );
		
	});
	$("#copyright").blur( function() {
		if( $(this).val() == "" ) {
			$(this).val( defcopyright );
		}
	});
	$("#domain").blur( function() {
		validateDomain();
		$("#domain").removeAttr( "disabled" );
	});
	
	$("input[name='domain']").change( function() {
		if( $(this).val()=="Online" )	$("#domain").removeAttr( "disabled" ).focus();
		else $("#domain").attr( "disabled", "disabled" );
	});
	$("#controlbar-enabled").change( function() {
		if( $(this).is(':checked') ) {
			$("#controlbar-ontop").removeAttr( "disabled" );
			$("#flipcontrol-buttons").removeAttr( "disabled" );
			$("#flipcontrol-input").removeAttr( "disabled" );
			$("#controlbarextra-fullscreen").removeAttr( "disabled" );
		} else {
			$("#controlbar-ontop").attr( "disabled", "disabled" );
			$("#flipcontrol-buttons").attr( "disabled", "disabled" );
			$("#flipcontrol-input").attr( "disabled", "disabled" );
			$("#controlbarextra-fullscreen").attr( "disabled", "disabled" );
		}
	});
	$("#thumbnails-enabled").change( function() {
		if( $(this).is(':checked') ) {
			$("#thumbnails-autohide").removeAttr( "disabled" );
			$("#thumbnails-ontop").removeAttr( "disabled" );
		} else {
			$("#thumbnails-autohide").attr( "disabled", "disabled" );
			$("#thumbnails-ontop").attr( "disabled", "disabled" );
		}
	});
	$("#controlbarextra-autoflip").change( function() {
		if( $(this).is(':checked') ) {
			$("#controlbarextra-startautoflip").removeAttr( "disabled" );
		} else {
			$("#controlbarextra-startautoflip").attr( "disabled", "disabled" );
		}
	});
	$("#bookextraopts-singlepagemode").change( function() {
		if( $(this).is(':checked') ) {
			$("#bookextraopts-centersinglepage").attr( "disabled", "disabled" );
			$("#bookextraopts-alwaysopened").attr( "disabled", "disabled" );
		} else {
			$("#bookextraopts-centersinglepage").removeAttr( "disabled" );
			$("#bookextraopts-alwaysopened").removeAttr( "disabled" );
			
		}
	});
	
	//configoption.singlepagemode = $("#bookextraopts-singlepagemode").is(':checked');
	//configoption.centersinglepage = configoption.singlepagemode? false: $("#bookextraopts-centersinglepage").is(':checked');
	
	$("#onlinefile").keyup( function( e ) {
		enableGetPDFButton( true );
		if(e.keyCode == 13) get_pdf_button();
	});

	$(".renderinvalidator").change( function() {
		//console.log("render invalidate");
		bookgen(false);
	});
}
function resetSharePageSelector() {
	var $ps = $("#pageselector");
	$ps.empty();
	for( var i=0; i<pdfinfo.maxpages; i++ ) {
		$ps.append( '<option value="'+i+'">Page '+(i+1)+'</option>' );
	}

}

function import_settings_reset() {
		console.log( "Import settings reset: "+pdfinfo.spreads+" - "+pdfinfo.rotated );
		
		$("span#mediasize").html("("+Math.ceil(pdfinfo.mediawidth)+"x"+Math.ceil(pdfinfo.mediaheight)+" px)")
		var sel = $( "input[name='pagesizing']:checked" ).val();
		if( pdfinfo.bleedwidth == 0) {
			$("span#bleedsize").empty();
			$("#pagesizing-bleedbox").attr( "disabled", "disabled" );
			if( sel=="bleed" ) $("#pagesizing-mediabox").prop('checked', true);
		} else {
			$("span#bleedsize").html("("+Math.ceil(pdfinfo.bleedwidth)+"x"+Math.ceil(pdfinfo.bleedheight)+" px)")
			$("#pagesizing-bleedbox").removeAttr( "disabled", "disabled" );
		}
		if( pdfinfo.cropwidth == 0) {
			$("span#cropsize").empty();
			$("#pagesizing-cropbox").attr( "disabled", "disabled" );
			if( sel=="bleed" ) $("#pagesizing-mediabox").prop('checked', true);
		} else {
			$("span#cropsize").html("("+Math.ceil(pdfinfo.cropwidth)+"x"+Math.ceil(pdfinfo.cropheight)+" px)")
			$("#pagesizing-cropbox").removeAttr( "disabled", "disabled" );
		}
		if( pdfinfo.trimwidth == 0) {
			$("span#trimsize").empty();
			$("#pagesizing-trimbox").attr( "disabled", "disabled" );
			if( sel=="bleed" ) $("#pagesizing-mediabox").prop('checked', true);
		} else {
			$("span#trimsize").html("("+Math.ceil(pdfinfo.trimwidth)+"x"+Math.ceil(pdfinfo.trimheight)+" px)")
			$("#pagesizing-trimbox").removeAttr( "disabled", "disabled" );
		}
		if( pdfinfo.spreads>0 || pdfinfo.rotated>0 ) {
			$("#spreadhandling-allh").attr( "disabled", "disabled" );
			$("#spreadhandling-allv").attr( "disabled", "disabled" );
			// tok felesleges, mert nem lehet kivalasztva... ja de...
			var sel = $( "input[name='spreadhandling']:checked" ).val();
			if( sel=="Horizontal" || sel=="Vertical" ) {
				$("#spreadhandling-auto").prop('checked', true);
			}
		} else {
			$("#spreadhandling-allh").removeAttr( "disabled" );
			$("#spreadhandling-allv").removeAttr( "disabled" );
		}
		if( pdfinfo.spreads==0  ) {
			$("#spreadhandling-off").attr( "disabled", "disabled" );
			// tok felesleges, mert nem lehet kivalasztva... ja de...
			var sel = $( "input[name='spreadhandling']:checked" ).val();
			if( sel=="Off" ) {
				$("#spreadhandling-auto").prop('checked', true);
			}
		} else {
			$("#spreadhandling-off").removeAttr( "disabled" );
		}
		if( /*pdfinfo.rotated>0 || */pdfinfo.spreads>0 ) {
			$("#rotatehandling-all").attr( "disabled", "disabled" );
			var sel = $( "input[name='rotatehandling']:checked" ).val();
			if( sel=="All" ) {
				$("#rotatehandling-auto").prop('checked', true);
			}
		} else {
			$("#rotatehandling-all").removeAttr( "disabled" );
		}
		if( pdfinfo.rotated==0 ) {
			$("#rotatehandling-off").attr( "disabled", "disabled" );
			var sel = $( "input[name='rotatehandling']:checked" ).val();
			if( sel=="Off" ) {
				$("#rotatehandling-auto").prop('checked', true);
			}
		} else {
			$("#rotatehandling-off").removeAttr( "disabled" );
		}
		if( pdfinfo.constantpagesize==1 ) {
			$("#pagesizehandling-fit").attr( "disabled", "disabled" );
			$("#pagesizehandling-fill").attr( "disabled", "disabled" );
			$("#pagesizehandling-crop").attr( "disabled", "disabled" );
		} else {
			$("#pagesizehandling-fit").removeAttr( "disabled" );
			$("#pagesizehandling-fill").removeAttr( "disabled" );
			$("#pagesizehandling-crop").removeAttr( "disabled" );
		}

	$(".previewsinvalidator").change( function() {
		//console.log("previewsinvalidator invalidate "+$(this) );
		//bookgen(false);
		request_previews_gen();
	});
	
	$("#rotatehandling-all").change( function() {
			var sel = $( "input[name='spreadhandling']:checked" ).val();
			if( sel=="Horizontal" || sel=="Vertical" ) {
				$("#spreadhandling-auto").prop('checked', true);
			}
	});
	$("#spreadhandling-allh").change( function() {
			//$("#rotatehandling-all").attr( "disabled", "disabled" );
			var sel = $( "input[name='rotatehandling']:checked" ).val();
			if( sel=="All" ) {
				$("#rotatehandling-auto").prop('checked', true);
			}
	});
	$("#spreadhandling-allv").change( function() {
			var sel = $( "input[name='rotatehandling']:checked" ).val();
			if( sel=="All" ) {
				$("#rotatehandling-auto").prop('checked', true);
			}
	});
	
}

/*
		var newtext = text.replace( /(https?:\/\/|www\.|\/[^\/,]*)/gi, "" );
		
	console.log( newtext );
*/

//----------------------------------------------------------------------------------------------------
function exitconverter() {
	console.log( "exit" );

		$.ajax({	type: "POST", url: processor,
					data: {	func: 9 }
				}).done( function( result ) {
					console.log( result );
					resp = result.split(",");
					
					if( resp[0] == 0 ) {
						unsavedform = false;
						exitcallback();
					} else {
						if( resp[1] == 0 ) session_expired_alert();
					}
				});


}
function exitcallback() {
	window.location="pdf-converter.php";
}


//Session handling:
function session_expired_alert() {
	unsavedform = false;
	downloading = false;
	alert("Your session has expired, please log-in again!");
	window.location.reload();
}
function keep_alive_session() {
	var time = 240000; // 5 mins
	setTimeout(
	function () {
		$.ajax({
			url: 'refresh_session.php',
			cache: false }).done( function( result ) {
				console.log( "> Keep alive session result: "+result );
				resp = result.split(",");
				
				if( resp[0] == 0 ) {
					keep_alive_session();
				} else {
					if( resp[1] == 0 ) session_expired_alert();
				}
			}
		);
	},
	time
	);
}
