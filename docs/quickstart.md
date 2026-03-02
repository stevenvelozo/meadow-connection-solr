# Quickstart

Get a Solr connection running in five steps.

## Step 1: Install

```bash
npm install meadow-connection-solr fable
```

Requires a running Apache Solr instance (local or remote). The module uses the `solr-client` npm package.

## Step 2: Configure and Connect

```javascript
const libFable = require('fable');
const libMeadowConnectionSolr = require('meadow-connection-solr');

let _Fable = new libFable(
	{
		"Solr":
		{
			"Server": "localhost",
			"Port": 8983,
			"Core": "mycore"
		}
	});

_Fable.serviceManager.addAndInstantiateServiceType(
	'MeadowSolrProvider', libMeadowConnectionSolr);

_Fable.MeadowSolrProvider.connectAsync(
	(pError, pClient) =>
	{
		if (pError)
		{
			console.error('Connection failed:', pError);
			return;
		}
		console.log('Connected to Solr!');
	});
```

## Step 3: Generate a Schema Descriptor

Define a Meadow table schema and generate a Solr field descriptor. The descriptor maps Meadow data types to Solr field types.

```javascript
let tmpAnimalSchema =
{
	TableName: 'Animal',
	Columns:
	[
		{ Column: 'IDAnimal', DataType: 'ID' },
		{ Column: 'GUIDAnimal', DataType: 'GUID' },
		{ Column: 'Name', DataType: 'String' },
		{ Column: 'Age', DataType: 'Numeric' },
		{ Column: 'Weight', DataType: 'Decimal' },
		{ Column: 'Description', DataType: 'Text' },
		{ Column: 'CreateDate', DataType: 'DateTime' },
		{ Column: 'Deleted', DataType: 'Boolean' },
		{ Column: 'IDFarm', DataType: 'ForeignKey' }
	]
};

let tmpDescriptor = _Fable.MeadowSolrProvider.generateCreateTableStatement(tmpAnimalSchema);
console.log(tmpDescriptor);
```

The generated descriptor:

```javascript
{
	operation: 'schemaUpdate',
	collection: 'Animal',
	fields:
	[
		{ name: 'IDAnimal', type: 'pint' },
		{ name: 'GUIDAnimal', type: 'string' },
		{ name: 'Name', type: 'string' },
		{ name: 'Age', type: 'pint' },
		{ name: 'Weight', type: 'pfloat' },
		{ name: 'Description', type: 'text_general' },
		{ name: 'CreateDate', type: 'pdate' },
		{ name: 'Deleted', type: 'pint' },
		{ name: 'IDFarm', type: 'pint' }
	]
}
```

## Step 4: Apply the Schema

Use `createTable()` to prepare the schema for a collection:

```javascript
_Fable.MeadowSolrProvider.createTable(tmpAnimalSchema,
	(pError) =>
	{
		if (pError)
		{
			console.error('Schema preparation failed:', pError);
			return;
		}
		console.log('Animal schema prepared!');
	});
```

## Step 5: Use the Solr Client

Access the `solr-client` instance via the `pool` getter and perform search operations:

```javascript
let tmpClient = _Fable.MeadowSolrProvider.pool;

// Search
let tmpQuery = tmpClient.query().q('Name:Luna');
tmpClient.search(tmpQuery,
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }
		console.log('Found:', pResult.response.numFound);
		console.log('Documents:', pResult.response.docs);
	});

// Add a document
tmpClient.add(
	{
		IDAnimal: 1,
		GUIDAnimal: '550e8400-e29b-41d4-a716-446655440000',
		Name: 'Luna',
		Age: 5,
		Weight: 4.5,
		Description: 'A friendly tabby cat'
	},
	(pError, pResult) =>
	{
		if (pError) { return console.error(pError); }

		// Commit changes
		tmpClient.commit(
			(pCommitError) =>
			{
				if (pCommitError) { return console.error(pCommitError); }
				console.log('Document indexed!');
			});
	});
```

## HTTPS Configuration

For secure Solr instances, enable HTTPS via the `Secure` setting:

```javascript
let _Fable = new libFable(
	{
		"Solr":
		{
			"Server": "secure-solr.example.com",
			"Port": 8984,
			"Core": "prodcore",
			"Secure": true
		}
	});
```

This produces the connection URL `https://secure-solr.example.com:8984/solr/prodcore`.

## Custom Base Path

If your Solr instance is mounted at a non-standard path:

```javascript
let _Fable = new libFable(
	{
		"Solr":
		{
			"Server": "localhost",
			"Port": 8983,
			"Core": "mycore",
			"Path": "/search/solr"
		}
	});
```

This produces the connection URL `http://localhost:8983/search/solr/mycore`.

## Auto-Connect Mode

Skip the explicit `connectAsync()` call by enabling auto-connect:

```javascript
let _Fable = new libFable(
	{
		"Solr":
		{
			"Server": "localhost",
			"Port": 8983,
			"Core": "mycore"
		},
		"MeadowConnectionSolrAutoConnect": true
	});

_Fable.serviceManager.addAndInstantiateServiceType(
	'MeadowSolrProvider', libMeadowConnectionSolr);

// Already connected -- client is ready
let tmpClient = _Fable.MeadowSolrProvider.pool;
```
