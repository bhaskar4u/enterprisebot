const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//secret key for token
process.env.SECRET_KEY = '121'
//impoted user model
const User = require('../models/User');
const Employee = require('../models/Employee');

router.post('/register', async (req, res) => {
    //checking for email exist
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('email already exist')
    //hashing password

    const hashpass = await bcrypt.hash(req.body.password, 10)
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashpass
    })
    try {
        const userData = await user.save();
        res.status(200).send('Successfully Registered:' + userData)
        // user.save().then(doc => res.json(doc))

    }
    catch (err) {
        res.status(404).send(err)
    }
});

router.get('/list', async (req, res) => {
    await User.find({}).then((user) => {
        res.send(user)
    })

});

router.get('/list/:id', async (req, res) => {
    await User.find({_id:req.params.id}).then((user) => {
        res.send(user)
    })

});

router.get('/list/byname/:id', async (req, res) => {
    await User.find({name:req.params.id}).then((user) => {
        res.send(user)
    })

});


router.post('/signin', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
            const payload = {
                _id: user.id,
                name: user.name,
                email: user.email
            }
            let token = jwt.sign(payload, process.env.SECRET_KEY, {
                expiresIn: 2000
            })
            res.send(token)

        } else {
            res.status(400).send({ err: 'password wrong' })
        }
    } else {
        res.status(400).send({ err: 'email not recognised' })

    }
});




module.exports = router;