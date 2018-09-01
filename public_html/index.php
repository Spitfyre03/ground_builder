<?php
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'config.inc.php';
$view = 'ground_builder';
$controller = $view;
if ($controller && file_exists(PUBLIC_URI . "controllers/$controller.inc.php")) {
	include PUBLIC_URI . "controllers/$controller.inc.php";
}
include INCLUDE_URI . 'header.html';
include PUBLIC_URI . "views/$view.html";
include INCLUDE_URI . 'footer.html';
if (isset($dbc)) {
	$dbc->close();
}
?>
