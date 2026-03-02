# meadow-connection-solr

Apache Solr connection service for the Meadow data access layer.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Fable Service Provider** -- integrates with the Fable dependency injection ecosystem
- **Full-Text Search Engine** -- connects Meadow to Apache Solr's indexing and search capabilities
- **Schema Field Generation** -- produces Solr field descriptors from Meadow table schemas
- **Meadow-Compatible Settings** -- accepts both Meadow-style (`Server`, `Port`) and native `solr-client` property names
- **HTTPS Support** -- optional secure connections via the `Secure` setting
- **Auto-Connect Mode** -- optionally connect during service construction
- **Graceful Driver Detection** -- lazy-loads `solr-client` with a try/catch guard

## Installation

```shell
npm install meadow-connection-solr
```

## Quick Start

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
		if (pError) { return console.error(pError); }

		let tmpClient = _Fable.MeadowSolrProvider.pool;
		// tmpClient is the solr-client instance -- ready for queries
	});
```

## Configuration

Settings are read from `fable.settings.Solr`:

| Setting | Alias | Default | Description |
|---------|-------|---------|-------------|
| `Server` | `host` | `localhost` | Solr host |
| `Port` | `port` | `8983` | Solr port |
| `Core` | `core` | `default` | Solr core name |
| `Path` | `path` | `/solr` | Solr base path |
| `Secure` | `secure` | `false` | Use HTTPS instead of HTTP |

## API

| Method | Description |
|--------|-------------|
| `connect()` | Synchronous -- create the `solr-client` instance |
| `connectAsync(fCallback)` | Callback-style connection (recommended) |
| `pool` | Getter -- returns the `solr-client` instance |
| `generateCreateTableStatement(schema)` | Generate a Solr field descriptor |
| `createTable(schema, fCallback)` | Prepare a Solr schema for a collection |
| `createTables(schema, fCallback)` | Prepare multiple schemas sequentially |
| `generateDropTableStatement(name)` | Generate a drop collection descriptor |

## Field Type Mapping

| Meadow DataType | Solr Field Type | Description |
|-----------------|-----------------|-------------|
| `ID` | `pint` | Integer primary key |
| `GUID` | `string` | Exact-match string |
| `ForeignKey` | `pint` | Integer foreign key |
| `Numeric` | `pint` | Integer value |
| `Decimal` | `pfloat` | Floating-point value |
| `String` | `string` | Exact-match string |
| `Text` | `text_general` | Full-text analyzed field |
| `DateTime` | `pdate` | Date/time value |
| `Boolean` | `pint` | Integer (0/1) boolean |
| Default | `string` | Fallback string type |

## Part of the Retold Framework

This module is a Meadow connector that plugs into the Retold application framework. It provides the Apache Solr integration layer for the Meadow data access abstraction.

## Testing

```shell
npm test
```

Coverage:

```shell
npm run coverage
```

## Related Packages

- [meadow](https://github.com/stevenvelozo/meadow) -- Data access layer and ORM
- [fable](https://github.com/stevenvelozo/fable) -- Application framework and service manager
- [foxhound](https://github.com/stevenvelozo/foxhound) -- Query generation DSL
- [stricture](https://github.com/stevenvelozo/stricture) -- Schema definition and DDL tools
- [meadow-endpoints](https://github.com/stevenvelozo/meadow-endpoints) -- RESTful endpoint generation
- [meadow-connection-mysql](https://github.com/stevenvelozo/meadow-connection-mysql) -- MySQL / MariaDB connector
- [meadow-connection-mongodb](https://github.com/stevenvelozo/meadow-connection-mongodb) -- MongoDB connector
- [meadow-connection-postgresql](https://github.com/stevenvelozo/meadow-connection-postgresql) -- PostgreSQL connector

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
