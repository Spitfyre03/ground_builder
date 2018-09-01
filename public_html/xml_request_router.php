<?php
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'config.inc.php';
$id = filter_var($_REQUEST['route_id']); // checked for valid characters below
if (empty($id)) {
	throw new \RuntimeException("Unable to route XML request: Missing required 'route_id'");
} elseif (!is_string($id)) {
	throw new \RuntimeException('Expected a string id, received ' . print_r($id, true));
} elseif (!preg_match('/^[a-z0-9_]+$/', $id)) {
	throw new \RuntimeException('ID may only contain alphanumeric characters and underscores, received ' . $id);
}
include PUBLIC_URI . "controllers/xml_requests/$id.inc.php";
if (isset($dbc)) {
	$dbc->close();
}
?>
