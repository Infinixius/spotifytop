import fetch from "node-fetch"

export default function() {
	return new Promise(async (resolve, reject) => {
		const response = await fetch("https://accounts.spotify.com/api/token?grant_type=client_credentials", {
			method: "post",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": "Basic " + (Buffer.from(global.config.spotify.clientid + ":" + global.config.spotify.clientsecret).toString("base64"))
			}
		}).catch(err => {
			return reject(err)
		})
		const data = await response.json()
			.catch(err => {
				return reject(err)
			})

		if (data.error == "invalid_client") {
			Logger.error(`Unable to get Spotify app auth token! Error: invalid_client`)
			process.exit(1)
		}
		
		resolve(`${data.token_type} ${data.access_token}`)
	})
}