import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
  Paper,
  Alert,
  Stack,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AuthService from "../services/auth.service";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Missing reset token. Please use the link from your email.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await AuthService.resetPassword(token, password);
      setSuccess(
        response.message || "Your password has been reset successfully."
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 2,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reset Password
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Enter your new password below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <TextField
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                required
                disabled={isSubmitting || !!success || !token}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText>
                Password must be at least 6 characters.
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth>
              <TextField
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                required
                disabled={isSubmitting || !!success || !token}
              />
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting || !!success || !token}
              fullWidth
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                href="#"
                onClick={() => navigate("/login")}
                sx={{ cursor: "pointer" }}
              >
                Back to Login
              </Link>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
