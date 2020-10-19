import path from "path";
import express, {Express, NextFunction, Request, Response} from "express";
import {serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./Contacts";
import {IContact} from "./Contacts"; 
import { ReplOptions } from "repl";

// this creates the Express app
const app: Express = express();

// adding middleware to Express;takes care of parsing requests containig JSON
app.use(express.json());

// make Express act as a web server
// here the express.static middleware provided by Express for serving
// static resources
app.use("/",
    express.static(path.join(__dirname, "../../client/dist"))
);

// This prevents the CORS limitation to hinder development
// CORS is a security mechanisms built into browsers. It ensures
// that only certain domains may call a REST service. It will e.g.
// block(reject) requests from unspecified domains, from a web page
// loaded from the file system or tools for testing REST services.
// More on CORS: https://www.codecademy.com/articles/what-is-cors#:~:text=CORS%20allows%20servers%20to%20specify,the%20building%20who%20has%20one.
// ...
// This is i.e. a custom middleware for handling CORS. It is passed to 
// app.use(), which executes all middleware functions in order passed to 
// it like .json() from earlier. That's why it has to call inNext() at the
// end.
app.use(function(
    inRequest: Request, 
    inResponse: Response, 
    inNext: NextFunction) {
        // lists allowed domains; * allows every call to come through
        inResponse.header("Access-Control-Allow-Origin", "*");
        // lists HTTP methods to be accepted from external calls; if
        // none are specified, none will come through
        inResponse.header("Access-Control-Allow-Methods", 
            "GET,POST,DELETE,OPTIONS"
        );
        // configure additional headers; 
        inResponse.header("Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept"
        );
        inNext();
    }
    );
// SIDENOTE: This app is essentially acting as a proxy between 
// the client and the mail tools used(IMAP, SMTP and Contacts).
// More on proxys: https://www.varonis.com/blog/what-is-a-proxy-server/

//  Endopoint: List Maiboxes
app.get("/mailboxes",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            // since we use await here for an asynchronous call,
            // the async kw must be used before the callback funciton,
            // supplied to the app.XXX() call, here app.get()
            const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
            // the mailboxes object is passed to the response object, 
            // which returns it to the caller as json. 
            inResponse.status(200).json(mailboxes);
        }catch(inError){
            inResponse.send("Error in /mailboxes GET" + inError.code);
        }
    }
);

//  Endopoint: List Messages
app.get("/mailboxes/:mailbox",
    async (inRequest: Request, inResponse: Response) => {
        try{
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messages: IMAP.IMessage[] = await imapWorker.listMessages({
                mailbox : inRequest.params.mailbox
            });
            inResponse.status(200).json(messages);
        }catch(inError){
            inResponse.send("Error in /mailboxes/:mailbox GET " + inError);
        } 
    }
);

//  Endopoint: Get a Message
app.get("/messages/:mailbox/:id",
    async (inRequest: Request, inResponse: Response)=> {
        try{
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messageBody: string = await imapWorker.getMessageBody({
                mailbox: inRequest.params.mailbox,
                id: parseInt(inRequest.params.id, 10)
            });
            inResponse.status(200).send(messageBody);
       }catch(inError){
            inResponse.send("Error in /mailboxes/:mailbox/:id GET " + inError.code);
        } 
    }
);

//  Endopoint: Delete a Message
app.delete("/messages/:mailbox/:id",
    async (inRequest: Request, inResponse: Response)=> {
        try{
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            await imapWorker.deleteMessage({
                mailbox: inRequest.params.mailbox,
                id: parseInt(inRequest.params.id, 10)
            });
            inResponse.status(204).send("ok");
       }catch(inError){
            inResponse.send("Error in /mailboxes/:mailbox/:id DELETE " + inError.code);
        } 
    }
);

// Endpoint: Send a Message
app.post("/messages",
    async (inRequest: Request, inResponse: Response)=> {
        try{
            const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
            // Worth noting is, here the inRequest.body would contain,
            // all needed info for the sending of an email (adress,
            // subject and text). It will ALSO be nicely parsed to json
            // because of the .json() middleware declared earlier
            await smtpWorker.sendMessage(inRequest.body);
            inResponse.status(204).send("ok");
        }catch(inError){
            inResponse.send("Error in /messages POST " + inError.code);
        } 
    }
);

// Endpoint: List Contacts
app.get("/contacts", 
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contacts: IContact[] = await contactsWorker.listContacts();
            inResponse.json(contacts);
        }catch (inError) {
            inResponse.send("Error in /contacts GET " + inError.code);
        }
    }
);

// Endpoint: Add Contact
app.post("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try{
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactsWorker.addContact(
                inRequest.body);
            // Note that the contact is returned here. This will allow
            // the client to display the contact immediately display it
            // instead of making a new call to get contacts.
            inResponse.status(201).json(contact);
        }catch(inError){
            inResponse.send("Error in /contacts POST " + inError.code);
        } 
    }
);

//Endpont: Delete Contact
app.delete("/contacts/:id",
    async (inRequest: Request, inResponse: Response) => {
        try{
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            await contactsWorker.deleteContact(inRequest.params.id);
            inResponse.status(204).send("ok");
        }catch(inError){
            inResponse.send("Error in /contacts/:id DELETE " + inError.code);
        } 
    }
);


//Endpoint: Update Contact
app.put("/contacts/:id",
    async (inRequest: Request, inResponse: Response) => {
        try{
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            await contactsWorker.updateContact(inRequest.params.id, inRequest.body.name, inRequest.body.email);
            inResponse.status(201).send("ok");
        }catch(inError){
            inResponse.send("Error in /contacts/:id PUT");
        }
    }
);

app.listen(3002);

