'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseLibAggregate = require('mongoose/lib/aggregate');

var _mongooseLibAggregate2 = _interopRequireDefault(_mongooseLibAggregate);

module.exports.perPage = 20;

/**
 * @module mongooseEfficientPagination
 * @desc Using skip is not efficient for large data sets. Rather, we can achieve pagination by sorting by _id then telling
 *       mongo to use that _id as a starting point when returning the next page of records.
 * @example
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
 */

_mongoose2['default'].Query.prototype.paginate = paginator;
_mongooseLibAggregate2['default'].prototype.paginate = paginator;

/**
 * Can be called from the mongoose model prototype providing an easy way to paginate the result set of a query.
 * @param {number} perPage=20 - number of records per page
 * @param {ObjectId} [nextID=(null)] - the id of the document which you will be starting after
 * @return this
 */
function paginator() {
    var perPage = module.exports.perPage;
    var nextID = null;
    var sortOrder = 1;

    if (typeof arguments[0] === 'number') {
        perPage = arguments[0];
    }

    if (arguments.length === 1 && typeof arguments[0] !== 'number') {
        nextID = arguments[0];
    } else if (arguments[1]) {
        nextID = arguments[1];
    }

    // Detect the sort order. Naive approach, pull the first sorter specified.
    if (this.options.sort) {
        var sorters = Object.keys(this.options.sort);
        sortOrder = this.options.sort[sorters[0]];
        this.options.sort._id = sortOrder;
    }

    // If the next ID is specified, use it in the query.
    if (nextID) {
        var query = { _id: {} };
        query._id[sortOrder === 1 ? '$gt' : '$lt'] = nextID.toString();
        this.where(query);
    }

    this.limit(perPage);

    return this;
}