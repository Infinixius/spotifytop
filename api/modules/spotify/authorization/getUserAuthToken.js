import fetch from "node-fetch"

export default function() {
	return new Promise(async (resolve, reject) => {
		const response = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", {
			method: "get",
			headers: {
				"Cookie": global.config.spotify.usercookie
			}
		}).catch(err => {
			return reject(err)
		})
		const data = await response.json()
			.catch(err => {
				return reject(err)
			})
		resolve(`Bearer ${data.accessToken}`)
	})
}