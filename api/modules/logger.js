import * as fs from "fs"
import config from "../config.json" assert {type: "json"}
import npmpackage from "../../package.json"assert {type: "json"}

// splash text

console.log("spotify-top v" + npmpackage.version)
console.log("Built with <3 by https://infinixi.us")
console.log("-----------------------")

// create "logs" directory if it doesn't exist

if (!fs.existsSync(config.logger.directory) && config.logger.enabled) {
	fs.mkdirSync(config.logger.directory)
}

// utility functions

export function timeStamp() {
	return new Date().toLocaleTimeString()
		.replace(/:/g,"-") // you can't have : in windows filenames
}

export function dateStamp() {
	return new Date().toLocaleDateString()
	.replace(/\//g, "-") // you can't have / in windows filenames
}

if (config.logger.enabled) {
	let name = config.logger.fileFormat
	name = name.replace("%time", timeStamp())
	name = name.replace("%date", dateStamp())
	
	var file = fs.createWriteStream(name, {flags: "a+"})
	file.write("spotify-top log file from "+timeStamp()+" - "+dateStamp()+"\n")
	file.write("-------------------------------------------------------------\n")
}

var lastMessage = ""
export function advlog(message, type) { // advanced logger function, use the ones below for ease of use
	if (!config.logger.enabled) return
	if (!config.logger[type]) return
	if (message == lastMessage) return

	if (!message.includes("/api/getMOTD")) {
		lastMessage = message
	}

	let log = config.logger.format

	log = log.replace("%time", timeStamp())
	log = log.replace("%date", dateStamp())
	log = log.replace("%type", type)
	log = log.replace("%TYPE", type.toUpperCase())
	log = log.replace("%message", message)

	if (!message.includes("/api/getMOTD")) {
		console.log(log)
	}
	file.write(log+"\n")
}

// these are self explanatory

export function log(message) {
	advlog(message, "info")
}

export function warn(message) {
	advlog(message, "warn")
}


export function error(message) {
	advlog(message, "error")
}

export function rawerror(error) {
	if (!config.logger.enabled) return
	if (!config.logger["error"]) return

	console.log(error)
	file.write(error+"\n")
	file.write(error.stack+"\n")
}

global.Logger = {
	log: log,
	warn: warn,
	error: error,
	rawerror: rawerror,
	advlog: advlog
}