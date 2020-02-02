const LogSchema = require('./log.model.js');

exports.create = (req, res) => {
    var now = new Date();
    const log = new LogSchema({
    	time: now
    });

    // Save Note in the database
    log.save()
        .then(data => {
            console.log(data);
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the lof."
            });
        });          
};

exports.findAll = (req, res, next) => {
	LogSchema.find()
	.then(logs => {
        res.status(200).send(logs);
    }).catch(err => {
    	res.status(500).send({
    		message: err.message || "Some error occurred while retrieving logs."
    	});
    });
};