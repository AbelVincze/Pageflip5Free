## Pageflip5 Version History

V1.2 Release Date: 2014/07/31

Fixed: outer page behind dropshadow!
added: ClickZoom CO (not compatible with onpage link yed - still undocumented)
fixed transparent page visibility in the back ground
fixed event triggering, where onShow was called before onHide
added: DisableSelection option
fixed: zoom positioning in AutoStageHeight mode enabled

key.js: added download button, and sample text.

V1.3 Release Date: 2014/09/25

fixed: deep linking
added: zoom resizes in AutoStageHeight
fixed IE Fullscreen
fixed undefined controlbar element (if no controlbar specified and closing pageflip)
fixed multiple gotoPage() call which caused chaotic results (wrong destination page)
fixed failed 2nd closePageflip() call (results JS error message)
fixed multibook selection fail when clicking on different books quickly
fixed zoom drag speed/precision
fixed embedded control bar missing on IE issue
added addPage/removePage APIs to dynamically control the book contents
fixed button/text input/link/hotspot click and zoom click conflict
added matchZoomPosition on click zoom.
added Pinch-zoom on multitouch devices
improved zoom dragging
added "online" as domain wildcard
added SinglePageMode (fixed navigation, zoom, page order)
added thumbnail lazy load (as default)
fixed weird multi touch flipping... 

V1.3.1 Release Date: 2015/01/04

fixed pager targeted last page in SinglePageMode
added NavigationLoop to loop the book pages with prev/next buttons.
removed console.log
added shareimageURL fix, no need to specify absolute URL, just relative to the index.html (for PDF converter)

V1.4

added AutoMaxHeight. (2015/02/10)
added ZoomFlip. (2015/05/06)
fixed page left on the stage while hardflip and invisible...
fixed Start Page bug, if page1 was not the cover
fixed last page click zoom didn't worked.
fixed zoom event dispatch for pinch zoom.

(15/08/06)
fixed CSS dependencies

(15/08/16)
fixed RTL starting page issue
added getPageLabel( pn )
added getPageName( pn )
modified getPageNumber( pn )

(16/03/31)
fixed PageName issue when the name is a number...

V1.45

	planned fixes:
	- touchscreen + mouse control issue
	- starting page issue, if first page have a name, and page 1 is on a second spread.
	
(16/08/10)
added auto-single-page mode.
fixed flipping with btn while hover corner!!!
fixed a strange pinch zoom issue in getPinchTouches() function
fixed issue when flipping from first to last (Hardcover/largecover) then flipping back to a soft page when page number is odd.
fixed hotkey issues when editing some input text on the same page
fixed issue when control bar buttons were not working while flipping or in vertical mode

v1.46

fixed hotspot click on click sensitive areas
fixed hardcover/page animation on MS Edge

added Preview option for flipworld document

(16/11/08)
v1.47

fixed IE 11 html page content issue (AutoSinglePageMode caused it, along with an IE11 defect)

(16/11/29)
v1.48

doubleclick zoom

(17/02/19)
v1.5
	- fixed touchscreen + mouse control issue

(17/10/23)
v1.55	
	- fixed image preloading issues.
	- form fields not working... _> add pf-activecontent class
	- added (disableBackgroundEvents) to disable touches on the BG (fix zoom and scrolling issues)

	tobe fixed:

	to be added:
	handle orientation change if singlepagemode is enabled
	IE compatibility mode failure?
	ControlbarToFront
	
	ThumbnailControls
	MobileStageMaxWidth
	MMargin
	MMarginTop
	MMarginBottom
	MMarginLeft
	MMarginRight

v1.6
	- Added sharing icon on/off option (default off from now)
	
v1.7
	- added workaround for chrom touch issues.... 18/03/08

v1.7.1
	- pinch zoom added (again after long time...)

v1.8 Release date: 24/10/23
	- it is now free, with exposed source codes
	- removed key checking
	- removed twitter and google shares (obsolate)