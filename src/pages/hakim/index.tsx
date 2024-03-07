import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import TabelData from '@/components/TabelData';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../_app';
import { HTMLInputTypeAttribute, useEffect, useState } from 'react';
import { fetchInsert } from '@/utils/fetcher';
import { Box, Button, Select, Space, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { FormType, RenderForm } from '@/utils/form';

export const getServerSideProps = (async (context) => {
    let data;
    if(context.query.id_pengadilan) {
        data = await executeQuery(`SELECT NIP, Nama, Gol
        FROM HAKIM
        WHERE Id_Pengadilan = '${context.query.id_pengadilan}'`)
    } else data = await executeQuery("SELECT H.*, Nama_Pengadilan FROM HAKIM H JOIN PENGADILAN P ON H.Id_Pengadilan = P.Id_Pengadilan")

    return { props: { data } }
  }) satisfies GetServerSideProps<{
}>

///
const _columns: FormType[] = [
    {
        key: "NIP",
        type: "text"
    },
    {
        key: "Nama",
        type: "text"
    },
    {
        key: "Gol",
        type: "text"
    },
    {
        key: "Id_Pengadilan",
        type: "select",
        selectDataUrl: "/api/list-pengadilan1"
    },
]

// TODO: HANDLE ERROR, idk whatever fix it
const AddModalComponent = () => {
    const [columns, setColumns] = useState(_columns)
    const router = useRouter()
    const refreshData = () => router.replace(router.asPath);
    const onSubmit = async (e: any) => {
        e.preventDefault()
        const form = new FormData(e.target)
        await fetchInsert(Object.fromEntries(form.entries()), "/api/hakim")
        refreshData()
    }

    // TODO: HANDLE ERROR, idk whatever fix it
    const fetchListPengadilan = async () => {
        const res = await fetch(`/api/list-pengadilan1`)
        const idx = columns.findIndex((v) => v.key === "Id_Pengadilan")
        const temp_columns = [...columns]
        // const selectData = (await res.json()).message.map((v: any) => ({
        //     label: `${v.Id_Pengadilan} - ${v.Nama_Pengadilan}`,
        //     name: v.Id_Pengadilan
        // }))
        temp_columns[idx].selectData = (await res.json()).message
        // const copy2 = { ...temp_columns[idx] }
        // copy2.selectData = selectData
        // temp_columns[idx] = copy2

        setColumns(temp_columns)
        return
    }
    useEffect(() => {
        fetchListPengadilan()
    }, [])

    return (
        <Box component="form" onSubmit={onSubmit}>
            {columns.map((row, i) => {
                return <Box key={i}>
                    <RenderForm form={row} />
                    <Space h="md" />
                </Box>
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
            judul={"Daftar Hakim"} 
            data={props.data} 
            onRowClick={(row) => router.push(`/hakim/${row.NIP}`)} 

            /// @ts-ignore
            tabelProps={{
                headerToolbar: <>
                    <Button onClick={openAddModal}>
                        Tambah data
                    </Button>
                </>
            }}
            canDelete
            deleteEndpoint='/api/hakim'
            deleteKey='NIP'

            canEdit
            editEndpoint='/api/hakim'
            editKey='NIP'
            editDataColumns={_columns.map((v) => ({ ...v, initialValueKey: v.key }))}
            ///
        />
    )
}

export default Hakim

