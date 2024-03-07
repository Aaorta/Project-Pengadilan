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
    INSERT INTO PERKARA
    VALUES
        ('${body.No_Perkara}', '${body.Klasifikasi_Perkara}', '${body.Tanggal_Register}', '${body.Jenis}', '${body.Id_Pengadilan}')`)
  
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
    await executeQuery(`DELETE FROM PERKARA WHERE No_Perkara = '${req.body.key}' `)
  
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
    UPDATE PERKARA
    SET
      No_Perkara =   
        CASE
            WHEN '${body.new.No_Perkara}' <> '' THEN '${body.new.No_Perkara}'
            ELSE No_Perkara
        END,
        Klasifikasi_Perkara =
        CASE
            WHEN '${body.new.Klasifikasi_Perkara}' <> '' THEN '${body.new.Klasifikasi_Perkara}'
            ELSE Klasifikasi_Perkara
        END,
        Tanggal_Register =   
        CASE
            WHEN '${body.new.Tanggal_Register}' <> '' THEN '${body.new.Tanggal_Register}'
            ELSE Tanggal_Register
        END,
        Jenis =   
        CASE
            WHEN '${body.new.Jenis}' <> '' THEN '${body.new.Jenis}'
            ELSE Jenis
        END,
        Id_Pengadilan =   
        CASE
            WHEN '${body.new.Id_Pengadilan}' <> '' THEN '${body.new.Id_Pengadilan}'
            ELSE Id_Pengadilan
        END
    WHERE
        No_Perkara = '${body.original.No_Perkara}'
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

