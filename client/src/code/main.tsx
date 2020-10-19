// Style imports
import "normalize.css";
import "../css/main.css";
// Module imports
import ReactDOM from "react-dom";
import React from "react";
import * as Contacts from "./Contacts";
import * as IMAP from "./IMAP";
// Component imports
import BaseLayout from "./components/BaseLayout";

const baseComponent = ReactDOM.render(
    <BaseLayout />, document.getElementById("app")
);

baseComponent.state.showHidePleaseWait(true);

async function getMailboxes() {
    const imapWorker: IMAP.Worker = new IMAP.Worker();
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    mailboxes.forEach((inMailbox) => {
        baseComponent.state.addMailboxToList(inMailbox);
    });
}

getMailboxes().then(function(){
    async function getContacts() {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contacts: Contacts.IContact[] = await contactsWorker.listContacts();
        contacts.forEach((inContact)=>{
            baseComponent.state.addContactToList(inContact);
        });
    }
    getContacts().then(()=>{
        baseComponent.state.showHidePleaseWait(false);
    });
});