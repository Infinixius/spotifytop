$("#toggleDarkMode").click(() => {
	document.getElementById("darkMode").disabled = !document.getElementById("darkMode").disabled

	if (document.getElementById("darkMode").disabled) {
		document.cookie = document.cookie.replace("&darkmode=true", "")
	} else {
		document.cookie += "&darkmode=true"
	}
})

document.getElementById("darkMode").disabled = !document.cookie.includes("&darkmode=true")