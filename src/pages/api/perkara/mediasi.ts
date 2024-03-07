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
    INSERT INTO MEDIASI
    VALUES ('${body.No_Surat}', '${body.Nama_Mediator}', '${body.Hasil_Mediasi}', '${body.Tanggal_Mulai}', '${body.Tanggal_Hasil}', '${body.Status_Mediator}', '${body.No_Perkara}')
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
    await executeQuery(`
    DELETE FROM MEDIASI WHERE No_Surat = '${req.body.key}' 
    `)
  
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
    UPDATE MEDIASI
    SET
        No_Surat = '${body.new.No_Surat}',
        Nama_Mediator = '${body.new.Nama_Mediator}',
        Hasil_Mediasi = '${body.new.Hasil_Mediasi}',
        Tanggal_Mulai = '${body.new.Tanggal_Mulai}',
        Tanggal_Hasil = '${body.new.Tanggal_Hasil}',
        Status_Mediator = '${body.new.Status_Mediator}'
    WHERE
        No_Surat = '${body.original.No_Surat}' AND No_Perkara = '${body.original.No_Perkara}'
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

