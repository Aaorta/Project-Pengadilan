import TabelData from '@/components/TabelData'
import { executeQuery } from '@/utils/db'
import { Box, Button, Space, TextInput } from '@mantine/core'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from 'next/router'
import { modals } from '@mantine/modals'
import { fetchInsert } from '@/utils/fetcher'
import { HTMLInputTypeAttribute } from 'react'
import { FormType } from '@/utils/form'

export const getServerSideProps = (async (context) => {
    const data = await executeQuery("SELECT * from PENGADILAN")
    return { props: { data } }
  }) satisfies GetServerSideProps<{

}>

///
const columns: FormType[] = [
    {
        key: "Id_Pengadilan",
        type: "text"
    },
    {
        key: "Nama_Pengadilan",
        type: "text"
    },
    {
        key: "Alamat_Pengadilan",
        type: "text"
    },
    {
        key: "Kota_Pengadilan",
        type: "text"
    },
    {
        key: "Tingkatan",
        type: "select",
        selectData: 
        [
            {label: "Pertama", name:"Pertama"},
            {label: "Kedua", name:"Kedua"},
        ]
    },
    {
        key: "Notelp_Pengadilan",
        type: "text"
    },
]
///

const Pengadilan: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()

    ///
    const refreshData = () => router.replace(router.asPath);
    const onSubmit = async (e: any) => {
        e.preventDefault()
        const form = new FormData(e.target)
        
        await fetchInsert(Object.fromEntries(form.entries()), "/api/pengadilan")
        refreshData()
    }
    ///

    return (
        <TabelData 
            judul={"Daftar Pengadilan"} 
            data={props.data} 
            onRowClick={(row)=>router.push(`/hakim?id_pengadilan=${row.Id_Pengadilan}`)}
            ///
            tabelProps={{
                headerToolbar: <>
                    <Button 
                        onClick={() => 
                            modals.open({
                                title: 'Tambah Data',
                                children: (
                                <Box component="form" onSubmit={onSubmit}>
                                    {columns.map((row, i) => (
                                        <Box key={i}>
                                            <TextInput name={row.key} label={row.key} placeholder={row.key} data-autofocus type={row.type} />
                                            <Space h="md" />
                                        </Box>
                                    ))}
                                            <Button fullWidth type="submit" mt="md">
                                        Submits
                                        </Button>
                                </Box>
                                )
                            })
                        }
                    >
                        Tambah data
                    </Button>
                </>
            }}
            canDelete
            deleteEndpoint='/api/pengadilan'
            deleteKey='Id_Pengadilan'

            canEdit
            editEndpoint='/api/pengadilan'
            editKey='Id_Pengadilan'
            editDataColumns={columns.map((v) => ({ ...v, initialValueKey: v.key }))}
            ///
        />
    )
}

export default Pengadilan

