const { v4 } = require('uuid');
const { Task, Project } = require('../db/sequelize');
const { ValidationError, UniqueConstraintError } = require('sequelize');

exports.create = (req, res, next) => {
    if (req.body.title === undefined || req.body.description === undefined || req.body.subTask === undefined || req.body.status === undefined || req.body.userId === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(401).json({ message }); 
    }

    Project.findOne({ where: { id: req.params.id } })
        .then(project => {
            if (project === null) {
                const message = "Aucun projet trouvé.";
                return res.status(404).json({ message });
            }
            if (project.userId !== req.auth.userId) {
                const message = "Requete non authorisée.";
                return res.status(403).json({ message });
            }

            const task = new Task({
                id: v4(),
                projectId: project.id,
                title: req.body.title,
                description: req.body.description,
                subTask: req.body.subTask,
                status: req.body.status,
            });
            
            task.save()
                .then(() => {
                    const message = "Tache bien créée.";
                    res.status(201).json({ message });
                })
                .catch(error => {
                    if (error instanceof ValidationError) {
                        return res.status(401).json({ message: error.message, data: error }); 
                    }
                    if (error instanceof UniqueConstraintError) {
                        return res.status(401).json({ message: error.message, data: error });
                    }
                    res.status(500).json({ message: "Une erreur est survenue lors de la création de la tache.", error });
                });
        })
        .catch(error => res.status(500).json({ message: error }));
};