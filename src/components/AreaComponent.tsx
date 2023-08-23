import React, { useEffect, useState } from 'react';
import IAreaComponent from '../interfaces/IAreaComponent';
import IAreaInfo from '../interfaces/IAreaInfo';
import { Alert, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

const AreaComponent: React.FC<IAreaComponent> = ({
  id,
  interval,
  handleNextEvent,
}) => {
  const [areaInfo, setAreaInfo] = useState<IAreaInfo | null>(null);
  const [areaInfoError, setAreaInfoError] = useState("");
  const [timeSlots, setTimeSlots] = useState<boolean[]>(
    new Array(48).fill(false),
  );

  useEffect(() => {
    window.Main.getAreaInfo(id)
      .then((response: IAreaInfo) => {
        setAreaInfo(response);
        const currentStage = +response?.events[0]?.note?.split(' ')[1] || 0;
        const slots = response?.schedule?.days[0]?.stages[currentStage - 1];
        const newSlots = timeSlots;
        const today = new Date();
        slots.forEach(slot => {
          const [startA, endA] = slot.split('-');
          const startDateTime = dayjs(
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              +startA.split(':')[0],
              +startA.split(':')[1],
            ),
          );
          const endDateTime = dayjs(
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              +endA.split(':')[0],
              +endA.split(':')[1],
            ),
          );
          const start = startDateTime.hour() * 2;
          const end =
            endDateTime.hour() === 0 ? 48 : endDateTime.hour() * 2 + 2;
          for (let i = start; i < end; i++) {
            newSlots[i] = true;
          }
          const shutdownTime = startDateTime.subtract(interval, 'minutes');
          shutdownTime > dayjs() && handleNextEvent(shutdownTime);
        });
        setTimeSlots(newSlots);        
      })
      .catch((error: Error) => {
        setAreaInfo(null);
        setAreaInfoError("Oops! Couldn't load area info. Please try again later")
        window.Main.error(error);
      });
  }, []);

  return (
    <Stack p={5} width="100%">
      {areaInfo ? 
        areaInfoError ? 
          (
          <Alert severity="error">{areaInfoError}</Alert>
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
        ) : (
        <Skeleton animation="wave" variant="rounded" height={100} />
      )}
    </Stack>
  );
};

export default AreaComponent;
