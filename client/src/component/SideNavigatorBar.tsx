import { Close, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Drawer,
} from "@mui/material";
import { createLink, LinkComponentProps } from "@tanstack/react-router";
import { JSX } from "react";

const drawerWidth = 240;

export type NavigationItem = {
  to: LinkComponentProps["to"];
  icon: JSX.Element;
  label: string;
  disableShowActive?: boolean;
};

export default function SideNavigationBar(props: {
  open: boolean;
  onClose: () => void;
  itemsWithGroups: NavigationItem[][];
}) {
  const { open, onClose, itemsWithGroups } = props;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant="temporary"
      elevation={0}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            minWidth: drawerWidth,
          },
        },
      }}
    >
      <List>
        <ListItemButton onClick={onClose}>
          <ListItemIcon>
            <Close />
          </ListItemIcon>
        </ListItemButton>
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
