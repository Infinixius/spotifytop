import fs from "fs"

export function APIError(status, msg) { // returns an error that can be easily passed to express' next()
	return {
		"status": status,
		"error": true,
		"processingTime": 0,
		"timestamp": Date.now(),
		"msg": msg
	}
}

export function APIResponse(status, result) {
	return {
		"status": status,
		"error": false,
		"processingTime": 0,
		"timestamp": Date.now(),
		"result": result
	}
}

export class Endpoint {
    constructor (method, path, options, callback) {
        this.method = method.toLowerCase()
        this.path = `/${config.apipath}${path}`
		this.options = options
        this.callback = callback
    }
}

export async function getEndpoints() {
    return new Promise(async (resolve, reject) => {
        const files = fs.readdirSync("./api/endpoints").filter(file => file.endsWith(".js"))
        var endpoints = []
        var loadedModules = 0 // used to track the amount of modules loaded

        for (const file of files) {
            import(`../endpoints/${file}`).then(module => {
                loadedModules++
                let endpoint = module.default

                endpoints.push(endpoint)

                if (loadedModules >= files.length) {
                    resolve(endpoints)
                }
            })
        }
    })
}