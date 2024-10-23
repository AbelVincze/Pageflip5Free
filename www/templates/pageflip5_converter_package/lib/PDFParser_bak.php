<?php require_once('Tracer.php');class PDFParser{ private $log=""; private $showObjs=true; private $logtofile; private $logfile; private $tempArr; private $pdfData;function __construct($logfile=null){if($logfile){$this->logtofile=true;$this->logfile=$logfile;}}function __destruct(){} private function getPDFobjects($file){ini_set("auto_detect_line_endings",true);if(!file_exists($file))return null;if(!$fp=@fopen($file,"r"))return null;$isStream=false;$isObj=false;$isProp=false;$isRoot=false;$bl=4096;$isArray=false;$objCode="";$data="";$objArray=Array();$objStmArray=Array();while(!feof($fp)){$lines=explode("\r",fgets($fp,$bl));for($subline=0;$subline<count($lines);$subline++){$line=$lines[$subline];$full=(strlen($line)==$bl-1);$line=trim($line);$nl=false;$isRoot=false;if($isStream==false){Tracer::trace("--LINE--$line--ENDLINE--\n");if(!$isObj){$pos=strpos($line,"obj");if($pos!==false){$isObj=true;$objCode=trim(substr($line,0,$pos));$data="";Tracer::trace("  OBJ [$objCode]\n");$line=trim(substr($line,$pos+3));}}if(substr($line,0,2)=="<<"){$isProp=true;if(!$isObj)$isRoot=true;$line=trim(substr($line,2));}if($isObj){$pos=strpos($line,"stream");if($pos===0||substr($line,-6)=="stream"){$isStream=true;$line=trim(substr($line,0,$pos));if(strpos($line,"ObjStm")!==false){$osl=$this->getV($line,"/length");$osf=$this->getNV($line,"/filter");$oss=$this->getV($line,"/first");$osn=$this->getV($line,"/n");Tracer::trace("\n!!!OBJSTM!!!");Tracer::trace("\nLength: $osl");Tracer::trace("\nFilter: $osf\n");Tracer::trace("\nN:      $osn");Tracer::trace("\nFirst:  $oss");$objstm=substr(fread($fp,$osl+1),1);if($osf=="FlateDecode"){$dobjstm=@gzuncompress($objstm);Tracer::trace("\nDECODED: $dobjstm\nEND DECODED DATA\n");}$osl=strlen($dobjstm);$osdata=substr($dobjstm,0,$oss);$osdata=$this->dataexplode($osdata);for($i=0;$i<count($osdata);$i+=2){$osobj=$osdata[$i]." 0";$osobjlength=isset($osdata[$i+3])?$osdata[$i+3]-$osdata[$i+1]:$osl-$osdata[$i+1];$ossp=$oss+$osdata[$i+1];$osobjdata=substr($dobjstm,$ossp,$osobjlength);$osobjdata=trim($osobjdata);if(substr($osobjdata,0,2)=="<<"){$objArray[$osobj]=substr($osobjdata,2,strlen($osobjdata)-4);}else {$objArray[$osobj]=$osobjdata;}}}}if(substr($line,-6)=="endobj"){$isProp=$isObj=false;$line=trim(substr($line,0,-6));$nl=true;}if(!$isArray&&substr($line,0,1)=="["){$isArray=true;}if($isArray&&substr($line,-1)=="]"){$isArray=false;}if(substr($line,-2)==">>"){$isProp=false;$line=trim(substr($line,0,-2));}if($line){Tracer::trace("  $line\n");}$data.=$line." ";}else {if($isProp){if(substr($line,-2)==">>"){$isProp=false;$line=trim(substr($line,0,-2));$nl=true;}if($isRoot){Tracer::trace("  ROOT: ");$objCode="root";$data="";}Tracer::trace($line);$data.=$line." ";}}if($nl){$finaldata=trim($data);$objArray[$objCode]=$finaldata;Tracer::trace("--FINALDATA--$finaldata--ENDFINALDATA--\n");Tracer::trace("---\n");}}if(substr($line,-9)=="endstream")$isStream=false;}}fclose($fp);return $objArray;} private function getPDFtexts($file,$pObjArray,$contentObjects){ini_set("auto_detect_line_endings",true);if(!file_exists($file))return null;if(!$fp=@fopen($file,"r"))return null;$isStream=false;$isObj=false;$isProp=false;$isRoot=false;$bl=4096;$isArray=false;$objCode="";$data="";$objArray=Array();$objStmArray=Array();while(!feof($fp)){$lines=explode("\r",fgets($fp,$bl));for($subline=0;$subline<count($lines);$subline++){$line=$lines[$subline];$full=(strlen($line)==$bl-1);$line=trim($line);$nl=false;$isRoot=false;if($isStream==false){if(!$isObj){$pos=strpos($line,"obj");if($pos!==false){$isObj=true;$objCode=trim(substr($line,0,$pos));$data="";$line=trim(substr($line,$pos+3));}}if($isObj){$found=false;$foundPageNumber;for($i=0;$i<count($contentObjects);$i++){if($objCode==$contentObjects[$i]){$found=true;$foundPageNumber=$i;break;}}$pos=strpos($line,"stream");if($pos===0||substr($line,-6)=="stream"){$isStream=true;$line=trim(substr($line,0,$pos));if($found){$oline=$pObjArray[$objCode];$osl=$this->getR($oline,"/length");if($osl===false)$osl=$this->getV($oline,"/length");else $osl=$pObjArray[$osl];$osf=$this->getNV($oline,"/filter");Tracer::trace("\n!!!Content Stream for page $foundPageNumber!!!");Tracer::trace("\nline [$objCode]: $line");Tracer::trace("\nLength: $osl");Tracer::trace("\nFilter: $osf\n");$objstm=substr(fread($fp,$osl+1),1);if($osf=="FlateDecode"){$dobjstm=@gzuncompress($objstm);}if($dobjstm){if(preg_match_all("#BT(.*)ET#ismU",$dobjstm,$textContainers)){$textContainers=@$textContainers[1];Tracer::trace_arr("dirty text",$textContainers);}Tracer::trace("---\n");}}}if(substr($line,-6)=="endobj"){$isProp=$isObj=false;$line=trim(substr($line,0,-6));$nl=true;}if(!$isArray&&substr($line,0,1)=="["){$isArray=true;}if($isArray&&substr($line,-1)=="]"){$isArray=false;}if(substr($line,-2)==">>"){$isProp=false;$line=trim(substr($line,0,-2));}$data.=$line." ";if($isArray){$data.=" ";}}else {if($isProp){if(substr($line,-2)==">>"){$isProp=false;$line=trim(substr($line,0,-2));$nl=true;}if($isRoot){$objCode="root";$data="";}$data.=$line." ";}}if($nl){}}if(substr($line,-9)=="endstream")$isStream=false;}}fclose($fp);return $objArray;} public function parsePDF($pdfFile){$this->pdfData=$this->PDFparser($pdfFile);if($this->pdfData===false)Tracer::trace("\nParse error");Tracer::trace("\n\nTHE END");if($this->logtofile)Tracer::saveToFile($this->logfile);return $this->pdfData;} private function PDFparser($pdfFile){Tracer::trace("Parse PDF\n\n");$maxlinks=0;$pagelinks=0;$urllinks=0;$spreads=0;$rotatedpages=0;$pageOrder=Array();$objArray=$this->getPDFobjects($pdfFile);if(count($objArray)==0)return false;if($this->showObjs)Tracer::trace_r($objArray);$catalog=$this->findfirstObjWithAttr($objArray,"type/catalog");if($catalog===false)$catalog=$this->findfirstObjWithAttr($objArray,"type /catalog");if($catalog===false){Tracer::trace("\nCatalog not found, is it a PDF?");return false;}Tracer::trace(">$catalog<\n");Tracer::trace($objArray[$catalog]."\n");Tracer::trace("\nPages root: ");$pagesRoot=$this->getR($objArray[$catalog],"pages");if($pagesRoot!==false)Tracer::trace(">$pagesRoot<");if($objArray[$pagesRoot]){Tracer::trace("\n".$objArray[$pagesRoot]."\n");$maxpage=$this->getV($objArray[$pagesRoot],"count");$defmediabox=$this->getVArray($objArray[$pagesRoot],"mediabox");$defcropbox=$this->getVArray($objArray[$pagesRoot],"cropbox");if(isset($defmediabox))Tracer::trace_arr("default mediabox",$defmediabox);if(isset($defcropbox))Tracer::trace_arr("default cropbox",$defcropbox);$pageOrder=$this->getPageOrderFromPagesRoot($objArray,$pagesRoot);if($pageOrder===false){Tracer::trace("\nPage Order can't be retrived from Pages root (Catalog)...\n");return false;}else {Tracer::trace_r($pageOrder);}if(count($pageOrder)!=$maxpage){Tracer::trace("\nPage number in the catalogue doesn't match with Page count -> Fix Count\n");$maxpage=count($pageOrder);}else {Tracer::trace("\nEverything is perfect!\n");}}else {Tracer::trace("\nPages root doesn't exists, we try to build pages order from scratches...\n");$pages=$this->findAllPage($objArray);$maxpage=count($pages);foreach($pages as $objCode){$i=$this->getV($objArray[$objCode],"structparents");if($i===false)break;$pageOrder[intval($i)]=$objCode;}if(count($pageOrder)!=$maxpage){Tracer::trace("Couldn't get the right page order, sorry...\n");return false;}else {Tracer::trace("Page Order resolved! \n");Tracer::trace_r($pageOrder);}}Tracer::trace("\n\nNumber of pages: ".$maxpage);Tracer::trace("\n\nTime to get all the links...");$realPageNumbers=Array();$contentObjects=Array();for($i=0;$i<count($pageOrder);$i++){$realPageNumbers[$pageOrder[$i]]=$i;$page=$objArray[$pageOrder[$i]];$contentObjects[$i]=$this->getR($page,"contents");}Tracer::trace_r($realPageNumbers);Tracer::trace_r($contentObjects);$pdfData=Array();$pdfData["pages"]=Array();$constpagesize=1;$usecropbox=0;for($i=0;$i<count($pageOrder);$i++){$pageData=Array();if(isset($objArray[$pageOrder[$i]])){$prop=$objArray[$pageOrder[$i]];Tracer::trace("\nPage $i - [".$pageOrder[$i]."] ---------\n");$mediabox=$this->getVArray($prop,"mediabox");$cropbox=$this->getVArray($prop,"cropbox");if($i==0){if($mediabox)$defmediabox=$mediabox;if($cropbox)$defcropbox=$cropbox;if($defcropbox){Tracer::trace_arr("Auto use crop box: ",$defcropbox);$usecropbox=1;}else {Tracer::trace_arr("Auto use media box: ",$defmediabox);}}if(!$defmediabox&&$mediabox)$defmediabox=$mediabox;if(!$defcropbox&&$cropbox)$defcropbox=$cropbox;if(!$mediabox&&$defmediabox)$mediabox=$defmediabox;if(!$cropbox&&$defcropbox)$cropbox=$defcropbox;$pdfrot=$this->getV($prop,"rotate");if($pdfrot)Tracer::trace("\trotate $pdfrot\n");$usedbox=$usecropbox?$cropbox:$mediabox;$useddefbox=$usecropbox?$defcropbox:$defmediabox;if($pdfrot=="90"||$pdfrot=="270"){$usedbox=$this->getRotatedBox($usedbox,true);$pdfrot=true;}else {$pdfrot=false;}if($usedbox){$pageData["mediabox"]=$usedbox;if($this->isRotated($useddefbox,$usedbox)||$pdfrot){$pageData["rotated"]=true;$rotatedpages++;}else if($spreadType=$this->isSpread($useddefbox,$usedbox)){$pageData["spread"]=$spreadType;$spreads++;}$pageData["mdpi"]=$this->getDpiMultiplier($useddefbox,$usedbox);if(!$this->isAlmostSameSize($useddefbox,$usedbox)){$constpagesize=0;}}$annots=$this->getV($prop,"annots");if($annots!==false){if(!$this->isArray($annots))$annots=$this->getArrayFromRArray($objArray[trim(substr($annots,0,-1))]);else $annots=$this->getArrayFromRArray($annots);$pageLinks=Array();for($a=0;$a<count($annots);$a++){$annot=$objArray[$annots[$a]];if(strpos(strtolower($annot),"subtype")!==false&&(strpos(strtolower($annot),"link")!==false||strpos(strtolower($annot),"widget")!==false)){Tracer::trace("\tLink $a. ");$rect=$this->getVArray($annot,"/rect");if($rect)Tracer::trace_arr("rect",$rect);if($rect===false)continue;$dest=$this->getDestination($objArray,$annot);if($dest){if(isset($dest["page"])&&isset($realPageNumbers[$dest["page"]])){Tracer::trace("\t\tLinked page: ".$realPageNumbers[$dest["page"]]."\n");$dest["page"]=$realPageNumbers[$dest["page"]];$pagelinks++;}if(isset($dest["url"])){Tracer::trace("\t\tLinked URL: ".$dest["url"]."\n");$urllinks++;}$dest["rect"]=$rect;$pageLinks[]=$dest;$maxlinks++;}Tracer::trace("\n\n");}}$pageData["links"]=$pageLinks;}}$pdfData["pages"][]=$pageData;}$maxpage=intval($maxpage);$pdfData["info"]=Array("pagecount"=>$maxpage,"pagelinkcount"=>$pagelinks,"urllinkcount"=>$urllinks,"totallinkcount"=>$maxlinks,"rotatedpagecount"=>$rotatedpages,"spreadcount"=>$spreads,"singlepagecount"=>($maxpage-$spreads)+$spreads*2,"constpagesize"=>$constpagesize);$pdfData["info"]["mediabox"]=$usecropbox?$defcropbox:$defmediabox;Tracer::trace_r($pdfData);Tracer::trace("\nData size: ".strlen(serialize($pdfData))." bytes\n");return $pdfData;} private function getRotatedBox($box,$isRotated){if($isRotated){$x=$box[0];$Y=$box[1];$W=$box[2];$H=$box[3];$box[0]=$Y;$box[1]=$X;$box[2]=$H;$box[3]=$W;}return $box;} private function getDestination($objArray,$prop){Tracer::trace("\n####$prop\n");if($this->isArray($prop)){$dest=$this->getArrayFromRArray($prop)[0];Tracer::trace("Linked: page ($dest)\n");return Array("page"=>$dest);}$dest=$this->getVAsArray($prop,"dest");if($dest!==false)return $this->getDestination($objArray,$dest);$destObj=$this->getAttrObjectValue($prop,"a");if($destObj===false)$destObj=$objArray[$this->getR($prop,"a ")];Tracer::trace("Link object: $destObj\n");if($destObj!==false){$title=$this->getAttrStringValue($destObj,"d");if($title){$tempDest=$this->findObjWithTitle($objArray,$title);if($tempDest){return $this->getDestination($objArray,$objArray[$tempDest]);}$destObj=$this->findObjWithName($objArray,$title);$tempDest=$this->getR($destObj,"d[");if($tempDest===false)$tempDest=$this->getR($destObj,"d [");if($tempDest===false)return $this->getDestination($objArray,$destObj);return Array("page"=>$tempDest);}$tempDest=$this->getR($destObj,"d ");if($tempDest===false)$tempDest=$this->getR($destObj,"d[");Tracer::trace("Tempdest: $tempDest\n");if($tempDest){$tempProp=$objArray[$tempDest];if($tempProp){if(strpos($tempProp,"page")!==false){return Array("page"=>$tempDest);}}return $this->getDestination($objArray,$objArray[$tempDest]);}$url=$this->getAttrStringValue($destObj,"uri");if($url){return Array("url"=>$url);}}return false;} private function isArray($prop){if(substr($prop,0,1)=="[")return true;return false;} private function getAttrObjectValue($prop,$attr){$s=$attr."<<";$pos=strpos(strtolower($prop),$s);if($pos===false){$s=$attr." <<";$pos=strpos(strtolower($prop),$s);}if($pos!==false){$prop=trim(substr($prop,$pos+strlen($s)));$pos=strpos($prop,">>");if($pos!==false){$prop=trim(substr($prop,0,$pos));}return $prop;}return false;} private function getAttrStringValue($prop,$attr){$s=$attr."(";$pos=strpos(strtolower($prop),$s);if($pos===false){$s=$attr." (";$pos=strpos(strtolower($prop),$s);}if($pos!==false){$prop=trim(substr($prop,$pos+strlen($s)));$pos=strpos($prop,")");if($pos!==false){$prop=trim(substr($prop,0,$pos));}return $prop;}return false;} private function getR($prop,$attr){$pos=strpos(strtolower($prop),$attr);if($pos!==false){$prop=trim(substr($prop,$pos+strlen($attr)));$pos=strpos($prop,"/");if($pos!==false){$prop=trim(substr($prop,0,$pos));}if(substr(strtolower($prop),-1)=="r"){return trim(substr($prop,0,-1));}return false;}return false;} private function getV($prop,$attr){$pos=strpos(strtolower($prop),$attr);if($pos!==false){$prop=trim(substr($prop,$pos+strlen($attr)));$pos=strpos($prop,"/");if($pos===false){$pos=strpos($prop,">>");}if($pos!==false){$prop=trim(substr($prop,0,$pos));}return $prop;}return false;} private function getNV($prop,$attr){$pos=strpos(strtolower($prop),$attr);if($pos!==false){$prop=trim(substr($prop,$pos+strlen($attr)));$pos=strpos($prop,"/");if($pos!==false){$prop=trim(substr($prop,$pos+1));$pos=strpos($prop,"/");if($pos!==false){$prop=trim(substr($prop,0,$pos));}return $prop;}}return false;} private function dataexplode($str){$str=trim($str)." ";$out=Array();$sep=false;$tmp="";for($p=0;$p<strlen($str);$p++){$c=substr($str,$p,1);if($c==" "){if(!$sep){$out[]=$tmp;$sep=true;$tmp="";}}else {$sep=false;$tmp.=$c;}}return $out;} private function getVArray($prop,$attr){$pos=strpos(strtolower($prop),$attr);if($pos!==false){$prop=trim(substr($prop,$pos+strlen($attr)));if(substr($prop,0,1)=="["){$pos=strpos($prop,"]");if($pos!==false){$values=$this->dataexplode(substr($prop,1,$pos-1));foreach($values as &$val){$val=trim($val);}return $values;}}}return false;} private function getVAsArray($prop,$attr){$pos=strpos(strtolower($prop),$attr);if($pos!==false){$prop=trim(substr($prop,$pos+strlen($attr)));if(substr($prop,0,1)=="["){$pos=strpos($prop,"]");if($pos!==false){return trim(substr($prop,0,$pos+1));}}}return false;} private function getRArray($prop,$attr){$pos=strpos(strtolower($prop),$attr);if($pos!==false){$prop=substr($prop,$pos+strlen($attr));return $this->getArrayFromRArray($prop);}return false;} private function getArrayFromRArray($rarr){$rarr=trim($rarr);if(substr($rarr,0,1)=="["){$pos=strpos($rarr,"]");if($pos!==false){$refs=explode("r",trim(strtolower(substr($rarr,1,$pos-1))),-1);foreach($refs as &$val){$val=trim($val);}return $refs;}}return false;} private function findfirstObjWithAttr($objArray,$attr){foreach($objArray as $objCode=>$prop){$pos=strpos(strtolower($prop),$attr);if($pos!==false){return $objCode;}}return false;} private function findAllPage($objArray){$found=Array();foreach($objArray as $objCode=>$prop){$pos=strpos(strtolower($prop),"type");if($pos!==false){$pos=strpos(strtolower($prop),"page");if($pos!==false){if(strpos(strtolower($prop),"pages")===false)$found[]=$objCode;}}}return $found;} private function findObjWithTitle($objArray,$title){$title=strtolower($title);foreach($objArray as $objCode=>$prop){$prop=strtolower($prop);$pos=strpos($prop,"title($title)");$pos2=strpos($prop,"title ($title)");if($pos!==false||$pos2!==false){return $objCode;}}return false;} private function findObjWithName($objArray,$title){$title=strtolower($title);foreach($objArray as $objCode=>$prop){$pos=strpos(strtolower($prop),"names");if($pos!==false){$prop=trim(substr($prop,$pos+5));$s="($title)";$pos=strpos(strtolower($prop),$s);if($pos!==false){$prop=trim(substr($prop,$pos+strlen($s)));$pos=strpos(strtolower($prop),"r");if($pos!==false){if(substr($prop,0,1)=="["){$dest=trim(substr($prop,1,$pos-1));return "d[$dest r/]";}else {$dest=trim(substr($prop,0,$pos));}if(isset($objArray[$dest]))return $objArray[$dest];return false;}}}}return false;} private function getPageOrderFromPagesRoot($objArray,$objCode){$this->tempArr=Array();$refs=$this->getRArray($objArray[$objCode],"kids");$this->getPageObjCodesFromRArray($objArray,$refs);return $this->tempArr;} private function getPageObjCodesFromRArray($objArray,$refs){for($i=0;$i<count($refs);$i++){$prop=$objArray[$refs[$i]];$pos=strpos(strtolower($prop),"type");if($pos!==false){$pos=strpos(strtolower($prop),"pages");if($pos!==false){$subRefs=$this->getRArray($prop,"kids");if($subRefs!==false){$this->getPageObjCodesFromRArray($objArray,$subRefs);}}else {$pos=strpos(strtolower($prop),"page");if($pos!==false){$this->tempArr[]=$refs[$i];}}}}} private function areAlmostEquals($A,$B){$limit=($A+$B)/200;return (abs($A-$B)<$limit);} private function isAlmostDouble($A,$B){$limit=$A/100;return (abs($A-$B/2)<$limit);} private function isRotated($defrect,$rect){$defsize=$this->getRectSize($defrect);$size=$this->getRectSize($rect);return (!$this->areAlmostEquals($defsize["width"],$defsize["height"])&&$this->areAlmostEquals($defsize["width"],$size["height"])&&$this->areAlmostEquals($defsize["height"],$size["width"]));} private function isSpread($defrect,$rect){$defsize=$this->getRectSize($defrect);$size=$this->getRectSize($rect);$spread=false;if($this->isAlmostDouble($defsize["width"],$size["width"])&&$this->areAlmostEquals($defsize["height"],$size["height"])){$spread="h";}else if($this->isAlmostDouble($defsize["height"],$size["height"])&&$this->areAlmostEquals($defsize["width"],$size["width"])){$spread="v";}return $spread;} private function isAlmostSameSize($defrect,$rect){$defsize=$this->getRectSize($defrect);$size=$this->getRectSize($rect);$same=false;if($this->areAlmostEquals($defsize["width"],$size["width"])&&$this->areAlmostEquals($defsize["height"],$size["height"])){$same=true;}return $same;} private function getDpiMultiplier($defrect,$rect){$defsize=$this->getRectSize($defrect);$size=$this->getRectSize($rect);$Wm=$defsize["width"]/$size["width"];$Hm=$defsize["height"]/$size["height"];$M=Array();$M["Fit"]=($Wm<$Hm)?$Wm:$Hm;$M["Fill"]=($Wm>$Hm)?$Wm:$Hm;$M["Noscale"]=1;return $M;} public function getInfo(){return $this->pdfData["info"];} public function getPageCount(){return $this->pdfData["info"]["pagecount"];} public function getPageMediabox($page){return $this->pdfData["pages"][$page]["mediabox"];} public function getPageBleedbox($page){return $this->pdfData["pages"][$page]["bleedbox"];} public function getPDFPages(){return $this->pdfData["pages"];} public function getPageLinks($page){return $this->pdfData["pages"][$page]["links"];} public function getPDFData(){return $this->pdfData;} public function setPDFData($pdfData){$this->pdfData=$pdfData;} public function getRectSize($rect){$size=Array("left"=>$rect[0],"bottom"=>$rect[1],"width"=>$rect[2]-$rect[0],"height"=>$rect[3]-$rect[1]);return $size;}}?>