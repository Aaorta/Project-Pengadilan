import { ActionIcon, AppShell, Box, createStyles, em, getBreakpointValue } from '@mantine/core';
import { IconMenu, IconMenu2 } from '@tabler/icons-react';
import { useState } from 'react';
import NavbarSimple from './Navbar';

const useStyles = createStyles((theme) => ({
  toggleNavbarBtn: {
    // when mobile
    [`@media (max-width: ${em(getBreakpointValue(theme.breakpoints.md) - 1)})`]: {
      display: "block"
    },

    display: 'none',   
  }
}))

export default function Shell({children}: any) {
  const { classes } = useStyles()
  const [show, setShow] = useState(false)
  return (
    <AppShell
      padding="md"
      navbar={<NavbarSimple closeBtnClassName={classes.toggleNavbarBtn} opened={show} close={() => setShow(false)} />}
     //  header={<Header height={60} p="xs">{/* Header content */}</Header>}
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
      <Box className={classes.toggleNavbarBtn}>
        <ActionIcon onClick={() => setShow((prev) => !prev)} size="xl" variant='filled'>
          <IconMenu2 />
        </ActionIcon>
      </Box>

     {children}
    </AppShell>
  );
}