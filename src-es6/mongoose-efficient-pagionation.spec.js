import { expect } from 'chai';
import mongoose from 'mongoose';
import paginator from './mongoose-efficient-pagination';

var Schema = mongoose.Schema;
var connection;

mongoose.Promise = global.Promise;

function customerSchema() {
    return new Schema({
        firstName: { type: String },
        lastName: { type: String }
    });
}

describe('Mongoose plugin: mongoose-efficient-pagination', function() {
    before((done) => {
        connection = mongoose.createConnection('mongodb://localhost/unit_test');
        connection.once('connected', done);
    });

    after((done) => {
        connection.db.dropDatabase(() => {
            connection.close(done);
        });
    });

    describe('with default settings', function() {
        it('should pull a list of 20 documents');
        it('should pull a list of 20 documents starting after the specified ID');
        it('should allow custom queries');
    });

    describe('with default overrides', function() {
        it('should pull a list of 10 documents by default');
    });
});
