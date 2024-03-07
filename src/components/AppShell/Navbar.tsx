import { createStyles, Navbar, Group, Code, Text, ActionIcon, Box, getStylesRef, NavLink, useMantineTheme, UnstyledButton, rem, Avatar, useMantineColorScheme } from '@mantine/core';
import { IconScale, IconSun } from '@tabler/icons-react';
import { IconMoonStars } from '@tabler/icons-react';
import {
  IconPlus,
  IconHome,
  IconListDetails,
  IconReload,
  IconCalculator,
  IconMenu2,
  IconReceipt2,
  IconChecklist,
  IconChevronRight,
  IconChevronLeft
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const data = [
  { link: '/', label: 'Home', icon: IconHome },
  { link: '/pengadilan', label: 'Pengadilan', icon: IconPlus },
  { link: '/hakim', label: 'Hakim', icon: IconListDetails },
  { link: '/jpu', label: 'Jaksa Penuntut Umum', icon: IconListDetails },
  
  { 
    link: '/perkara', 
    label: 'Perkara', icon: IconReceipt2, 
  },
  { 
    link: '/putusan-billing', 
    label: 'Putusan', icon: IconReceipt2, 
    child: [
      { link: '/putusan-pidana', label: 'Pidana', icon: IconReceipt2,},
      { link: '/putusan-perdata', label: 'Perdata', icon: IconReceipt2 },
    ] 
  },

  

  { link: '/jadwal-sidang', label: 'Jadwal Sidang', icon: IconReload },
];

const useStyles = createStyles((theme) => {
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: parseInt(theme.spacing.md) * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: theme.fontSizes.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[0],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [`& .${getStylesRef("icon")}`]: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: getStylesRef("icon"),
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[0],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      '&, &:hover': {
        backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
          .background,
        color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        [`& .${getStylesRef("icon")}`]: {
          color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
      },
    },

    navbar: {
      overflowY: "auto",
      zIndex: 199, // 9999
      background: theme.colorScheme === 'dark' ? undefined : theme.colors.indigo[9],
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[0],
    },

    loginButton: {
      display: 'block',
      width: '100%',
      padding: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[0],

      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      }
    }
  };
});

type NavbarSimpleProps = {
  opened: boolean
  close: () => void
  closeBtnClassName?: string
}

export default function NavbarSimple(props: NavbarSimpleProps) {
  const { classes, cx } = useStyles();
  const router = useRouter()
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  const links = data.map((item) => (
    <NavLink
      component={Link}
      className={cx(classes.link, { [classes.linkActive]: item.link === "/" ? item.link === router.route : router.route.startsWith(item.link) })}
      href={item.link}
      key={item.label}
      style={{marginBottom: "5px"}}
      onClick={() => props.close()}
      icon={<item.icon className={classes.linkIcon} stroke={1.5} />}
      label={<span>{item.label}</span>}
    >
      {/* TODO: FIX THIS */}
      {item.child?.map((item) => (
        <NavLink
          component={Link}
          className={cx(classes.link, { [classes.linkActive]: item.link === router.route })}
          href={item.link}
          key={item.label}
          style={{marginBottom: "5px"}}
          onClick={() => props.close()}
          icon={<item.icon className={classes.linkIcon} stroke={1.5} />}
          label={<span>{item.label}</span>}
        />
      ))}
    </NavLink>
  ));

  return (
    <Navbar className={classes.navbar} hidden={!Boolean(props.opened)} width={{ md: 250 }} p="md">
      <Navbar.Section grow>
        <Group className={classes.header} position="apart">
          <Box className={props.closeBtnClassName ?? ""}>
            <ActionIcon onClick={() => props.close && props.close()} size="xl" variant='filled'>
              <IconMenu2 />
            </ActionIcon>
          </Box>
          <Text size='lg' fw={500}>Peradilan Wakanda</Text>
          <Avatar color="blue">
            <IconScale />
          </Avatar>
        </Group>
        {links}
      </Navbar.Section>
      <Navbar.Section>
      <ActionIcon
        variant="outline"
        color={dark ? 'yellow' : 'blue'}
        onClick={() => toggleColorScheme()}
        title="Toggle color scheme"
      >
        {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
      </ActionIcon>
      <Box
        sx={{
          paddingTop: theme.spacing.sm,
          borderTop: `${rem(1)} solid ${
            theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
          }`,
        }}
      >
        <UnstyledButton className={classes.loginButton}>
          <Group>
            <Box sx={{ flex: 1 }}>
              {
                true ? 
                <>
                  <Text size="sm" weight={500}>
                    Amy Horsefighter
                  </Text>
                  <Text size="xs">
                    ahorsefighter@gmail.com
                  </Text>
                </>
                :
                <Text>Log In</Text>
              }
            </Box>

            <IconChevronRight size={rem(18)} />
          </Group>
        </UnstyledButton>
      </Box>
      </Navbar.Section>
    </Navbar>
  );
}