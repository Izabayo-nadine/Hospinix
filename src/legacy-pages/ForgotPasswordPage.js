import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import AuthService from "../services/auth.service";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await AuthService.forgotPassword(email);
      setSuccess(
        response.message ||
          "Password reset instructions have been sent to your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to process your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
          Forgot Password
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you a link to reset your
          password.
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
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                required
                disabled={isSubmitting || !!success}
              />
              <FormHelperText>
                We'll send a password reset link to this email address.
              </FormHelperText>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting || !!success}
              fullWidth
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
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

export default ForgotPasswordPage;
