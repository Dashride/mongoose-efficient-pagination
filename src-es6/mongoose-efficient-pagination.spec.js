import { expect } from 'chai';
import mongoose from 'mongoose';
import paginator from './mongoose-efficient-pagination';

let Schema = mongoose.Schema;
let connection;

mongoose.Promise = global.Promise;

var Customer;

function customerSchema() {
    return new Schema({
        firstName: { type: String },
        lastName: { type: String },
        createdAt: { type: Date }
    });
}

function fakeCustomer(i) {
    let createdDate = addDays(new Date(), i);
    let customer = new Customer({
        firstName: 'test-' + i,
        lastName: 'test-' + i,
        createdAt: createdDate
    });

    return customer;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

describe('Mongoose plugin: mongoose-efficient-pagination', function() {

    before(function() {
        this.timeout(10000);
        return new Promise(function(resolve, reject) {
            connection = mongoose.createConnection('mongodb://localhost/unit_test');
            connection.once('connected', function() {
                resolve(connection);
            });
        }).then(function(conn) {
            Customer = connection.model('Customer', customerSchema());
            return Customer;
        }).then(function(model) {
            let ops = [];
            for (var i = 0; i < 50; i++) {
                ops.push(fakeCustomer(i).save());
            }

            return Promise.all(ops);
        });
    });

    after((done) => {
        connection.db.dropDatabase(() => {
            connection.close(done);
        });
    });

    describe('with default settings', function() {
        let customerID;

        it('should pull a list of 20 documents', function() {
            return Customer.find().paginate().exec().then(function(customers) {
                expect(customers.length).to.equal(20);
            });
        });

        it('should pull a sorted list of 20 documents', function() {
            return Customer.find()
            .sort({ createdAt: -1 })
            .paginate()
            .exec().then(function(customers) {
                customerID = customers[customers.length - 1]._id;
                expect(customers.length).to.equal(20);
            });
        });

        it('should pull a sorted list of 20 documents starting after the specified ID, DESC', function() {
            let page1;

            return Customer.find()
            .sort({ createdAt: -1 })
            .paginate(20)
            .exec().then(function(result) {
                page1 = result;
                return Customer.find()
                .sort({ createdAt: -1 })
                .paginate(20, page1[page1.length - 1].id)
                .exec();
            }).then(function(page2) {
                expect(page2.length).to.equal(20);

                // Ensure the results are in order.
                let list = page1.concat(page2);
                let prev;
                list.forEach(function(doc) {
                    if (!prev) {
                        prev = doc;
                    } else {
                        let prevDate = new Date(prev.createdAt).getTime();
                        let curDate = new Date(doc.createdAt).getTime();
                        expect(prevDate).to.be.greaterThan(curDate);
                        prev = doc;
                    }
                });
            });
        });

        it('should pull a sorted list of 20 documents starting after the specified ID, ASC', function() {
            let page1;

            return Customer.find()
            .sort({ createdAt: 1 })
            .paginate(20)
            .exec().then(function(result) {
                page1 = result;
                return Customer.find()
                .sort({ createdAt: 1 })
                .paginate(20, page1[page1.length - 1].id)
                .exec();
            }).then(function(page2) {
                expect(page2.length).to.equal(20);

                // Ensure the results are in order.
                let list = page1.concat(page2);
                let prev;
                list.forEach(function(doc) {
                    if (!prev) {
                        prev = doc;
                    } else {
                        let prevDate = new Date(prev.createdAt).getTime();
                        let curDate = new Date(doc.createdAt).getTime();
                        expect(prevDate).to.be.lessThan(curDate);
                        prev = doc;
                    }
                });
            });
        });

        it('should pull a list if sort is ASC string', function() {
            return Customer.find()
            .sort({ createdAt: 'asc' })
            .paginate(10, customerID)
            .exec().then(function(customers) {
                expect(customers.length).to.equal(10);
            });
        });

        it('should pull a list if sort is DESC string', function() {
            return Customer.find()
            .sort({ createdAt: 'desc' })
            .paginate(20)
            .exec().then(function(customers) {
                expect(customers.length).to.equal(20);
            });
        });
    });

    describe('with default overrides', function() {
        let customerID;

        it('should pull a list of 10 documents', function() {
            paginator.perPage = 10;

            return Customer.find()
            .sort({ createdAt: -1 })
            .paginate()
            .exec().then(function(customers) {
                customerID = customers[customers.length - 1].id;
                expect(customers.length).to.equal(10);
            });
        });

        it('should pull a second page of 10 documents', function() {
            paginator.perPage = 10;

            return Customer.find()
            .sort({ createdAt: -1 })
            .paginate(customerID)
            .exec().then(function(customers) {
                expect(customers.length).to.equal(10);
            });
        });
    });
});
