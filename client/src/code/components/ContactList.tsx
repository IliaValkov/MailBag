import React from "react";
import {List, Avatar, ListItemAvatar, ListItemText, ListItem } from "@material-ui/core";
import { Person } from "@material-ui/icons";

const ContactList = function ({ state }) {
    return (
        <List>
            {state.contacts.map((value) => {
                return (
                    <ListItem
                        key={value}
                        button
                        onClick={() =>
                            state.showContact(value._id, value.name, value.email)} >
                        <ListItemAvatar>
                            <Avatar><Person /></Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={`${value.name}`} />
                    </ListItem>
                );
            })}
        </List>
    )
}

export default ContactList;