CABLE QUOTING INTERFACE

GOAL
Design a web interface in which users can select various cable component options to receive a price quote.

OVERVIEW
We custom build cables used in high-voltage applications such as power line and substation work. There are two types of cable: grounding cables and jumper cables. Jumper cables have an insulated jacket with a specific KV rating whereas grounding cables have a non-insulated jacket.

Both cable types come in a variety of standard American Wire Gauge (AWG) diameters, the most common of which in our field are #2, 1/0, 2/0, and 4/0. Several jacket colors are also available.

Each end of each cable is terminated with a ferrule that is crimped on, providing an attachment point for clamps or a block. The most common ferrules have either a threaded end for a screw-on type clamp or a smooth pin ("plug") for clamps that slide on. Each end of the cable may have a different ferrule and a different clamp, as well as a ferrule without any clamp. There will always be at least a ferrule.

Most cables are just a single cable, i.e. only two ends, but there are also cable clusters that have four cables all attached to a central block. All four of these cables have two ferrules, one of which attaches to the block and the other of which may attach to a clamp. The four ferrules attaching to the block are always the same, but the other four ends may all use different ferrules and/or clamps and each of the cables connected to the block may be a different length.

SETUP
1. Install WAMP v2.5 to e.g. C:/wamp (https://sourceforge.net/projects/wampserver/files/WampServer%202/Wampserver%202.5/)
2. Install Git (https://git-scm.com/downloads)
3. Create empty project folder e.g. C:/wamp/www/git/ground_builder
4. Run `git init` in the empty project folder
5. Copy project to e.g. C:/wamp/www/git/ground_builder
6. Create initial commit with all starting files
7. Open MySQL console (accessible via WAMP system tray icon)
8. Run command in MySQL console: source /path/to/project/db_setup.sql;
9. Ready to code!
	a. Freely add or modify files in /controllers and /view; avoid modifications to other files if possible
	b. Database will need modifications - please retain all SQL commands required to transform starting schema to final version in ground_builder/db_update.sql
	c. XMLHttpRequest framework is already set up (but not tested in this context) with a few hopefully helpful examples
	d. Don't hesitate to contact me with any questions

REQUIREMENTS
In order to successfully quote a cable, we need to know the part number and manufacturer of each component so that we can look up price and availability from the `inventory_catalog` table. A typical customer request may be for something like a 10' 2/0 Clear Ground w/a Large Threaded C-Clamp on one end and a Large Threaded Duckbill clamp on the other; we need a way to take that information and turn it into possible part numbers for each component.

This will be done by selecting various options for each component and using the selected criteria to find matching `inventory_catalog` entries. For example, selecting a clamp with
	options={style:C-Clamp, connection_type:Threaded, size:Large, kv_rating:null}
should include at least the following clamps in the result:
	Chance C6002256 - 2" Aluminum C-Clamp, Serrated Jaw, Threaded - $87.55 each, 8 in stock
	Hastings 10375  - 2" Aluminum C-Clamp, Serrated Jaw, Threaded - $90.61 each, 0 in stock

Note that the database does not yet support adding tags to items; this will need to be added. See the Database section below for more information.

Users should be able to directly input the part number and manufacturer for each component if they know it as well as select options from a set of lists to determine a suitable product. Entering a known part number should auto-select the appropriate options whereas selecting all required options should populate a list of suitable part numbers.

The following information is required for each component:

	1. Cable information:
			Note that a-e will be required to match an `inventory_catalog` entry
			Cable inventory levels are tracked per foot, so length is needed only to calculate price.
		a. Ground or Jumper
		b. Standard or Cluster
		c. AWG: #2, 1/0, 2/0, or 4/0
		d. Jacket Color: Clear, Yellow, Orange, Red, Black, Green, Blue
		e. Jacket KV: null (all grounds), 5, 15, 25, 35 (non-null kv rating required for jumpers)
		f. Length: length in feet, any positive integer (usually 100 or less)
		g. Phase Length: same as length but for the 3 phases on a cluster cable
		
	2. Ferrule information for each end of each cable (2 standard, 8 cluster [4 of which are already known]):
			Note that a-d will be required to match an `inventory_catalog` entry
		a. Connection type: Threaded or Pin
		b. Unshrouded or Shrouded
		c. Standard or Elbow* ferrule
			* Elbow ferrules are required for any end with an Elbow "clamp" and incompatible with any other clamp type except null
		d. Copper or Tin-Plated
		
		Default ferrule options should be: standard threaded unshrouded copper

	3. Clamp information for each terminating end of each cable (2 standard, 4 cluster)
			Note that a cable end may be terminated with a ferrule only (i.e. no clamp)
			Note that a-d will be required to match an `inventory_catalog` entry;
				additional options may be used to narrow the results.
		a. Style:
			Ferrule Only - no clamp, so no need to specify any other options
			C-Clamp - size Small or Large
			Duckbill - size Small or Large
			Flat Face - size Small or Large
			Elbow - size Small or Large; requires an Elbow-type ferrule and a kV rating; threaded only
			Ball Stud - size Regular only
			Tower - size Regular only
			Parrot Bill - size Regular only
			Spiking Clamp - size Regular only
			Cabinet Bushing - size Regular only; requires a kV rating
			All-Angle - size Regular only; Mitten or Finger style
			Insulated Jumper - size Regular only; requires a kV rating
			Other - user must specify part number and manufacturer; does not need to select any other options
		b. Connection Type: Threaded or Pin (MUST match the ferrule paired with this clamp)
		c. Size: Small | Regular | Large - options depend on selected style
			Size is a shorthand tag / filter for Main Line Range (Max and Min), since the main line ranges
			have fairly arbitrary values that defy easy categorization. Some examples:
				2-1/2 IPS (2.88")
				4" x 4" Square 4.5" O.D. Bus
				#4 Str. Cu. (0.232")
				1.033 MCM ASCR 1.25 Diameter
		d. KV Rating: null | 5 | 15 | 25 | 35 - only null allowed unless otherwise specified by style option
		e. Mechanism: Eye Screw | T-Handle | Bayonet
		f. Strain Relief: boolean
		g. Jaw: Smooth | Serrated
		h. ASTM Designation e.g. Type (I-III) Class (A-B) Grade (2-6)
		i. Material: Aluminum | Bronze

	4. Cable Shrink is used to further attach each ferrule to the cable; 1 required per ferrule
		Standard shrink that we use is:
			Inventory Catalog ID: 188530
			Manufacturer: Tyco
			Part Number : Cable Shrink
			Price: $4.50 each
	
	5. Aluminum Block (1) is required for all cluster-type cables
	
		Part number not yet in database, but they are $45.00 each

	6. Labor - no part number, $20.00 for standard cables, $80.00 for clusters

The reason for requiring certain option selections is so that we can handle requests for which the part number is either unknown, not yet in our database, or not yet tagged with the appropriate cable component classifications. In such cases, we should be able to save all the selected options and have a specialist respond to the quote request. If a part number does exist and is tagged, then selecting options provides another layer of validation for the end user to ensure they are getting what they need.

DATABASE REQUIREMENTS
Add support for an arbitrary number of tags or options to be assigned to each `inventory_catalog` entry. These tags should provide an easy way to filter results, so a JSON-encoded text field in the inventory catalog table is not exactly ideal. Tags / options should be members of a group from which only one should typically be applicable to an item, though this does not need to be explicitly enforced as part of this project.

Example relationship structure:

	tag_groups
	tag_values >- tag_groups
	tag_assign >- inventory_catalog
	tag_assign >- tag_values

e.g.:

	tag_group (1, 'AWG'),(2, 'Jacket Color'),...
	tag_values (1, 1, '#2'),(2, 1, '1/0'),(3, 1, '2/0'),(4, 1, '4/0'),(5, 2, 'Clear'), (6, 2, 'Yellow'),...
	tag_assign (n, item_id:129854 [Trystar 2/0 Clear Ground Cable], value_id: 3),(n+1, item_id:129854 [Trystar 2/0 Clear Ground Cable], value_id: 5),...

Consider that tag values may be added in any arbitrary order but that we may wish to be able to display them with specific ordering. For example, if we later add #1 wire to AWG, we will want it to display after #2 but before 1/0. Suggest a `priority` column in `tag_values` to allow for this.

It should then be possible to simplify the database schema by removing tables made redundant by tags, e.g. `elbow_clamp_kvs` and `jacket_kvs` could both be replaced by a 'KV Rating' tag group with appropriate tag value entries.

Sample query to select all products matching certain criteria:

SELECT i.`part_number`, m.`name` AS `manufacturer`, i.`price`  
	FROM `inventory_catalog` i 
	LEFT JOIN `tag_assign` a ON a.`item_id`=i.`id` 
	LEFT JOIN `tag_values` v ON v.`id`=a.`value_id` 
	LEFT JOIN `tag_groups` g ON g.`id`=v.`group_id` 
	WHERE g.`name` IN ('AWG', 'Jacket Color') AND v.`name` IN ('2/0', 'Clear') 
	GROUP BY i.`id`;

INTERFACE REQUIREMENTS
Use XMLHttpRequest via JavaScript to retrieve information from the server, e.g. when checking for items matching the currently selected options.

All components:
	* All required options for each component must be on the page
	* Non-required options do not need to be displayed unless they become required;
		for example kV rating for clamps is only available for certain clamp styles
		and must therefore be dispayed for at least those clamp styles, whereas ASTM
		Designation is not required ever and doesn't need to be a selectable option
		at this time (though it should be an available tag we can apply and filter on).
	* Add fields for part number, manufacturer, price, and current stock
	* Part number field should have a datalist that is populated with entries from the server that
	  match the currently selected options. Choosing a part number from this list should auto-fill
	  the remaining fields without making another request to the server.
		- Ideally, the manufacturer, price and stock level will be displayed in the drop-down
		- If other tags (e.g. Main Line Max and Main Line Min) are available, it would be very
		handy to have these displayed when hovering over an entry (i.e. title attribute)
	* User should also be able to input data directly into the fields; doing so with a part number
	  (and manufacturer if part number is ambiguous) should auto-select options where possible based
	  on the inventory catalog entry's tags
	* Invalid combinations should be indicated as such if selected; even better if the possible
	  options change based on previous selections such that no invalid selections are available

Cable:
	* Split phase length input into 3 so a cluster can have varying phase lengths
		- main input value should be copied into other 2 if they are empty for ease of use

Ferrules:
	* Need to be added to the form

Clamps:
	* Each clamp needs to be paired with a ferrule
	* Renaming the clamp groups to 'Terminating End {1-4}' with each group requiring
	  a ferrule and optionally a clamp to be selected could be a viable display option

Total Price:
	* Update via JS as components are selected or changed
	* Price = 
		quantity x (
			(Cable price x length) 
			+ price of each ferrule 
			+ price of each clamp 
			+ (price of cable shrink x number of ferrules) 
			+ labor charge ($20 or $80)
			+ $45.00 for aluminum block if cluster cable
		)
