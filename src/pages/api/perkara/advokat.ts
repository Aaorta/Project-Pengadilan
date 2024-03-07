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
    INSERT INTO ADVOKAT
    VALUES ('${body.NIA}', '${body.Nama}', '${body.Nama_Instansi}', '${body.NoTelp}')
    INSERT INTO MEREPRESENTASIKAN
    VALUES ('${body.NIA}', '${body.Id_SubjekHukum}')
    `)
  
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
    await executeQuery(`DELETE FROM MEREPRESENTASIKAN WHERE NIA = '${req.body.key}' `)
  
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
    SELECT Id_SubjekHukum
    FROM MENUNTUT
    WHERE No_Perkara = '${req.query.no_perkara}'
    UNION
    SELECT Id_SubjekHukum
    FROM DIAJUKAN
    WHERE No_Perkara = '${req.query.no_perkara}'
    UNION
    SELECT Id_SubjekHukum
    FROM DIGUGAT
    WHERE No_Perkara = '${req.query.no_perkara}' `)

    const toSend = qResult.map((v) => ({ name: v.Id_SubjekHukum, label: v.Id_SubjekHukum }))
  
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
    UPDATE ADVOKAT
    SET
        NIA = '${body.new.NIA}',
        Nama = '${body.new.Nama}',
        Nama_Instansi = '${body.new.Nama_Instansi}',
        NoTelp = '${body.new.NoTelp}'
    WHERE
        NIA = '${body.original.NIA}'

    UPDATE MEREPRESENTASIKAN
    SET
      NIA = '${body.new.NIA}',
      Id_SubjekHukum = '${body.new.Id_SubjekHukum}'
    WHERE
        NIA = '${body.original.NIA}'

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
  } else if (req.method === "PATCH") {
    return PATCH_REQUEST(req, res)
  }
  return sendJson(res, 404, "Not Found", false)
}
