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
    INSERT INTO BERKAS
    VALUES ('${body.Kd_Berkas}', '${body.Tanggal_Diajukan}', '${body.No_Perkara}')
    INSERT INTO SURAT_PELIMPAHAN
    VALUES ('${body.Kd_Berkas}', '${body.Nomor_Surat}', '${body.Tanggal_Pelimpahan}')
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
    DELETE FROM SURAT_PELIMPAHAN WHERE Kd_Berkas = '${req.body.key}' 
    DELETE FROM BERKAS WHERE Kd_Berkas = '${req.body.key}' 
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
    UPDATE BERKAS
    SET
        Kd_Berkas = '${body.new.Kd_Berkas}',
        TanggalDiajukan = '${body.new.Tanggal_Diajukan}'
    WHERE
        Kd_Berkas = '${body.original.Kd_Berkas}' AND No_Perkara = '${body.original.No_Perkara}'

    UPDATE SURAT_PELIMPAHAN
    SET
      Kd_Berkas = '${body.new.Kd_Berkas}',
      Nomor_Surat = '${body.new.Nomor_Surat}',
      Tanggal_Pelimpahan = '${body.new.Tanggal_Pelimpahan}'
    WHERE
        Kd_Berkas = '${body.original.Kd_Berkas}'

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

