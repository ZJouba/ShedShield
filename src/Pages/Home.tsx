import { FC, useEffect, useState } from 'react';
import { Settings, Refresh } from '@mui/icons-material';
import { Box, Button, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import IHomePage from '../interfaces/IHomePage';
import AreaComponent from '../components/AreaComponent';
import dayjs, { Dayjs } from 'dayjs';
import ISettings from '../interfaces/ISettings';
import IAreaInfo from '../interfaces/IAreaInfo';

const HomePage: FC<IHomePage> = () => {
  const [settings, setSettings] = useState<ISettings | undefined>();
  const [firstTimeSetup, setFirstTimeSetup] = useState(false);
  const [areaData, setAreaData] = useState<IAreaInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const intervals: NodeJS.Timeout[] = [];

  const updateInfo = (id: string): Promise<IAreaInfo> => {
    const updatedArea: IAreaInfo = {
      id,
      events: null,
      info: null,
      schedule: null,
      error: "",
    };

    return window.Main.getAreaInfo(id)
      .then((response: IAreaInfo) => {
        updatedArea.events = response.events;
        updatedArea.info = response.info;
        updatedArea.schedule = response.schedule;
        return updatedArea;
      })
      .catch((error: Error) => {
        updatedArea.error = error.message;
        window.Main.error(error);
        return updatedArea;
      });
  };

  const updateAreaInfo = (id: string, blah?: string ) => {
    updateInfo(id).then((updatedArea) => {

      setAreaData(prevAreaData => {
        const index = prevAreaData.findIndex(arrArea => arrArea.id === id);

        if (index > -1) {
          const newData = [...prevAreaData];
          newData[index] = updatedArea;
          return newData;
        } else {
          return [...prevAreaData, updatedArea];
        }
      });
    });
  }

  useEffect(() => {
    window.Main.getSettings()
      .then((res: ISettings) => {
        setSettings(res);
        setFirstTimeSetup(!res || res?.espAreas.length <= 0 || !res?.apiKey)
        res?.espAreas.forEach(area => {
          updateAreaInfo(area.id);
        });
      })
      .catch((error: Error) => window.Main.error(error));
  }, []);

  useEffect(() => {
    areaData?.forEach((area, index) => {
      const intervalId = setInterval(() => {
        updateAreaInfo(area.id);
      }, (settings?.updates || 60) * 60000);
      intervals.push(intervalId);
    });

    return () => {
      intervals?.forEach((intervalId) => clearInterval(intervalId));
    }
  }, [areaData]);

  const [currentEvent, setCurrentEvent] = useState<Dayjs>();

  const handleNextEvent = (date: Dayjs) => {
    if (!currentEvent || (date > dayjs() && date < currentEvent)) {
      setCurrentEvent(date);
      window.Main.setCron(date.toDate(), date.format('HH:mm, ddd D MMM'));
    }
  };

  const renderNextEvent = () => {
    if (currentEvent) {
      return (
        <Typography variant="h6" gutterBottom>
          {`Shutting down at ${currentEvent?.format('HH:mm, ddd D MMM')}.`}
        </Typography>
      )
    } else if (!refreshing && areaData.length > 0) {
      return (
        <Typography variant="h6" gutterBottom>
          No upcoming loadshedding for today! 🎉
        </Typography>
      )
    } else {
      return (
        <Typography variant="h6" gutterBottom>
          Loading...
        </Typography>
      )
    }
  };

  return (
    <Box>
      <Box position="absolute" top={0} right={0}>
        <Tooltip title={<>Get latest data from ESP<br />P.S. It uses quota</>}>
          <IconButton aria-label="refresh" onClick={() => {
              setRefreshing(true);
              settings?.espAreas.forEach(area => {
                updateAreaInfo(area.id, "testing");
              });
              setRefreshing(false);
            }}>
            <Refresh />
          </IconButton>
        </Tooltip>
        <IconButton aria-label="settings" component={Link} to="/settings">
          <Settings />
        </IconButton>
      </Box>
      {firstTimeSetup && (
        <Stack alignItems="center" p={2}>
          <Typography textAlign="center" variant="h1" color="gray">
            Welcome to ShedShield
          </Typography>
          <Typography textAlign="center" variant="subtitle1" color="gray">
            A handy little utility that will safely shut down your PC before
            loadshedding hits
          </Typography>
          <Box py={3} display="inline-flex">
            <Typography pr={1} variant="h6" component="span">
              1.
            </Typography>
            <Typography variant="h5" color="gray" component="span">
              First up, go to{' '}
              <Button
                size="small"
                variant="contained"
                component={Link}
                to="/settings"
              >
                Settings
              </Button>{' '}
              and run through the setup
            </Typography>
          </Box>
          <Box py={3} display="inline-flex">
            <Typography pr={1} variant="h6" component="span">
              2.
            </Typography>
            <Typography variant="h5" color="gray" component="span">
              Enjoy stress free shut downs
            </Typography>
          </Box>
        </Stack>
      )}
      {!firstTimeSetup && (
        <Stack alignItems="center" p={2}>
          {renderNextEvent()}
          {(!refreshing && areaData.length > 0) ? areaData.map(area => {
              return (
                <AreaComponent
                  key={area.id}
                  areaInfo={area}
                  interval={settings?.interval || 15}
                  handleNextEvent={handleNextEvent}
                />
              );
            }) :
            <Skeleton>
              <AreaComponent />
            </Skeleton>
          }
        </Stack>
      )}
    </Box>
  );
};

export default HomePage;
