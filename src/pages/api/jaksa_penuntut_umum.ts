// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
    INSERT INTO JAKSA_PENUNTUN_UMUM
    VALUES
        ('${body.NIP}', '${body.Nama}', '${body.NoTelp}', '${body.Kejaksaan}')`)
  
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
    await executeQuery(`DELETE FROM JAKSA_PENUNTUN_UMUM WHERE NIP = '${req.body.key}' `)
  
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
    UPDATE JAKSA_PENUNTUN_UMUM
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
        NoTelp =   
        CASE
            WHEN '${body.new.NoTelp}' <> '' THEN '${body.new.NoTelp}'
            ELSE NoTelp
        END,
        Kejaksaan =   
        CASE
            WHEN '${body.new.Kejaksaan}' <> '' THEN '${body.new.Kejaksaan}'
            ELSE Kejaksaan
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
  } else if (req.method === "PATCH") {
    return PATCH_REQUEST(req, res)
  }
  return sendJson(res, 404, "Not Found", false)
}
