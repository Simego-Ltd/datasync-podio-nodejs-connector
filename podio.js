var url = require('url');
var https = require('https');

// TODO: OAuth Authentication (Podio's OAuth2 is a bit different so need a way to handle it)
const ACCESS_TOKEN = process.env.PODIO_ACCESS_TOKEN;

module.exports.default_schema = () => ({
    "UpdateKeyColumn": "item_id",
    "UpdateKeyColumnDataType": "System.Int32",
    "BlobNameColumnFormat": null,
    "BlobUrlFormat": null,    
    "Configuration": {
        "ReadOperationMode": "GET",
        "ReadBatchSize": 50,
        "UpdateBatchSize": 25,
        "Parameters":[
            { "Name": "Space", "Value": "1234" }
        ]
    },
    "Columns": [
        {
            "Name": "item_id",
            "DataType": "System.Int32",
            "MaxLength": 0,
            "AllowNull": false,
            "Unique": true,
            "System": false,
            "ReadOnly": false
        },
        {
            "Name": "app_item_id",
            "DataType": "System.Int32",
            "MaxLength": 0,
            "AllowNull": true,
            "Unique": false,
            "System": false,
            "ReadOnly": false
        },
        {
            "Name": "title",
            "DataType": "System.String",
            "MaxLength": 0,
            "AllowNull": true,
            "Unique": false,
            "System": false,
            "ReadOnly": false
        }
    ]
});

module.exports.getJson = async (uri) => {
    return new Promise((resolve, reject) => {
        
        const u = url.parse(uri);

        const options = {
            hostname: u.hostname,
            port: u.port,
            path: u.path,
            query: u.query,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `OAuth2 ${ACCESS_TOKEN}`
            }
        };
                
        var req = https.request(options, function(res) {                        
            let data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(JSON.parse(Buffer.concat(data).toString('utf8'))));          
        });
            
        req.on('error', (e) => reject(e));

        req.end();            
    });    
};

module.exports.postJson = async (uri, data) => {
    return new Promise((resolve, reject) => {
    
        const u = url.parse(uri);
        const dataStr = JSON.stringify(data);

        const options = {
            hostname: u.hostname,
            port: u.port,
            path: u.path,
            query: u.query,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `OAuth2 ${ACCESS_TOKEN}`,
                'Content-Length': dataStr.length,
            }
        };
                
        var req = https.request(options, function(res) {                        
            let data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(JSON.parse(Buffer.concat(data).toString('utf8'))));          
        });
            
        req.on('error', (e) => reject(e));

        req.write(dataStr);
        req.end();    
    });
};