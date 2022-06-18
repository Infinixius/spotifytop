import { APIResponse, APIError, Endpoint } from "../modules/api.js"
import { query } from "../modules/database/initalizeDatabase.js"

export default new Endpoint (
    "GET",
    "/getAlbums",
    {},

    async function (req, res, next) {
        var albums = await query(`select distinct on (artistid,name,totalplays) artistname,id,artistid,name,totalplays,image,releasedate,lastupdated from albums order by totalplays desc limit ${config.queryRowsLimit}`)
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get albums"))
			})
		
		next(APIResponse(200, albums))
    }
)