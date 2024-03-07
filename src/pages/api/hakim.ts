import { executeQuery } from '@/utils/db'
import { sendJson } from '@/utils/jsonResponse'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

const POST_REQUEST = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if(typeof req.body !== "object") {
    return sendJson(res, 400, "Bad Request", false)
  }
  const body = req.body

  try {
    await executeQuery(`
    INSERT INTO HAKIM
    VALUES
        ('${body.NIP}',  '${body.Nama}', '${body.Gol}', '${body.Id_Pengadilan}')`)
  
    return sendJson(res, 200, "OK", true)  
  } catch (error) {
    return sendJson(res, 400, (error as Error).message, true)  
  }
}

const DELETE_REQUEST = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if(typeof req.body !== "object") {
    return sendJson(res, 400, "Bad Request", false)
  }

  try {
    await executeQuery(`DELETE FROM HAKIM WHERE NIP = '${req.body.key}' `)
  
    return sendJson(res, 200, "OK", true)  
  } catch (error) {
    return sendJson(res, 400, (error as Error).message, true)  
  }
}

const GET_REQUEST = async  (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if(!req.query.no_perkara) {
    return sendJson(res, 400, "Bad Request", false)
  }
  
  try {
    const qResult = await executeQuery(`
    SELECT NIP, Nama
      FROM HAKIM
      WHERE Id_Pengadilan IN (
          SELECT Id_Pengadilan
          FROM PERKARA
          WHERE No_Perkara = '${req.query.no_perkara}'
      )`)

    const toSend = qResult.map((v) => ({ name: v.NIP, label: `${v.NIP} - ${v.Nama}` }))
  
    return sendJson(res, 200, toSend, true)  
  } catch (error) {
    return sendJson(res, 400, (error as Error).message, true)  
  }
}

const PATCH_REQUEST = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if(typeof req.body !== "object") {
    return sendJson(res, 400, "Bad Request", false)
  }
  const body = req.body
  
  try {
    await executeQuery(`
    UPDATE HAKIM
    SET
        NIP =   
        CASE
            WHEN '${body.new.NIP}' <> '' THEN '${body.new.NIP}'
            ELSE NIP
        END,
        Nama =
        CASE
            WHEN '${body.new.Nama}' <> '' THEN '${body.new.Nama}'
            ELSE NIP
        END,
        Gol =   
        CASE
            WHEN '${body.new.Gol}' <> '' THEN '${body.new.Gol}'
            ELSE Gol
        END,
        Id_Pengadilan =   
        CASE
            WHEN '${body.new.Id_Pengadilan}' <> '' THEN '${body.new.Id_Pengadilan}'
            ELSE Id_Pengadilan
        END
    WHERE
        NIP = '${body.original.NIP}'
    `)
  
    return sendJson(res, 200, "OK", true)  
  } catch (error) {
    return sendJson(res, 400, (error as Error).message, true)  
  }
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if(req.method==="POST") {
    return POST_REQUEST(req, res)
  } else if(req.method === "DELETE") {
    return DELETE_REQUEST(req, res)
  } else if (req.method === "GET") {
    return GET_REQUEST(req, res)
  }else if (req.method === "PATCH") {
    return PATCH_REQUEST(req, res)
  }
  return sendJson(res, 404, "Not Found", false)
}
