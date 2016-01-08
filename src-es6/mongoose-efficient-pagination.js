import mongoose from 'mongoose';
import mongooseAggregate from 'mongoose/lib/aggregate';

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
    _id: sortOrder
})
.paginate(perPage, sortOrder, startAfter)
.exec();
```
 */

mongoose.Query.prototype.paginate = paginator;
mongooseAggregate.prototype.paginate = paginator;

/**
 * Attaches the mongoose document hook and parses the phone number that is provided.
 * @param {number} perPage=20 - number of records per page
 * @param {number} sortOrder - -1 or 1
 * @param {ObjectId} [nextID=(null)] - the id of the document which you will be starting after
 * @return this
 */
function paginator(perPage = module.exports.count, sortOrder = 1, nextID = null) {
    // If the next ID is specified, use it in the query.
    if (nextID) {
        var query = { _id: {} };
        query._id[sortOrder === 1 ? '$gt' : '$lt'] = nextID.toString();
        this.where(query);
    }

    this.limit(perPage);

    return this;
}
