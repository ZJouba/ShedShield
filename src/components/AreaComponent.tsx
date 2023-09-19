import React, { useEffect, useState } from 'react';
import IAreaComponent from '../interfaces/IAreaComponent';
import { Alert, Chip, Grid, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

const AreaComponent: React.FC<IAreaComponent> = ({
  areaInfo,
  interval,
  handleNextEvent,
}) => {
  const [timeSlots, setTimeSlots] = useState<boolean[]>(
    new Array(48).fill(false),
  );

  const setSlots = () => {
    if (!areaInfo?.events) {
      return;
    }
    const currentStage = +areaInfo?.events[0]?.note?.split(' ')[1] || 0;
    const stageStart = dayjs(areaInfo?.events[0]?.start);
    const stageEnd = dayjs(areaInfo?.events[0]?.end);
    const slots = areaInfo?.schedule?.days[0]?.stages[currentStage - 1];
    const newSlots = timeSlots;
    const today = new Date();
    slots?.forEach(slot => {
      const [startA, endA] = slot.split('-');
      const startDateTime = dayjs(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          +startA.split(':')[0],
          +startA.split(':')[1]
        )
      );
      const endDateTime = dayjs(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          +endA.split(':')[0],
          +endA.split(':')[1]
        )
      );
      const start = startDateTime.hour() * 2;
      const end = endDateTime.hour() === 0 ? 48 : endDateTime.hour() * 2 + 2;
      if (startDateTime >= stageStart && endDateTime <= stageEnd) {
        for (let i = start; i < end; i++) {
          newSlots[i] = true;
        }
        const shutdownTime = startDateTime.subtract(interval, 'minutes');
        shutdownTime > dayjs() && handleNextEvent(shutdownTime);
      }
    });
    setTimeSlots(newSlots);
  };

  useEffect(() => {
    setSlots();
  },[areaInfo]);

  return (
    <Stack p={5} width="100%">
      {areaInfo?.error ?
          (
            <Alert severity="error">{areaInfo.error}</Alert>
          ) : (
            <>
              <Grid container alignItems="center">
                <Grid
                  item
                  sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}
                >
                  <Typography component="span" fontWeight="bold">
                    {areaInfo?.info?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    width="fit-content"
                  >
                    {areaInfo?.info?.region}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container py={1}>
                <Grid>
                  {timeSlots.map((slot, idx) => (
                    <Chip
                      key={idx}
                      sx={{ margin: '0 1px', width: '10px' }}
                      color={slot ? 'error' : 'success'}
                      size="small"
                    />
                  ))}
                </Grid>
              </Grid>
            </>
          )}
    </Stack>
  );
};

export default AreaComponent;
