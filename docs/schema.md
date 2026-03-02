# Schema & Field Types

## Overview

Apache Solr uses a schema-based field model rather than SQL tables. The Solr connector generates **field descriptors** from Meadow table schemas. These descriptors map Meadow data types to Solr field types and can be used to update a Solr core's schema via the Schema API.

## Field Type Mapping

| Meadow DataType | Solr Field Type | Description |
|-----------------|-----------------|-------------|
| `ID` | `pint` | Point integer -- auto-increment primary key |
| `GUID` | `string` | Exact-match string -- globally unique identifier |
| `ForeignKey` | `pint` | Point integer -- foreign key reference |
| `Numeric` | `pint` | Point integer -- general integer value |
| `Decimal` | `pfloat` | Point float -- floating-point value |
| `String` | `string` | Exact-match string -- not tokenized |
| `Text` | `text_general` | Full-text analyzed field -- tokenized, stemmed |
| `DateTime` | `pdate` | Point date -- date/time value |
| `Boolean` | `pint` | Point integer -- stored as 0 or 1 |
| Default | `string` | Fallback for unrecognized types |

### Solr Field Type Details

- **`pint`** (PointIntField) -- Numeric integer field using KD-tree indexing. Efficient for range queries and sorting.
- **`pfloat`** (PointFloatField) -- Numeric float field using KD-tree indexing. Supports decimal precision.
- **`pdate`** (PointDateField) -- Date/time field using KD-tree indexing. Parses ISO-8601 format dates.
- **`string`** (StrField) -- Stored and indexed as a single token. Not analyzed or tokenized. Ideal for exact-match lookups (IDs, GUIDs, codes).
- **`text_general`** (TextField) -- Analyzed field with tokenization, lowercasing, and stemming. Ideal for full-text search across natural language content.

### Why `pint` for Booleans?

Meadow uses integer booleans (0/1) across all connectors for consistency. The Solr connector follows the same pattern, storing booleans as `pint` values rather than Solr's native `boolean` type. This aligns with how the Meadow provider layer reads and writes boolean values.

## Schema Descriptor Format

The `generateCreateTableStatement()` method returns a descriptor object (not a SQL string):

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

### Descriptor Properties

| Property | Type | Description |
|----------|------|-------------|
| `operation` | `string` | Always `'schemaUpdate'` |
| `collection` | `string` | The collection (core) name from `TableName` |
| `fields` | `array` | Array of `{ name, type }` field definitions |

## Example

Given this Meadow table schema:

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
```

The descriptor can be used with Solr's Schema API to add fields to the core:

```javascript
// The descriptor's fields array maps directly to the Solr Schema API format:
// POST /solr/Animal/schema
// { "add-field": { "name": "IDAnimal", "type": "pint" } }
```

## Drop Descriptor

The `generateDropTableStatement(name)` method returns a minimal descriptor:

```javascript
let tmpDrop = _Fable.MeadowSolrProvider.generateDropTableStatement('Animal');
// => { operation: 'dropCollection', collection: 'Animal' }
```

This descriptor is used by the Meadow provider layer to issue the actual collection drop via the Solr Collections API.

## Multiple Schemas

Use `createTables()` to prepare multiple schemas from a Stricture schema:

```javascript
let tmpSchema =
{
	Tables:
	[
		{
			TableName: 'Animal',
			Columns:
			[
				{ Column: 'IDAnimal', DataType: 'ID' },
				{ Column: 'GUIDAnimal', DataType: 'GUID' },
				{ Column: 'Name', DataType: 'String' }
			]
		},
		{
			TableName: 'Farm',
			Columns:
			[
				{ Column: 'IDFarm', DataType: 'ID' },
				{ Column: 'GUIDFarm', DataType: 'GUID' },
				{ Column: 'FarmName', DataType: 'String' }
			]
		}
	]
};

_Fable.MeadowSolrProvider.createTables(tmpSchema,
	(pError) =>
	{
		if (pError) { console.error(pError); return; }
		console.log('All schemas prepared!');
	});
```

Schemas are prepared sequentially (concurrency of 1).

## Comparison with Other Connectors

| Feature | Solr Connector | SQL Connectors | MongoDB Connector |
|---------|---------------|---------------|-------------------|
| Output format | Field descriptor object | SQL DDL string | Collection descriptor object |
| Schema unit | Fields per core | Columns per table | Indexes per collection |
| Type enforcement | Solr Schema API | Database engine | Schema-less (application) |
| Full-text search | Native (`text_general`) | Separate indexes | Text indexes |
| Schema idempotent | Schema API is additive | `IF NOT EXISTS` | Error code 48 handling |
| Primary key | Application-managed | Inline declaration | Application-managed |

## Solr vs SQL Concepts

| SQL Concept | Solr Equivalent |
|-------------|----------------|
| Database | Solr Instance |
| Table | Core / Collection |
| Row | Document |
| Column | Field |
| Index | Field with `indexed=true` |
| `CREATE TABLE` | Schema API `add-field` |
| `DROP TABLE` | Collections API `DELETE` |
| `SELECT` | `/select` handler |
| `INSERT` | `/update` handler |
