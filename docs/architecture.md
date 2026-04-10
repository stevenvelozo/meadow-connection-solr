# Architecture

## System Overview

The Solr connector bridges Meadow's data access abstraction with the `solr-client` npm package. Unlike SQL connectors that generate DDL statements, the Solr connector generates schema field descriptors for Solr's Schema API and provides direct access to the Solr client for search, indexing, and document management.

```mermaid
graph TB
	subgraph Application Layer
		APP[Application Code]
		MEA[Meadow ORM]
	end
	subgraph Connection Layer
		MCS["meadow-connection-solr<br/>(MeadowConnectionSolr)"]
		SC[solr-client]
	end
	subgraph Solr Server
		SOLR[(Apache Solr)]
		CORE[Solr Core]
	end
	APP --> MEA
	MEA --> MCS
	MCS --> SC
	SC -->|HTTP/HTTPS| SOLR
	SOLR --> CORE
```

## Connection Lifecycle

```mermaid
sequenceDiagram
	participant App as Application
	participant Fable as Fable
	participant MCS as MeadowConnectionSolr
	participant SC as solr-client
	participant Solr as Apache Solr

	App->>Fable: new libFable(settings)
	App->>Fable: addAndInstantiateServiceType()
	Fable->>MCS: constructor(fable, options)
	MCS->>MCS: Read Solr config
	MCS->>MCS: Normalize property names
	Note over MCS: Server->host, Port->port,<br/>Core->core, Path->path, Secure->secure

	alt Auto-Connect Enabled
		MCS->>MCS: connect()
	end

	App->>MCS: connectAsync(callback)

	alt Already Connected
		MCS-->>App: callback(null, client)
	else Not Connected
		MCS->>MCS: Check solr-client available
		MCS->>MCS: _buildConnectionURL()
		MCS->>SC: solr.createClient(options)
		SC-->>MCS: Solr client instance
		MCS->>MCS: connected = true
		MCS-->>App: callback(null, client)
	end

	App->>MCS: pool (getter)
	MCS-->>App: solr-client instance
	App->>SC: client.search(query, callback)
	SC->>Solr: HTTP request
	Solr-->>SC: JSON response
	SC-->>App: callback(error, result)
```

## Service Provider Model

`MeadowConnectionSolr` extends `fable-serviceproviderbase`, providing standard lifecycle integration with the Fable ecosystem.

```mermaid
classDiagram
	class FableServiceProviderBase {
		+fable
		+options
		+log
		+serviceType
	}
	class MeadowConnectionSolr {
		+serviceType: "MeadowConnectionSolr"
		+connected: boolean
		-_Client: solr-client
		+connect()
		+connectAsync(fCallback)
		+pool: solr-client
		+createTable(schema, fCallback)
		+createTables(schema, fCallback)
		+generateCreateTableStatement(schema)
		+generateDropTableStatement(name)
		-_buildConnectionURL()
	}
	FableServiceProviderBase <|-- MeadowConnectionSolr
```

## Settings Flow

```mermaid
flowchart LR
	subgraph Input Sources
		OPT[Constructor Options]
		SET[fable.settings.Solr]
	end
	subgraph Normalization
		NORM["Property Mapping<br/>Server -> host<br/>Port -> port<br/>Core -> core<br/>Path -> path<br/>Secure -> secure"]
	end
	subgraph Output
		URL["Connection URL<br/>http[s]://host:port/path/core"]
		CONF["solr-client Config<br/>{ host, port, core, path, secure }"]
	end
	OPT --> NORM
	SET --> NORM
	NORM --> URL
	NORM --> CONF
```

## Schema Generation Flow

```mermaid
flowchart TD
	A[Meadow Table Schema] --> B[generateCreateTableStatement]
	B --> C["Field Descriptor<br/>{ operation, collection, fields[] }"]
	C --> D{createTable called?}
	D -->|Yes| E{Connected?}
	E -->|No| F[Callback with error]
	E -->|Yes| G[Log schema prepared]
	G --> H[Callback success]
	D -->|No| I[Return descriptor for inspection]
```

## Connection Safety

```mermaid
flowchart TD
	A[connect called] --> B{Already connected?}
	B -->|Yes| C[Log error]
	C --> D[Return without action]
	B -->|No| E{solr-client installed?}
	E -->|No| F[Log error: not installed]
	E -->|Yes| G[Build connection URL]
	G --> H[Log connection info]
	H --> I[solr.createClient]
	I --> J[Set connected = true]
```

Key safety features:

| Feature | Implementation |
|---------|---------------|
| Double-connect guard | Logs error and returns if `_Client` already exists |
| Missing driver guard | `solr-client` loaded in try/catch; fails gracefully if not installed |
| Missing callback guard | `connectAsync()` provides a no-op callback if none given |
| HTTPS support | `Secure` flag switches protocol from HTTP to HTTPS |

## Connector Comparison

| Feature | Solr | MongoDB | MySQL | PostgreSQL |
|---------|------|---------|-------|-----------|
| Driver | `solr-client` | `mongodb` | `mysql2` | `pg` |
| Protocol | HTTP/HTTPS | TCP | TCP | TCP |
| Connection | HTTP client | MongoClient | Pool | Pool |
| Schema output | Field descriptor | Collection descriptor | SQL DDL | SQL DDL |
| `pool` returns | `solr-client` | `Db` instance | MySQL Pool | `pg.Pool` |
| Primary use case | Full-text search | Document storage | Relational data | Relational data |
| Query language | Solr query syntax | MongoDB query | SQL | SQL |
| Schema model | Fields per core | Collections + indexes | Tables + columns | Tables + columns |
