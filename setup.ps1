# Setup script for Data Alchemist project

Write-Host "Setting up Data Alchemist: AI-Powered Resource Configurator..."

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Create .env.local file if it doesn't exist
if (-not (Test-Path -Path ".env.local")) {
    Write-Host "Creating .env.local file..."
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "Please update the .env.local file with your OpenAI API key."
}

# Build the project
Write-Host "Building the project..."
npm run build

# Start the development server
Write-Host "Starting the development server..."
Write-Host "You can access the application at http://localhost:3000"
npm run dev