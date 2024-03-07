import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from 'next/router';
import TabelData from '@/components/TabelData';

export const getServerSideProps = (async (context) => {
    const data = await executeQuery(`SELECT No_Perkara FROM MENJAKSAI M WHERE M.NIP = '${context.params!.nip}'`)
    return { props: { data } }
  }) satisfies GetServerSideProps<{

}>

const Hakim: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()
    return (
        <TabelData 
            judul={"Daftar Perkara yang Dijaksai"} 
            data={props.data} 
            onRowClick={(row) => router.push(`/perkara/PIDANA?no_perkara=${row.No_Perkara}`)} 
        />
    )
}

export default Hakim
