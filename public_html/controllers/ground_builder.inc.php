<?php
// Populate cable, ferrule, and clamp options from database
// index % 2: 0 - Ground, 1 - Jumper; index > 1: Cluster
$cable_types = array('Ground', 'Jumper', 'Cluster Ground', 'Cluster Jumper');
$gauges = selectWithCondition($dbc, 'gauge', 'wire_gauges', null, null, null, 'ORDER BY gauge ASC');
$colors = selectWithCondition($dbc, array('id', 'color'), 'jacket_colors', null, null, null, 'ORDER BY id ASC');
if ($colors) {
    $colors = array_combine(array_column($colors, 'id'), array_column($colors, 'color'));
}
$jacket_kvs = selectWithCondition($dbc, 'kv', 'jacket_kvs', null, null, null, 'ORDER BY kv ASC');
$styles = selectWithCondition($dbc, array('id', 'style'), 'clamp_styles', null, null, null, 'ORDER BY id ASC');
if ($styles) {
    $styles = array_combine(array_column($styles, 'id'), array_column($styles, 'style'));
}
/*
 * Build array of default clamps: model number / manufacturer links for each style + size + ferrule + kv combination
 * Index = style_id + (is_large * 16) + (is_threaded * 32) with optional appended kv array
 * e.g. For Elbow grounds (always threaded): $stock_clamps[4 + 0 + 32] = array(15, 25, 35)
 */
/*
Of special note is the `grounds_data` table which is not technically required for this project but was included for context. This table is used to store the relevant information for every cable that we build or test.

Note that the `clamp1_id` and `clamp2_id` columns reference the `clamps` table. Note that the `clamps` table has a unique key on (`style_id`,`is_large`,`is_threaded`,`kv`) and has a manufacturer and model number column - this was intended as the default clamp fitting those criteria but as can be seen above, it has lead to an obtuse and restrictive algorithm that has to be reevaluated any time
a new style or other option is added (such as all angle and insulated jumper clamps).

Furthermore, the table was created with the assumption (which is generally but not always true) that the phases of a cluster cable always have identical length and clamp + ferrule configurations.

Obviously this table will need to be refactored at some point but it provides useful context for the code seen here and elsewhere.
 */
$stock_clamps = array();
if (($r = $dbc->query("SELECT `style_id`, `is_large`, `is_threaded`, `kv`, `manufacturer`, `model_number`, `url` FROM `clamps` ORDER BY `id` ASC")) === false) {
	throw new \RuntimetException("Database error: $dbc->errno - $dbc->error");
}
while($row = $r->fetch_assoc()) {
	$tmp_link = cleanInput($row['manufacturer'] . (empty($row['model_number']) ? '' : ' ' . $row['model_number']));
	if (!empty($row['url'])) {
		$tmp_link = '<a href="' . cleanInput($row['url']) . '" target="_blank" title="View this clamp on the manufacturer\'s website">' . $tmp_link . '</a>';
	}
	$tmp_index = $row['style_id'] + ($row['is_large'] * 16) + ($row['is_threaded'] * 32);
	if (empty($row['kv'])) {
		$stock_clamps[$tmp_index] = $tmp_link;
	} else {
		if (!isset($stock_clamps[$tmp_index])) {
			$stock_clamps[$tmp_index] = array();
		}
		$stock_clamps[$tmp_index][$row['kv']] = $tmp_link;
	}
}
$r->close();

// Use data from POST if available to populate current selections
$ground_type = (isset($_POST['ground']['type']) ? filter_var($_POST['ground']['type'], FILTER_VALIDATE_INT) : false);
$ground_gauge = (isset($_POST['ground']['gauge']) ? filter_var($_POST['ground']['gauge'], FILTER_VALIDATE_INT) : false);
$length = (isset($_POST['ground']['length']) ? filter_var($_POST['ground']['length'], FILTER_VALIDATE_INT) : false);
$phase_length = (isset($_POST['ground']['phase_length']) ? filter_var($_POST['ground']['phase_length'], FILTER_VALIDATE_INT) : false);
$color_id = (isset($_POST['ground']['color_id']) ? filter_var($_POST['ground']['color_id'], FILTER_VALIDATE_INT) : false);
$jacket_kv = (isset($_POST['ground']['jacket_kv']) ? filter_var($_POST['ground']['jacket_kv'], FILTER_VALIDATE_INT) : false);
$clamps = filter_input(INPUT_POST, 'clamp', FILTER_VALIDATE_INT, FILTER_REQUIRE_ARRAY);
$is_cluster = ($ground_type & 2) > 0;
?>
