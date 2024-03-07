import { createStyles } from "@mantine/core";
import { flexRender, Table } from "@tanstack/react-table";

const useStyles = createStyles((theme) => ({  
	header: {
		position: 'sticky',
		top: 0,
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
		transition: 'box-shadow 150ms ease',
		zIndex: 1,
	
		'&::after': {
			content: '""',
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: 0,
			borderBottom: `1px solid ${
			theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[2]
			}`,
		},
	},
	yep: {
		".cursor-pointer": {
			cursor: "pointer"
		},
		".select-none": {
			userSelect: "none"
		}
	}
}));

export type THeadProps<T> = {
	table: Table<T>
}

export const THead= <T,>({table}: THeadProps<T>) => {
	const { classes } = useStyles()

	return (
		<thead className={classes.header}>
			{table.getHeaderGroups().map(headerGroup => (
			<tr key={headerGroup.id}>
				{headerGroup.headers.map(header => {
				return (
					<th
						key={header.id}
						colSpan={header.colSpan}
						style={{ width: header.getSize() }}
						className={classes.yep}
					>
						{header.isPlaceholder ? null : (
							<div
								{...{
								className: header.column.getCanSort()
									? 'cursor-pointer select-none'
									: '',
								onClick: header.column.getToggleSortingHandler(),
								}}
							>
								{flexRender(
									header.column.columnDef.header,
									header.getContext()
								)}
								{{
									asc: ' 🔼',
									desc: ' 🔽',
								}[header.column.getIsSorted() as string] ?? null}
							</div>
						)}
					</th>
				)
				})}
			</tr>
			))}
		</thead>
	)
}
