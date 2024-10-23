Pageflip5 v1.5 - Update Information - Read it before updading old files



Updating from version 1.4, 1.45 need to replace these files:
css/pageflip.css
js/pageflip5-min.js



Notes if you update from versions prior to 1.4:

To make this update work, replace the following files:
common/controlbar_svg.html (if you embedded the content of this file, make sure to update the embedded content too)
css/pageflip.css
css/pageflip-custom.css
js/pageflip5-min.js



Important:
Most of the Pageflip CSS selectors was renamed in version 1.4 to decrease the possibility of any conflicts caused by some CSS framworks like Bootstrap, or Wordpress Themes.
If you have custom style sheets that uses a pageflip selector, just apply this rule: add "pf-" as prefix for all selectors, except those begining with "pageflip" or "b-" (control bar buttons)

