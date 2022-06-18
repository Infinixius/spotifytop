import { APIResponse, APIError, Endpoint } from "../modules/api.js"

export default new Endpoint (
    "GET",
    "/getBillboard",
    {},

    async function (req, res, next) {
		next(APIResponse(200, global.billboardData))
    }
)