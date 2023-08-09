const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/auctions',
        ssl: {
            rejectUnauthorized: false
        }
    }
})

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json('up and running');
});

app.post('/signin', (req, res) => {
    db.select('email' , 'hash').from('login')
    .where('email','=',req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
            return db.select('id').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.header("Access-Control-Allow-Origin", "*");
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { name, email, password, institute } = req.body;
    const hash = bcrypt.hashSync(password, 18);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0],
                name: name,
                institute: institute,
                joined: new Date()
            })
            .then(user => {
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))
})

app.get('/attendance_list/:id', (req, res) => {
    const { id } = req.params;

    if(isNaN(id)) {
        return res.status(400).json('not a user')
    } else {
        db.select('equipment_name').from('equipment_attendance')
        .where("user_id", "=", id)
        .then(user => {
            if(user.length) {
                res.json(user);
            } else {
                res.status(400).json('user not found');
            }
        })
    }
})

app.get('/profile/', (req, res) => {
    const { id } = req.body;
    db.select('*').from('users')
    .where({id})
    .then(user => {
        if(user.length) {
            res.json(user[0]);
        } else {
            res.status(400).json('user not found');
        }
    })
})

app.post('/addCurrency', (req, res) => {
    const { user_id, currency } = req.body;
    const timestamp = new Date().toLocaleString({ timeZone: 'America/Mexico_City'});

    if(user_id == NaN) {
        return res.status(200).json('Not a user')
    } else 
    {
        db.select('balance').from('users')
        .where({id})
        .then(balance => {
            balance += currency 
            return balance;
        })
        .then(new_balance => {
            db('users')
            .update({
                balance: new_balance,
                updated_at: timestamp   
            })
            .where('id','=',user_id)
            .then(
                res.status(200).json('balance updated on user_id '+user_id)
            )
            .catch(err => res.status(500).json('error updating balance'))
        })

    }
})

app.get('/getUsersInfo', (req, res) => {
    db.select('name','currency','email','id')
    .from('users')
    .then(users => {
        return res.json(users);
    });
})

app.get('/', (req, res) => {
    res.json('it liveeeees')
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`server running on port ${process.env.PORT}`);
})

