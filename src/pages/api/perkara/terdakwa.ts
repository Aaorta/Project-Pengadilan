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
    INSERT INTO SUBJEK_HUKUM
    VALUES ('${body.Id_SubjekHukum}', '${body.Alamat}', '${body.Jenis}')
    
    IF '${body.Jenis}' = 'Perseorangan'
    BEGIN
        INSERT PERSEORANGAN
        VALUES ('${body.NIK}', '${body.Nama}', '${body.Id_SubjekHukum}')
    END

    IF '${body.Jenis}' = 'Badan Hukum'
    BEGIN
        INSERT INTO BADAN_HUKUM
        VALUES ('${body.NIB}', '${body.Nama}', '${body.Id_SubjekHukum}')
    END

    INSERT INTO TERDAKWA
    VALUES ('${body.Id_SubjekHukum}')

    INSERT INTO MENUNTUT
    VALUES ('${body.No_Perkara}',  '${body.Id_SubjekHukum}')

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
    DELETE FROM MENUNTUT WHERE Id_SubjekHukum = '${req.body.key}' 
    DELETE FROM TERDAKWA WHERE Id_SubjekHukum = '${req.body.key}' 
    DELETE FROM PERSEORANGAN WHERE Id_SubjekHukum = '${req.body.key}'
    DELETE FROM BADAN_HUKUM WHERE Id_SubjekHukum = '${req.body.key}'
    DELETE FROM SUBJEK_HUKUM WHERE Id_SubjekHukum = '${req.body.key}'
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

