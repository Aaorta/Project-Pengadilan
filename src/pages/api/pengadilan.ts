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
    INSERT INTO PENGADILAN
    VALUES
        ('${body.Id_Pengadilan}', '${body.Nama_Pengadilan}', '${body.Alamat_Pengadilan}', '${body.Kota_Pengadilan}', '${body.Tingkatan}', '${body.Notelp_Pengadilan}')`)
  
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
    await executeQuery(`DELETE FROM PENGADILAN WHERE Id_Pengadilan = '${req.body.key}' `)
  
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
    UPDATE PENGADILAN
    SET
      Id_Pengadilan =   
        CASE
            WHEN '${body.new.Id_Pengadilan}' <> '' THEN '${body.new.Id_Pengadilan}'
            ELSE Id_Pengadilan
        END,
        Nama_Pengadilan =
        CASE
            WHEN '${body.new.Nama_Pengadilan}' <> '' THEN '${body.new.Nama_Pengadilan}'
            ELSE Nama_Pengadilan
        END,
        Alamat_Pengadilan =   
        CASE
            WHEN '${body.new.Alamat_Pengadilan}' <> '' THEN '${body.new.Alamat_Pengadilan}'
            ELSE Alamat_Pengadilan
        END,
        Kota_Pengadilan =   
        CASE
            WHEN '${body.new.Kota_Pengadilan}' <> '' THEN '${body.new.Kota_Pengadilan}'
            ELSE Kota_Pengadilan
        END,
        Tingkatan =   
        CASE
            WHEN '${body.new.Tingkatan}' <> '' THEN '${body.new.Tingkatan}'
            ELSE Tingkatan
        END,
        Notelp_Pengadilan =   
        CASE
            WHEN '${body.new.Notelp_Pengadilan}' <> '' THEN '${body.new.Notelp_Pengadilan}'
            ELSE Notelp_Pengadilan
        END
    WHERE
        Id_Pengadilan = '${body.original.Id_Pengadilan}'
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
