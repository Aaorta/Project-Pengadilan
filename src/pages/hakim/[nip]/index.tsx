import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import TabelData from '@/components/TabelData';
import { useRouter } from 'next/router';

export const getServerSideProps = (async (context) => {
    const data = await executeQuery(`
    SELECT M.No_Perkara, Jenis, Posisi_Hakim 
    FROM MENGURUSI M 
    JOIN PERKARA P ON M.No_Perkara = P.No_Perkara
    JOIN HAKIM H ON H.NIP = M.NIP 
    WHERE M.NIP='${context.params!.nip}'`)
    return { props: { data} }
  }) satisfies GetServerSideProps<{
}>



const Hakim: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()
    return (
        <TabelData 
            data={props.data} judul='Daftar Perkara yang Diurusi Hakim' 
            onRowClick={(row) => router.push(`/perkara/${row.Jenis}?no_perkara=${row.No_Perkara}`)} 
        />
    )
}

export default Hakim

