import { FC, useEffect, useState } from 'react';
import { Settings } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import IHomePage from '../interfaces/IHomePage';
import AreaComponent from '../components/AreaComponent';
import dayjs, { Dayjs } from 'dayjs';
import ISettings from '../interfaces/ISettings';

const HomePage: FC<IHomePage> = () => {
  const [settings, setSettings] = useState<ISettings | undefined>();
  const [firstTimeSetup, setFirstTimeSetup] = useState(false);

  useEffect(() => {
    window.Main.getSettings()
      .then((res: ISettings) => {
        setSettings(res);
        setFirstTimeSetup(!res || res?.espAreas.length <= 0 || !res?.apiKey)
      })
      .catch((error: Error) => window.Main.error(error));
  }, []);
  const [currentEvent, setCurrentEvent] = useState<Dayjs>();

  const handleNextEvent = (date: Dayjs) => {
    if (!currentEvent || (date > dayjs() && date < currentEvent)) {
      setCurrentEvent(date);
      window.Main.setCron(date.toDate(), date.format('HH:mm, ddd D MMM'));
    }
  };

  return (
    <Box>
      <Box position="absolute" top={0} right={0}>
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
          {currentEvent && (
            <Typography variant="h6" gutterBottom>
              {`Shutting down at ${currentEvent?.format('HH:mm, ddd D MMM')}.`}
            </Typography>
          )}
          {settings?.espAreas.map(area => {
            return (
              <AreaComponent
                key={area.id}
                id={area.id}
                interval={settings?.interval}
                handleNextEvent={handleNextEvent}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default HomePage;
