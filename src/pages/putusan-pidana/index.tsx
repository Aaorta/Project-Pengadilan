import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import TabelData from '@/components/TabelData';
import { useRouter } from 'next/router';

export const getServerSideProps = (async (context) => {
    const data = await executeQuery(`
    SELECT
        PP.No_Putusan,
        PP.Tanggal_Putusan,
        PE.Nama_Pengadilan,
        PP.Amar_Putusan,
        PP.Status_Putusan,
        PP.No_Perkara,
        PP.Id_SubjekHukum,
        COALESCE(PSO.Nama, BHO.Nama) AS Nama_Terdakwa,
        SH.jenis
    FROM PUTUSAN_PIDANA PP
    JOIN PERKARA P ON PP.No_Perkara = P.No_Perkara
    LEFT JOIN PENGADILAN PE ON P.Id_Pengadilan = PE.Id_Pengadilan
    JOIN SUBJEK_HUKUM SH ON PP.Id_SubjekHukum = SH.Id_SubjekHukum
    LEFT JOIN PERSEORANGAN PSO ON PP.Id_SubjekHukum = PSO.Id_SubjekHukum
    LEFT JOIN BADAN_HUKUM BHO ON PP.Id_SubjekHukum = BHO.Id_SubjekHukum;
    `)
    return { props: { data: JSON.stringify(data) } }
  }) satisfies GetServerSideProps<{

}>

const Hakim: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()
    return (
        <TabelData 
            judul={"Daftar Putusan Tindak Pidana"} 
            data={JSON.parse(props.data)} 
        />
    )
}

export default Hakim

