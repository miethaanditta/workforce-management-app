import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import {
  WorkHistory as WorkHistoryIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { getUser } from '../auth/auth.storage';
import { logout } from '../auth/logout';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Badge, Divider, ListItemText } from '@mui/material';
import { findOneStaff } from '../api/employee.api';
import { getInbox, type InboxResponse } from '../api/useSocket';

function Navbar() {
  const user = getUser();
  const userRole = user?.role;
  const isAdmin = userRole === 'ADMIN';
  const navigate = useNavigate();

  const [inboxItems, setInboxItems] = useState<InboxResponse[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);

  const fetchInbox = useCallback(async () => {
    if (!user?.id || !isAdmin) return;
    try {
      const items = await getInbox(user.id);
      setInboxItems(items);
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchInbox();

    const fetchUserProfile = async () => {
      if (!user?.id || isAdmin) return;
      try {
        const staff = await findOneStaff(user.id);
        if (staff?.fileContent?.data) {
          const base64String = btoa(
            staff.fileContent.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          setAvatarUrl(`data:image/png;base64,${base64String}`);
        }
      } catch (error) {
        console.error("Failed to load user avatar:", error);
      }
    };

    fetchUserProfile();
  }, [fetchInbox]);

  useEffect(() => {
    if (!user?.id || !isAdmin) return;

    const socket = io(import.meta.env.VITE_SOCKET_BASE_URL, {
      query: { userId: user.id }
    });

    socket.on('notification', (data) => {
      const newNotification: InboxResponse = { ...data, createdAt: new Date() };
      setInboxItems((prev) => [newNotification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, isAdmin]);

  const pages = (userRole == 'ADMIN' ? ['Employee', 'Attendance'] : ['Attendance']);
  const settings = (userRole == 'ADMIN' ? ['Account', 'Logout'] : ['Profile', 'Account', 'Logout']);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNotifMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElNotif(event.currentTarget);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNotifMenu = () => setAnchorElNotif(null);

  const handleCloseNavMenu = (page: string) => {
    switch (page) {
      case 'Employee':
        navigate('/employee');
        break;
      case 'Attendance':
        navigate('/attendance');
        break;
    }
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (settings: string) => {
    switch (settings) {
      case 'Profile':
        navigate(`/employee/${user!.id}`);
        break;

      case 'Account':
        navigate('/account');
        break;

      case 'Logout':
        logout();
        break;
    }
    setAnchorElUser(null);
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <WorkHistoryIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href={userRole == 'ADMIN' ? '/admin' : '/'}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'calibri',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DEXA
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleCloseNavMenu(page)}>
                  <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <WorkHistoryIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href={userRole == 'ADMIN' ? '/admin' : '/'}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'calibri',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            DEXA
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleCloseNavMenu(page)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {isAdmin && (
              <>
                <Tooltip title="Notifications">
                  <IconButton color="inherit" onClick={handleOpenNotifMenu}>
                    <Badge badgeContent={inboxItems.length} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorElNotif}
                  open={Boolean(anchorElNotif)}
                  onClose={handleCloseNotifMenu}
                  PaperProps={{ sx: { width: 300, maxHeight: 400, mt: 1.5 } }}
                >
                  <Typography sx={{ p: 2, fontWeight: 'bold' }}>Admin Inbox</Typography>
                  <Divider />
                  {inboxItems.length > 0 ? (
                    inboxItems.map((item) => (
                      <MenuItem key={item.id} sx={{ whiteSpace: 'normal' }} onClick={handleCloseNotifMenu}>
                        <ListItemText
                          primary={item.title}
                          secondary={
                            <>
                              {item.content}
                              <Typography component="span" variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                {new Date(item.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No new messages</MenuItem>
                  )}
                </Menu>
              </>
            )}

            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={user?.name || "User"}
                  src={avatarUrl}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
