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

function fetch_matching_cables(\mysqli $dbc, $options) {
    $required = array('type', 'gauge', 'color', 'kv', 'length');
    $cable = filter_input(INPUT_POST, 'cable', FILTER_VALIDATE_INT, $options);
    if (empty($cable) || !empty(array_diff($required, array_keys($cable)))) {
        throw new \RuntimeException("Posted ground structure is invalid");
    }
    if (($cable['type'] & 2) xor ($cable['kv'] !== 14)) {
        throw new \RuntimeException("Cable type and KV rating must be a valid combination");
    }
    $arr = array($cable['type'], $cable['gauge'], $cable['color'], $cable['kv']);
    $quantity = array_sum($cable['length']);
    return fetch_component_details($dbc, $arr, $quantity);
}

function fetch_matching_ferrules(\mysqli $dbc, $options) {
    $required = array('connection', 'shroud', 'material');
    $ferrule = filter_input(INPUT_POST,'ferrule', FILTER_VALIDATE_INT, $options);
    if (empty($ferrule) || !empty(array_diff($required, array_keys($ferrule)))) {
        throw new \RuntimeException("Posted ferrule structure is invalid");
    }
    return fetch_component_details($dbc, array_values($ferrule), 1);
}

function fetch_matching_clamps(\mysqli $dbc, $options) {
    $required = array('connection', 'style', 'kv');
    $clamp = filter_input(INPUT_POST, 'clamp', FILTER_VALIDATE_INPUT, $options);
    if (empty($clamp) || !empty(array_diff($required, array_keys($clamp)))) {
        throw new \RuntimeException("Posted clamp structure is invalid");
    }
    if (($clamp['style'] === 28) xor ($clamp['connection'] === 45)) {
        throw new \RuntimeException("Clamp style and connection type must be a valid combination");
    }
    return fetch_component_details($dbc, array_values($clamp), 1);
}

$details = array();
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		throw new \RuntimeException("Expected request via POST; received via " . $_SERVER['REQUEST_METHOD']);
    }
    if (($type = filter_input(INPUT_POST, "item_type", FILTER_VALIDATE_INT)) || $type === 0) {// I think we can do better than this
        $options = array(
            "options" => array(
                "min_range" => 1
            ),
            "flags" => FILTER_REQUIRE_ARRAY
        );
        switch ($type % 3) {
            case 0:
                $details = fetch_matching_cables($dbc, $options);
                break;
            case 1:
                $details = fetch_matching_ferrules($dbc, $options);
                break;
            case 2:
                $details = fetch_matching_clamps($dbc, $options);
                break;
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