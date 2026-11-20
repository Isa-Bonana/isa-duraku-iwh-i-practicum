require('dotenv').config({ quiet: true });
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
// The token is read from the local .env file (ignored by git), so it never ends up in the repo.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// Custom object "Football players" in the developer test account.
const OBJECTS_BASE = 'https://api.hubapi.com/crm/v3/objects';
const OBJECT_TYPE_ID = '2-256915071';
const PROPERTIES = ['name', 'position', 'club'];

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

// * Code for Route 1 goes here
app.get('/', async (req, res) => {
    // Custom properties are only returned when you ask for them in ?properties=
    const getRecords = `${OBJECTS_BASE}/${OBJECT_TYPE_ID}?limit=100&properties=${PROPERTIES.join(',')},hubspot_owner_id`;
    const getOwners = 'https://api.hubapi.com/crm/v3/owners?limit=100';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        const resp = await axios.get(getRecords, { headers });
        const data = resp.data.results;

        // Turn owner IDs into names for the table. If this fails, the table still shows without names.
        let ownerNames = {};
        try {
            const ownersResp = await axios.get(getOwners, { headers });
            ownersResp.data.results.forEach(owner => {
                ownerNames[owner.id] = `${owner.firstName} ${owner.lastName}`;
            });
        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
        }

        res.render('homepage', { title: 'Football Players | Integrating With HubSpot I Practicum', data, ownerNames });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send('Could not load the records from HubSpot. Check the terminal for details.');
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

// * Code for Route 2 goes here
app.get('/update-cobj', async (req, res) => {
    // Get the HubSpot users so the form can offer an owner dropdown (needs the crm.objects.owners.read scope).
    const getOwners = 'https://api.hubapi.com/crm/v3/owners?limit=100';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    let owners = [];
    try {
        const resp = await axios.get(getOwners, { headers });
        owners = resp.data.results;
    } catch (error) {
        // Without owners the form still works, just without the dropdown.
        console.error(error.response ? error.response.data : error.message);
    }

    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum', owners });
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

// * Code for Route 3 goes here
app.post('/update-cobj', async (req, res) => {
    // Only send the three properties of the form to HubSpot.
    const newPlayer = {
        properties: {
            name: req.body.name,
            position: req.body.position,
            club: req.body.club
        }
    };

    // Owner is optional: only send it when one was picked in the form.
    if (req.body.hubspot_owner_id) {
        newPlayer.properties.hubspot_owner_id = req.body.hubspot_owner_id;
    }

    const createRecord = `${OBJECTS_BASE}/${OBJECT_TYPE_ID}`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        await axios.post(createRecord, newPlayer, { headers });
        res.redirect('/');
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send('Could not create the record in HubSpot. Check the terminal for details.');
    }
});

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));