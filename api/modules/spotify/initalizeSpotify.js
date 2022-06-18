import getUserAuthToken from "./authorization/getUserAuthToken.js"
import getAppAuthToken from "./authorization/getAppAuthToken.js"

var sent = false
async function updateTokens() {
	var userAuthNG = await getUserAuthToken().catch(err => {
		Logger.warn(`Failed to get Spotify user token! Error: ${err}`)
	})
	var appAuthNG = await getAppAuthToken().catch(err => {
		Logger.warn(`Failed to get Spotify app token! Error: ${err}`)
	})

	global.userAuthToken = userAuthNG
	global.appAuthToken = appAuthNG

	if (config.dev && sent == false) {
		sent = true
		Logger.log(`[DEV MODE] AppAuth: "${global.appAuthToken}" UserAuth: "${global.userAuthToken}`)
	}
}

setInterval(() => {
	updateTokens()
}, global.config.spotify.token_reset_interval)

updateTokens()