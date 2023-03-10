const { v4 } = require('uuid');
const { Project, User } = require('../db/sequelize');
const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * create a new project
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.create = (req, res, next) => {
    if (req.body.title === undefined || req.body.description === undefined || req.body.userId === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message });
    } else {
        if (req.body.userId !== req.auth.userId) {
            const message = "Requete non authorisée.";
            return res.status(403).json({ message });
        }

        User.findOne({ where: { id: req.body.userId } })
            .then(user => {
                if (user === null) {
                    const message = "Aucun utilisateur trouvé.";
                    return res.status(404).json({ message });
                }

                const projectId = v4();
                const project = new Project({
                    id: projectId,
                    userId: req.body.userId,
                    title: req.body.title,
                    description: req.body.description,
                });

                project.save()
                    .then(() => {
                        const message = "Projet bien créé.";
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
    }
};

/**
 * get all project from one user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAll = (req, res, next) => {
    User.findOne({ where: { id: req.params.id } })
        .then(user => {
            if (user === null) {
                const message = "Aucun utilisateur trouvé.";
                return res.status(404).json({ message });
            }
            console.log("1");

            Project.findAll({ where : { userId: req.params.id } })
                .then(projects => {
                    if (projects === null) {
                        const message = "Aucun projets trouvés.";
                        return res.status(404).json({ message });
                    }

                    let message = "Des projets ont bien été trouvés.";
                    if (projects.length === 1) {
                        message = "Un projet a bien été trouvé.";
                    }

                    res.status(200).json({ message, data: projects });
                })
                .catch(error => res.status(500).json({ message: error }));
        })
        .catch(error => res.status(500).json({ message: error }));
};