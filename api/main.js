import "./init.js"

import express from "express"
import "./modules/database/initalizeDatabase.js"
import "./modules/spotify/initalizeSpotify.js"
import "./modules/database/scrape.js"
import "./modules/extra/billboard.js"

import { APIError, getEndpoints } from "./modules/api.js"

const app = express()
const endpoints = await getEndpoints()

app.get("*", (req, res, next) => {
	req.IP = req.ips[req.ips.length - 1] || req.ip // weird way of getting the client's ip behind a reverse proxy, because X-Forwarded-For can be spoofed by the client if only req.ip is used
	req.timestamp = Date.now() // used to track how long the request took

	Logger.log(`IP "${req.IP}" requested "${req.url}"`)
	next()
})

app.use(config.webpathPublic, express.static(config.webpath))

for (const endpoint of endpoints) {
	app[endpoint.method](endpoint.path, endpoint.callback)
}

/* 404 errors */
app.all("*", (req, res, next) => {
	return next(APIError(404, `The path ${req.url} could not be found or resolved!`))
})

/* error handler */
app.use((err, req, res, next) => {
	if (err.error) {
		res.statusCode = err.status ?? 500
	
		if (err.stack) { // this is a nodejs error
			Logger.error(`IP "${req.IP}" requesting "${req.url}" failed because of an internal Node.JS error! Error:`)
			Logger.error(err.stack)
			res.json(APIError(500, "Internal NodeJS Error"))
		} else {
			err.processingTime = Date.now() - req.timestamp
			Logger.warn(`IP "${req.IP}" requesting "${req.url}" failed with status ${err.status}, message: "${err.msg}"`)
			res.json(err)
		}
	} else {
		err.processingTime = Date.now() - req.timestamp
		res.json(err)
	}
})

app.listen(global.config.port, () => {
	Logger.log(`Listening on port ${global.config.port}`)
	if (config.dev) {
		Logger.warn("Developer mode is enabled!!!")
	}
	console.log("-----------------------")
})

process.on("unhandledRejection", (reason, promise) => {
	Logger.error(`Unhandled promise rejection at ${promise}! Reason: ${reason}`)
})
process.on("uncaughtException", (err, origin) => {
	Logger.error(`Uncaught exception! Error: ${err} Origin: ${err}`)
})
process.on("exit", (code) => {
	Logger.log(`Exiting with code ${code}`)
})