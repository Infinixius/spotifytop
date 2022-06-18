function updateData() {
	$.ajax({url: "/spotifytop/getMOTD", success: (result) => {
		$("#motd").html(result.result)
	}})
}

setInterval(() => {
	updateData()
}, 5000)

updateData()