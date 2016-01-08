mongoose-efficient-pagination
====================
[![Build Status](https://travis-ci.org/Dashride/mongoose-efficient-pagination.svg?branch=master)](https://travis-ci.org/Dashride/mongoose-efficient-pagination)
[![Coverage Status](https://coveralls.io/repos/Dashride/mongoose-efficient-pagination/badge.svg?branch=master&service=github)](https://coveralls.io/github/Dashride/mongoose-efficient-pagination?branch=master)
[![Dependency Status](https://david-dm.org/Dashride/mongoose-efficient-pagination.svg)](https://david-dm.org/Dashride/mongoose-efficient-pagination)
[![npm version](https://badge.fury.io/js/mongoose-efficient-pagination.svg)](http://badge.fury.io/js/mongoose-efficient-pagination)

## How it works

## Use Case

## Installation

`npm install --save mongoose-efficient-pagination`

## API Reference
<a name="module_mongooseEfficientPagination"></a>
## mongooseEfficientPagination
Using skip is not efficient for large data sets. Rather, we can achieve pagination by sorting by _id then telling
      mongo to use that _id as a starting point when returning the next page of records.

**Example**  
```js
// configure mongoose
var mongoose = require('mongoose');
var paginator = require('mongoose-efficient-pagination');

// optionally globally configure the default perPage value.
// this can be overridden in the paginate function itself.
paginator.perPage = 25;
```
Use it with a model...
```js
var Customer = mongoose.model('Customer');
var sortOrder = -1;
var perPage = 10;
var startAfter = '52c1190207d5dbccda00000f'; // this value should be passed from your previous result set.

Customer.find({
    status: 'active'
})
.sort({
    createdAt: sortOrder, // this is up to you, sort by a field. I chose createdAt for this example.
})
.paginate(perPage, startAfter)
.exec();
```
<a name="module_mongooseEfficientPagination..paginator"></a>
### mongooseEfficientPagination~paginator(perPage, [nextID]) ⇒
Can be called from the mongoose model prototype providing an easy way to paginate the result set of a query.

**Kind**: inner method of <code>[mongooseEfficientPagination](#module_mongooseEfficientPagination)</code>  
**Returns**: this  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| perPage | <code>number</code> | <code>20</code> | number of records per page |
| [nextID] | <code>ObjectId</code> | <code>(null)</code> | the id of the document which you will be starting after |

