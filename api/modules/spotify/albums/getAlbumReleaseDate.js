import fetch from "node-fetch"

export default function(albumID) {
	return new Promise(async (resolve, reject) => {
		const response = await fetch(`https://api.spotify.com/v1/albums/${albumID}`, {
			method: "get",
			headers: {
				"Authorization": global.userAuthToken
			}
		}).catch(err => {
			Logger.error(`Failed to get release date for album "${albumID}" Error:`)
			Logger.rawerror(err)
			resolve("N/A")
		})
		
		const data = await response.json()
			.catch(err => {
				Logger.error(`Failed to get release date for album "${albumID}" Error:`)
				Logger.rawerror(err)
				return resolve("N/A")
			})
		
		resolve(data.release_date)
	})
}