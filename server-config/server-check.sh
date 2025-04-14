
#!/bin/bash

# Server configuration check script for ThunderWin Casino
# This script verifies the server meets requirements for running the app

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Checking server configuration for ThunderWin Casino...${NC}"

# Check OS
echo -n "Checking Operating System: "
if [[ $(lsb_release -d) == *"Ubuntu 18.04"* ]]; then
  echo -e "${GREEN}Ubuntu 18.04 (Supported)${NC}"
else
  echo -e "${YELLOW}$(lsb_release -d) (May not be fully supported)${NC}"
fi

# Check CPU cores
echo -n "Checking CPU cores: "
CORES=$(grep -c ^processor /proc/cpuinfo)
if [ $CORES -ge 6 ]; then
  echo -e "${GREEN}$CORES cores (Good)${NC}"
else
  echo -e "${YELLOW}$CORES cores (Recommended: 6 or more)${NC}"
fi

# Check memory
echo -n "Checking Memory: "
TOTAL_MEM=$(free -h | grep "Mem:" | awk '{print $2}')
TOTAL_MEM_MB=$(free -m | grep "Mem:" | awk '{print $2}')
if [ $TOTAL_MEM_MB -ge 4000 ]; then
  echo -e "${GREEN}$TOTAL_MEM (Good)${NC}"
else
  echo -e "${YELLOW}$TOTAL_MEM (Recommended: 4GB or more)${NC}"
fi

# Check disk space
echo -n "Checking Disk Space: "
DISK_SPACE=$(df -h / | grep / | awk '{print $4}')
DISK_SPACE_GB=$(df -BG / | grep / | awk '{print $4}' | sed 's/G//')
if [ $DISK_SPACE_GB -ge 60 ]; then
  echo -e "${GREEN}$DISK_SPACE available (Good)${NC}"
else
  echo -e "${YELLOW}$DISK_SPACE available (Recommended: 60GB or more)${NC}"
fi

# Check for web server
echo -n "Checking Web Server: "
if command -v nginx &> /dev/null; then
  NGINX_VERSION=$(nginx -v 2>&1 | cut -d '/' -f 2)
  echo -e "${GREEN}Nginx $NGINX_VERSION${NC}"
elif command -v apache2 &> /dev/null; then
  APACHE_VERSION=$(apache2 -v | grep "Server version" | cut -d '/' -f 2 | cut -d ' ' -f 1)
  echo -e "${GREEN}Apache $APACHE_VERSION${NC}"
else
  echo -e "${RED}No web server detected. Please install Nginx or Apache.${NC}"
fi

# Check for ssl certificates
echo -n "Checking SSL Certificates: "
if [ -d "/etc/letsencrypt/live" ]; then
  DOMAINS=$(ls -1 /etc/letsencrypt/live)
  if [ -n "$DOMAINS" ]; then
    echo -e "${GREEN}Certificates found for domains: ${NC}"
    echo "$DOMAINS"
  else
    echo -e "${YELLOW}Letsencrypt directory exists but no certificates found.${NC}"
  fi
else
  echo -e "${YELLOW}No SSL certificates found. Please install certificates.${NC}"
fi

# Check for ports
echo -n "Checking Required Ports: "
if command -v netstat &> /dev/null; then
  HTTP_PORT=$(netstat -tulpn | grep :80 | wc -l)
  HTTPS_PORT=$(netstat -tulpn | grep :443 | wc -l)
  
  if [ $HTTP_PORT -gt 0 ] && [ $HTTPS_PORT -gt 0 ]; then
    echo -e "${GREEN}Ports 80 and 443 are open${NC}"
  elif [ $HTTP_PORT -gt 0 ]; then
    echo -e "${YELLOW}Port 80 is open, but 443 is not${NC}"
  elif [ $HTTPS_PORT -gt 0 ]; then
    echo -e "${YELLOW}Port 443 is open, but 80 is not${NC}"
  else
    echo -e "${RED}Neither port 80 nor 443 is open${NC}"
  fi
else
  echo -e "${YELLOW}Could not check ports (netstat not installed)${NC}"
fi

echo -e "\n${GREEN}Server check complete!${NC}"
