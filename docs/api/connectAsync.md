# connectAsync(fCallback)

Callback-style connection method. Creates the `solr-client` instance, or returns the existing client if already connected.

## Signature

```javascript
connectAsync(fCallback)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fCallback` | `function` | Callback receiving `(error, client)` |

## Return Value

Returns the result of the callback invocation.

## Behavior

1. If no callback is provided, logs an error and substitutes a no-op function
2. If already connected (`this._Client` exists), calls `fCallback(null, this._Client)` immediately
3. Otherwise, calls `this.connect()` to create the client
4. On success: calls `fCallback(null, this._Client)`
5. On error: logs the error, calls `fCallback(pError)`

## Basic Usage

```javascript
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

## Idempotent Calls

Calling `connectAsync()` multiple times is safe. If already connected, the existing client is returned without creating a new one:

```javascript
// First call -- creates the client
_Fable.MeadowSolrProvider.connectAsync(
	(pError, pClient) =>
	{
		// pClient is the solr-client instance

		// Second call -- reuses the existing client
		_Fable.MeadowSolrProvider.connectAsync(
			(pError2, pClient2) =>
			{
				// pClient2 === pClient (same instance)
			});
	});
```

## Missing Callback

If called without a callback, a warning is logged and a no-op function is used:

```javascript
// Logs: "Meadow Solr connectAsync() called without a callback."
_Fable.MeadowSolrProvider.connectAsync();
```

## Error Handling

If `connect()` throws (e.g., `solr-client` is not installed), the error is caught and passed to the callback:

```javascript
_Fable.MeadowSolrProvider.connectAsync(
	(pError) =>
	{
		if (pError)
		{
			console.error('Solr connection error:', pError.message);
		}
	});
```

## Related

- [connect()](connect.md) -- Synchronous connection method
- [pool](pool.md) -- Access the client after connecting
