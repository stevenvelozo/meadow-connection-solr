# connect()

Synchronous method that creates the `solr-client` instance.

## Signature

```javascript
connect()
```

## Parameters

None.

## Return Value

None.

## Behavior

1. If already connected (`this._Client` exists), logs an error and returns without action
2. If `solr-client` is not installed, logs an error and returns
3. Builds the connection URL via `_buildConnectionURL()` (e.g. `http://localhost:8983/solr/default`)
4. Creates a new solr-client via `solr.createClient(options)`
5. Sets `this.connected = true`

## Usage

```javascript
_Fable.MeadowSolrProvider.connect();

if (_Fable.MeadowSolrProvider.connected)
{
	let tmpClient = _Fable.MeadowSolrProvider.pool;
	// Use the client
}
```

## Why Both connect() and connectAsync()?

The `solr-client` constructor is synchronous -- it creates an HTTP client configuration without opening a persistent connection. The `connect()` method works reliably for immediate use. However, `connectAsync()` is preferred because:

- It follows the Fable service provider convention
- It provides error handling via the callback
- It guards against missing callbacks
- It is consistent with other Meadow connector APIs

## Double-Connect Protection

If `connect()` is called when already connected, it logs an error and returns without action:

```javascript
_Fable.MeadowSolrProvider.connect();
_Fable.MeadowSolrProvider.connect();
// Logs: "Meadow-Connection-Solr trying to connect but is already connected - skipping."
```

## Missing Driver Guard

The `solr-client` module is loaded with a try/catch guard at module initialization. If the package is not installed, `connect()` logs an error and returns without crashing:

```javascript
// If solr-client is not in node_modules:
_Fable.MeadowSolrProvider.connect();
// Logs: "Meadow-Connection-Solr: solr-client is not installed."
// connected remains false
```

## Auto-Connect

The `connect()` method is called automatically during construction if `MeadowConnectionSolrAutoConnect` is `true`:

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

## Connection URL Format

The `_buildConnectionURL()` method builds the URL from configuration:

```
http://host:port/path/core        (default, Secure: false)
https://host:port/path/core       (Secure: true)
```

## Related

- [connectAsync](connectAsync.md) -- Callback-style connection (recommended)
- [pool](pool.md) -- Access the client after connecting
