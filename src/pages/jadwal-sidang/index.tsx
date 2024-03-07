import TabelData from '@/components/TabelData'
import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"

export const getServerSideProps = (async (context) => {
    const data = await executeQuery(`
        SELECT No_Sidang, S.No_Perkara, Tanggal_Sidang, Agenda, Nama_Pengadilan, Ruang, Waktu
        FROM SIDANG S
        JOIN PERKARA P ON S.No_Perkara = P.No_Perkara
        JOIN PENGADILAN PE ON P.Id_Pengadilan = PE.Id_Pengadilan
    `)
    return { props: { dataString: JSON.stringify(data) } }
  }) satisfies GetServerSideProps<{

}>

const Pengadilan: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    return (
        <TabelData 
            judul={"Daftar Sidang"} 
            data={JSON.parse(props.dataString)} 
        />
    )
}

export default Pengadilan

