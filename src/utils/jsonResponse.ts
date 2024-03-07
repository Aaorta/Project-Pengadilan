import { NextApiResponse } from "next";

export function sendJson(res: NextApiResponse<any>, status: number, msg: any, success: boolean) {
     return res.status(status).json({
          success,
          message: msg,
          status
     })
}