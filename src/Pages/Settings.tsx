import { ArrowBack, LocationOn, SearchRounded } from '@mui/icons-material';
import {
  debounce,
  Box,
  Stack,
  Autocomplete,
  TextField,
  Grid,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  FormHelperText,
  MenuItem,
  IconButton,
  Typography,
  Link as MUILink,
  Alert,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import { useEffect, useState, useMemo, FC, ChangeEvent } from 'react';
import IAreaResult from '../interfaces/IAreaResult';
import ISearchResult from '../interfaces/ISearchResult';
import ISettings from '../interfaces/ISettings';
import { Link, useNavigate } from 'react-router-dom';
import ISettingsPage from '../interfaces/ISettingsPage';
import CommandComponent from '../components/CommandComponent';
import { Command } from "../interfaces/ICommandComponent";

const intervals = [15, 10, 5, 2];
const updates = [30, 60, 120, 300];
const updateText = ['30 minutes', '1 hour', '2 hours', '3 hours'];

const SettingsPage: FC<ISettingsPage> = ({ themeState, setThemeState }) => {
  useEffect(() => {
    window.Main.getSettings()
      .then((settings: ISettings) => {
        setStepOne(!settings.apiKey);
        setApiKey(settings?.apiKey || '');
        setThemeState(settings?.theme || '');
        setAreaResults(settings?.espAreas || []);
        const checkedAreas = settings?.espAreas.map(area => area.id);
        setAreas(checkedAreas);
        setInterval(settings?.interval || 15);
        setUpdate(settings?.updates || 120);
        setRunAtStartup(settings?.runAtStartup);
        setCommands(settings?.commands || [])
      })
      .catch((error: Error) => {
        window.Main.error(error);
      });
  }, []);

  const [stepOne, setStepOne] = useState(true);
  const [apiKey, setApiKey] = useState<string>('');
  const [address, setAddress] = useState<ISearchResult | null>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<readonly ISearchResult[]>(
    [],
  );
  const [commands, setCommands] = useState<Command[]>([]);

  const [areaResults, setAreaResults] = useState<readonly IAreaResult[]>([]);
  const [loading, setLoading] = useState(false);

  const [areas, setAreas] = useState<string[]>([]);
  const [areasError, setAreasError] = useState("");

  const [interval, setInterval] = useState(15);
  const [update, setUpdate] = useState(120);

  const [runAtStartup, setRunAtStartup] = useState(false);

  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = themeState === 'dark' ? 'light' : 'dark';
    window.theme
      .set(newTheme)
      .then(() => {
        setThemeState(newTheme);
      })
      .catch((error: Error) => {
        window.Main.error(error);
      });
  };

  const fetchResults = useMemo(
    () =>
      debounce((input: string, callback: (results?: any) => void) => {
        window.Main.geolocate(input)
          .then(callback)
          .catch((error: Error) => {
            window.Main.error(error);
          });
      }, 400),
    [],
  );

  const search = () => {
    setLoading(true);
    window.Main.searchArea(`lat=${address?.lat}&lon=${address?.lon}`)
      .then((response: IAreaResult[]) => {
        const newAreaResults = response.filter(
          area => !areas?.includes(area.id),
        );
        setAreaResults([...areaResults, ...newAreaResults]);
        setAreasError("");
      })
      .catch((error: Error) => {
        window.Main.error(error);
        setAreasError("Oops! Couldn't search for loadshedding areas. Please try again later");
        setAreaResults([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults(searchText, (results?: any) => {
      const searchResults: ISearchResult[] = results.map((result: any) => {
        return {
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon,
        };
      });
      setSearchResults(
        searchResults.sort((a, b) =>
          a.display_name.localeCompare(b.display_name),
        ),
      );
    });
  }, [address, searchText, fetchResults]);

  const saveSettings = () => {
    const checkedAreas = areaResults.filter(area => areas?.includes(area.id));
    window.Main.saveSettings({
      apiKey,
      espAreas: checkedAreas,
      theme: themeState,
      interval,
      updates: update,
      runAtStartup,
      commands
    } as ISettings)
      .then(() => {
        if (!stepOne) {
          navigate('/');
        } else {
          navigate(0);
        };
      })
      .catch((error: Error) => {
        window.Main.error(error);
      });
  };

  const handleAreas = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setAreas([...areas, event.target.id]);
    } else {
      const newAreas = areas.filter(area => area !== event.target.id);
      setAreas(newAreas);
    }
  };

  return (
    <>
      <Box position="absolute" top={0} left={0}>
        <IconButton aria-label="settings" component={Link} to="/">
          <ArrowBack />
        </IconButton>
      </Box>
      <Box p={5}>
        <Stack spacing={2}>
          {stepOne &&
            <>
              <Typography pr={1} textAlign='center' variant="subtitle1" component="span">
                Step 1 - Subscribe to the <MUILink href='https://eskomsepush.gumroad.com/l/api'>EskomSePush API</MUILink> using the <b>Free*</b> subscription and enter your API key below then click SAVE SETTINGS
              </Typography>
              <TextField
                variant='outlined'
                label='EskomSePush API Key'
                value={apiKey}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setApiKey(event.target.value)}
              />
            </>
          }
          {!stepOne &&
            <>
              <Autocomplete
                filterOptions={x => x}
                options={searchResults}
                includeInputInList
                filterSelectedOptions
                value={address}
                noOptionsText="No locations found"
                getOptionLabel={option =>
                  typeof option === 'string' ? option : option.display_name
                }
                onChange={(_, newValue: ISearchResult | null) => {
                  setSearchResults(newValue ? [newValue] : searchResults);
                  setAddress(newValue);
                }}
                onInputChange={(_, searchText) => {
                  setSearchText(searchText);
                }}
                renderInput={params => (
                  <TextField {...params} label="Address lookup" />
                )}
                renderOption={(props, option) => {
                  return (
                    <li {...props}>
                      <Grid container alignItems="center">
                        <Grid item sx={{ display: 'flex', width: 44 }}>
                          <LocationOn sx={{ color: 'text.secondary' }} />
                        </Grid>
                        <Grid
                          item
                          sx={{
                            width: 'calc(100% - 44px)',
                            wordWrap: 'break-word',
                          }}
                        >
                          <Box component="span">{option.display_name}</Box>
                        </Grid>
                      </Grid>
                    </li>
                  );
                }}
              />
              <Button
                variant="contained"
                endIcon={<SearchRounded />}
                disabled={!address}
                onClick={search}
              >
                Search for your zone
              </Button>

              <Box py={2}>
                {areaResults && (
                  <FormGroup>
                    <Grid2
                      container
                      spacing={2}
                      columns={5}
                      disableEqualOverflow
                      margin={0}
                    >
                      {areaResults.map(result => (
                        <Grid key={result.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                id={result.id}
                                checked={areas?.includes(result.id)}
                                onChange={(
                                  event: ChangeEvent<HTMLInputElement>,
                                ) => {
                                  handleAreas(event);
                                }}
                              />
                            }
                            label={result?.name}
                          />
                        </Grid>
                      ))}
                    </Grid2>
                  </FormGroup>
                )}
                {areaResults.length <= 0 && loading && <CircularProgress />}
                {areasError && <Alert severity="error">{areasError}</Alert>}
              </Box>
              <Box py={2}>
                <FormControl sx={{ mr: '5%', width: '45%' }}>
                  <InputLabel id="interval-label">Duration</InputLabel>
                  <Select
                    labelId="interval-label"
                    value={interval}
                    label="Interval"
                    onChange={(event: SelectChangeEvent<number>) => {
                      setInterval(+event.target.value);
                    }}
                  >
                    {intervals &&
                      intervals.map(item => {
                        return (
                          <MenuItem
                            key={item}
                            value={item}
                          >{`${item} minutes`}</MenuItem>
                        );
                      })}
                  </Select>
                  <FormHelperText>
                    {`How long before loadshedding \n should your PC be switched off?`}
                  </FormHelperText>
                </FormControl>
                <FormControl sx={{ ml: '5%', width: '45%' }}>
                  <InputLabel id="update-label">Update Interval</InputLabel>
                  <Select
                    labelId="update-label"
                    value={update}
                    label="Update Interval"
                    notched
                    onChange={(event: SelectChangeEvent<number>) => {
                      setUpdate(+event.target.value);
                    }}
                  >
                    {updates &&
                      updates.map((item, index) => {
                        return (
                          <MenuItem
                            key={item}
                            value={item}
                          >{`${updateText[index]}`}</MenuItem>
                        );
                      })}
                  </Select>
                  <FormHelperText>
                    How often should ShedShield check for updates? P.S. This will affect your ESP quota.
                  </FormHelperText>
                </FormControl>
              </Box>
              <FormControlLabel
                value="Launch at startup"
                control={
                  <Checkbox
                    checked={runAtStartup}
                    onChange={e => setRunAtStartup(e.target.checked)}
                  />
                }
                label="Launch at startup"
              />
              <CommandComponent commands={commands} setCommands={setCommands}/>
            </>}
          <Button onClick={saveSettings}>Save Settings</Button>
          <Button onClick={toggleTheme}>Toggle</Button>
        </Stack>
      </Box>
    </>
  );
};

export default SettingsPage;
