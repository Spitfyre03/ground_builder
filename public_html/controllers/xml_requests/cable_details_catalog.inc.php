<?php
function fetch_component_details(\mysqli $dbc, $tags, $quantity = 1) {
    $tagCount = count($tags);
    $tagsTemplate = "?" . str_repeat(", ?", $tagCount - 1);// Minus 1 for concat base
    $params = array();
    if (is_array($tags)) {
        $params = $tags;
    } else {
        $params[] = $tags;
    }
    array_push($params, $quantity);

    $q = "SELECT m.name AS manufacturer, p.part_number, p.description, ROUND(p.price/100, 2) AS price, p.stock_level FROM `inventory_catalog` p JOIN `manufacturers` m ON m.id=p.manufacturer_id LEFT JOIN `tag_assign` a ON a.item_id=p.id WHERE a.tag_id IN ($tagsTemplate) AND p.stock_level>=? GROUP BY p.id HAVING COUNT(a.item_id)=$tagCount ORDER BY p.id ASC";
    $stmt = $dbc->prepare($q);
    if (!$stmt) {
        throw new \RuntimeException("Failed to prepare statement for query: $q");
    }
    $arg_types = str_repeat("i", $tagCount + 1);// Plus one for the quantity field
    $bound = bind_stmt_params($stmt, $arg_types, $params);
    if (!$bound || !$stmt->execute()) {
		throw new \RuntimeException("Database error: $stmt->errno - $stmt->error");
    }
    $ret = fetch_assoc_stmt($stmt);
    $stmt->close();
    return $ret;
}

function fetchRequiredInputs($var_name, $required_keys, $options=array()) {
    if (empty($options) || !is_array($options)) {
        $options = array(
            "options" => array(
                "min_range" => 1
            ),
            "flags" => FILTER_REQUIRE_ARRAY
        );
    }
    $ret = filter_input(INPUT_POST, $var_name, FILTER_VALIDATE_INT, $options);
    if (empty($ret) || !empty(array_diff($required_keys, array_keys($ret)))) {
        throw new \RuntimeException("Posted $var_name structure invalid");
    }
    return $ret;
}

function fetch_matching_cables(\mysqli $dbc) {
    $cable = fetchRequiredInputs('cable', array('type', 'gauge', 'color', 'kv', 'length'));
    $arr = array($cable['type'], $cable['gauge'], $cable['color'], $cable['kv']);
    $quantity = array_sum($cable['length']);
    return fetch_component_details($dbc, $arr, $quantity);
}

function fetch_matching_ferrules(\mysqli $dbc) {
    return fetch_component_details($dbc, array_values(fetchRequiredInputs('ferrule', array('connection', 'shroud', 'material'))), 1);
}

function fetch_matching_clamps(\mysqli $dbc) {
    return fetch_component_details($dbc, array_values(fetchRequiredInputs('clamp', array('connection', 'style', 'kv'))), 1);
}

$details = array();
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		throw new \RuntimeException("Expected request via POST; received via " . $_SERVER['REQUEST_METHOD']);
    }
    if (($type = filter_input(INPUT_POST, "item_type", FILTER_VALIDATE_INT))) {
        switch ($type) {
            case 1:
                $details = fetch_matching_cables($dbc);
                break;
            case 2:
                $details = fetch_matching_ferrules($dbc);
                break;
            case 3:
                $details = fetch_matching_clamps($dbc);
                break;
            default:
                throw new \RuntimeException("POST item type is an invalid value");
        }
    } else {
        throw new \RuntimeException("Post missing required item_type argument");
    }
    if ($details) {
        echo json_encode($details);
    }
} catch (\Exception $e) {
    echo $e;// Not to be implemented in production
    die('');
}