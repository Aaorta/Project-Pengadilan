import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import TabelData from '@/components/TabelData';
import { useRouter } from 'next/router';

export const getServerSideProps = (async (context) => {
    const data = await executeQuery(`
        SELECT No_Putusan, Tanggal_Putusan, Nama_Pengadilan, Nilai_Ganti, Amar_Putusan, Verstek, Status_Putusan, Tanggal_Minustasi, Sumber_Hukum, P.No_Perkara
        FROM PUTUSAN_PERDATA PP
        JOIN PERKARA P ON PP.No_Perkara = P.No_Perkara
        LEFT JOIN PENGADILAN PE ON P.Id_Pengadilan = PE.Id_Pengadilan
    `)
    return { props: { data: JSON.stringify(data) } }
  }) satisfies GetServerSideProps<{

}>

const Hakim: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()
    return (
        <TabelData 
            judul={"Daftar Putusan Tindak Perdata"} 
            data={JSON.parse(props.data)} 
        />
    )
}

export default Hakim

