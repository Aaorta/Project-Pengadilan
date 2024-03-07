import { Button, Menu } from "@mantine/core";
import { SortingState, Table } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import {
     IconCheck,
     IconFilter
} from '@tabler/icons-react';

export type Sorter = {
     sorting: SortingState;
     setSorting: Dispatch<SetStateAction<SortingState>>;
     isSortingASCENDING: boolean;
     isSortingDESCENDING: boolean;
     isActiveSort: (id: string) => boolean;
     setActiveSort: (id: string) => void;
     setSortDirection: (descending: boolean) => void;
}

export const useSorter = (): Sorter => {
     const [sorting, setSorting] = useState<SortingState>([])
     const isSortingASCENDING = 
          !!sorting.length && 
          typeof sorting[0].desc === "boolean" &&
          sorting[0].desc === false
     const isSortingDESCENDING = 
          !!sorting.length && 
          typeof sorting[0].desc === "boolean" &&
          sorting[0].desc === true
     const isActiveSort = useCallback((id: string) => {
          return id === sorting[0]?.id
     }, [sorting])
     const setActiveSort = (id: string) => {
          setSorting([{
               id,
               desc: true
     }])
     }
     const setSortDirection = useCallback((descending: boolean) => {
          const currentSort = sorting[0]
          if(!currentSort) { return }
          setSorting([{
               ...currentSort,
               desc: descending
          }])
     }, [sorting])
     
     return {
          sorting,
          setSorting,
          isSortingASCENDING,
          isSortingDESCENDING,
          isActiveSort,
          setActiveSort,
          setSortDirection
     }
}

export type SortingComponentProps<T> = {
     sorter: Sorter
     table: Table<T>
}

export const SortingComponent = <T,>(props: SortingComponentProps<T>) => {
     const {
          sorter,
          table
     } = props
     const {
          isSortingASCENDING,
          isSortingDESCENDING,
          isActiveSort,
          setActiveSort,
          setSortDirection
     } = sorter

     return (
          <Menu position="top-end" width={220}>
               <Menu.Target>
                    <Button radius="xl" rightIcon={<IconFilter size={18} stroke={1.5} />} pr={12}>
                         Sortir
                    </Button>
               </Menu.Target>
               <Menu.Dropdown>
                    {table.getHeaderGroups()[0].headers.map((header, i) => (
                         <Menu.Item 
                              onClick={() => setActiveSort(header.id)} 
                              key={i} 
                              rightSection={
                                   isActiveSort(header.id) ? 
                                   <IconCheck size={16} /> : null
                              }
                         >
                              {header.id.toUpperCase()}
                         </Menu.Item>
                    ))}

                    <Menu.Divider />

                    <Menu.Item 
                         onClick={() => setSortDirection(true)}
                         rightSection={isSortingDESCENDING ? <IconCheck size={16} /> : null}>
                         NAIK
                    </Menu.Item>
                    <Menu.Item 
                         onClick={() => setSortDirection(false)}
                         rightSection={isSortingASCENDING ? <IconCheck size={16} /> : null}>
                         TURUN
                    </Menu.Item>
               </Menu.Dropdown>
          </Menu>
     )
}

