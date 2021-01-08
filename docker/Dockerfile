FROM ubuntu:16.04

RUN apt-get update \
    && apt-get install -y \
    ca-certificates \
    curl \
    fontconfig \
    fonts-liberation \
    gconf-service \
    git \
    libappindicator1 \
    libatk1.0-0 \
    libasound2 \
    libc6 \
    libcairo2 \
    libcups2 \
    libcurl3-dev \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libfreetype6-dev \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libicu-dev \
    libjpeg-dev \
    libmcrypt-dev \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpng12-dev \
    libstdc++6 \
    libssl-dev \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxml2-dev \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    libnss3 \
    locales \
    lsb-release \
    openssl \
    rsyslog \
    unzip \
    vim \
    wget \
    xdg-utils

COPY entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/entrypoint.sh

RUN useradd -m -U -s /bin/bash hostuser

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
    && apt-get install -y nodejs

RUN npm install -g npm-check
RUN npm install -g karma-cli

WORKDIR /var/www/jmask

VOLUME /var/www/jmask

RUN chown hostuser:hostuser /var/www/jmask

# server
EXPOSE 8080

# karma
EXPOSE 9876

ENTRYPOINT ["entrypoint.sh"]
