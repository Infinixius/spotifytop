/*
	this file is used for importing the global variables Logger and Config.

	because of the way ES2016 modules work, attempting to import Logger and
	Config, assigning them to globals, then importing the modules that need
	them won't work because import statements execute before any code. 
	
	to solve this, we import this file that executes before any other
	import statements, fixing the issue.
*/

import config from "./config.json" assert {type: "json"}
import * as Logger from "./modules/logger.js"

// global variables can be used from any script
global.Logger = Logger
global.config = config