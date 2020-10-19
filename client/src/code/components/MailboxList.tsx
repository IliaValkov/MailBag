import React from "react";
import { Chip, List } from "@material-ui/core";

const MailboxList = ({ state }) => {
    return (
        <List>
            {state.mailboxes.map(value => {
                return (
                <Chip
                    key={`${value.name}`}
                    label={`${value.name}`}
                    onClick={() => state.setCurrentMailbox(value.path)}
                    style={{width: 128, marginBottom: 10}}
                    color={state.currentMailbox === value.path ? "secondary" : "primary"}
                />)
            })}
        </List>
    )
}


export default MailboxList;