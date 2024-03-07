import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import TabelData from '@/components/TabelData';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../_app';
import { HTMLInputTypeAttribute, useEffect, useState } from 'react';
import { fetchInsert } from '@/utils/fetcher';
import { Box, Button, Select, Space, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { FormType } from '@/utils/form';

export const getServerSideProps = (async (context) => {
    const data = await executeQuery("SELECT * from JAKSA_PENUNTUN_UMUM")
    return { props: { data } }
  }) satisfies GetServerSideProps<{

}>

const columns: FormType[] = [
    {
        key: "NIP",
        type: "text"
    },
    {
        key: "Nama",
        type: "text"
    },
    {
        key: "NoTelp",
        type: "text"
    },
    {
        key: "Kejaksaan",
        type: "text"
    },
]

const AddModalComponent = () => {
    const [listPengadilan, setListPengadilan] = useState<any[]>([])
    const router = useRouter()
    const refreshData = () => router.replace(router.asPath);
    const onSubmit = async (e: any) => {
        e.preventDefault()
        const form = new FormData(e.target)
        await fetchInsert(Object.fromEntries(form.entries()), "/api/jaksa_penuntut_umum")
        refreshData()
    }

    // TODO: HANDLE ERROR
    const fetchListPengadilan = async () => {
        const res = await fetch(`/api/list-pengadilan`)
        setListPengadilan((await res.json()).message)
        return
    }
    useEffect(() => {
        fetchListPengadilan()
    }, [])

    return (
        <Box component="form" onSubmit={onSubmit}>
            {columns.map((row, i) => {
                // @ts-ignore TODO:FIXME TS SUCKS
                return {
                    "text": (
                        <Box key={i}>
                            <TextInput 
                                autoComplete='off' 
                                name={row.key} 
                                label={row.key} 
                                placeholder={row.key} 
                                type={row.type} 
                            />
                            <Space h="md" />
                        </Box>
                    ),
                }[row.type]
            })}
                    <Button fullWidth type="submit" mt="md">
                Submits
                </Button>
        </Box>
    )
}
const openAddModal = () =>  modals.open({
    title: 'Tambah Data',
    children: (
        <AddModalComponent />
    )
})
///

const Hakim: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()

    return (
        <TabelData 
            judul={"Daftar Jaksa Penuntut Umum"} 
            data={props.data} 
            onRowClick={(row) => router.push(`/jpu/${row.NIP}`)} 

            /// @ts-ignore
            tabelProps={{
                headerToolbar: <>
                    <Button onClick={openAddModal}>
                        Tambah data
                    </Button>
                </>
            }}
            canDelete
            deleteEndpoint='/api/jaksa_penuntut_umum'
            deleteKey='NIP'

            canEdit
            editEndpoint='/api/jaksa_penuntut_umum'
            editKey='NIP'
            editDataColumns={columns.map((v) => ({ ...v, initialValueKey: v.key }))}
            ///
        />
    )
}

export default Hakim

