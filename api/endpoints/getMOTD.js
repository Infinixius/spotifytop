import { APIResponse, APIError, Endpoint } from "../modules/api.js"
import { query } from "../modules/database/initalizeDatabase.js"
import os from "os"

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

function cpuAverage() {
	var totalIdle = 0, totalTick = 0
	var cpus = os.cpus()

	for(var i = 0, len = cpus.length; i < len; i++) {
		var cpu = cpus[i]

		for(const type in cpu.times) {
			totalTick += cpu.times[type]
		}     

		totalIdle += cpu.times.idle
	}

	return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length}
}

function getCPUsage(time = 100) {
	return new Promise((resolve, reject) => {
		var startMeasure = cpuAverage()
		setTimeout(() => {
			var endMeasure = cpuAverage() 

			//Calculate the difference in idle and total time between the measures
			var idleDifference = endMeasure.idle - startMeasure.idle
			var totalDifference = endMeasure.total - startMeasure.total

			//Calculate the average percentage CPU usage
			var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference)

			resolve(percentageCPU)
		}, time)
	})
}

function getMemoryUsage() {
	const memoryData = process.memoryUsage()
	const memoryUsage = {
		rss: `${formatMemoryUsage(memoryData.rss)}`,
		heapTotal: `${formatMemoryUsage(memoryData.heapTotal)}`,
		heapUsed: `${formatMemoryUsage(memoryData.heapUsed)}`,
		external: `${formatMemoryUsage(memoryData.external)}`,
	}

	return memoryUsage
}

function commaSeparateNumber(numb) {
    var str = numb.toString().split(".")
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return str.join(".")
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export default new Endpoint (
    "GET",
    "/getMOTD",
    {},

    async function (req, res, next) {
		var songcountraw = await query("SELECT reltuples FROM pg_class WHERE oid = 'public.songs'::regclass;")
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get counts"))
			})
		var artistcountraw = await query("SELECT reltuples FROM pg_class WHERE oid = 'public.artists'::regclass;")
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get counts"))
			})
        var albumcountraw = await query("SELECT reltuples FROM pg_class WHERE oid = 'public.albums'::regclass;")
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get counts"))
			})
		
		var total = await query("SELECT SUM(totalplays) FROM songs")
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get total plays"))
			})
		
		var totalSize = await query(`SELECT SUM(size) FROM (SELECT pg_total_relation_size('"' || table_schema || '"."' || table_name || '"') AS size FROM information_schema.tables) AS totalSize`)
			.catch(err => {
				Logger.error(`SQL query error: ${err}`)
				next(APIError(500, "Failed to get total plays"))
			})
		
		
		var artistCount = commaSeparateNumber(artistcountraw[0].reltuples)
		var albumCount = commaSeparateNumber(albumcountraw[0].reltuples)
		var songCount = commaSeparateNumber(songcountraw[0].reltuples)
		var totalCount = commaSeparateNumber(total[0].sum)

		var indexed = ((songcountraw[0].reltuples / 82000000) * 100).toFixed(3)

		var motd = `spotifytop's goal is to index every artist, album, and song on Spotify, and make the top ones easily accessible. So far, we have <b>${artistCount}</b> artists, <b>${albumCount}</b> albums, and <b>${songCount}</b> songs in our database. According to the database, there are <b>${totalCount}</b> total song plays on Spotify. According to Spotify's <a href="https://newsroom.spotify.com/company-info/">claimed statistics</a>, we have around <b>${indexed}%</b> of the songs on Spotify in our database. Currently <b>${formatBytes(totalSize[0].sum)}</b> of disk space is being used, and <b>${global.scrapesPerMinute}</b> artists are being indexed each minute.`
		
		next(APIResponse(200, motd))
    }
)