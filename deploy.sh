
#!/bin/bash

# Deployment script for ThunderWin Casino to PrivateAlps VPS
# This script builds the app and uploads it to the server

# Configuration
SERVER_IP="your-server-ip"  # Replace with your actual server IP
SSH_USER="root"             # Replace with your SSH username
SSH_PORT="22"               # Replace with your SSH port if different
DEPLOY_PATH="/var/www/html" # Replace with your web server path
BUILD_FOLDER="dist"         # Local build folder

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment of ThunderWin Casino to PrivateAlps VPS...${NC}"

# Step 1: Build the application
echo -e "${GREEN}Building app...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed! Aborting deployment.${NC}"
  exit 1
fi

echo -e "${GREEN}Build successful!${NC}"

# Step 2: Archive the build
echo -e "${GREEN}Creating archive of build files...${NC}"
cd $BUILD_FOLDER
tar -czf ../deploy.tar.gz .
cd ..

# Step 3: Upload to server
echo -e "${GREEN}Uploading to server...${NC}"
scp -P $SSH_PORT deploy.tar.gz $SSH_USER@$SERVER_IP:/tmp/

if [ $? -ne 0 ]; then
  echo -e "${RED}Upload failed! Aborting deployment.${NC}"
  rm deploy.tar.gz
  exit 1
fi

# Step 4: Deploy on server
echo -e "${GREEN}Deploying on server...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP << 'EOF'
  mkdir -p $DEPLOY_PATH
  rm -rf $DEPLOY_PATH/*
  tar -xzf /tmp/deploy.tar.gz -C $DEPLOY_PATH
  rm /tmp/deploy.tar.gz
  
  # Set proper permissions
  chown -R www-data:www-data $DEPLOY_PATH
  chmod -R 755 $DEPLOY_PATH
  
  # Restart web server (uncomment the appropriate one)
  # systemctl restart nginx
  # systemctl restart apache2
  
  echo "Deployment completed on server"
EOF

# Step 5: Cleanup
echo -e "${GREEN}Cleaning up local files...${NC}"
rm deploy.tar.gz

echo -e "${GREEN}Deployment completed successfully!${NC}"
