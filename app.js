'use strict'

const express = require('express');
const podio = require("./podio");

const app = express();
const port = process.env.PORT || '3000';

app.use(express.json());

// Get the Podio Apps on this API
app.get('/list', runAsyncWrapper(async (req, res) => {
 
    let list = [];

    let { response, data } = await podio.getJson('https://api.podio.com/org/');

    if(response.statusCode != 200)
        res.sendStatus(response.statusCode).send(response.statusMessage);

    for(const org of data) {

        for(const space of org.spaces) {
            
            let { data: space_data } = await podio.getJson(`https://api.podio.com/app/space/${space.space_id}/`);

            space_data.forEach(app => {
                list.push(`${org.name}-${space.name}-${app.config.name}|${app.app_id}`);                    
            });
            
        }
    }
    
    res.send(list);    
             
}));

// Get the Schema
app.get('/list/:id/schema', runAsyncWrapper(async (req, res) => { 
    const app = req.params.id;
    const app_id = app.split('|')[1];

    const { response, data } = await podio.getJson(`https://api.podio.com/app/${app_id}`);
                
    const schema = podio.default_schema();

    // TODO: Match Podio Data Types to Data Sync Types

    data.fields.forEach(field => 
        schema.Columns.push(
                ({
                "Name": field.label,
                "DataType": "System.String",
                "MaxLength": -1,
                "AllowNull": true,
                "Unique": false,
                "System": false,
                "ReadOnly": false
            })
    ));
    
    res.send(schema);

}));

// Get the Data
app.get('/list/:id', runAsyncWrapper(async (req, res) => {
    const app = req.params.id;
    const app_id = app.split('|')[1];
    const limit = parseInt(req.query.limit) || 100;
    const start = parseInt(req.query.page) || 1;

    const uri = `https://api.podio.com/item/app/${app_id}/filter/?fields=items.view(micro).fields(fields,app_item_id_formatted,external_id,created_on,created_by.view(micro),last_event_on)`;

    const options = { 
            limit: limit, 
            offset: (start - 1) * limit
    };

    const { response, data } = await podio.postJson(uri, options);
        
    const total = data.total;    
    const totalpages = Math.ceil(total / limit);
    const next = start < totalpages ? start + 1 : 0;                    
    const data_rows = [];

    data.items.forEach(item => {
        let row = {
            item_id: item.item_id,
            app_item_id: item.app_item_id,
            title: item.title      
        }
        item.fields.forEach(field => {
            // TODO: Pull out values based on the actual Podio Data Type
            row[field.label] = field.values[0].value;
        });
        data_rows.push(row);

    });
    return res.send(
        {
            "list": app,
            "filter": null,
            "orderby": null,
            "currentpage": start,
            "nextpage": next,
            "totalpages": totalpages,
            "count": total,
            "data": data_rows
        });                                
    
}));

// ADD Rows
app.post('/list/:id', runAsyncWrapper(async (req, res) => {
    const app = req.params.id;
    const body = req.body;
    const key = 'item_id';

    body.items.forEach(item => {    
        // TODO: Add Items
    });

    res.send({ success: true });
}));

// UPDATE Rows
app.put('/list/:id', runAsyncWrapper(async (req, res) => {
    const app = req.params.id;
    const body = req.body;
    const key = 'item_id';

    body.items.forEach(item => {
        // TODO: Update Items
    });

    res.send({ success: true });
}));

// DELETE Rows
app.delete('/list/:id', runAsyncWrapper(async (req, res) => {
    const app = req.params.id;
    const body = req.body;
    const key = 'item_id';

    const todelete = body.items.map(p => p[key]);        
    // TODO: Delete Items

    res.send({ success: true });
}));

app.use(errorHandler);
app.listen(port, () => console.log(`Simego WebAPI for Podio listening on port ${port}!`));


function runAsyncWrapper (callback) {
    return (req, res, next) => {
      callback(req, res, next).catch(next); 
    }
}

function errorHandler (err, req, res, next) {
    res.status(500).send({ error: err.name, message:  err.message, stack: err.stack });    
}
