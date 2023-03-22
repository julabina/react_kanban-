const { v4 } = require('uuid');
const { User } = require('../db/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * create a user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.create = (req, res, next) => {
    if (req.body.mail === undefined || req.body.password === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    } else if (req.body.password !== "" && req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) {
        User.findOne({ where: { email: req.body.mail }})
            .then(u => {
                if (u !== null) {
                    const message = "Un compte est déjà lié à cet email.";
                    return res.status(401).json({ message });
                }

                bcrypt.hash(req.body.password, 10)
                    .then(hash => {
                        const userId = v4();
                        const user = new User({
                            id: userId,
                            email: req.body.mail,
                            password: hash,
                            darkOption: false
                        });
                        user.save()
                            .then(() => {
                                const message = "Utilisateur bien créé.";
                                res.status(201).json({ message });
                            })
                            .catch(error => {
                                if (error instanceof ValidationError) {
                                    return res.status(401).json({ message: error.message, data: error }); 
                                }
                                if (error instanceof UniqueConstraintError) {
                                    return res.status(401).json({ message: error.message, data: error });
                                }
                                res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                            });
                            
                        })
                        .catch(error => {
                            if (error instanceof ValidationError) {
                                return res.status(401).json({ message: error.message, data: error }); 
                            }
                            if (error instanceof UniqueConstraintError) {
                                return res.status(401).json({ message: error.message, data: error });
                            }
                            res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                        });
                })
                .catch(error => res.status(500).json({ message: error }));

    } else {
        const message = "Les informations sont incorrectes ou incomplètes.";
        res.status(401).json({ message });
    }
};

/**
 * log a user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.login = (req, res, next) => {
    if (req.body.mail === undefined || req.body.password === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(400).json({ message });
    } else if (
        req.body.password !== "" && req.body.mail !== "" &&
        req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)  &&
        req.body.mail.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i)
    ) {
        User.findOne({ where: {email: req.body.mail} })
            .then(user => {
                if (user === null) {
                    const message = "Aucun utilisateur trouvé.";
                    return res.status(404).json({ message });
                }
                
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            const message = "Le mot de passe est incorrect.";
                            return res.status(401).json({ message });
                        }

                        res.status(200).json({
                            userId: user.id,
                            token: jwt.sign(
                                {userId: user.id},
                                '' + process.env.REACT_APP_JWT_PRIVATE_KEY + '',
                                { expiresIn: '24h' }
                            ),
                            dark: user.darkOption
                        })
                    })
                    .catch(error => res.status(500).json({ message: error }));
            })
            .catch(error => res.status(500).json({ message: error }));

    } else {
        const message = 'Les informations sont incorrectes ou incomplètes.';
        res.status(400).json({ message });
    }
};

/**
 * change dark mode option for one user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.toggleDarkmod = (req, res, next) => {
    if (req.body.userId === undefined || req.body.dark === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    } 

    User.findByPk(req.body.userId)
        .then(user => {
            if (user === null) {
                const message ="Aucun utilisateur trouvé.";
                return res.status(404).json({ message });
            }

            user.darkOption = req.body.dark;

            user.save()
                .then(() => {
                    const message = "Option bien modifiée.";
                    res.status(201).json({ message });
                })
                .catch(error => {
                    if (error instanceof ValidationError) {
                        return res.status(401).json({ message: error.message, data: error }); 
                    }
                    if (error instanceof UniqueConstraintError) {
                        return res.status(401).json({ message: error.message, data: error });
                    }
                    res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                });
        })
        .catch(error => res.status(500).json({ message: error }));
};