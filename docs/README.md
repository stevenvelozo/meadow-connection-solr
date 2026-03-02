# meadow-connection-solr

Apache Solr connection service for the Meadow data access layer. This module provides client management, schema field generation, and collection descriptor creation for applications using Apache Solr as their search and indexing engine.

## Quick Start

```javascript
const libFable = require('fable');
const libMeadowConnectionSolr = require('meadow-connection-solr');

// 1. Create a Fable instance with Solr settings
let _Fable = new libFable(
	{
		"Solr":
		{
			"Server": "localhost",
			"Port": 8983,
			"Core": "mycore"
		}
	});

// 2. Register and instantiate the service
_Fable.serviceManager.addAndInstantiateServiceType(
	'MeadowSolrProvider', libMeadowConnectionSolr);

// 3. Connect
_Fable.MeadowSolrProvider.connectAsync(
	(pError, pClient) =>
	{
		if (pError) { return console.error(pError); }

		// 4. Use the solr-client instance
		let tmpClient = _Fable.MeadowSolrProvider.pool;

		// Search for documents
		let tmpQuery = tmpClient.query().q('Name:Luna');
		tmpClient.search(tmpQuery,
			(pSearchError, pResult) =>
			{
				console.log('Results:', pResult.response.docs);
			});
	});
```

## Configuration

Settings are read from `fable.settings.Solr`. Both Meadow-style names and native `solr-client` names are supported:

| Setting | Alias | Default | Description |
|---------|-------|---------|-------------|
| `Server` | `host` | `localhost` | Solr server hostname or IP |
| `Port` | `port` | `8983` | Solr HTTP port |
| `Core` | `core` | `default` | Solr core (collection) name |
| `Path` | `path` | `/solr` | Solr base path |
| `Secure` | `secure` | `false` | Use HTTPS instead of HTTP |

### Connection URL

The driver builds a standard Solr URL from these settings:

```
http://host:port/path/core        (default)
https://host:port/path/core       (with Secure: true)
```

## How It Fits

```
Application
    |
    v
 Meadow (ORM)
    |
    v
 meadow-connection-solr  <-- this module
    |
    v
 solr-client (npm)
    |
    v
 Apache Solr Server
```

## Learn More

- [Quickstart Guide](quickstart.md) -- step-by-step setup
- [Architecture](architecture.md) -- connection lifecycle and design diagrams
- [Schema & Field Types](schema.md) -- field type mapping and schema descriptors
- [API Reference](api/reference.md) -- complete method documentation

## Companion Modules

| Module | Purpose |
|--------|---------|
| [meadow](https://github.com/stevenvelozo/meadow) | Data access layer and ORM |
| [foxhound](https://github.com/stevenvelozo/foxhound) | Query generation DSL |
| [stricture](https://github.com/stevenvelozo/stricture) | Schema definition and DDL tools |
| [meadow-connection-mysql](https://github.com/stevenvelozo/meadow-connection-mysql) | MySQL / MariaDB connector |
| [meadow-connection-mongodb](https://github.com/stevenvelozo/meadow-connection-mongodb) | MongoDB connector |
| [meadow-connection-postgresql](https://github.com/stevenvelozo/meadow-connection-postgresql) | PostgreSQL connector |
| [meadow-connection-sqlite](https://github.com/stevenvelozo/meadow-connection-sqlite) | SQLite connector |
| [meadow-connection-dgraph](https://github.com/stevenvelozo/meadow-connection-dgraph) | Dgraph graph database connector |
