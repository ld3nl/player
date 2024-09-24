// Function to get the base URL based on the environment
// Function to get the base URL based on the environment
// Function to get the base URL based on the environment
export const get_base_url = () => {
  // Retrieve the environment variable
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const vercelUrl =
    process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;

  // Determine the base URL based on the environment
  switch (env) {
    case "production": {
      if (!vercelUrl) throw new Error("NEXT_PUBLIC_VERCEL_URL is not defined");
      return `https://${vercelUrl}`;
    }
    case "preview": {
      if (!vercelUrl) throw new Error("VERCEL_URL is not defined");
      return `https://${vercelUrl}`;
    }
    default:
      return "http://localhost:3000";
  }
};

// Function to verify required environment variables
const verify_env_variables = () => {
  // List of required environment variables
  const required_vars = [
    "NEXT_PUBLIC_VERCEL_ENV",
    "NEXT_PUBLIC_VERCEL_URL",
    "VERCEL_URL",
  ];

  // Check if each required variable is defined
  required_vars.forEach((variable) => {
    if (!process.env[variable]) {
      console.warn(`Environment variable ${variable} is not defined.`);
    }
  });
};

// Verify environment variables at runtime
verify_env_variables();
