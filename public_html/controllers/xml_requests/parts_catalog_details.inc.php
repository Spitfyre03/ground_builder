<?php
/**
REQUIRES ($_POST)
part_number Full part number of the part for which details will be returned

OPTIONAL
part_manufacturer Used to break ties if specified

OUTPUT
JSON Array:
[
	'id'
	'part_number'
	'manufacturer'
	'manufacturer_id'
	'description'
	'error'             => error message to be displayed, if any
	'warning'			=> warning to be displayed, if any
	'manufacturer_list' => if part number is ambiguous, this is the list of manufacturers for it as a string <option>manufacturer</option>
]
*/
/** Returns true if the database entry does not have a manufacturer specified */
function isNullManufacturer($row) {
	return empty($row['manufacturer']);
}
/** Returns true if the database entry has a manufacturer specified */
function isValidManufacturer($row) {
	return !empty($row['manufacturer']);
}
/**
 * Returns the array with all elements made suitable for HTML display
 */
function cleanArray($array) {
	$clean = array();
	foreach ($array as $k => $v) {
		$clean[$k] = str_replace('&amp;', '&', cleanInput($v));
	}
	return $clean;
}
/**
 * Determines which parts entry to use from the provided arrays of parts entries
 * @param $list Array of parts entries with valid manufacturers
 * @param $null Array of parts entries with null manufacturers
 * @return false if no usable entry found or multiple valid entries found
 */
function parseResults($list = array(), $null = array()) {
	$list_count = count($list);
	$null_count = count($null);
	if ($list_count === 1) {
		return array_pop($list);
	} elseif ($null_count > 0 && $list_count < 1) {
		return array_pop($null);
	} else {
		return false;
	}
}
/**
 * Fetches details about any matching part(s), populates the manufacturer
 * dropdown list, and generates warnings and/or errors.
 */
function fetchPartDetails($dbc, $table, $part_number, $manufacturer) {
	$details = array();
	if (empty($manufacturer)) {
		$q = "SELECT p.*, m.name AS manufacturer FROM `$table` p LEFT JOIN manufacturers m ON m.id=p.manufacturer_id WHERE p.part_number=? GROUP BY p.part_number, m.id, p.description";
	} else {
		$q = "SELECT p.*, m.name AS manufacturer FROM `$table` p JOIN manufacturers m ON m.id=p.manufacturer_id WHERE p.part_number=? AND m.name=? LIMIT 1";
	}
	$stmt = $dbc->prepare($q);
	if (!(empty($manufacturer) ? $stmt->bind_param('s', $part_number) : $stmt->bind_param('ss', $part_number, $manufacturer)) || !$stmt->execute()) {
		throw new \RuntimeException("Database error: $stmt->errno - $stmt->error");
	}
	$rows = fetch_assoc_stmt($stmt, true);
	$stmt->close();
	if (!empty($rows) && count($rows) === 1) {
		$details = cleanArray(array_pop($rows));
	} elseif (!empty($rows)) {
		// Only possible when manufacturer was not specified
		$list = array_filter($rows, 'isValidManufacturer');
		$null = array_filter($rows, 'isNullManufacturer');
		$parsed = parseResults($list, $null);
		if ($parsed) {
			// Only one of the manufacturers was non-null; use it
			$details = cleanArray($parsed);
		} else {
			$details['error'] = '<br>* Multiple matches: please select a manufacturer';
			$manufacturers = array_merge(empty($null) ? array() : array('N/A'), cleanArray(array_column($list, 'manufacturer')));
			$details['description'] = '';
		}
	} elseif (empty($manufacturer)) {
		// No manufacturer specified and no results found for the part number
		$details['description'] = '';
		$details['warning'] = 'This part number is not in the database; please make sure it is correct';
	} else {
		// No matches - try again but ignore manufacturer parameter
		$details['description'] = '';
		$q = "SELECT p.*, m.name AS manufacturer FROM `$table` p LEFT JOIN manufacturers m ON m.id=p.manufacturer_id WHERE p.part_number=? GROUP BY p.part_number, m.id, p.description";
		$stmt = $dbc->prepare($q);
		if (!$stmt->bind_param('s', $part_number) || !$stmt->execute()) {
			throw new \RuntimeException("Database error: $stmt->errno - $stmt->error");
		}
		$rows = fetch_assoc_stmt($stmt, true);
		$stmt->close();
		if (empty($rows)) {
			// Part number does not exist
			$details['warning'] = 'This part number is not in the database; please make sure it is correct';
		} elseif (count($rows) === 1) {
			// Part number exists but has a different manufacturer than the one specified
			$details = cleanArray(array_pop($rows));
			$oem = (empty($details['manufacturer']) ? 'N/A' : $details['manufacturer']);
			$details['warning'] = "Part on record indicates $oem as the manufacturer";
		} else {
			// Part number exists and has multiple manufacturer options, just not the one specified
			$list = array_filter($rows, 'isValidManufacturer');
			$null = array_filter($rows, 'isNullManufacturer');
			$parsed = parseResults($list, $null);
			if ($parsed) {
				// Only one of the manufacturers was non-null; use it
				$details = cleanArray($parsed);
				$oem = (empty($details['manufacturer']) ? 'N/A' : $details['manufacturer']);
				$details['warning'] = "Part on record indicates $oem as the manufacturer";
			} else {
				$details['warning'] = 'This part number is associated with multiple manufacturers, but not the one entered; please make sure it is correct';
				$manufacturers = array_merge(empty($null) ? array() : array('N/A'), cleanArray(array_column($list, 'manufacturer')));
				$details['description'] = '';
			}
		}
	}
	// Get default manufacturer list if it hasn't been built yet
	if (!empty($manufacturers)) {
		$details['manufacturer_list'] = '<select><option>' . implode('</option><option>', $manufacturers) . '</option></select>';
	}
	return $details;
}
$details = array();
try {
	if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		throw new \RuntimeException("Expected request via POST; received via " . $_SERVER['REQUEST_METHOD']);
	}
	$part_number = filterRequiredInput(INPUT_POST, 'part_number');
	$manufacturer = filter_input(INPUT_POST, 'part_manufacturer');
	if (strcasecmp($manufacturer, 'N/A') === 0) {
		$manufacturer = null;
	}
	$details = fetchPartDetails($dbc, 'inventory_catalog', $part_number, $manufacturer);
	// Try parts catalog if no part found and it wasn't because of an ambiguous match
	if (empty($details['id']) && empty($details['manufacturer_list'])) {
		$alternate = fetchPartDetails($dbc, 'parts_catalog', $part_number, $manufacturer);
		if (!empty($alternate['id'])) {
			$details = $alternate;
		}
	}
} catch (\Exception $e) {
	// logException($e);
}
echo json_encode($details);
