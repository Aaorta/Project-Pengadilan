import { CellContext, ColumnDef } from "@tanstack/react-table";
import { DetailedHTMLProps, HTMLAttributes, HTMLInputTypeAttribute, useEffect, useMemo, useRef, useState } from "react";
import Tabel, { TabelProps } from "./Table/tabel";
import { Box, TableProps, Button, Title, TextInput, Space, ActionIcon, Text, Group } from "@mantine/core";
import { modals } from "@mantine/modals"
import { useRouter } from "next/router";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { fetchDelete, fetchInsert, fetchUpdate } from "@/utils/fetcher";
import { FormType, RenderForm } from "@/utils/form";

export interface TabelDataProps<T> { 
    data: T[], 
    noTitle?: boolean,
    judul: string, 
    onRowClick?: (row: any) => any, 
    trProps?: DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>,
    tableProps?: TableProps,
    tabelProps?: TabelProps<T>,

    // delete stuff
    canDelete?: boolean,
    deleteEndpoint?: string,
    deleteKey?: string,

    canEdit?: boolean,
    editEndpoint?: string,
    editKey?: string,
    editDataColumns?: FormType[]
    prefilledEditDataColumns?: { [k: string]: string }
} 

const openDeleteModal = (endpoint: string, deleteKey: string, onConfirmEnd: () => void)  =>modals.openConfirmModal({
    title: 'Please confirm your action',
    children: (
      <Text size="sm">
        This action is so important that you are required to confirm it with a modal. Please click
        one of these buttons to proceed.
      </Text>
    ),
    labels: { confirm: 'Confirm', cancel: 'Cancel' },
    onCancel: () => console.log('Cancel'),
    onConfirm: async () => {
        await fetchDelete(deleteKey, endpoint)
        onConfirmEnd()
    },
    confirmProps: {
        color: "red"
    }
})

const EditDataComponent = (
  props: {
    columns: FormType[], 
    editEndpoint: string, 
    editKey: string,
    originalValue: any,
    onSubmit: (v: any) => any,
    prefilledEditDataColumns?: { [k:string]: string }
  }
) => {
    const {
        columns, prefilledEditDataColumns, editEndpoint, editKey, onSubmit, originalValue
    } = props
    const [addDataColumns, setAddDataColumns] = useState(columns)

   // TODO: HANDLE ERROR
    const init = async () => {
        const copy = [...addDataColumns]
        for (const i in copy) {
            const data = copy[i]
            if(data.selectDataUrl) {
                // SERVER SHOULD RETURN FORMATTED VALUE of FormSelectData[]
               const res = await fetch(data.selectDataUrl)
               copy[i].selectData = (await res.json()).message
            }
        }
        setAddDataColumns(copy)
    }

    useEffect(() => {
        init()
    }, [])

    return (
    <Box component="form" onSubmit={async (e) => {
        e.preventDefault()
        const form = new FormData(e.target as HTMLFormElement)
        const obj = {...Object.fromEntries(form.entries()), ...prefilledEditDataColumns};

        await fetchUpdate(editEndpoint, editKey, {
            new: obj,
            original: {
                ...originalValue,
                ...prefilledEditDataColumns
            } 
        })
        onSubmit(obj)
    }}>
        {columns.filter((v) => !Object.keys(props.prefilledEditDataColumns || {}).includes(v.key)).map((row, i) => (
            <Box key={i}>
                <RenderForm form={{ ...row, initialValue: originalValue[row.key] }} />
                <Space h="md" />
            </Box>
        ))}
        
        <Button fullWidth type="submit" mt="md">
            Submits
        </Button>
    </Box>)
}

const openEditModal = (
    columns: FormType[], 
    editEndpoint: string, 
    editKey: string,
    originalValue: any,
    onSubmit: (v: any) => any,
    prefilledEditDataColumns?: { [k:string]: string }
) => modals.open({
    title: 'Edit Data',
    size: "xl",
    children: (
        <EditDataComponent
            columns={columns}
            editEndpoint={editEndpoint}
            editKey={editKey}
            originalValue={originalValue}
            onSubmit={onSubmit}
            prefilledEditDataColumns={prefilledEditDataColumns}
        />
    )
})

const TabelData  = <T extends { [k: string]: any }>(props: TabelDataProps<T>) => {
    const router = useRouter()
    const refreshData = () => router.replace(router.asPath);
    const columns = useMemo<ColumnDef<T>[]>(
        () => {
            const cols = Object.keys(props.data[0] || []).map((v): ColumnDef<T> => ({
                accessorKey: v,
                header: v,
            }));
            // Delete
            cols.push({
                id: "actions",
                header: "Aksi",
                cell(cellProps) {
                    return (
                        <Box sx={{ display: "flex", flexDirection: "row" }}>
                            {
                                props.canDelete && 
                                typeof props.deleteEndpoint === "string" && 
                                typeof props.deleteKey === "string" &&
                                <ActionIcon 
                                    color="red" 
                                    onClick={() => openDeleteModal(props.deleteEndpoint!, cellProps.row.original[props.deleteKey!], refreshData)}
                                >
                                    <IconTrash />
                                </ActionIcon>
                            }
                            {
                                props.canEdit && 
                                typeof props.editEndpoint === "string" && 
                                typeof props.editKey === "string" &&
                                Array.isArray(props.editDataColumns) &&
                            <ActionIcon 
                                color="green" 
                                onClick={() => 
                                    openEditModal(
                                        props!.editDataColumns!, 
                                        props.editEndpoint!, 
                                        props.editKey!, 
                                        cellProps.row.original,
                                        refreshData, 
                                        props.prefilledEditDataColumns
                                    )
                                }
                            >
                                <IconEdit />
                            </ActionIcon>}
                        </Box>
                    )
                },
                size: 0
            })
            return cols
        },
        [props.data]
    );

    return (
        <div>
            {!props.noTitle&&<Box sx={{ display: "flex", justifyContent: "center" }} mb={10}>
                <Title order={3}>{props.judul}</Title>
            </Box>}
            <Tabel
                data={props?.data}
                disableVirtualization
                columns={columns}
                onRowClick={props.onRowClick}
                trProps={props.trProps}
                // tableProps={props.tableProps}
                tableProps={{
                    withBorder: true
                }}
                // selectable
                tdOverflowToModal
                // TODO: FIXTHIS
                overflowedColId={["Dakwaan", "Tuntutan", "Deskripsi", "Amar_Putusan", "Petitum", "Isi", "Penilaian", "Amar_Banding"]}         
                ignoredCellClick={["actions"]} 
                {...props.tabelProps}
            />
        </div>
    )
}

export default TabelData