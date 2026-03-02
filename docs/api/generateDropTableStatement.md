# generateDropTableStatement(pTableName)

Generates a drop collection descriptor for a Solr core. Returns the descriptor without actually dropping the collection.

## Signature

```javascript
generateDropTableStatement(pTableName)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pTableName` | `string` | The name of the collection to drop |

## Return Value

| Property | Type | Description |
|----------|------|-------------|
| `operation` | `string` | Always `'dropCollection'` |
| `collection` | `string` | The collection name |

## Basic Usage

```javascript
let tmpDescriptor = _Fable.MeadowSolrProvider.generateDropTableStatement('Animal');

console.log(tmpDescriptor);
// => { operation: 'dropCollection', collection: 'Animal' }
```

## Purpose

This method returns a descriptor object that the Meadow provider layer uses to issue the actual collection drop via the Solr Collections API. The connector itself does not execute the drop -- it only describes what should happen.

## Using the Descriptor

To actually drop a collection, use the Solr Collections API via the client or an HTTP request:

```javascript
// The descriptor indicates what to drop:
let tmpDescriptor = _Fable.MeadowSolrProvider.generateDropTableStatement('Animal');
// => { operation: 'dropCollection', collection: 'Animal' }

// The actual drop would be performed via the Solr Collections API:
// DELETE /solr/admin/collections?action=DELETE&name=Animal
```

## Differences from SQL DDL

| Feature | SQL Connectors | Solr |
|---------|---------------|------|
| Output | `DROP TABLE` SQL string | `{ operation: 'dropCollection', collection }` |
| Execution | Direct SQL query | Collections API request |
| Cascading | May drop dependent objects | Drops collection and all documents |
| Idempotent | `IF EXISTS` clause | Must handle error if collection does not exist |

## Related

- [generateCreateTableStatement](generateCreateTableStatement.md) -- Generate field descriptor
- [createTable](createTable.md) -- Prepare a schema
- [Schema & Field Types](../schema.md) -- Full type mapping reference
