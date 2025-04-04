import { useState } from 'react';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * Props for the PasswordField component
 */
interface PasswordFieldProps extends Omit<TextFieldProps, 'type'> {
  showToggle?: boolean;
}

/**
 * A TextField component specifically for password input with optional visibility toggle
 */
const PasswordField = ({ 
  showToggle = true, 
  label = 'Password',
  ...textFieldProps 
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <TextField
      label={label}
      type={showPassword ? 'text' : 'password'}
      autoComplete={label.toLowerCase()}
      {...textFieldProps}
      InputProps={{
        ...textFieldProps.InputProps,
        endAdornment: showToggle ? (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleTogglePassword}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : textFieldProps.InputProps?.endAdornment,
      }}
    />
  );
};

export default PasswordField; 