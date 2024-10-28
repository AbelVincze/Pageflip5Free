/*
	
	Pageflip5 - V1.8 - Pageflip Based on HTML5/CSS3/JS/JQUERY
	Coded By Abel Vincze (C) 2004-2024 - available at http://pageflip-books.com
	This code was released on 2024/10/24

	Pageflip5 - Module description
	Copyright (c) Abel Vincze. All rights reserved.
	Licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
	See LICENSE file in the project root for more details.

*/
var _gaq = _gaq || [];	// google analythics support

(function($, __window, __undefined ) {

	'use strict';
	
	/*
	
		The script is started with pageflipInit function!
		
	*/
	
	// confuguration options and all Pageflip Variables
	// - Pageflip uses local variables (global inside this scope)
	
	var _ID,				// ID.
		_IDs,
		_DefaultID,
		_PageWidth,			// Width of the inside pages
		_PageHeight,		// Height of the inside pages
		_CoverWidth,		// Width of the cover, if not defined it will be the same as the page Width
		_CoverHeight,		// cover Height
		_StageWidth,		// Size of the stage ( if not defined, CSS values will kept
		_StageHeight,	
		_HardCover,			// Hard Cover enabled
		_HardPages,			// Hard pages enabled (flase by default)
		_CenterSinglePage,
		_Margin,			// Margin Around the book.
		_MarginTop,			// Margins also can be set on each side
		_MarginBottom,
		_MarginLeft,
		_MarginRight,
		_MobileStageMaxWidth,	// Use Mobile Margins for layouts narrower than this width... 
		_MMargin,				// Margins to be used by the "mobile layout"
		_MMarginTop,
		_MMarginBottom,
		_MMarginLeft,
		_MMarginRight,
		_AutoScale,			// scale the book to fit the stage (pageflip-container)
		_FullScale,			// set the pageflip div size match the browser size!
		_FillScale,			// fills the screen
		_UpScale,			// Allow upscale too!
		_AutoStageHeight,	// Stage Height set automatically depending on the actual scaled book height
		_AutoMaxHeight,		// Stage is resized vertically if doesn't fit in the browser window
		_MaxHeightOffset,	// Stage Max Height = Browser Window Height - MaxHeightOffset
		_ScaleToSinglePage,	// Scales the book the way a single page is visilble as much as possible
		_FlexibleContent,	// Content doesn't scales, it size is changing, and the content is rearranges like on a HTML page.
		_FlexibleContentMinWidth,	// The minimum size of a such page. (if the visible size is smaller, downscaling occurs)
		_StartPage,			// book starts opened at this page
		_MinPageLimit,		// the first accessible page
		_MaxPageLimit,		// the last accessible page
		_StartAutoFlip,		// Start with autoFlip mode!
		_AutoFlipEnabled,	// Enable/Disable auto flipping feature
		_FullScreenEnabled,	// Enable/Disable fullscreen feature (it doesn't work on iOS at all)
		
		_AutoFlipInterval,	// default interval between pageflps
		_AutoFlipLoop,		// Looping
		_navigationLoop,	// previous/next buttons to accsess last/first page (from first/last pages)
		_VerticalMode,		// vertical flipping direction
		_RightToLeft,		// Right to left flipping direction
		_AlwaysOpened,		// Alwasy opened book (can't see the front cover)
		_PageDataFile,		// if not embedded, load this html file to define content
		_Preflip,			// Enable/Disable preflipping (corner flip on hover)
		_ControlbarFile,	// External controlbar file
		_ControlbarToFront,	// controlbar to front (flipping page is behind it)
		_Thumbnails,			// Thumbnails enabled
		_ThumbnailsLazyLoad,	// Loads Thumbnail images only when container is visible on the screen)
		_ThumbnailsToFront,		// Thumbnail over the book
		_ThumbnailsAutoHide,	// Hide thumbnails after X ms
		_ThumbnailsHidden,		// Hide Thumbnails on start
		_ThumbnailWidth,		// Width of a thumbnail page
		_ThumbnailHeight,		// height
		_ThumbnailAlwaysCentered,	// actual page/spread is centered
		_ThumbnailControls,		// additional controls for the thumbnails
		_Transparency,		// is transparency enabled? multi level transparency
		_PageCache,			// how many page have to be preloaded in background

		_NoFlipShadow,		// no flipshadow rendered
		_DropShadow,		// Enable/Disable book dropshadow
		_Emboss,			// Shadows in the center of the opened book.
		_DropShadowOpacity,
		_FlipTopShadowOpacity,
		_FlipShadowOpacity,
		_HardFlipShadowOpacity,
		_EmbossOpacity,
				
		_PreflipArea,
		_ClickFlip,			// enable flipping by clicking on the preflip area	
		_SecondaryDragArea,
		_InsideDragArea,
		_FlipDuration,
		_DisableBackgroundEvents,
		
		_BookOffsetX,
		_BookOffsetY,
		_TearDistance,		//Not used yet
		_PerformanceAware,
		
		_PagerText,
		_PagerSkip,			//page skipping when called gotoPage from pager exec
		_HideCopyright,
		
		_ZoomEnabled,
		_ClickZoom,
		_ZoomFlip,
		_PinchZoom,
		_HotKeys,
		_MouseControl,
		
		_GoogleAnalytics,
		
		_ShareLink,
		_ShareText,
		_ShareVia,
		_ShareImageURL,
		
		_HashControl,
		_Copyright,
		_FWCopyright,
		_ShowCopyright,
		_preview,
		
		_DisableSelection,

		// (News in version 1.2)
				// GoogleAnalytics
				// ShowCopyright
				// ClickZoom
				
		// (News in version 1.3)
				// PinchZoom
				// _SinglePageMode
				// _ThumbnailsLazyLoad
				
		// (News in version 1.4)
				// _AutoMaxHeight
				// _MaxHeightOffset
		
		_SinglePageMode,
		
		// (News in version 1.5)
				// _FlipWorld
				// _AutoSinglePageMode
				// _FWCopyright,
				
		// (News in v 1.6)
				// _ClickFlip,			// enable flipping by clicking on the preflip area	
				// _ThumbnailControls
				// _MobileStageMaxWidth
				// _MMargin
				// _MMarginTop
				// _MMarginBottom
				// _MMarginLeft
				// _MMarginRight
				// _DisableBackgroundEvents // cant scroll/zoom page by clicking on the BG
					
		_FlipWorld,			// set some behaviors to meet FW specs
		_src,				// Flipworlds data
		_AutoSinglePageMode,// Start in SinglePageMode if fits better

		_ShareOnFacebook,
		_ShareOnPinterest,

		_SavedAlwaysOpened,			// some vars to save info when autoSinglePageMode is enabled
		_SavedCenterSinglePage,
		_SavedScaleToSinglePage,
		_SavedInsideDragArea,
		_SavedBookOffsetY,
		_SavedBookOffsetX,

	// pointers to DOM elements
		
		__pageflip,			// $("#pageflip")	Pageflip wrapper
		__stage,			// the Pageflip container (everything pageflip is in it)
		__book,				// the book (all pages already positioned, ready for display)
		__bookc,			// the container of the book (needed for scaling)
		__bookoffs,			// another level of wrapper for the book, for positioning
		__dropshadow,		// the dropshadow
		__doc,				// document
		
		__controlbar,		// the controlbar
		__pagerin,			// the Page number display input box
				
	// main variables
	
		PN,					// PageNumber, where we are in the book...
		maxPage,			// the last page's index in the pages array
		bookWidth,			// max width of the book
		bookHeight,			// max height of the book
		bookCOffsX,			// offset
		bookCOffsY,
		bookScale,			// book scale
		largeCover,			// cover is larger than inside pages
		maskpw,				// page mask size
		maskcw,				// cover mask size
		changed,			// layout changed
		
		has3d,
		eventCallback,
		
	// flip variables
	
		flipping,			// is there a flipping animation in action?
		flipPages,			// array of the flipping pages to render
		flipOrder,			// an array with all the running flips
		flipDir,			// direction of the flip: left -1, right 1
		flipType,			// flip mpde
		lastFlipMode,		// the previous Flip Type used
		startPN,			// PN before flip
		endPN,				// PN after flip
		maxFlips,			// max number of flip animation at the same time
		mx,					// used as touch point for animation, have to bu updated every frame!
		my,
		
		autoFlip,			//slideshow autoflip!
		autoPreflip,
		manualPreflip,
		manualFlip,
		cancelFlip,
		manualFlipDir,
		
		leftPageW, leftPageH, rightPageW, rightPageH,

	// content variables

		pages,				// Array containing all page informations
		renderedPages,		// actually rendered pages (pages displayed)
		hiddenPages,		// Array containing hidden pages
		removedPages,		// an array containing remover page data
		pagesToPreload,		// Array with pages to preload
		htmlBuffer,			// temporary storage of the original content of the div#pageflip
		cbhtmlbuffer,		// temporary storage of the embedded control bar (if any)
		preloadedImages,	// An array containing the preloaded images
		preloadedThumbs,	// An array containing the preloaded thumbnail images

		touchControl = 'ontouchstart' in __window,
		
		pfTEvent = {__onStart: 'touchstart', __onMove: 'touchmove', __onEnd: 'touchend'},
		pfEvent = {__onStart: 'mousedown',  __onMove: 'mousemove', __onEnd: 'mouseup'},

		
	// constants
		M = Math,
		PI = M.PI,
		AM = 180/PI,
		sides = ["left","right"],
		FALSE = false,
		TRUE = true,
		Ms = M.sin,
		Mas = M.asin,
		Mc = M.cos,
		Mq = M.sqrt,
		Ma = M.abs,
		Mf = M.floor,
		Md = M.ceil,
		Mr = M.round,
		Mrn = M.random,
		D90 = 90,
		D180 = 180,
		D2 = 2,
		D100 = 100,

		s1 = "toUpperCase",
		s2 = "charCodeAt",
		s3 = "length",
		s4 = "get",
		s5 = "UTC",
		s6 = s4+s5,
		s4 = s6+"FullYear",
		s5 = s6+"Month",
		s6 = s6+"Date",
		s7 = "location",
		s8 = "href",
		s9 = "offline",
		s17 = "online",
		s10 = "split",
		s11 = "substr",
		s12 = "file:",
		s13 = "www",
		s14 = "/",
		s15 = "fromCharCode",
		s16 = "top",
		auto = "auto",
		
		HD,		// horizontal divider
		VD,		// vertical divider
		VM,		// vertical multiplier

		_SVGLEFT = '<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="26px" height="40px" viewBox="0 0 26 40" xml:space="preserve"><g><path d="M21.544,0.515c-0.688-0.687-1.801-0.687-2.488,0L0.815,18.756c-0.687,0.687-0.687,1.8,0,2.488l18.241,18.241 c0.688,0.687,1.801,0.687,2.488,0l3.938-3.938c0.688-0.688,0.688-1.801,0-2.488L12.397,20.026L25.481,6.94 c0.688-0.686,0.688-1.8,0-2.487L21.544,0.515z"/></g></svg>',
		_SVGRIGHT = '<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="26px" height="40px" viewBox="0 0 26 40" xml:space="preserve"><g><path d="M4.456,39.485c0.688,0.687,1.801,0.687,2.488,0l18.24-18.241c0.687-0.687,0.687-1.801,0-2.488L6.944,0.515 c-0.688-0.687-1.801-0.687-2.488,0L0.519,4.453c-0.688,0.688-0.688,1.801,0,2.488l13.084,13.033L0.519,33.06 c-0.688,0.687-0.688,1.801,0,2.487L4.456,39.485z"/></g></svg>',


	// function definitions ----------------------------------------------------------------------

	//-------------------------------------------------------------------------------------

		// set up configuration with variables given arguments, or default values
		configSetUp = function( pConfig ) {
			var t,u=0.3;
			_IDs = pConfig.IDs,
			
													_FlipWorld					= pConfig.FlipWorld || FALSE,
													_src						= pConfig.src || "",
													_DefaultID					= pConfig.DefaultID,
													_PageWidth					= pConfig.PageWidth || 300,
													_PageHeight					= pConfig.PageHeight || 400,
													_CoverWidth					= pConfig.CoverWidth || _PageWidth,
													_CoverHeight				= pConfig.CoverHeight || _PageHeight,
													_HardCover					= pConfig.HardCover==__undefined? TRUE: pConfig.HardCover,
													_HardPages					= pConfig.HardPages || FALSE,
													_StageWidth					= pConfig.StageWidth,
													_StageHeight				= pConfig.StageHeight,
			t = pConfig.Margin,						_Margin						= t==__undefined? 32: t,
			t = pConfig.MarginTop,					_MarginTop					= t==__undefined? _Margin: t,
			t = pConfig.MarginBottom,				_MarginBottom				= t==__undefined? _Margin: t,
			t = pConfig.MarginLeft,					_MarginLeft					= t==__undefined? _Margin: t,
			t = pConfig.MarginRight,				_MarginRight				= t==__undefined? _Margin: t,

													_MobileStageMaxWidth		= pConfig.MobileStageMaxWidth || (_FlipWorld? 640: 0),
			t = pConfig.MMargin,					_MMargin					= t==__undefined? (_FlipWorld? 0: 32): t,
			t = pConfig.MMarginTop,					_MMarginTop					= t==__undefined? _MMargin: t,
			t = pConfig.MMarginBottom,				_MMarginBottom				= t==__undefined? (_FlipWorld? 50: _MMargin): t,
			t = pConfig.MMarginLeft,				_MMarginLeft				= t==__undefined? _MMargin: t,
			t = pConfig.MMarginRight,				_MMarginRight				= t==__undefined? _MMargin: t,
													_VerticalMode				= pConfig.VerticalMode || FALSE,
													_SinglePageMode				= pConfig.SinglePageMode || FALSE,
													_AutoSinglePageMode			= pConfig.AutoSinglePageMode || FALSE;
			if( _SinglePageMode ) _AutoSinglePageMode = FALSE;
													_RightToLeft				= ( pConfig.RightToLeft && !_VerticalMode ) || FALSE,
													_AlwaysOpened				= pConfig.AlwaysOpened || FALSE,
													_AutoScale					= pConfig.AutoScale || FALSE,
													_FullScale					= pConfig.FullScale || FALSE,
													_FillScale					= pConfig.FillScale || FALSE,
													_UpScale					= pConfig.UpScale || FALSE,
													_CenterSinglePage			= pConfig.CenterSinglePage || FALSE,
													_ScaleToSinglePage			= pConfig.ScaleToSinglePage || FALSE,
													_AutoStageHeight			= pConfig.AutoStageHeight || FALSE;
			if( _FullScale || _FillScale || _UpScale ) _AutoStageHeight = FALSE;
													_AutoMaxHeight				= pConfig.AutoMaxHeight || FALSE;
													_MaxHeightOffset			= pConfig.MaxHeightOffset || 0,
													_FlexibleContent			= pConfig.FlexibleContent || FALSE,
			t = pConfig.FlexibleContentMinWidth,	_FlexibleContentMinWidth	= t==__undefined? 768: t,
			t = pConfig.StartPage,			_StartPage 		= t==__undefined? 1: t,
													_MinPageLimit				= pConfig.MinPageLimit || 0;
			if( _StartPage<_MinPageLimit ) _StartPage=_MinPageLimit;
													_MaxPageLimit				= pConfig.MaxPageLimit,
													_StartAutoFlip				= pConfig.StartAutoFlip || FALSE,
			t = pConfig.AutoFlipEnabled,			_AutoFlipEnabled 			= t==__undefined? TRUE: t,
													_FullScreenEnabled			= pConfig.FullScreenEnabled || FALSE,

													_AutoFlipInterval			= pConfig.AutoFlipInterval || 2000,
													_AutoFlipLoop				= pConfig.AutoFlipLoop || 0,
													_navigationLoop				= pConfig.NavigationLoop || FALSE,
			
													_PageDataFile				= pConfig.PageDataFile,
			t = pConfig.Preflip,					_Preflip 					= t==__undefined? TRUE: t,
			
													_ControlbarFile 			= pConfig.ControlbarFile,
													_ControlbarToFront 			= pConfig.ControlbarToFront || FALSE,
													_Thumbnails 				= pConfig.Thumbnails || FALSE,		
			t = pConfig.ThumbnailsLazyLoad,			_ThumbnailsLazyLoad 		= t==__undefined? TRUE: t,
			t = pConfig.ThumbnailsToFront,			_ThumbnailsToFront 			= t==__undefined? TRUE: t,
													_ThumbnailsAutoHide 		= pConfig.ThumbnailsAutoHide || 0,
													_ThumbnailsHidden 			= pConfig.ThumbnailsHidden || FALSE,
													_ThumbnailWidth 			= pConfig.ThumbnailWidth || 60,
													_ThumbnailHeight 			= pConfig.ThumbnailHeight || 80,
													_ThumbnailAlwaysCentered 	= pConfig.ThumbnailAlwaysCentered || FALSE,
													_ThumbnailControls			= pConfig.ThumbnailControls || FALSE,			
			_Transparency = pConfig.Transparency || FALSE,
			t = pConfig.PageCache,					_PageCache 					= t==__undefined? 1: t,
													_NoFlipShadow 				= pConfig.NoFlipShadow || FALSE,
			t = pConfig.DropShadow, 				_DropShadow 				= t==__undefined? TRUE: t,
			t = pConfig.Emboss, 					_Emboss 					= t==__undefined? TRUE: t,
			t = pConfig.DropShadowOpacity, 			_DropShadowOpacity 			= t==__undefined? u: t,
			t = pConfig.FlipTopShadowOpacity, 		_FlipTopShadowOpacity 		= t==__undefined? u: t,
			t = pConfig.FlipShadowOpacity, 			_FlipShadowOpacity 			= t==__undefined? u: t,
			t = pConfig.EmbossOpacity, 				_EmbossOpacity 				= t==__undefined? u: t,
			t = pConfig.HardFlipShadowOpacity, 		_HardFlipShadowOpacity 		= t==__undefined? u: t,
													_PreflipArea 				= pConfig.PreflipArea || 128,
			t = pConfig.ClickFlip,					_ClickFlip			 		= t==__undefined? TRUE: t,
													_SecondaryDragArea 			= pConfig.SecondaryDragArea || 64,
													_InsideDragArea 			= pConfig.InsideDragArea || 0,
													_FlipDuration 				= pConfig.FlipDuration || 800,
													_DisableBackgroundEvents	= pConfig.DisableBackgroundEvents || FALSE,
													_BookOffsetX 				= pConfig.BookOffsetX || 0,
													_BookOffsetY 				= pConfig.BookOffsetY || 0;
			
													_TearDistance 				= pConfig.TearDistance || 100,
													_PerformanceAware			= has3d? pConfig.PerformanceAware || FALSE: TRUE,
													_PagerText 					= _FlipWorld? "#~# – #":(pConfig.PagerText || "Page #~Pages #-#"),
			t = pConfig.PagerSkip, 					_PagerSkip 					= t==__undefined? TRUE: t, 
													_HideCopyright 				= pConfig.HideCopyright || FALSE,
													_HashControl 				= pConfig.HashControl || FALSE,
			
			t = pConfig.ZoomEnabled, 				_ZoomEnabled 				= t==__undefined? TRUE: t,
													_ClickZoom					= pConfig.ClickZoom || FALSE,
			t = pConfig.ZoomFlip, 					_ZoomFlip 					= t==__undefined? TRUE: t,
			t = pConfig.PinchZoom, 					_PinchZoom 					= t==__undefined? FALSE: t,
			t = pConfig.HotKeys, 					_HotKeys 					= t==__undefined? TRUE: t,
			t = pConfig.MouseControl, 				_MouseControl 				= t==__undefined? TRUE: t,
			
													_GoogleAnalytics 			= pConfig.GoogleAnalytics,
													_ShareLink 					= pConfig.ShareLink || "http://pageflip-books.com",
													_ShareText 					= pConfig.ShareText || "Pageflip5, The Book Template for the Web",
													_ShareVia 					= pConfig.ShareVia || "@MaccPageFlip",
													_ShareImageURL 				= pConfig.ShareImageURL,
			
													_Copyright 					= pConfig.Copyright,
													_FWCopyright 				= pConfig.FWCopyright || _Copyright,
													_ShowCopyright 				= pConfig.ShowCopyright || FALSE,
													_preview					= pConfig.Preview? "?"+Mr(Mrn()*10000)  :"",
			
													_DisableSelection 			= pConfig.DisableSelection || FALSE,
													
			t = pConfig.ShareOnFacebook,			_ShareOnFacebook 			= t==__undefined? TRUE: t,
			t = pConfig.ShareOnPinterest,			_ShareOnPinterest			= t==__undefined? TRUE: t,											
																										
			_SavedAlwaysOpened		= _AlwaysOpened;
			_SavedCenterSinglePage	= _CenterSinglePage;
			_SavedScaleToSinglePage	= _ScaleToSinglePage;
			_SavedInsideDragArea	= _InsideDragArea;
			_SavedBookOffsetY		= _BookOffsetY;
			_SavedBookOffsetX		= _BookOffsetX;



			if( _ShareImageURL && _ShareImageURL.lastIndexOf( "://" ) == -1 ) {
					var baseurl = __window[s7][s8][s10]("#")[0][s10](s14);
					baseurl.splice( baseurl.length-1, 1 );
					baseurl = baseurl.join(s14)+s14;
					_ShareImageURL = baseurl + _ShareImageURL;
			}
			
		},
		fixSinglePageModeConfig = function() {
			_AlwaysOpened		= FALSE;
			_CenterSinglePage	= FALSE;
			_ScaleToSinglePage	= TRUE;
			_InsideDragArea 	= _SecondaryDragArea;	//_ClickFlip?_PreflipArea:_SavedInsideDragArea;
			if( _VerticalMode ) _BookOffsetY = _SavedBookOffsetY - _CoverHeight/2;
			else {
				if( _RightToLeft ) _BookOffsetX = _SavedBookOffsetY+_CoverWidth/2;
				else _BookOffsetX = _SavedBookOffsetY-_CoverWidth/2;
			}
		},
		defixSinglePageModeConfig = function() {
			_AlwaysOpened		= _SavedAlwaysOpened;
			_CenterSinglePage	= _SavedCenterSinglePage;
			_ScaleToSinglePage	= _SavedScaleToSinglePage;
			_InsideDragArea 	= _SavedInsideDragArea;
			_BookOffsetY 		= _SavedBookOffsetY;
			_BookOffsetX 		= _SavedBookOffsetX;
		},

		// Some variable initializations
		resetMainVariables = function() {
			bookCOffsX = bookCOffsY = 0;
			bookScale = 1;			
			//textInput = FALSE;				// no text input in progress
			resetBookVariables();
		},
		resetBookVariables = function() {
			// the opened book size, depending on the book orientation and the page size
			bookWidth =		_CoverWidth*(_VerticalMode? 1:2);
			bookHeight =	_CoverHeight*(_VerticalMode? 2:1);
			largeCover =	_CoverWidth>_PageWidth || _CoverHeight>_PageHeight;
			maskpw =		Md( getDist( _PageWidth, _PageHeight )/2 )*2;
			maskcw =		Md( getDist( _CoverWidth, _CoverHeight )/2 )*2;
			HD = _VerticalMode?1:2;
			VD = 3-HD;
			VM = _VerticalMode?-1:1;
		},
		resetContentVariables = function() {
			pages = [];
			renderedPages = [];
			pagesToPreload = [];
			hiddenPages = [];
			removedPages = [];
			preloadedImages = [];
			preloadedThumbs = [];
		},
		resetFlippingVariables = function() {
			flipping = FALSE;
			flipOrder = [];
			flipQueue = [];
			maxFlips = 4;
			autoFlip = FALSE,
			autoPreflip = FALSE,
			manualPreflip = FALSE,
			manualFlip = FALSE,
			cancelFlip = FALSE;
			leftPageW = leftPageH = rightPageW = rightPageH = 0;
			baseLeftWidth = shBaseLeftWidth = baseRightWidth = shBaseRightWidth =
			leftWidth = shLeftWidth = rightWidth = shRightWidth = __undefined;
		},
		resetPages = function() {
			// reset displayed content (remove everything)
			pagesToPreload = [];
			renderedPages = [];
			hiddenPages = [];
			__bookc.empty();
			// regenerate whole content
			setPages();
		},
		
		// Page Order setup - this is the list of all pages in the book with all associated data
		pageOrderSetup = function( $pageData ) {
			resetContentVariables();
			for( var 	i=0,
						cnt = 0,
						page = 0,
						pn = 1,
						tag,
						$page,
						cover,
						havecover = FALSE,
						outer,
						forcedCover,
						pageData;
						cnt<$pageData.length; cnt++ ) {
						
				$page = $($pageData[cnt]);						// page definition DIV
				cover = (tag = $page.attr("class"))=="cover";	// is cover?
				if( cover ) havecover = cover;
				outer = (tag == "outerpage" );					// is it an outer page (page before first page, or page after last page)
				if( _SinglePageMode ) outer = FALSE;
				forcedCover = (outer || cover);					// temp variable
				if( !cover && tag != "page" && !outer ) continue;				
				if( i==0 && !outer && !_AlwaysOpened ) setPage( page++, { __PageNumber: 0, __notEmpty: FALSE } );
				else if( _SinglePageMode ) setPage( page++, getPageData( $("<div class='page'></div>") ) );
				if( i==0 && outer ) _AlwaysOpened = FALSE;
				pageData = getPageData( $page, outer, cover, forcedCover );
				
				// Page Number control...
				if( pageData.__PageNumber==__undefined ) pageData.__PageNumber = pn++;
				else if( pageData.__PageNumber>0 ) pn = pageData.__PageNumber+1;

				// set the page based on the page definition DIV
				setPage( page++, pageData );
				i++;
			}
			maxPage = page-1;
			fixLastPage();
			if( _RightToLeft ) pages.reverse();			// Reverse page order if Right To Left
			if( !havecover ) largeCover = FALSE;
			
			pageLimit( _MinPageLimit, __undefined );
			resetGotoVariables();
		},
		addNewPages = function( $pageData, pPN, pRenumber ) {
			// insert a new page on the fly
			pPN = pPN || PN;
			pRenumber = pRenumber || FALSE;
			if( pPN==0 && !_AlwaysOpened ) pPN++;
			for( var 	i=0,
						cnt = 0,
						page = pPN,
						pn = 1,
						tag,
						$page,
						cover,
						havecover = FALSE,
						outer,
						forcedCover,
						pageData;
						
						cnt<$pageData.length; cnt++ ) {
						
				$page = $($pageData[cnt]);
				cover = (tag = $page.attr("class"))=="cover";
				if( cover ) havecover = cover;
				outer = (tag == "outerpage" );
				forcedCover = (outer || cover);
				if( !cover && tag != "page" && !outer ) continue;
				pageData = getPageData( $page, outer, cover, forcedCover );
				maxPage++;
				pages.splice( pPN, 0, pageData );

				i++;
			}			
			fixLastPage();
			pageLimit();
			resetGotoVariables();
			resetPages();
		},
		removePages = function( pPN, pNumberOfPages, pRenumber ) {
			// remove a page from the book on the fly
			
			pPN = pPN || PN;
			pNumberOfPages = pNumberOfPages || 1;
			pRenumber = pRenumber || FALSE;
			if( pPN==0 && !_AlwaysOpened ) pPN++;
			
			pages.splice( pPN, pNumberOfPages );
			maxPage -= pNumberOfPages;			
			
			fixLastPage();
			pageLimit();
			resetGotoVariables();

			if( PN>maxPage ) PN = maxPage-maxPage%2;
			if( PN<0 ) PN = 0;	// eeee
			
			resetPages();
		},
		fixLastPage = function() {
			// fix page order ending to even number of pages by adding or removing unneaded empty page.
			if( maxPage%2==0 ) {
				if( !pages[ maxPage ].__notEmpty ) {
					pages.splice( maxPage, 1 );
					maxPage--;
				} else setPage( ++maxPage, { __PageNumber: 0, __notEmpty: FALSE } );
			}
		},
		setPage = function( pPN, pData ) {
			pages[ pPN ] = pData;
		},
		getPageData = function( $page, outer, cover, forcedCover ) {
			outer = outer || FALSE;
			cover = cover || FALSE;
			forcedCover = forcedCover || FALSE;
			var data = $page.data(),
				demboss = data.disableEmbossing,
				pageData = {	__Unload: !(data.unload==FALSE),
								__BackgroundFile: data.backgroundFile,
								__HtmlFile: data.htmlFile,
								__HtmlData: $page.html(),
								__ThumbnailImage: data.thumbnailImage,
								__DisableEmbossing: demboss==__undefined?!_Emboss:demboss,
								__TransparentPage: data.transparentPage==TRUE,
								__RemovablePage: data.removablePage==TRUE,
								__TearOff: FALSE,
								__PageNumber: outer?0: data.pageNumber, 
								__PageName: data.pageName, 
								__PageLabel: data.pageLabel,
								__AutoFlipInterval: data.autoFlipInterval,
								__Data: data.data,
								__renderWidth: forcedCover? _CoverWidth: _PageWidth,
								__renderHeight: forcedCover? _CoverHeight: _PageHeight,
								__maskSize: cover? maskcw: maskpw,
								__isHard: cover? _HardCover: _HardPages || (data.hard==TRUE),
								__isCover: forcedCover,
								__outer: outer,
								__notEmpty: TRUE
				};
				
				if( _FlipWorld && _src != "" && data.d ) {
					var fwd = data.d.split(",");
					pageData.__BackgroundFile = _src+"page"+fwd[0]+".jpg"+_preview;
					if( fwd[1]==1 ) pageData.__ThumbnailImage = _src+"page"+fwd[0]+"_th.jpg"+_preview;
					if( fwd[2]==1 ) pageData.__PageLabel = "t"+fwd[0];
				}
			if( pageData.__isHard ) pageData.__DisableEmbossing = TRUE;
			pageData.__isLoaded = !pageData.__HtmlFile;
			
			return pageData;
		},
				
		// variables that helps book positioning
		baseLeftWidth, shBaseLeftWidth, baseRightWidth, shBaseRightWidth,
		leftWidth, shLeftWidth, rightWidth, shRightWidth,
		rightWidthMax = function( pW ) {
			rightWidth = rightWidth<pW? pW: rightWidth;
		},
		leftWidthMax = function( pW ) {
			leftWidth = leftWidth<pW? pW: leftWidth;
		},
		setBookOffset = function() {
			var ox = _BookOffsetX - ((_CenterSinglePage && !_VerticalMode)? Mr( (rightWidth-leftWidth)/2 ):0), 
				oy = _BookOffsetY - ((_CenterSinglePage && _VerticalMode)? Mr( (rightWidth-leftWidth)/2 ):0);
			if( bookCOffsX==ox && bookCOffsY==oy ) return;
			changed = TRUE;
			bookCOffsX = ox, bookCOffsY = oy;
			__bookoffs.css( { transform: tr( bookCOffsX, bookCOffsY ) } );
		},
	//-------------------------------------------------------------------------------------
	
		// This is the heart of the book rendering
		setPages = function() {
			// this function places the active pages on the DOM.
			var lastPages = renderedPages,
				lastPreload = pagesToPreload,
				leftPages = [], rightPages = [],
				pagesToEnable = [], pagesToDisable = [],
				PFeventsToCall = [],
				IPN = PN, NPN = PN+1;	// force render
			
			// visible width on the left/right (upper/bottom) side of the book 
			leftWidth = rightWidth = shBaseLeftWidth = shBaseRightWidth = 0;
			
			// add flipping pages if there are any
			flipPages = [];
			if( flipping ) {	// we have animated pages!
				
				if( flipDir<0 ) IPN = endPN;	//skipping flipping pages from normal display
				else NPN = endPN+1;
				for( var i=0, pageA, pageB; i<flipOrder.length; i++ ) {
					pageA = flipOrder[i].__startPagePN,
					pageB = flipOrder[i].__endPagePN;
					pages[pageA].__flip = pages[pageB].__flip = pages[pageB].__animated = TRUE;
					pages[pageA].__animated = FALSE;
					if( flipOrder[i].__flipType!=1 ) {
						flipPages.splice(0, 0, pageA );
						flipPages.push( pageB );
					} else {
						flipPages.splice(i,0, pageB );
						flipPages.splice(i,0, pageA );
					}
					if( !flipOrder[i].__started ) {
						PFeventsToCall.push( { e:0, p:pageA } );
						PFeventsToCall.push( { e:0, p:pageB } );
						flipOrder[i].__started = TRUE;
					}
					if ( pages[pageA].__onTop ) { PFEventDispatcher( 3, pageA ); pages[pageA].__onTop = FALSE; }
					if ( pages[pageB].__onTop ) { PFEventDispatcher( 3, pageB ); pages[pageB].__onTop = FALSE; }
				}
			}

			pagesToPreload = [];
			// now add the fix pages
			// LEFT SIDE PAGES
			var ipn = IPN,						// current page number
				FR = pages[ipn].__notEmpty,		// ForceRender if the actual page isn't an empty page
				PL = FR? _PageCache: 0;			// if the first page isn't empty, Preaload will be required for next pages.
			while( ipn>= 0 ) {					// check left side pages' visibility
				if( FR || ( (pages[ipn].__isCover && !pages[ipn].__outer) && largeCover ) ) {
												// Add page if Forced to render
												// or if it is a Large Cover and not Outer page
					leftPages.push( ipn );		// Add it to the render list.
					FR = ( _Transparency && pages[ipn].__TransparentPage );	// if transparency is enabled globally and for that page, then Force render the next!
				} else if( PL > 0 ) {			// if it's not the case, add preloaded pages.
					if( pages[ipn].__notEmpty ) pagesToPreload.push( ipn );			// if it isn't an empty page Preload it,
					if( pages[ipn+1].__notEmpty ) pagesToPreload.push( ipn+1 );		// and its pair too
					PL--;						// decrement preload counter
				}
				if( !FR && PL==0 && ipn>4 ) ipn=2; else ipn -= 2;
			}
			// RIGHT SIDE PAGES
			var npn = NPN;
			FR = pages[npn].__notEmpty;
			PL = FR? _PageCache: 0;
			while( npn<= maxPage ) {
				if( FR || ( (pages[npn].__isCover && !pages[npn].__outer) && largeCover) ) { 
					rightPages.push( npn );
					FR = ( _Transparency && pages[npn].__TransparentPage );
				} else if( PL > 0 ) {
					if( pages[npn-1].__notEmpty ) pagesToPreload.push( npn-1 );
					if( pages[npn].__notEmpty ) pagesToPreload.push( npn );
					PL--;
				}
				if( !FR && PL==0 && npn<maxPage-4 ) npn=maxPage-2; else npn += 2;
			}

			renderedPages = [];				// the list of the pages to display, it is generated from the previous LEFT and RIGHT pages
			var ll = leftPages.length,		// number of pages on the left side
				rl = rightPages.length,		// number of pages on the right side
				len = ll>rl? ll: rl,		// len is the longest length
				pg, t;	
			for( var i=0; i<len; i++ ) {	// create z-index order based Page List
				if( i<rl ) {
					t = rightPages[i];		// page number on the right side
					pg = pages[t];			// pageObject of this page.
						rightWidthMax( _VerticalMode? pg.__renderHeight: pg.__renderWidth );	//visible width on the right side...
						if( !pg.__outer ) shBaseRightWidth = rightWidth;
					renderedPages.splice( 0,0, t );	 // Put this page at the begining of the z-index order
					pg.__flip = FALSE;		// this page is not flipping (maybe it was in the previous session, so clear it!
					if( i==0 && !flipping ) {	// if this is the topmost page, and there isn't any flip animation
						if( !pg.__onTop ) {		// and it wasn't already on top, then set onTop flag, and queue on top event!
							PFeventsToCall.push( { e:2, p:t } );
							pg.__onTop = TRUE;
						}
					} else if ( pg.__onTop ) {	// if it was set az top page, then clear that flag, and queue on top end event!
						PFEventDispatcher( 3, t );
						pg.__onTop = FALSE;
					}
				}
				if( i<ll ) {
					t = leftPages[i];
					pg = pages[t];
						leftWidthMax( _VerticalMode? pg.__renderHeight: pg.__renderWidth );
						if( !pg.__outer ) shBaseLeftWidth = leftWidth;
					renderedPages.splice( 0,0, t );
					pages[leftPages[i]].__flip = FALSE;
					if( i==0 && !flipping ) {
						if( !pg.__onTop ) {
							PFeventsToCall.push( { e:2, p:t } );
							pg.__onTop = TRUE;
						}
					} else if ( pg.__onTop ) {
						PFEventDispatcher( 3, t );
						pg.__onTop = FALSE;
					}
				}
			}

			// set book centering according to the calculated LEFT and RIGHT side max width
			baseLeftWidth = leftWidth, baseRightWidth = rightWidth;
			// if there's an active flipping animation, add these pages to the rendered pages list
			if( flipping ) renderedPages = renderedPages.concat( flipPages );
			else setBookOffset();
			if( (flipping && (!_HardCover || _PerformanceAware) ) || !flipping ) { 
				setDropshadow( shBaseLeftWidth, shBaseRightWidth );
			}

			// check for new pages to display, and pages to remove from the display
			for( var i=0; i<renderedPages.length; i++ ) {
				t = renderedPages[i];
				if( lastPages.lastIndexOf( t ) < 0 ) {
					pagesToEnable.push( t );
				}
			}
			pagesToEnable = pagesToEnable.concat( pagesToPreload );
			for( var i=0; i<lastPages.length; i++ ) {
				t = lastPages[i];
				if( renderedPages.lastIndexOf( t ) < 0 ) pagesToDisable.push( t );
			}
			for( var i=0; i<lastPreload.length; i++ ) {
				t = lastPreload[i];
				if( pagesToPreload.lastIndexOf( t ) < 0 &&
					renderedPages.lastIndexOf( t ) < 0 ) pagesToDisable.push( t );
			}			

			// remove old pages from the DOM.
			for( var i=0, tp; i<pagesToDisable.length; i++ ) {
				tp = pagesToDisable[i];
				hi = hiddenPages.lastIndexOf( tp );
				t = pages[tp];
				if(t.__onTop) {
					PFeventsToCall.push( { e:3, p:tp } );
					pg.__onTop = FALSE;
				}
				if( t.__Unload!==FALSE ) {
					// Remove page
					if( hi >= 0 ) hiddenPages.splice( hi, 1 );
					PFEventDispatcher( 5, tp );
					t.$p.remove();
					if( t.__masked ) {
						t.__masked = FALSE;
						t.$m.remove();
						if( t.$fsc ) t.$fsc.remove();
					}
					if( t.$hts ) { t.$hts.remove(); t.$hts = __undefined; }
				} else if( hi<0 ) {	
					// hide page.
					if(t.__masked) removePageMask( tp ); 
					t.$p.css("display", "none");
					hiddenPages.push( tp );
					PFeventsToCall.push( { e:7, p:tp } );
				}
			}
						
			// add new pages to the DOM
			for( var i=0, p, $p, $c, rw, rh, T, L, R, hi, pl; i<pagesToEnable.length; i++ ) {
				p = pagesToEnable[i];							// page number of the new page
				hi = hiddenPages.lastIndexOf( p );
				pl = pagesToPreload.lastIndexOf( p );
				if( hi>=0 ) {
					if( pl<0 ) { 
						hiddenPages.splice( hi, 1 );			// remove from hidden pages
						pages[p].$p.css("display", "");
						PFeventsToCall.splice( 0,0, { e:8, p:p } );
					}
				} else {
					if( pl<0 ) {	// the page is not a preloaded page, make it visible
						PFeventsToCall.splice( 0,0, { e:8, p:p } );
					}
					__bookc.append( pageDOM( p ) );				// add this page to the DOM
					$p = pages[p].$p = p$(p);
					PFeventsToCall.splice( 0,0, { e:4, p:p } );
					rw = pages[p].__renderWidth;				// render width/height
					rh = pages[p].__renderHeight;
				
					if( _VerticalMode ) {	// T->R, L->T, R->B, B->L 
						L = ( _CoverWidth-rw )/2;
						T = p%2? _CoverHeight: _CoverHeight-rh;
						R = auto;				
					} else {
						T = ( _CoverHeight-rh )/2;
						L = p%2? auto: _CoverWidth-rw;
						R = p%2? _CoverWidth-rw: auto;
					}
					$p.css( { 	"position": "absolute", "overflow": "hidden",
								"width": rw, "height": rh, "top": T, "left": L, "right": R } );
																// place previously loaded html content into the new page in the DOM
					$c = pages[p].$c = c$(p);
					if( pages[p].__BackgroundFile ) {
						// LOAD PAGE BG HERE (as hidden pages doesn't preloads, this have to be fixed!!!
						$p.css( "backgroundImage", "url('"+pages[p].__BackgroundFile+"')" );
					}
					$c.html( pages[p].__HtmlData );				// fill the page with content
					if( pages[p].__HtmlFile ) {
						$c.load( pages[p].__HtmlFile, "GET" );
					}
					if( !pages[p].__isCover && !pages[p].__DisableEmbossing ) {
						$c.after( div( "pf-emboss-"+(p%2? "right": "left"), "page"+p+"emboss" ) );
						e$(p).css( { 	"position": "absolute", "overflow": "hidden",
										"width": D100,
										"height": (_VerticalMode? rw: rh),
										"top": (_VerticalMode? (p%2? -rw/2: rh-rw/2 ):0),
										"left": (_VerticalMode? (p%2? "50%": auto): (p%2? 0: auto)),
										"right": (_VerticalMode? (p%2? auto: "50%"): (p%2? auto: 0)),
										"transform-origin": (_VerticalMode? (p%2? "0% 50%": "100% 50%"): ""),
										"transform": (_VerticalMode? "rotate(90deg)": ""),
										"opacity": _EmbossOpacity
						} );
					}
					if( pl>=0 ) {
						$p.css("display", "none");
						hiddenPages.push( p );
						PFeventsToCall.push( { e:7, p:p } );
						/* now we load: */
						preloadedImages[p] = new Image();
						if( pages[p].__BackgroundFile ) preloadedImages[p].src = pages[p].__BackgroundFile;
					} 
				}
			}
			for( var i = 0, p, pp, $p, rw, rh , zi=2; i<renderedPages.length; i++ ) {	// go trough all the page actually rendered
				p = renderedPages[i],					// current page number
				pp = pages[p],
				$p = pp.$p,						// the jQ page
				rw = pp.__renderWidth,			// render sizes
				rh = pp.__renderHeight;
				if( pp.__flip && pp.__masked ) {	// page is flipping and already masked
					if( !_NoFlipShadow && pp.__animated ) { pp.$fsc.css( {	"z-index": zi++  } ); }
					pp.$m.css( {	"z-index": zi++  } );
				} else if( pp.__flip && !pp.__masked) {	// page is flipping, but not masked yet
					if( flipType == 2 ) {						// the page doesn't need mask (hardflip)
						$p.css(	{	"z-index": zi++,
									"transform-origin": _VerticalMode? (p%2? "50% 0%": "50% 100%"):  (p%2? "0% 50%": "100% 50%"),
									"backface-visibility": "visible"  } );
						if( !_NoFlipShadow && !pp.$hts ) {
							//console.log("addhts "+p);
							pp.$c.after( div( "pf-hard-topshadow", "page"+p+"hardtopshadow" ) );
							pp.$hts = hts$(p);
							pp.$hts.css( {	"position": "absolute", "top": 0, "left": 0, "width": "100%", "height": "100%", "background": "rgba(0,0,0,"+_HardFlipShadowOpacity+")" } );
						}
					} else {	// page is flipping, so create masks!
						//addmask when needed (flipping page yet without mask, only if needed!!!)
						$p.wrap( div( "pf-mask","page"+p+"mask" ) );
						pp.$m = m$(p)
						var ms = pp.__maskSize,
							animated = -pp.__animated;
						// set mask position...
						pp.$m.css( {	"position": "absolute",
									"right": _VerticalMode? auto: "50%",
									"top": _VerticalMode? _CoverHeight-ms: (_CoverHeight-ms)/2,
									"left": _VerticalMode? (_CoverWidth-ms)/2: auto,
									"width": ms, "height": ms,
									"transform-origin": _VerticalMode? "50% 100%": "100% 50%",
									"overflow": "hidden" } );
						// adjust page position
						$p.css(	{	"top": _VerticalMode? auto: (ms-rh)/2,
									"bottom": _VerticalMode? (p%2? -rh: 0): auto,
									"left": auto,
									"right":  _VerticalMode? (ms-rw)/2: (p%2? -rw: 0),
									"z-index": ""  } );
						
						if( !_NoFlipShadow ) {
							if( animated ) {
								pp.$c.after( div( "pf-flip-topshadow", "page"+p+"fliptopshadow" ) );
								pp.$fts = fts$(p);								
								pp.$fts.css( {	"position": "absolute",
												"top": (rh-ms)/2,
												"left": rw/2-D100,
												"width": D100,
												"height": ms,
												"transform-origin": "100% 50%",
												"overflow": "hidden",
												"opacity": _FlipTopShadowOpacity } );
								pp.$m.before( 	div( "pf-flip-shadow-container", "page"+p
																	+"flipshadowcontainer",
												div( "pf-flip-shadowA", "page"+p+"flipshadowA" ) +
												div( "pf-flip-shadowB", "page"+p+"flipshadowB" ) ) );
								pp.$fsc = fsc$(p);
								pp.$fsA = fsA$(p);
								pp.$fsB = fsB$(p);
								setFlipShadow( p, zi++, rh, rw, ms );
							}
						}
						pp.$m.css( {	"z-index": zi++ } );
						pp.__masked = TRUE;
					}
				} else if( !pp.__flip && pp.__masked ) {
					// the page have a mask, but didn't need it anymore, so remove it, also the shadows
					removePageMask( p );
					$p.css( "z-index", zi++ );
				} else {
					if( pp.$hts ) { pp.$hts.remove(); pp.$hts = __undefined; }
					$p.css( "z-index", (pp.__outer?0:zi++) );
				}
			}

			//finally call the event handlers - use trigger event instead!!!!!
			for( i=0; i<PFeventsToCall.length; i++ ) {
				PFEventDispatcher( PFeventsToCall[i].e, PFeventsToCall[i].p );
			}

			setPageCheckVariables();
			setPager();
			if( _Thumbnails ) setThumbnailsOffset();
		},
		removePageMask = function( p ) {
			var pp = pages[p],
				$p = pp.$p,
				rw = pp.__renderWidth,
				rh = pp.__renderHeight;
			$p.unwrap();
			$p.css(	{	"top": _VerticalMode? (p%2? _CoverHeight: _CoverHeight-rh): (_CoverHeight-rh)/2,
						"left": _VerticalMode? auto: (p%2? auto: _CoverWidth-rw),
						"right": _VerticalMode? (_CoverWidth-rw)/2: (p%2? _CoverWidth-rw: auto),
						"transform-origin": "",
						"backface-visibility": "" } );
			if( pp.$fsc ) { pp.$fsc.remove(); pp.$fsc = pp.$fsA = pp.$fsB = __undefined; }
			if( pp.$fts ) { pp.$fts.remove(); pp.$fts = __undefined; }
			pp.__masked = FALSE;
		},
		setFlipShadow = function( p, zi, rh, rw, ms ) {
				pages[p].$fsc.css( {	"z-index": zi++,
								"position": "absolute",
								"top": _VerticalMode? _CoverHeight-rh: (_CoverHeight-rh)/2,
								"left": _VerticalMode? (_CoverWidth-rw)/2: _CoverWidth-rw,
								"width": _VerticalMode? rw: 2*rw,
								"height": _VerticalMode? rh*2: rh,
								"overflow": "hidden",
								"opacity": _FlipShadowOpacity } );
				pages[p].$fsA.css( {	"position": "absolute",
								"top": _VerticalMode? rh-ms: rh/2-ms,
								"right": _VerticalMode? rw/2: rw,
								"width": D100,
								"height": ms*2,
								"transform-origin": "100% 50%",
								"overflow": "hidden" } );
				pages[p].$fsB.css( {	"position": "absolute",
								"top": _VerticalMode? rh-ms/2 :(rh-ms)/2,
								"left": _VerticalMode? rw/2 : rw,
								"width": D100,
								"height": ms,
								"transform-origin": "0% 50%",
								"overflow": "hidden" } );
		},
		setDropshadow = function( pLW, pRW ) {
			if( !_DropShadow ) return;
			if( pLW==shLeftWidth && pRW==shRightWidth ) return;
			shLeftWidth=pLW, shRightWidth=pRW;
			var sc = (pLW+pRW)/(_VerticalMode? bookHeight: bookWidth);
			if(_VerticalMode) __dropshadow.css( {	transform: tr(0,bookHeight/2-pLW)+"scaleY("+sc+")" } );
			else __dropshadow.css( {	transform: tr(bookWidth/2-pLW,0)+"scaleX("+sc+")" } );
		},
	//-------------------------------------------------------------------------------------
		
		// Page flipping animations are managed here
		addFlip = function( mx, my, pFlipMode, pDir, pFlipType, pPNadd, mxf, myf ) {
			// Add a new flip to the queue	
			if( cancelFlip ) return FALSE;
			
			mxf = mxf || mx;	// forced position at start.
			myf = myf || my;
			
			var flips = flipOrder.length,
				sPN = startPN,
				pPNadd = pPNadd || 2,
				pFlipType = pFlipType || 0;
			
			if( flips >= maxFlips ) return FALSE;
			if( flips == 0 ) sPN = PN;
			else sPN = endPN;
			
			pPNadd += pPNadd%2;	// increment can't be odd number
		
			if( pDir<0 && sPN-pPNadd<_MinPageLimit ) return FALSE;
			if( pDir>0 && sPN+pPNadd>_MaxPageLimit ) return FALSE;
			
			// destination exists, let's start:)
			var startPagePN = sPN + ( pDir>0? 1:0 ),
				endPagePN = sPN + ( pPNadd - ( pDir<0? 1:0 ) )*pDir,
				tempFlipType;

			if( pages[startPagePN].__isHard || pages[endPagePN].__isHard ) tempFlipType = 2;
			else tempFlipType = pFlipType;
			// override?
			
			if( flips == 0 ) {
				flipping = TRUE;
				flipDir = pDir;
				flipType = tempFlipType;
			} else if ( flipDir != pDir || flipType != tempFlipType ) return FALSE;
			
			lastFlipMode = pFlipMode;
			startPN = sPN;
			endPN = sPN + pPNadd*pDir;
			var psh = flipType==1;
			// ok there's no more obstacle, start the flip
			flipOrder[flips] = resetFlipCalc (
								{	__startPN: startPN,
									__endPN: endPN,
									__startPagePN: psh?endPagePN:startPagePN,
									__endPagePN: psh?startPagePN:endPagePN,
									__flipMode: pFlipMode,
									__flipType: flipType,
									__dir: pDir,
									__started: FALSE,
									__success: FALSE	}, mx, my );
			setPages();
			if( mxf || myf ) { flipCalc( flipOrder[flips], mxf*VM, myf); }
			return TRUE;
		},
		changeFlip = function( pFD, pFlipMode, pDir, mxf, myf ) {
			pDir = pDir || pFD.__dir;
			if( pFD.__dir != pDir || 
				pFD.__flipMode == 0 ||
				pFD.__flipMode == 4 ||
				pFD.__flipMode == 5 ||
				pFlipMode == 0 ||
				pFlipMode == 1 ) { return FALSE; }
			lastFlipMode = pFD.__flipMode = pFlipMode;
			flipCalc( pFD, mxf, myf);
			return TRUE;
		},
		clearFlip = function( pFD ) {
			var pageA = pFD.__startPagePN,
				pageB = pFD.__endPagePN,
				$pageA = pages[pageA].$p,
				$pageB = pages[pageB].$p;
			pages[pageA].__flip = pages[pageA].__animated = pages[pageB].__flip = pages[pageB].__animated = FALSE;
			$pageB.css( { transform: tr(0,0)+"rotate(0deg) "} );
			$pageA.css( { transform: tr(0,0)+"rotate(0deg) "} );
		},
		removeFlip = function( pI ) {
			var FD = flipOrder[pI];	//, tornOff = FD.__flipMode==5;
			if( !FD.__success ) { cancelFlip = FALSE; }
			else { PN = FD.__endPN; }
			PFEventDispatcher( 1, FD.__startPagePN );	// flip end events
			PFEventDispatcher( 1, FD.__endPagePN );
			clearFlip( FD );
			/*if( tornOff ) {
				if( FD.__dir<0 ) PN = FD.__endPN;
				removePages( pages[FD].__startPagePN, pages[FD].__endPagePN );
			} */
			flipOrder.splice( pI,1 );
			flipping = flipOrder.length!=0;
			if( flipping && pI>0 ) {
				startPN = flipOrder[pI-1].__startPN;
				endPN = flipOrder[pI-1].__endPN;
			}
		},
		resetFlipCalc = function( pFD, mx, my ) {
			// set up some variables needed for the flipping	
			var pn = pFD.__endPagePN,
				rw = pages[pn].__renderWidth,
				rh = pages[pn].__renderHeight;
				
			if( pFD.__flipMode==2 ) {
				if( _VerticalMode ) {
					mx *= rh*pFD.__dir/my;
					my = rh*pFD.__dir;
					if( mx<-rw/2 ) mx = -rw/2;
					if( mx>rw/2 ) mx = rw/2;
				} else {
					my *= rw*pFD.__dir/mx;
					mx = rw*pFD.__dir;
					if( my<-rh/2 ) my = -rh/2;
					if( my>rh/2 ) my = rh/2;
				}
			}
			pFD.__side = pn%2? 1: -1;
			pFD.__sx = _VerticalMode? -mx:				-rw*pFD.__side;		
			pFD.__sy = _VerticalMode? -rh*pFD.__side:	my;		
			pFD.__cx = _VerticalMode? 0:				-rw/2*pFD.__side;		
			pFD.__cy = _VerticalMode? -rh/2*pFD.__side:	0;		
			pFD.__ax = _VerticalMode? -mx:				-rw*(mx<0?1:-1);		
			pFD.__ay = _VerticalMode? -rh*(my<0?1:-1):	my;	
			
			return pFD;	
		},
		flipCalc = function( pFD, mx, my, pForced ) {
			mx = mx || pFD.__ax;
			my = my || pFD.__ay;

			var pA = pFD.__startPagePN, pB = pFD.__endPagePN,
				$pageA = pages[pA].$p, $maskA = pages[ pA ].$m,
				$pageB = pages[pB].$p, $maskB = pages[ pB ].$m,
				rw = pages[pA].__renderWidth,
				rh = pages[pA].__renderHeight,
				hw = rw/2,
				hh = rh/2,
				FD = flipDir*(flipType==1?-1:1),
				sx = pFD.__sx,
				sy = pFD.__sy,
				cx = pFD.__cx,
				cy = pFD.__cy,
				
				mfd = _VerticalMode? 	(my==pFD.__ex? __undefined: (my<pFD.__ex?-1: 1)):
										(mx==pFD.__ex? __undefined: (mx<pFD.__ex?-1: 1));
				pFD.__ex = _VerticalMode? my: mx;

			// drag point limit calculations (not for hardcover)
			if( flipType!=2 ) {				
				// check position...
				if( _VerticalMode ) {
					var	r0 = Mq( my*my + (hw+mx)*(hw+mx) ),	// right
						r1 = Mq( my*my + (hw-mx)*(hw-mx) ),	// left
						r0max = Mq( rh*rh + (hw+sx)*(hw+sx) ),
						r1max = Mq( rh*rh + (hw-sx)*(hw-sx) );
												
					if( ( r0>r0max || r1>r1max ) && pFD.__flipMode!=5 ) {
						if ( ((r0-r0max)>_TearDistance || (r1-r1max)>_TearDistance) && pages[pFD.__startPagePN].__TearOff && pFD.__flipMode==2 ) {
							pFD.__flipMode=5;	//tear off from here...
							var ty = my*2,
								tx = mx<0? -rw*1.5:rw*1.5;
							setTBA( pFD, tx, ty , _FlipDuration, 2, 0 );
							
						} else {
							if( mx<sx ) {
								var b = hw-mx, a = Mas(b/r1);
								mx = hw-Ms(a)*r1max;
								my = Mc(a)*r1max*(my<0? -1: 1);		
								if( mx>sx ) { if( (sy*my)>0 ) { my = sy, mx = sx; } else { my = -sy, mx = sx; } }
							} else {
								var b = hw+mx, a = Mas(b/r0);
								mx = Ms(a)*r0max-hw;
								my = Mc(a)*r0max*(my<0? -1: 1);		
								if( mx<sx ) { if( (sy*my)>0 ) { my = sy, mx = sx; } else { my = -sy, mx = sx; } }
							}
							
						}
					}
					// keep a little space from the edge (animations could look terrible without it...)
					if(((sy<0 && (my-sy)<20) || (sy>0 && (sy-my)<20)) && !pForced ) {
						if(sy<0) my = -rh+20;
						if(sy>0) my = rh-20;
					}
				} else {
					var	r0 = Mq( mx*mx + (hh+my)*(hh+my) ),	// top r
						r1 = Mq( mx*mx + (hh-my)*(hh-my) ),	// bottom r
						r0max = Mq( rw*rw + (hh+sy)*(hh+sy) ),
						r1max = Mq( rw*rw + (hh-sy)*(hh-sy) );
						
					if( ( r0>r0max || r1>r1max ) && pFD.__flipMode!=5 ) {
						if ( ((r0-r0max)>_TearDistance || (r1-r1max)>_TearDistance) && pages[pFD.__startPagePN].__TearOff && pFD.__flipMode==2 ) {
							pFD.__flipMode=5;	//tear off from here...
							var tx = mx*2,
								ty = my<0? -rh*1.5:rh*1.5;
							setTBA( pFD, tx, ty , _FlipDuration, 0, 2 );
							
						} else {
							if( my<sy ) {
								var b = hh-my, a = Mas(b/r1);
								my = hh-Ms(a)*r1max;
								mx = Mc(a)*r1max*(mx<0? -1: 1);
								if( my>sy ) { if( (sx*mx)>0 ) { my = sy, mx = sx; } else { my = sy, mx = -sx; } }
							} else {
								var b = my+hh, a = Mas(b/r0);
								my = Ms(a)*r0max-hh;
								mx = Mc(a)*r0max*(mx<0? -1: 1);
								if( my<sy ) { if( (sx*mx)>0 ) { my = sy, mx = sx; } else { my = sy, mx = -sx; } }
							}
						}
					}
					// keep a little space from the edge (animations could look terrible without it...)
					if(((sx<0 && (mx-sx)<20) || (sx>0 && (sx-mx)<20)) && !pForced ) {
						if(sx<0) mx = -rw+20;
						if(sx>0) mx = rw-20;
					}
				}
			}
			// follow mouse gently...
			if( pForced ) {
				pFD.__ax = mx, pFD.__ay = my;
			} else {
				pFD.__ax += ( mx-pFD.__ax )/5, pFD.__ay += ( my-pFD.__ay )/5;
				if( Ma(mx-pFD.__ax)<0.5 && Ma(my-pFD.__ay)<0.5 ) { pFD.__ax = mx, pFD.__ay = my; }
				mx = pFD.__ax, my = pFD.__ay;
			}
			// Hardflip position and PageWidth for centering: (pos)
			var pos = _VerticalMode? (my/rh)*D90: (mx/rw)*D90;
			if( pos<-D90 ) pos = -D90;
			if( pos>D90 ) pos = D90;
			if( pos<0 ) leftWidthMax( -Ms( pos/AM )*(_VerticalMode? rh :rw) );
			if( pos>0 ) rightWidthMax( Ms( pos/AM )*(_VerticalMode? rh :rw) );

			// if the last position was the same, don't waste time with further calculations...
			if( mx==pFD.__lx && my==pFD.__ly) return;
			
			if( flipType==2 ) {
				var FD = flipDir*( pos<0?1: -1 ),
					ba = D90*flipDir,
					rots = _VerticalMode? "rotateX":"rotateY",
					out = 3000;
				
				if( FD<0 ) {
					if( has3d ) {
						$pageA.css( { transform: rots+'('+((D180+ba+pos)*VM)+'deg) '+tr(0,0), opacity: 1 } );
						$pageB.css( { transform: rots+'('+(D90)+'deg) '+tr(out,out), opacity: 1 } );
					} else {
						var s = -(D90-Ma(pos))/5*flipDir;
						$pageA.css( { transform:
							_VerticalMode?	"scaleY("+Ms(flipDir*pos/AM)+") skewX("+s+"deg) "+tr(0,0):
											"scaleX("+Ms(flipDir*pos/AM)+") skewY("+s+"deg) "+tr(0,0) } );
						$pageB.css( { transform: tr(out,out) } );
					}
				}
				else {
					if( has3d ) {
						$pageB.css( { transform: rots+'('+((D180-ba+pos)*VM)+'deg) '+tr(0,0), opacity: 1 } );
						$pageA.css( { transform: rots+'('+(D90)+'deg) '+tr(out,out), opacity: 1 } );
					} else {
						var s = (D90-Ma(pos))/5*flipDir;
						$pageB.css( { transform:
							_VerticalMode?	"scaleY("+Ms(-flipDir*pos/AM)+") skewX("+s+"deg) "+tr(0,0):
											"scaleX("+Ms(-flipDir*pos/AM)+") skewY("+s+"deg) "+tr(0,0) } );
						$pageA.css( { transform: tr(out,out) } );
					}
				}

				if( !_NoFlipShadow ) {
					if(FD<0) pages[pA].$hts.css( "opacity", (1-Ma(Ms( pos/AM ))+1-Ma(pos/90))/2 );
					else pages[pB].$hts.css( "opacity", (1-Ma(Ms( pos/AM ))+1-Ma(pos/90))/2 );
				}
				pFD.__ax = mx, pFD.__ay = my;
			} else {
	
				if( _VerticalMode ) {
					// start calculations ( values for rotation and translation for pages, masks, and shadows)
					var	dx = sx-mx,
						dy = sy-my,
						dcx = sx-cx,
						dcy = sy-cy,
						r = Mq(dx*dx+dy*dy),
						a = Mas(dx/r)||0,
						cr = Mq(dcx*dcx+dcy*dcy),
						b = Mas(dcx/cr);
						
					if( dy<0 || ( dy==0 && FD<0 ) ) a = PI-a;
					if( dcy<0 ) b = PI-b;
					b = a-(b-a); 
		
					var py = Mc(b)*cr+my,
						px = Ms(b)*cr+mx,
						dpcx = (px-cx)/2,
						dpcy = (py-cy)/2,
						mpx = cx+dpcx,
						mpy = cy+dpcy,
						l = Mq(dpcx*dpcx+dpcy*dpcy);
					
					if( dpcy<0 ) { l *= -1 };
					
					var ad = a*AM;
					var z= 6;
					
					//move the pages, and masks						
					$pageB.css( { transform: tr( 0, ((hh+l)*FD).toFixed(z) )+"rotate("+(ad)+"deg) "} );
					$maskB.css( { transform: tr( -mpx.toFixed(z), mpy.toFixed(z) )+"rotate("+(ad)+"deg)"} );
					$pageA.css( { transform: tr( -(Ms(-a)*FD).toFixed(z), ((-hh-l+1*Mc(-a))*FD).toFixed(z) )+"rotate("+(-ad)+"deg) "} );
					$maskA.css( { transform: tr( (-mpx).toFixed(z), (mpy-1*FD).toFixed(z) )+"rotate("+(ad)+"deg)"} );
					
					// find the farest corner from the folding line
					var sl = Ma(Mc( a )*hh) - l*FD,
						stl = Ms(-a)*hw+sl,
						sbl = Ms(a)*hw+sl,
						sml = (stl+sbl)/2,
						op = 1;
					sl = stl>sbl? stl: sbl;
					pFD.__sl = sl;
	
					if( !_NoFlipShadow ) {
						sl /= rh;
						sml /= rh;
						var ssl2 = sml<.05? .05: sml;
						if( sml< .2 ) sml = sl;
						if( sml< .2 ) op=5*sml;
						if( sml> .9 ) op=1-(sml-.9)*10;
						
						var ssl = sl;
						if( ssl> .6 ) {
							if( ssl> .8 ) { ssl = .6 - 1*( ssl-.8 ) }
							else { ssl = .6 + Ms( ((ssl-.6)/.2)*PI ) * .1;}
						}
						var shOp = 0.5+op/2;
						// move the shadows
						pages[ pB ].$fsA.css( { transform: tr( (-mpx).toFixed(5), (mpy).toFixed(5) )+"rotate("+(ad+90)+"deg) scaleX("+(ssl2*6)+")", "opacity": shOp.toFixed(5) } );
						pages[ pB ].$fsB.css( { transform: tr( (-mpx).toFixed(5), (mpy).toFixed(5) )+"rotate("+(ad+90)+"deg) scaleX("+(sl*3)+")", "opacity": op.toFixed(5) } );
						pages[ pB ].$fts.css( { transform: "rotate("+(-ad+90)+"deg) "+tr( (-l*FD).toFixed(5), 0 )+"scaleX("+(ssl*4)+")", "opacity": (op*_FlipTopShadowOpacity).toFixed(5) } );
						
					}
					pFD.__lx = mx, pFD.__ly = my;

				} else {
					// start calculations ( values for rotation and translation for pages, masks, and shadows)
					var	dx = sx-mx,
						dy = sy-my,
						dcx = sx-cx,
						dcy = sy-cy,
						r = Mq(dx*dx+dy*dy),
						a = Mas(dy/r)||0,
						cr = Mq(dcx*dcx+dcy*dcy),
						b = Mas(dcy/cr);
						
					if( dx<0 || ( dx==0 && FD<0 ) ) a = PI-a;
					if( dcx<0 ) b = PI-b;
					b = a-(b-a); 
		
					var px = Mc(b)*cr+mx,
						py = Ms(b)*cr+my,
						dpcx = (px-cx)/2,
						dpcy = (py-cy)/2,
						mpx = cx+dpcx,
						mpy = cy+dpcy,
						l = Mq(dpcx*dpcx+dpcy*dpcy);
					
					if( dpcx<0 ) { l *= -1 };
					
					var ad = a*AM;
					var z= 6;
					
					//move the pages, and masks						
					$pageB.css( { transform: tr( ((hw+l)*FD).toFixed(z),0 )+"rotate("+(ad)+"deg) "} );
					$maskB.css( { transform: tr( mpx.toFixed(z), mpy.toFixed(z) )+"rotate("+(ad)+"deg)"} );
					$pageA.css( { transform: tr( ((-hw-l+1*Mc(-a))*FD).toFixed(z), (Ms(-a)*FD).toFixed(z))+"rotate("+(-ad)+"deg) "} );
					$maskA.css( { transform: tr( (mpx-1*FD).toFixed(z), (mpy).toFixed(z) )+"rotate("+(ad)+"deg)"} );
					
					// find the farest corner from the folding line
					var sl = Ma(Mc( a )*hw) - l*FD,
						stl = Ms(-a)*hh+sl,
						sbl = Ms(a)*hh+sl,
						sml = (stl+sbl)/2,
						op = 1;
					sl = stl>sbl? stl: sbl;
					pFD.__sl = sl;
	
					if( !_NoFlipShadow ) {
						sl /= rw;
						sml /= rw;
						var ssl2 = sml<.05? .05: sml;
						if( sml< .2 ) sml = sl;
						if( sml< .2 ) op=5*sml;
						if( sml> .9 ) op=1-(sml-.9)*10;
						
						var ssl = sl;
						if( ssl> .6 ) {
							if( ssl> .8 ) { ssl = .6 - 1*( ssl-.8 ) }
							else { ssl = .6 + Ms( ((ssl-.6)/.2)*PI ) * .1;}
						}
						var shOp = 0.5+op/2;
						// move the shadows
						pages[ pB ].$fsA.css( { transform: tr( (mpx).toFixed(5), (mpy).toFixed(5) )+"rotate("+(ad)+"deg) scaleX("+(ssl2*6)+")", "opacity": shOp.toFixed(5) } );
						pages[ pB ].$fsB.css( { transform: tr( (mpx).toFixed(5), (mpy).toFixed(5) )+"rotate("+(ad)+"deg) scaleX("+(sl*3)+")", "opacity": op.toFixed(5) } );
						pages[ pB ].$fts.css( { transform: "rotate("+(-ad)+"deg) "+tr( (-l*FD).toFixed(5), 0 )+"scaleX("+(ssl*4)+")", "opacity": (op*_FlipTopShadowOpacity).toFixed(5) } );
					}
					pFD.__lx = mx, pFD.__ly = my;
				}
			}
			return mfd;
		},
	//-------------------------------------------------------------------------------------
		
		// Time based animation control
		setTBA = function( pFD, tx, ty, duration, styleX, styleY, pR ) {
			pFD.__stx = pFD.__ax;
			pFD.__sty = pFD.__ay;
			pFD.__tx = tx;
			pFD.__ty = ty;
			pFD.__duration = duration;
			pFD.__styleX = styleX;
			pFD.__styleY = styleY;
			pFD.__start = getNow().getTime();
			pFD.__r = pR;
		},
		getTBA = function( pFD ) {
			var elapsed = getNow().getTime() -pFD.__start,
				duration = pFD.__duration,
				end = FALSE;
			if( elapsed>= duration ) {
				end = TRUE
				elapsed = duration;
			}
			var timeScale = elapsed/duration,
				dx = pFD.__tx-pFD.__stx, dy = pFD.__ty-pFD.__sty,
				x = pFD.__stx + getTBAstyle( pFD.__styleX, timeScale, dx, pFD.__r ),
				y = pFD.__sty + getTBAstyle( pFD.__styleY, timeScale, dy, pFD.__r );
		
			return { x: x, y: y, end: end };
		},
		getTBAstyle = function( style, timeScale, dist, r ) {
			switch ( style ) {
				case 0:		return dist*timeScale;							// Linear
				case 1:		return Ms( PI*timeScale/2 )*dist;				// EaseIn
				case 2:		return (1-Mc( PI*timeScale/2 ))*dist;			// EaseOut
				case 3:		return (1-Mc( PI*timeScale ))/2*dist;			// EaseInOut
				case 4:		return Ms( 2*PI*timeScale )*r;					// SINUS
				case 5:		return Ms( PI*timeScale )*r;					// HALFSINUS
				case 6:		return Mc( 2*PI*timeScale )*r;					// COSINUS
				case 7:		return Mc( PI*timeScale )*r;					// HALFCOSINUS
			}
		},
		getNow = function() { return new Date(); },
	//-------------------------------------------------------------------------------------
		
		// Pageflip Main Loop
		loop,
		moved = FALSE,
		PFLoop = function() {
			if( loop ) raf( PFLoop );
			
			if( flipQueue.length>0 ) {
				// Any flip in the queue?
				tryQueueFlip();
			}
			if( flipping ) {
				var FD;
				leftWidth = shBaseLeftWidth, rightWidth = shBaseRightWidth;
				for( var i=0; i<flipOrder.length; i++ ) {
					FD = flipOrder[i];
					switch( FD.__flipMode ) {
						case 1:
							break;
						case 2:
						case 3:
							manualFlipDir = flipCalc( FD, mx*VM, my ); 
							break;
						case 0:
						case 4:
							var tba = getTBA( FD );
							flipCalc( FD, tba.x, tba.y, TRUE );
							// remove flip
							if( tba.end ) {
								removeFlip( i );
								setPages();
								// touchcontrol bug fix (loses touchmove event, so we finish the flip insted of simply freezing it.
								if( touchControl && manualFlip ) {
									endManualFlip( flipOrder[ flipOrder.length-1 ] );
									resetMultiTouches();
								}
								if( !changed ) triggerOnMove()
								i--;
							}
							break;
						case 5:
							var tba = getTBA( FD );
							flipCalc( FD, tba.x, tba.y, TRUE );
							if( tba.end ) {
								removeFlip( i );
								setPages();
								i--;
							}
							break;
					}
				}
				if( flipping ) {
					if( _HardCover && !_PerformanceAware ) setDropshadow( leftWidth, rightWidth );
					leftWidthMax( baseLeftWidth );
					rightWidthMax( baseRightWidth );
					setBookOffset();
				}
			}
			if( _Thumbnails ) thumbnailOEF();
			zoomOEF();
		},
		
		// Pageflip Control
		touchControlled = false,
		onStartStage = function(e) {
			if( _DisableBackgroundEvents ) {
				PD( e );
			}
		},
		onStartT = function(e) {
			onStart( e, true );
		},
		onMoveT = function(e) {
			onMove( e, true );
		},
		onEndT = function(e) {
			onEnd( e, true );
		},
		onStart = function(e, touch ) {
			touchControlled = touch || false;
			// A mouse click or touch has occured
			moved = FALSE;

			if( manualFlip || autoFlip || !_MouseControl ) { return; }
			
			if( $(e.target).hasClass("pf-hotspot") || $(e.target).hasClass("pf-activecontent") || $(e.target).parents(".pf-activecontent").length ) { return TRUE; }
			setTargetCoords( e );

			if( touchControlled && _PinchZoom ) {
				// Watch and handle multitouch
				// Start pinch zoom
				updateMultiTouches( e, addTouch );
				if( newPinch ) {
					newPinch = FALSE;
					if( !pinching ) {
						pinching = TRUE;
						resetPinch( e );
						pTF = zF;
					}
				}
				if( pinching ) { PD( e ); return; }
			}
			
			var CA = checkPreflipArea( mx,my, manualPreflip );
			if( CA && canFlip() ) {
				resetMultiTouches();
				PD(e);
				switch( CA ) {
					case "TL":
					case "BL":
						if( manualPreflip || autoPreflip ) {
							if( changeFlip( flipOrder[ flipOrder.length-1 ], 2, -1 ) ) {
								manualPreflip = autoPreflip = FALSE;
								manualFlip = TRUE;
							}
						} else if( addFlip( mx, my, 2, -1, 0 ) ) manualFlip = TRUE;
						break;
					case "TR":
					case "BR":
						if( manualPreflip || autoPreflip ) {
							if( changeFlip( flipOrder[ flipOrder.length-1 ], 2, 1 ) ) {
								manualPreflip = autoPreflip = FALSE;
								manualFlip = TRUE;
							}
						} else if( addFlip( mx, my, 2, 1, 0 ) ) manualFlip = TRUE;							
						break;
				}
			} else { 
				CA = checkControlArea( mx, my );
				if( CA && canFlip() ) {
					resetMultiTouches();
					PD(e);
					if( _SinglePageMode ) {
						if( !_RightToLeft && CA=="IL" ) CA="IR";
						if( _RightToLeft && CA=="IR" ) CA="IL";
					}
					switch( CA ) {
						case "OL":
							if( addFlip( mx, my, 2, -1, 1 ) ) manualFlip = TRUE;
							break;
						case "IR":
							if( addFlip( 	_VerticalMode? (mx<0?-leftPageW:leftPageW): -D100,
											_VerticalMode? -D100: (my<0?-leftPageH:leftPageH),
											2, -1, _SinglePageMode? 1:0 ) ) manualFlip = TRUE;
							break;
						case "OR":
							if( addFlip( mx, my, 2, 1, 1 ) ) manualFlip = TRUE;
							break;
						case "IL":
							if( addFlip( 	_VerticalMode? (mx<0?-rightPageW:rightPageW): D100,
											_VerticalMode? D100: (my<0?-rightPageH:rightPageH),
											2, 1, _SinglePageMode? 1:0 ) ) manualFlip = TRUE;
							break;
					}
				} else if( zooming && canZoom(e)) {
					PD(e);
					zoomDrag = TRUE;
					moved = FALSE;
					var result = getZoomTargetCoords( e );
					zoomResetDrag( result.x, result.y );
				} else {
					return FALSE;
				}
			}
		},
		onMove = function(e, touch ) {
			touchControlled = touch || false;
			
			moved = TRUE;
			
			if( autoFlip || !_MouseControl ) return;
			if( manualFlip || manualPreflip || zoomDrag || pinching) PD(e);
			
			// pinching in progress
			if( touchControlled && pinching ) {
				updatePinch( e );
				setPinchTargetPosition( pCX, pCY );
				PD(e);
				return;
			}
			setTargetCoords( e );
			if( zoomDrag ) {
				var result = getZoomTargetCoords( e );
				setZoomTargetPosition( result.x, result.y );
				return;
			}
			var CA = checkPreflipArea( mx,my, manualPreflip );
			if( manualPreflip && !touchControlled) {
				if( !CA ) {
					endManualFlip( flipOrder[ flipOrder.length-1 ] );
				}
			} else if( manualFlip ) {
				
			} else if ( !touchControlled && !zooming && _Preflip ) {
				if( CA ) {
					switch( CA ) {
						// preflip itt kezdodik
						case "TL":
						case "BL":
							if( addFlip(	_VerticalMode? (mx<0?-leftPageW:leftPageW): mx,
											_VerticalMode? my: (my<0?-leftPageH:leftPageH),
											3, -1, 0, __undefined, mx, my ) ) manualPreflip = TRUE;
							break;
						case "TR":
						case "BR":
							if( addFlip( 	_VerticalMode? (mx<0?-rightPageW:rightPageW): mx,
											_VerticalMode? my: (my<0?-rightPageH:rightPageH),
											3, 1, 0, __undefined, mx, my ) ) manualPreflip = TRUE;
							break;
					}
				}			
			}
		},
		onEnd = function(e, touch ) {
			touchControlled = touch || false;
			if( !_MouseControl ) return;
			if( $(e.target).hasClass("pf-hotspot") || $(e.target).hasClass("pf-activecontent") || $(e.target).parents(".pf-activecontent").length  ) { return TRUE; }
			setTargetCoords( e );
			touchid = null;
			if( touchControlled && _PinchZoom ) {
				updateMultiTouches( e, removeTouch );
				if( newPinch && pinching ) {
					newPinch = FALSE;
					renewPinch( e );
				}
			}			
			if( manualFlip || manualPreflip ) {
				PD(e);
				endManualFlip( flipOrder[ flipOrder.length-1 ] );
				changed = FALSE;
				if( !touchControlled ) triggerOnMove();
			} else if( zoomDrag ) {
				PD(e);
				zoomDrag = FALSE;
				if( !canZoom(e) ) return TRUE;
				if( !moved && checkPageArea( mx,my ) && _ClickZoom ) doubleClickZoom( e, false );//
			} else {
				if( !canZoom(e) ) return TRUE;
				if( !moved && checkPageArea( mx,my ) && _ClickZoom ) {
					doubleClickZoom( e, true );
				}
 			}
		},
			dct = 0,
			doubleClickZoom = function( e, zin ) {
				var now = getNow();
				if( now-dct < 300 ) {
					if( zin ) {
						var result = getZoomTargetCoords( e );
						matchZoomPosition( mx, my, result.x, result.y );
						API.zoomIn();	// else ha elobb elmaradna a return
					} else {
						API.zoomOut();
					}
					dct = 0;
				}
				dct = now;
			},
		onKey = function(e) {
			if( document.activeElement.tagName.toLowerCase() != "body") return;
			if( !_HotKeys || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey ) return;
			var ch = e.keyCode;
			switch( e.keyCode ) {
				case 37: PD(e); API.gotoPrevPage( TRUE ); break;
				case 39: PD(e); API.gotoNextPage( TRUE ); break;
				case 40: PD(e); API.gotoLastPage( TRUE ); break;
				case 38: PD(e); API.gotoFirstPage( TRUE ); break;
				case 90: PD(e); API.toggleZoom(); break;
				case 84: PD(e); API.showThumbnails(); break;
				case 65: PD(e); API.toggleAutoFlip(); break;
			}
		},
		onCancel = function(e) {
			touchid = null;
			resetMultiTouches();
			endPinch();
		},
		triggerOnMove = function() {
			__doc.trigger( pfEvent.__onMove );	
		},
		addAutoFlip = function( pDir, pFlipType, pPNadd ) {
			var success = FALSE,
				HDir = _VerticalMode? -0.5: pDir,
				VDir = _VerticalMode? pDir*2: 1;
			
			if( addFlip( 	HDir*_PageWidth, VDir*_PageHeight/2, 0, pDir, pFlipType, pPNadd,
							HDir*_PageWidth*.97, VDir*_PageHeight/2*.97) ) {
				var FD = flipOrder[ flipOrder.length-1 ];
				FD.__success = TRUE;
				var TM = FD.__flipType==1? 1: -1;			// Target multiplier

				if( _VerticalMode ) {
					setTBA( 	FD, FD.__sx, TM*FD.__sy , _FlipDuration, 5, FD.__flipType==2?0:3,
								-_PageWidth/8-((Mrn()-0.5)*_PageWidth/16) );
				} else {
					setTBA( 	FD, TM*FD.__sx, FD.__sy , _FlipDuration, FD.__flipType==2?0:3, 5,
								-_PageHeight/8+((Mrn()-0.5)*_PageHeight/16) );
				}
				success = TRUE;
			}
			return success;
		},
		endManualFlip = function( pFD, pDir ) {
			// finish manual flip with automated animation
			if( pDir && pDir!=pFD.__dir ) return;
			var	tside = pFD.__side*(pFD.__flipType==1?-1:1);
			if( changeFlip( pFD, 4 ) ) {
				pFD.__success = manualFlipDir && manualFlip? manualFlipDir==tside:(tside*(_VerticalMode?my:mx))>0;
				var CA = checkPreflipArea( mx,my, manualPreflip || manualFlip ),
					CCA = checkControlArea( mx, my );
				if( !moved && (CA || CCA) ) pFD.__success = _ClickFlip;
				manualFlip = manualPreflip = FALSE;
				var tx = pFD.__sx*(_VerticalMode? 1: (pFD.__success?-1:1)*pFD.__side*tside),
					ty = pFD.__sy*(_VerticalMode? (pFD.__success?-1:1)*pFD.__side*tside: 1),
					chv = _VerticalMode? bookHeight: bookWidth,
					m = getDist( tx-pFD.__ax, ty-pFD.__ay )/chv,
					m2 = pFD.__sl/chv,
					st = 2;
				if( m2>m ) { m = m2, st = 1; }
				setTBA( pFD, tx, ty, _FlipDuration*m, _VerticalMode? st:0, _VerticalMode? 0:st );
				cancelFlip = !pFD.__success;
			}
		},
		setPageCheckVariables = function() {
			leftPageW = pages[PN].__renderWidth/VD || 0;
			leftPageH = pages[PN].__renderHeight/HD || 0;
			rightPageW = pages[PN+1].__renderWidth/VD || 0;
			rightPageH = pages[PN+1].__renderHeight/HD || 0;
		},
		
		// Multitouch control functions --------------------------------------------------------

		multiTouches,
		resetMultiTouches = function() {
			multiTouches = [];
			pinchTouches = [];
		},
		updateMultiTouches = function( e, callback ) {
			var e = e.originalEvent.changedTouches;
			for( var i=0, touch; i<e.length; i++ ) {
				touch = e[i];
				callback( touch, touch.identifier );
			}
			if( _PinchZoom ) getPinchTouches();
		},
		addTouch = function( touch, id ) { 
			multiTouches.splice( 0,0, { __touch: touch, __id: id } );
		},
		updateTouch = function( touch, id ) { multiTouches[ getTouchByID( id ) ].__touch = touch; },
		removeTouch = function( touch, id ) {
			multiTouches.splice( getTouchByID( id ), 1 );
		},
		getTouchByID = function( id ) {
			for( var i=0; i<multiTouches.length; i++ ) {
				if( multiTouches[i].__id == id ) return i;
			}
			return -1;
		},
		
		newPinch,
		pinching,
		pinchTouches,
		getPinchTouches = function() {
			if( multiTouches.length>1 ) {
				if( pinchTouches.length==0 ) {
					pinchTouches[0] = multiTouches[0].__id;
					pinchTouches[1] = multiTouches[1].__id;				
					// new pinch
					newPinch = TRUE;
				} else {
					if( getTouchByID( pinchTouches[0] )==-1 ) {
						pinchTouches[0] = getNewTouch( pinchTouches[1] );	//	1?
						newPinch = TRUE;
					}
					if( getTouchByID( pinchTouches[1] )==-1 ) {
						pinchTouches[1] = getNewTouch( pinchTouches[0] );	// 0?
						newPinch = TRUE;
					}
				}
			} else {
				pinchTouches = [];
				newPinch = FALSE;
				// handle pinch ending...
				endPinch();
			}
		},
		getNewTouch = function( exl ) {
			for( var i=0; i<multiTouches.length; i++ ) {
				var id = multiTouches[i].__id;
				if( id != exl ) return id;
			}
			return -1;
		},
		
		pBD,		// pinch base distance
		pBZF,		// pinch base zoom Factor (zF)
		pCX, pCY,	// pinch center X/Y (stage coordinates)
		pBX, pBY,	// pinch Base x/y
		pSC,		// pinch scale
		pzX = 0,
		pzY = 0,	// pinch pffset
		pSX, pSY,	// pinch start x/y
		pTF,		// pinch target zF for smoothing
		setPinch = function( e ) {
			var A = getCurrentTouch( e, pinchTouches[0] ),
				B = getCurrentTouch( e, pinchTouches[1] );
				
			pCX = (A.pageX+B.pageX)/2 - __stage.offset().left;
			pCY = (A.pageY+B.pageY)/2 - __stage.offset().top;
			
			return getDist( A.pageX-B.pageX, A.pageY-B.pageY );
		},
		getCurrentTouch = function( e, id ) {
			e = e.originalEvent.touches;
			for( var i=0, touch; i<e.length; i++ ) {
				if( e[i].identifier==id ) {
					return e[i];
				}
			}
		},
		resetPinch = function( e ) {
			pzX = zX*zF;
			pzY = zY*zF;
			zX = zTX = zY = zTY = 0;
						
			pBD = setPinch( e );
			pSC = 1;
			pBZF = zF;
			pBX = pCX-pzX;
			pBY = pCY-pzY;
			
			var BS = bookScale+zoomScale*pBZF;
			pSX = (((pCX+__stage.offset().left)-__stage.offset().left)-_StageWidth/2 )/(BS);	//-bookCOffsX;
			pSY = (((pCY+__stage.offset().top)-__stage.offset().top)-_StageHeight/2 )/(BS);	//-bookCOffsY;
		},
		renewPinch = function( e ) {
			pBD = setPinch( e )/pSC;
		},
		updatePinch = function( e ) {
			pSC = setPinch( e )/pBD;
			pTF = getPinchZF();	// zF ***
		},
		getPinchZF = function() {
			var p100 = bookScale+zoomScale*pBZF,
				nZF  = ((p100*pSC)-bookScale)/zoomScale;
			return nZF;
		},
		endPinch = function() {
			if( pinching ) {
				var lzooming = zooming;			// save the old value
				
				if( pBZF>zF ) zooming = FALSE;	// gombok is idomodjanak
				else zooming = TRUE;
				pinching = FALSE;
				pinchTouches = [];
				
				zX = pzX/zF;
				zY = pzY/zF;
				
				var result = checkZoomPos( zX, zY );
				zTX = result.x;
				zTY = result.y;
				
				pzX = pzY = 0;
				setZoomBtnStat();
				
				if( lzooming != zooming ) {
					PFEventDispatcher( zooming?9:10 , PN );
				}
			}
		},
		setPinchTargetPosition = function( x, y ) {
			pzX = x-pBX + pSX*zoomScale*(pBZF-zF);
			pzY = y-pBY + pSY*zoomScale*(pBZF-zF);
		},
		
		//Multitouch end -------------------------------------------------------------------------
		
		// some helper functions
		setTargetCoords = function( e ) {
			// get book coordinates
			if( touchControl ) {
				e = getTouch( e );
			}
			var BS = bookScale + zoomScale*zF,
				x = (e.pageX-__book.offset().left)/BS- bookWidth/2 -bookCOffsX,//)/bookScale,
				y = (e.pageY-__book.offset().top)/BS- bookHeight/2 -bookCOffsY;//)/bookScale;
			if( !isNaN(x) ) {
				mx = x, my = y;
			}
		},
		getZoomTargetCoords = function( e ) {
			if( touchControl ) e = getTouch( e );
			var x = e.pageX-__stage.offset().left,//)/bookScale,
				y = e.pageY-__stage.offset().top;//)/bookScale;
			return { x:x, y:y };
		},
		touchid,
		mytouch,
		getTouch = function( evt ) {
			// chrome workaround for touch fuck...
			if( evt.originalEvent == __undefined ) return 0;
			var e = evt.originalEvent.changedTouches || [evt];
			if( touchid ) {
				var l = e.length;
				for( var i=0; i<l; i++ ) {
					if( e[i].identifier == touchid ) return e[i];
				}
				e = evt.originalEvent.touches;
				l = e.length;
				for( var i=0; i<l; i++ ) {
					if( e[i].identifier == touchid ) return e[i];
				}
				return mytouch;
			}
			touchid = e[0].identifier;
			mytouch = e[0];
			return mytouch;
		},
		checkPreflipArea = function( mx, my, over ) {
			var output = "",
				pfa = _PreflipArea*(over?1.2:1);
			if( _VerticalMode ) {
				if( my>-leftPageH && my<rightPageH) {
					if( my<-leftPageH+pfa ) {
						if( mx>-leftPageW && mx<-leftPageW+pfa ) output="BL";
						else if( mx<leftPageW && mx>leftPageW-pfa ) output="TL";
					} else if( my>rightPageH-pfa ) {
						if( mx>-rightPageW && mx<-rightPageW+pfa ) output="BR";
						else if( mx<rightPageW && mx>rightPageW-pfa ) output="TR";
					}
				}
			} else {
				if( mx>-leftPageW && mx<rightPageW) {
					if( mx<-leftPageW+pfa ) {
						if( my>-leftPageH && my<-leftPageH+pfa ) output="TL";
						else if( my<leftPageH && my>leftPageH-pfa ) output="BL";
					} else if( mx>rightPageW-pfa ) {
						if( my>-rightPageH && my<-rightPageH+pfa ) output="TR";
						else if( my<rightPageH && my>rightPageH-pfa ) output="BR";
					}
				}
			}
			return output;
		},
		checkControlArea = function( mx, my ) {
			var output = "";
			if( _VerticalMode ) {
				if( my>-leftPageH && my<rightPageH) {
					if( my<-leftPageH+_SecondaryDragArea ) { if( Ma(mx)<leftPageW ) output="OL"; }
					else if( my>rightPageH-_SecondaryDragArea ) { if( Ma(mx)<rightPageW ) output="OR"; }
					else if( Ma(my)<_InsideDragArea ) { output=my<0? "IL": "IR"; }
				}
			} else {
				if( mx>-leftPageW && mx<rightPageW) {
					if( mx<-leftPageW+_SecondaryDragArea ) { if( Ma(my)<leftPageH ) output="OL"; }
					else if( mx>rightPageW-_SecondaryDragArea ) { if( Ma(my)<rightPageH ) output="OR"; }
					else if( Ma(mx)<_InsideDragArea ) { output=mx<0? "IL": "IR"; }
				}
			}
			return output;
		},
		checkPageArea = function( mx, my ) {
			if( _VerticalMode ) {
				var PW = getTheRightSize(my, leftPageW,rightPageW);
				if( my>-leftPageH && my<rightPageH && mx>-PW && mx<PW) { return TRUE; }
			} else {
				var PH = getTheRightSize(mx, leftPageH,rightPageH);
				if( mx>-leftPageW && mx<rightPageW && my>-PH && my<PH) { return TRUE; }
			}
			return FALSE;
		},
		getTheRightSize = function( c, a, b ) {
			return c<0? a: b;	
		},
		canZoom = function( e ) {
			// click zoom over the following DOM element types is disabled
			var target  = $(e.target);
			return !( 	target.is('a') || 
						target.is('input') ||
						target.is('textarea') ||
						target.is('button') ||
						target.hasClass("hotspot")	 );
		},

	//-------------------------------------------------------------------------------------
		// generator/selector functions
		pageDOM = function( pPage ) {
			return div( "pf-page-container pf-"+sides[pPage%2]+"-side"+(pages[pPage].__outer?" pf-outer":"")+(_ID?" "+_ID:""), "page"+pPage,
								div( "pf-page-content", "page"+pPage+"content" ) );
		},
		css = function ( pPosition, pWidth, pHeight, pTop, pLeft, pRight, pOverflow, pTransformOrigin, pZIndex ) {
			return {	"position": pPosition,
						"width": pWidth?pWidth+"px":__undefined,
						"height": pHeight?pHeight+"px":__undefined,
						"top": pTop?pTop+"px":__undefined,
						"left": pLeft?pLeft+"px":__undefined,
						"right": pRight?pRight+"px":__undefined,
						"overflow": pOverflow,
						"transform-origin": pTransformOrigin,
						"z-index": pZIndex	 };
		},
		div = function( pClass, pId, pInnerDiv ) {
			return '<div'+(pId?' id="'+pId+'"':'')+(pClass?' class="'+pClass+'"':'')+'>'+(pInnerDiv?pInnerDiv:'')+'</div>';
		},
		p$ = function ( pPN ) { return $("#page"+pPN); },			// the page container
		c$ = function ( pPN ) { return $("#page"+pPN+"content"); },			// the content block of a page
		e$ = function ( pPN ) { return $("#page"+pPN+"emboss"); },			// the page emboss (center shadow)
		m$ = function ( pPN ) { return $("#page"+pPN+"mask"); },			// the mask of a page
		fsc$ = function ( pPN ) { return $("#page"+pPN+"flipshadowcontainer"); },			// flip shadow container of a page
		fsA$ = function ( pPN ) { return $("#page"+pPN+"flipshadowA"); },			// flip shadow A
		fsB$ = function ( pPN ) { return $("#page"+pPN+"flipshadowB"); },			// flip shadow B
		fts$ = function ( pPN ) { return $("#page"+pPN+"fliptopshadow"); },			// flip top shadow
		hts$ = function ( pPN ) { return $("#page"+pPN+"hardtopshadow"); },			// hard top shadow
		tr = function( pX, pY) {
			return has3d?	"translate3d("+pX+"px,"+pY+"px,0) ":
							"translate("+pX+"px,"+pY+"px) ";
		},
		getDist = function( x, y, signed ) {	// the distance of 2 points
			var l = Mq( x*x+y*y );
			if( signed ) { l *= x>0? -1: 1; }
			return l;
		},
		PD = function( e ) { return e.preventDefault(); },
		
		
	//initialization -------------------------------------------------------------------------------------------------------------------------------
		pageflipInit = function( pConfig, ID ) {
		
			if( __pageflip == __undefined ) {
				_ID = ID;
				__pageflip = this;
				has3d = "WebKitCSSMatrix" in __window || "MozPerspective" in document.body.style;
				/*@cc_on if (/^10/.test(@_jscript_version)) has3d = TRUE; @*/	//IE10 have 3d support
				
				configSetUp( pConfig );
				
				if( _GoogleAnalytics ) statReset(1);
				
				resetMainVariables();
				resetFlippingVariables();
				initPass1();	// all primary variables are set, now initialize pageflip
			} else {							//trying to initialize a new pageflip but another one is still active
				return __pageflip;
			} 				
			return this;	//back to jQuery chain
		},
		initPass1 = function() {
			//initialization with all data available in variables.
			htmlBuffer = __pageflip.html();
			if( _PageDataFile ) { 
				__pageflip.load( _PageDataFile, "GET", initPass2 );
			} else initPass2();
		},
		initPass2 = function() {
			//initialization with loaded content.
			// IE11 fix... fucking ugly... -----------------------------------------------------
			__pageflip.after( "<div id='temppageflip' style='display: none;'></div>" );	
			var __tempPageflip = $("#temppageflip");
			__tempPageflip.html( __pageflip.html() );
			var $pageData = __tempPageflip.children();
			// IE fix end ----------------------------------------------------------------------
			
			if( $pageData.length == 0 ) { return []; };
			
			//pageOrderSetup( $pageData );
			
			// Store Embedded ControlBar html data if any.
			cbhtmlbuffer = findControlBar( $pageData );

			PN = _StartPage = (_StartPage>_MaxPageLimit? _MaxPageLimit: (_StartPage<_MinPageLimit? _MinPageLimit: _StartPage));
			PN -= PN%2;
			if( _RightToLeft ) PN = maxPage-PN-1;
			
			// Create the DOM structure
			var idsuffx = (_ID? " "+_ID:"");
			__pageflip.html( 	div( "pageflip-container"+idsuffx, "pf-stage",
									div( "pf-book-container"+idsuffx, "pf-book",
										div( "pf-book-offset"+idsuffx, "pf-bookoffs", 
											div( "pf-book-content"+idsuffx, "pf-bookc", 
												_DropShadow? div( (_ID? _ID:__undefined), "pf-dropshadow" ): __undefined
											)
										)
									) +
									div( _ID? _ID:__undefined, "pf-controls" )
								)
							).css( "visibility", "visible" );
							
			__stage = $("#pf-stage");
			__book = $("#pf-book");
			__bookoffs = $("#pf-bookoffs");
			__bookc = $("#pf-bookc");
			__dropshadow = _DropShadow? $("#pf-dropshadow"): __undefined;
			__doc = $(document);
			
			__stage.css( { position: "relative", margin: auto, "-webkit-perspective-origin-x": "50%", "-webkit-perspective-origin-y": "50%"} );
			if( _FullScale ) {
				__stage.css( { width: '100%' , height: '100%' } );		
			} else {
				if( _StageWidth == __undefined ) __stage.css( { width: _AutoScale?"100%":bookWidth+(bookWidth>_MobileStageMaxWidth?_MarginLeft+_MarginRight:_MMarginLeft+_MMarginRight) } );
				else __stage.css( { width: _StageWidth } );
				if( _StageHeight == __undefined ) __stage.css( { height: _AutoScale?"100%":bookHeight+(bookWidth>_MobileStageMaxWidth?_MarginTop+_MarginBottom:_MMarginTop+_MMarginBottom) } );
				else __stage.css( { height: _StageHeight } );
				__stage.css( { overflow: "hidden" } );
			}

			setContentSizes();
			setMargins();
			__book.css( { 	position: "relative", top: 0, left: 0 } );
			__bookc.css( { "transform-style": "preserve-3d", opacity: 1 } );
			__bookoffs.css( { position: "absolute", top: 0, left: 0, "z-index": 10 } );
			if( _DropShadow ) __dropshadow.css( {	position: "absolute", top: 0, left: 0,
													"z-index": 1,
													"transform-origin": _VerticalMode?"50% 0%":"0% 50%",
													"opacity": _DropShadowOpacity } );
			
			reSizeStage( TRUE );
			if( _AutoSinglePageMode ) _SinglePageMode = isSinglePageModeBetter();
			if( _SinglePageMode ) fixSinglePageModeConfig();
			pageOrderSetup( $pageData );
			if( !_AutoSinglePageMode ) __tempPageflip.remove();		// part of IE11 fix
			
			// Reset the control bar!
			if( _Thumbnails ) resetThumbnails();
			if( _DisableSelection ) $(__pageflip).css( { "user-select": "none" } );
			
			// Watch the Hash
			onHashChange( __undefined, TRUE );
			lastPN = PN;

			loadControlBar( cbhtmlbuffer );
			initZoomVariables();

			// display the book
			setPages();

			// Reset event handlers
			__bookoffs.bind( pfEvent.__onStart, onStart );
			__stage.bind( pfEvent.__onStart, onStartStage );
			__doc.bind( pfEvent.__onMove, onMove ).bind( pfEvent.__onEnd, onEnd );
			__doc.bind( "keydown", onKey );
			if( touchControl ) {
				resetMultiTouches(); 
				__doc.bind( "touchcancel", onCancel );
				__bookoffs.bind( pfTEvent.__onStart, onStartT );
				__stage.bind( pfTEvent.__onStart, onStartStage )
				__doc.bind( pfTEvent.__onMove, onMoveT ).bind( pfTEvent.__onEnd, onEndT );
			}
			
			if( _HashControl ) $(__window).bind('hashchange', onHashChange );
			
			// Control The size of the book.			
			$(__window).bind( "resize", reSizeStage );
						
			// latest things to set up, then we're finished with initialization...
			if( _FullScale || _AutoScale ) reSizeStage();
			if( _StartAutoFlip ) API.startAutoFlip( FALSE );
			
			// start loop!
			__window.raf = (function(){
				return 	__window.requestAnimationFrame       ||
						__window.webkitRequestAnimationFrame ||
						__window.mozRequestAnimationFrame    ||
						function( callback ) {
						__window.setTimeout( callback, D100/6 );
				};
			})();
			loop = TRUE;
			PFLoop();	// start the main loop!
			
			return __pageflip;
		},
		
		closing,	// is closing in progress? then not start it again...
		closePageflip = function( callBack ) {	
			if( closing || !__pageflip ) return;
			closing = TRUE;
			__bookc.css( "opacity", 0 );
			if( __controlbar ) {
				__controlbar.css( "opacity", 0 );
				__controlbar.unbind();
			}
			if( _Thumbnails ) thumbnailsHide();
			__window.setTimeout( function() {
				loop = FALSE;
			}, 900 );
			__window.setTimeout( function() {
				flipping = FALSE;
				// stop all timeouts etc.
				stopAutoFlip();
				_ID = __undefined;
				__pageflip.empty();
				__pageflip.html( htmlBuffer ).attr( "style", null );
				__pageflip = __undefined;
				
				__doc.unbind( pfEvent.__onMove, onMove ).unbind( pfEvent.__onEnd, onEnd ).unbind('webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange', onFullScreenChange );
				__doc.unbind( "keydown", onKey );
				if( touchControl ) {
					__doc.unbind( "touchcancel", onCancel );
					__doc.unbind( pfTEvent.__onMove, onMoveT ).unbind( pfTEvent.__onEnd, onEndT );
				}
				$(__window).unbind( "resize", reSizeStage );
				__bookoffs.unbind();

				closing = FALSE;
				if( callBack ) callBack();
			} , 1000 );
			if( _GoogleAnalytics ) statSendBookTime();
		},
		
		// ----------------------------------------------------------------------------------------------------------------
		setAutoSinglePageMode = function() {
		},

		reSizeStage = function ( test ) {
			test = test===TRUE;
			if( _AutoSinglePageMode && !test ) {

				reSizeStage( TRUE );
				var OSPM = _SinglePageMode;
				_SinglePageMode = isSinglePageModeBetter();
				if( OSPM != _SinglePageMode ) {
					//console.log( "we need to change...." );

					if( _SinglePageMode ) {
						fixSinglePageModeConfig();
						// fix actual page
						if(PN>0 && !_RightToLeft ) PN=PN*2-2; else PN=PN*2;
					} else {
						defixSinglePageModeConfig();
						// fix actual page
						//PN = Math.floor( PN/4 )*2;
						if(PN>0 && !_RightToLeft ) PN = Math.floor( PN/4 )*2+2; else PN = Math.floor( PN/4 )*2;;
					}
					var __tempPageflip = $("#temppageflip");
					var $pageData = __tempPageflip.children();
					pageOrderSetup( $pageData );

					resetBookVariables();
					//setContentSizes();
					resetPages();
					
					if( _Thumbnails ) resetThumbnails();
				}
			}
			if( _FullScale ) {
				// FullScale resizes the stage to fit the browser Window
				$(__pageflip).css( { width: __window.innerWidth, height: __window.innerHeight } );
			}
			if( _FullScale || _AutoScale ) {
				// here we resize the book, and show/hide content depending on the Stage size
				var ash = _AutoStageHeight
				if( ash && isFullScreen ) {
					// If fullscreen: clear auto stage height flag, as it have to be 100%
					ash = FALSE;
					__stage.css( { height: "100%" } );
				}
				
				_StageWidth = __stage.width();
				_StageHeight = __stage.height();
				
				setMargins();
				
				if( _AutoMaxHeight ) {
					var max = __window.innerHeight-_MaxHeightOffset;
					if( _StageHeight > max ) {
						_StageHeight = max;
						ash = FALSE;					
						__stage.css( { height: max } );
					}
				}
				
				var mw = _StageWidth-__ML-__MR,		//Max width available.
					mh = ash? bookHeight: _StageHeight-__MT-__MB,	//Max height
					ow = _ScaleToSinglePage? _CoverWidth: bookWidth,
					oh = _ScaleToSinglePage? _CoverHeight: bookHeight,
					sx = mw/ow,
					sy = mh/oh;
					
				if( _AutoMaxHeight ) {
					var minsc = sx<sy?sx:sy;
					var MH = bookHeight*minsc+__MT+__MB;
					if( MH>max ) {
						ash = FALSE;
						mh = _StageHeight-__MT-__MB;
						sy = mh/oh;
						__stage.css( { height: max } );
					}
				}
					
				if( _FlexibleContent ) {
					if( _VerticalMode? mh>=_FlexibleContentMinWidth: mw>=_FlexibleContentMinWidth ) {
						_CoverWidth = _PageWidth = Md( mw/HD );
						_CoverHeight = _PageHeight = Md( mh/VD );
						bookScale = 1;
					} else {
						if( _VerticalMode ) {
							_CoverHeight = _PageHeight = _FlexibleContentMinWidth/2;
							bookScale = mh/_FlexibleContentMinWidth;
							_CoverWidth = _PageWidth = mw/bookScale;
						} else {
							_CoverWidth = _PageWidth = _FlexibleContentMinWidth/2;
							bookScale = mw/_FlexibleContentMinWidth;
							_CoverHeight = _PageHeight = mh/bookScale;
						}
					}
					resetBookVariables();
					if( !test ) {
						setContentSizes();
						for( var i=0; i<pages.length; i++ ) {
							pages[i].__renderWidth = _PageWidth;
							pages[i].__renderHeight = _PageHeight;
							pages[i].__maskSize = pages[i].__isCover? maskcw: maskpw;
						}
						resetPages();
					}
				} else {
					bookScale = _FillScale?(sx>sy? sx: sy):(sx<sy? sx: sy);
					if( bookScale>1 && !_UpScale ) bookScale = 1;	// if no Upscale, leave it 1
				}
				bsOX = Md((bookWidth*bookScale-bookWidth)/2 - (bookWidth*bookScale-mw)/2);
				if( ash ) {
					mh = bookHeight*(bookScale+zoomScale*zF);
					__stage.css( { height: mh+(__MT+__MB) } );
					bsOY = Mf((bookHeight*(bookScale+zoomScale*zF)-bookHeight)/2);
				} else {
					bsOY = Mf((bookHeight*bookScale-bookHeight)/2 - (bookHeight*bookScale-mh)/2);
				}
				if( !test ) {
					resetZoomVariables( mw, mh );
					setBookScale();
					
					if( _Thumbnails ) setThumbnailsOffset( TRUE );	//also adjust the thumbnails.
					setControlBarClass( _StageWidth );
				}
			}
		},
		__ML,
		__MR,
		__MT,
		__MB,
		setMargins = function() {
			var Q = _StageWidth<=_MobileStageMaxWidth;
			__ML = Q? _MMarginLeft		: _MarginLeft,
			__MR = Q? _MMarginRight		: _MarginRight,
			__MT = Q? _MMarginTop		: _MarginTop,
			__MB = Q? _MMarginBottom	: _MarginBottom;
			__book.css( { 	"margin-top": __MT,
							"margin-left": __ML,
							"margin-bottom": __MB,
							"margin-right": __MR } );
		},
		setContentSizes = function () {
			//flexible content size adjustment	
			__book.css( { width: bookWidth ,height: bookHeight } );
			__bookoffs.css( { width: bookWidth, height: bookHeight } );
			if( _DropShadow ) __dropshadow.css( { width: bookWidth, height: bookHeight } );
		},
		bsOX,
		bsOY,
		setBookScale = function() {
			var BS = bookScale + zoomScale*zF,
				BX = bsOX + zX*zF + pzX, BY = bsOY + zY*zF + pzY;
			__book.css( { transform: tr( BX,BY ) + "scale("+BS+","+BS+")" } );
		},
		isSinglePageModeBetter = function () {
			var mw = _StageWidth-__ML-__MR,		//Max width available.
				mh = _StageHeight-__MT-__MB,		//Max height
				bsX = mw/bookWidth,
				bsY = mh/bookHeight,
				BS = bsX>bsY?bsY:bsX,
				psX = mw/_CoverWidth,
				psY = mh/_CoverHeight,
				PS = psX>psY?psY:psX;
				
			if( PS>1 ) PS = 1;
			if( BS>1 ) BS = 1;

			var	ESP = _VerticalMode? ((mh-_CoverHeight*PS)/2)/(_CoverHeight*PS): ((mw-_CoverWidth*PS)/2)/(_CoverWidth*PS);
			if( ESP<0 ) ESP = 0;
			if( BS<PS && ESP <= .25 ) return TRUE;
			return FALSE;
		},

		// ----------------------------------------------------------------------------------------------------------------

		// everything zoom
		zooming,			// zooming in progress (once started, automatically grows/shrincks)
		zoomScale,			// the max scale add values (to the displayed bookScale)
		zF,					// the zoom factor (0-1)
		zDX, zDY,			// Size diference between Book, and available space /2!
		zX, zY,				// Actual position
		zTX, zTY,			// Target position
		zBX, zBY,			// Base position
		zSX, zSY,			// Drag Speed
		zPX, zPY,			// Previous position
		zoomDrag,			//
		initZoomVariables = function() {
			zoomScale = zF = zDX = zDY = zX = zY = zTX = zTY = zBX = zBY = zSX = zSY = zPX = zPY = 0;
			zooming = zoomDrag = FALSE;
		},
		resetZoomVariables = function ( mw, mh ) {
			var bw = bookWidth,
				bh = bookHeight;
			if( _SinglePageMode ) {		// fix for 
				if( _VerticalMode ) bh /= 2;
				else bw /= 2;
			}
			zDX = Mf((bw-mw)/2);
			zDY = Mf((bh-mh)/2);
			if( zDX<0 ) zDX=0;
			if( zDY<0 ) zDY=0;
			zoomScale = (bookScale<1? 1-bookScale: 0);
			if( zoomScale==0 ) {
				initZoomVariables();
			} else if( zooming ) {		// stage atmeretezesnel igazitas
				var result = checkZoomPos( zTX, zTY )
				zX = zTX = result.x;
				zY = zTY = result.y;
			}
			setZoomBtnStat();
		},
		zoomIn = function () {
			if( !zooming && bookScale<1 ) {		// if default
				zooming = TRUE;
				setControlBarZ( TRUE );
				setThumbnailsZ( TRUE );
				PFEventDispatcher( 9, PN );
			}
		},
		zoomOut = function () {
			if( zooming && bookScale<1 ) {
				zooming = FALSE;
				PFEventDispatcher( 10, PN );
			}
		},
		zoomOEF = function () {
			if( pinching ) {
				zF += (pTF-zF)/5;
				if( Ma(pTF-zF)<0.01 ) { zF = pTF; }
				setBookScale();
				return;
			}
			if( zooming ) {
				if( zF!=1 ) {			// Zoom In
					zF += (1-zF)/5;
					if( Ma(1-zF)<0.01 ) { zF=1; }
					setBookScale();
					if( _AutoStageHeight ) $(__window).trigger('resize');//reSizeStage();
				} 
			} else {
				if( zF != 0 ) {			// Zoom Out
					zF -= zF/5;
					if( Ma(zF)<0.01 ) {
						zF=0;
						setControlBarZ();
						setThumbnailsZ();
					}
					setBookScale();
					if( _AutoStageHeight ) $(__window).trigger('resize');//reSizeStage();
				}
			}
			setZoomPosition();
		},
		setZoomBtnStat = function() {
			if( __controlbar ) {
				$("#b-zoomout").css("display", zooming?"":"none");
				$("#b-zoomin").css("display", zooming?"none":"");
				enable($("#b-zoomin"), ( zoomScale>0 && _ZoomEnabled ) );
			}
		},
		setZoomPosition = function() {
			if( zTX==zX && zTY==zY ) return;
			if( zoomDrag || pinching ) {
				zSX = zTX-zPX, zSY = zTY-zPY;
				zPX = zTX, zPY = zTY;
			} else if( zSX != 0 || zSY != 0 ) {
				zSX *= .9, zSY *= .9;
				if(Ma(zSX)<1 && Ma(zSY)<1) { zSX = zSY = 0; }
				else {
					var result = checkZoomPos( zTX+zSX, zTY+zSY );
					zTX = result.x, zTY = result.y;
				} 
			}
			zX += ( zTX-zX )/5, zY += ( zTY-zY )/5;
			if( Ma( zTX-zX )+Ma( zTY-zY )<1 ) { zX = zTX, zY = zTY; }
			setBookScale();
		},
		setZoomTargetPosition = function( x, y ) {
			x += zBX;
			y += zBY;
			var result = checkZoomPos( x, y );
			if( x<-zDX ) zBX -= (x+zDX);	// 1.3 - improved zoom dragging
			if( x>zDX )	zBX -= (x-zDX)
			if( y<-zDY ) zBY -= (y+zDY);
			if( y>zDY )	zBY -= (y-zDY)
			zTX = result.x;
			zTY = result.y;
		},
		checkZoomPos = function( x, y ) {
			if(x<-zDX) x=-zDX; else if(x>zDX) x=zDX;
			if(y<-zDY) y=-zDY; else if(y>zDY) y=zDY;
			return { x:x, y:y };
		},
		zoomResetDrag = function( x, y ) {
			zBX = zTX-x, zBY = zTY-y;
			zPX = zTX;
			zPY = zTY;
			zSX = zSY = 0;	
		},
		matchZoomPosition = function( mx, my, tx, ty, nocheck ) {	// 1.3
			// keep pointer position over the book while zooming with click
			var x =  tx - bsOX - bookWidth/2 - mx - __ML - bookCOffsX,
				y =  ty - bsOY - bookHeight/2 - my - __MT - bookCOffsY;
			var result = (nocheck? {x:x,y:y}:checkZoomPos( x, y ));
			zX = zTX = result.x;
			zY = zTY = result.y;
		},
		
		// ----------------------------------------------------------------------------------------------------------------
		
		// everything Hash
		lastHash,	// last stored Hash, to not set again!
		getHash = function() {
			var h = location.hash,
				id, pn;
			if(h=="") h=(_FlipWorld?"#":"#page/")+_StartPage;
			if( h ) {
				var t = h.substr( 1 );
				if( _FlipWorld ) {
					id = false;
					pn = t.split("-")[0];
				} else {
					t = t.split("/");
					var i = 0;
					if( t.length==3 ) id = (t[i++] != _ID);
					if( t[i]=="page" ) pn = t[++i].split("-")[0];
				}
			}
			return { id:id, pn:pn };
		},
		onHashChange = function( e, onlyPN ) {
			var h = location.hash;
			
			//console.log( h );
			
			if( lastHash == h ) return;
			lastHash = h;
			var t = getHash(),
				pn = decodeURI( t.pn );
			if( pn ) {
				if( onlyPN ) { PN= validatePN( (isNaN(pn)? getPNfromName( pn ): getPNfromNumber( pn )) ); }
				else { if( isNaN(pn) ) API.gotoPageName( pn, TRUE ); else API.gotoPageNumber( pn, TRUE ); }
			}
		},
		validatePN = function( pn ) {
			if( pn<_MinPageLimit ) pn=_MinPageLimit;
			else if( pn>_MaxPageLimit) pn=_MaxPageLimit;
			return pn-pn%2;
		},
		lastPN,
		canUpdateHash,
		updateHash = function( pns ) {
			if( lastPN==PN ) return;
			lastPN = PN;
			if(PN==0&&lastHash=="") return;
		
			var t = _FlipWorld? pns: "page/"+pns;
			if( _ID ) t = _ID+"/"+t;
			t = "#"+t;
			if( t!=lastHash ) { location.hash = lastHash = t; }
		},
		
		// control bar function -------------------------------------------------------------------------------------------
		findControlBar = function( $pageData ) {
			for( var i = 0; i<$pageData.length; i++ ) {
				if( $($pageData[i]).attr("class")=="controlbar" ) {
					//cc.html( $($pageData[i]).html() );
					return $($pageData[i]).html();
				}
			}
			return null;
		},
		loadControlBar = function( cbhtml ) {
			var cc = $("#pf-controls");
			
			if( _ControlbarFile ) cc.load( _ControlbarFile, "GET", controlBarLoaded );
			else if ( cbhtml ) {
				cc.html( cbhtml );
				controlBarLoaded();
			} 

		},
		controlBarLoaded = function () {
			__controlbar = $("#pageflip-controls");
			__controlbar.css( "opacity", "1" );
			if( _ID ) __controlbar.addClass( _ID );
			__pagerin = $("#pf-pagerin");
			setControlBarZ();
			resetControlBar();
			if( _ShowCopyright ) {
				var $ct = $("#pf-copyright-text");
				$ct.css( "display", "block" );
				$ct.html( (_FlipWorld? _FWCopyright: _Copyright) );
			}
		},
		setControlBarZ = function( forceTop ) {
			if(__controlbar) __controlbar.css( "z-index", (_ControlbarToFront || forceTop)?12:2 );	
		},
		//textInput,
		resetControlBar = function() {
			var evt = "click";
			if( touchControl ) evt += " "+pfTEvent.__onEnd;

			$("#b-first").bind( evt, function( e ) { PD(e); API.gotoFirstPage( TRUE ); });
			$("#b-prev").bind( evt, function( e ) { PD(e); API.gotoPrevPage( TRUE ); });
			$("#b-next").bind( evt, function( e ) { PD(e); API.gotoNextPage( TRUE ); });
			$("#b-last").bind( evt, function( e ) { PD(e); API.gotoLastPage( TRUE ); });
			
			$("#b-play").bind( evt, function( e ) { PD(e); API.startAutoFlip(); });
			enable( $("#b-play"), _AutoFlipEnabled );
			$("#b-pause").bind( evt, function( e ) { PD(e); API.stopAutoFlip(); });
			
			$("#b-fullscreen").bind( evt, function( e ) { PD(e); API.enterFullScreen(); });
			enable( $("#b-fullscreen"), _FullScreenEnabled );
			$("#b-fullscreenoff").bind( evt, function( e ) { PD(e); API.exitFullScreen(); });

			$("#b-zoomin").bind( evt, function( e ) { PD(e); API.zoomIn(); });
			$("#b-zoomout").bind( evt, function( e ) { PD(e); API.zoomOut(); });
			
			if( _ShareOnFacebook )  $("#b-facebook").bind( evt, function( e ) { PD(e); shareOnFacebook(); });    else $("#b-facebook").css({ display: "none" });
			if( _ShareOnPinterest ) $("#b-pinterest").bind( evt, function( e ) { PD(e); shareOnPinterest(); });  else $("#b-pinterest").css({ display: "none" });

			$("#b-thumbs").bind( evt, function( e ) { PD(e); API.showThumbnails(); });
			enable( $("#b-thumbs"), _Thumbnails );
			$("#b-close").bind( evt, function( e ) { PD(e); API.closePageflip(); });

			__controlbar.bind( pfEvent.__onMove, controlbarOnMove );
			$(".pf-control-bar-button").bind( pfEvent.__onStart, thumbnailEventDisabler ).bind( pfEvent.__onEnd, thumbnailEventDisabler );

			if( touchControl ) {
				__controlbar.bind( pfTEvent.__onMove, controlbarOnMove );
				$(".pf-control-bar-button").bind( pfTEvent.__onStart, thumbnailEventDisabler ).bind( pfTEvent.__onEnd, thumbnailEventDisabler );
			}
			
			isFullScreen = FALSE;
			if( _FullScreenEnabled ) {
				fe = document.getElementById("pf-stage");
				_FullScreenEnabled = (fe.requestFullscreen || fe.mozRequestFullScreen || fe.webkitRequestFullScreen || fe.msRequestFullscreen)? TRUE: FALSE;
			}
			if( _FullScreenEnabled ) {
				__doc.bind('webkitfullscreenchange mozfullscreenchange fullscreenchange msfullscreenchange', onFullScreenChange );
			} else {
				$("#b-fullscreen").css({ display: "none" });
			}
			__pagerin.focus( function(e) { $(this).val("");/* textInput = TRUE;*/ });
			__pagerin.blur( function() { /* textInput = FALSE; */ if($(this).val()=="") setPager(); } );
			$("#pf-pfpager").submit( function() { execPager(); return FALSE; } );
			// prevent selection on page
			setPlayBtnStat();
			setZoomBtnStat();
			setPager();
		},
		setControlBarClass = function ( w ) {
			// this function add a class to the control bar container, depending on the actual stage width. to allow responsible control bar.
			var wclass = "w1000",
				cb = $("#pf-controls");
			if( w<480 ) wclass = "w320";
			else if( w<768 ) wclass = "w480";
			else if( w<1000 ) wclass = "w768";
			cb.attr("class", wclass );
		},
		controlbarOnMove = function( e ) {
			if( !manualPreflip && !manualFlip ) thumbnailEventDisabler( e );	
		},
		execPager = function() {
			var val = __pagerin.val();
			//console.log("Exec "+val);
			if( isNaN(val)? !API.gotoPageName( val, _PagerSkip ): !API.gotoPageNumber( val, _PagerSkip ) ) setPager();
			__pagerin.blur();
		},
		setPager = function() {
			if( !__controlbar ) return;
			var lp = pages[PN], lpname = lp.__PageName, lpnumber = lp.__PageNumber,
				rp = pages[PN+1], rpname = rp.__PageName, rpnumber = rp.__PageNumber,
				lpn = lpname? lpname: ( lpnumber>0? lpnumber: __undefined ),
				rpn = rpname? rpname: ( rpnumber>0? rpnumber: __undefined ),
				n = (lpn>0 && rpn>0 && (!lpname && !rpname))?1:0,
				txts = _PagerText.split("~")[n].split("#"),
				txt = "",
				pns = "";
			if( !lpn ) { lpn=rpn; lpname=rpname; rpn=__undefined; }
			if( !rpn ) { if( lpn ) { txt = lpname? lpn: txts[0]+lpn+txts[1]; pns = lpn; } }
			else { 
				if( lpname && rpname ) { txt = lpn+" - "+rpn; }
				else if( lpname ) { txt = lpn+" - "+txts[0]+rpn+txts[1]; }
				else if( rpname ) { txt = txts[0]+lpn+txts[1]+" - "+rpn; }
				else { txt = txts[0]+lpn+txts[1]+rpn+txts[2]; }
				pns = lpn+"-"+rpn;
			}
			if( _FlipWorld ) {
				var a,b;
				if( _RightToLeft ) {
					a = 0, b = 1;
				} else {
					a = maxPage, b = a-1;
				}
				txt += " / "+(pages[a].__PageNumber==0?pages[b].__PageNumber:pages[a].__PageNumber);
			}
			pns = encodeURI(pns);
			__pagerin.val( txt );
			var a = (PN>(_MinPageLimit+1))&&!autoFlip, b = (PN<(_MaxPageLimit-1))&&!autoFlip;
			enable( $("#b-first"), a );
			enable( $("#b-prev"), _navigationLoop || a );
			enable( $("#b-next"), _navigationLoop || b );
			enable( $("#b-last"), b );
			if( _HashControl ) updateHash( pns );
		},
		enable = function( btn, enable ) {
			if( enable==__undefined ) enable = TRUE;
			if( enable ) btn.removeClass("pf-disabled");
			else disable( btn );
		},
		disable = function( btn ) {
			btn.addClass("pf-disabled");
		},
		
		// thumbnail functions ---------------------------------------------------------------------------------------------
		thumbnailOffsets,
		thumbnailPages,
		thumbnailWidths,
		thumbnailToLoad,
		__thumbs,
		__thumbnails,
		resetThumbnails = function() {
			var t = "pageflip-thumbnails",
				tc = "pf-thumbnail-container";
				
			if( __thumbs ) __thumbs.remove();
				
			__book.after( div( (_ThumbnailsHidden?"pf-hidden":__undefined), t, div( __undefined, tc ) ) );
			__thumbs = $("#"+t);
			if( _ID ) __thumbs.addClass(_ID);
			__thumbnails = $("#"+tc);
			__thumbnails.css("width", maxPage*_ThumbnailWidth*1.5 );
			//Build the thumbnail DOM layout
			thumbnailOffsets = [];
			thumbnailPages = [];
			thumbnailWidths = [];
			thumbnailToLoad = [];
			thumbW = 0;
			thumbTX = 0;
			thumbX = 0;
			var sa = "pf-thumbnail", sb = "-", sc = "page", sd = "spread", se = "button",
				sf = sa+sb+sc, sg = sa+sb+sd, sh = sa+sb+se, si = "#"+sa;
			for( var i=0, a, b, t; i<=maxPage; i+=2 ) {
				a = pages[i].__ThumbnailImage?i:-1, b = pages[i+1].__ThumbnailImage?i+1:-1
				if( a<0 && b>=0 ) { a = b, b = -1; }
				if( a>=0 && b>=0 ) {
					__thumbnails.append( div( sg, __undefined, div( sh, sa+a+se ) + div( sh, sa+b+se ) ) );
					thumbnailButton(a);
					t = $(si+a+se).position().left;
					thumbnailOffsets.push( t + _ThumbnailWidth );
					thumbnailPages.push( i );
					thumbnailWidths.push( _ThumbnailWidth*2 );
					thumbnailButton(b);
					if( _ThumbnailsLazyLoad ) thumbnailToLoad.push( [a,b] );
				} else if( a>=0 ) {
					__thumbnails.append( div( sf, __undefined, div( sh, sa+a+se ) ) );
					thumbnailButton(a);
					t = $(si+a+se).position().left;
					thumbnailOffsets.push( t + _ThumbnailWidth/2 );
					thumbnailPages.push( i );
					thumbnailWidths.push( _ThumbnailWidth );
					if( _ThumbnailsLazyLoad ) thumbnailToLoad.push( [a] );
				}
			}
			if( thumbnailOffsets.length ) {
				thumbW = t + _ThumbnailWidth*(pages[maxPage].__outer?1:2) + __MR;
				__thumbnails.css("width", thumbW + 20 );
				if( _ThumbnailControls ) {
					__thumbs.append( div( "pf-thumbnail-control pf-control-bar-button", "pf-thleft", _SVGLEFT )+div( "pf-thumbnail-control pf-control-bar-button", "pf-thright", _SVGRIGHT ) );
					$(".pf-thumbnail-control").css( "height", _ThumbnailHeight );
					
					$("#pf-thleft") .bind( "mouseenter", thumbnailControlsOnEnter ).bind( "mouseleave", thumbnailControlsOnLeave )
									.bind( pfEvent.__onStart, thumbnailControlsOnPress ).bind( pfEvent.__onEnd, thumbnailControlsOnRelease );
					$("#pf-thright").bind( "mouseenter", thumbnailControlsOnEnter ).bind( "mouseleave", thumbnailControlsOnLeave )
									.bind( pfEvent.__onStart, thumbnailControlsOnPress ).bind( pfEvent.__onEnd, thumbnailControlsOnRelease );
					if( touchControl ) {
						$("#pf-thleft") .bind( pfTEvent.__onStart, thumbnailControlsOnPress ).bind( pfTEvent.__onEnd, thumbnailControlsOnRelease );
						$("#pf-thright").bind( pfTEvent.__onStart, thumbnailControlsOnPress ).bind( pfTEvent.__onEnd, thumbnailControlsOnRelease );
					}
				}
				setThumbnailsZ();
				thumbDrag = FALSE;
				thumbS = 0;								//reset speed ugly...
				__thumbnails.bind( pfEvent.__onStart, thumbnailsOnStart ).bind( pfEvent.__onEnd, thumbnailsOnEnd ).bind( pfEvent.__onMove, thumbnailsOnMove ).css( "height", _ThumbnailHeight+16 );
				__thumbs.bind( "mouseleave", thumbnailsOnOut );
				if( touchControl ) {
					__thumbnails.bind( pfTEvent.__onStart, thumbnailsOnStart ).bind( pfTEvent.__onEnd, thumbnailsOnEnd ).bind( pfTEvent.__onMove, thumbnailsOnMove );
				}
				thumbnailsHidden = _ThumbnailsHidden;	// initaial state from config
				thumbnailsIdle();						// reset idle timer
			} else {
				_Thumbnails = FALSE;
				__thumbs.remove();
			}
		},
		setThumbnailsZ = function( forceTop ) {
			if(_Thumbnails) __thumbs.css("z-index", (_ThumbnailsToFront || forceTop)?11:1 );
		},
		thmoving = FALSE,
		thmoveend = FALSE,
		thspeed = 0,
		thdir = 0,
		
		thumbnailControlsOnEnter = function( e ) {
			if( !thumbDrag ) {
				switch( e.target.id ) {
					case "pf-thleft":	thdir = 1; break;
					case "pf-thright":	thdir = -1; break;
				}
				thmoving = TRUE;
				thmoveend = FALSE;
			}
		},
		thumbnailControlsOnLeave = function( e ) {
			thmoveend = TRUE;
		},
		thumbnailControlsOnPress = function( e ) {
			switch( e.target.id ) {
				case "pf-thleft":	thspeed = 10; break;
				case "pf-thright":	thspeed = -10; break;
			}
			thmoving = TRUE,
			thmoveend = FALSE;
			PD(e);
		},
		thumbnailControlsOnRelease = function( e ) {
			if( !thumbDrag ) {
				thmoveend = TRUE;
				PD(e);
			}
		},
		thumbnailButton = function( i ) {
			var css = { width: _ThumbnailWidth, 
						height: _ThumbnailHeight,
						//"background-size": +_ThumbnailWidth+"px "+_ThumbnailHeight+"px" };
						"background-size": "contain" };
			if( !_ThumbnailsLazyLoad ) {
				css["background-image"] = "url("+pages[i].__ThumbnailImage+")";
				css["background-position"] = "center center";
				css["background-repeat"] = "no-repeat";
				/* now we load: */
				preloadedThumbs[i] = new Image();
				preloadedThumbs[i].src = pages[i].__ThumbnailImage;
			}
			$("#pf-thumbnail"+i+"button").attr("data-page",i).attr("title","Page "+pages[i].__PageNumber).css( css ).bind( "click"+(touchControl? " "+pfTEvent.__onEnd:""), thumbClick );
		},
		thumbClick = function( e ) {
			if( !thumbCantClick && !thumbnailsHidden && !flipping ) {
				var t = $("#"+ e.currentTarget.id ).data().page;
				thumbCantFollow = TRUE;
				API.gotoPage( t, TRUE );
				thumbnailEventDisabler(e);
			}
		},
		thumbnailEventDisabler = function ( e ) {
			if( !manualFlip && !manualPreflip ) {
				PD(e);
				e.stopPropagation();
			}
		},
		thumbnailsOnStart = function( e ) {
			thumbnailsResetDrag( getPosX(e) );
			thumbnailEventDisabler(e);
		},
		thumbnailsOnMove = function (e) {
			if( thumbnailsHidden && _ThumbnailsAutoHide && !manualFlip && !manualPreflip && !zoomDrag) { thumbnailsShow(); }
			else { thumbnailsIdle(); }
			if( thumbCanDrag ) {
				thumbDrag=TRUE;
				thumbCantClick=TRUE;
				thumbTX = checkThumbX( thumbBX + getPosX( e ) );
				__thumbnails.addClass("grabbed");
				$(".pf-thumbnail-control").addClass("disabled");
			}
			thumbnailEventDisabler(e);
		},
		thumbnailsOnEnd = function( e ) {
			thumbnailsDragOver();
			thumbnailEventDisabler(e);
		},
		thumbnailsOnOut = function( e ) {
			thumbnailsDragOver();
			if( !thumbnailsHidden && _ThumbnailsAutoHide ) thumbnailsHide();
		},
		thumbnailsIdle = function( chtime ) {
			if( !_ThumbnailsAutoHide ) return FALSE;
			var now = getNow();
			if( chtime==__undefined) thumbnailsIdleTimer = now;
			else return ( now-thumbnailsIdleTimer )>chtime;
		},
		thumbnailsIdleTimer,
		thumbnailsHidden,
		thumbnailsHide = function() {
			if( thumbX != thumbTX ) return;
			thumbnailsHidden = TRUE;
			__thumbs.addClass("pf-hidden");
		},
		thumbnailsShow = function() {
			thumbnailsIdle();
			thumbnailsHidden = FALSE;
			__thumbs.removeClass("pf-hidden");
		},
		thumbnailOEF = function() {
			if( !thumbnailsHidden || thmoving ) {
				if( thumbnailsIdle( _ThumbnailsAutoHide ) ) thumbnailsHide();
				if( thmoving ) {
					if( !thmoveend ) {
						thspeed += thdir* 2;
						if( Math.abs(thspeed)>10 ) thdir = 0;
					} else {
						thspeed /= 2;
						if( Math.abs( thspeed )<1 ) thspeed = 0, thmoving = false;
					}
					thumbTX = checkThumbX( thumbTX + thspeed );
				}
				if( thumbX != thumbTX ) setThumbnailPosition();
			}
		},
		//thumbnail scrolling, positioning.
		thumbXMin,
		thumbXMax,
		thumbTX,
		thumbX,
		thumbLX,
		thumbW,
		thumbDrag,
		thumbCanDrag,
		thumbBX,
		thumbS,
		thumbPTX,
		thumbCantClick,
		thumbCantFollow,
		setThumbnailsOffset = function( inst ) {
			if( thumbCantFollow ) { thumbCantFollow = FALSE; return; }
			
			var w = Mf( _StageWidth/2 ),	//width()/2 ),
				t,
				l = thumbnailOffsets.length-1,
				f = thumbnailPages.lastIndexOf(PN);
			if( _ThumbnailAlwaysCentered ) {
				thumbXMax = w - thumbnailOffsets[0];
				thumbXMin = w - thumbnailOffsets[l];
			} else {
				thumbXMax = w - thumbnailOffsets[0] - w /*+ __ML*/ + thumbnailWidths[0]/2;
				thumbXMin = w - thumbnailOffsets[l] + w/* - __MR */- thumbnailWidths[l]/2;
				
				if( thumbXMax<thumbXMin ) {
					thumbXMax=thumbXMin= Mf( thumbXMax+thumbXMin/2 );
				}
			}
			if( f<0 ) {
				if ( inst ) t = 0;
				else return;
			} else { t = thumbnailOffsets[f]; }
			thumbTX = checkThumbX( w-t );
			if( !thumbX==__undefined || thumbnailsHidden || inst ) thumbX=thumbTX+0.5; // force render ugly:(
		},
		setThumbnailPosition = function() {
			if( thumbX==thumbTX ) return; 
			if( thumbDrag ) {	
				thumbS = thumbTX-thumbPTX;
				thumbPTX = thumbTX;
			} else if( thumbS!=0 ) {
				thumbS *= .9;
				if(Ma(thumbS)<1) thumbS=0;
				else thumbTX = checkThumbX( thumbTX + thumbS );
			}
			thumbX += (thumbTX-thumbX)/5;
			if( Ma(thumbTX-thumbX)<1 ) { thumbX = thumbTX, thumbS = 0 };
			__thumbnails.css( "transform", tr(thumbX,0) );
			
			if( _ThumbnailsLazyLoad && !(Ma(thumbX-thumbLX)<32) ) {
				thumbLX = thumbX	
				var min = -_ThumbnailWidth-32,
					max = _StageWidth+_ThumbnailWidth+32,
					mt	= thumbnailToLoad.length,
					i = 0;
				while( i<mt && thumbnailOffsets[i]+thumbX<min ) { i++ }
				while( i<mt && thumbnailOffsets[i]+thumbX<max ) {
					if( thumbnailToLoad[i] ) {
						for( var b=0, a; b<thumbnailToLoad[i].length; b++ ) {
							a = thumbnailToLoad[i][b];
							$("#pf-thumbnail"+a+"button").css( {
								"background-image": "url("+pages[a].__ThumbnailImage+")",
								"background-position": "center center",
								"background-repeat": "no-repeat",
								"background-size": "contain"
								 } );
							/* now we load: */
							preloadedThumbs[a] = new Image();
							preloadedThumbs[a].src = pages[a].__ThumbnailImage;
						}
						thumbnailToLoad[i] = null;
					}
					i++;
				}
			}		

		},
		thumbnailsResetDrag = function( x ) {
			thumbCanDrag = TRUE;
			thumbDrag = FALSE;
			thumbCantClick = FALSE;
			thumbPTX = thumbTX;
			thumbBX = thumbTX - x;
		},
		thumbnailsDragOver = function() {
			thumbCantClick = thumbDrag;
			thumbDrag = thumbCanDrag = FALSE;
			__thumbnails.removeClass("grabbed");
			$(".pf-thumbnail-control").removeClass("disabled");
		},
		getPosX = function( e ) {
			if( touchControl ) {
				// chrome workaround for touch fuck...
				if( e.originalEvent == __undefined ) return 0;
				e = e.originalEvent.changedTouches || [e];
				e = e[0];
			}
			return e.pageX;
		},
		checkThumbX = function( x ) {
			x = Mr(x);
			if( x<thumbXMin ) x = thumbXMin;
			else if( x>thumbXMax ) x = thumbXMax;
			return x;
		},
		
		// API handler functions ------------------------------------------------
		// These function controls the book navigation.
		
		gotoPage = function( pn, pSkip, pNoFlipSkip ) {
			var success = FALSE;
			if(pn<_MinPageLimit || pn>_MaxPageLimit ) { return success; }
			if( !flipping && flipQueue.length==0 ) {
				pn -= pn%2;
				if( pn != PN ) {
					success = TRUE;
					if( pNoFlipSkip ) {
						PN = pn;
						setPages();
					} else {
						var dpn = pn-PN;
						if( pSkip ) {
							if( pages[pn].__isHard != pages[PN+1].__isHard && Ma( dpn )>2 ) {
								if( dpn<0 ) {	addFlipToQueue( 0, dpn+2 ); addFlipToQueue( 200, -2 ); }
								else {			addFlipToQueue( 0, dpn-2 ); addFlipToQueue( 200, 2 ); }
							} else if( pages[pn+1].__isHard != pages[PN].__isHard  && Ma( dpn )>2 ) {
								if( dpn<0 ) {	addFlipToQueue( 0, -2 ); addFlipToQueue( 200, dpn+2 ); }
								else {			addFlipToQueue( 0, 2 ); addFlipToQueue( 200, dpn-2 ); }
							} else addFlipToQueue( 0, dpn );
						} else {
							var stepLimit = 999, dir;
							if( dpn<0 ) { dir = -1; dpn *= -1; }
							else { dir = 1; }
							dpn /= 2;
							if( dpn < stepLimit ) stepLimit = dpn;
							var step = 0, lastStep = 0, t = dpn/stepLimit;
							for( var i = 0; i<stepLimit; i++ ) {
								step = Mr( t*(i+1) );
								addFlipToQueue( (i?_FlipDuration/4:0), (step-lastStep)*2*dir );
								lastStep = step;
							}
						}
					}
				}
			}
			return success;
		},
		gotoNumber = function( pNumber, pSkip ) { gotoPage( getPNfromNumber( pNumber ), pSkip ); },
		gotoName = function( pName, pSkip ) { gotoPage( getPNfromName( pName ), pSkip ); },
		gotoLabel = function( pLabel, pSkip ) { gotoPage( getPNfromLabel( pLabel ), pSkip ); },
		gotoFirst = function( btn ) {
			if( canFlip() || _FlipWorld ) {
				gotoPage( (_RightToLeft&&!btn)?_MaxPageLimit:_MinPageLimit, TRUE );
			}
		},
		gotoPrev = function( btn ) {
			if( canFlip() || _FlipWorld ) { 
				if( _navigationLoop && ( !(_RightToLeft&&!btn) ? PN<(_MinPageLimit+1): PN>(_MaxPageLimit-2) ) ) { return gotoLast( btn ); }
				return addAutoFlip( (_RightToLeft&&!btn)?1:-1, (_SinglePageMode&&!_RightToLeft)?1:0, 2 );
			}
		},
		gotoNext = function( btn ) { 
			if( canFlip() || _FlipWorld ) { 
				if( _navigationLoop && ( (_RightToLeft&&!btn) ? PN<(_MinPageLimit+1): PN>(_MaxPageLimit-2) ) ) { return gotoFirst( btn ); }
				return addAutoFlip( (_RightToLeft&&!btn)?-1:1, (_SinglePageMode&&_RightToLeft)?1:0, 2 );
			}
		},
		gotoLast = function( btn ) { if( canFlip() || _FlipWorld ) { gotoPage( (_RightToLeft&&!btn)?_MinPageLimit:_MaxPageLimit, TRUE ); } },
		forceEndFlipping = function() {
			var FDi = flipOrder.length-1,
				FD = flipOrder[ FDi ];
			FD.__success = false;
			removeFlip( FDi );
			manualPreflip = FALSE;
			setPages();
		},
		getPNfromNumber = function( pNumber ) { return pNumber>0?pageNumbers.lastIndexOf( parseInt(pNumber) ): -1; },
		getPNfromName = function( pName) { return pageNames.lastIndexOf( pName.toLowerCase() ); },
		getPNfromLabel = function( pLabel) { return pageLabels.lastIndexOf( pLabel ); },
		pageNumbers,
		pageNames,
		pageLabels,
		resetGotoVariables = function() {
			pageNumbers = [], pageNames = [], pageLabels = [];
			for(var i=0, t; i<=maxPage; i++) {
				pageNumbers[i] = pages[i].__PageNumber;
				pageNames[i]= pages[i].__PageName?String(pages[i].__PageName).toLowerCase(): __undefined;
				pageLabels[i]= pages[i].__PageLabel;
			}
		},
		setData = function( pn, pData ) {
			if( pData ) pages[pn].__Data = pData;
			else return pages[pn].__Data;	
		},
		userNav = function() {
			if( manualPreflip ) forceEndFlipping();
			return !( autoFlip || manualPreflip || manualFlip || pinching );
		},
		pageLimit = function( min, max ) {
			if( min==__undefined) min = 0;
			if( max==__undefined) max = maxPage;
			_MinPageLimit = _RightToLeft? maxPage-max: min;
			_MaxPageLimit = _RightToLeft? maxPage-min: max;
			if( _MinPageLimit<0 ) _MinPageLimit=0;
			if( _MaxPageLimit>maxPage ) _MaxPageLimit=maxPage;
			_MinPageLimit -= _MinPageLimit%2;
			_MaxPageLimit += (1-_MaxPageLimit%2);
		},
		canFlip = function() {
			return !( zooming && !_ZoomFlip );
		},
		// auto flip functions
		autoFlipTimer,
		startAutoFlipTimer = function() {
			var t = pages[PN].__AutoFlipInterval||pages[PN+1].__AutoFlipInterval||_AutoFlipInterval;
			autoFlipTimer = __window.setTimeout( autoFlipLoop, t );
		},
		startAutoFlip = function( inst ) {
			if( inst == __undefined ) inst = TRUE;
			if( !autoFlip ) {
				autoFlip = TRUE;
				if( inst ) autoFlipLoop();
				else startAutoFlipTimer();
			}
		},
		stopAutoFlip = function () {
			if( autoFlip ) {
				autoFlip = FALSE;
				__window.clearTimeout( autoFlipTimer );
				if( !flipping ) setPager();
			}
		},
		autoFlipLoop = function () {
			if( !gotoNext( FALSE ) ) {
				if( _AutoFlipLoop != 0 ) gotoFirst();
				if( _AutoFlipLoop<1 ) { API.stopAutoFlip(); return; }
			} 
			startAutoFlipTimer();
		},
		setPlayBtnStat = function () {
			if( __controlbar ) {
				$("#b-pause").css("display", autoFlip?"":"none");
				$("#b-play").css("display", autoFlip?"none":"");
			}
		},
		isFullScreen,
		fe, fsw, fsh,
		enterFullScreen = function () {
		    if (fe.requestFullscreen) {
		      fe.requestFullscreen();
		    } else if (fe.mozRequestFullScreen) {
		      fe.mozRequestFullScreen();
		    } else if (fe.webkitRequestFullScreen) {
		      fe.webkitRequestFullScreen();
			} else if (fe.msRequestFullscreen) {
		      fe.msRequestFullscreen();
			}
		},
		exitFullScreen = function () {
		    if (document.exitFullscreen) {
		      document.exitFullscreen();
		    } else if (document.mozCancelFullScreen) {
		      document.mozCancelFullScreen();
		    } else if (document.webkitCancelFullScreen) {
		      document.webkitCancelFullScreen();
			} else if (document.msExitFullscreen) {
		      document.msExitFullscreen();
			}
		},
		setFullScreenBtnStat = function () {
			if( _FullScreenEnabled ) {
				$("#b-fullscreen").css("display", isFullScreen?"none":"");
				$("#b-fullscreenoff").css("display", isFullScreen?"":"none");
			}
		},
		onFullScreenChange = function( e ) {
			isFullScreen = !isFullScreen;
			setFullScreenBtnStat();
			reSizeStage();
		},
		// flip Queue
		flipQueue,
		addFlipToQueue = function( pDelay, pPNadd  ) {
			var flipData = {	__delay: pDelay,
								__pnAdd: pPNadd,
								__startTime: __undefined };
			flipQueue.push( flipData );
		},
		tryQueueFlip = function() {
			var now = getNow(), fq = flipQueue[0];
			if( !fq.__startTime ) fq.__startTime = getNow();
			if( fq.__delay<(now-fq.__startTime) ) {
				if( addAutoFlip( (fq.__pnAdd<0)?-1:1, 0, Ma(fq.__pnAdd) ) ) flipQueue.splice(0, 1);
			}
		},
		
		// sharing
		shareOnFacebook = function() {
			share( "https://www.facebook.com/sharer/sharer.php?u="+getShareLink() );
		},
		shareOnPinterest = function() {
			if( !_ShareImageURL ) _ShareImageURL = "http://pageflip-books.com/images/shareimage.jpg";
			share( "http://pinterest.com/pin/create/button/?url="+getShareLink()+"&media="+urlSafe(_ShareImageURL)+(_ShareText?"&description="+urlSafe(_ShareText):"") );
		},
		share = function( url ) { __window.open( url, "_blank" ); },
		urlSafe = function( str ) { return encodeURIComponent( str ); },
		getShareLink = function() { return urlSafe( _ShareLink? _ShareLink: __window.location.href ); },

		//Analytics
		sbooktime,
		spagetimes,
		stype,			// 0 = ga(), 1 = _gaq, 2 = full control analytics	-	__undefined, if no analytics
		sCat,
		sLabel,
		statReset = function( type ) {
			stype = type;
			sLabel = (_ID?_ID:"Untitled");
			sCat = "Pageflip5 - "+sLabel;
			spagetimes = [];
			sbooktime = getNow();
			statSendBookView();
		},
		statSendBookTime = function () {
			var t = getNow()-sbooktime;
			switch( stype ) {
				case 0: break;		
				case 1: _gaq.push(['_trackEvent', sCat, 'Book time', sLabel, t, TRUE ]); break;		
				case 2: break;		
			}
		},
		statResetPageTime = function ( pn ) {
			spagetimes[ pn ] = getNow();
		},
		statSendPageTime = function ( pn ) {
			var t = getNow()-spagetimes[ pn ];
			switch( stype ) {
				case 0: break;		
				case 1: _gaq.push(['_trackEvent', sCat, 'Page '+pn+' Time', sLabel, t, TRUE ]); break;		
				case 2: break;		
			}
		},
		statSendBookView = function () {
			switch( stype ) {
				case 0: break;		
				case 1: _gaq.push(['_trackEvent', sCat, 'Book Opened', sLabel, 0, TRUE ]); break;		
				case 2: break;		
			}
		},
		statSendPageView = function ( pn ) {
			switch( stype ) {
				case 0: break;		
				case 1: _gaq.push(['_trackEvent', sCat, 'Page '+pn+' View', sLabel, 0, TRUE ]); break;		
				case 2: break;		
			}
		},
		
		// EventHandling ----------------------------------------------------------------------------------
		PFEvents = ["onFlip","onFlipEnd","onTop","onTopEnd","onLoad","onUnload","onRemove","onHide","onShow",
					"onZoomIn", "onZoomOut" ],
		PFEventDispatcher = function( PFEvent, PN ) {	// This function is triggered by the PageFlip engine	
			if( eventCallback ) {	// and if set up correctly, calls USERS's event handler functions.
				var t=eventCallback[PFEvents[PFEvent]];
				if( t ) t( PN );
			}
			if( stype ) {
				if( PFEvent == 2 ) {
					statSendPageView( PN );
					statResetPageTime( PN );
				} else if( PFEvent == 3 ) {
					statSendPageTime( PN );
				}
			}
		},
		
		// API -----------------------------------------------------------------------------------
		API = {
			"gotoPage":				function( pn, pSkip ) { if( userNav() ) return gotoPage( pn, pSkip ); },
			"gotoPageNumber":		function( pNumber, pSkip ) { if( userNav() ) return gotoNumber( pNumber, pSkip ); },
			"gotoPageName":			function( pName, pSkip ) { if( userNav() ) return gotoName( pName, pSkip ); },
			"gotoPageLabel":		function( pLabel, pSkip ) { if( userNav() ) return gotoLabel( pLabel, pSkip ); },
			"gotoFirstPage":		function( btn ) { if( userNav() ) gotoFirst( btn ); },
			"gotoPrevPage":			function( btn ) { if( userNav() ) gotoPrev( btn ); },
			"gotoNextPage":			function( btn ) { if( userNav() ) gotoNext( btn ); },
			"gotoLastPage":			function( btn ) { if( userNav() ) gotoLast( btn ); },
			"startAutoFlip":		function( inst ) { if( userNav() && _AutoFlipEnabled ) { startAutoFlip( inst ); setPlayBtnStat(); } },
			"stopAutoFlip":			function() { if( autoFlip ) { stopAutoFlip(); setPlayBtnStat(); } },
			"toggleAutoFlip":		function() { autoFlip? API.stopAutoFlip(): API.startAutoFlip(); },
			"setPFEventCallBack": 	function( fn ) { eventCallback = fn; },
			"closePageflip":		function( callBack ) { closePageflip( callBack ); },
			"getID":				function() { return _ID; },
			"getPN":				function() { return PN; },
			"getPageNumber":		function( pn ) { return pages[pn?pn:PN].__PageNumber; },
			"getPageName":			function( pn ) { return pages[pn?pn:PN].__PageName; },
			"getPageLabel":			function( pn ) { return pages[pn?pn:PN].__PageLabel; },
			"showThumbnails":		function() { if( _Thumbnails ) { thumbnailsHidden? thumbnailsShow(): thumbnailsHide(); } },
			"hideThumbnails":		function() { if( _Thumbnails ) thumbnailsHide(); },
			"zoomIn":				function() { if( _ZoomEnabled ) { zoomIn(); setZoomBtnStat(); } },
			"zoomOut":				function() { zoomOut(); setZoomBtnStat(); },
			"toggleZoom":			function() { zooming? API.zoomOut(): API.zoomIn(); },
			"hotKeys":				function( enabled ) { _HotKeys = enabled; },
			"mouseControl":			function( enabled ) { _MouseControl = enabled; },
			"pageLimit":			function( min, max ) { pageLimit( min, max ); },
			"data":					function( pn, pData ) { return setData( pn, pData ); },
			"enterFullScreen":		function() { return enterFullScreen(); },
			"exitFullScreen":		function() { return exitFullScreen(); },
			"addPage":				function( pContent, pn, pRenumber ) { addNewPages( $( pContent ), pn, pRenumber ); },
			"reloadPage":			function( pn ) {},
			"removePage":			function( pPN, pNumberOfPages, pRenumber ) { removePages( pPN, pNumberOfPages, pRenumber ); },
			"changeConfig":			function( pConfigOption, pValue ) { return 0; }
		},
		pageflip = function( pCmd, args ) {
			if( pCmd==__undefined ) return API;
			return __pageflip? API[pCmd]( args ): [];
		}

	$.extend( $.fn, { "pageflipInit": pageflipInit, "pageflip": pageflip } );	// Add functions to jQuery	
})(jQuery, this);