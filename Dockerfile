FROM node:10
WORKDIR /usr/app/mailbag
COPY client ./client 
COPY server ./server
WORKDIR /usr/app/mailbag/client
RUN npm install 
RUN npx webpack --mode production
WORKDIR /usr/app/mailbag/server
RUN npm install 
RUN npx tsc
EXPOSE 3002
CMD [ "node", "./dist/main.js" ]
