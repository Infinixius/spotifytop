import fs from "fs"
import pkg from "pg"
const { Pool, types } = pkg

const database = new Pool({
	user: global.config.postgres.user,
	host: global.config.postgres.host,
	database: global.config.postgres.database,
	password: global.config.postgres.password,
	port: global.config.postgres.port,
})

global.database = database

types.setTypeParser(types.builtins.TIMESTAMP, (value) => {
	return value
})

export function query(text, values) {
	return new Promise((resolve, reject) => {
		database.query(text, values)
			.then(res => {
				resolve(res.rows)
			})
			.catch(err => {
				reject(err)
			})
	})
}

const setupQueries = fs.readFileSync("./api/modules/database/initializeQueries.sql").toString().split("\n")
setupQueries.forEach(async (setupQuery) => {
	await query(setupQuery)
})