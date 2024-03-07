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
  
  const yes = await executeQuery(`SELECT NIP, Nama FROM JAKSA_PENUNTUN_UMUM`)
  const toSend = yes.map((v) => ({ name: v.NIP, label: `${v.NIP} - ${v.Nama}` }))
  return sendJson(res, 200, toSend, true)
}
