// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { executeQuery } from '@/utils/db'
import { sendJson } from '@/utils/jsonResponse'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if(req.method!=="GET") {
    return sendJson(res, 404, "Not Found", false)
  } 
  
  const yes = await executeQuery(`SELECT Id_Pengadilan, Nama_Pengadilan FROM PENGADILAN`)
  const tosend = yes.map((v: any) => ({
      label: `${v.Id_Pengadilan} - ${v.Nama_Pengadilan}`,
      name: v.Id_Pengadilan
  }))
  return sendJson(res, 200, tosend, true)
}
