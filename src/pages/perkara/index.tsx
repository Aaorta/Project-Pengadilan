import { executeQuery } from '@/utils/db'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from 'next/router';
import TabelData from '@/components/TabelData';
import { Box, Button, Select, Space, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffect, useState } from 'react';
import { FormType, RenderForm } from '@/utils/form';
import { fetchInsert } from '@/utils/fetcher';

export const getServerSideProps = (async (context) => {
    const data = await executeQuery(`
        SELECT No_Perkara, Klasifikasi_Perkara, Tanggal_Register, Jenis, PE.Id_Pengadilan, Nama_Pengadilan, Tingkatan
        FROM PERKARA P
        JOIN PENGADILAN PE ON P.Id_Pengadilan = PE.Id_Pengadilan
    `)
    return { props: { data: JSON.stringify(data) } }
  }) satisfies GetServerSideProps<{

}>

///
const _columns: FormType[] = [
    {
        key: "No_Perkara",
        type: "text"
    },
    {
        key: "Klasifikasi_Perkara",
        type: "text"
    },
    {
        key: "Tanggal_Register",
        type: "datetime"
    },
    {
        key: "Jenis",
        type: "select",
        selectData: [
            {label: "PIDANA", name:"PIDANA"},
            {label: "PERDATA", name:"PERDATA"},
        ]
    },
    {
        key: "Id_Pengadilan",
        type: "select"
    },
]
const AddModalComponent = () => {
    const [columns, setColumns] = useState(_columns)
    const router = useRouter()
    const refreshData = () => router.replace(router.asPath);
    const onSubmit = async (e: any) => {
        e.preventDefault()
        const form = new FormData(e.target)
        await fetchInsert(Object.fromEntries(form.entries()), "/api/perkara")
        refreshData()
    }

    // TODO: HANDLE ERROR
    const fetchListPengadilan = async () => {
        const res = await fetch(`/api/list-pengadilan`)
        const idx = columns.findIndex((v) => v.key === "Id_Pengadilan")
        const temp_columns = [...columns]
        temp_columns[idx].selectData = (await res.json()).message.map((v: any) => ({
            label: `${v.Id_Pengadilan} - ${v.Nama_Pengadilan}`,
            name: v.Id_Pengadilan
        }))
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

const Hakim: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>  = (props) => {
    const router = useRouter()
    return (
        <TabelData 
            judul={"Daftar Perkara"} 
            data={JSON.parse(props.data)} 
            onRowClick={(row) => router.push(`/perkara/${row.Jenis}?no_perkara=${row.No_Perkara}`)} 
            // @ts-ignore
            tabelProps={{
                headerToolbar: <>
                    <Button onClick={openAddModal}>
                        Tambah data
                    </Button>
                </>
            }}
            canDelete
            deleteEndpoint='/api/perkara'
            deleteKey='No_Perkara'

            canEdit
            editEndpoint='/api/perkara'
            editKey='No_Perkara'
            editDataColumns={_columns.map((v) => ({ ...v, initialValueKey: v.key }))}
        />
    )
}

export default Hakim


