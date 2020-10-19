import { Button } from "@material-ui/core";
import  {Message, Contacts}  from "@material-ui/icons/";
import React from "react";

const Toolbar = ({ state }) => {
   return ( 
        <div>
            <Button variant="contained" color="primary"
                size="small" style={{ marginRight: 10 }}
                onClick={() => state.showComposeMessage("new")}>
                <Message style={{marginRight: 10}}/> New Message
            </Button>
            <Button variant="contained" color="primary"
                size="small" style={{ marginRight: 10 }}
                onClick={state.showAddContact} >
                <Contacts style={{marginRight: 10}}/>New Contact
            </Button>        
        </div>
    )
}

export default Toolbar;