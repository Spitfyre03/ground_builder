<?php
/**
REQUIRES ($_POST)
input		User input, at least 3 characters
limit		Truncate the returned options list if greater than this value; default is 20.
			If limit is 0, all results will be returned.
table_name	Name of table to query against (must be on white-list)
column_name	Name of column to query against (must be on white-list)

OUTPUT
String, raw url encoded, of all options formatted for a datalist,
	e.g. rawurlencode('<option>Value 1</option><option>Value 2</option>...')
*/
$white_list = array(
	'inventory_catalog'=>array('columns'=>array('part_number'), 'alternate'=>array('table'=>'parts_catalog', 'column'=>'part_number')),
	'parts_catalog'=>array('columns'=>array('part_number')),
);
function fetchResults($dbc, $input, $table, $column, $limit) {
	$table = escape_data($table, $dbc);
	$column = escape_data($column, $dbc);
	$q = "SELECT DISTINCT $column FROM $table WHERE $column LIKE ? ORDER BY $column";
	if (!empty($limit) && is_int($limit)) {
		$q .= " LIMIT $limit";
	}
	$stmt = $dbc->prepare($q);
	$input .= "%";
	if (!$stmt->bind_param('s', $input) || !$stmt->execute()) {
		throw new \RuntimeException("Database error: $stmt->errno - $stmt->error");
	}
	$results = fetch_assoc_stmt($stmt, false);
	$stmt->close();
	return $results;
}
try {
	if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		throw new \RuntimeException("Expected request via POST; received via " . $_SERVER['REQUEST_METHOD']);
	}
	$input = filter_input(INPUT_POST, 'input');
	$limit = (isset($_POST['limit']) ? filter_input(INPUT_POST, 'limit', FILTER_VALIDATE_INT) : 20);
	$table_name = filterRequiredInput(INPUT_POST, 'table_name', FILTER_SANITIZE_STRING);
	$column_name = filterRequiredInput(INPUT_POST, 'column_name', FILTER_SANITIZE_STRING);
	if (empty($input) || strlen($input) < 3) {
		die(''); // empty list, so nothing to echo
	} elseif (!array_key_exists($table_name, $white_list)) {
		throw new \RuntimeException("Table name '$table_name' is not whitelisted");
	} elseif (array_search($column_name, $white_list[$table_name]['columns']) === false) {
		throw new \RuntimeException("Column name '$column_name' is not whitelisted");
	}
	$results = fetchResults($dbc, $input, $table_name, $column_name, $limit);
	if (empty($results) && !empty($white_list[$table_name]['alternate'])) {
		$alternate = $white_list[$table_name]['alternate'];
		$results = fetchResults($dbc, $input, $alternate['table'], $alternate['column'], $limit);
	}
	if (!empty($results)) {
		echo rawurlencode('<option>' . (is_array($results) ? implode('</option><option>', $results) : $results) . '</option>');
	}
} catch (\Exception $e) {
	//logException($e);
	die('');
}
