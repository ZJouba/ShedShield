import React, { useState } from 'react';
import ICommandComponent, { Command } from "../interfaces/ICommandComponent";
import { Save, Delete } from '@mui/icons-material';
import { Box, TextField, Select, Typography, IconButton, MenuItem, List, ListItem, ListItemText } from '@mui/material';

const initFormState = {
  duration: 5,
  unit: 'minutes',
  command: ''
};

const CommandComponent: React.FC<ICommandComponent> = ({ commands, setCommands }) => {
  const [formState, setFormState] = useState<Command>(initFormState);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value
    });
  }

  const saveCommand = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommands([...commands, { duration: formState.duration, unit: formState.unit, command: formState.command }]);
    setFormState(initFormState);
  }

  const removeCommand = (index: number) => {
    const newCommands = commands.slice(0, index).concat(commands.slice(index + 1))
    setCommands(newCommands);
  }

  return (
    <>
      <Box
        component='form'
        display='flex'
        alignItems='center'
        autoComplete="off"
        onSubmit={saveCommand}
      >
        <TextField
          name='duration'
          type='number'
          variant="outlined"
          value={formState.duration}
          required
          sx={{
            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
              display: "none",
            },
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
            width: '10ch'
          }}
          inputProps={{ min: 1, max: 60 }}
          onChange={handleInputChange}
        />
        <Select
          name='unit'
          value={formState.unit}
          onChange={handleInputChange}
        >
          {['seconds', 'minutes', 'hours'].map(item => {
            return (
              <MenuItem
                key={item}
                value={item}
              >{`${item}`}</MenuItem>
            );
          })}
        </Select>
        <Typography flexShrink={0} px={1} textAlign='center' variant="subtitle1" component="span">
          before loadshedding run
        </Typography>
        <TextField
          variant="outlined"
          required
          name='command'
          value={formState.command}
          onChange={handleInputChange}
        />
        <IconButton aria-label="save" type='submit'>
          <Save />
        </IconButton>
      </Box>
      <Box sx={{ border: 1, borderRadius: 1 }}>
        {commands && commands.length > 0 ?
          <List>
            {commands.map((command, index) => {
              return (
                <ListItem
                  key={JSON.stringify(command)}
                  secondaryAction={
                    <IconButton edge="end" aria-label='delete' onClick={() => removeCommand(index)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText>
                    <Typography variant="body1">
                      {command.duration} {command.unit} before loadshedding run <code>{command.command}</code>
                    </Typography>
                  </ListItemText>
                </ListItem>
              )
            })}
          </List> :
          <Typography display='block' py={2} px={1} variant="subtitle1" component="span">
            Pre-shutdown commands
          </Typography>
        }
      </Box >
    </>
  )
};

export default CommandComponent;