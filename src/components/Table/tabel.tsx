import { Box, Text, TextInput, Table, TableProps, Checkbox, Button } from "@mantine/core";
import { useReactTable, ColumnDef, getCoreRowModel, flexRender, Row, getSortedRowModel, SortingState } from "@tanstack/react-table"
import { DetailedHTMLProps, HTMLAttributes, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useVirtual } from 'react-virtual'
import { debounce } from "lodash"
import { searchStringNested } from "../../utils/searchString";
import { SortingComponent, useSorter } from "./sorter";
import { THead } from "./thead";
import { modals } from "@mantine/modals"

const ClientSide = (props: {children: ReactNode}) => {
	return (
		typeof window === "undefined" ? null : props.children
	)
}
   
export type TabelProps<T> = {
	data: T[]
	columns: ColumnDef<T>[]
	disableVirtualization?: boolean,
	noDataComp?: JSX.Element,
	headerToolbar?: JSX.Element
	footerToolbar?: JSX.Element,
	tableProps?: TableProps,
	tableHeight?: string | number 
	isLoading?: boolean,
	onRowClick?: (row: T) => any,
	trProps?: DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>,
	selectable?: boolean,
	tdOverflowToModal?: boolean,
	overflowedColId?: string[],
	ignoredCellClick?: string[],
	withoutDefaultToolbar?:boolean
}

const openModal = (title: string, body: any) => modals.open({
    title: title,
	size: "100%",
    children: (
      <Box style={{ whiteSpace: "pre-wrap" }}>
        {/* @ts-ignore */}
        {body}
      </Box>
    ),
  });

const TdOverflowToModal = (props: { children: any, id: string, colId: string  }) => {
	const ref = useRef<HTMLTableDataCellElement | null>(null)
	return (
		<td 
			ref={ref} 
			key={props.id} 
		>
			<Button size="xs" onClick={() => openModal(props.colId, props.children)}>
				Baca 
        	</Button>
		</td>
	)
}

const Tabel = <T extends { [k: string]: any }>(props: TabelProps<T>) => {
	const {
		data: _data,
		columns: _columns,
		disableVirtualization,
		noDataComp,
		headerToolbar,
		footerToolbar,
		tableProps,
		tableHeight,
		isLoading,
		onRowClick,
		trProps,
		selectable,
		tdOverflowToModal,
		overflowedColId
	} = props

	// TODO: FIXME
	const data = useMemo(() => _data.map((v) => {
		try {
			const temp = {...v}
			for (const [k,v] of Object.entries(temp)) {
				// @ts-ignore
				const date = new Date(v)
				if((v as string).match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
					if(date.getUTCFullYear() === 1970) {
						const mnt = date.getUTCMinutes()
						const hrs = date.getUTCHours()
						// @ts-ignore
						temp[k] = `${hrs<10?"0"+hrs:hrs}:${mnt < 10 ? "0"+mnt:mnt}`
						// @ts-ignore
					} else temp[k] = date.toLocaleDateString("en-GB")
				}

			}
			return temp
		} catch (error) {
			return v
		}
	}), [_data])

	const [filter, setFilter] = useState("")
	const [rowSelection, setRowSelection] = useState({})
	const filteredData = useMemo(() => 
		searchStringNested(data, filter.toLowerCase()),
	[filter, data])
	const sorter = useSorter()

	const columns = useMemo((): ColumnDef<T>[] => 
	selectable ? 
	[
		{
			id: 'select',
			size: .5,
			maxSize: .2,
			header: ({ table }) => (
			  <Checkbox
				{...{
				  checked: table.getIsAllRowsSelected(),
				  indeterminate: table.getIsSomeRowsSelected(),
				  onChange: table.getToggleAllRowsSelectedHandler(),
				  style: {
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				  }
				}}
			  />
			),
			cell: ({ row }) => (
			  <div>
				<Checkbox
				  {...{
					checked: row.getIsSelected(),
					disabled: !row.getCanSelect(),
					indeterminate: row.getIsSomeSelected(),
					onChange: row.getToggleSelectedHandler(),
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					  }
				  }}
				/>
			  </div>
			),
		},
		..._columns
	] 
	: _columns, [_columns])

	const table = useReactTable({
		data: filteredData,
		columns,
		state: {
			sorting: sorter.sorting,
			rowSelection
		},
		onSortingChange: sorter.setSorting,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		debugTable: true,
		// enableMultiRowSelection: false
	})

	const tableContainerRef = useRef<HTMLDivElement>(null)
	const { rows } = table.getRowModel()
	const rowVirtualizer = useVirtual({
		parentRef: tableContainerRef,
		size: rows.length,
		overscan: 10
	})
	const { virtualItems: virtualRows, totalSize } = rowVirtualizer

	const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0
	const paddingBottom =
	  virtualRows.length > 0
	    ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
	    : 0

	const onSearch =  debounce((value) => {
		setFilter(value)
	}, 500)
	
	const noDataComponent = <tr>
		<td colSpan={columns.length}>
			{!!noDataComp ? noDataComp : 
			<Text weight={500} align="center">
				{isLoading?"Loading...": "Nothing found"}
			</Text>}
		</td>
	</tr>
	
	return (
		<>
			{headerToolbar}
			{!props.withoutDefaultToolbar&&<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} mb={10}>
				<TextInput onChange={(e) => onSearch(e.target.value)} variant="default" label="Cari" />
				<SortingComponent sorter={sorter} table={table} />
			</Box>}

			<Box 
				ref={tableContainerRef} 
				className="container" 
				sx={{ overflowX: "auto", height: !!tableHeight ? tableHeight : "100%" }}>
				<Table highlightOnHover={props.onRowClick !== undefined} {...tableProps} >
					<THead table={table} />
					
					<tbody>
						{/* Top Placeholder */}
						{paddingTop > 0 && (<tr>
							<td style={{ height: `${paddingTop}px` }} />
						</tr>)}
						
						{/* Main Body */}
						{isLoading?noDataComponent:disableVirtualization ? 
						// Unvirtualized Rows
						rows.length >0 ? rows.map((row) => (
							<tr key={row.id} {...trProps} style={{...trProps?.style, cursor: props.onRowClick?"pointer": undefined}}>
							{row.getVisibleCells().map(cell => {
								if(tdOverflowToModal && overflowedColId?.includes(cell.column.id)) return <TdOverflowToModal 
									id={cell.id}
									colId={cell.column.id}
								>
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
								</TdOverflowToModal>
								return (
									<td key={cell.id} onClick={() => (onRowClick && cell.column.id !== "select" && !(props.ignoredCellClick ?? []).includes(cell.column.id)) ? onRowClick(row.original) : undefined}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</td>
								)
							})}
							</tr>
						)): noDataComponent

						// Virtualized Rows
						: virtualRows.length > 0 ? virtualRows.map((virtualRow) => {
							const row = rows[virtualRow.index] as Row<T>
							return (
								<tr key={row.id} onClick={() => onRowClick ? onRowClick(row.original) : undefined} {...trProps}>
									{row.getVisibleCells().map(cell => {
										return (
										<td key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
										</td>
										)
									})}
								</tr>
							)
						}) : noDataComponent
						}

						{/* Bottom Placeholder */}
						{paddingBottom > 0 && (<tr>
							<td style={{ height: `${paddingBottom}px` }} />
						</tr>)}
					</tbody>
				</Table>

				{/* {Object.keys(rowSelection).length} / 10 data terpilih */}
			</Box>
			{footerToolbar}
		</>
	)
}

export default Tabel