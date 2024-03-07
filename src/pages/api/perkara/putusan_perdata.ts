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
    INSERT INTO PUTUSAN_PERDATA
    VALUES
        ('${body.No_Putusan}',  '${body.Tanggal_Putusan}', '${body.Nilai_Ganti}', '${body.Amar_Putusan}', '${body.Verstek}', '${body.Status_Putusan}', '${body.Tanggal_Minustasi}', '${body.Sumber_Hukum}', '${body.No_Perkara}')`)
  
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
    await executeQuery(`DELETE FROM PUTUSAN_PERDATA WHERE No_Putusan = '${req.body.key}' `)
  
    return sendJson(res, 200, "OK", true)  
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
    UPDATE PUTUSAN_PERDATA
    SET
        No_Putusan = '${body.new.No_Putusan}',
        Tanggal_Putusan = '${body.new.Tanggal_Putusan}',
        Nilai_Ganti = '${body.new.Nilai_Ganti}',
        Amar_Putusan = '${body.new.Amar_Putusan}',
        Verstek = '${body.new.Verstek}',
        Status_Putusan = '${body.new.Status_Putusan}',
        Tanggal_Minustasi = '${body.new.Tanggal_Minustasi}',
        Sumber_Hukum = '${body.new.Sumber_Hukum}'
    WHERE
        No_Putusan = '${body.original.No_Putusan}' AND No_Perkara = '${body.original.No_Perkara}'
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
  } else if (req.method === "PATCH") {
    return PATCH_REQUEST(req, res)
  }
  return sendJson(res, 404, "Not Found", false)
}

