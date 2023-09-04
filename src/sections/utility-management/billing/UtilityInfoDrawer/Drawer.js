'use client';

import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';

import { _mock } from 'src/_mock';
// theme
import { paper } from 'src/theme/css';
//
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { Box } from '@mui/material';
import Carousel from './Carousel';

// ----------------------------------------------------------------------

const fakeBills = [
  {
    id: 2,
    title: 'pdf',
    src: '/assets/utility-bills/bill1.png',
    description: 'this is a pdf',
  },
  {
    id: 2,
    title: 'pdf',
    src: '/assets/utility-bills/bill2.png',
    description: 'this is a pdf',
  },
];

export default function UtilityInfoDrawer({ openDrawer, setOpenDrawer }) {
  const theme = useTheme();

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Info
      </Typography>

      <IconButton
        onClick={() => {
          setOpenDrawer(false);
        }}
      >
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
        }}
        slotProps={{
          backdrop: { invisible: true },
        }}
        sx={{
          [`& .${drawerClasses.paper}`]: {
            ...paper({ theme, bgcolor: theme.palette.background.default }),
            width: 380,
          },
        }}
      >
        {renderHead}

        <Stack
          spacing={2.5}
          justifyContent="center"
          sx={{
            p: 2.5,
            bgcolor: 'background.neutral',
          }}
        >
          <Box component="span" sx={{ color: 'text.secondary' }}>
            Accepted Utility Bills
          </Box>

          <Carousel onClick={() => setOpen(true)} data={fakeBills} />

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Typography variant="body1">
            Upload a PDF or PNG file that reflects the bill shown above. Multiple bills can be
            added. If uploading a scanned bill, make sure it is clear and readable
          </Typography>
        </Stack>

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 3 }}></Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
