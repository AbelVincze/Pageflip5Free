<?php
	session_start();

	if( !$_SESSION["initialized"] ) {
		$_SESSION["initialized"] = 1;
	}

	$userdir = "temp";
	$_SESSION["userDirectory"] = $userdir;
	if (!file_exists( $userdir )) { mkdir( $userdir, 0777, true ); }
	else {
		deleteDirContent( $userdir );
	}
	if (!file_exists( $userdir."/log" )) { mkdir( $userdir."/log" , 0777, true ); }

	function deleteDirContent( $userdir ) {
		$files = glob( "$userdir/*" ); // get all file names
		foreach( $files as $file ){ // iterate files
			if( is_file( $file ) ) unlink($file); // delete file
		}
	}

?>
<!DOCTYPE html>
<html>
	<head>
		<script>licensed = true;</script>
<?php include_once("includes/converterheader.php"); ?>
		<title>Pageflip5 - Online PDF to Pageflip Converter 3</title>
	</head>
	<body>

		<div id="main-container">
			<div id="website-content" class="website-content">
				<div id="title"><a href="index.php"><img src="images/pdfconverter_header.svg" alt="Pageflip5 pdf converter"></a></div>
				<div class="content">

					<div id="login" class="faded">
						<h2>Pageflip5 online PDF Converter 3</h2>
						<p>An easy way to create Pageflip5 books from your PDF document. Just upload Your PDF file, select a preset, then download the book, which is ready to upload on your own website: <a href="https://www.youtube.com/watch?v=p-AtMzet25U" target="_blank">Check this YouTube Video</a></p>
						<p>This is version 2 with a new converter engine and a custom PDF parser which results better performance and spread recognition. Rendering of the images are now done by a multi threaded background process, resulting 2 to 6 time faster conversion than the previous version.</p>
						<p><strong>PDF to Pageflip5 converter is free</strong> to use for all Pageflip5 License owners.</p>
						<p>Password protected or Encrypted PDF files are NOT supported.<br />
						Any kind of feedback are welcome: <a href="mailto:support@pageflip-books.com">support@pageflip-books.com</a></p>
	
						<form action="process_converter.php" method="post" name="validator" id="validator" autocomplete="off">
							<p><strong>Please enter a valid License-Key</strong> which You can get by <a href="http://pageflip-books.com/#licenses" target="_blank">buying a Pageflip5 License</a> or by <a href="http://pageflip-books.com/trial.php" target="_blank">requesting a Trial License-Key</a>!</p>
							<div>
								<label for="licensekey" class="label inputlabel">Your License-Key:</label>
								<div class="buttons"><input name="licensekey" type="text" id="licensekey" value="" autofocus></div>
							</div>
							<!--<div>
								<input type="submit" name="submit" class="submit" id="licsubmit" value="Start PDF Converter">
							</div>-->
							<div class="bigbutton left">
								<ul class="actionbuttons">
									<li id="loginbutton" onclick="process_license();">Start Converter</li>
								</ul>
							</div>
						</form>
					</div>

					<!--
						
						Settings for Custom Converter:
						
						- DB Server / UN / PASS / DBTable
						- Copyright Text
						
						- alert e-mail address (for job done messaging)
						
					-->
					<div id="processorder" class="faded">
						<ul class="processes">
							<li id="pupload" onclick="switchto(1);">1. Upload</li>
							<li id="psettings" onclick="switchto(2);">2. Settings</li>
							<li id="pdownload" onclick="switchto(3);">3. Generate & Download</li>
						</ul>
						<ul class="functions">
							<!--<li id="pnext" onclick="process(4);">Next</li>-->
							<li id="ppreview" class="disabled"><a onclick="preview();">Preview</a></li>
						</ul>
					</div>
					
					<div id="pdfupload" class="faded">
						<form id="uploadform" method="post" action="process_converter_licensed.php" enctype="multipart/form-data">
							<h4>Upload Your PDF file</h4>
							<p>Choose Your PDF file to upload, the maximum allowed file size is 128MB.<br>
							Reference page size is based on the first page's dimensions. CMYK pdf, rotated pages, spreads and links are automatically recognized and processed.<br>
							Password protected or Encrypted PDF files are NOT supported.</p>
							<div class="custom-upload">
								<!--<label for="userfile" class="label">Your PDF file:</label>-->
								<input type="file" accept="application/pdf" name="userfile" id="userfile" />
								<div class="fakeupload">
									<input disabled="disabled" />
									<div class="bigbutton">
										<ul class="actionbuttons">
											<li id="uploadbutton">Browse files</li>
										</ul>
									</div>
								</div>
							</div>
							<!--<div>
								<input type="submit" class="submit" id="uploadpdf" name="uploadpdf" value="Upload PDF">
							</div>-->
							<div id="uplprogress" class="faded">
								<div class="progressbar">
									<div class="bar"></div>
									<div class="percent"></div>
								</div>
								<div id="uploadmsg" class="progressmsg"></div>
							</div>
							
							<div class="block" id="pdfurlblock">
								<p>OR copy & Paste the URL of the PDF file you want to convert:</p>
								<input name="onlinefile" type="text" id="onlinefile" value="">
									<div class="bigbutton">
										<ul class="actionbuttons">
											<li id="pdfurlbutton" onclick="get_pdf_button();">Get PDF from URL</li>
										</ul>
									</div>
							</div>
						</form>
					</div>
					
					<div id="pdfsettings" class="faded">

						<!-- SETTINGS -->
						<div id="settingselector" class="tabselector faded">
							<ul class="settings">
								<li id="sinfo" onclick="settingselect(5);">Import</li>
								<li id="sexport" onclick="settingselect(3);">Export</li>
								<li id="sbook" class="adv" onclick="settingselect(0);">Book</li>
								<li id="scontrols" class="adv" onclick="settingselect(1);">Controls</li>
								<li id="ssharing" class="adv" onclick="settingselect(2);">Sharing</li>
								<li id="scolours" onclick="settingselect(4);">Colours</li>
							</ul>
							<ul class="options">
								<li id="oeasy" onclick="settingselect(6);">Easy Setup</li>
								<li id="oadvanced" onclick="settingselect(7);">Advanced Options</li>
							</ul>
						</div>
						<div id="settingspanels">
							
							
							<div id="settings-info" class="quickfaded settingspanel">
								<form>
									<div class="block">
										<div>
											<div id="pdfpreview">&nbsp;</div>
											<div id="uploadresult"></div>
											<div class="clearer"></div>
										</div>
									</div>
									<!--
									
									Spread handling:	
										Auto Detect						Auto
										Don't split spreads				Off
										Split all pages horizontally	Horizontal
										Split all pages vertically		Vertical
									
									Rotated pages:
										Auto Detect						Auto
										Don't rotate					Off
										Rotate all pages				All
										
									Different page size:
										Fit to page						Fit
										Fill page						Fill
										Don't Scale						Noscale
										
									-->
									<div class="blockul advancedexport">
										<label for="spreadhandling" class="label" title="">Spread handling:</label>
										<div class="buttons">
											<input name="spreadhandling" class="previewsinvalidator" type="radio" id="spreadhandling-auto" value="Auto" checked="checked">Auto split<br>
											<input name="spreadhandling" class="previewsinvalidator" type="radio" id="spreadhandling-off" value="Off" >Don't split spreads<br>
											<input name="spreadhandling" class="previewsinvalidator" type="radio" id="spreadhandling-allh" value="Horizontal" >Split all pages horizontally<br>
											<input name="spreadhandling" class="previewsinvalidator" type="radio" id="spreadhandling-allv" value="Vertical" >Split all pages vertically<br>
										</div>
									</div>
									<div class="blockul advancedexport">
										<label for="rotatehandling" class="label" title="">Rotated pages:</label>
										<div class="buttons">
											<input name="rotatehandling" class="previewsinvalidator" type="radio" id="rotatehandling-auto" value="Auto" checked="checked">Auto rotate<br>
											<input name="rotatehandling" class="previewsinvalidator" type="radio" id="rotatehandling-off" value="Off" >Don't rotate<br>
											<input name="rotatehandling" class="previewsinvalidator" type="radio" id="rotatehandling-all" value="All" >Rotate all pages<br>
										</div>
									</div>
									<div class="block advancedexport">
										<label for="pagesizehandling" class="label" title="">Different page size:</label>
										<div class="buttons">
											<input name="pagesizehandling" class="previewsinvalidator" type="radio" id="pagesizehandling-fit" value="Fit" checked="checked">Fit to page<br>
											<input name="pagesizehandling" class="previewsinvalidator" type="radio" id="pagesizehandling-fill" value="Fill" >Fill page<br>
											<input name="pagesizehandling" class="previewsinvalidator" type="radio" id="pagesizehandling-crop" value="Noscale">Don't scale<br>
										</div>
									</div>
									<div class="block advancedexport notes">
										<p>Changing any of the above options will automatically regenerate the Page Order preview</p>
									</div>
									
									<div id="genprogress" class="faded">
										<div class="progressbar">
											<div class="bar"></div>
											<div class="percent"></div>
										</div>
										<div id="genmsg" class="progressmsg"></div>
									</div>
								</form>
							</div>
							<div id="settings-book" class="quickfaded settingspanel">
								<form class="advancedsettings">
									<div class="smallblock">
										<label for="bookname" class="label inputlabel">Book name:</label>
										<input name="bookname" type="text" id="bookname" value="My Book" class="longin">
									</div>
									<div class="blockul">
										<label for="bookid" class="label inputlabel">Book ID:</label>
										<input name="bookid" type="text" id="bookid" value="mybook" class="longin">
									</div>
									<div class="block">
										<label for="flipdir" class="label">Flipping direction:</label>
										<div class="buttons">
											<input name="flipdir" type="radio" id="flipdir-ltr" value="ltr" checked="checked">Left to right<br>
											<input name="flipdir" type="radio" id="flipdir-rtl" value="rtl">Right to left<br>
											<input name="flipdir" type="radio" id="flipdir-vert" value="vertical">Vertical
										</div>
									</div>
									<div class="blockul">
										<label for="fliptype" class="label">Flipping type:</label>
										<div class="buttons">
											<input name="fliptype" type="checkbox" id="fliptype-hcover" value="Hard Cover" checked="checked">Hard cover<br>
											<input name="fliptype" type="checkbox" id="fliptype-hpages" value="Hard Pages">Hard pages
										</div>
									</div>
									<div class="block">
										<label for="bookextraopts" class="label">Extra options:</label>
										<div class="buttons">
											<input name="bookextraopts" type="checkbox" id="bookextraopts-singlepagemode" value="Single Page Mode">Single Page Mode<br>
											<input name="bookextraopts" type="checkbox" id="bookextraopts-lcover" value="Large Cover" disabled="disabled" class="renderinvalidator">Large cover<br>
											<input name="bookextraopts" type="checkbox" id="bookextraopts-centersinglepage" value="Center Single Page" checked="checked">Center single page<br>
											<input name="bookextraopts" type="checkbox" id="bookextraopts-rcorners" value="Rounder Corners">Rounded corners<br>
											<input name="bookextraopts" type="checkbox" id="bookextraopts-alwaysopened" value="Always opened">Always opened
										</div>
									</div>
								</form>
							</div>
							<div id="settings-controls" class="quickfaded settingspanel">
								<form class="advancedsettings">
									<div class="blockul">
										<label for="controlbar" class="label">Controlbar:</label>
										<div class="buttons">
											<input name="controlbar" type="checkbox" id="controlbar-enabled" value="Enabled" checked="checked">Enabled<br>
											<input name="controlbar" type="checkbox" id="controlbar-ontop" value="On Top of the Book">On top of the book<br>
										</div>
									</div>
									<div class="blockul">
										<label for="flipcontrol" class="label">Flip control:</label>
										<div class="buttons">
											<input name="flipcontrol" type="checkbox" id="flipcontrol-mouse" value="Mouse Control" checked="checked">Mouse & Touch control<br>
											<input name="flipcontrol" type="checkbox" id="flipcontrol-buttons" value="Controlbar Buttons" checked="checked">Controlbar buttons<br>
											<input name="flipcontrol" type="checkbox" id="flipcontrol-input" value="Page Number Input" checked="checked">Page number input-field<br>
											<input name="flipcontrol" type="checkbox" id="flipcontrol-key" value="Hot Keys" checked="checked">Hot keys
										</div>
									</div>
									<div class="blockul">
										<label for="thumbnails" class="label">Thumbnails:</label>
										<div class="buttons">
											<input name="thumbnails" type="checkbox" id="thumbnails-enabled" value="Enabled" checked="checked" >Enabled<br>
											<input name="thumbnails" type="checkbox" id="thumbnails-autohide" value="Auto hide" checked="checked">Auto hide<br>
											<input name="thumbnails" type="checkbox" id="thumbnails-ontop" value="On Top of the Book" checked="checked">On top of the book
										</div>
									</div>
									<div class="block">
										<label for="controlbarextra" class="label">Controlbar extras:</label>
										<div class="buttons">
											<input name="controlbarextra" type="checkbox" id="controlbarextra-fullscreen" value="Fullscreen enabled" checked="checked">Fullscreen enabled<br>
											<input name="controlbarextra" type="checkbox" id="controlbarextra-autoflip" value="Auto flip enabled" checked="checked">Auto flip enabled<br>
											<input name="controlbarextra" type="checkbox" id="controlbarextra-startautoflip" value="Rounder Corners">Start auto flipping as the book is loaded
										</div>
									</div>
								</form>
							</div>
							<div id="settings-sharing" class="quickfaded settingspanel">
								<form class="advancedsettings">
									<div class="blockul">
										<label for="shprinterest" class="label">Enable share button:</label>
										<div class="buttons">
											<input name="sharing" type="checkbox" id="sharing-printerest" value="Enabled" checked="checked">Printerest<br>
											<input name="sharing" type="checkbox" id="sharing-facebook" value="Enabled" checked="checked">Facebook<br>
											<input name="sharing" type="checkbox" id="sharing-twitter" value="Enabled" checked="checked">Twitter<br>
											<input name="sharing" type="checkbox" id="sharing-googleplus" value="Enabled" checked="checked">Google+
										</div>
									</div>
									<div class="smallblock">
										<label for="sharemsg" class="label inputlabel">Share with message:</label>
										<textarea name="sharemsg" type="text" id="sharemsg" class="longin">PDF to flipbook converter http://pageflip-books.com</textarea>
									</div>
									<div class="smallblock">
										<label for="sharevia" class="label inputlabel">Twitter via:</label>
											<input name="sharevia" type="text" id="sharevia" value="@MaccPageFlip">
									</div>
									<div class="block">
										<label for="shareimage" class="label">Printerest image:</label>
										<div class="buttons" style="margin-top: 0;">
											<select name="shareimage" id="pageselector"></select><br>
											<p class="helper">This image link will not work in preview mode.</p>
										</div>										
										
									</div>
								</form>
							</div>
							<div id="settings-export" class="quickfaded settingspanel">
								<form>
									<div class="smallblock">
										<label for="resolution" class="label" title="Page size presets - Optimized for screen resolution">Book resolution:</label>
										<select name="resolution" class="renderinvalidator">
											<option value="0" selected="selected">Small - 1024x768</option>
											<option value="1">Medium - 1440x900</option>
											<option value="2">Large - 1920x1080</option>
										</select>
									</div>
									<div class="blockul">
										<label for="quality" class="label" title="Vector object antialiasing">Conversion quality:</label>
										<select name="quality" class="renderinvalidator">
											<option value="0">Low - no supersampling</option>
											<option value="1" selected="selected">Medium - 4x supersampling</option>
											<option value="2">High - 9x supersampling</option>
											<option value="3">Very high - 16x supersampling</option>
										</select>
									</div>
									<div class="blockul advancedexport">
										<label for="jpgquality" class="label" title="JPG compression quality">JPG quality:</label>
										<select name="jpgquality" class="renderinvalidator">
											<option value="10">Poor</option>
											<option value="25">Low</option>
											<option value="50">Medium</option>
											<option value="75">Good</option>
											<option value="90" selected="selected">High</option>
											<option value="100">Best</option>
										</select>
									</div>
									<div class="block advancedexport">
										<label for="htmlstorage" class="label" title="HTML contents, like page definitions and the controlbar, can be embedded in the main index.html or saved as external files">HTML content storage:</label>
										<div class="buttons">
											<input name="htmlstorage" type="radio" id="htmlstorage-offline" value="Embedded" checked="checked">Embedded (Offline compatible)<br>
											<input name="htmlstorage" type="radio" id="htmlstorage-external" value="External" >External
										</div>
									</div>
									<div class="blockul advancedexport">
										<label for="datastorage" class="label" title="Location of the external files, like page files or HTML contents">External data storage:</label>
										<div class="buttons">
											<input name="datastorage" type="radio" id="datastorage-samefolder" value="same">Root folder<br>
											<input name="datastorage" type="radio" id="datastorage-subfolder" value="subfolder" checked="checked">Subfolder (pageflipdata/)<br>
											<input name="datastorage" type="radio" id="datastorage-subfolder" value="custom">Custom subfolder:<br>
											<input name="datastoragein" type="text" id="datastoragefolder" value="" disabled="disabled">
										</div>
									</div>
									<div class="smallblock">
										<label for="usedkey" class="label inputlabel" title="The domain on which Pageflip will be used. It can be offline, or online on a specified domain">Use Key:</label>
										<div class="buttons">
											<input name="usedkey" type="radio" id="usedkey-default" value="Offline" checked="checked">Default<br>
											<input name="usedkey" type="radio" id="usedkey-custom" value="Online">Custom:<br>
											<input name="usedkey" type="text" id="usedkey" class="longin" disabled="disabled"><br>
										</div>
									</div>
									<div class="smallblock">
										<label class="important"><img src="images/important.svg" width="53" height="46"></label>
										<div class="buttons">
											<p class="helper">Important: The Key generated with the <a href="http://pageflip-books.com/keygen.php" target="_blank">online Key Generator</a> is needed to run Pageflip 5. The Default Key, and the Key used for previewing are set in the settings.php file. Feel free to generate a custom Key, and make sure You use the same Copyright text as it was set in the Key Generator along with the generated Key.</p>
										</div>
									</div>
									<div class="smallblock advancedexport">
										<label for="copyright" class="label inputlabel">Copyright text:</label>
										<div class="buttons">
											<textarea name="copyright" type="text" id="copyright" class="longin" disabled="disabled">©2015 pageflip-books.com</textarea><br>
											<input name="copyrightdisplay" type="checkbox" id="copyrightdisplay" value="Enabled">Display copyright text
										</div>
									</div>
								</form>
							</div>
							<div id="settings-colours" class="quickfaded settingspanel">
								<form >
									<div class="smallblock">
										<label for="backgroundcolor" class="label inputlabel">Background:</label>
										<input name="backgroundcolor" type="text" id="backgroundcolor" class="shortin" value="#FFFFFF">
										<div class="inlinebuttons"><input name="backgroundenabled" type="checkbox" id="backgroundenabled" checked="checked">Enable</div>
									</div>
									<div class="blockul">
										<label for="pagebackgroundcolor" class="label inputlabel">Default page background:</label>
										<input name="pagebackgroundcolor" type="text" id="pagebackgroundcolor" class="shortin" value="#FFFFFF">
									</div>
									<div class="smallblock">
										<label for="controlscolor" class="label inputlabel">Controls:</label>
										<input name="controlscolor" type="text" id="controlscolor" class="shortin" value="#888888">
									</div>
									<div class="smallblock">
										<label for="controlshoveredcolor" class="label inputlabel">Controls hovered:</label>
										<input name="controlshoveredcolor" type="text" id="controlshoveredcolor" class="shortin" value="#FFAA00">
									</div>
									<div class="blockul">
										<label for="controlbarbackcolor" class="label inputlabel">Controlbar background:</label>
										<input name="controlbarbackcolor" type="text" id="controlbarbackcolor" class="shortin" value="#FFFFFF">
										<div class="inlinebuttons"><input name="controlbarbackenabled" type="checkbox" id="controlbarbackenabled" checked="checked">Enable</div>
									</div>
									<div class="smallblock">
										<label for="dropshadow" class="label">Dropshadows:</label>
										<select name="dropshadow">
											<option value="0">Very light</option>
											<option value="1">Light</option>
											<option value="2" selected="selected">Medium</option>
											<option value="3">Strong</option>
											<option value="4">Very strong</option>
										</select>
										<div class="inlinebuttons alt"><input name="dropshadowenabled" type="checkbox" id="dropshadowenabled" checked="checked">Enable</div>
									</div>
									<div class="smallblock">
										<label for="pageshadow" class="label">Page shadows:</label>
										<select name="pageshadow">
											<option value="0">Very light</option>
											<option value="1">Light</option>
											<option value="2" selected="selected">Medium</option>
											<option value="3">Strong</option>
											<option value="4">Very strong</option>
										</select>
										<div class="inlinebuttons alt"><input name="pageshadowenabled" type="checkbox" id="pageshadowenabled" checked="checked">Enable</div>
									</div>
								</form>
							</div>
						</div>

						<div class="bigbutton">
							<ul class="actionbuttons">
								<li id="generatebutton" onclick="generate();">Generate & Download</li>
							</ul>
						</div>

						<div id="pageselector" class="tabselector faded">
							<ul class="settings">
								<li id="spageorder" class="selected" onclick="pageoptionselect(0);">Page Order</li>
								<!--<li id="spagelayout" onclick="pageoptionselect(1);">Layout</li>-->
								<!--<li id="sdeleted" onclick="pageoptionselect(2);">Removed Pages</li>-->
							</ul>
							<ul class="options">
								<!--<li id="oreset" onclick="pageoptionselect(3);">Reset</li>-->
								<!--<li id="oshow" onclick="pageoptionselect(3);">Show</li>
								<li id="ohide" onclick="pageoptionselect(4);">Hide</li>-->
							</ul>
						</div>
						<div style="text-align: center;">
							<div id="pageorderlist" class="list"></div>
						</div>
						
					</div>
					
					<div id="pdfdownload" class="faded">
						<div id="downloadcentered">
							<div id="higenprogress" class="faded">
								<h4>Generating Page files</h4>
								<p>Generating full resolution page files, and thumbnail files.</p>
								<p>When done, you will be able to access the full resolution Preview or Download the Ready-to-Use pageflip5 package. If you need, you can go back to change the settings.<br><br></p>
									<div class="progressbar">
										<div class="bar"></div>
										<div class="percent"></div>
									</div>
									<div id="higenmsg" class="progressmsg"></div>
							</div>
						
							<div id="downloadcontent" class="faded">
								<h4>Download Your Pageflip Document</h4>
								<p>Your Pageflip5 document is ready to Download.</p>
								<div class="offlineonly"> 
									<p>Please note, that your document is set for <strong>Offline-only</strong> usage. To change it, go back to the Export Settings, select Online, and set the domain on which pageflip will be used.</p>
									<p class="externalstorage">You've set External HTML content storage option, which results the pageflip not to load offline on some browsers, like Chrome and the latest versions of Safari.</p>
								</div>
								<div class="bigbutton" onclick="download();">
									<ul class="actionbuttons">
										<li id="downloadbutton">Download</li>
									</ul>
								</div>
								<form action="process_converter_licensed.php" method="post" id="downloadsubmit" name="downloadsubmit">
									<div>
										<input name="func" type="hidden" id="func" value="7">
										<input type="submit" name="downloadsubmit" value="Download">
									</div>
								</form>
							</div>
							<!--<div id="pagefiles"></div>-->
						</div>
					</div>
					
					<div id="exitpanel" class="faded">
						<div id="exitbutton" onclick="exitconverter()">Exit and delete Your files from the server</div>
						<p>To protect your privacy please Exit after you finished working with the converter to instantly remove the uploaded pdf and the converted images files from the server. If you don't exit, the files will be deleted at the next login or automatically within a few days.</p>
					</div>
				</div>
			</div>		
		</div>
		<!--<div id="betabadge"></div>-->
<?php include_once("includes/footer.php") ?>
   	</body>
</html>