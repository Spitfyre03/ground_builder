<?php
/**
 * Displays error message in browser with stack trace
 * NOT for use in production environment
 */
function dev_error_handler($errno, $errstr, $errfile, $errline, $errvars) {
	if (!(error_reporting() & $errno)) {
        // This error code is not included in error_reporting
        return;
    }
	$message = "An error occurred in script '$errfile' on line $errline:\nError: $errstr";
	$trace = jTraceEx(new \Exception($message), null, 2); // ignore first 2 lines caused by dummy exception
	// not live, show message in browser:
	echo '<div class="error">' . nl2br($message) . "<br>$trace</div>";
	return true; // Don't execute PHP internal error handler
}

/**
 * Displays exception message in browser with stack trace
 * NOT for use in production environment
 */
function dev_exception_handler(Exception $e) {
	$trace = jTraceEx($e);
	$msg = '<span class="error">' . nl2br($trace) . '</span>';
	die($msg);
}

/**
 * jTraceEx() - provide a Java style exception trace
 * @param $exception
 * @param $seen	array passed to recursive calls to accumulate trace lines already seen
 *				leave as NULL when calling this function
 * @param $ignore number of elements to ignore, if any
 * @return array of strings, one entry per trace line
 *
 * @author From comment by Ernest Vogelsinger at http://us2.php.net/manual/en/exception.gettraceasstring.php
 */
function jTraceEx(Exception $e, array $seen = null, $ignore = 0) {
	$starter = empty($seen) ? '' : 'Caused by: ';
	$result = array();
	if (empty($seen)) { $seen = array(); }
	$trace = $e->getTrace();
	$prev = $e->getPrevious();
	$result[] = sprintf('%s%s: %s', $starter, get_class($e), $e->getMessage());
	$file = $e->getFile();
	$line = $e->getLine();
	while (true) {
		$current = "$file:$line";
		if (is_array($seen) && in_array($current, $seen)) {
			$result[] = sprintf(' ... %d more', count($trace)+1);
			break;
		}
		if ($ignore > 0) {
			--$ignore;
		} else {
			$result[] = sprintf(' at %s%s%s(%s%s%s)',
				count($trace) && array_key_exists('class', $trace[0]) ? str_replace('\\', '.', $trace[0]['class']) : '',
				count($trace) && array_key_exists('class', $trace[0]) && array_key_exists('function', $trace[0]) ? '.' : '',
				count($trace) && array_key_exists('function', $trace[0]) ? str_replace('\\', '.', $trace[0]['function']) : '(main)',
				$line === null ? $file : basename($file),
				$line === null ? '' : ':',
				$line === null ? '' : $line);
			if (is_array($seen)) {
				$seen[] = "$file:$line";
			}
		}
		if (!count($trace)) {
			break;
		}
		$file = array_key_exists('file', $trace[0]) ? $trace[0]['file'] : 'Unknown Source';
		$line = array_key_exists('file', $trace[0]) && array_key_exists('line', $trace[0]) && $trace[0]['line'] ? $trace[0]['line'] : null;
		array_shift($trace);
	}
	$result = join("\n", $result);
	if ($prev) {
		$result .= "\n" . jTraceEx($prev, $seen, $ignore);
	}
	return $result;
}

/*
 * Trims white-space from the provided String
 * @param string	The string input to be cleaned
 * @param forHTML	If true, any special characters are handled in preparation for output to HTML
 * @return The cleaned string
 */
function cleanInput($string, $forHTML = true) {
	return trim(($forHTML ? htmlspecialchars($string, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'utf-8') : $string));
}

/**
 * Returns a properly escaped version of the $data provided
 * @param data Data to escape
 * @param dbc The database connection
 */
function escape_data($data, \mysqli $dbc) {
	if (get_magic_quotes_gpc()) {
		$data = stripslashes($data);
	}
	return $dbc->real_escape_string(trim($data));
}

/**
 * Fetches the results of a prepared statement as an array of associative
 * arrays such that each stored array is keyed by the result's column names.
 * @param stmt   Must have been successfully prepared and executed prior to calling this function
 * @param force_assoc If true, the result set will always be returned as an associative array, even if there is only one item
 * @param buffer Whether to buffer the result set; if true, results are freed at end of function
 * @return	1. A single value, e.g. 'Some Value' or an unkeyed array of single values if more than one row resulted and $force_assoc is false
 *			2. A single associative array if there is only one resulting row
 *			3. An array with one associative array per result row (empty array if no results)
 */
function fetch_assoc_stmt($stmt, $force_assoc = false, $buffer = true) {
	if ($buffer) {
		$stmt->store_result();
	}
	$fields = $stmt->result_metadata()->fetch_fields();
	$flag = (count($fields) === 1) && !$force_assoc; // no need to keep associative array if only one column selected
	$args = array();
	foreach ($fields as $field) {
		if ($flag) {
			$args[] = &$field->name; // this way the array key is also preserved
		} else {
			$key = str_replace(' ', '_', $field->name); // space may be valid SQL, but not PHP
			$args[$key] = &$field->name; // this way the array key is also preserved
		}
	}
	call_user_func_array(array($stmt, "bind_result"), $args);
	$results = array();
	$tmp = array();
	while ($stmt->fetch()) {
		$results[] = ($flag ? copy_value($args[0]) : array_map("copy_value", $args));
	}
	if ($buffer) {
		$stmt->free_result();
	}
	return (empty($results) || $force_assoc || count($results) > 1 ? $results : (is_array($results) ? $results[0] : $results));
}

/**
 * Returns a value by value rather than reference (useful for handling prepared statement result sets)
 */
function copy_value($v) {
	return $v;
}

/*
 * Returns the results of a SELECT query with specific condition(s)
 * @param dbc The database connection
 * @param fields The fields to select, either as a single string (e.g. 'id') or an array
 *					If an alias is provided, it will be used as the array key instead of the column's name
 * @param table The table on which to run the query
 * @param condition The column(s) to search, e.g. 'id' or array('id','value')
 * @param matches The value(s) against which the conditional column(s) is checked
 * @param types The data types of the value(s) for preparing the statement, e.g. 'i', 's', etc.
 * @param options Any extra options, as a single SQL string, such as 'LIMIT 1'
 * @param force_array if true, the return value will always be an array
 * @return	1. A single value, e.g. 'Some Value' or an unkeyed array of single values if more than one row resulted
 *			2. A single associative array if there is only one resulting row
 *			3. An array with one associative array per result row (empty array if no results)
 * CAUTION: Checking if the result is empty can return true for a result of 0, '0', NULL, etc.
 *			If one of those values is expected, be sure to check appropriately.
 */
function selectWithCondition(\mysqli $dbc, $fields, $table, $conditions, $matches, $types, $options='', $force_array = false) {
	if (count($conditions, true) !== strlen($types)) {
		throw new \RuntimeException("Conditions and types do not match");
	} elseif (count($conditions, true) !== count($matches, true)) {
		throw new \RuntimeException("Conditions and values do not match");
	}
	$table = escape_data($table, $dbc);
	// fields as a single string
	$num_vals = count($fields, true);
	if (is_array($fields)) {
		foreach ($fields as $k => $f) {
			$fields[$k] = escape_data($f, $dbc);
		}
		$select = implode(', ', $fields);
	} else {
		$select = escape_data($fields, $dbc);
	}
	// set up conditions
	if (is_array($conditions)) {
		foreach ($conditions as $k => $c) {
			$conditions[$k] = escape_data($c, $dbc);
		}
		$conditions = implode('=? AND ', $conditions);
	} else {
		$conditions = escape_data($conditions, $dbc);
	}
	$conditions = (empty($conditions) ? '' : "WHERE $conditions=?");
	$q = "SELECT $select FROM $table $conditions";
	if (!empty($options)) {
		$q .= ' ' . escape_data($options, $dbc);
	}
	$ret = false;
	$stmt = $dbc->prepare($q);
	if (!$stmt) {
		throw new \RuntimeException("Failed to prepare statement for query: $q");
	}
	$bound = bind_stmt_params($stmt, $types, $matches);
	if (!$bound || !$stmt->execute()) {
		throw new \RuntimeException("Database error: $stmt->errno - $stmt->error");
	}
	$ret = fetch_assoc_stmt($stmt);
	$stmt->close();
	return ($force_array ? (is_array($ret) ? $ret : array($ret)) : (count($ret) === 1 && is_array($ret) ? array_pop($ret) : $ret));
}

/**
 * Calls $stmt->bind_param with a variable number of arguments
 * @param string $arg_types single char identifier for each argument given, e.g. 'iis' for 2 int and 1 string
 * @param mixed  $args either a single argument or an array of arguments to pass to bind_param
 * @return result of $stmt->bind_param, i.e. true on success or false on failure
 */
function bind_stmt_params($stmt, $arg_types, $args) {
	if (empty($arg_types) && empty($args)) {
		return true; // nothing to bind
	}
	$args_to_bind = array();
	// hack for pass-by-reference requirement of call_user_func_array: create a new array
	$args_to_bind[] = &$arg_types;
	if (is_array($args)) {
		foreach ($args as &$value) {
			$args_to_bind[] = &$value;
		}
	} else {
		$args_to_bind[] = &$args;
	}
	return call_user_func_array(array($stmt, 'bind_param'), $args_to_bind);
}

/**
 * Returns an array of all matching results for a single column in a table, in ascending order.
 * NOTE: Be sure to escape user-entered variables before including them in any of the parameters.
 *
 * @param column	The column from which to create the array; may be prefixed by table alias.
 * @param table		The table to search in the format 'table', 'table t', or 'table AS t'
 * @param where		Optional condition, as a single string but without 'WHERE'
 * @param first		Optional first value to place in the array, e.g. 'N/A'; only added if array would otherwise have results
 * @return			(Possibly empty) array containing all values or
 *					(possibly empty) array where each element contains an array{'label'=>column, 'value'=>id_col}
 */
function getDataList(\mysqli $dbc, $column, $table, $where = '', $first = '') {
	$table = str_ireplace('as ', '', $table);
	$q = "SELECT $column FROM $table" . (empty($where) ? '' : " WHERE $where") . " ORDER BY $column ASC";
	$ret = array();
	if (($result = $dbc->query($q))) {
		if (!empty($first)) {
			$ret[] = $first;
		}
		$column = preg_replace('/^.*\./','',$column); // strip any prefixes
		while ($row = $result->fetch_assoc()) {
			$ret[] = $row[$column];
		}
		$result->close();
	}
	return $ret;
}

function getValuesFromGroup(\mysqli $dbc, $group) {
	$group_id = selectWithCondition($dbc, 'id', 'tag_groups', 'tag_groups.group', $group,'s');
	return getDataList($dbc, 'value', 'tag_values', "group_id=$group_id");
}

function getItemsFromGroupAndValue(\mysqli $dbc, $value, $group) {
	$group_id = selectWithCondition($dbc,'id','tag_groups','tag_groups.group',$group,'s');
	$tag_id = selectWithCondition($dbc,'id','tag_values',array('value','group_id'),array($value,$group_id),'si');
	return getDataList($dbc, 'item_id', 'tag_assign', "tag_id=$tag_id");
}
?>
