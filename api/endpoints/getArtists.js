import { APIResponse, APIError, Endpoint } from "../modules/api.js"
import { query } from "../modules/database/initalizeDatabase.js"

export default new Endpoint (
    "GET",
    "/getArtists",
    {},

    async function (req, res, next) {
        var artists = await query(`select name,id,name,monthlyplays,totalplays,chartposition,image,lastupdated from artists order by monthlyplays desc limit ${config.queryRowsLimit}`)
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get artists"))
			})
		
		next(APIResponse(200, artists))
    }
)