<?php
// Change root definition to match actual directory
define('ROOT', '/git/ground_builder/');
define('BASE_URL', 'http://localhost' . ROOT . 'public_html/');
define('STYLE_SHEET_URL', BASE_URL . 'css/style-1.1.4.css');
define('BASE_URI', 'C:/wamp/www' . ROOT);
define('PUBLIC_URI', BASE_URI . 'public_html/');
define('INCLUDE_URI', PUBLIC_URI . 'includes/');

// Set up database connection - credentials would not be included here in a production environment
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'dbuser');
define('DB_PASS', 'password');
define('DB_NAME', 'grounds');

// Include some useful pre-existing functions
include INCLUDE_URI . 'functions.inc.php';

// Set error and exception handlers
set_error_handler('dev_error_handler');
set_exception_handler('dev_exception_handler');

// Set up database connection
$dbc = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (mysqli_connect_errno()) {
	throw new \RuntimeException("Could not connect to MySQL: " . mysqli_connect_error());
}

// GROUP_CONCAT has a default length limit of 1024 which is insufficient for some pages
$q = "SET SESSION `group_concat_max_len`=100000";
if ($dbc->query($q) === false) {
	throw new \RuntimeException("Database error: $dbc->errno - $dbc->error");
}
?>
