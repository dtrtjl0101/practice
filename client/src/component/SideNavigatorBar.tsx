import { ExpandLess, ExpandMore, Menu } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  styled,
  Drawer as MuiDrawer,
  ListItemText,
  Theme,
  CSSObject,
  Collapse,
} from "@mui/material";
import { createLink, LinkComponentProps } from "@tanstack/react-router";
import { JSX, useState } from "react";

const drawerWidth = 240;

export type NavigationItem = {
  to: LinkComponentProps["to"];
  icon: JSX.Element;
  label: string;
  disableShowActive?: boolean;
};

export default function SideNavigationBar(props: {
  itemsWithGroups: NavigationItem[][];
}) {
  const { itemsWithGroups } = props;
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} variant="permanent">
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setOpen(!open);
            }}
          >
            <ListItemIcon>
              <Menu />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        {itemsWithGroups.map(([header, ...children]) => {
          return (
            <LinkListButtonGroup
              to={header.to}
              headerButton={header}
              childButtons={children}
              activeProps={{
                open: true,
              }}
            />
          );
        })}
      </List>
    </Drawer>
  );
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    marginTop: theme.spacing(8),
  },

  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": {
          ...openedMixin(theme),
        },
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": {
          ...closedMixin(theme),
        },
      },
    },
  ],
}));

const LinkListItemButton = createLink(ListItemButton);

function ListButtonGroup(props: {
  headerButton: NavigationItem;
  childButtons: NavigationItem[];
  open?: boolean;
}): JSX.Element {
  const { headerButton, childButtons, open } = props;
  const hasChildren = childButtons.length > 0;

  return (
    <>
      <LinkListItemButton
        to={headerButton.to}
        activeProps={{
          selected: !headerButton.disableShowActive,
        }}
        inactiveProps={{
          selected: false,
        }}
      >
        <ListItemIcon>{headerButton.icon}</ListItemIcon>
        <ListItemText primary={headerButton.label} />
        {hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
      </LinkListItemButton>
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {childButtons.map((child) => (
              <LinkListItemButton
                to={child.to}
                activeProps={{
                  selected: !headerButton.disableShowActive,
                }}
                inactiveProps={{
                  selected: false,
                }}
                sx={{ pl: 2 }}
              >
                <ListItemIcon>{child.icon}</ListItemIcon>
                <ListItemText primary={child.label} />
              </LinkListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

const LinkListButtonGroup = createLink(ListButtonGroup);
