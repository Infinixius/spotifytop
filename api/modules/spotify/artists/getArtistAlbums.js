import fetch from "node-fetch"
import scrape from "../../database/scrape.js"

export default function(artistID) {
	return new Promise(async (resolve, reject) => {
		const response = await fetch(`https://api.spotify.com/v1/artists/${artistID}/albums?limit=50&include_groups=single,album`, {
			method: "get",
			headers: {
				"Authorization": global.userAuthToken
			}
		}).catch(err => {
			return reject(err)
		})
		const data = await response.json()
			.catch(err => {
				return reject(err)
			})
		
		var albumIDs = []

		for (const album of data.items) {
			albumIDs.push(album.id)
			await scrape("album", album.id)
				.catch(err => { return Logger.error(`Scrape error: ${err}`) })
		}

		resolve(albumIDs)
	})
}