import { query } from "./initalizeDatabase.js"
import getArtistPlays from "../spotify/artists/getArtistPlays.js"

export default function(type, id) {
	if (!["song", "album", "artist"].includes(type)) return

	return new Promise((resolve, reject) => {
		query(`INSERT INTO scraped${type}s (id, indexed) VALUES ($1, false) ON CONFLICT (ID) DO NOTHING`, [id])
			.then(() => {
				resolve()
			})
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				reject(err)
			})
})
}

var beingIndexed = []
function scrapeArtist() {
	query("SELECT * FROM scrapedartists WHERE indexed = false LIMIT 1") // select first non-indexed artist
		.then(async (res) => {
			if (res.length == 0) return
			if (beingIndexed.includes(res[0].id)) return
			beingIndexed.push(res[0].id)
			latestScrapes.push({
				id: res[0].id,
				timestamp: Date.now()
			})

			Logger.log(`Scraping artist "${res[0].id}"`)
			if (res.length > 0) {
				await getArtistPlays(res[0].id)
					.then(() => {
						query("UPDATE scrapedartists SET indexed = true WHERE id = $1", [res[0].id])
							.then(() => {
								beingIndexed = beingIndexed.filter(item => item !== res[0].id)
							})
							.catch(err => {
								Logger.error(`SQL query error: ${err}`)
								reject(err)
							})
					})
					.catch(err => {
						Logger.error(`Failed to get artist plays! Error:`)
						Logger.rawerror(err)
					})
			}
		})
		.catch(err => {
			Logger.error(`SQL query error: ${err}`)
		})
}

var beingUpdated = []
function updateArtist() {
	query("SELECT * FROM artists ORDER BY lastupdated asc LIMIT 1") // select oldest-updated artist
		.then(async (res) => {
			if (res.length == 0) return
			if (beingUpdated.includes(res[0].id)) return
			beingUpdated.push(res[0].id)
			latestScrapes.push({
				id: res[0].id,
				timestamp: Date.now()
			})

			Logger.log(`Updating artist "${res[0].id}"`)
			if (res.length > 0) {
				await getArtistPlays(res[0].id, true)
					.catch(err => {
						Logger.error(`Failed to get artist plays! Error:`)
						Logger.rawerror(err)
					})
			}
		})
		.catch(err => {
			Logger.error(`SQL query error: ${err}`)
		})
}

var latestScrapes = []
global.scrapesPerMinute = 0
function calculateScrapesPerMinute() {
	latestScrapes = latestScrapes.filter(scrape => {return Date.now() - scrape.timestamp < 60000})
	global.scrapesPerMinute = latestScrapes.length
}

if (global.config.spotify.scrape_interval != -1) {
	setTimeout(() => {
		Logger.log("Starting to scrape artists")

		setInterval(() => {
			scrapeArtist()
			updateArtist()
			calculateScrapesPerMinute()
		}, global.config.spotify.scrape_interval)
	}, 5000)
}