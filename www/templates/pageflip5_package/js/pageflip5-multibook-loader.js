var startPageflip;

$( function() {
	var $pageflip = $("#pageflip"),
		pageflip,
		
		/* Book configurations, each is an object, with the book id as identifier */
		bookConfig = {
				/* book ID - used as CSS class name */
			meetpageflip: {
				/* Configuration options */
					PageDataFile: "template1_meet_pageflip/meetpageflip.html",
					PageWidth: 450,
					PageHeight: 600,
					FullScreenEnabled: true,
					Transparency: true,
					Margin: 32,
					MarginBottom: 64,
					AutoScale: true,
					//FullScale: true,
					AlwaysOpened: false,
					AutoFlipLoop: -1,
					CenterSinglePage: true,
					DropShadowOpacity: 0.3,
					FlipTopShadowOpacity: 0.2,
					FlipShadowOpacity: 0.2,
					HardFlipOpacity: 0.3,
					EmbossOpacity: 0.2,
					SecondaryDragArea: 32,
					Transparency: true,
					ControlbarFile: "common/controlbar_svg.html",
					GoogleAnalytics: true,
					HashControl: true,
					ShareLink: "http://pageflip-books.com",
					ShareText: "Pageflip5, The Book Template for the Web",
					ShareVia: "@MaccPageFlip",
					ShareImageURL: "http://pageflip-books.com/images/shareimage.jpg",
					ShowCopyright: false,
					Copyright: "Hello",
				},
			demo2: {
					/* Configuration options */
					PageDataFile: "template2_demobook2/demobook2.html",
					PageWidth: 434,
					PageHeight: 568,
					HardPages: true,
					FullScreenEnabled: true,
					Transparency: true,
					Margin: 0,
					AutoScale: true,
					//FullScale: true,
					FlexibleContent: true,
					StartPage: 1,
					AutoFlipLoop: -1,
					Thumbnails: true,
					ThumbnailsToFront: true,
					ThumbnailsAutoHide: 5000,
					ThumbnailsHidden: true,
					ThumbnailAlwaysCentered: true,
					ThumbnailWidth: 104,
					ThumbnailHeight: 120,
					ControlbarFile: "common/controlbar_svg.html",
					ControlbarToFront: true,
					Preflip: false,
					HashControl: true,
					ShareLink: "http://pageflip-books.com",
					ShareText: "Pageflip5, The Book Template for the Web",
					ShareVia: "@MaccPageFlip",
					ShareImageURL: "http://pageflip-books.com/images/shareimage2.jpg",
					Copyright: "Hello",
				},
			book: {
					/* Configuration options */
					PageDataFile: "template3_empty/book.html",
					PageWidth: 400,
					PageHeight: 500,
					FullScreenEnabled: true,
					Margin: 34,
					MarginBottom: 64,
					AutoScale: true,
					AutoStageHeight: true,
					StartPage: 1,
					AutoFlipLoop: -1,
					ControlbarFile: "common/controlbar_svg.html",
					ControlbarToFront: true,
					HashControl: true,
					ShareLink: "http://pageflip-books.com",
					ShareText: "Pageflip5, The Book Template for the Web",
					ShareVia: "@MaccPageFlip",
					ShareImageURL: "http://pageflip-books.com/images/shareimage2.jpg",
					Copyright: "Hello",
				}

		},
		defaultID = "meetpageflip",	//"demo1",
		startID = defaultID,
		loadedID,
		closing,
		
		/* initial hash check (multibook feature: which book to load first?) */
		getHashID = function() {
			var h = location.hash;
			return h.substr( 1 ).split("/")[0];
		},
		
		id = getHashID();
				
	/* start the first book automatically! */
	startPageflip = function( id ) {
		if( closing || id==loadedID ) return
		if( loadedID ) {
			/* we have a loaded book, so unload it first */
			closing = true;
			loadedID = undefined;
			pageflip.closePageflip( function() { closing = false; startPageflip( id ); } );
		} else {
			/* load the book */
			loadedID = id;
			var h = getHashID();
			if( ( defaultID==id && h && h!=id ) || ( defaultID!=id && h!=id ) ) location.hash = id;
			$pageflip.pageflipInit( bookConfig[id], id );
			pageflip = $pageflip.pageflip();
		}
	};
	
	if( bookConfig[id] && defaultID!=id ) {  startID = id; } 
	else { if( $("#"+id).length ) gotoAnchor( "#"+id ); }

	startPageflip( startID );

});