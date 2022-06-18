import { APIResponse, APIError, Endpoint } from "../modules/api.js"
import { query } from "../modules/database/initalizeDatabase.js"

export default new Endpoint (
    "GET",
    "/getSongs",
    {},

    async function (req, res, next) {
        var songs = await query(`select distinct on (name,artistname,totalplays) name,id,artistid,artistname,totalplays,image,lastupdated from songs where totalplays > 1 order by totalplays desc limit ${config.queryRowsLimit}`)
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get songs"))
			})
		
		next(APIResponse(200, songs))
    }
)